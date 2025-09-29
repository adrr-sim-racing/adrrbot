import { Guild, GuildMember, GuildAuditLogsEntry, EmbedBuilder, TextChannel, AuditLogEvent } from 'discord.js';
import Config from '../config';
import logger from '../utils/logger';
import fetchData from '../handlers/apiHandler';
import { SimGridUser } from '../interfaces/simgrid';
import { APIRequestUrls, RequestOptions, childRoles } from '../constants';

type SimGridPreferredNameResult =
  | {
      success: true;
      preferredName: string;
      oldNickname: string;
      SimGridID: number;
    }
  | {
      success: false;
      message: string;
      error?: unknown;
    };

type PartialRole = { id: string; name: string };

async function getSimGridPreferredName(targetUser: GuildMember): Promise<SimGridPreferredNameResult> {
  const userDataRequestURL = APIRequestUrls.getUser + targetUser.id + '?attribute=discord';
  const oldNickname = targetUser.nickname || targetUser.user.displayName;

  try {
    const userData = (await fetchData(userDataRequestURL, RequestOptions)) as SimGridUser;
    const preferredName = userData.preferred_name;

    if (preferredName === oldNickname) {
      const msg = `Nickname for ${targetUser.user.tag} (${targetUser.user.id}) already set to ${preferredName}`;

      return {
        success: false,
        message: msg,
      };
    }

    return { success: true, preferredName: preferredName, oldNickname: oldNickname, SimGridID: userData.user_id };
  } catch (error) {
    const msg = `Failed to fetch nickname for ${targetUser.user.tag} (${targetUser.user.id}):`;
    return {
      success: false,
      message: msg,
      error: error,
    };
  }
}

async function updateMemberNickname(
  targetUser: GuildMember,
  preferredName: string,
  oldNickname: string,
  SimGridID?: number
) {
  const updatedUser = await targetUser.setNickname(preferredName, 'Set nickname to SimGrid preferred name');
  logger.info(`Set nickname of ${updatedUser.user.username}`);

  const userRenamedEmbed = new EmbedBuilder()
    .setColor('#FFFF00')
    .setTitle('Member nickname updated')
    .setDescription(`**${oldNickname}** has been **renamed** to <@${targetUser.id}>.`)
    .addFields(
      { name: 'SimGrid Preferred Name', value: preferredName, inline: true },
      { name: 'Old Nickname', value: oldNickname, inline: true },
      { name: 'SimGrid ID', value: `[${SimGridID}](https://www.thesimgrid.com/drivers/${SimGridID})`, inline: true }
    )
    .setAuthor({
      name: oldNickname || 'Unknown Username',
      iconURL: targetUser.displayAvatarURL(),
    })
    .setTimestamp(new Date())
    .setFooter({ text: `Member ID: ${targetUser.user.id}` });

  return userRenamedEmbed.toJSON();
}

export const onMemberRoleUpdate = async (auditLogEntry: GuildAuditLogsEntry, guild: Guild) => {
  if (auditLogEntry.action !== AuditLogEvent.MemberRoleUpdate) return;

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

  const logChannel = targetUser.guild.channels.cache.get(Config.LOG_CHANNEL) as TextChannel;

  if (!logChannel) {
    logger.error(`Log channel ${Config.LOG_CHANNEL} not found`);
    return;
  }

  const roleAdded = auditLogEntry.changes?.some((change) => change.key === '$add');
  const roleRemoved = auditLogEntry.changes?.some((change) => change.key === '$remove');

  const result = await getSimGridPreferredName(targetUser);
  if (!result.success) {
    await logChannel.send({ content: result.message });
    return;
  }

  if (roleAdded) {
    try {
      const userRenamedEmbed = await updateMemberNickname(
        targetUser,
        result.preferredName,
        result.oldNickname,
        result.SimGridID
      );
      await logChannel.send({ embeds: [userRenamedEmbed] });
      logger.info(`Updated nickname for ${targetUser.user.tag} (${targetUser.user.id}) to ${result.preferredName}`);

      // Which role was added?
      const addedChange = auditLogEntry.changes?.find((change) => change.key === '$add');
      if (!addedChange || !addedChange.new) return;

      const addedRoles = (Array.isArray(addedChange.new) ? addedChange.new : [addedChange.new]) as PartialRole[];

      for (const role of addedRoles) {
        if (!role || !role.id) continue;

        // Is the added role a child role?
        const parentRole = childRoles[role.id];
        if (!parentRole) return;

        await targetUser.roles.add(parentRole, 'Added parent role');
      }
    } catch (error) {
      const msg = `Failed to add parent role for ${targetUser.user.tag} (${targetUser.user.id}):`;
      logger.error(msg, error);
      await logChannel.send({ content: msg });
    }
  }
};
