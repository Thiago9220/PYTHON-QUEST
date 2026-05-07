import { GameState, GameAction } from "@/lib/gameTypes";
import { ACHIEVEMENTS_ROOT } from "@/lib/achievements";
import { isSameDay, isYesterday } from "@/lib/gameLogic";
import { WORLDS } from "@/lib/challenges";

export const INITIAL_STATE: GameState = {
  playerName: "",
  totalXP: 0,
  challengeProgress: {},
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
        newStreak = 1;
      } else {
        const playedToday = isSameDay(state.lastPlayedAt, now);
        const playedYesterday = isYesterday(state.lastPlayedAt, now);

        if (playedYesterday) {
          newStreak = state.streak + 1;
        } else if (!playedToday) {
          // Se não jogou hoje nem ontem, a ofensiva reinicia em 1
          newStreak = 1;
        } else if (state.streak === 0) {
          // Caso raro: jogou hoje mas a ofensiva estava em 0 (ex: reset de estado)
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
