import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { soundManager } from "@/lib/sounds";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

export const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const POMODORO_LABELS: Record<PomodoroMode, string> = {
  focus: "Foco",
  shortBreak: "Pausa Curta",
  longBreak: "Pausa Longa",
};

const STORAGE_KEY = "sqlquest.pomodoro.sessions";

type PomodoroContextValue = {
  mode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  completedFocus: number;
  justCompleted: boolean;
  toggleRun: () => void;
  reset: () => void;
  switchMode: (mode: PomodoroMode) => void;
  dismissCompletion: () => void;
};

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef(mode);
  const completedFocusRef = useRef(completedFocus);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    completedFocusRef.current = completedFocus;
    localStorage.setItem(STORAGE_KEY, String(completedFocus));
  }, [completedFocus]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handleComplete = () => {
    setIsRunning(false);
    setJustCompleted(true);
    soundManager.playAchievement();

    const currentMode = modeRef.current;
    if (currentMode === "focus") {
      const next = completedFocusRef.current + 1;
      setCompletedFocus(next);
      const nextMode: PomodoroMode = next % 4 === 0 ? "longBreak" : "shortBreak";
      toast.success("É hora de descansar, guerreiro!", {
        description: `Você concluiu uma sessão de foco. Tempo para ${
          nextMode === "longBreak" ? "uma pausa longa" : "uma pausa curta"
        }.`,
      });
      setMode(nextMode);
      setSecondsLeft(POMODORO_DURATIONS[nextMode]);
    } else {
      toast.success("Pausa concluída!", {
        description: "Volte ao foco quando estiver pronto, guerreiro.",
      });
      setMode("focus");
      setSecondsLeft(POMODORO_DURATIONS.focus);
    }
  };

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setSecondsLeft(POMODORO_DURATIONS[newMode]);
    setIsRunning(false);
    setJustCompleted(false);
  };

  const toggleRun = () => {
    setJustCompleted(false);
    setIsRunning((r) => !r);
  };

  const reset = () => {
    setSecondsLeft(POMODORO_DURATIONS[modeRef.current]);
    setIsRunning(false);
    setJustCompleted(false);
  };

  const dismissCompletion = () => setJustCompleted(false);

  return (
    <PomodoroContext.Provider
      value={{
        mode,
        secondsLeft,
        isRunning,
        completedFocus,
        justCompleted,
        toggleRun,
        reset,
        switchMode,
        dismissCompletion,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error("usePomodoro must be used within PomodoroProvider");
  return ctx;
}

export function formatPomodoroTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
