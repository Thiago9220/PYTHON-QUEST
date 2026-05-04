import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Flame, Lock, LogOut, Star, Trophy } from "lucide-react";
import { VolumeControl } from "@/components/VolumeControl";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { getWorldById } from "@/lib/challenges";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DIFFICULTY_COLORS = {
  iniciante: "text-emerald-700 bg-emerald-50 border-emerald-200",
  intermediario: "text-amber-700 bg-amber-50 border-amber-200",
  avancado: "text-red-700 bg-red-50 border-red-200",
  epico: "text-violet-700 bg-violet-50 border-violet-200",
  lendario: "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200",
};

const WORLD_GRADIENTS: Record<string, string> = {
  "vila-variaveis": "from-sky-300 via-cyan-200 to-white",
  "vale-condicoes": "from-emerald-300 via-lime-200 to-white",
  "montanha-loops": "from-orange-300 via-amber-200 to-white",
  "floresta-funcoes": "from-violet-300 via-fuchsia-200 to-white",
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
  const nextChallengeRef = useRef<HTMLDivElement>(null);

  if (!world) return null;

  const completedCount = world.challenges.filter((c) => isChallengeCompleted(c.id)).length;
  const completionPct = world.challenges.length > 0 ? Math.round((completedCount / world.challenges.length) * 100) : 0;
  const remaining = world.challenges.length - completedCount;
  const nextIncompleteIdx = world.challenges.findIndex((c) => !isChallengeCompleted(c.id));
  const { level, title, progress } = getPlayerLevel();
  const unlockedAchievements = state.achievements.filter((a) => a.unlocked);
  const gradient = WORLD_GRADIENTS[worldId] || "from-sky-200 to-white";

  const motivationalMessage = (() => {
    if (completedCount === 0) return "Comece pelo primeiro desafio e rode seu codigo no console.";
    if (completionPct === 100) return "Ilha concluida. Voce pode revisar qualquer desafio quando quiser.";
    if (completionPct >= 75) return `Quase la: faltam ${remaining} desafio${remaining > 1 ? "s" : ""}.`;
    if (completionPct >= 50) return "Mais da metade da ilha ja foi concluida.";
    return "Bom inicio. Continue para liberar os proximos conceitos.";
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 text-slate-900 flex flex-col">
      <header className="border-b border-sky-100 bg-white/90 backdrop-blur-sm sticky top-0 z-20 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-600 hover:text-sky-700">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Mapa
            </Button>
            <button className="hidden sm:block text-lg font-black text-sky-700" onClick={onBackToHome}>
              Python Quest
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {state.streak > 0 && (
              <div className="flex items-center gap-1.5 text-orange-600">
                <Flame className="w-4 h-4" />
                <span className="font-mono font-bold text-sm">{state.streak}</span>
              </div>
            )}
            <VolumeControl isMuted={state.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
            <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
              <Trophy className="w-4 h-4" />
              <span className="font-mono text-xs">{unlockedAchievements.length}/{state.achievements.length}</span>
            </div>
            <div
              className="hidden md:flex bg-white pl-4 py-1.5 pr-1.5 rounded-full border border-sky-100 items-center shadow-sm gap-3 cursor-pointer hover:border-sky-300"
              onClick={onOpenProfile}
            >
              <div className="text-right">
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
                {user?.avatarEmoji?.startsWith("/") ? <img src={user.avatarEmoji} alt={state.playerName} className="w-full h-full object-cover" /> : state.playerName.charAt(0).toUpperCase() || "P"}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-slate-500 hover:text-red-600" title="Sair">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className={`bg-gradient-to-br ${gradient} border-b border-sky-100`}>
          <div className="max-w-5xl mx-auto px-6 py-12">
            <p className="text-sm font-mono uppercase tracking-widest text-slate-600 mb-3">{world.subtitle}</p>
            <h1 className="text-4xl md:text-6xl font-black text-slate-950 mb-4">{world.title}</h1>
            <p className="max-w-2xl text-slate-700 text-lg leading-relaxed">{world.lore}</p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-8">
          <div className="bg-white border border-sky-100 rounded-2xl px-5 py-4 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-slate-600">{motivationalMessage}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full" animate={{ width: `${completionPct}%` }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">{completionPct}%</span>
                </div>
              </div>
              {nextIncompleteIdx !== -1 && (
                <Button onClick={() => nextChallengeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })} className="bg-sky-600 hover:bg-sky-700">
                  {completedCount === 0 ? "Comecar" : `Continuar #${nextIncompleteIdx + 1}`}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {world.challenges.map((challenge, idx) => {
              const completed = isChallengeCompleted(challenge.id);
              const progressState = state.challengeProgress[challenge.id];
              const isLocked = idx > 0 && !isChallengeCompleted(world.challenges[idx - 1].id);

              return (
                <div key={challenge.id} ref={idx === nextIncompleteIdx ? nextChallengeRef : undefined}>
                  <motion.div
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      if (isLocked) {
                        toast.error("Complete o desafio anterior para liberar este.");
                        return;
                      }
                      onSelectChallenge(challenge.id);
                    }}
                    className={`group flex items-center gap-3 sm:gap-4 rounded-xl p-4 sm:p-5 transition-all border bg-white shadow-sm ${
                      completed
                        ? "border-emerald-200 hover:border-emerald-300 cursor-pointer"
                        : isLocked
                          ? "border-slate-200 opacity-50 cursor-not-allowed"
                          : "border-sky-100 hover:border-sky-300 hover:shadow-md cursor-pointer"
                    }`}
                  >
                    <div className="shrink-0">
                      {completed ? <CheckCircle2 className="w-7 h-7 text-emerald-500" /> : isLocked ? <Lock className="w-7 h-7 text-slate-400" /> : <Circle className="w-7 h-7 text-sky-400" />}
                    </div>
                    <div className="shrink-0 w-8 h-8 rounded-full border border-sky-100 bg-sky-50 flex items-center justify-center">
                      <span className="text-sm font-mono font-bold text-sky-700">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-950">{isLocked ? "???" : challenge.title}</h3>
                        {!isLocked && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                            {challenge.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {isLocked ? "Este desafio ainda esta bloqueado." : challenge.description}
                      </p>
                      {!isLocked && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="text-xs font-mono text-slate-600 bg-slate-100 rounded px-2 py-1">{challenge.concept}</span>
                          <span className="text-xs font-mono text-sky-700 bg-sky-50 rounded px-2 py-1">{challenge.xpReward} XP</span>
                          {progressState && <span className="text-xs font-mono text-slate-600 bg-slate-100 rounded px-2 py-1">{progressState.attempts} tent.</span>}
                        </div>
                      )}
                    </div>
                    {completed && <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
