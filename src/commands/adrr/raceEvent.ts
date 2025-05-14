import { EmbedBuilder, TextChannel, ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, APIMessageActionRowComponent } from 'discord.js';
import { Bot } from '../..';
import { Command } from '../../interfaces/command';
import { ChampionshipData, ChampionshipCarClass } from '../../interfaces/simgrid';
import { ADRRColours, APIRequestUrls, Championships, DailyRaceChannelID, RequestOptions } from '../../constants';
import fetchData from '../../handlers/apiHandler';


function formatDiscordTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const timestamp = Math.floor(date.getTime() / 1000); // Convert to UNIX timestamp (seconds)

  return `<t:${timestamp}:F>`;
}

const raceEvent: Command = {
  data: new SlashCommandBuilder()
    .setName('raceevent')
    .setDescription('Post a race event announcement')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('The type of race')
        .setRequired(true)
        .addChoices(
          { name: 'Default', value: 'default' },
          { name: 'USC', value: 'usc' },
          { name: 'FOT', value: 'fot' },
        )
    )
    .addStringOption((option) =>
      option.setName('id').setDescription('The id for the championship you wish to retrieve').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('password').setDescription('Server password required to join event').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('notes').setDescription('Additional notes to include with the announcement').setRequired(false)
    ),
  run: async (interaction: ChatInputCommandInteraction) => {
    const championshipChoice = interaction.options.getString('type');
    const id = interaction.options.getString('id');
    const eventPassword = interaction.options.getString('password');
    const notes = interaction.options.getString('notes');

    try {
      await interaction.deferReply({ ephemeral: true });

      const getChampionshipURL = `${APIRequestUrls.getChampionship}${id}`;
      const data = await fetchData(getChampionshipURL, RequestOptions) as ChampionshipData;

      const getCarClassDataURL = getChampionshipURL + '/championship_car_classes';
      const carClassData = await fetchData(getCarClassDataURL, RequestOptions) as ChampionshipCarClass[];

      const extractedNames = carClassData.map((carClass) => carClass.display_name.split(' - ')[1]);

      const carClasses = extractedNames.length === 1 ? `${extractedNames[0]}` : `${extractedNames.join(' / ')}`;
      await interaction.editReply({
        content: `Championship data retrieved: ${data.name || 'Unknown'}`,
      });

      const AnnounceChannel = Bot.channels.cache.get(DailyRaceChannelID) as TextChannel;

      const championshipEmbed = new EmbedBuilder()
        .setTitle(`${data.name}`)
        .setURL(`${data.url}`)
        .setAuthor({
          name: 'ADRR.net',
          url: 'https://www.adrr.net/',
          iconURL: 'https://r2.fivemanage.com/Km44dzC3oIVfckiyEjRbl/image/ADRR_1x1.jpg',
        })
        .setImage(`${data.image}`)
        .setFooter({
          text: '▫️ Accelerate ▫️ Decelerate ▫️ Rotate ▫️ Repeat ▫️',
          iconURL: 'https://r2.fivemanage.com/Km44dzC3oIVfckiyEjRbl/image/ADRR_1x1.jpg',
        })
        .setFields(
          {
            name: 'Race Information',
            value: `🔹${formatDiscordTimestamp(data.races[0].starts_at)}\n🔹${data.races[0].track}\n🔹${carClasses}`,
            inline: false,
          },
          {
            name: 'SimGrid Event',
            value: `${data.url}`,
            inline: false,
          }
        )
        .setColor(Championships[championshipChoice as keyof typeof Championships].color)
        if(championshipChoice !== 'default') {
          championshipEmbed.setThumbnail(Championships[championshipChoice as keyof typeof Championships].thumbnailImage);
        }

      if(eventPassword) {
        championshipEmbed.addFields({
          name: 'Server Password',
          value: `${eventPassword}`,
        });
      }

      data.races[0].results_available &&
        championshipEmbed.addFields({
          name: 'Results',
          value: `${data.results_url}`,
        });

      if(notes) {
        championshipEmbed.addFields({
          name: 'Event Notes',
          value: `${notes}`,
        });
      }
      await AnnounceChannel?.send({
        embeds: [championshipEmbed],
        "components": [
          {
              "type": 1,
              "components": [
                  {
                      "type": 2,
                      "label": "Register",
                      "style": 5,
                      "url": `https://www.thesimgrid.com/user_championships/new?registerable_id=${data.id}&registerable_type=Championship`,
                  } as APIMessageActionRowComponent,
              ]
          }
      ]
      });
    } catch (error) {
      console.error('Error fetching championship data:', error);
      await interaction.editReply('Failed to retrieve championship data. Please try again later.');
    }
  },
};

export default raceEvent;
