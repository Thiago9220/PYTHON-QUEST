import {
  createContext,
  useContext,
  useEffect,
  useState,
  useReducer,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { soundManager } from "@/lib/sounds";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Trophy, Terminal, Zap, Award, BookOpen, Compass, 
  MapPin, RefreshCw, Layers, Flame, Ghost, Sparkles, Cpu, Target, 
  HelpCircle, Shield, BrainCircuit, Infinity, Crown, EyeOff
} from "lucide-react";

// Refactored Modules
import { GameState, GameAction, ChallengeProgress } from "@/lib/gameTypes";
import { INITIAL_STATE, gameReducer } from "./gameReducer";
import { calculatePlayerLevel, getWorldUnlockStatus } from "@/lib/gameLogic";
import {
  ACHIEVEMENTS_ROOT,
  getAchievementConditions,
} from "@/lib/achievements";
import { WORLDS } from "@/lib/challenges";

type GameContextType = {
  state: GameState;
  isLoading: boolean;
  hasHydrated: boolean;
  loadError: string | null;
  dispatch: React.Dispatch<GameAction>;
  getPlayerLevel: () => {
    level: number;
    title: string;
    nextLevelXP: number | null;
    progress: number;
    isMaxLevel: boolean;
  };
  isWorldUnlocked: (worldId: string) => boolean;
  isChallengeCompleted: (challengeId: string) => boolean;
  isBossDefeated: (bossId: string) => boolean;
  isBossUnlocked: (worldId: string) => boolean;
  getCompletedCount: () => number;
  getTotalChallenges: () => number;
  refreshGameData: () => Promise<void>;
  resetAllProgress: () => Promise<void>;
  resetWorldProgress: (worldId: string) => Promise<void>;
};

type ProgressRow = {
  challenge_id: string;
  completed: boolean;
  attempts: number;
  hints_used: number;
  best_score: number;
  best_chars?: number;
  completed_at?: string | null;
};

type AchievementRow = {
  achievement_id: string;
  unlocked_at: string;
};

type PurchaseRow = {
  world_id: string;
};

const GameContext = createContext<GameContextType | null>(null);

type PersistedGameSnapshot = {
  state: GameState;
  purchasedWorlds: string[];
};

const getSnapshotStorageKey = (userId?: string) =>
  `python_quest_game_snapshot:${userId || "guest"}`;

const readPersistedSnapshot = (
  userId?: string
): PersistedGameSnapshot | null => {
  try {
    const raw = localStorage.getItem(getSnapshotStorageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedGameSnapshot;
  } catch {
    return null;
  }
};

const persistSnapshot = (
  userId: string | undefined,
  snapshot: PersistedGameSnapshot
) => {
  try {
    localStorage.setItem(getSnapshotStorageKey(userId), JSON.stringify(snapshot));
  } catch {
    // Ignora indisponibilidade de storage; o dado autoritativo continua no Supabase.
  }
};

const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export function GameProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string;
}) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [purchasedWorlds, setPurchasedWorlds] = useState<string[]>([]);
  const loadingRef = useRef(false);
  const latestLoadRef = useRef(0);

  const refreshGameData = useCallback(async () => {
    if (!userId) return;

    const loadId = ++latestLoadRef.current;
    loadingRef.current = true;
    setIsLoading(true);
    setLoadError(null);

    try {
      let lastFailure: unknown = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUserId = sessionData.session?.user?.id;

        if (sessionUserId !== userId) {
          lastFailure = new Error("AUTH_SESSION_NOT_READY");
          await wait(250 * (attempt + 1));
          continue;
        }

        const [
          profileResult,
          progressResult,
          achievementsResult,
          purchasesResult,
        ] = await Promise.allSettled([
          supabase.from("profiles").select("*").eq("id", userId).single(),
          supabase
            .from("challenge_progress")
            .select("*")
            .eq("user_id", userId),
          supabase
            .from("user_achievements")
            .select("*")
            .eq("user_id", userId),
          supabase
            .from("user_purchases")
            .select("world_id")
            .eq("user_id", userId)
            .eq("status", "approved"),
        ]);

        if (loadId !== latestLoadRef.current) return;

        if (profileResult.status === "rejected") {
          lastFailure = profileResult.reason;
          await wait(250 * (attempt + 1));
          continue;
        }
        if (progressResult.status === "rejected") {
          lastFailure = progressResult.reason;
          await wait(250 * (attempt + 1));
          continue;
        }
        if (achievementsResult.status === "rejected") {
          lastFailure = achievementsResult.reason;
          await wait(250 * (attempt + 1));
          continue;
        }
        if (purchasesResult.status === "rejected") {
          lastFailure = purchasesResult.reason;
          await wait(250 * (attempt + 1));
          continue;
        }

        const profileRes = profileResult.value;
        const progressRes = progressResult.value;
        const achievementsRes = achievementsResult.value;
        const purchasesRes = purchasesResult.value;

        const firstQueryError =
          (profileRes.error &&
            profileRes.error.code !== "PGRST116" &&
            profileRes.error) ||
          progressRes.error ||
          achievementsRes.error ||
          purchasesRes.error;

        if (firstQueryError) {
          lastFailure = firstQueryError;
          await wait(250 * (attempt + 1));
          continue;
        }

        const suspiciousEmptySnapshot =
          !profileRes.data &&
          (progressRes.data?.length ?? 0) === 0 &&
          (achievementsRes.data?.length ?? 0) === 0 &&
          (purchasesRes.data?.length ?? 0) === 0;

        if (suspiciousEmptySnapshot) {
          lastFailure = new Error("EMPTY_REMOTE_STATE");
          await wait(300 * (attempt + 1));
          continue;
        }

        const profile = profileRes.data;

        const progressMap: Record<string, ChallengeProgress> = {};
        let totalProgressXP = 0;

        progressRes.data?.forEach((p: ProgressRow) => {
          totalProgressXP += p.best_score || 0;
          progressMap[p.challenge_id] = {
            completed: p.completed,
            attempts: p.attempts,
            hintsUsed: p.hints_used,
            bestScore: p.best_score,
            bestChars: p.best_chars,
            completedAt: p.completed_at
              ? new Date(p.completed_at).getTime()
              : undefined,
          };
        });

        const mergedAchievements = ACHIEVEMENTS_ROOT.map(a => {
          const unlocked = achievementsRes.data?.find(
            (ua: AchievementRow) => ua.achievement_id === a.id
          );
          return unlocked
            ? {
                ...a,
                unlocked: true,
                unlockedAt: new Date(unlocked.unlocked_at).getTime(),
              }
            : a;
        });

        const nextPurchasedWorlds = purchasesRes.data?.map((p: PurchaseRow) => p.world_id) ?? [];
        const nextState: GameState = {
          ...INITIAL_STATE,
          playerName: profile?.display_name || "",
          totalXP: Math.max(profile?.total_xp || 0, totalProgressXP),
          streak: profile?.streak || 0,
          hasSeenTutorial: profile?.has_seen_tutorial || false,
          hasSeenWorldTour: profile?.has_seen_world_tour || false,
          hasSeenProfileTour: profile?.has_seen_profile_tour || false,
          hasSeenArenaTour: profile?.has_seen_arena_tour || false,
          equippedTitle: profile?.equipped_title,
          isMuted: profile?.is_muted || false,
          lastPlayedAt: profile?.last_played_at
            ? new Date(profile.last_played_at).getTime()
            : null,
          challengeProgress: progressMap,
          achievements: mergedAchievements,
          isDevMode: localStorage.getItem("python_quest_dev_mode") === "true",
        };

        setPurchasedWorlds(nextPurchasedWorlds);
        dispatch({
          type: "LOAD_STATE",
          state: nextState,
        });
        persistSnapshot(userId, {
          state: nextState,
          purchasedWorlds: nextPurchasedWorlds,
        });
        setHasHydrated(true);
        return;
      }

      const cachedSnapshot = readPersistedSnapshot(userId);

      if (cachedSnapshot) {
        setPurchasedWorlds(cachedSnapshot.purchasedWorlds);
        dispatch({
          type: "LOAD_STATE",
          state: {
            ...cachedSnapshot.state,
            isDevMode: localStorage.getItem("python_quest_dev_mode") === "true",
          },
        });
        setHasHydrated(true);
        setLoadError("Exibindo seu ultimo progresso salvo enquanto a sincronizacao falha.");
        return;
      }

      throw lastFailure ?? new Error("GAME_DATA_LOAD_FAILED");
    } catch (err) {
      if (loadId !== latestLoadRef.current) return;
      console.error("Erro ao carregar dados do jogo:", err);
      setLoadError("Nao foi possivel sincronizar seus dados agora.");
    } finally {
      if (loadId !== latestLoadRef.current) return;
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [userId]);

  // 1. DATA LOAD (Supabase or Local Guest)
  useEffect(() => {
    if (!userId) {
      // Tenta carregar progresso de convidado do localStorage
      const guestSnapshot = readPersistedSnapshot();
      if (guestSnapshot) {
        dispatch({
          type: "LOAD_STATE",
          state: {
            ...guestSnapshot.state,
            isDevMode: localStorage.getItem("python_quest_dev_mode") === "true",
          },
        });
        setPurchasedWorlds(guestSnapshot.purchasedWorlds);
      } else {
        dispatch({ type: "RESET_STATE" });
        setPurchasedWorlds([]);
      }
      
      setHasHydrated(true);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    void refreshGameData();
  }, [userId, refreshGameData]);

  // 2. PROFILE SYNC (Supabase)
  useEffect(() => {
    if (!userId || loadingRef.current || !hasHydrated) return;

    supabase
      .from("profiles")
      .upsert({
        id: userId,
        total_xp: state.totalXP,
        streak: state.streak,
        has_seen_tutorial: state.hasSeenTutorial,
        has_seen_world_tour: state.hasSeenWorldTour,
        has_seen_profile_tour: state.hasSeenProfileTour,
        has_seen_arena_tour: state.hasSeenArenaTour,
        equipped_title: state.equippedTitle,
        is_muted: state.isMuted,
        last_played_at: state.lastPlayedAt
          ? new Date(state.lastPlayedAt).toISOString()
          : new Date().toISOString(),
      })
      .then(({ error }: { error: unknown }) => {
        if (error) console.error("Erro ao sincronizar perfil:", error);
      });
  }, [
    state.totalXP,
    state.streak,
    state.equippedTitle,
    state.hasSeenTutorial,
    state.hasSeenWorldTour,
    state.hasSeenProfileTour,
    state.hasSeenArenaTour,
    state.isMuted,
    state.lastPlayedAt,
    hasHydrated,
    userId,
  ]);

  // 3. ACHIEVEMENT MONITORING (Queued — max 1 toast at a time)
  const achievementQueueRef = useRef<string[]>([]);
  const processedAchievementsRef = useRef<Set<string>>(new Set());
  const queueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId || loadingRef.current || !hasHydrated) return;

    const conditions = getAchievementConditions(state);
    const newlyUnlocked: string[] = [];

    Object.entries(conditions).forEach(([id, met]) => {
      const achievement = state.achievements.find(a => a.id === id);
      // Only consider if met, not already unlocked in state, AND not already processed by us
      if (met && achievement && !achievement.unlocked && !processedAchievementsRef.current.has(id)) {
        newlyUnlocked.push(id);
      }
    });

    if (newlyUnlocked.length === 0) return;

    // Mark all as processed immediately to prevent re-processing on re-render
    newlyUnlocked.forEach(id => {
      processedAchievementsRef.current.add(id);
      dispatch({ type: "UNLOCK_ACHIEVEMENT", achievementId: id });
      supabase
        .from("user_achievements")
        .insert({ user_id: userId, achievement_id: id })
        .then(() => {});
    });

    // Add to toast queue
    achievementQueueRef.current.push(...newlyUnlocked);

    // Start processing if not already running
    const startQueue = () => {
      if (queueTimerRef.current) return; // already running

      const showNext = () => {
        const nextId = achievementQueueRef.current.shift();
        if (!nextId) {
          queueTimerRef.current = null;
          return;
        }
        const ach = ACHIEVEMENTS_ROOT.find(a => a.id === nextId);
        if (ach) {
          soundManager.playAchievement();
          
          toast(`Conquista Desbloqueada: ${ach.title}`, {
            description: ach.description,
            icon: ach.icon.startsWith("/") ? (
              <img 
                src={ach.icon} 
                className={`w-8 h-8 rounded-lg border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)] ${ach.id !== "first_query" ? "invert hue-rotate-180 brightness-125 contrast-125 bg-black" : ""}`} 
                alt="" 
              />
            ) : (
              ach.icon
            ),
            className: "bg-slate-900 border border-amber-500/30 text-white shadow-2xl shadow-amber-500/10",
            duration: 5000,
          });
        }
        if (achievementQueueRef.current.length > 0) {
          queueTimerRef.current = setTimeout(showNext, 3000);
        } else {
          queueTimerRef.current = null;
        }
      };
      showNext();
    };
    startQueue();
  }, [state.challengeProgress, state.totalXP, state.streak, hasHydrated, userId]);

  // 4. PROGRESS SYNC
  useEffect(() => {
    if (!userId || loadingRef.current || !hasHydrated) return;

    const challengesArr = Object.entries(state.challengeProgress);
    if (challengesArr.length === 0) return;

    const syncAllProgress = async () => {
      const dataToSync = challengesArr.map(([id, prog]) => ({
        user_id: userId,
        challenge_id: id,
        completed: prog.completed,
        attempts: prog.attempts,
        hints_used: prog.hintsUsed,
        best_score: prog.bestScore,
        best_chars: prog.bestChars,
        completed_at: prog.completedAt
          ? new Date(prog.completedAt).toISOString()
          : null,
      }));

      const { error } = await supabase
        .from("challenge_progress")
        .upsert(dataToSync, { onConflict: "user_id,challenge_id" });

      if (error) console.error("Erro ao sincronizar progresso:", error);
    };

    syncAllProgress();
  }, [state.challengeProgress, hasHydrated, userId]);

  // Actions
  const resetAllProgress = async () => {
    if (!userId) return;
    try {
      loadingRef.current = true;
      setIsLoading(true);

      const [progressRes, achievementsRes] = await Promise.all([
        supabase
          .from("challenge_progress")
          .delete()
          .eq("user_id", userId)
          .select("challenge_id"),
        supabase
          .from("user_achievements")
          .delete()
          .eq("user_id", userId)
          .select("achievement_id"),
      ]);

      if (progressRes.error) throw progressRes.error;
      if (achievementsRes.error) throw achievementsRes.error;

      const profileRes = await supabase
        .from("profiles")
        .update({
          total_xp: 0,
          streak: 0,
          equipped_title: null,
          has_seen_tutorial: false,
          has_seen_world_tour: false,
          has_seen_profile_tour: false,
          has_seen_arena_tour: false,
          last_played_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileRes.error) throw profileRes.error;

      // Clear local storage notifications
      const storageKeyUnlock = `python_quest_notified_worlds_${userId}`;
      const storageKeyNotif = `python_quest_completed_worlds_notif_${userId}`;
      localStorage.removeItem(storageKeyUnlock);
      localStorage.removeItem(storageKeyNotif);

      persistSnapshot(userId, {
        state: INITIAL_STATE,
        purchasedWorlds,
      });
      toast.success("Seu progresso foi totalmente zerado!");
      await refreshGameData();
    } catch (err) {
      console.error(err);
      toast.error("Falha ao zerar progresso.");
      loadingRef.current = false;
      setIsLoading(false);
    }
  };

  const resetWorldProgress = async (worldId: string) => {
    if (!userId) return;
    try {
      loadingRef.current = true;
      setIsLoading(true);
      const world = WORLDS.find(w => w.id === worldId);
      if (!world) return;

      const challengeIds = world.challenges.map(c => c.id);

      const { error } = await supabase
        .from("challenge_progress")
        .delete()
        .eq("user_id", userId)
        .in("challenge_id", challengeIds);

      if (error) throw error;

      const newProgress = { ...state.challengeProgress };
      challengeIds.forEach(id => delete newProgress[id]);

      const newTotalXP = Object.values(newProgress).reduce(
        (sum, p) => sum + (p.bestScore || 0),
        0
      );

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ total_xp: newTotalXP })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Clear local storage notifications for this specific world
      const storageKeyUnlock = `python_quest_notified_worlds_${userId}`;
      const storageKeyNotif = `python_quest_completed_worlds_notif_${userId}`;
      
      const clearWorldFromStorage = (key: string) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const ids = JSON.parse(raw) as string[];
            const filtered = ids.filter(id => id !== worldId);
            localStorage.setItem(key, JSON.stringify(filtered));
          } catch (e) {}
        }
      };

      clearWorldFromStorage(storageKeyUnlock);
      clearWorldFromStorage(storageKeyNotif);

      toast.success(`Progresso do mundo "${world.title}" zerado.`);
      await refreshGameData();
    } catch (err) {
      console.error(err);
      toast.error("Falha ao zerar progresso do mundo.");
      loadingRef.current = false;
      setIsLoading(false);
    }
  };

  // Helper Methods
  const getPlayerLevel = () => calculatePlayerLevel(state.totalXP);
  const isWorldUnlocked = (id: string) =>
    getWorldUnlockStatus(id, state.totalXP, state.isDevMode, purchasedWorlds);
  const isChallengeCompleted = (id: string) =>
    state.challengeProgress[id]?.completed ?? false;
  const isBossDefeated = (bossId: string) =>
    state.bossProgress?.[bossId]?.defeated ?? false;
  const isBossUnlocked = (worldId: string) => {
    if (state.isDevMode) return true;
    const world = WORLDS.find((w) => w.id === worldId);
    if (!world?.boss) return false;
    const total = world.challenges.length;
    if (total === 0) return false;
    const completed = world.challenges.filter((c) =>
      isChallengeCompleted(c.id)
    ).length;
    return completed / total >= world.boss.unlockThreshold;
  };
  const getCompletedCount = () =>
    Object.values(state.challengeProgress).filter(p => p.completed).length;
  const getTotalChallenges = () => WORLDS.flatMap(w => w.challenges).length;

  useEffect(() => {
    soundManager.enabled = !state.isMuted;
  }, [state.isMuted]);

  // 5. GUEST PERSISTENCE (localStorage fallback)
  useEffect(() => {
    if (!userId && hasHydrated) {
      persistSnapshot(undefined, { state, purchasedWorlds });
    }
  }, [state, purchasedWorlds, userId, hasHydrated]);

  return (
    <GameContext.Provider
      value={{
        state,
        isLoading,
        hasHydrated,
        loadError,
        dispatch,
        getPlayerLevel,
        isWorldUnlocked,
        isChallengeCompleted,
        isBossDefeated,
        isBossUnlocked,
        getCompletedCount,
        getTotalChallenges,
        refreshGameData,
        resetAllProgress,
        resetWorldProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
