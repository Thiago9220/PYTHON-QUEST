import { WORLDS } from "@/lib/challenges";
import type { BossProgress } from "@/lib/gameTypes";
import { isDemoLocked } from "@/lib/platform";

export const LEVELS = [
  { level: 1, title: "Curioso", minXP: 0 },
  { level: 2, title: "Aprendiz", minXP: 800 },
  { level: 3, title: "Estudante", minXP: 2000 },
  { level: 4, title: "Praticante", minXP: 3500 },
  { level: 5, title: "Construtor", minXP: 5000 },
  { level: 6, title: "Automatizador", minXP: 6500 },
  { level: 7, title: "Especialista Python", minXP: 8000 },
  { level: 8, title: "Navegador da Rede", minXP: 9500 },
  { level: 9, title: "Arquiteto de Scripts", minXP: 11000 },
  { level: 10, title: "Mestre Python", minXP: 13000 },
];

export const getStartOfDay = (timestamp: number) => {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const isSameDay = (t1: number, t2: number) => getStartOfDay(t1) === getStartOfDay(t2);

export const isYesterday = (t1: number, t2: number) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return getStartOfDay(t1) === getStartOfDay(t2 - oneDay);
};

export function calculatePlayerLevel(xp: number) {
  let current = LEVELS[0];
  let next: typeof LEVELS[number] | null = LEVELS[1] ?? null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXP) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const isMaxLevel = next === null;
  const progress = isMaxLevel
    ? 100
    : Math.min(100, ((xp - current.minXP) / (next!.minXP - current.minXP)) * 100);

  return {
    level: current.level,
    title: current.title,
    nextLevelXP: next?.minXP ?? null,
    progress,
    isMaxLevel,
  };
}

export const PREMIUM_WORLDS: string[] = [];

export function getWorldUnlockStatus(
  worldId: string,
  totalXP: number,
  isDevMode: boolean,
  _purchasedWorlds: string[] = []
) {
  // A demo nunca abre setores do jogo completo, nem em modo dev.
  if (isDemoLocked(worldId)) return false;
  if (isDevMode) return true;
  const world = WORLDS.find((w) => w.id === worldId);
  if (!world) return false;
  return totalXP >= world.unlockRequirement;
}

const minDefined = (a?: number, b?: number) =>
  a === undefined ? b : b === undefined ? a : Math.min(a, b);

/**
 * Junta o progresso de chefes de várias fontes (banco, cache local). Um chefe
 * vencido em qualquer fonte continua vencido; fica o melhor tempo e menos dicas.
 * Ignora entradas malformadas (o valor do banco é jsonb livre).
 */
export function mergeBossProgress(
  ...sources: (Record<string, unknown> | null | undefined)[]
): Record<string, BossProgress> {
  const merged: Record<string, BossProgress> = {};
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const [bossId, raw] of Object.entries(source)) {
      const entry = raw as Partial<BossProgress> | null;
      if (!entry || typeof entry !== "object" || entry.defeated !== true) continue;
      const prev = merged[bossId];
      merged[bossId] = {
        defeated: true,
        defeatedAt: minDefined(prev?.defeatedAt, entry.defeatedAt),
        totalHintsUsed: minDefined(prev?.totalHintsUsed, entry.totalHintsUsed) ?? 0,
        durationSec: minDefined(prev?.durationSec, entry.durationSec),
      };
    }
  }
  return merged;
}
