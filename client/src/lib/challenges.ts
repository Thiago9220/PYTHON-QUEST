import { World, Challenge } from "./types";
import { VILA_VARIAVEIS_WORLD } from "./worlds/vila_variaveis";

export const WORLDS: World[] = [
  VILA_VARIAVEIS_WORLD,
];

export function getAllChallenges(): Challenge[] {
  return WORLDS.flatMap((w) => w.challenges);
}

export function getChallengeById(id: string): Challenge | undefined {
  return getAllChallenges().find((c) => c.id === id);
}

export function getWorldById(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}
