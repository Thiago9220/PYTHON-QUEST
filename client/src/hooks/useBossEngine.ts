import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  initPython,
  runBossExecution,
  BossObjectiveResult,
} from "@/lib/pythonEngine";
import { soundManager } from "@/lib/sounds";
import { BossChallenge } from "@/lib/types";

export type BossEngineState = {
  pythonReady: boolean;
  currentActIndex: number;
  actCodes: string[];
  output: string;
  isRunning: boolean;
  objectiveResults: BossObjectiveResult[];
  actCompletions: boolean[];
  hintsUsed: number;
  currentHintIdx: number;
  startedAt: number;
  defeated: boolean;
  feedback: string;
};

export function useBossEngine(
  boss: BossChallenge | null,
  dispatch: any,
  isBossDefeated: (id: string) => boolean
) {
  const [state, setState] = useState<BossEngineState>(() => ({
    pythonReady: false,
    currentActIndex: 0,
    actCodes: boss ? boss.acts.map((a) => a.starterHint ?? "") : [],
    output: "",
    isRunning: false,
    objectiveResults: [],
    actCompletions: boss ? boss.acts.map(() => false) : [],
    hintsUsed: 0,
    currentHintIdx: 0,
    startedAt: Date.now(),
    defeated: boss ? isBossDefeated(boss.id) : false,
    feedback: "",
  }));

  const lastBossIdRef = useRef<string | null>(null);
  const dispatchedRef = useRef(false);

  // Reset state when boss changes
  useEffect(() => {
    if (boss?.id && lastBossIdRef.current !== boss.id) {
      lastBossIdRef.current = boss.id;
      dispatchedRef.current = false;
      setState({
        pythonReady: state.pythonReady,
        currentActIndex: 0,
        actCodes: boss.acts.map((a) => a.starterHint ?? ""),
        output: "",
        isRunning: false,
        objectiveResults: [],
        actCompletions: boss.acts.map(() => false),
        hintsUsed: 0,
        currentHintIdx: 0,
        startedAt: Date.now(),
        defeated: isBossDefeated(boss.id),
        feedback: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boss?.id]);

  // Initialize Python
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        await initPython();
        if (!cancelled) {
          setState((s) => ({ ...s, pythonReady: true }));
        }
      } catch {
        toast.error("Erro ao inicializar o motor Python");
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const setActCode = useCallback((index: number, code: string) => {
    setState((s) => {
      const next = [...s.actCodes];
      next[index] = code;
      return { ...s, actCodes: next };
    });
  }, []);

  const handleRun = useCallback(async () => {
    if (!boss || state.isRunning) return;

    setState((s) => ({ ...s, isRunning: true, output: "", feedback: "" }));

    const idx = state.currentActIndex;
    const acts = boss.acts;

    // Acumula setupCode de TODOS os atos até o atual
    const accumulatedSetup = acts
      .slice(0, idx + 1)
      .map((a) => a.setupCode)
      .join("\n");

    // Acumula código do aluno de todos os atos até o atual
    const accumulatedUserCode = state.actCodes
      .slice(0, idx + 1)
      .join("\n");

    const currentObjectives = acts[idx].objectives;

    const result = await runBossExecution(
      accumulatedSetup,
      accumulatedUserCode,
      currentObjectives
    );

    const allPassed =
      result.success && result.results.every((r) => r.passed);

    setState((s) => {
      const nextCompletions = [...s.actCompletions];
      let nextActIndex = s.currentActIndex;
      let defeated = s.defeated;
      const advancing = allPassed && idx < acts.length - 1;

      if (allPassed) {
        nextCompletions[idx] = true;
        if (advancing) {
          nextActIndex = idx + 1;
        } else {
          defeated = true;
        }
      }

      return {
        ...s,
        isRunning: false,
        output: result.output ?? "",
        // Ao avançar de ato, limpa os resultados (são de objetivos diferentes)
        objectiveResults: advancing ? [] : result.results,
        actCompletions: nextCompletions,
        currentActIndex: nextActIndex,
        currentHintIdx: allPassed ? 0 : s.currentHintIdx,
        defeated,
        feedback: result.success
          ? allPassed
            ? advancing
              ? "Ato concluído. Avançando..."
              : "OPERAÇÃO BLACKBOX — SUCESSO TOTAL."
            : "Verifique os objetivos pendentes."
          : `Erro: ${result.error ?? "execução falhou"}`,
      };
    });

    if (result.success && allPassed) {
      soundManager.playSuccess();
      if (idx === acts.length - 1 && !dispatchedRef.current) {
        dispatchedRef.current = true;
        confetti({
          particleCount: 240,
          spread: 110,
          origin: { y: 0.6 },
          colors: ["#0ea5e9", "#22c55e", "#f97316", "#facc15", "#a855f7"],
        });
        const durationSec = Math.max(
          1,
          Math.round((Date.now() - state.startedAt) / 1000)
        );
        dispatch({
          type: "DEFEAT_BOSS",
          bossId: boss.id,
          xp: boss.xpReward,
          hintsUsed: state.hintsUsed,
          durationSec,
        });
      }
    } else if (!result.success || !allPassed) {
      soundManager.playError();
    }
  }, [
    boss,
    state.isRunning,
    state.currentActIndex,
    state.actCodes,
    state.hintsUsed,
    state.startedAt,
    dispatch,
  ]);

  const handleHint = useCallback(() => {
    if (!boss) return;
    const act = boss.acts[state.currentActIndex];
    if (!act || state.currentHintIdx >= act.hints.length) return;
    setState((s) => ({
      ...s,
      currentHintIdx: s.currentHintIdx + 1,
      hintsUsed: s.hintsUsed + 1,
    }));
  }, [boss, state.currentActIndex, state.currentHintIdx]);

  const handleReset = useCallback(() => {
    if (!boss) return;
    setState((s) => ({
      ...s,
      currentActIndex: 0,
      actCodes: boss.acts.map((a) => a.starterHint ?? ""),
      output: "",
      objectiveResults: [],
      actCompletions: boss.acts.map(() => false),
      currentHintIdx: 0,
      hintsUsed: 0,
      startedAt: Date.now(),
      defeated: false,
      feedback: "",
    }));
    dispatchedRef.current = false;
  }, [boss]);

  const markStart = useCallback(() => {
    setState((s) => ({ ...s, startedAt: Date.now() }));
  }, []);

  return {
    ...state,
    setActCode,
    handleRun,
    handleHint,
    handleReset,
    markStart,
  };
}
