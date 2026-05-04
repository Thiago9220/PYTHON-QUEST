import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Lightbulb, RotateCcw, Star, X, Book, HelpCircle, Trophy } from "lucide-react";
import { VolumeControl } from "@/components/VolumeControl";
import { Button } from "@/components/ui/button";
import PythonEditor from "@/components/PythonEditor";
import { Codex } from "@/components/Codex";
import { AchievementsModal } from "@/components/AchievementsModal";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { getChallengeById, getWorldById } from "@/lib/challenges";
import { DialogueCutscene } from "@/components/DialogueCutscene";
import { AnswerRevealModal } from "@/components/AnswerRevealModal";
import { toast } from "sonner";
import { soundManager } from "@/lib/sounds";

// Refactored Hooks & Components
import { useChallengeEngine } from "@/hooks/useChallengeEngine";
import { MissionPanel } from "./GameArenaComponents/MissionPanel";
import { ResultPanel } from "./GameArenaComponents/ResultPanel";
import { ArenaTutorial } from "./GameArenaComponents/ArenaTutorial";

const DIFFICULTY_LABELS = {
  iniciante: { label: "Iniciante", color: "text-emerald-400 bg-emerald-900/20 border-emerald-700/30" },
  intermediário: { label: "Intermediário", color: "text-amber-400 bg-amber-900/20 border-amber-700/30" },
  avançado: { label: "Avançado", color: "text-red-400 bg-red-900/20 border-red-700/30" },
  épico: { label: "Épico", color: "text-purple-400 bg-purple-900/20 border-purple-700/30" },
  lendário: { label: "Lendário!", color: "text-fuchsia-400 bg-fuchsia-900/20 border-fuchsia-700/30 shadow-[0_0_10px_rgba(217,70,239,0.3)]" },
};

type Props = {
  challengeId: string;
  onBack: () => void;
  onBackToHome: () => void;
  onNext: (nextId: string | null) => void;
};

const DEV_EMAILS = ["thiago.ramos356@gmail.com"];

export default function GameArena({ challengeId, onBack, onBackToHome, onNext }: Props) {
  const { state: gameState, dispatch, isChallengeCompleted } = useGame();
  const { user } = useAuth();
  const isDev = !!user?.email && DEV_EMAILS.includes(user.email.toLowerCase());
  const challenge = getChallengeById(challengeId);
  const world = challenge ? getWorldById(challenge.worldId) : null;

  // Custom Engine Hook
  const engine = useChallengeEngine(challenge ?? null, dispatch, isChallengeCompleted);

  // Local UI State
  const [activeTab, setActiveTab] = useState<"mission" | "schema" | "concept">("mission");
  const [activeSamples, setActiveSamples] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const alreadyCompleted = isChallengeCompleted(challengeId);
  const [showCodex, setShowCodex] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showArenaTutorial, setShowArenaTutorial] = useState(
    () => localStorage.getItem("hasSeenArenaTutorial") !== "true"
  );
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [hasNotifiedStruggle, setHasNotifiedStruggle] = useState(false);

  // Reset scroll on mount or challenge change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [challengeId]);

  // Pré-carrega a imagem do modal de conclusão do mundo atual (evita atraso ao abrir)
  useEffect(() => {
    if (!world?.id) return;
    const img = new Image();
    img.src = `/modals/${world.id}.webp`;
  }, [world?.id]);

  // Shortcut Ctrl+Enter
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

  // Monitor de Dificuldade (Tentativas frustradas)
  useEffect(() => {
    if (engine.attempts >= 5 && !engine.isCorrect && !hasNotifiedStruggle) {
      toast("Está com dificuldades neste enigma?", {
        description: "As páginas do destino podem ser reveladas agora.",
        action: {
          label: "Ver Resposta",
          onClick: () => setShowAnswerModal(true)
        },
        duration: 8000,
      });
      setHasNotifiedStruggle(true);
    }
    // Reset notification if challenge changes
    if (engine.attempts === 0) {
      setHasNotifiedStruggle(false);
    }
  }, [engine.attempts, engine.isCorrect, hasNotifiedStruggle]);

  if (!challenge || !world) return null;

  const diffStyle = DIFFICULTY_LABELS[challenge.difficulty];
  const xpEarned = Math.max(0, challenge.xpReward - engine.hintsUsed * 10);
  const challengeIndex = world.challenges.findIndex((c: any) => c.id === challengeId);
  const challengeNumber = challengeIndex + 1;
  const totalChallenges = world.challenges.length;

  return (
    <div className="min-h-screen bg-[#0d0b08] text-amber-100 flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      {world.bgImage && (
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url(${world.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px) saturate(0.8)'
          }}
        />
      )}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0d0b08] via-[#0d0b08]/90 to-transparent pointer-events-none" />

      {/* Header */}
      <header id="tutorial-header" className="flex-shrink-0 border-b border-amber-900/30 bg-[#0d0b08]/80 backdrop-blur-md z-10 relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div 
              className="flex items-center gap-2 cursor-pointer group/logo mr-2 border-r border-amber-900/40 pr-3"
              onClick={onBackToHome}
              title="Voltar ao Início"
            >
              <span
                className="text-lg font-bold text-amber-400 group-hover/logo:text-amber-200 transition-colors"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                SQL Quest
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={onBack} className="text-amber-500 hover:text-amber-300 pl-0">
              <ArrowLeft className="w-4 h-4 mr-1 shrink-0" />
              <span className="truncate max-w-[150px] md:max-w-none">{world.title}</span>
            </Button>
            <span className="text-amber-800/40 hidden md:inline">/</span>
            <span className="text-amber-300 text-sm font-medium w-full md:w-auto">{challenge.title}</span>
            <span className="text-xs font-mono text-amber-600/60 bg-amber-900/20 border border-amber-800/30 rounded-full px-2 py-0.5 hidden md:inline">
              {challengeNumber}/{totalChallenges}
            </span>
          </div>

          <div id="tutorial-stats" className="flex flex-wrap items-center gap-3 shrink-0">
            <span className={`text-xs px-2 md:px-2.5 py-0.5 md:py-1 rounded-full border font-mono ${diffStyle.color}`}>
              {diffStyle.label}
            </span>
            <span className="text-xs font-mono text-amber-600/70">⭐ {xpEarned} XP</span>
            {alreadyCompleted && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Star className="w-3 h-3 fill-emerald-400" /> Concluído
              </span>
            )}
            
            <button 
              onClick={() => setShowAchievements(true)}
              className="flex items-center gap-1.5 text-amber-500/60 hover:text-amber-400 hover:bg-amber-900/20 px-2 py-1 rounded-lg transition-all border border-transparent hover:border-amber-900/40 group/ach"
              title="Ver Conquistas"
            >
              <Trophy className="w-3.5 h-3.5 group-hover/ach:rotate-12 transition-transform" />
              <span className="text-xs font-mono font-bold">
                {gameState.achievements.filter(a => a.unlocked).length}/{gameState.achievements.length}
              </span>
            </button>

            <div className="flex items-center gap-2 border-l border-amber-900/30 ml-2 pl-4">
              <VolumeControl
                isMuted={gameState.isMuted}
                onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowArenaTutorial(true)}
                className="text-amber-600/60 hover:text-amber-400 hover:bg-amber-900/20 w-8 h-8"
                title="Repetir Tutorial"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCodex(true)}
                className="text-amber-600/60 hover:text-amber-400 hover:bg-amber-900/20 w-8 h-8"
                title="Abrir Códice"
              >
                <Book className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workbench */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 py-4 gap-4 relative z-10 transition-all duration-300">
        {!isExpanded && (
          <div className="flex-1 flex flex-col gap-4 min-w-0 transition-all duration-300">
            <MissionPanel 
              world={world} challenge={challenge} activeTab={activeTab} 
              setActiveTab={setActiveTab} activeSamples={activeSamples} 
              setActiveSamples={setActiveSamples} db={engine.db} 
            />

            <div id="tutorial-editor" className="bg-[#1c1917]/90 backdrop-blur-sm border border-amber-900/30 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-amber-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={engine.handleReset} className="text-amber-700/60 hover:text-amber-400 h-7 px-2">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  {challenge.hints.length > 0 && engine.currentHintIdx < challenge.hints.length && (
                    <Button variant="ghost" size="sm" onClick={engine.handleHint} className="text-amber-600/70 hover:text-amber-400 h-7 px-2 text-xs gap-1">
                      <Lightbulb className="w-3.5 h-3.5" /> Dica
                    </Button>
                  )}
                  {engine.attempts >= 5 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAnswerModal(true)} 
                      className="text-orange-500/80 hover:text-orange-400 h-7 px-2 text-xs gap-1 animate-pulse"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Revelar Resposta
                    </Button>
                  )}
                </div>
              </div>

              <PythonEditor value={engine.code} onChange={engine.setCode} disabled={!engine.pythonReady} />

              <AnimatePresence>
                {engine.showHint && engine.currentHintIdx > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-amber-900/30 px-4 py-3 bg-amber-950/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm text-amber-500/70 font-mono">Dica {engine.currentHintIdx}:</span>
                          <p className="text-amber-300 text-sm md:text-base mt-0.5">{challenge.hints[engine.currentHintIdx - 1]?.text}</p>
                        </div>
                      </div>
                      <button onClick={() => engine.setShowHint(false)} className="text-amber-700/50 hover:text-amber-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="px-3 md:px-4 py-3 border-t border-amber-900/30 flex flex-wrap items-center justify-between gap-2">
                <span className="hidden sm:inline text-sm font-mono text-amber-800/50 truncate">{!engine.pythonReady ? "Inicializando..." : "Ctrl+Enter para executar"}</span>
                <span className="sm:hidden text-xs font-mono text-amber-800/50 truncate">{!engine.pythonReady ? "Inicializando..." : ""}</span>
                <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                  {isDev && challenge?.expectedSQL && (
                    <Button
                      onClick={() => engine.setCode(challenge.expectedSQL)}
                      variant="outline"
                      className="border-fuchsia-700/60 bg-fuchsia-950/30 hover:bg-fuchsia-900/40 text-fuchsia-200 font-mono text-xs gap-1.5 h-10 md:h-11"
                      title="DEV: preencher editor com a resposta esperada"
                    >
                      🛠 Resposta
                    </Button>
                  )}
                  <Button onClick={engine.handleRun} disabled={!engine.pythonReady || engine.isRunning || !engine.code.trim() || engine.isCorrect === true} className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-extrabold gap-2 px-4 md:px-6 h-10 md:h-11 text-sm md:text-base">
                    <Play className="w-4 h-4" /> {engine.isRunning ? "Executando..." : engine.isCorrect ? "Correto ✓" : "Executar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ResultPanel 
          isExpanded={isExpanded} setIsExpanded={setIsExpanded} 
          result={engine.result} isCorrect={engine.isCorrect} 
          feedback={engine.feedback} liveError={engine.liveError} 
          attempts={engine.attempts} hintsUsed={engine.hintsUsed} xpEarned={xpEarned} 
          onNext={() => {
            const idx = world.challenges.findIndex(c => c.id === challengeId);
            onNext(world.challenges[idx + 1]?.id ?? null);
          }}
          onBack={onBack}
          hasNextChallenge={
            world.challenges.findIndex(c => c.id === challengeId) >= 0 && 
            world.challenges.findIndex(c => c.id === challengeId) < world.challenges.length - 1
          }
        />
      </div>

      {/* Story Cutscene */}
      <AnimatePresence>
        {engine.showCutscene && challenge.successStory && (
          <DialogueCutscene
            npc={challenge.successNpc ?? "Mensageiro"}
            avatar={challenge.successAvatar ?? "🧙‍♂️"}
            text={challenge.successStory}
            onComplete={() => engine.completeCutscene()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showArenaTutorial && (
          <ArenaTutorial
            onComplete={() => {
              localStorage.setItem("hasSeenArenaTutorial", "true");
              setShowArenaTutorial(false);
            }}
            onSwitchTab={setActiveTab}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAchievements && (
          <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
        )}
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
            expectedSQL={challenge.expectedSQL}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
