import { PrismaClient } from '@prisma/client'; // or wherever you import it
import { Client } from 'discord.js';
import Config from '../config';

export async function cleanUpNewMemberRoles(client: Client) {
  console.log(`[${new Date().toISOString()}] Starting cleanup job...`);

  const guild = client.guilds.cache.get(Config.GUILD_ID);
  if (!guild) {
    console.log('Guild not found, aborting cleanup');
    return;
  }

  const newMemberRole = guild.roles.cache.get(Config.NEW_MEMBER_ROLE_ID);
  if (!newMemberRole) {
    console.log('New member role not found, aborting cleanup');
    return;
  }

  const prisma = new PrismaClient();

  // For testing: 10 seconds ago
  const thresholdDate = new Date(Date.now() - 10 * 1000);

  const usersToClean = await prisma.user.findMany({
    where: {
      joinedAt: {
        lt: thresholdDate,
      },
    },
  });

  console.log(`Found ${usersToClean.length} users to clean`);

  for (const user of usersToClean) {
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      console.log(`Could not fetch member with ID ${user.id}`);
      continue;
    }

    if (member.roles.cache.has(newMemberRole.id)) {
      await member.roles.remove(newMemberRole);
      console.log(`Removed 'New member' role from ${member.user.tag}`);
    } else {
      console.log(`Member ${member.user.tag} does not have the 'New member' role`);
    }
  }

  await prisma.$disconnect();

  console.log(`[${new Date().toISOString()}] Cleanup job completed`);
}

