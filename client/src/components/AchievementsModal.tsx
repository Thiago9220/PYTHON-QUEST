import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function AchievementsModal({ isOpen, onClose }: Props) {
  const { state, dispatch } = useGame();
  const unlockedAchievements = state.achievements.filter((a) => a.unlocked);
  const lockedAchievements = state.achievements.filter((a) => !a.unlocked);

  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  const getFallbackIcon = (id: string) => {
    if (id.includes("xp")) return <Zap className="h-8 w-8 text-amber-400" />;
    if (id.includes("world")) return <Award className="h-8 w-8 text-sky-400" />;
    if (id.includes("hint")) return <BookOpen className="h-8 w-8 text-emerald-400" />;
    return <Trophy className="h-8 w-8 text-slate-400" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 18, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-950 shadow-2xl shadow-black/50"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-900/50 via-slate-950 to-slate-900/50 p-6 md:p-8">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20">
                  <Trophy className="h-7 w-7" />
                  <div className="absolute -inset-1 animate-pulse rounded-2xl bg-amber-400/20 blur-sm" />
                </div>
                <div className="min-w-0">
                  <h2 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-2xl font-black tracking-tight text-transparent md:text-3xl">Conquistas</h2>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-900 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(unlockedAchievements.length / state.achievements.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                      />
                    </div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {unlockedAchievements.length} / {state.achievements.length} Desbloqueadas
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {state.achievements.map((ach) => {
                  const isUnlocked = ach.unlocked;
                  return (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className={`group relative flex flex-col gap-4 rounded-3xl border p-5 transition-all duration-300 ${
                        isUnlocked 
                          ? "border-emerald-500/30 bg-slate-900/40 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/50 hover:bg-slate-900/60" 
                          : "border-white/5 bg-slate-900/20 opacity-40 grayscale"
                      }`}
                    >
                      {!isUnlocked && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-slate-950/20 backdrop-blur-[1px]">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 shadow-xl border border-white/10">
                            <Lock className="h-4 w-4 text-slate-500" />
                          </div>
                        </div>
                      )}

                      {isUnlocked && (
                         <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                      )}

                      <div className="relative z-20 flex items-start gap-4">
                        <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border transition-transform duration-500 group-hover:scale-110 ${
                          isUnlocked 
                            ? "border-emerald-500/20 bg-slate-950" 
                            : "border-white/5 bg-slate-950"
                        }`}>
                          {ach.icon.startsWith("/") ? (
                            <img 
                              src={ach.icon} 
                              alt={ach.title} 
                              className="h-full w-full object-cover p-2" 
                              loading="lazy" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="flex items-center justify-center h-full w-full">${ach.id.includes('xp') ? '⚡' : ach.id.includes('world') ? '🌎' : '🏆'}</div>`;
                              }}
                            />
                          ) : (
                            <span className="text-3xl">{ach.icon}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`truncate font-bold tracking-tight ${isUnlocked ? "text-white" : "text-slate-500"}`}>
                            {ach.title}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                            {ach.description}
                          </p>
                        </div>
                      </div>

                      {isUnlocked && (
                        <div className="relative z-20 mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                          {ach.titleReward ? (
                            <div className="min-w-0">
                              <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">Recompensa</span>
                              <span className="block truncate text-xs font-black text-emerald-400">{ach.titleReward}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10">
                                <Check className="h-2.5 w-2.5" />
                              </div>
                              Concluído
                            </div>
                          )}

                          {ach.titleReward && (
                            state.equippedTitle === ach.titleReward ? (
                              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase text-emerald-400">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Ativo
                              </span>
                            ) : (
                              <button
                                onClick={() => dispatch({ type: "SET_TITLE", title: ach.titleReward! })}
                                className="rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase text-sky-400 transition-all hover:bg-sky-500 hover:text-white"
                              >
                                Equipar
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-slate-900/50 p-6 md:px-8">
              <p className="hidden text-xs font-medium text-slate-500 md:block">
                Continue hackeando o sistema para desbloquear mais registros.
              </p>
              <Button 
                onClick={onClose} 
                className="h-12 w-full rounded-2xl bg-white text-slate-950 px-10 font-black transition-all hover:bg-slate-200 active:scale-95 md:w-auto"
              >
                Retornar ao Terminal
              </Button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

