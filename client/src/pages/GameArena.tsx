import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, HelpCircle, Lightbulb, Play, RotateCcw, Star, Trophy } from "lucide-react";
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
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 flex flex-col relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-200/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-100/20 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(14,165,233,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.2)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <header className="flex-shrink-0 border-b border-sky-100/50 bg-white/60 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 md:gap-5">
            <button
              className="group flex items-center gap-2"
              onClick={onBackToHome}
            >
              <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-sky-600/20 group-hover:scale-110 transition-transform">PY</div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-sky-700 to-sky-900 bg-clip-text text-transparent">Python Quest</span>
            </button>
            
            <div className="h-6 w-px bg-sky-100 hidden md:block" />

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="h-8 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-full px-4 font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {world.title}
              </Button>
              <div className="flex items-center gap-2 px-3 py-1 bg-white border border-sky-100 rounded-full shadow-sm">
                <span className="text-slate-800 text-sm font-black">{challenge.title}</span>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100/50">
                  {challengeNumber}/{totalChallenges}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 mr-2">
              <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border-2 font-black ${diffStyle.color}`}>
                {diffStyle.label}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">XP DISPONÍVEL</span>
                <span className="text-xs font-black text-slate-800">{xpEarned}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-sky-100 hidden md:block" />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAchievements(true)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all border border-sky-100 shadow-sm hover:shadow-md group"
              >
                <Trophy className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-black text-slate-700">
                  {gameState.achievements.filter((a) => a.unlocked).length}/{gameState.achievements.length}
                </span>
              </button>
              
              <div className="flex items-center gap-1 bg-white border border-sky-100 rounded-xl p-1 shadow-sm">
                <VolumeControl isMuted={gameState.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
                <Button variant="ghost" size="icon" onClick={() => setShowCodex(true)} className="h-8 w-8 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-3 py-2 gap-2">
        {!isExpanded && (
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <MissionPanel challenge={challenge} activeTab={activeTab} setActiveTab={setActiveTab} themeColor={world?.color} />

            <div className="bg-white border border-sky-100 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-sky-100 bg-white">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Editor</div>
                  <div className="text-xs text-slate-500">Ctrl+Enter tambem executa o codigo</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={engine.handleReset} className="text-slate-600 h-9 px-3">
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Resetar</span>
                  </Button>
                  {challenge.hints.length > 0 && engine.currentHintIdx < challenge.hints.length && (
                    <Button variant="outline" size="sm" onClick={engine.handleHint} className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 h-9 px-3 text-xs gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      Dica {engine.currentHintIdx + 1}/{challenge.hints.length}
                    </Button>
                  )}
                  {engine.attempts >= 5 && (
                    <Button variant="outline" size="sm" onClick={() => setShowAnswerModal(true)} className="text-sky-700 h-9 px-3 text-xs gap-1">
                      <HelpCircle className="w-4 h-4" /> Resposta
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={engine.handleRun}
                    disabled={!engine.pythonReady || engine.isRunning || !engine.code.trim() || engine.isCorrect === true}
                    className="bg-sky-600 hover:bg-sky-700 h-9 px-4 font-bold gap-1.5"
                  >
                    <Play className="w-4 h-4" />
                    {engine.isRunning ? "Executando..." : engine.isCorrect ? "Correto" : "Executar"}
                  </Button>
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
                <div className="border-t border-amber-100 px-3 py-2 bg-amber-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Dica {engine.currentHintIdx}</span>
                        <p className="text-slate-700 text-xs mt-0.5">{challenge.hints[engine.currentHintIdx - 1]?.text}</p>
                      </div>
                    </div>
                    <button onClick={() => engine.setShowHint(false)} className="text-slate-400 hover:text-slate-700 p-1">×</button>
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
            themeColor={world?.color}
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
