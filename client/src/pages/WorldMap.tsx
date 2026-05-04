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
    <div className="min-h-screen text-slate-900 bg-gradient-to-br from-sky-50 via-white to-emerald-50 relative">
      <header className="border-b border-sky-100 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <button className="text-xl md:text-2xl font-black text-sky-700" onClick={() => window.location.reload()}>
            Python Quest
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowTour(true)} className="text-slate-600 hover:text-sky-700" title="Tutorial">
              <HelpCircle className="w-5 h-5" />
            </Button>
            <VolumeControl isMuted={state.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
            <Button id="tutorial-codex" variant="ghost" size="icon" onClick={() => setIsCodexOpen(true)} className="text-slate-600 hover:text-sky-700" title="Guia Python">
              <BookOpen className="w-5 h-5" />
            </Button>
            <button
              onClick={() => setIsAchievementsOpen(true)}
              className="flex items-center gap-1.5 text-slate-700 hover:text-sky-700 bg-white px-3 py-2 rounded-lg border border-sky-100 shadow-sm"
              title="Ver conquistas"
            >
              <Trophy className="w-4 h-4" />
              <span className="font-mono text-xs font-bold">{unlockedAchievements.length}/{state.achievements.length}</span>
            </button>
            <div
              id="tutorial-profile"
              onClick={onOpenProfile}
              className="hidden sm:flex bg-white pl-4 py-1.5 pr-1.5 rounded-full border border-sky-100 items-center shadow-sm gap-3 cursor-pointer hover:border-sky-300"
            >
              <div className="text-right hidden md:flex flex-col justify-center">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-widest">
                  Nivel {level} - {title}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-xs font-black text-sky-700 font-mono">{state.totalXP.toLocaleString()} XP</span>
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-sky-500" animate={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 flex items-center justify-center text-white font-bold overflow-hidden">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt={state.playerName} className="w-full h-full object-cover" /> : state.playerName.charAt(0).toUpperCase() || "P"}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-slate-500 hover:text-red-600" title="Sair">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div id="tutorial-intro" className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-sm font-mono uppercase tracking-widest text-sky-700 mb-2">Arquipelago Aurora</p>
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 mb-2">
              Bem-vindo, {state.playerName || "explorador"}.
            </h1>
            <p className="text-slate-600">
              {getCompletedCount()} de {getTotalChallenges()} desafios concluidos - {WORLDS.length} ilhas para explorar
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
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => unlocked && onSelectWorld(world.id)}
                className={`group relative rounded-2xl overflow-hidden border bg-white shadow-sm transition-all ${
                  unlocked ? "border-sky-100 hover:border-sky-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer" : "border-slate-200 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className={`h-36 bg-gradient-to-br ${gradient} relative`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.85),transparent_30%)]" />
                  <div className="absolute top-3 left-3 bg-white/80 border border-white rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700">
                    {WORLD_TAGS[world.id] || "Python"}
                  </div>
                  {!unlocked && (
                    <div className="absolute inset-0 bg-white/65 backdrop-blur-[1px] flex flex-col items-center justify-center">
                      <Lock className="w-8 h-8 text-slate-500 mb-1" />
                      <span className="text-slate-600 text-xs font-mono">{world.unlockRequirement.toLocaleString()} XP</span>
                    </div>
                  )}
                  {completedAll && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-emerald-500 text-white rounded-full px-2 py-1">
                      <Star className="w-3 h-3 fill-white" />
                      <span className="text-[10px] font-bold uppercase">Completo</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-950 mb-1">{world.title}</h3>
                  <p className="text-xs uppercase tracking-widest text-sky-700 font-bold mb-4">{world.subtitle}</p>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 h-[4rem] mb-5">{world.lore}</p>

                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <span className="text-slate-500 uppercase tracking-widest">Progresso</span>
                      <span className="font-mono font-bold text-slate-700">{completed}/{total} - {worldProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all" style={{ width: `${worldProgress}%` }} />
                    </div>
                  </div>

                  {unlocked ? (
                    <Button className="w-full bg-sky-600 hover:bg-sky-700">
                      {completed === 0 ? "Comecar" : completedAll ? "Revisar" : "Continuar"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <div className="text-center text-xs text-slate-500 font-mono uppercase border border-slate-200 rounded-lg h-10 flex items-center justify-center">
                      Bloqueado
                    </div>
                  )}
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
