import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Lock, LogOut, Star, Trophy, HelpCircle } from "lucide-react";
import { VolumeControl } from "@/components/VolumeControl";
import { useGame } from "@/contexts/GameContext";
import { WORLDS } from "@/lib/challenges";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Codex } from "@/components/Codex";
import { AchievementsModal } from "@/components/AchievementsModal";
import TutorialTour, { TourStep } from "@/components/TutorialTour";
import { useState } from "react";

const WORLD_GRADIENTS: Record<string, string> = {
  "vila-variaveis": "from-sky-300 via-cyan-200 to-white",
  "vale-condicoes": "from-emerald-300 via-lime-200 to-white",
  "montanha-loops": "from-orange-300 via-amber-200 to-white",
  "floresta-funcoes": "from-violet-300 via-fuchsia-200 to-white",
};

const WORLD_TAGS: Record<string, string> = {
  "vila-variaveis": "print, variaveis",
  "vale-condicoes": "if, else",
  "montanha-loops": "for, range",
  "floresta-funcoes": "def, parametros",
};

type Props = {
  onSelectWorld: (worldId: string) => void;
  onOpenProfile: () => void;
};

export default function WorldMap({ onSelectWorld, onOpenProfile }: Props) {
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
      title: "Arquipelago Aurora",
      content: "Cada ilha ensina uma parte de Python com desafios curtos e executaveis no navegador.",
    },
    {
      targetId: "tutorial-codex",
      title: "Guia Python",
      content: "Abra o guia para revisar sintaxe, exemplos e padroes basicos antes de programar.",
    },
    {
      targetId: "tutorial-profile",
      title: "Progresso",
      content: "Seu perfil guarda XP, conquistas, titulos e mundos concluidos.",
    },
  ];

  const handleFinishTour = () => {
    setShowTour(false);
    if (!state.hasSeenTutorial) dispatch({ type: "COMPLETE_TUTORIAL" });
  };

  return (
    <div className="min-h-screen text-slate-900 bg-[#f8fbff] relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-sky-200/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-emerald-100/20 blur-[140px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(14,165,233,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.2)_1px,transparent_1px)] [background-size:80px_80px]" />
      </div>

      <header className="border-b border-sky-100/50 bg-white/60 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button 
            className="group flex items-center gap-2" 
            onClick={() => window.location.reload()}
          >
            <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-sky-600/20 group-hover:scale-110 transition-transform">PY</div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-sky-700 to-sky-900 bg-clip-text text-transparent">Python Quest</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white/80 border border-sky-100 rounded-xl p-1 shadow-sm mr-2">
              <Button variant="ghost" size="icon" onClick={() => setShowTour(true)} className="h-8 w-8 text-slate-500 hover:text-sky-700 hover:bg-sky-50" title="Tutorial">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <VolumeControl isMuted={state.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
              <Button id="tutorial-codex" variant="ghost" size="icon" onClick={() => setIsCodexOpen(true)} className="h-8 w-8 text-slate-500 hover:text-sky-700 hover:bg-sky-50" title="Guia Python">
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>

            <button
              onClick={() => setIsAchievementsOpen(true)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all border border-sky-100 shadow-sm group"
            >
              <Trophy className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-black text-slate-700">{unlockedAchievements.length}/{state.achievements.length}</span>
            </button>

            <div className="h-8 w-px bg-sky-100 mx-1 hidden md:block" />

            <div
              id="tutorial-profile"
              onClick={onOpenProfile}
              className="hidden sm:flex bg-white hover:bg-slate-50 pl-4 py-1 rounded-full border border-sky-100 items-center shadow-sm gap-4 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="text-right hidden md:flex flex-col justify-center">
                <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
                  {title}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] font-black text-sky-700 uppercase">LVL {level}</span>
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <motion.div className="h-full bg-gradient-to-r from-sky-500 to-emerald-400" animate={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 flex items-center justify-center text-white font-black text-xs shadow-inner overflow-hidden border-2 border-white">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt={state.playerName} className="w-full h-full object-cover" /> : state.playerName.charAt(0).toUpperCase()}
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={logout} className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div id="tutorial-intro" className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-700 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              Arquipélago Aurora
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tight">
              Saudações, <span className="text-sky-700">{state.playerName || "Explorador"}</span>.
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              Sua jornada de Scriptweaver continua: <span className="text-slate-950 font-bold">{getCompletedCount()}</span> de {getTotalChallenges()} rituais concluídos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORLDS.map((world, idx) => {
            const unlocked = isWorldUnlocked(world.id);
            const total = world.challenges.length;
            const completed = world.challenges.filter((c) => isChallengeCompleted(c.id)).length;
            const completedAll = completed === total && total > 0;
            const worldProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const gradient = WORLD_GRADIENTS[world.id] || "from-sky-200 to-white";

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, ease: "easeOut" }}
                onClick={() => unlocked && onSelectWorld(world.id)}
                className={`group relative rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${
                  unlocked 
                    ? "glass border-white/50 hover:border-sky-400 hover:-translate-y-2 hover:shadow-[0_32px_64px_-16px_rgba(14,165,233,0.2)] cursor-pointer" 
                    : "border-slate-200 opacity-60 cursor-not-allowed bg-slate-50/50"
                }`}
              >
                <div className={`h-44 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                  {/* Holographic Overlays */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.9),transparent_40%)]" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-sky-400/10 via-transparent to-emerald-400/10" />
                  
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-white rounded-full px-3 py-1 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                      {WORLD_TAGS[world.id] || "Python"}
                    </span>
                  </div>

                  {!unlocked && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="bg-white/90 p-3 rounded-2xl shadow-xl">
                        <Lock className="w-6 h-6 text-slate-400" />
                      </div>
                      <span className="mt-2 text-slate-900 font-black text-xs tracking-widest bg-white/80 px-3 py-1 rounded-full">{world.unlockRequirement.toLocaleString()} XP</span>
                    </div>
                  )}

                  {completedAll && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500 text-white rounded-full px-3 py-1 shadow-lg shadow-emerald-500/30">
                      <Star className="w-3 h-3 fill-white" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Mestre</span>
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600 mb-2">{world.subtitle}</p>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-sky-700 transition-colors">{world.title}</h3>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium h-[4.2rem]">
                    {world.lore}
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Progresso</span>
                      <span className="text-slate-900">{worldProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${worldProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full" 
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    {unlocked ? (
                      <Button className="w-full h-12 bg-slate-900 hover:bg-sky-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10 group-hover:shadow-sky-700/20 transition-all">
                        {completed === 0 ? "Iniciar Desafio" : completedAll ? "Revisitar" : "Continuar Jornada"}
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <div className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border-2 border-dashed border-slate-200 rounded-2xl h-12 flex items-center justify-center">
                        <Lock className="w-3 h-3 mr-2" /> Bloqueado
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
