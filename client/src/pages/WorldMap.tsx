/**
 * SQL Quest — Mapa de Mundos (Expansão 8 Mundos)
 * Design: Dark Academia / Terminal Moderno
 * Grid dinâmico com gradientes temáticos por mundo
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Star, ChevronRight, Trophy, Flame, LogOut, Book, HelpCircle, Crown, Shield, Swords, Skull } from "lucide-react";
import { VolumeControl } from "@/components/VolumeControl";
import { useGame } from "@/contexts/GameContext";
import { WORLDS } from "@/lib/challenges";
import { PREMIUM_WORLDS } from "@/lib/gameLogic";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Codex } from "@/components/Codex";
import { PremiumModal } from "@/components/PremiumModal";
import { AchievementsModal } from "@/components/AchievementsModal";
import TutorialTour, { TourStep } from "@/components/TutorialTour";
import { NewWorldUnlockedModal } from "@/components/NewWorldUnlockedModal";
import { WorldCompletionModal } from "@/components/WorldCompletionModal";
import { toast } from "sonner";


const WORLD_GRADIENTS: Record<string, string> = {
  biblioteca: "from-amber-900/80 via-amber-950/60 to-stone-950",
  mercado: "from-orange-900/80 via-orange-950/60 to-stone-950",
  conclave: "from-slate-900/90 via-purple-950/70 to-stone-950",
  castelo: "from-purple-900/80 via-purple-950/60 to-stone-950",
  cidade: "from-cyan-900/80 via-cyan-950/60 to-stone-950",
  floresta: "from-emerald-900/80 via-emerald-950/60 to-stone-950",
  vulcao: "from-red-900/80 via-red-950/60 to-stone-950",
  observatorio: "from-indigo-900/80 via-indigo-950/60 to-stone-950",
};

type DangerTier = {
  label: string;
  icon: typeof Shield;
  textColor: string;
  bgColor: string;
  borderColor: string;
};

// Cores por nível, dessaturadas para não competir com o CTA.
// Usadas somente no chip de dificuldade — bordas do card são neutras.
function getDangerTier(unlockXP: number): DangerTier {
  if (unlockXP < 5000) {
    return {
      label: "Iniciante",
      icon: Shield,
      textColor: "text-emerald-300/90",
      bgColor: "bg-emerald-950/40",
      borderColor: "border-emerald-500/20",
    };
  }
  if (unlockXP < 20000) {
    return {
      label: "Intermediário",
      icon: Swords,
      textColor: "text-yellow-300/90",
      bgColor: "bg-yellow-950/40",
      borderColor: "border-yellow-500/20",
    };
  }
  if (unlockXP < 45000) {
    return {
      label: "Avançado",
      icon: Flame,
      textColor: "text-red-400",
      bgColor: "bg-red-950/60",
      borderColor: "border-red-500/50",
    };
  }
  return {
    label: "Lendário",
    icon: Skull,
    textColor: "text-purple-300/90",
    bgColor: "bg-purple-950/40",
    borderColor: "border-purple-500/25",
  };
}

const WORLD_TAGS: Record<string, string> = {
  biblioteca: "SELECT, WHERE",
  mercado: "JOINs, GROUP",
  castelo: "Subqueries, Matem.",
  conclave: "Window Fnc., CTEs",
  cidade: "String Fnc., CAST",
  floresta: "Self JOIN, UNION",
  vulcao: "CTEs Múltiplas",
  observatorio: "Rankings",
};

type Props = {
  onSelectWorld: (worldId: string) => void;
  onOpenProfile: () => void;
};

export default function WorldMap({ onSelectWorld, onOpenProfile }: Props) {
  const { state, isLoading, dispatch, getPlayerLevel, isWorldUnlocked, isChallengeCompleted, getCompletedCount, getTotalChallenges } =
    useGame();
  const { user, logout } = useAuth();
  const { level, title, progress } = getPlayerLevel();
  const unlockedAchievements = state.achievements.filter((a) => a.unlocked);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [premiumWorldSelected, setPremiumWorldSelected] = useState<any | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [unlockedWorldToShow, setUnlockedWorldToShow] = useState<any | null>(null);
  const [completedWorldToShow, setCompletedWorldToShow] = useState<any | null>(null);

  // Mapeamento dos passos do tutorial — intro expandida e contextualizada
  const TOUR_STEPS: TourStep[] = [
    {
      targetId: "tour-welcome-splash",
      title: "Bem-vindo ao SQL Quest!",
      content: "SQL Quest é um RPG educacional onde você aprende SQL resolvendo desafios dentro de mundos temáticos medievais. Cada missão é uma query real — você escreve código SQL de verdade para avançar na história e ganhar XP!",
    },
    {
      targetId: "tutorial-intro",
      title: "Os Mundos",
      content: "Cada mundo possui um cenário único com desafios progressivos de SQL. Comece pelo primeiro mundo desbloqueado e conquiste XP para abrir os próximos. A dificuldade aumenta conforme você avança!",
    },
    {
      targetId: "tutorial-codex",
      title: "Códice Mágico",
      content: "Não sabe o que é SQL? Sem problema! No Códice você encontra explicações claras e exemplos práticos de todos os comandos — SELECT, WHERE, JOIN, GROUP BY e muito mais. Consulte sempre que precisar!",
    },
    {
      targetId: "tutorial-intro",
      title: "XP e Progressão",
      content: "Ao completar cada desafio, você ganha XP e sobe de nível. Quanto mais rápido e preciso, mais XP você recebe! Acumule XP para desbloquear novos mundos e conquistas exclusivas.",
    },
    {
      targetId: "tutorial-sound",
      title: "Imersão Sonora",
      content: "Cada mundo possui uma trilha sonora original que muda conforme você avança. Ative o som para uma experiência completa — ou silencie quando preferir foco total.",
    },
    {
      targetId: "tutorial-profile",
      title: "Sua Lenda",
      content: "Seu perfil guarda todo o seu progresso: nível, títulos conquistados, conquistas desbloqueadas e, ao final de tudo, um certificado de conclusão. Sua jornada fica registrada para sempre!",
    },
  ];

  // Iniciar tour na primeira visita
  useEffect(() => {
    if (!state.hasSeenTutorial) {
      const tm = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(tm);
    }
  }, [state.hasSeenTutorial]);

  useEffect(() => {
    const fundos = [
      "/biblioteca-fundo.webp",
      "/mercado-fundo.webp",
      "/conclave-fundo.webp",
      "/castelo-fundo.webp",
      "/cidade-fundo.webp",
      "/vulcao-fundo.webp",
      "/observatorio-fundo.webp",
      "/floresta-fundo.webp",
    ];
    const idle = (cb: () => void) =>
      "requestIdleCallback" in window
        ? (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(cb)
        : setTimeout(cb, 200);
    idle(() => {
      fundos.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }, []);

  // Detector de Mundos Recém-Desbloqueados
  useEffect(() => {
    if (isLoading) return;

    // Mundos que já foram "notificados" (armazenar no localStorage por usuário)
    const storageKey = `sql_quest_notified_worlds_${user?.id || 'guest'}`;
    const notifiedIdsStr = localStorage.getItem(storageKey);
    const notifiedIds: string[] = notifiedIdsStr ? JSON.parse(notifiedIdsStr) : [];
    
    // Encontrar mundos que estão desbloqueados mas NÃO foram notificados
    const newUnlocks = WORLDS.filter(world => {
      const unlocked = isWorldUnlocked(world.id);
      return unlocked && !notifiedIds.includes(world.id);
    });

    if (newUnlocks.length > 0) {
      const world = newUnlocks[0]; // Notificar um por um
      
      // Se for o primeiro mundo (biblioteca), ignorar pois é padrão
      if (world.id === 'biblioteca') return;

      // PARABÉNS! (Mensagem Toast + Modal de Intro)
      toast.success(`PARABÉNS! VOCÊ ABRIU O MUNDO: ${world.title.toUpperCase()}`, {
        duration: 5000,
        icon: world.icon || "🔓"
      });

      // Abrir o modal de introdução premium
      const timer = setTimeout(() => {
        setUnlockedWorldToShow(world);

        // Marcar como notificado apenas quando o modal for ativado
        const currentNotified = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (!currentNotified.includes(world.id)) {
          currentNotified.push(world.id);
          localStorage.setItem(storageKey, JSON.stringify(currentNotified));
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.totalXP, isLoading, user?.id]);

  // Detector de Conclusão de Mundo (100% de progresso)
  useEffect(() => {
    if (isLoading) return;

    const storageKey = `sql_quest_completed_worlds_notif_${user?.id || 'guest'}`;
    const notifiedIdsStr = localStorage.getItem(storageKey);
    const notifiedIds: string[] = notifiedIdsStr ? JSON.parse(notifiedIdsStr) : [];

    const newCompletions = WORLDS.filter(world => {
      const total = world.challenges.length;
      const completedCount = world.challenges.filter(c => isChallengeCompleted(c.id)).length;
      const isDone = completedCount === total && total > 0;
      return isDone && !notifiedIds.includes(world.id);
    });

    if (newCompletions.length > 0) {
      const world = newCompletions[0];
      
      // PARABÉNS PELA CONCLUSÃO!
      toast.success(`DOMÍNIO TOTAL! VOCÊ CONCLUIU O MUNDO: ${world.title.toUpperCase()}`, {
        duration: 6000,
        icon: "🏆"
      });

      const timer = setTimeout(() => {
        setCompletedWorldToShow(world);
        
        // Marcar como notificado apenas quando o modal for ativado
        const currentNotified = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (!currentNotified.includes(world.id)) {
          currentNotified.push(world.id);
          localStorage.setItem(storageKey, JSON.stringify(currentNotified));
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state.challengeProgress, isLoading, user?.id]);

  const handleFinishTour = () => {
    setShowTour(false);
    if (!state.hasSeenTutorial) {
      dispatch({ type: "COMPLETE_TUTORIAL" });
    }
  };

  return (
    <div className="min-h-screen text-amber-100 bg-[#0d0b08] relative">
      {/* Camada de imagem de fundo — fixa, com blur leve pra criar depth of field */}
      <div
        className="fixed inset-0 bg-center bg-cover pointer-events-none z-0"
        style={{
          backgroundImage: "url('/imagem-fundo.webp')",
          filter: "blur(3px)",
          transform: "scale(1.03)", // compensa bordas borradas
        }}
      />
      {/* Overlay global — escurece a imagem pra preservar contraste da UI */}
      <div className="fixed inset-0 bg-[#0d0b08]/75 pointer-events-none z-0" />
      {/* Porto seguro no topo — garante legibilidade do header e boas-vindas */}
      <div
        className="fixed top-0 left-0 right-0 h-[180px] pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="relative z-[1]">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-[#0d0b08]/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2">
          <div 
            className="flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer group/logo"
            onClick={() => window.location.reload()}
            title="Recarregar SQL Quest"
          >
            <span
              className="text-lg md:text-2xl font-bold text-amber-400 leading-none group-hover/logo:text-amber-200 transition-colors"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              SQL <span className="sm:inline">Quest</span> <span className="text-[10px] md:text-xs opacity-40 ml-0.5 font-mono hidden sm:inline">v.Lore</span>
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {state.streak > 0 && (
              <div className="flex items-center gap-1.5 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="font-mono font-bold text-sm md:text-base">{state.streak}</span>
              </div>
            )}

            <div className="flex items-center gap-1 md:gap-4">
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTour(true)}
                  className="hidden sm:inline-flex text-amber-600/60 hover:text-amber-400 hover:bg-amber-900/20 h-8 w-8 md:h-10 md:w-10"
                  title="Repetir Tutorial"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>

                <div id="tutorial-sound">
                  <VolumeControl
                    isMuted={state.isMuted}
                    onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })}
                  />
                </div>
              </div>

              <motion.div
                id="tutorial-codex"
                animate={!state.hasSeenTutorial && !showTour ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsCodexOpen(true);
                  }}
                  className={`text-amber-600/60 hover:text-amber-400 hover:bg-amber-900/20 relative ${!state.hasSeenTutorial && !showTour ? 'after:content-[""] after:absolute after:inset-0 after:rounded-full after:bg-amber-400/20 after:animate-ping' : ''}`}
                  title="Abrir Códice de Conhecimento"
                >
                  <Book className="w-5 h-5" />
                </Button>
              </motion.div>

              <button 
                onClick={() => setIsAchievementsOpen(true)}
                className="flex items-center gap-1 md:gap-1.5 text-amber-400 hover:text-amber-300 hover:scale-105 transition-all bg-amber-900/10 hover:bg-amber-900/30 px-2 md:px-3 py-1.5 rounded-xl border border-amber-900/20 active:scale-95 group"
                title="Ver Conquistas"
              >
                <Trophy className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="font-mono text-xs md:text-base font-bold">
                  <span className="hidden xs:inline">{unlockedAchievements.length}/</span>{state.achievements.length}
                </span>
              </button>
            </div>

            {/* Player Badge Unificado (Nível, XP, Avatar) */}
            <div id="tutorial-profile" className="flex md:bg-[#1c1917]/80 md:pl-4 md:py-1.5 md:pr-1.5 rounded-full md:border md:border-amber-900/40 items-center md:shadow-[0_0_15px_rgba(251,191,36,0.05)] backdrop-blur-sm gap-2">
              <div className="text-right hidden md:flex flex-col justify-center">
                 <div className="text-[11px] uppercase font-mono font-bold text-amber-500/80 mb-0.5 tracking-widest">
                   Nível {level} · {title}
                 </div>
                 <div className="flex items-center justify-end gap-2">
                   <span className="text-sm font-black text-amber-200 font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
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
              <div 
                 onClick={onOpenProfile}
                 className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-500/40 flex items-center justify-center text-amber-200 font-bold text-lg cursor-pointer hover:border-amber-300 hover:scale-105 transition-all shadow-[0_0_10px_rgba(251,191,36,0.25)] overflow-hidden shrink-0"
              >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={state.playerName} className="w-full h-full object-cover" />
                  ) : user?.avatarEmoji?.startsWith("/") ? (
                    <img src={user.avatarEmoji} alt={state.playerName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.avatarEmoji || state.playerName.charAt(0).toUpperCase()}</span>
                  )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-amber-600/40 hover:text-red-400 hover:bg-red-950/20 transition-all shrink-0 h-9 w-9 md:h-10 md:w-10"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div id="tutorial-intro" className="p-2 -m-2 rounded-xl">
            <h1
              className="text-4xl font-bold text-amber-100 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Bem-vindo, {state.playerName}!
            </h1>
            <p className="text-amber-400/70">
              {getCompletedCount()} de {getTotalChallenges()} desafios concluídos · {WORLDS.length} mundos para explorar
            </p>
          </div>

        </div>
        {/* Mundos — grid 2 colunas em md, 4 em lg (Opcional: manter como lista abaixo do mapa ou remover) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {WORLDS.map((world, idx) => {
            const unlocked = isWorldUnlocked(world.id);
            const total = world.challenges.length;
            const completed = world.challenges.filter((c) => isChallengeCompleted(c.id)).length;
            const isLegendary = completed === total && total > 0;
             const gradient = WORLD_GRADIENTS[world.id] || WORLD_GRADIENTS.biblioteca;
             const imgUrl = world.bgImage;
             const danger = getDangerTier(world.unlockRequirement);
             const DangerIcon = danger.icon;

             const completedInWorld = completed;
             const worldProgress = (completed / total) * 100;

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  if (unlocked) {
                    onSelectWorld(world.id);
                  } else if (PREMIUM_WORLDS.includes(world.id)) {
                    setPremiumWorldSelected(world);
                  }
                }}
                className={`group relative rounded-2xl overflow-hidden border transition-[transform,box-shadow,border-color] duration-300 ease-out flex flex-col h-full bg-[#15120e] ${
                  unlocked
                    ? `border-stone-800/40 hover:border-stone-700/60 cursor-pointer hover:-translate-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.02)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] ${isLegendary ? "ring-1 ring-amber-500/20" : ""}`
                    : PREMIUM_WORLDS.includes(world.id)
                        ? "border-stone-800/40 cursor-pointer hover:border-amber-700/30 shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.45)] hover:-translate-y-1"
                        : "border-stone-800/40 opacity-50 cursor-not-allowed"
                }`}
              >
                {/* Backdrop: imagem cobre todo o card, com gradiente em 3 zonas */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={world.title}
                      loading={idx < 4 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={idx < 4 ? "high" : "low"}
                      style={{
                        objectPosition: "center 35%",
                        filter: unlocked ? "saturate(1.05)" : undefined,
                      }}
                      className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                        unlocked ? "group-hover:scale-[1.04]" : "grayscale"
                      }`}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
                  )}
                  {/*
                    Gradiente em 2 zonas com transição curta:
                      0–32%  → 5–10% (imagem praticamente intacta no hero)
                      32–44% → ramp rápido de 10% → 95% (quebra visual "art ↔ product")
                      44–100% → 95% → 99% (metade inferior quase sólida, leitura total)
                  */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.10) 32%, rgba(21,18,14,0.95) 44%, rgba(21,18,14,0.99) 100%)",
                    }}
                  />
                  {/* Divisor sutil entre arte e conteúdo (~36% do card) */}
                  <div
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    style={{ top: "38%" }}
                  />
                </div>

                {/* Área do hero — apenas chips, imagem visível por baixo */}
                <div className="relative h-40 z-[2]">
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <div className="bg-black/50 border border-white/10 rounded-md pl-2.5 pr-[calc(0.625rem-0.08em)] py-0.5 backdrop-blur-md min-w-0">
                      <span className="block text-[10px] font-medium tracking-[0.08em] uppercase text-white/80 whitespace-nowrap overflow-hidden text-ellipsis">
                        {WORLD_TAGS[world.id] || "SQL"}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${danger.bgColor} border ${danger.borderColor} rounded-md pl-2 pr-[calc(0.5rem-0.08em)] py-0.5 backdrop-blur-md shrink-0`}>
                      <DangerIcon className={`w-3 h-3 ${danger.textColor}`} />
                      <span className={`text-[10px] font-medium tracking-[0.08em] uppercase whitespace-nowrap ${danger.textColor}`}>
                        {danger.label}
                      </span>
                    </div>
                  </div>

                  {!unlocked && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-[2px]">
                      {PREMIUM_WORLDS.includes(world.id) ? (
                        <>
                          <Lock className="w-8 h-8 text-amber-500 mb-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                          <span className="text-amber-500 text-xs font-bold font-mono uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                            Expansão Premium
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-8 h-8 text-stone-400 mb-1" />
                          <span className="text-stone-400 text-xs font-mono">
                            {world.unlockRequirement.toLocaleString()} XP
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {unlocked && isLegendary && (
                    <div className="absolute bottom-2 right-3 flex items-center gap-1 bg-amber-500/15 backdrop-blur-sm rounded-full px-2 py-0.5 ring-1 ring-amber-400/30">
                      <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-amber-200/90">Completo</span>
                    </div>
                  )}
                </div>

                {/* Conteúdo — bg transparente, imagem segue visível por trás do gradiente */}
                <div className="relative z-[2] px-7 pt-6 pb-7 flex flex-col flex-1">
                  <h3
                    className="text-[1.4rem] font-semibold text-white mb-2 leading-[1.15] line-clamp-2 h-[3.25rem]"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      letterSpacing: "-0.012em",
                      textShadow: "0 1px 2px rgba(0,0,0,0.75), 0 2px 10px rgba(0,0,0,0.45)",
                    }}
                  >
                    {world.title}
                  </h3>
                  <p
                    className="text-amber-200/80 text-[10.5px] uppercase tracking-[0.22em] mb-7 h-[0.9rem] font-medium truncate"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
                  >
                    {world.subtitle}
                  </p>

                  {/* Progresso — barra fina, integrada, com depth sutil */}
                  <div className="mb-7">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-stone-300/90">
                        Progresso
                      </span>
                      <span className="text-[11px] font-mono font-semibold tabular-nums text-stone-100">
                        {completedInWorld}/{world.challenges.length}
                        <span className="text-stone-300 font-normal ml-1.5">· {Math.round(worldProgress)}%</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-700/60 rounded-full overflow-hidden ring-1 ring-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                      <div
                        className="h-full bg-gradient-to-r from-amber-300 to-amber-100 transition-[width] duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(252,211,77,0.35)]"
                        style={{ width: `${worldProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Descrição — peso visual reduzido mas legível (~80% opacidade) */}
                  <p className="text-stone-200/80 text-[13px] line-clamp-2 leading-[1.6] mb-7 h-[2.6rem] transition-colors duration-300 group-hover:text-stone-100/95">
                    {world.lore}
                  </p>

                  <div className="mt-auto">
                  {unlocked ? (
                    (() => {
                      const inProgress = completedInWorld > 0 && completedInWorld < world.challenges.length;
                      const completedAll = completedInWorld === world.challenges.length;
                      const label = completedInWorld === 0
                        ? "Começar Aventura"
                        : completedAll
                          ? "Revisar Conquista"
                          : "Continuar Jornada";

                      // Laranja exclusivo do CTA primário. Demais estados são neutros.
                      //   Continuar  → primário (laranja preenchido, sombra colorida sutil)
                      //   Começar    → secundário (outline neutro, alto contraste)
                      //   Revisar    → terciário (muted, já conquistado)
                      const btnBase = "w-full h-11 text-[12.5px] font-semibold uppercase tracking-[0.14em] relative group/btn overflow-hidden rounded-lg transition-[transform,background-color,border-color,box-shadow,color] duration-[250ms] ease-out hover:scale-[1.02] active:scale-[0.99]";
                      const btnClass = inProgress
                        ? `${btnBase} bg-orange-500 hover:bg-orange-400 border border-orange-400/60 text-stone-950 shadow-[0_2px_10px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_16px_rgba(249,115,22,0.45)]`
                        : completedAll
                          ? `${btnBase} bg-stone-900/50 border border-stone-700/50 hover:border-stone-500/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900/80`
                          : `${btnBase} bg-white/[0.06] border border-stone-300/50 hover:border-stone-200/80 hover:bg-white/[0.12] text-stone-50 hover:text-white hover:shadow-[0_2px_12px_rgba(255,255,255,0.12)]`;
                      return (
                        <Button className={btnClass} variant="ghost">
                          {inProgress && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                          )}
                          <span className="relative z-10 flex items-center justify-center">
                            {label}
                            <ChevronRight className="w-4 h-4 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
                          </span>
                        </Button>
                      );
                    })()
                  ) : (
                    <div className="text-center text-[12px] text-stone-500 font-mono uppercase tracking-[0.15em] border border-stone-800/50 bg-stone-900/20 rounded-lg h-11 flex items-center justify-center">
                      Trancado
                    </div>
                  )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </main>

      <Codex isOpen={isCodexOpen} onClose={() => setIsCodexOpen(false)} />

      <AchievementsModal 
        isOpen={isAchievementsOpen} 
        onClose={() => setIsAchievementsOpen(false)} 
      />

      <PremiumModal 
        world={premiumWorldSelected} 
        isOpen={!!premiumWorldSelected} 
        onClose={() => setPremiumWorldSelected(null)} 
      />

      <NewWorldUnlockedModal
        world={unlockedWorldToShow}
        isOpen={!!unlockedWorldToShow}
        onClose={() => setUnlockedWorldToShow(null)}
      />

      <WorldCompletionModal
        world={completedWorldToShow}
        isOpen={!!completedWorldToShow}
        onClose={() => setCompletedWorldToShow(null)}
      />

      {/* Componente Modular de Tutorial Guided Tour */}
      <TutorialTour 
        steps={TOUR_STEPS} 
        isOpen={showTour} 
        onClose={handleFinishTour} 
      />

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      </div>
    </div>
  );
}
