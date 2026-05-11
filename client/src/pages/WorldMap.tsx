import { motion } from "framer-motion";
import { BookOpen, ChevronRight, GitBranch, Lock, LogOut, Star, Trophy, HelpCircle, Container, Database, Wifi, ShieldAlert } from "lucide-react";
import { VolumeControl } from "@/components/VolumeControl";
import { useGame } from "@/contexts/GameContext";
import { WORLDS } from "@/lib/challenges";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Codex } from "@/components/Codex";
import { AchievementsModal } from "@/components/AchievementsModal";
import TutorialTour, { TourStep } from "@/components/TutorialTour";
import { useState } from "react";

const WORLD_TAGS: Record<string, string> = {
  "vila-variaveis": "print, variáveis, strings",
  "vale-condicoes": "if, else",
  "montanha-loops": "for, range",
  "floresta-funcoes": "def, parâmetros",
  "ninho-listas": "listas, matrizes",
};

type Props = {
  onSelectWorld: (worldId: string) => void;
  onOpenProfile: () => void;
  onOpenGitSimulator: () => void;
  onOpenDockerSimulator: () => void;
  onOpenNetworkSimulator: () => void;
  onOpenCyberSecSimulator: () => void;
};

export default function WorldMap({ onSelectWorld, onOpenProfile, onOpenGitSimulator, onOpenDockerSimulator, onOpenNetworkSimulator, onOpenCyberSecSimulator }: Props) {
  const {
    state,
    dispatch,
    getPlayerLevel,
    isWorldUnlocked,
    isChallengeCompleted,
    getCompletedCount,
    getTotalChallenges,
  } = useGame();
  const { user, logout } = useAuth();
  const { level, title, progress } = getPlayerLevel();
  const unlockedAchievements = state.achievements.filter((a) => a.unlocked);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const TOUR_STEPS: TourStep[] = [
    {
      targetId: "tutorial-intro",
      title: "Protocolo Python",
      content: "Bem-vindo ao sistema. Aqui você não apenas aprende Python, mas domina as ferramentas que sustentam a internet moderna.",
    },
    {
      targetId: "tutorial-worlds",
      title: "Núcleos Python",
      content: "Explore as ilhas para aprender lógica, loops e funções. Cada node invadido libera novos conhecimentos.",
    },
    {
      targetId: "tutorial-simulators",
      title: "Módulos Táticos",
      content: "O diferencial: Simuladores reais de Git, Docker e Redes. Pratique comandos reais sem instalar nada.",
    },
    {
      targetId: "tutorial-codex",
      title: "Banco de Dados",
      content: "O Codex contém toda a documentação técnica necessária para suas missões. Consulte sempre que precisar.",
    },
    {
      targetId: "tutorial-profile",
      title: "Nível de Acesso",
      content: "Ganhe XP e conquistas para subir seu nível de Operador e desbloquear novos setores.",
    },
  ];

  const handleFinishTour = () => {
    setShowTour(false);
    if (!state.hasSeenTutorial) dispatch({ type: "COMPLETE_TUTORIAL" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30 overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Sharp Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.15] blur-[4px]"
          style={{ backgroundImage: 'url("/assets/images/map_bg.png")' }}
        />
        
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.1),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.08),transparent_50%)]" />
        
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px] z-10" 
        />
        
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:60px_60px] z-20" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <button 
            className="group flex items-center gap-3" 
            onClick={() => window.location.reload()}
          >
            <div className="h-8 w-8 rounded-xl bg-sky-500 flex items-center justify-center text-white font-black text-xs shadow-[0_0_15px_rgba(14,165,233,0.5)] group-hover:scale-110 transition-transform">PY</div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-sky-400 transition-colors">Python Protocol</span>
          </button>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-1 shadow-sm mr-2 backdrop-blur-md">
              <Button variant="ghost" size="icon" onClick={() => setShowTour(true)} className="h-8 w-8 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10" title="Tutorial">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <VolumeControl isMuted={state.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
              <Button id="tutorial-codex" variant="ghost" size="icon" onClick={() => setIsCodexOpen(true)} className="h-8 w-8 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10" title="Guia Python">
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>

            <button
              onClick={() => setIsAchievementsOpen(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all border border-white/10 shadow-sm group backdrop-blur-md"
            >
              <Trophy className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-black text-white">{unlockedAchievements.length}/{state.achievements.length}</span>
            </button>

            <div id="tutorial-simulators" className="flex items-center gap-2">
              <Button
                id="tutorial-git"
                variant="ghost"
                size="icon"
                onClick={onOpenGitSimulator}
                className="h-9 w-9 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border border-white/5 shadow-sm"
                title="Aprender Git & GitHub"
              >
                <GitBranch className="w-4 h-4" />
              </Button>

              <Button
                id="tutorial-docker"
                variant="ghost"
                size="icon"
                onClick={onOpenDockerSimulator}
                className="h-9 w-9 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-all border border-white/5 shadow-sm"
                title="Aprender Docker"
              >
                <Container className="w-4 h-4" />
              </Button>

              <Button
                id="tutorial-network"
                variant="ghost"
                size="icon"
                onClick={onOpenNetworkSimulator}
                className="h-9 w-9 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all border border-white/5 shadow-sm"
                title="Aprender Redes"
              >
                <Wifi className="w-4 h-4" />
              </Button>

              <Button
                id="tutorial-cybersec"
                variant="ghost"
                size="icon"
                onClick={onOpenCyberSecSimulator}
                className="h-9 w-9 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-white/5 shadow-sm"
                title="Aprender CyberSegurança"
              >
                <ShieldAlert className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-9 w-9 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all border border-white/5 shadow-sm"
              title="Aprender SQL (Query Quest)"
            >
              <a href="https://queryquest.com.br/" target="_blank" rel="noopener noreferrer">
                <Database className="w-4 h-4" />
              </a>
            </Button>

            <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />

            <div
              id="tutorial-profile"
              onClick={onOpenProfile}
              className="hidden sm:flex bg-white/5 hover:bg-white/10 pl-4 py-1 rounded-full border border-white/10 items-center shadow-sm gap-4 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md"
            >
              <div className="text-right hidden md:flex flex-col justify-center">
                <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-0.5">
                  {title}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-[12px] font-black text-white tracking-tighter">
                    {state.totalXP.toLocaleString()} <span className="text-[8px] text-sky-400">XP</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-sky-400 uppercase">LVL {level}</span>
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <motion.div className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" animate={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-600 to-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-inner overflow-hidden border border-white/20">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt={state.playerName} className="w-full h-full object-cover" /> : state.playerName.charAt(0).toUpperCase()}
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={logout} className="h-9 w-9 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-10">
        <div id="tutorial-intro" className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-black uppercase tracking-widest text-sky-400 mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Protocolo Principal
            </div>
            <h1 id="tutorial-intro" className="text-2xl md:text-3xl font-black text-white mb-1 leading-tight tracking-tight">
              Acesso Autorizado, <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">{state.playerName || "Operador"}</span>.
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-mono uppercase tracking-[0.2em] opacity-80">
              Sua jornada como Operador continua: <span className="text-white font-bold">{getCompletedCount()}</span> de {getTotalChallenges()} Sistemas Comprometidos.
            </p>
          </div>
        </div>

        <div id="tutorial-worlds" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORLDS.map((world, idx) => {
            const unlocked = isWorldUnlocked(world.id);
            const total = world.challenges.length;
            const completed = world.challenges.filter((c) => isChallengeCompleted(c.id)).length;
            const completedAll = completed === total && total > 0;
            const worldProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const themeColor = world.color || "#0ea5e9";

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, ease: "easeOut" }}
                onClick={() => unlocked && onSelectWorld(world.id)}
                className={`group relative rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${
                  unlocked 
                    ? "glass-dark hover:-translate-y-2 cursor-pointer" 
                    : "border-white/5 opacity-50 cursor-not-allowed bg-slate-900/50"
                }`}
                style={{ 
                  borderColor: unlocked ? `${themeColor}40` : undefined,
                  boxShadow: unlocked ? `0 10px 30px -10px ${themeColor}20` : undefined
                }}
              >
                <div className="h-48 relative overflow-hidden">
                  {/* World Background Image */}
                  {world.bgImage ? (
                    <img 
                      src={world.bgImage} 
                      alt={world.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-900" />
                  )}
                  
                  {/* Glowing overlay */}
                  <div 
                    className="absolute inset-0 opacity-40 mix-blend-overlay"
                    style={{ backgroundImage: `radial-gradient(circle at 50% 120%, ${themeColor}, transparent 70%)` }}
                  />
                  {/* Holographic Overlays */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay" style={{ backgroundImage: `linear-gradient(to top right, transparent, ${themeColor})` }} />
                  
                  <div className="absolute top-5 left-5 inline-flex items-center gap-2 bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                      {WORLD_TAGS[world.id] || "Python"}
                    </span>
                  </div>

                  {!unlocked && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-xl backdrop-blur-md">
                        <Lock className="w-6 h-6 text-slate-400" />
                      </div>
                      <span className="mt-3 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] bg-slate-900/80 border border-white/10 px-4 py-1.5 rounded-full">{world.unlockRequirement.toLocaleString()} XP REQUERIDO</span>
                    </div>
                  )}

                  {completedAll && (
                    <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md text-emerald-400 rounded-full px-3 py-1 shadow-lg shadow-emerald-500/20">
                      <Star className="w-3 h-3 fill-emerald-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Mestre</span>
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-5 bg-slate-950/40">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: themeColor }}>{world.subtitle}</p>
                    <h3 className="text-2xl font-black text-white leading-tight group-hover:text-sky-300 transition-colors">{world.title}</h3>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 font-medium h-[4.2rem]">
                    {world.lore}
                  </p>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Progresso</span>
                      <span className="text-white">{completed}/{total} - {worldProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${worldProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                        style={{ backgroundColor: themeColor }}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    {unlocked ? (
                      <Button 
                        className="w-full h-12 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all border group-hover:-translate-y-0.5"
                        style={{ 
                          backgroundColor: `${themeColor}20`,
                          borderColor: `${themeColor}40`,
                          color: themeColor
                        }}
                      >
                        {completed === 0 ? "Iniciar Desafio" : completedAll ? "Revisitar" : "Continuar Jornada"}
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <div className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] border-2 border-dashed border-white/10 rounded-xl h-12 flex items-center justify-center bg-white/5">
                        <Lock className="w-3 h-3 mr-2" /> Selado
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
      <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
      <TutorialTour steps={TOUR_STEPS} isOpen={showTour} onClose={handleFinishTour} />
    </div>
  );
}
