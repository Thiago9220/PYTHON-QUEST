export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  titleReward?: string;
};

export type ChallengeProgress = {
  completed: boolean;
  attempts: number;
  hintsUsed: number;
  bestScore: number;
  bestChars?: number;
  completedAt?: number;
};

export type GameState = {
  playerName: string;
  totalXP: number;
  challengeProgress: Record<string, ChallengeProgress>;
  achievements: Achievement[];
  currentWorldId: string | null;
  currentChallengeId: string | null;
  streak: number;
  lastPlayedAt: number | null;
  equippedTitle?: string;
  isMuted: boolean;
  hasSeenTutorial: boolean;
  hasSeenWorldTour: boolean;
  hasSeenProfileTour: boolean;
  isDevMode: boolean;
};

export type GameAction =
  | { type: "SET_PLAYER_NAME"; name: string }
  | { type: "COMPLETE_CHALLENGE"; challengeId: string; xp: number; hintsUsed: number; attempts: number; charCount: number }
  | { type: "RECORD_ATTEMPT"; challengeId: string }
  | { type: "SET_CURRENT_CHALLENGE"; worldId: string; challengeId: string }
  | { type: "UNLOCK_ACHIEVEMENT"; achievementId: string }
  | { type: "SET_TITLE"; title: string }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_DEV_MODE" }
  | { type: "COMPLETE_TUTORIAL" }
  | { type: "COMPLETE_WORLD_TOUR" }
  | { type: "COMPLETE_PROFILE_TOUR" }
  | { type: "LOAD_STATE"; state: GameState }
  | { type: "RESET_STATE" }
  | { type: "DEBUG_COMPLETE_ALL" }
  | { type: "DEBUG_COMPLETE_WORLD"; worldId: string }
  | { type: "DEBUG_ADD_XP"; amount: number }
  | { type: "DEBUG_UNLOCK_ALL_ACHIEVEMENTS" }
  | { type: "DEBUG_RESET_TUTORIAL" }
  | { type: "DEBUG_ADD_STREAK"; days: number };
