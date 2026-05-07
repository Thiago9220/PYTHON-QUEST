import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowLeft, 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  Play, 
  RotateCcw, 
  Star, 
  Trophy,
  Zap,
  Terminal
} from "lucide-react";
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
  iniciante: { label: "Iniciante", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  intermediario: { label: "Intermediário", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  avancado: { label: "Avançado", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  epico: { label: "Épico", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  lendario: { label: "Lendário", color: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20" },
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
    const today = new Date().toISOString().split("T")[0];
    const isNewDay = gameState.lastStudyAnswerDate !== today;
    const currentUses = isNewDay ? 0 : gameState.studyAnswerUses;
    const remainingUses = Math.max(0, 3 - currentUses);

    if (engine.attempts >= 5 && !engine.isCorrect && !hasNotifiedStruggle) {
      if (remainingUses > 0) {
        toast("Quer comparar com uma resposta?", {
          description: `Você tem ${remainingUses} usos de estudo restantes hoje.`,
          action: { label: "Ver", onClick: () => setShowAnswerModal(true) },
          duration: 8000,
        });
      } else {
        toast("Limite de estudos atingido", {
          description: "Você já usou suas 3 consultas diárias. Tente novamente amanhã ou use as dicas!",
          duration: 8000,
        });
      }
      setHasNotifiedStruggle(true);
    }
    if (engine.attempts === 0) setHasNotifiedStruggle(false);
  }, [engine.attempts, engine.isCorrect, hasNotifiedStruggle, gameState.studyAnswerUses, gameState.lastStudyAnswerDate]);

  if (!challenge || !world) return null;

  const diffStyle = DIFFICULTY_LABELS[challenge.difficulty];
  const xpEarned = Math.max(0, challenge.xpReward - engine.hintsUsed * 10);
  const challengeIndex = world.challenges.findIndex((c) => c.id === challengeId);
  const challengeNumber = challengeIndex + 1;
  const totalChallenges = world.challenges.length;
  const themeColor = world.color || "#0ea5e9";
  const answerCode = challenge.solution ?? challenge.hints[challenge.hints.length - 1]?.text ?? challenge.expectedOutput;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden selection:bg-sky-500/30">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 20% 30%, ${themeColor}33, transparent 50%), radial-gradient(circle at 80% 70%, ${themeColor}22, transparent 50%)` 
          }} 
        />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <header className="flex-shrink-0 border-b border-white/10 bg-slate-950/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <button className="group flex items-center gap-3" onClick={onBackToHome}>
              <div className="h-8 w-8 rounded-xl bg-sky-500 flex items-center justify-center text-white font-black text-xs shadow-[0_0_15px_rgba(14,165,233,0.5)] group-hover:scale-110 transition-transform">PY</div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-sky-400 transition-colors">Python Protocol</span>
            </button>
            
            <div className="h-6 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onBack} className="h-9 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 font-bold transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {world.title}
              </Button>
              <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                <span className="text-white text-sm font-black tracking-tight">{challenge.title}</span>
                <span className="text-[9px] font-black text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 uppercase tracking-widest">
                  {challengeNumber} / {totalChallenges}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <span className={`text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border font-black ${diffStyle.color}`}>
                {diffStyle.label}
              </span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{xpEarned} XP</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAchievements(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-xl transition-all border border-white/10 group backdrop-blur-md"
              >
                <Trophy className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-black text-white">
                  {gameState.achievements.filter((a) => a.unlocked).length}/{gameState.achievements.length}
                </span>
              </button>
              
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                <VolumeControl isMuted={gameState.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
                <Button variant="ghost" size="icon" onClick={() => setShowCodex(true)} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 relative z-10 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 py-4 gap-4">
        {!isExpanded && (
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <MissionPanel 
              challenge={challenge} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              themeColor={world?.color} 
              hintsUsed={engine.hintsUsed}
            />

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 bg-slate-900/60 border border-white/10 rounded-[1.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(14,165,233,0.15)] flex flex-col backdrop-blur-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-white/5 bg-slate-900/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                    <Terminal className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Câmara de Código</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Reforje sua lógica no terminal</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={engine.handleReset} className="text-slate-400 hover:text-white hover:bg-white/5 h-10 px-4 rounded-xl font-bold transition-all border border-transparent hover:border-white/10">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar
                  </Button>
                  {challenge.hints.length > 0 && engine.currentHintIdx < challenge.hints.length && (
                    <Button variant="ghost" size="sm" onClick={engine.handleHint} className="text-amber-400 bg-amber-400/5 hover:bg-amber-400/10 border border-amber-400/20 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Pedir Dica ({engine.currentHintIdx + 1}/{challenge.hints.length})
                    </Button>
                  )}
                  {engine.attempts >= 5 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        const isNewDay = gameState.lastStudyAnswerDate !== today;
                        const currentUses = isNewDay ? 0 : gameState.studyAnswerUses;
                        if (currentUses >= 3) {
                          toast.error("Limite diário atingido", {
                            description: "Você já revelou 3 respostas hoje. Tente resolver sozinho ou use as dicas!"
                          });
                          return;
                        }
                        setShowAnswerModal(true);
                      }} 
                      className="text-sky-400 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-400/10 transition-all"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" /> Resposta
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={engine.handleRun}
                    disabled={!engine.pythonReady || engine.isRunning || !engine.code.trim() || engine.isCorrect === true}
                    className="bg-sky-600 hover:bg-sky-500 h-10 px-6 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-sky-900/20 transition-all active:scale-95 disabled:bg-white/5 disabled:text-slate-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {engine.isRunning ? "PROJETANDO..." : engine.isCorrect ? "SISTEMA COMPROMETIDO" : "EXECUTAR"}
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
            </motion.div>
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
          wasAlreadyCompleted={engine.wasAlreadyCompleted}
        />
      </div>

      <AnimatePresence>
        {engine.showCutscene && challenge.successStory && (
          <DialogueCutscene
            npc={challenge.successNpc ?? "Mentor Aurora"}
            avatar={challenge.successAvatar ?? "PY"}
            text={challenge.successStory}
            themeColor={themeColor}
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
          <AnswerRevealModal 
            isOpen={showAnswerModal} 
            onClose={() => setShowAnswerModal(false)} 
            onConfirm={() => {
              engine.setUsedStudyAnswer(true);
              dispatch({ type: "USE_STUDY_ANSWER" });
            }}
            expectedCode={answerCode} 
            remainingUses={Math.max(0, 3 - (gameState.lastStudyAnswerDate === new Date().toISOString().split("T")[0] ? gameState.studyAnswerUses : 0))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
