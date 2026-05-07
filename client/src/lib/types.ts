export type Difficulty = "iniciante" | "intermediario" | "avancado" | "epico" | "lendario";

export type Hint = {
  text: string;
  cost: number;
};

export type Challenge = {
  id: string;
  worldId: string;
  title: string;
  description: string;
  narrative: string;
  difficulty: Difficulty;
  setupCode: string;
  expectedOutput: string;
  testCode: string;
  starterCode: string;
  hints: Hint[];
  xpReward: number;
  concept: string;
  conceptExplanation: string;
  successStory?: string;
  successNpc?: string;
  successAvatar?: string;
  solution?: string;
};

export type World = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgImage?: string;
  lore?: string;
  challenges: Challenge[];
  unlockRequirement: number;
};
