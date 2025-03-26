import { RGBTuple } from "discord.js";

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
  baseURL: "https://www.thesimgrid.com/api/v1/",
  getChampionship: "https://www.thesimgrid.com/api/v1/championships/",
};
export const Championships = {
  usc: "13642",
  daily: "13931",
}
export const ADRRColours = {
  Primary: [235, 251, 72] as RGBTuple,
  Secondary: [237, 37, 78] as RGBTuple,
}
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
  usercontent: '1340659416860721175', // adrr user content channel
  test: '1353837446630084699', // adrr test channel
};
