import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Trophy, X, Zap, Award, BookOpen } from "lucide-react";
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
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-slate-900/50 p-6 md:p-8">
              <div className="flex min-w-0 items-center gap-5">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-sky-500/20 bg-slate-900 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                  <Trophy className="h-8 w-8" />
                  <div className="absolute -inset-1 rounded-2xl border border-sky-500/10 blur-sm" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">Terminal de Conquistas</h2>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      {unlockedAchievements.length} / {state.achievements.length} registros ativos
                    </p>
                    <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-800">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(unlockedAchievements.length / state.achievements.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12 rounded-full text-slate-500 transition-all hover:bg-white/5 hover:text-white">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-10">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {state.achievements.map((ach) => {
                  const isUnlocked = ach.unlocked;
                  return (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={isUnlocked ? { y: -4, backgroundColor: "rgba(30, 41, 59, 0.5)" } : {}}
                      className={`group relative flex flex-col gap-5 rounded-3xl border p-6 transition-all duration-300 ${
                        isUnlocked 
                          ? "border-emerald-500/20 bg-slate-900/40 shadow-lg shadow-black/20" 
                          : "border-white/5 bg-white/[0.01] opacity-40"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border transition-all duration-500 ${
                          isUnlocked 
                            ? "border-sky-500/20 bg-slate-900 shadow-[0_0_15px_rgba(14,165,233,0.15)]" 
                            : "border-white/5 bg-slate-950"
                        }`}>
                          {isUnlocked ? (
                            ach.icon.startsWith("/") ? (
                              <img 
                                src={ach.icon} 
                                alt={ach.title} 
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy" 
                              />
                            ) : (
                              <span className="text-4xl">{ach.icon}</span>
                            )
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Lock className="h-8 w-8 text-slate-700" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`truncate text-lg font-bold tracking-tight ${isUnlocked ? "text-white" : "text-slate-600"}`}>
                            {ach.title}
                          </h4>
                          <p className={`mt-1 line-clamp-2 text-xs leading-relaxed ${isUnlocked ? "text-slate-400" : "text-slate-700"}`}>
                            {ach.description}
                          </p>
                        </div>
                      </div>

                      {isUnlocked && (
                        <div className="mt-auto flex flex-col gap-4 pt-4">
                          <div className="h-px bg-slate-800" />
                          <div className="flex items-center justify-between">
                            {ach.titleReward ? (
                              <div className="min-w-0">
                                <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">Privilégio</span>
                                <span className="block truncate text-sm font-black text-emerald-400">{ach.titleReward}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500/60">
                                <Check className="h-3 w-3" />
                                Validado
                              </div>
                            )}

                            {ach.titleReward && (
                              state.equippedTitle === ach.titleReward ? (
                                <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-emerald-400 border border-emerald-500/20">
                                  Ativo
                                </span>
                              ) : (
                                <button
                                  onClick={() => dispatch({ type: "SET_TITLE", title: ach.titleReward! })}
                                  className="rounded-lg bg-slate-800 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-all hover:bg-sky-500 hover:text-white"
                                >
                                  Equipar
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-white/5 bg-slate-900/30 p-6 md:px-10">
              <p className="hidden font-mono text-[10px] uppercase tracking-widest text-slate-600 md:block">
                Sessão segura // Logs criptografados
              </p>
              <Button 
                onClick={onClose} 
                className="h-12 w-full rounded-2xl bg-white text-slate-950 px-12 font-black transition-all hover:bg-slate-200 active:scale-95 md:w-auto"
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
