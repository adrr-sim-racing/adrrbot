import { RGBTuple } from "discord.js";
import Config from './config';

export const GithubUrl = 'https://github.com/adrr-simracing';
export const GithubApi = 'https://api.github.com/repos/adrr-simracing';
export const WebsiteUrl = 'https://adrr.net';

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
  fot:  {
    name: 'FOT',
    thumbnailImage: 'https://i.fmfile.com/Km44dzC3oIVfckiyEjRbl/FOT_Light.png',
    color: [235, 251, 72] as RGBTuple,  // ADRR Yellow
  },
  gt3o: {
    name: 'GT3O',
    thumbnailImage: 'https://chibi.iitranq.co.uk/rdl5AH9xTh38.webp',
    color: [192, 102, 147] as RGBTuple,  // GT3O Pink
  },
  aec: {
    name: 'AEC',
    thumbnailImage: 'https://r2.fivemanage.com/Km44dzC3oIVfckiyEjRbl/AEC-LOGOwebp.webp',
    color: [237, 37, 78] as RGBTuple, // USC Red
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

export const childRoles: Record<string, string> = {
  '1420706099052679188': '1420706290283450468', // FOT S3 R1
  '1420706850852044902': '1420706290283450468', // FOT S3 R2
  '1420706898964906137': '1420706290283450468', // FOT S3 R3
  '1420706932615938088': '1420706290283450468', // FOT S3 R4
  '1420706984969240627': '1420706290283450468', // FOT S3 R5
  '1420707012899246110': '1420706290283450468', // FOT S3 R6
  '1425234821394993233': '1425234069184315392', // GT3 Open R1+2
  '1425235017340289166': '1425234069184315392', // GT3 Open R3+4
  '1425235127226859692': '1425234069184315392', // GT3 Open R5+6
  '1425235170562408479': '1425234069184315392', // GT3 Open R7+8
  '1425235209208729670': '1425234069184315392', // GT3 Open R9+10
}

export const roleRounds: Record<string, string> = {
  '1420706099052679188': '18476', // FOT S3 R1
  '1420706850852044902': '18657', // FOT S3 R2
  '1420706898964906137': '18658', // FOT S3 R3
  '1420706932615938088': '18659', // FOT S3 R4
  '1420706984969240627': '18660', // FOT S3 R5
  '1420707012899246110': '18661', // FOT S3 R6
  '1425234821394993233': '18829', // GT3 Open R1+2
  '1425235017340289166': '18831', // GT3 Open R3+4
  '1425235127226859692': '18832', // GT3 Open R5+6
  '1425235170562408479': '18833', // GT3 Open R7+8
  '1425235209208729670': '18834', // GT3 Open R9+10
  '1465705704986771510': '21493', // Pre-season
}