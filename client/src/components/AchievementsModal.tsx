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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-sky-950/25 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 18, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl shadow-sky-950/10"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-5 md:p-7">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-700">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black text-slate-950 md:text-2xl">Conquistas</h2>
                  <p className="mt-1 truncate font-mono text-xs uppercase tracking-widest text-slate-500">
                    {unlockedAchievements.length} de {state.achievements.length} desbloqueadas
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl text-slate-500 hover:text-slate-950">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unlockedAchievements.map((ach) => (
                  <motion.div
                    key={ach.id}
                    layoutId={ach.id}
                    className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-200 bg-white text-2xl text-emerald-700">
                        {ach.icon.startsWith("/") ? (
                          <img src={ach.icon} alt={ach.title} className="h-full w-full object-cover p-1" loading="lazy" decoding="async" />
                        ) : (
                          ach.icon
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate font-bold text-slate-950">{ach.title}</h4>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{ach.description}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-emerald-100 pt-3">
                      {ach.titleReward ? (
                        <div className="min-w-0">
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-slate-500">Titulo</span>
                          <span className="block truncate text-xs font-semibold text-emerald-800">{ach.titleReward}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <Check className="h-3 w-3" />
                          Concluido
                        </div>
                      )}

                      {ach.titleReward && (
                        state.equippedTitle === ach.titleReward ? (
                          <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase text-white">Ativo</span>
                        ) : (
                          <button
                            onClick={() => dispatch({ type: "SET_TITLE", title: ach.titleReward! })}
                            className="rounded-full border border-sky-200 bg-white px-2 py-1 text-[10px] font-bold uppercase text-sky-700 hover:border-sky-400"
                          >
                            Equipar
                          </button>
                        )
                      )}
                    </div>
                  </motion.div>
                ))}

                {lockedAchievements.map((ach) => (
                  <div key={ach.id} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 opacity-75">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-bold text-slate-600">{ach.title}</h4>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-sky-100 bg-white p-4 md:p-5">
              <Button onClick={onClose} className="w-full bg-sky-600 font-bold hover:bg-sky-700 md:w-auto md:px-8">
                Voltar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
