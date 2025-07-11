import { Message, EmbedBuilder, TextChannel, AttachmentBuilder } from 'discord.js';
import { ignoredRoles, whitelistedChannels } from '../constants';
import { positivePatterns } from '../utils/patterns';
import { guidelineResponses, cooldownResponses } from '../handlers/botResponsesHandler';
import { Bot } from '..';
import Config from '../config';

interface UserCooldownData {
  lastResponseTime: number;
  messageCount: number;
  sentLogMessage: boolean;
}

const userResponseCooldown = new Map<string, UserCooldownData>();
const userCooldownPeriod = 15 * 60 * 1000; // 15 minutes
const globalCooldownPeriod = 10 * 1000; // 10 seconds
let lastGlobalResponseTime = 0;

export const onMessageCreate = async (message: Message) => {
  if (message.author.bot || whitelistedChannels.includes(message.channelId)) return;

  const member = message.member;
  if (!member || member.roles.cache.some((role) => ignoredRoles.includes(role.id))) return;

  const now = Date.now();
  const userId = message.author.id;
  const lowerCaseMessage = message.content.toLowerCase();

  if (now - lastGlobalResponseTime < globalCooldownPeriod) {
    return;
  }

  const userData = userResponseCooldown.get(userId) || { lastResponseTime: 0, messageCount: 0, sentLogMessage: false };
  userResponseCooldown.set(userId, userData);

  if (userData.sentLogMessage && now - userData.lastResponseTime < userCooldownPeriod) {
    return;
  }

  const isPositiveMatch = positivePatterns.some((pattern) => pattern.test(lowerCaseMessage));

  if (isPositiveMatch) {
    if (userData.messageCount < 2) {
      const responseArray = guidelineResponses['general'];
      const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
      const file = new AttachmentBuilder('https://r2.fivemanage.com/Km44dzC3oIVfckiyEjRbl/image/steve.png');
      await message.reply({ content: randomResponse, files: [file] });
      lastGlobalResponseTime = now;
      userData.messageCount++;
      console.log(userId, userData.messageCount);
    } else {
      const randomCooldownResponse = cooldownResponses[Math.floor(Math.random() * cooldownResponses.length)];
      await message.reply(randomCooldownResponse);
      userData.lastResponseTime = now;
      userData.messageCount = 0;
      userData.sentLogMessage = true;
      sendCooldownLog(message, userData.lastResponseTime);
    }
  }
};

async function sendCooldownLog(message: Message, lastResponseTime: number) {
  const remainingTime = userCooldownPeriod - (Date.now() - lastResponseTime);
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = ((remainingTime % 60000) / 1000).toFixed(0);

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle(`${message.author.tag} is currently being ignored by ADRR Race Director`)
    .setDescription(`Ignored for ${minutes} minutes, ${seconds} seconds`)
    .setTimestamp()
    .setFooter({ text: `User ID: ${message.author.id}` });

  const logChannel = Bot.channels.cache.get(Config.LOG_CHANNEL) as TextChannel;

  if (logChannel) {
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      // Error handling here when I need it
    }
  }
}
