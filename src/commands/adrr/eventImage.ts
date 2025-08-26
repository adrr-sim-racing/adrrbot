import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { Command } from '../../interfaces/command';
import { generateEventImage } from '../../utils/generateEventImage';

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
    .addAttachmentOption(opt =>
      opt.setName('image')
        .setDescription('Event image (square preferred)')
        .setRequired(true)),

  async run(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const imageURl = interaction.options.getAttachment('image', true).url;

    const imageBuffer = await generateEventImage({
      title: interaction.options.getString('title', true),
      seasonRound: interaction.options.getString('seasonRound', true),
      date: interaction.options.getString('date', true),
      classes: interaction.options.getString('classes', true),
      colour: interaction.options.getString('colour', true),
      imagePath: imageURl,
    });

    const attachment = new AttachmentBuilder(imageBuffer, { name: 'event.png' });

    await interaction.editReply({ files: [attachment] });
    
  }
};

export default eventImage;