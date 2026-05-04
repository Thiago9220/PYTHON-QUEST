import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { initPython, runPythonCode, validatePythonChallenge, type PythonResult } from "@/lib/pythonEngine";
import { soundManager } from "@/lib/sounds";
import confetti from "canvas-confetti";
import { Challenge } from "@/lib/types";

type EngineState = {
  pythonReady: boolean;
  code: string;
  result: PythonResult | null;
  isCorrect: boolean | null;
  feedback: string;
  liveError: string | null;
  hintsUsed: number;
  attempts: number;
  showHint: boolean;
  currentHintIdx: number;
  showSuccess: boolean;
  showCutscene: boolean;
  isRunning: boolean;
  wasAlreadyCompleted: boolean;
};

export function useChallengeEngine(challenge: Challenge | null, dispatch: any, isChallengeCompleted: (id: string) => boolean) {
  const [state, setState] = useState<EngineState>({
    pythonReady: false,
    code: challenge?.starterCode ?? "",
    result: null,
    isCorrect: null,
    feedback: "",
    liveError: null,
    hintsUsed: 0,
    attempts: 0,
    showHint: false,
    currentHintIdx: 0,
    showSuccess: false,
    showCutscene: false,
    isRunning: false,
    wasAlreadyCompleted: challenge ? isChallengeCompleted(challenge.id) : false,
  });

  const confettiFiredRef = useRef<string | null>(null);

  // Sync code with challenge change
  useEffect(() => {
    confettiFiredRef.current = null;
    setState(prev => ({
      ...prev,
      code: challenge?.starterCode ?? "",
      result: null,
      isCorrect: null,
      feedback: "",
      liveError: null,
      hintsUsed: 0,
      attempts: 0,
      showHint: false,
      currentHintIdx: 0,
      showSuccess: false,
      showCutscene: false,
      wasAlreadyCompleted: challenge ? isChallengeCompleted(challenge.id) : false,
    }));
  }, [challenge?.id]);

  // Init Engine
  useEffect(() => {
    async function init() {
      try {
        await initPython();
        setState(prev => ({ ...prev, pythonReady: true }));
      } catch (err) {
        toast.error("Erro ao inicializar o motor Python");
      }
    }
    init();
  }, []);

  const handleRun = useCallback(async () => {
    if (!challenge || state.isRunning) return;
    
    setState(prev => ({ ...prev, isRunning: true, isCorrect: null }));
    
    try {
      const validation = await validatePythonChallenge(state.code, challenge);
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        isCorrect: validation.correct,
        feedback: validation.feedback,
        attempts: prev.attempts + 1
      }));

      if (validation.correct) {
        soundManager.play("success");
        if (confettiFiredRef.current !== challenge.id) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#3b82f6", "#60a5fa", "#93c5fd"]
          });
          confettiFiredRef.current = challenge.id;
        }
        
        if (!state.wasAlreadyCompleted) {
          dispatch({ 
            type: "COMPLETE_CHALLENGE", 
            payload: { challengeId: challenge.id, xp: challenge.xpReward } 
          });
        }
        
        setTimeout(() => {
          setState(prev => ({ ...prev, showSuccess: true, showCutscene: true }));
        }, 1000);
      } else {
        soundManager.play("error");
      }
    } catch (err) {
      setState(prev => ({ ...prev, isRunning: false, feedback: "Erro ao executar o código." }));
    }
  }, [challenge, state.code, state.isRunning, state.wasAlreadyCompleted, dispatch]);

  return {
    ...state,
    setCode: (code: string) => setState(prev => ({ ...prev, code })),
    handleRun,
    setShowHint: (show: boolean) => setState(prev => ({ ...prev, showHint: show })),
    nextHint: () => setState(prev => ({ ...prev, currentHintIdx: Math.min(prev.currentHintIdx + 1, (challenge?.hints.length ?? 1) - 1) })),
    closeSuccess: () => setState(prev => ({ ...prev, showSuccess: false })),
    closeCutscene: () => setState(prev => ({ ...prev, showCutscene: false })),
  };
}
