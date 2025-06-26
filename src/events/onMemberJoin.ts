import { GuildMember, TextChannel, EmbedBuilder } from 'discord.js';
import { APIRequestUrls, RequestOptions } from '../constants';
import Config from '../config';
import logger from '../utils/logger';
import { assessAndWarnHighRiskUser } from '../utils/riskScoring';
import { PrismaClient } from '@prisma/client';
import fetchData from '../handlers/apiHandler';
import { SimGridUser } from '../interfaces/simgrid';

const prisma = new PrismaClient();
const MAX_RETRIES = 3;
const RETRY_DELAY = 5 * 60 * 1000;

export const onMemberJoin = async (member: GuildMember) => {
  logger.debug(`Member join event triggered for ${member.user.tag} (${member.id})`);
  const channel = member.guild.channels.cache.get(Config.MEMBER_JOIN_CHANNEL) as TextChannel;
  const logChannel = member.guild.channels.cache.get(Config.LOG_CHANNEL) as TextChannel;

  if (!channel) {
    logger.error(`Member activity channel ${Config.MEMBER_JOIN_CHANNEL} not found`);
    return;
  }

  try {
    if(member.id !== '943939421454086184') { // Burt Munro (test account)
      const welcomeMessage = `Welcome <@${member.user.id}> (${member.user.username}) to the server!`;
      await channel.send(welcomeMessage);
    }
    logger.debug(`Sent welcome message for ${member.user.tag}`);
  } catch (error) {
    logger.error(`Failed to send welcome message for ${member.user.tag}:`, error);
  }

  try {
    await prisma.user.upsert({
      where: {
        id: member.user.id,
      },
      update: {
        joinedAt: member.joinedAt || new Date(),
      },
      create: {
        id: member.user.id,
        warns: 0,
        timeouts: 0,
        messageCount: 0,
        joinedAt: member.joinedAt || new Date(),
        riskScore: 0,
      },
    });
    logger.info(`Created/Updated initial user record for ${member.user.tag}`);
  } catch (error) {
    logger.error(
      `Error creating initial user record for ${member.user.tag}:`,
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error
    );
  }

  const roles = [
    member.guild.roles.cache.get(Config.MEMBER_ROLE_ID),
    member.guild.roles.cache.get(Config.NEW_MEMBER_ROLE_ID),
  ];
  for (const role of roles) {
    if (!role) {
      logger.error(`Member role not found: ${Config.MEMBER_ROLE_ID}`);
      return;
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        await member.roles.add(role);
        logger.info(`Assigned role '${role.name}' to ${member.displayName}`);
        break;
      } catch (error) {
        logger.error(`Failed to assign role to ${member.displayName} (Attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        retries++;

        if (retries < MAX_RETRIES) {
          logger.info(`Waiting ${RETRY_DELAY / 1000} seconds before retrying role assignment...`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
  }

  try {
    logger.debug(`Starting risk assessment for ${member.user.tag}`);
    await assessAndWarnHighRiskUser(member, member.guild);
  } catch (error) {
    logger.error(
      `Risk assessment failed for ${member.user.tag}:`,
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error
    );
  }

  // TODO: Move this to a separate function
  if (!logChannel) {
    logger.error(`Log channel ${Config.LOG_CHANNEL} not found`);
    return;
  }
  
  const userDataRequestURL = APIRequestUrls.getUser + member.id + '?attribute=discord';
  logger.info(`Fetching nickname for ${member.user.tag} (${member.user.id})`);
  const oldNickname = member.user.displayName;
  let preferredName = '';
  let userData;
  try {
    userData = await fetchData(userDataRequestURL, RequestOptions) as SimGridUser;
    logger.info('userdata', userData);
    preferredName = userData.preferred_name;
  }
  catch (error) {
    const msg = `Failed to fetch nickname for ${member.user.tag} (${member.user.id}):`;
    logger.error(msg, error);
    await logChannel.send({ content: msg });
    return;
  }

  if (preferredName === oldNickname) {
    logger.info(`Nickname for ${member.user.tag} (${member.user.id}) already set to ${preferredName}`);
    return;
  }

  try {
    await member.setNickname(preferredName, 'Set nickname to SimGrid preferred name')
    .then(member => console.log(`Set nickname of ${member.user.username}`))
    .catch(console.error);
  } catch (error) {
    const msg = `Failed to set nickname for ${member.user.tag} (${member.user.id}):`;
    logger.error(msg, error);
    await logChannel.send({ content: msg });
    return;
  }

  const userRenamedEmbed = new EmbedBuilder()
  .setColor('#FFFF00')
  .setTitle('Member nickname updated')
  .setDescription(`**${oldNickname}** has been **renamed** to <@${member.id}>.`)
  .addFields(
    { name: 'SimGrid Preferred Name', value: preferredName, inline: true },
    { name: 'Old Nickname', value: oldNickname, inline: true },
    { name: 'SimGrid ID', value: `[${userData.user_id}](https://www.thesimgrid.com/drivers/${userData.user_id})`, inline: true },
  )
  .setAuthor({
    name: oldNickname || 'Unknown Username',
    iconURL: member.displayAvatarURL(),
  })
  .setTimestamp(new Date())
  .setFooter({ text: `Member ID: ${member.user.id}` });

  await logChannel.send({ embeds: [userRenamedEmbed] });

  logger.info(`Updated nickname for ${member.user.tag} (${member.user.id}) to ${preferredName}`);
};
