import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { Command } from '../../interfaces/command';
import { generateEventImage } from '../../utils/generateEventImage';
import logger from '../../utils/logger';
import { Championships } from '../../constants';

const eventImage: Command = {
  data: new SlashCommandBuilder()
    .setName('eventimage')
    .setDescription('Generate an event image')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Event Type (FOT, OTC, Default)')
        .setRequired(true)
        .addChoices(
          { name: 'FOT', value: 'fot' },
          { name: 'OTC', value: 'otc' },
          { name: 'AEC', value: 'aec' },
          { name: 'Default', value: 'default' }
        ))
    .addStringOption(opt =>
      opt.setName('track')
        .setDescription('Track Name')
        .setRequired(true)
        .addChoices(
          { name: 'Interlagos', value: 'Interlagos' },
          { name: 'Le Mans', value: 'Le Mans' },
          { name: 'Monza', value: 'Monza' },
          { name: 'Spa', value: 'Spa' },
          { name: 'Portimão', value: 'Portimao' },
          { name: 'Bahrain', value: 'Bahrain' },
          { name: 'COTA (WEC)', value: 'COTA' },
          { name: 'Imola', value: 'Imola' },
          { name: 'Fuji', value: 'Fuji' },
          { name: 'Sebring', value: 'Sebring' },
          { name: 'Qatar', value: 'Qatar' },
          { name: 'Silverstone', value: 'Silverstone' },
        ))
    .addStringOption(opt =>
      opt.setName('date')
        .setDescription('Event date')
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('season')
        .setDescription('Season')
        .setRequired(true)
        .setMaxValue(10)
        .setMinValue(1))
    .addIntegerOption(opt =>
      opt.setName('round')
        .setDescription('Round')
        .setRequired(true)
        .setMaxValue(10)
        .setMinValue(1))
    .addStringOption(opt =>
      opt.setName('classes')
        .setDescription('Classes')
        .setRequired(true)
    .addChoices(
      // Single classes
      { name: 'Hypercar', value: 'HYP' },
      { name: 'LMP2', value: 'LMP2' },
      { name: 'LMGTE', value: 'LMGTE' },
      { name: 'LMGT3', value: 'LMGT3' },

      // Pairs
      { name: 'Hypercar / LMP2', value: 'HYP / LMP2' },
      { name: 'Hypercar / LMGTE', value: 'HYP / LMGTE' },
      { name: 'Hypercar / LMGT3', value: 'HYP / LMGT3' },
      { name: 'LMP2 / LMGTE', value: 'LMP2 / LMGTE' },
      { name: 'LMP2 / LMGT3', value: 'LMP2 / LMGT3' },
      { name: 'LMGTE / LMGT3', value: 'LMGTE / LMGT3' },

      // Triplets
      { name: 'Hypercar / LMP2 / LMGTE', value: 'HYP / LMP2 / LMGTE' },
      { name: 'Hypercar / LMP2 / LMGT3', value: 'HYP / LMP2 / LMGT3' },
      { name: 'Hypercar / LMGTE / LMGT3', value: 'HYP / LMGTE / LMGT3' },
      { name: 'LMP2 / LMGTE / LMGT3', value: 'LMP2 / LMGTE / LMGT3' },
    ))

    .addAttachmentOption(opt =>
      opt.setName('image')
        .setDescription('Event image (square preferred)')
        .setRequired(true)),

  async run(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try {
      const imageURL = interaction.options.getAttachment('image', true).url;
      const eventType = interaction.options.getString('type', true);

      type ChampionshipKey = keyof typeof Championships;
      const colourTuple = Championships[eventType as ChampionshipKey].color;
      const colour = `rgb(${colourTuple[0]}, ${colourTuple[1]}, ${colourTuple[2]})`;

      const seasonRound = `S${interaction.options.getInteger('season', true)} / Round ${interaction.options.getInteger('round', true)}`;

      const imageBuffer = await generateEventImage({
        colour: colour,
        title: interaction.options.getString('track', true),
        date: interaction.options.getString('date', true),
        seasonRound: seasonRound,
        classes: interaction.options.getString('classes', true),
        imagePath: imageURL,
        logoImagePath: Championships[eventType as ChampionshipKey].thumbnailImage,
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