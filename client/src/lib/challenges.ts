import { World, Challenge } from "./types";
import { VILA_VARIAVEIS_WORLD } from "./worlds/vila_variaveis";
import { VALE_CONDICOES_WORLD } from "./worlds/vale_condicoes";
import { MONTANHA_LOOPS_WORLD } from "./worlds/montanha_loops";
import { FLORESTA_FUNCOES_WORLD } from "./worlds/floresta_funcoes";
import { NINHO_LISTAS_WORLD } from "./worlds/ninho_listas";
import { CRIPTA_DICIONARIOS_WORLD } from "./worlds/cripta_dicionarios";
import { FORTALEZA_OOP_WORLD } from "./worlds/fortaleza_oop";
import { BUNKER_EXCECOES_WORLD } from "./worlds/bunker_excecoes";

// Módulos Data Science
import { REFINARIA_DADOS_WORLD } from "./worlds/refinaria_dados";
import { SALA_COMANDO_VISUAL_WORLD } from "./worlds/sala_comando_visual";
import { LABORATORIO_NEURAL_WORLD } from "./worlds/laboratorio_neural";
import { NUCLEO_SINTETICO_WORLD } from "./worlds/nucleo_sintetico";

export const WORLDS: World[] = [
  VILA_VARIAVEIS_WORLD,
  VALE_CONDICOES_WORLD,
  NINHO_LISTAS_WORLD,
  MONTANHA_LOOPS_WORLD,
  FLORESTA_FUNCOES_WORLD,
  CRIPTA_DICIONARIOS_WORLD,
  FORTALEZA_OOP_WORLD,
  BUNKER_EXCECOES_WORLD,
  REFINARIA_DADOS_WORLD,
  SALA_COMANDO_VISUAL_WORLD,
  LABORATORIO_NEURAL_WORLD,
  NUCLEO_SINTETICO_WORLD,
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
