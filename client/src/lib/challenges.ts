import { World, Challenge } from "./types";
import { VILA_VARIAVEIS_WORLD } from "./worlds/vila_variaveis";
import { VALE_CONDICOES_WORLD } from "./worlds/vale_condicoes";
import { MONTANHA_LOOPS_WORLD } from "./worlds/montanha_loops";
import { FLORESTA_FUNCOES_WORLD } from "./worlds/floresta_funcoes";
import { NINHO_LISTAS_WORLD } from "./worlds/ninho_listas";
import { CRIPTA_DICIONARIOS_WORLD } from "./worlds/cripta_dicionarios";
import { FORTALEZA_OOP_WORLD } from "./worlds/fortaleza_oop";
import { BUNKER_EXCECOES_WORLD } from "./worlds/bunker_excecoes";

export const WORLDS: World[] = [
  VILA_VARIAVEIS_WORLD,
  VALE_CONDICOES_WORLD,
  NINHO_LISTAS_WORLD,
  MONTANHA_LOOPS_WORLD,
  FLORESTA_FUNCOES_WORLD,
  CRIPTA_DICIONARIOS_WORLD,
  FORTALEZA_OOP_WORLD,
  BUNKER_EXCECOES_WORLD,
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
