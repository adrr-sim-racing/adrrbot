import { Guild, GuildMember, GuildAuditLogsEntry, EmbedBuilder, TextChannel, AuditLogEvent } from 'discord.js';
import Config from '../config';
import logger from '../utils/logger';
import fetchData from '../handlers/apiHandler';
import { SimGridUser } from '../interfaces/simgrid';
import { APIRequestUrls, RequestOptions } from '../constants';

export const onMemberRoleUpdate = async (auditLogEntry: GuildAuditLogsEntry, guild: Guild, member: GuildMember) => {
  if (auditLogEntry.action !== AuditLogEvent.MemberRoleUpdate) {
    return;
  }

  if (!auditLogEntry.executorId || !auditLogEntry.targetId) {
    return logger.info('Executor ID or target ID is missing from the audit log entry.');
  }

  if (auditLogEntry.executorId !== '709674172493594674') return; // Only trigger if it's SimGrid

  logger.info(`Fetching member: ${auditLogEntry.targetId}`);

  let targetUser;
  try {
    targetUser = await guild.members.fetch(auditLogEntry.targetId);
  } catch (error) {
    return logger.info(`Target user ${auditLogEntry.targetId} not found, possibly left.`);
  }

  if (!targetUser) {
    return logger.info('Unable to find targetUser following MemberRoleUpdate triggering by SimGrid');
  }

  // TODO: Move this to a separate function
  const logChannel = member.guild.channels.cache.get(Config.LOG_CHANNEL) as TextChannel;

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
    .then(member => logger.info(`Set nickname of ${member.user.username}`))
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
