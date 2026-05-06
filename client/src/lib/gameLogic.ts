import { WORLDS } from "@/lib/challenges";

export const LEVELS = [
  { level: 1, title: "Curioso", minXP: 0 },
  { level: 2, title: "Aprendiz", minXP: 800 },
  { level: 3, title: "Estudante", minXP: 2000 },
  { level: 4, title: "Praticante", minXP: 3500 },
  { level: 5, title: "Construtor", minXP: 5000 },
  { level: 6, title: "Automatizador", minXP: 6500 },
  { level: 7, title: "Especialista Python", minXP: 8000 },
  { level: 8, title: "Navegador Aurora", minXP: 9500 },
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
  if (isDevMode) return true;
  const world = WORLDS.find((w) => w.id === worldId);
  if (!world) return false;
  return totalXP >= world.unlockRequirement;
}
