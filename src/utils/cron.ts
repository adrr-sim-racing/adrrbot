import { PrismaClient } from '@prisma/client'; // or wherever you import it
import { Client } from 'discord.js';
import Config from '../config';

export async function cleanUpNewMemberRoles(client: Client) {
  const guild = client.guilds.cache.get('YOUR_GUILD_ID');
  if (!guild) return;

  const newMemberRole = guild.roles.cache.get(Config.NEW_MEMBER_ROLE_ID);
  if (!newMemberRole) return;

  const prisma = new PrismaClient();
  // const thresholdDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const thresholdDate = new Date(Date.now() - 10 * 1000); // 10 seconds ago


  const usersToClean = await prisma.user.findMany({
    where: {
      joinedAt: {
        lt: thresholdDate,
      },
    },
  });

  for (const user of usersToClean) {
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) continue;

    if (member.roles.cache.has(newMemberRole.id)) {
      await member.roles.remove(newMemberRole);
      console.log(`Removed 'New member' role from ${member.user.tag}`);
    }
  }
}
