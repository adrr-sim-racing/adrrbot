import { ModalSubmitInteraction, MessageFlags } from 'discord.js';
import { ChampionshipData } from '../interfaces/simgrid';
import { APIRequestUrls, RequestOptions } from '../constants';
import { prisma } from '../prisma';
import fetchData from '../handlers/apiHandler';
import logger from '../utils/logger';


async function handleChampionshipAddModal(interaction: ModalSubmitInteraction) {
  const roleName = interaction.fields.getTextInputValue('roleName');
  const championshipId = Number(interaction.fields.getTextInputValue('championshipId'));
  logger.info(`Championship modal triggered for ${championshipId}`);

  if (!interaction.guild) {
    await interaction.reply({
      content: 'This action can only be used in a server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // - create role
  if (!interaction.guild.members.me?.permissions.has('ManageRoles')) {
    await interaction.reply({
      content: 'I do not have permission to manage roles.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  let role = interaction.guild.roles.cache.find((role) => role.name === roleName);

  if (!role) {
    role = await interaction.guild.roles.create({
      name: roleName,
      mentionable: true,
      reason: `Championship ${championshipId} role`,
    });
  }

  if (!Number.isInteger(championshipId)) {
    await interaction.reply({
      content: 'Championship ID must be a whole number.',
      flags: MessageFlags.Ephemeral,
    });
    return;
}

  // - fetch championship data from SimGrid
  const getChampionshipURL = `${APIRequestUrls.getChampionship}${championshipId}`;
  const data = await fetchData(getChampionshipURL, RequestOptions) as ChampionshipData;

  // - store in DB
const existing = await prisma.championship.findUnique({
  where: { id: championshipId },
});

if (existing) {
  await prisma.championship.update({
    where: { id: championshipId },
    data: {
      name: data.name,
      image: data.image,
      roleId: role.id,
    },
  });
} else {
  await prisma.championship.create({
    data: {
      simgridId: championshipId,
      name: data.name,
      image: data.image,
      roleId: role.id,
      races: {
        create: data.races.map((race) => ({
          simgridId: race.id,
          name: race.race_name,
          trackName: race.track.name,
          startsAt: new Date(race.starts_at),
        })),
      },
    },
  });
}


  await interaction.reply({
    content: `✅ Championship **${championshipId}** added with role **${roleName}**`,
  });
}

export default handleChampionshipAddModal;