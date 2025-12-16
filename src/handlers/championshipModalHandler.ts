import { ModalSubmitInteraction } from 'discord.js';
import { ChampionshipData } from '../interfaces/simgrid';
import { APIRequestUrls, RequestOptions } from '../constants';
import { PrismaClient } from '@prisma/client';
import fetchData from '../handlers/apiHandler';

const prisma = new PrismaClient();

async function handleChampionshipAddModal(interaction: ModalSubmitInteraction) {
  const roleName = interaction.fields.getTextInputValue('roleName');
  const championshipId = Number(interaction.fields.getTextInputValue('championshipId'));

  if (!interaction.guild) {
    await interaction.reply({
      content: 'This action can only be used in a server.',
      ephemeral: true,
    });
    return;
  }

  // - create role
  if (!interaction.guild.members.me?.permissions.has('ManageRoles')) {
    await interaction.reply({
      content: 'I do not have permission to manage roles.',
      ephemeral: true,
    });
    return;
  }

  let role = interaction.guild.roles.cache.find((role) => role.name === roleName);

  if (role) {
    role = await interaction.guild.roles.create({
      name: roleName,
      mentionable: true,
      reason: `Championship ${championshipId} role`,
    });
  }

  if (!Number.isInteger(championshipId)) {
    await interaction.reply({
      content: 'Championship ID must be a whole number.',
      ephemeral: true,
    });
    return;
}

  // - fetch championship data from SimGrid
  const getChampionshipURL = `${APIRequestUrls.getChampionship}${championshipId}`;
  const data = await fetchData(getChampionshipURL, RequestOptions) as ChampionshipData;

  // - store in DB
  await prisma.championship.upsert({
    where: {
      id: championshipId,
    },
    update: {
      name: data.name,
      races: {
        connectOrCreate: data.races.map((race) => ({
          where: { id: race.id },
          create: {
            id: race.id,
            name: race.race_name,
            trackName: race.track.name,
            startsAt: new Date(race.starts_at),
          },
        })),
      },
      image: data.image,
      gameName: data.game_name,
      roleId: roleName,
      roleName: roleName,
    },
    create: {
      id: championshipId,
      name: data.name,
      races: {
        create: data.races.map((race) => ({
          id: race.id,
          name: race.race_name,
          trackName: race.track.name,
          startsAt: new Date(race.starts_at),
        })),
      },
      image: data.image,
      gameName: data.game_name,
      roleId: roleName,
      roleName: roleName,
    },
  });

  await interaction.reply({
    content: `✅ Championship **${championshipId}** added with role **${roleName}**`,
    ephemeral: true,
  });
}

export default handleChampionshipAddModal;