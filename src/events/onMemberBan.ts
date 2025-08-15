import { Guild, GuildAuditLogsEntry, EmbedBuilder, TextChannel, AuditLogEvent } from 'discord.js';
import Config from '../config';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const onMemberBan = async (auditLogEntry: GuildAuditLogsEntry, guild: Guild) => {
  if (auditLogEntry.action !== AuditLogEvent.MemberBanAdd) {
    return;
  }

  if (!auditLogEntry.executorId || !auditLogEntry.targetId) {
    return logger.info('Executor ID or target ID is missing from the audit log entry.');
  }

  const executor = await guild.client.users.fetch(auditLogEntry.executorId);

  const targetUser = await guild.client.users.fetch(auditLogEntry.targetId);

  if (!executor || !targetUser) {
    return logger.info('Executor or target user is missing from the audit log entry.');
  }

  const reason = (auditLogEntry.reason as string) || 'No reason provided';

  await prisma.ban.create({
    data: {
      reason: reason,
      issuerId: executor.id,
      targetId: targetUser.id,
      issuedAt: new Date(),
    },
  });

  const banEmbed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Member Banned')
    .setDescription(`<@${targetUser.id}> has been **banned** by <@${executor.id}>.`)
    .addFields({ name: 'Reason', value: reason })
    .setAuthor({
      name: targetUser.username || 'Unknown Username',
      iconURL: targetUser.displayAvatarURL(),
    })
    .setTimestamp(auditLogEntry.createdAt)
    .setFooter({ text: `Member ID: ${targetUser.id}` })
    .setThumbnail(targetUser.displayAvatarURL());

  const channel = guild.channels.cache.get(Config.LOG_CHANNEL) as TextChannel;
  channel && channel.send({ embeds: [banEmbed] });
};
