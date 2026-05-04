import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, HelpCircle, Lightbulb, RotateCcw, Star, Trophy } from "lucide-react";
import { VolumeControl } from "@/components/VolumeControl";
import { Button } from "@/components/ui/button";
import PythonEditor from "@/components/PythonEditor";
import { Codex } from "@/components/Codex";
import { AchievementsModal } from "@/components/AchievementsModal";
import { useGame } from "@/contexts/GameContext";
import { getChallengeById, getWorldById } from "@/lib/challenges";
import { DialogueCutscene } from "@/components/DialogueCutscene";
import { AnswerRevealModal } from "@/components/AnswerRevealModal";
import { toast } from "sonner";
import { soundManager } from "@/lib/sounds";
import { useChallengeEngine } from "@/hooks/useChallengeEngine";
import { MissionPanel } from "./GameArenaComponents/MissionPanel";
import { ResultPanel } from "./GameArenaComponents/ResultPanel";

const DIFFICULTY_LABELS = {
  iniciante: { label: "Iniciante", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  intermediario: { label: "Intermediario", color: "text-amber-700 bg-amber-50 border-amber-200" },
  avancado: { label: "Avancado", color: "text-red-700 bg-red-50 border-red-200" },
  epico: { label: "Epico", color: "text-violet-700 bg-violet-50 border-violet-200" },
  lendario: { label: "Lendario", color: "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200" },
};

type Props = {
  challengeId: string;
  onBack: () => void;
  onBackToHome: () => void;
  onNext: (nextId: string | null) => void;
};

export default function GameArena({ challengeId, onBack, onBackToHome, onNext }: Props) {
  const { state: gameState, dispatch, isChallengeCompleted } = useGame();
  const challenge = getChallengeById(challengeId);
  const world = challenge ? getWorldById(challenge.worldId) : null;
  const engine = useChallengeEngine(challenge ?? null, dispatch, isChallengeCompleted);

  const [activeTab, setActiveTab] = useState<"mission" | "concept">("mission");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [hasNotifiedStruggle, setHasNotifiedStruggle] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [challengeId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        engine.handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [engine.handleRun]);

  useEffect(() => {
    if (engine.attempts >= 5 && !engine.isCorrect && !hasNotifiedStruggle) {
      toast("Quer comparar com uma resposta?", {
        description: "Abra a resposta de estudo e volte para ajustar seu codigo.",
        action: { label: "Ver", onClick: () => setShowAnswerModal(true) },
        duration: 8000,
      });
      setHasNotifiedStruggle(true);
    }
    if (engine.attempts === 0) setHasNotifiedStruggle(false);
  }, [engine.attempts, engine.isCorrect, hasNotifiedStruggle]);

  if (!challenge || !world) return null;

  const diffStyle = DIFFICULTY_LABELS[challenge.difficulty];
  const xpEarned = Math.max(0, challenge.xpReward - engine.hintsUsed * 10);
  const challengeIndex = world.challenges.findIndex((c) => c.id === challengeId);
  const challengeNumber = challengeIndex + 1;
  const totalChallenges = world.challenges.length;
  const alreadyCompleted = isChallengeCompleted(challengeId);
  const answerCode = challenge.hints[challenge.hints.length - 1]?.text ?? challenge.expectedOutput;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 text-slate-900 flex flex-col">
      <header className="flex-shrink-0 border-b border-sky-100 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              className="text-lg font-black text-sky-700 hover:text-sky-900 transition-colors mr-2"
              onClick={onBackToHome}
              title="Voltar ao inicio"
            >
              Python Quest
            </button>
            <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-600 hover:text-sky-700">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {world.title}
            </Button>
            <span className="text-slate-300 hidden md:inline">/</span>
            <span className="text-slate-700 text-sm font-medium">{challenge.title}</span>
            <span className="text-xs font-mono text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-2 py-0.5">
              {challengeNumber}/{totalChallenges}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${diffStyle.color}`}>
              {diffStyle.label}
            </span>
            <span className="text-xs font-mono text-slate-600">{xpEarned} XP</span>
            {alreadyCompleted && (
              <span className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                <Star className="w-3 h-3 fill-emerald-500" /> Concluido
              </span>
            )}
            <button
              onClick={() => setShowAchievements(true)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-sky-700 px-2 py-1 rounded-lg transition-all border border-transparent hover:border-sky-100"
              title="Ver conquistas"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-mono font-bold">
                {gameState.achievements.filter((a) => a.unlocked).length}/{gameState.achievements.length}
              </span>
            </button>
            <VolumeControl isMuted={gameState.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
            <Button variant="ghost" size="icon" onClick={() => setShowCodex(true)} className="text-slate-600 hover:text-sky-700 w-8 h-8">
              <BookOpen className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 py-4 gap-4">
        {!isExpanded && (
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <MissionPanel challenge={challenge} activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="bg-white border border-sky-100 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-sky-100 bg-white">
                <div className="text-sm font-semibold text-slate-700">Editor</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={engine.handleReset} className="text-slate-500 hover:text-sky-700 h-8 px-2">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  {challenge.hints.length > 0 && engine.currentHintIdx < challenge.hints.length && (
                    <Button variant="ghost" size="sm" onClick={engine.handleHint} className="text-amber-700 hover:text-amber-800 h-8 px-2 text-xs gap-1">
                      <Lightbulb className="w-4 h-4" /> Dica
                    </Button>
                  )}
                  {engine.attempts >= 5 && (
                    <Button variant="ghost" size="sm" onClick={() => setShowAnswerModal(true)} className="text-sky-700 h-8 px-2 text-xs gap-1">
                      <HelpCircle className="w-4 h-4" /> Resposta
                    </Button>
                  )}
                </div>
              </div>

              <PythonEditor
                code={engine.code}
                onChange={engine.setCode}
                onRun={engine.handleRun}
                isRunning={engine.isRunning}
                pythonReady={engine.pythonReady}
              />

              {engine.showHint && engine.currentHintIdx > 0 && (
                <div className="border-t border-amber-100 px-4 py-3 bg-amber-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm text-amber-700 font-mono">Dica {engine.currentHintIdx}:</span>
                        <p className="text-slate-700 text-sm mt-0.5">{challenge.hints[engine.currentHintIdx - 1]?.text}</p>
                      </div>
                    </div>
                    <button onClick={() => engine.setShowHint(false)} className="text-slate-400 hover:text-slate-700">x</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <ResultPanel
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          output={engine.output}
          isCorrect={engine.isCorrect}
          feedback={engine.feedback}
          attempts={engine.attempts}
          hintsUsed={engine.hintsUsed}
          xpEarned={xpEarned}
          onNext={() => onNext(world.challenges[challengeIndex + 1]?.id ?? null)}
          onBack={onBack}
          hasNextChallenge={challengeIndex >= 0 && challengeIndex < world.challenges.length - 1}
        />
      </div>

      <AnimatePresence>
        {engine.showCutscene && challenge.successStory && (
          <DialogueCutscene
            npc={challenge.successNpc ?? "Mentor Aurora"}
            avatar={challenge.successAvatar ?? "PY"}
            text={challenge.successStory}
            onComplete={() => engine.closeCutscene()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAchievements && <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showCodex && (
          <Codex
            isOpen={showCodex}
            onClose={() => setShowCodex(false)}
            onSendToEditor={(code) => {
              engine.setCode(code);
              setShowCodex(false);
              soundManager.playClick();
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAnswerModal && (
          <AnswerRevealModal isOpen={showAnswerModal} onClose={() => setShowAnswerModal(false)} expectedCode={answerCode} />
        )}
      </AnimatePresence>
    </div>
  );
}
