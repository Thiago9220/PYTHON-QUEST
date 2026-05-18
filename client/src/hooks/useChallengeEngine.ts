import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { initPython, validatePythonChallenge } from "@/lib/pythonEngine";
import { soundManager } from "@/lib/sounds";
import confetti from "canvas-confetti";
import { Challenge } from "@/lib/types";

type EngineState = {
  pythonReady: boolean;
  code: string;
  output: string;
  isCorrect: boolean | null;
  feedback: string;
  hintsUsed: number;
  attempts: number;
  showHint: boolean;
  currentHintIdx: number;
  showCutscene: boolean;
  showIntroCutscene: boolean;
  isRunning: boolean;
  wasAlreadyCompleted: boolean;
  usedStudyAnswer: boolean;
};

export function useChallengeEngine(
  challenge: Challenge | null,
  dispatch: any,
  isChallengeCompleted: (id: string) => boolean
) {
  const [state, setState] = useState<EngineState>({
    pythonReady: false,
    code: challenge?.starterCode ?? "",
    output: "",
    isCorrect: null,
    feedback: "",
    hintsUsed: 0,
    attempts: 0,
    showHint: false,
    currentHintIdx: 0,
    showCutscene: false,
    showIntroCutscene: !!challenge?.introStory && (!challenge ? false : !isChallengeCompleted(challenge.id)),
    isRunning: false,
    wasAlreadyCompleted: challenge ? isChallengeCompleted(challenge.id) : false,
    usedStudyAnswer: false,
  });

  const lastChallengeIdRef = useRef<string | null>(null);
  const confettiFiredRef = useRef<string | null>(null);

  useEffect(() => {
    if (challenge?.id && lastChallengeIdRef.current !== challenge.id) {
      lastChallengeIdRef.current = challenge.id;
      confettiFiredRef.current = null;
      setState((prev) => ({
        ...prev,
        code: challenge?.starterCode ?? "",
        output: "",
        isCorrect: null,
        feedback: "",
        hintsUsed: 0,
        attempts: 0,
        showHint: false,
        currentHintIdx: 0,
        showCutscene: false,
        showIntroCutscene: !!challenge?.introStory && !isChallengeCompleted(challenge.id),
        wasAlreadyCompleted: isChallengeCompleted(challenge.id),
        usedStudyAnswer: false,
      }));
    }
  }, [challenge?.id, isChallengeCompleted, challenge?.starterCode]);

  useEffect(() => {
    async function init() {
      try {
        await initPython();
        setState((prev) => ({ ...prev, pythonReady: true }));
      } catch {
        toast.error("Erro ao inicializar o motor Python");
      }
    }
    init();
  }, []);

  const handleRun = useCallback(async () => {
    if (!challenge || state.isRunning) return;

    setState((prev) => ({ ...prev, isRunning: true, isCorrect: null }));

    try {
      const validation = await validatePythonChallenge(state.code, challenge);

      setState((prev) => ({
        ...prev,
        isRunning: false,
        output: validation.output,
        isCorrect: validation.correct,
        feedback: validation.feedback,
        attempts: prev.attempts + 1,
      }));

      if (validation.correct) {
        soundManager.playSuccess();
        if (confettiFiredRef.current !== challenge.id) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#0ea5e9", "#22c55e", "#f97316", "#facc15"],
          });
          confettiFiredRef.current = challenge.id;
        }

        if (!state.wasAlreadyCompleted) {
          dispatch({
            type: "COMPLETE_CHALLENGE",
            challengeId: challenge.id,
            xp: challenge.xpReward,
            hintsUsed: state.hintsUsed,
            attempts: state.attempts + 1,
            charCount: state.code.length,
            usedStudyAnswer: state.usedStudyAnswer,
          });
        }

        setTimeout(() => {
          setState((prev) => ({ ...prev, showCutscene: true }));
        }, 500);
      } else {
        soundManager.playError();
      }
    } catch {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        feedback: "Erro ao executar o codigo.",
      }));
    }
  }, [challenge, state.code, state.isRunning, state.wasAlreadyCompleted, state.hintsUsed, state.attempts, dispatch]);

  const handleHint = useCallback(() => {
    if (!challenge) return;
    setState((prev) => {
      const nextIdx = Math.min(prev.currentHintIdx + 1, challenge.hints.length);
      return {
        ...prev,
        showHint: true,
        currentHintIdx: nextIdx,
        hintsUsed: prev.currentHintIdx < nextIdx ? prev.hintsUsed + 1 : prev.hintsUsed,
      };
    });
  }, [challenge]);

  return {
    ...state,
    setCode: (code: string) => setState((prev) => ({ ...prev, code })),
    handleRun,
    handleReset: () =>
      setState((prev) => ({
        ...prev,
        code: challenge?.starterCode ?? "",
        output: "",
        isCorrect: null,
        feedback: "",
        showHint: false,
        currentHintIdx: 0,
        hintsUsed: 0,
        usedStudyAnswer: false,
      })),
    handleHint,
    setUsedStudyAnswer: (used: boolean) => setState((prev) => ({ ...prev, usedStudyAnswer: used })),
    setShowHint: (show: boolean) => setState((prev) => ({ ...prev, showHint: show })),
    closeCutscene: () => setState((prev) => ({ ...prev, showCutscene: false })),
    closeIntroCutscene: () => setState((prev) => ({ ...prev, showIntroCutscene: false })),
  };
}
