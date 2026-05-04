import { useState } from "react";
import { Timer, Play, Pause, RotateCcw, X, Coffee, Brain, Sparkles } from "lucide-react";
import {
  usePomodoro,
  formatPomodoroTime,
  POMODORO_DURATIONS,
  POMODORO_LABELS,
  type PomodoroMode,
} from "@/contexts/PomodoroContext";

export function PomodoroTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    mode,
    secondsLeft,
    isRunning,
    completedFocus,
    justCompleted,
    toggleRun,
    reset,
    switchMode,
    dismissCompletion,
  } = usePomodoro();

  const progress = 1 - secondsLeft / POMODORO_DURATIONS[mode];
  const ModeIcon = mode === "focus" ? Brain : Coffee;
  const isBreak = mode !== "focus";

  if (!isOpen) {
    return (
      <button
        id="tutorial-pomodoro"
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border px-3 py-2 shadow-xl shadow-black/40 backdrop-blur transition ${
          justCompleted
            ? "border-emerald-700/60 bg-emerald-950/80 text-emerald-200 animate-pulse"
            : "border-amber-900/40 bg-[#1c1917]/95 text-amber-400/80 hover:border-amber-700/60 hover:text-amber-300"
        }`}
        title={justCompleted ? "Sessão concluída — abra para ver" : "Abrir Pomodoro"}
      >
        <Timer className="h-4 w-4" />
        {(isRunning || justCompleted) && (
          <span className="font-mono text-xs">
            {justCompleted ? "Descanse!" : formatPomodoroTime(secondsLeft)}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      id="tutorial-pomodoro"
      className="fixed bottom-4 right-4 z-40 w-64 rounded-2xl border border-amber-900/40 bg-[#1c1917]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ModeIcon
            className={`h-4 w-4 ${mode === "focus" ? "text-amber-400" : "text-emerald-400"}`}
          />
          <span
            className="text-sm font-semibold text-amber-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Pomodoro
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-amber-600/60 hover:text-amber-400"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {justCompleted ? (
        <div className="mb-3 rounded-xl border border-emerald-800/50 bg-emerald-950/40 p-4 text-center">
          <Sparkles className="mx-auto mb-2 h-6 w-6 text-emerald-300" />
          <p
            className="mb-1 text-base font-bold text-emerald-200"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            É hora de descansar, guerreiro!
          </p>
          <p className="text-xs text-emerald-300/70 leading-relaxed">
            {isBreak
              ? `Sua jornada continua após ${POMODORO_LABELS[mode].toLowerCase()}.`
              : "Você completou uma sessão de foco. Respire fundo."}
          </p>
          <button
            type="button"
            onClick={dismissCompletion}
            className="mt-3 w-full rounded-lg border border-emerald-700/60 bg-emerald-900/40 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-200 hover:bg-emerald-800/40"
          >
            Continuar
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 flex gap-1 rounded-lg border border-amber-900/30 bg-black/30 p-1">
            {(Object.keys(POMODORO_DURATIONS) as PomodoroMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-md px-2 py-1 text-[10px] font-mono uppercase tracking-wide transition ${
                  mode === m
                    ? "bg-amber-900/40 text-amber-200"
                    : "text-amber-600/60 hover:text-amber-400"
                }`}
              >
                {POMODORO_LABELS[m]}
              </button>
            ))}
          </div>

          <div className="mb-3 text-center">
            <div
              className={`font-mono text-5xl font-bold tracking-wider ${
                mode === "focus" ? "text-amber-300" : "text-emerald-300"
              }`}
            >
              {formatPomodoroTime(secondsLeft)}
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/50">
              <div
                className={`h-full transition-all duration-500 ${
                  mode === "focus" ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={toggleRun}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold uppercase tracking-wide transition ${
                isRunning
                  ? "border-amber-800/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40"
                  : "border-amber-700/60 bg-amber-600 text-amber-950 hover:bg-amber-500"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" /> Pausar
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Iniciar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center rounded-lg border border-amber-900/40 bg-black/30 px-3 text-amber-500/70 hover:text-amber-300"
              title="Reiniciar"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wide text-amber-600/60">
        <span>Sessões de foco</span>
        <span className="text-amber-400">{completedFocus}</span>
      </div>
    </div>
  );
}
