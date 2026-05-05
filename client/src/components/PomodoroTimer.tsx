import { useState } from "react";
import { Timer, Play, Pause, RotateCcw, X, Coffee, Brain, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      <motion.button
        id="tutorial-pomodoro"
        type="button"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 ${
          justCompleted
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 animate-pulse"
            : "border-white/10 bg-slate-900/80 text-sky-400 hover:border-white/20 hover:text-sky-300"
        }`}
        title={justCompleted ? "Sessão concluída — abra para ver" : "Abrir Pomodoro"}
      >
        <Timer className="h-4 w-4" />
        {(isRunning || justCompleted) && (
          <span className="font-mono text-[10px] font-black tracking-widest uppercase">
            {justCompleted ? "Descansar!" : formatPomodoroTime(secondsLeft)}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        id="tutorial-pomodoro"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-72 rounded-3xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${mode === "focus" ? "bg-sky-500/10 text-sky-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              <ModeIcon className="h-4 w-4" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">
              Pomodoro
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-slate-500 hover:text-white transition-colors"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {justCompleted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center"
          >
            <Trophy className="mx-auto mb-3 h-8 w-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
            <p className="mb-1 text-base font-black text-white uppercase tracking-tight">
              Sessão Concluída!
            </p>
            <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
              {isBreak
                ? "Sua determinação é inabalável. Hora de retomar o código."
                : "Você manteve o foco. Respire fundo e recupere suas energias."}
            </p>
            <button
              type="button"
              onClick={dismissCompletion}
              className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-emerald-900/20"
            >
              Continuar
            </button>
          </motion.div>
        ) : (
          <>
            <div className="mb-4 flex gap-1 rounded-xl border border-white/5 bg-slate-950/50 p-1">
              {(Object.keys(POMODORO_DURATIONS) as PomodoroMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                    mode === m
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {POMODORO_LABELS[m]}
                </button>
              ))}
            </div>

            <div className="mb-5 text-center">
              <div
                className={`font-mono text-5xl font-black tracking-tighter mb-2 ${
                  mode === "focus" ? "text-sky-400" : "text-emerald-400"
                }`}
              >
                {formatPomodoroTime(secondsLeft)}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                <motion.div
                  className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.2)] ${
                    mode === "focus" ? "bg-sky-500" : "bg-emerald-500"
                  }`}
                  animate={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            <div className="mb-4 flex gap-3">
              <button
                type="button"
                onClick={toggleRun}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                  isRunning
                    ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    : "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-900/40"
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
                className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                title="Reiniciar"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Sessões de Foco</span>
          <span className="text-[10px] font-black text-sky-400 font-mono">{completedFocus}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
