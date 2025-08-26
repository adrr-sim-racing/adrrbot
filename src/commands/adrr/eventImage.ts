import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { Command } from '../../interfaces/command';
import { generateEventImage } from '../../utils/generateEventImage';
import logger from '../../utils/logger';

const eventImage: Command = {
  data: new SlashCommandBuilder()
    .setName('eventimage')
    .setDescription('Generate an event image')
    .addStringOption(opt =>
      opt.setName('colour')
        .setDescription('Event Type (FOT, OTC, Default)')
        .setRequired(true)
        .addChoices(
          { name: 'FOT', value: '#eafa4b' },
          { name: 'OTC', value: '#3084fe' },
          { name: 'AEC', value: '#ef244f' },
          { name: 'Default', value: '#eafa4b' }
        ))
    .addStringOption(opt =>
      opt.setName('title')
        .setDescription('Event title')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('date')
        .setDescription('Event date')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('seasonround')
        .setDescription('Season / Round')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('classes')
        .setDescription('Classes')
        .setRequired(true))
    .addAttachmentOption(opt =>
      opt.setName('image')
        .setDescription('Event image (square preferred)')
        .setRequired(true)),

  async run(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try {
      const imageURL = interaction.options.getAttachment('image', true).url;

      const imageBuffer = await generateEventImage({
        colour: interaction.options.getString('colour', true),
        title: interaction.options.getString('title', true),
        date: interaction.options.getString('date', true),
        seasonRound: interaction.options.getString('seasonround', true),
        classes: interaction.options.getString('classes', true),
        imagePath: imageURL,
      });

      const attachment = new AttachmentBuilder(imageBuffer, { name: 'event.png' });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      logger.error(error);

      await interaction.editReply('Failed to  generate event image.');

    }
    
  }
};

export default eventImage;