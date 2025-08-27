import { RGBTuple } from "discord.js";

export interface EventData {
  colour: string;
  title: string;
  date: string;
  seasonRound: string;
  classes: string;
  imagePath: string;
  logoImagePath: string | null;
}