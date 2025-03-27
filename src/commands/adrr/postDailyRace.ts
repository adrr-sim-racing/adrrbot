import { EmbedBuilder, TextChannel, ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { Bot } from '../..';
import { Command } from '../../interfaces/command';
import { ChampionshipData, ChampionshipCarClass } from '../../interfaces/simgrid';
import { ADRRColours, APIRequestUrls, Championships, DailyRaceChannelID, RequestOptions } from '../../constants';
import fetchData from '../../handlers/apiHandler';


function formatDate(isoString: string): string {
  const date = new Date(isoString);

  const day = date.getUTCDate();
  const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date);
  const time = date.toISOString().substring(11, 16); // Extract "HH:mm"

  return `${getOrdinal(day)} ${month} ${time} UTC`;
}

function getOrdinal(day: number): string {
  if (day > 3 && day < 21) return day + 'th'; // Covers 4th to 20th
  switch (day % 10) {
    case 1:
      return day + 'st';
    case 2:
      return day + 'nd';
    case 3:
      return day + 'rd';
    default:
      return day + 'th';
  }
}

const postDailyRace: Command = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Post a daily race announcement')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('The type of race')
        .setRequired(true)
        .addChoices({ name: 'Daily', value: 'daily' }, { name: 'USC', value: 'usc' })
    )
    .addStringOption((option) =>
      option.setName('id').setDescription('The id for the championship you wish to retrieve').setRequired(true)
    ),

  run: async (interaction: ChatInputCommandInteraction) => {
    const championshipChoice = interaction.options.getString('type');
    const id = interaction.options.getString('id');

    const championshipId = id
      ? id
      : championshipChoice && championshipChoice in Championships
        ? Championships[championshipChoice as keyof typeof Championships]
        : null;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const getChampionshipURL = `${APIRequestUrls.getChampionship}${championshipId}`;
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
        .setDescription(`${championshipChoice == 'daily' ? '🟩 Open Lobby / No sign up required\n' : ''}`)
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
            value: `🔹${formatDate(data.races[0].starts_at)}\n🔹${data.races[0].track}\n🔹${carClasses}`,
            inline: false,
          },
          {
            name: 'SimGrid Event',
            value: `${data.url}`,
            inline: false,
          }
        );
      switch (championshipChoice) {
        case 'usc':
          championshipEmbed.setColor(ADRRColours.Secondary);
          championshipEmbed.setThumbnail('https://r2.fivemanage.com/Km44dzC3oIVfckiyEjRbl/image/USCLogo.png');
          break;
        default:
          championshipEmbed.setColor(ADRRColours.Primary);
          break;
      }
      data.races[0].results_available &&
        championshipEmbed.addFields({
          name: 'Results',
          value: `${data.results_url}`,
        });

      await AnnounceChannel?.send({ embeds: [championshipEmbed] });
    } catch (error) {
      console.error('Error fetching championship data:', error);
      await interaction.editReply('Failed to retrieve championship data. Please try again later.');
    }
  },
};

export default postDailyRace;
