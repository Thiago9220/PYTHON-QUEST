/**
 * SQL Quest — Lista de Desafios de um Mundo (Expansão 8 Mundos)
 * Design: Dark Academia / Terminal Moderno
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, CheckCircle2, Circle, Flame, Trophy, LogOut, ChevronDown, Lock, HelpCircle } from "lucide-react";
import { VolumeControl } from "@/components/VolumeControl";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { getWorldById } from "@/lib/challenges";
import { Button } from "@/components/ui/button";
import TutorialTour, { TourStep } from "@/components/TutorialTour";

import { toast } from "sonner";

const DIFFICULTY_COLORS = {
  iniciante: "text-emerald-400 bg-emerald-900/20 border-emerald-700/30",
  intermediário: "text-amber-400 bg-amber-900/20 border-amber-700/30",
  avançado: "text-red-400 bg-red-900/20 border-red-700/30",
  épico: "text-purple-400 bg-purple-900/20 border-purple-700/30",
  lendário: "text-fuchsia-400 bg-fuchsia-900/20 border-fuchsia-700/30",
};



const WORLD_GRADIENTS: Record<string, string> = {
  biblioteca: "from-amber-900 via-amber-950 to-stone-950",
  mercado: "from-orange-900 via-orange-950 to-stone-950",
  conclave: "from-slate-950 via-purple-950 to-stone-950",
  castelo: "from-purple-900 via-purple-950 to-stone-950",
  cidade: "from-cyan-900 via-cyan-950 to-stone-950",
  floresta: "from-emerald-900 via-emerald-950 to-stone-950",
  vulcao: "from-red-900 via-red-950 to-stone-950",
  observatorio: "from-indigo-900 via-indigo-950 to-stone-950",
};

const WORLD_PAGE_BACKGROUNDS: Record<string, string> = {
  biblioteca: "/biblioteca-fundo.webp",
  mercado: "/mercado-fundo.webp",
  conclave: "/conclave-fundo.webp",
  castelo: "/castelo-fundo.webp",
  cidade: "/cidade-fundo.webp",
  vulcao: "/vulcao-fundo.webp",
  observatorio: "/observatorio-fundo.webp",
  floresta: "/floresta-fundo.webp",
};

type Props = {
  worldId: string;
  onSelectChallenge: (challengeId: string) => void;
  onBack: () => void;
  onBackToHome: () => void;
  onOpenProfile: () => void;
};

export default function ChallengeList({ worldId, onSelectChallenge, onBack, onBackToHome, onOpenProfile }: Props) {
  const { isChallengeCompleted, state, getPlayerLevel, dispatch } = useGame();
  const { user, logout } = useAuth();
  const world = getWorldById(worldId);

  if (!world) return null;

  const imgUrl = world.bgImage;
  const gradient = WORLD_GRADIENTS[worldId] || WORLD_GRADIENTS.biblioteca;
  const completedCount = world.challenges.filter((c) => isChallengeCompleted(c.id)).length;
  const { level, title, progress } = getPlayerLevel();
  const unlockedAchievements = state.achievements.filter((a) => a.unlocked);
  const completionPct = world.challenges.length > 0 ? Math.round((completedCount / world.challenges.length) * 100) : 0;
  const remaining = world.challenges.length - completedCount;
  const nextIncompleteIdx = world.challenges.findIndex((c) => !isChallengeCompleted(c.id));
  const nextChallengeRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTour, setShowTour] = useState(false);

  const TOUR_STEPS: TourStep[] = [
    {
      targetId: "tour-world-splash",
      title: "Exploração de Mundo",
      content: "Você está no coração deste reino. Cada mundo possui uma história e desafios que testam seus conhecimentos de SQL de formas diferentes.",
    },
    {
      targetId: "tutorial-world-progress",
      title: "Seu Avanço",
      content: "Aqui você acompanha quanto do mundo já foi dominado. Use o botão de ação rápida para ir direto ao seu próximo objetivo!",
    },
    {
      targetId: "tutorial-first-challenge",
      title: "A Ordem das Missões",
      content: "As missões são lineares. Você deve completar o desafio atual para desbloquear o conhecimento necessário para o próximo. Os cadeados mostram o que ainda está oculto.",
    },
    {
      targetId: "tutorial-challenge-details",
      title: "Recompensas e Conceitos",
      content: "Cada desafio mostra o conceito SQL que será praticado e a recompensa em XP. Quanto mais difícil a missão, maior a glória!",
    },
  ];

  useEffect(() => {
    if (!user?.id) return;
    const legacyKey = `sql_quest_tour_world_seen_${user.id}`;
    if (!state.hasSeenWorldTour && localStorage.getItem(legacyKey)) {
      dispatch({ type: "COMPLETE_WORLD_TOUR" });
      localStorage.removeItem(legacyKey);
      return;
    }
    if (state.hasSeenWorldTour) return;
    let tmId: ReturnType<typeof setTimeout>;
    const rafId = requestAnimationFrame(() => {
      tmId = setTimeout(() => {
        setShowTour(true);
        dispatch({ type: "COMPLETE_WORLD_TOUR" });
      }, 600);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(tmId);
    };
  }, [worldId, user?.id, state.hasSeenWorldTour, dispatch]);

  const handleFinishTour = () => {
    setShowTour(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [worldId]);

  const scrollToNext = () => nextChallengeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const motivationalMessage = (() => {
    if (completedCount === 0) return { text: "Sua jornada começa agora. O primeiro passo é o mais importante!", color: "text-amber-400/70" };
    if (completionPct === 100) return { text: "Mundo dominado! Você é uma lenda neste reino.", color: "text-emerald-400" };
    if (completionPct >= 75) return { text: `Quase lá! Só ${remaining} desafio${remaining > 1 ? "s" : ""} para conquistar este mundo.`, color: "text-emerald-400/80" };
    if (completionPct >= 50) return { text: "Mais da metade! O poder está com você — não pare agora.", color: "text-amber-300/80" };
    if (completionPct >= 25) return { text: "Um quarto conquistado. Você está no caminho certo!", color: "text-amber-400/70" };
    return { text: "Bom começo! Cada desafio concluído te torna mais forte.", color: "text-amber-400/60" };
  })();

  const [displayedLore, setDisplayedLore] = useState("");
  const [loreDone, setLoreDone] = useState(!world.lore);

  useEffect(() => {
    if (!world.lore) {
      setLoreDone(true);
      return;
    }
    setDisplayedLore("");
    setLoreDone(false);
    let i = 0;
    // Pega o texto da lore e quebra em caracteres
    const text = world.lore;
    const interval = setInterval(() => {
      setDisplayedLore(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setLoreDone(true);
      }
    }, 25); // Velocidade do typewriter effect
    
    return () => clearInterval(interval);
  }, [world.id, world.lore]);

  const pageBg = WORLD_PAGE_BACKGROUNDS[worldId];

  return (
    <div className="min-h-screen bg-[#0d0b08] text-amber-100 flex flex-col relative">
      {pageBg && (
        <>
          <img
            src={pageBg}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
            style={{
              filter: "blur(3px)",
              transform: "scale(1.03)",
            }}
          />
          <div className="fixed inset-0 bg-[#0d0b08]/75 pointer-events-none z-0" />
          <div
            className="fixed top-0 left-0 right-0 h-[180px] pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)",
            }}
          />
        </>
      )}
      <div className="relative z-[1] flex flex-col flex-1">
      {/* Header — Mesma estrutura do mapa principal */}
      <header className="border-b border-amber-900/30 bg-[#0d0b08]/95 backdrop-blur-sm sticky top-0 z-20 w-full">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Button
               variant="ghost"
               size="sm"
               onClick={onBack}
               className="text-amber-500 hover:text-amber-300 hover:bg-amber-900/20"
             >
               <ArrowLeft className="w-4 h-4 mr-1" />
               Mapa
             </Button>

             <div 
               className="hidden sm:flex items-center gap-2 cursor-pointer group/logo"
               onClick={onBackToHome}
               title="Voltar ao Início"
             >
               <span
                 className="text-lg font-bold text-amber-400 leading-none group-hover/logo:text-amber-200 transition-colors"
                 style={{ fontFamily: "'Playfair Display', serif" }}
               >
                 SQL Quest
               </span>
             </div>
          </div>

          <div className="flex items-center gap-6">
            {state.streak > 0 && (
              <div className="flex items-center gap-1.5 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="font-mono font-bold text-sm">{state.streak}</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <VolumeControl
                isMuted={state.isMuted}
                onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })}
              />

              <div className="flex items-center gap-1.5 text-amber-400">
                <Trophy className="w-4 h-4" />
                <span className="font-mono text-xs">
                  {unlockedAchievements.length}/{state.achievements.length}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTour(true)}
                className="text-amber-600/60 hover:text-amber-400 hover:bg-amber-900/20 h-8 w-8"
                title="Ver tutorial do mundo"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>

            {/* Player Badge Unificado (Nível, XP, Avatar) */}
            <div 
              id="tutorial-profile" 
              className="flex bg-[#1c1917]/80 pl-4 py-1.5 pr-1.5 rounded-full border border-amber-900/40 items-center shadow-[0_0_15px_rgba(251,191,36,0.05)] backdrop-blur-sm gap-3 cursor-pointer hover:border-amber-300/40 transition-colors"
              onClick={onOpenProfile}
            >
              <div className="text-right hidden md:flex flex-col justify-center">
                 <div className="text-[10px] uppercase font-mono font-bold text-amber-500/80 mb-0.5 tracking-widest">
                   Nível {level} · {title}
                 </div>
                 <div className="flex items-center justify-end gap-3">
                   <span className="text-xs font-black text-amber-200 font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                     {state.totalXP.toLocaleString()} XP
                   </span>
                   <div className="w-24 h-1.5 bg-black/60 rounded-full overflow-hidden border border-amber-950/80 relative">
                      <motion.div 
                         className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-700 via-amber-400 to-yellow-200 shadow-[0_0_10px_rgba(253,224,71,0.5)]"
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                         transition={{ duration: 1, ease: 'easeOut' }}
                      />
                   </div>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-500/40 flex items-center justify-center text-amber-200 font-bold text-lg hover:scale-105 transition-all shadow-[0_0_10px_rgba(251,191,36,0.2)] overflow-hidden shrink-0">
                {user?.avatarEmoji?.startsWith("/") ? (
                  <img src={user.avatarEmoji} alt={state.playerName} className="w-full h-full object-cover" />
                ) : (
                  <div className="relative z-10">{user?.avatarEmoji || "👤"}</div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-amber-600/40 hover:text-red-400 hover:bg-red-950/20 transition-all h-8 w-8"
              title="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
      {/* Hero do mundo */}
      <div className={`relative overflow-hidden ${pageBg ? "h-32" : "h-56"}`}>
        {!pageBg && (imgUrl ? (
          <img src={imgUrl} alt={world.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        ))}
        {!pageBg && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#0d0b08]" />
        )}
        <div id="tutorial-world-header" className={`absolute inset-0 flex flex-col justify-end px-8 ${pageBg ? "pb-2 pt-4" : "p-8"}`}>
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h1
                className="text-3xl font-bold text-amber-100"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {world.title}
              </h1>
              <p className="text-amber-400/80 text-sm">
                {world.subtitle} · {completedCount}/{world.challenges.length} concluídos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progresso do mundo — estilo RPG */}
      <div id="tutorial-world-progress" className="max-w-3xl mx-auto px-6 pt-6 pb-2">
        <div className="bg-black/30 border border-amber-900/30 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-snug ${motivationalMessage.color}`}>{motivationalMessage.text}</p>

            {/* Progresso: barra unificada em todos os mundos */}
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden ring-1 ring-amber-900/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.45)] rounded-full"
                  />
                </div>
                <span className="text-[11px] font-mono tabular-nums text-amber-300/80 shrink-0">
                  {completionPct}%
                </span>
              </div>
              <span className={`mt-2 block text-xs font-mono font-bold ${completionPct === 100 ? "text-emerald-400" : "text-amber-300/80"}`}>
                {completedCount}/{world.challenges.length} conquistados
              </span>
            </div>
          </div>

          {/* CTA principal — preenchido pra ser o próximo passo óbvio */}
          {nextIncompleteIdx !== -1 && (
            <button
              onClick={scrollToNext}
              className="flex items-center justify-center gap-2 text-sm font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl px-5 py-2.5 shadow-[0_2px_12px_rgba(251,191,36,0.35)] hover:shadow-[0_4px_18px_rgba(251,191,36,0.55)] transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] shrink-0 whitespace-nowrap"
            >
              <ChevronDown className="w-4 h-4" />
              {completedCount === 0 ? "Começar Jornada" : `Continuar no desafio #${nextIncompleteIdx + 1}`}
            </button>
          )}
        </div>
      </div>

      {/* Seção Cinematográfica / Lore */}
      <AnimatePresence>
        {world.lore && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto px-6 pt-10 pb-4"
          >
            <div className="border-l-2 border-amber-500/50 pl-6 py-2 relative">
              <span className="absolute -left-[5px] top-4 w-2 h-2 bg-amber-500 rounded-full" />
              <p className="text-amber-500/80 font-serif leading-relaxed text-lg italic">
                "{displayedLore}"
                {!loreDone && <span className="inline-block w-2 h-4 ml-1 bg-amber-400 opacity-80 animate-pulse translate-y-0.5" />}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de desafios */}
      <div id="tutorial-challenges-list" className="max-w-3xl mx-auto px-6 pt-2 pb-12">
        <div className="space-y-3">
          {world.challenges.map((challenge, idx) => {
            const completed = isChallengeCompleted(challenge.id);
            const progress = state.challengeProgress[challenge.id];
            const isLocked = idx > 0 && !isChallengeCompleted(world.challenges[idx - 1].id);

            return (
              <div key={challenge.id} id={idx === 0 ? "tutorial-first-challenge" : undefined} ref={idx === nextIncompleteIdx ? nextChallengeRef : undefined}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => {
                  if (isLocked) {
                    toast.error("Este desafio está trancado! Complete o anterior para avançar.");
                    return;
                  }
                  onSelectChallenge(challenge.id);
                }}
                className={`group flex items-center gap-3 sm:gap-4 rounded-xl p-3 sm:p-5 transition-all duration-200 relative overflow-hidden ${
                  completed
                    ? "bg-emerald-950/45 border border-emerald-800/50 hover:border-emerald-500/60 hover:bg-emerald-950/55 hover:shadow-lg hover:shadow-emerald-900/20 cursor-pointer"
                    : isLocked
                      ? "bg-black/20 border border-stone-800/50 opacity-40 cursor-not-allowed grayscale-[0.5]"
                      : "bg-[#1c1917] border border-amber-900/30 hover:border-amber-600/50 hover:bg-[#231f1a] hover:shadow-lg hover:shadow-amber-900/20 cursor-pointer"
                }`}
              >
                {completed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 rounded-l-xl" />
                )}
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {completed ? (
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                  ) : isLocked ? (
                    <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-stone-600" />
                  ) : (
                    <Circle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-800/50 group-hover:text-amber-600/70 transition-colors" />
                  )}
                </div>

                {/* Número — verde quando completo para reforçar estado de sucesso */}
                <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-colors ${
                  completed
                    ? "bg-emerald-900/40 border-emerald-500/50"
                    : isLocked
                      ? "bg-stone-900/40 border-stone-800/50"
                      : "bg-amber-900/25 border-amber-800/40"
                }`}>
                  <span className={`text-xs sm:text-sm font-mono font-bold ${
                    completed ? "text-emerald-300" : isLocked ? "text-stone-600" : "text-amber-400"
                  }`}>{idx + 1}</span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`font-semibold transition-colors text-sm sm:text-base ${
                      completed
                        ? "text-emerald-50 group-hover:text-white"
                        : isLocked
                          ? "text-stone-500"
                          : "text-stone-50 group-hover:text-white"
                    }`}>
                      {isLocked ? "???" : challenge.title}
                    </h3>
                    {!isLocked && (
                      <span
                        className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border font-mono ${
                          DIFFICULTY_COLORS[challenge.difficulty]
                        }`}
                      >
                        {challenge.difficulty}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs sm:text-sm truncate ${
                    completed ? "text-emerald-200/75" : isLocked ? "text-stone-600" : "text-stone-300/85"
                  }`}>
                    {isLocked ? "O conhecimento para este desafio ainda não foi revelado." : challenge.description}
                  </p>
                  {!isLocked && (
                    <div id={idx === 0 ? "tutorial-challenge-details" : undefined} className="flex items-center gap-1.5 gap-y-1.5 mt-2.5 flex-wrap">
                      <span className="text-[11px] sm:text-xs font-mono text-stone-300 bg-stone-800/50 border border-stone-700/50 rounded px-2 py-1 whitespace-nowrap">
                        {challenge.concept}
                      </span>
                      <span className="text-[11px] sm:text-xs font-mono text-amber-300 bg-amber-900/25 border border-amber-700/40 rounded px-2 py-1 whitespace-nowrap">
                        {challenge.xpReward} XP
                      </span>
                      {progress && (
                        <span className="text-[11px] sm:text-xs font-mono text-stone-300 bg-stone-800/50 border border-stone-700/50 rounded px-2 py-1 whitespace-nowrap">
                          {progress.attempts} tent.
                        </span>
                      )}
                      {progress?.completed && progress.attempts === 1 && progress.hintsUsed === 0 && (
                        <span className="text-[11px] sm:text-xs font-mono text-emerald-300 bg-emerald-900/30 border border-emerald-500/40 rounded px-2 py-1 whitespace-nowrap">
                          Perfeito
                        </span>
                      )}
                      {progress?.bestChars !== undefined && (
                        <span className="text-[11px] sm:text-xs font-mono text-amber-200 bg-amber-900/30 border border-amber-600/40 rounded px-2 py-1 whitespace-nowrap">
                          <span className="sm:hidden">{progress.bestChars}c</span>
                          <span className="hidden sm:inline">Menor código: {progress.bestChars}c</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Estrela de conclusão */}
                {completed && (
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400 flex-shrink-0" />
                )}
                {isLocked && (
                  <div className="flex-shrink-0">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
                  </div>
                )}
              </motion.div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
      </div>
      <TutorialTour 
        steps={TOUR_STEPS} 
        isOpen={showTour} 
        onClose={handleFinishTour} 
      />
    </div>
  );
}
