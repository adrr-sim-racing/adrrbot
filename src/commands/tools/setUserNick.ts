import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, GuildMember } from 'discord.js';
import { Command } from '../../interfaces/command';
import { APIRequestUrls, RequestOptions } from '../../constants';
import fetchData from '../../handlers/apiHandler';
import { SimGridUser } from '../../interfaces/simgrid';
import logger from '../../utils/logger';

const setUserNick: Command = {
  data: new SlashCommandBuilder()
    .setName('setnick')
    .setDescription('Sets a member nickname to their SimGrid preferred name')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) => option.setName('user').setDescription('The user to update').setRequired(true))
    .addBooleanOption((option) => option.setName('clear').setDescription('Clears the nickname if true. Sets nickname if false.')),
  run: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ ephemeral: true });
    
    if (!interaction.guild) {
      await interaction.editReply({ content: 'This command can only be used in a guild.' });
      return;
    }
    
    const userOption = interaction.options.getUser('user', true);
    const clearOption = interaction.options.getBoolean('clear');
    const targetMember = await interaction.guild.members.fetch(userOption.id) as GuildMember;
    
    if (clearOption) {
      try {
        await targetMember.setNickname(null, "Cleared nickname");
        await interaction.editReply(`Cleared nickname for ${targetMember.user.tag} (${targetMember.id})`);
        logger.info(`Cleared nickname for ${targetMember.user.tag} (${targetMember.id})`);
      } catch (error) {
        await interaction.editReply('Failed to clear nickname.');
        logger.error('Command setnick failed to clear nickname:', error);
      }
      return;
    }

    const userDataRequestURL = APIRequestUrls.getUser + targetMember.id + '?attribute=discord';
    logger.info(`Request URL: ${userDataRequestURL}`);

    try {
      const userData = await fetchData(userDataRequestURL, RequestOptions) as SimGridUser;
      logger.info(`User data: ${userData}`);
      logger.info(`Preferred name: ${userData.preferred_name}`);
      const preferredName = userData.preferred_name;
      await targetMember.setNickname(preferredName, 'Set nickname to SimGrid preferred name')
      // targetMember.setNickname('cool nickname', 'Needed a new nickname')
      .then(member => logger.info(`Set nickname of ${member.user.username}`))
      .catch(console.error);
      await interaction.editReply(`Updated nickname for ${targetMember.user.tag} to ${preferredName}`);
      logger.info(`Updated nickname for ${targetMember.user.tag} (${targetMember.id}) to ${preferredName}`);
    } catch (error) {
      await interaction.editReply('Failed to set nickname');
      logger.error('Command setnick failed:', error);
    }
  },
};
export default setUserNick;
