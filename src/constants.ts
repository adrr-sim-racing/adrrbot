import { RGBTuple } from "discord.js";
import Config from './config';

export const GithubUrl = 'https://github.com/overextended';
export const GithubApi = 'https://api.github.com/repos/overextended';
export const DocsUrl = 'https://overextended.dev';
export const WebsiteUrl = 'https://adrr.net';
export const Resources = [
  'ox_lib',
  'ox_inventory',
  'oxmysql',
  'ox_core',
  'ox_fuel',
  'ox_target',
  'ox_doorlock',
  'ox_types',
  'ox_mdt',
  'cfxlua-vscode',
  'ox_vehicledealer',
  'ox_banking',
  'ox_appearance',
  'ox_police',
  'ox_commands',
  'OxBot',
  'fivem-typescript-boilerplate',
  'fivem-lls-addon',
];
export const APIRequestUrls = {
  baseURL: "https://www.thesimgrid.com/api/v1",
  getChampionship: "https://www.thesimgrid.com/api/v1/championships/",
  getUser: "https://www.thesimgrid.com/api/v1/users/"

};

export const RequestOptions: RequestInit = {
  method: 'GET',
  redirect: 'follow',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${Config.SIMGRID_API_KEY}`,
  },
};
export const Championships = {
  usc: {
    name: 'USC',
    thumbnailImage: 'https://r2.fivemanage.com/Km44dzC3oIVfckiyEjRbl/image/USCLogo.png',
    color: [237, 37, 78] as RGBTuple, // USC Red
  },
  fot:  {
    name: 'FOT',
    thumbnailImage: 'https://i.fmfile.com/Km44dzC3oIVfckiyEjRbl/FOT_Light.png',
    color: [235, 251, 72] as RGBTuple,  // ADRR Yellow
  },
  default: {
    name: 'Default',
    thumbnailImage: null,
    color: [235, 251, 72] as RGBTuple,  // ADRR Yellow
  }
};
export const ADRRColours = {
  Primary: [235, 251, 72] as RGBTuple,  // ADRR Yellow
  Secondary: [237, 37, 78] as RGBTuple,  // USC Red
};
export const ADRRColoursArray: RGBTuple[] = Object.values(ADRRColours);

export const DailyRaceChannelID = "1349283376560865342";

export const ResourceChoices = (() => {
  const arr: { name: string; value: string }[] = new Array(Resources.length);

  Resources.forEach((value, index) => {
    arr[index] = { name: value, value: value };
  });

  return arr;
})();

// ignored role IDs for onMessageCreate.ts
export const ignoredRoles = [
  '1341339561988456569', // ADRR
  '1349481104700346390', // ADRR Steward (bot)
  '1349138300580921394', // Discord wizard
  // '1347651304750710866', // ADRR Heroes
];

// channel ID for support-guidelines
export const guidelines = '<#1352780758967914617>';

export const whitelistedChannels = [
  '1347653448237322290', // Admin
];

// channel IDs for botResponsesHandler.ts
export const ChannelIDs = {
  general: '1340659416860721174', // adrr general channel
  offtopic: '1359237075068780769', // adrr off-topic channel
  usercontent: '1340659416860721175', // adrr user content channel
  liveries: '1385943791940403280', // adrr liveries channel
};
