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

      }
    }
}

export default Championship;
