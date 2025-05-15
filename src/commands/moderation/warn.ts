import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  User,
  DiscordAPIError,
  GuildMember,
  TextChannel,
  MessageFlags,
} from 'discord.js';
import { PrismaClient, Prisma } from '@prisma/client';
import { Command } from '../../interfaces/command';
import { handleMemberWarn } from '../../events/onMemberWarn';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

export async function warnUser(
  member: GuildMember,
  issuer: GuildMember,
  reason: string,
  isAutomatic: boolean = false
): Promise<{
  success: boolean;
  warnId?: number;
  error?: string;
}> {
  try {
    const targetUser = await prisma.user.upsert({
      where: { id: member.user.id },
      update: { warns: { increment: 1 } },
      create: { id: member.user.id, warns: 1, joinedAt: new Date() },
    });

    const { id } = await prisma.warn.create({
      data: {
        reason: isAutomatic ? `[AUTO] ${reason}` : reason,
        issuerId: issuer.id,
        targetId: member.user.id,
        issuedAt: new Date(),
      },
    });

    await handleMemberWarn(
      member.user,
      issuer.user,
      reason,
      targetUser.warns,
      member.guild,
      id
    );

    await sendWarningDM(member.user, reason, isAutomatic);

    return {
      success: true,
      warnId: id,
    };
  } catch (error) {
    logger.error('Error processing warning:', error);
    let errorMessage = 'An error occurred while processing the warning.';

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage =
        error.code === 'P2002' ? 'There was a unique constraint violation.' : `Database error: ${error.message}`;
    } else if (error instanceof DiscordAPIError) {
      errorMessage = `Discord API error: ${error.message}`;
    } else if (error instanceof Error && error.name === 'PermissionError') {
      errorMessage = `Permission error: ${error.message}`;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

async function sendWarningDM(user: User, reason: string, isAutomatic: boolean = false) {
  const warningType = isAutomatic ? 'Automatic warning' : 'Warning';
  let dmMessage = `${warningType}: ${reason}`;

  if (isAutomatic) {
    dmMessage +=
      '\n\nThis warning was automatically issued by our risk detection system. If you believe this was a mistake, please contact the moderators.';
  }

  try {
    const dmChannel = await user.createDM();
    await dmChannel.send(dmMessage);
    return true;
  } catch (err) {
    logger.error('Failed to send warning DM:', err);
    return false;
  }
}

const Warn: Command = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) => option.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption((option) =>
      option.setName('reason').setDescription('The reason for the warning').setRequired(true)
    ),

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a guild.', ephemeral: true });
      return;
    }

    const userOption = interaction.options.getUser('user', true);
    const reasonOption = interaction.options.getString('reason');

    if (!reasonOption) {
      await interaction.reply({ content: 'Please provide a reason for the warning.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const member = await interaction.guild.members.fetch(userOption.id);
      const issuer = await interaction.guild.members.fetch(interaction.user.id);

      const result = await warnUser(member, issuer, reasonOption, false);

      const channel = interaction.channel as TextChannel;
      if (result.success) {
        await channel?.send(`<@${userOption.id}> has been warned. Reason: ${reasonOption}`);
      } else {
        await interaction.editReply({ content: result.error });
      }
    } catch (error) {
      logger.error('Error in warn command:', error);
      await interaction.editReply({
        content: 'Failed to process the warning. The user might not be in the server anymore.',
      });
    }
  },
};

export default Warn;
