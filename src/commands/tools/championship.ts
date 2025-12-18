import {
  SlashCommandBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  TextInputStyle
} from 'discord.js';
import { Command } from '../../interfaces/command';
import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const Championship: Command = {
  data: new SlashCommandBuilder()
    .setName('championship')
    .setDescription('Automates championship event management')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Adds a new championship')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Removes an existing championship from database')
        .addIntegerOption((option) =>
          option.setName('id').setDescription('The SimGrid championship ID').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('List all championships')
    ),

    async run(interaction: ChatInputCommandInteraction) {
      const subcommand = interaction.options.getSubcommand();
      const id = interaction.options.getInteger('id');

      if (!(interaction.channel instanceof TextChannel)) {
        await interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
        return;
      }


      // When a championship is added, we need to fetch the championship data from SimGrid and store it in the database
      if (subcommand === 'add') {
        const championshipAddModal = new ModalBuilder()
          .setCustomId('championshipAddModal')
          .setTitle('Add Championship');

        // Input 1: Championship ID
        const championshipIdInput = new TextInputBuilder()
          .setCustomId('championshipId')
          .setLabel('Championship ID')
          .setPlaceholder('The SimGrid id for the championship')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const championshipIdRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            championshipIdInput
          );

        // Input 2: Role name
        const roleNameInput = new TextInputBuilder()
          .setCustomId('roleName')
          .setLabel('Championship role name')
          .setPlaceholder(
            'The name of the role to be created for this championship'
          )
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const roleNameRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            roleNameInput
          );

        championshipAddModal.addComponents(
          championshipIdRow,
          roleNameRow
        );

        await interaction.showModal(championshipAddModal);
        return;
      }

      if (subcommand === 'remove') {
        const id = interaction.options.getInteger('id', true);

        const championship = await prisma.championship.findUnique({
          where: { id }
        });

        if (!championship) {
          await interaction.reply({
            content: `No championship found with ID **${id}**.`,
            ephemeral: true
          });
          return;
        }

        await prisma.championship.delete({
          where: { id }
        });

        if (championship.roleId) {
          try {
            const role = interaction.guild?.roles.cache.get(championship.roleId);
            if (role) {
              await role.delete('Championship removed');
            }
          } catch (error) {
            logger.warn(
              `Failed to delete role ${championship.roleId} for championship ${id}`,
              error
            );
          }
        }

        await interaction.reply({
          content: `✅ Championship **${championship.name}** (ID: ${id}) has been removed.`,
          ephemeral: true
        });

        logger.info(`Championship ${id} removed`);
        return;
      }

      if (subcommand === 'list') {
        // List all championships
        // Send list of championships
        const championships = await prisma.championship.findMany({
          include: {
            races: true
          }
        });

        if (championships.length === 0) {
            await interaction.reply({
              content: 'No championships found.',
              ephemeral: true
            });
            return;
          }

          const championshipList = championships.map((championship) => {
            const raceList = championship.races.length > 0 ? championship.races.map((race) => race.name).join(', ') : 'No races found';

            return (
              `🏆 **${championship.name}** (ID: ${championship.id})\n` +
              `Role: ${championship.roleId ? `<@&${championship.roleId}>` : 'None'}\n` +
              `**Races:**\n${raceList}`
            );
          });

          logger.info('Championship list command ran');

          await interaction.reply({
            content: championshipList.join('\n\n'),
            ephemeral: false
          });

          return;
      }
    }
}

export default Championship;
