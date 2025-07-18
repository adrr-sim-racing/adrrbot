import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../interfaces/command';

const Guild: Command = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Get an invite link to the selected Guild')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('Guild name')
        .setRequired(true)
        .addChoices(
          { name: 'SimGrid', value: 'simgrid' },
          { name: 'VMS', value: 'vms' },
        )
    ),

  run: async (interaction: ChatInputCommandInteraction) => {
    const guildName = interaction.options.getString('name');

    switch (guildName) {
      case 'simgrid':
        await interaction.reply('https://discord.gg/XFTt9bHYhV');
        break;
      case 'vms':
        await interaction.reply('https://discord.gg/gVyNTTAUEW');
        break;
    }
  },
};

export default Guild;
