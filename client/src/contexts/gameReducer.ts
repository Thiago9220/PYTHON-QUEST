import { GameState, GameAction } from "@/lib/gameTypes";
import { ACHIEVEMENTS_ROOT } from "@/lib/achievements";
import { isSameDay, isYesterday } from "@/lib/gameLogic";
import { WORLDS } from "@/lib/challenges";

export const INITIAL_STATE: GameState = {
  playerName: "",
  totalXP: 0,
  challengeProgress: {},
  bossProgress: {},
  achievements: ACHIEVEMENTS_ROOT,
  currentWorldId: null,
  currentChallengeId: null,
  streak: 0,
  lastPlayedAt: null,
  isMuted: false,
  hasSeenTutorial: false,
  hasSeenWorldTour: false,
  hasSeenProfileTour: false,
  isDevMode: false,
  studyAnswerUses: 0,
  lastStudyAnswerDate: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, equippedTitle: action.title };

    case "TOGGLE_MUTE":
      return { ...state, isMuted: !state.isMuted };

    case "TOGGLE_DEV_MODE": {
      const newVal = !state.isDevMode;
      localStorage.setItem("python_quest_dev_mode", String(newVal));
      return { ...state, isDevMode: newVal };
    }

    case "COMPLETE_TUTORIAL":
      return { ...state, hasSeenTutorial: true };

    case "COMPLETE_WORLD_TOUR":
      return { ...state, hasSeenWorldTour: true };

    case "COMPLETE_PROFILE_TOUR":
      return { ...state, hasSeenProfileTour: true };

    case "LOAD_STATE": {
      const now = Date.now();
      let newStreak = action.state.streak;
      const lastPlayed = action.state.lastPlayedAt;

      if (lastPlayed) {
        if (!isSameDay(lastPlayed, now) && !isYesterday(lastPlayed, now)) {
          newStreak = 0;
        }
      }

      // Sync achievements with ROOT list (important for adding new ones)
      const syncedAchievements = ACHIEVEMENTS_ROOT.map(rootAch => {
        const existing = action.state.achievements?.find(a => a.id === rootAch.id);
        if (existing) {
          return { ...rootAch, unlocked: existing.unlocked, unlockedAt: existing.unlockedAt };
        }
        return rootAch;
      });

      return {
        ...action.state,
        bossProgress: action.state.bossProgress ?? {},
        streak: newStreak,
        achievements: syncedAchievements,
      };
    }

    case "RESET_STATE":
      return INITIAL_STATE;

    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.name };

    case "SET_CURRENT_CHALLENGE":
      return {
        ...state,
        currentWorldId: action.worldId,
        currentChallengeId: action.challengeId,
      };

    case "RECORD_ATTEMPT": {
      const prev = state.challengeProgress[action.challengeId] || {
        completed: false,
        attempts: 0,
        hintsUsed: 0,
        bestScore: 0,
      };
      return {
        ...state,
        challengeProgress: {
          ...state.challengeProgress,
          [action.challengeId]: { ...prev, attempts: prev.attempts + 1 },
        },
      };
    }

    case "USE_STUDY_ANSWER": {
      const today = new Date().toISOString().split("T")[0];
      const isNewDay = state.lastStudyAnswerDate !== today;
      return {
        ...state,
        studyAnswerUses: isNewDay ? 1 : state.studyAnswerUses + 1,
        lastStudyAnswerDate: today,
      };
    }

    case "COMPLETE_CHALLENGE": {
      const prev = state.challengeProgress[action.challengeId] || {
        completed: false,
        attempts: 0,
        hintsUsed: 0,
        bestScore: 0,
        bestChars: undefined,
      };

      const baseScore = Math.max(0, action.xp - action.hintsUsed * 10);
      const score = action.usedStudyAnswer ? 0 : baseScore;
      const isFirstTimeCompletion = !prev.completed;
      const newXP = isFirstTimeCompletion ? state.totalXP + score : state.totalXP;
      
      const now = Date.now();
      let newStreak = state.streak;
      
      if (!state.lastPlayedAt) {
        newStreak = 1;
      } else {
        const playedToday = isSameDay(state.lastPlayedAt, now);
        const playedYesterday = isYesterday(state.lastPlayedAt, now);

        if (playedYesterday) {
          newStreak = state.streak + 1;
        } else if (!playedToday) {
          newStreak = 1;
        } else if (state.streak === 0) {
          newStreak = 1;
        }
      }

      const newBestChars = prev.bestChars
        ? Math.min(prev.bestChars, action.charCount)
        : action.charCount;

      return {
        ...state,
        totalXP: newXP,
        streak: newStreak,
        lastPlayedAt: Date.now(),
        challengeProgress: {
          ...state.challengeProgress,
          [action.challengeId]: {
            completed: true,
            attempts: isFirstTimeCompletion ? action.attempts : prev.attempts,
            hintsUsed: isFirstTimeCompletion ? action.hintsUsed : prev.hintsUsed,
            bestScore: isFirstTimeCompletion ? score : Math.max(prev.bestScore, score),
            bestChars: newBestChars,
            completedAt: prev.completedAt || Date.now(),
          },
        },
      };
    }

    case "DEFEAT_BOSS": {
      const prev = state.bossProgress?.[action.bossId];
      const isFirstTime = !prev?.defeated;
      const newXP = isFirstTime ? state.totalXP + action.xp : state.totalXP;

      return {
        ...state,
        totalXP: newXP,
        bossProgress: {
          ...(state.bossProgress || {}),
          [action.bossId]: {
            defeated: true,
            defeatedAt: prev?.defeatedAt || Date.now(),
            totalHintsUsed: isFirstTime
              ? action.hintsUsed
              : Math.min(prev?.totalHintsUsed ?? action.hintsUsed, action.hintsUsed),
            durationSec: isFirstTime
              ? action.durationSec
              : Math.min(prev?.durationSec ?? action.durationSec, action.durationSec),
          },
        },
      };
    }

    case "UNLOCK_ACHIEVEMENT": {
      return {
        ...state,
        achievements: state.achievements.map((a) =>
          a.id === action.achievementId
            ? { ...a, unlocked: true, unlockedAt: Date.now() }
            : a
        ),
      };
    }

    case "DEBUG_COMPLETE_ALL": {
      const newProgress: Record<string, any> = { ...state.challengeProgress };
      let totalXP = 0;

      WORLDS.forEach((world) => {
        world.challenges.forEach((challenge) => {
          newProgress[challenge.id] = {
            completed: true,
            attempts: 1,
            hintsUsed: 0,
            bestScore: challenge.xpReward,
            bestChars: 20,
            completedAt: Date.now(),
          };
          totalXP += challenge.xpReward;
        });
      });

      return {
        ...state,
        totalXP,
        challengeProgress: newProgress,
      };
    }

    case "DEBUG_COMPLETE_WORLD": {
      const world = WORLDS.find((w) => w.id === action.worldId);
      if (!world) return state;

      const newProgress = { ...state.challengeProgress };
      let xpToAdd = 0;

      world.challenges.forEach((challenge) => {
        if (!newProgress[challenge.id]?.completed) {
          xpToAdd += challenge.xpReward;
          newProgress[challenge.id] = {
            completed: true,
            attempts: 1,
            hintsUsed: 0,
            bestScore: challenge.xpReward,
            bestChars: 20,
            completedAt: Date.now(),
          };
        }
      });

      return {
        ...state,
        totalXP: state.totalXP + xpToAdd,
        challengeProgress: newProgress,
      };
    }

    case "DEBUG_ADD_XP":
      return { ...state, totalXP: state.totalXP + action.amount };

    case "DEBUG_UNLOCK_ALL_ACHIEVEMENTS":
      return {
        ...state,
        achievements: state.achievements.map((a) => ({
          ...a,
          unlocked: true,
          unlockedAt: a.unlockedAt || Date.now(),
        })),
      };

    case "DEBUG_RESET_TUTORIAL":
      return {
        ...state,
        hasSeenTutorial: false,
        hasSeenWorldTour: false,
        hasSeenProfileTour: false,
      };

    case "DEBUG_ADD_STREAK":
      return { ...state, streak: state.streak + action.days };

    default:
      return state;
  }
}
