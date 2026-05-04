import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Check, Lock } from "lucide-react";
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
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[70] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1c1917] border border-amber-600/30 rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 md:p-8 border-b border-amber-900/10 flex items-center justify-between bg-gradient-to-br from-amber-600/5 to-transparent shrink-0">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base md:text-2xl font-bold font-serif text-amber-100 leading-tight truncate">Sala das Conquistas</h2>
                  <p className="text-[9px] md:text-xs text-amber-600/50 uppercase tracking-[0.1em] md:tracking-[0.2em] font-mono mt-0.5 md:mt-1 truncate">
                    {unlockedAchievements.length} de {state.achievements.length} desbloqueadas
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-xl text-amber-600/40 hover:text-amber-400 hover:bg-amber-900/10 shrink-0 ml-2"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>

            {/* Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {/* Desbloqueadas */}
                {unlockedAchievements.map((ach) => (
                  <motion.div
                    key={ach.id}
                    layoutId={ach.id}
                    className="bg-[#0f0d0b] border border-amber-500/30 rounded-2xl p-4 md:p-5 flex flex-col gap-3 md:gap-4 shadow-lg group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-2xl rounded-full" />
                    
                    <div className="flex gap-3 md:gap-4 items-start relative z-10">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition-transform overflow-hidden shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                        {ach.icon.startsWith("/") ? (
                          <img
                            src={ach.icon}
                            alt={ach.title}
                            width={56}
                            height={56}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover p-1"
                          />
                        ) : (
                          ach.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-amber-100 truncate">{ach.title}</h4>
                        <p className="text-[10px] md:text-[11px] text-amber-400/60 leading-tight mt-0.5 md:mt-1 line-clamp-2">{ach.description}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-amber-900/10 flex items-center justify-between relative z-10">
                      {ach.titleReward ? (
                        <div className="flex flex-col">
                          <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-amber-600/50 font-bold">Título</span>
                          <span className="text-[11px] md:text-xs text-amber-200 font-serif italic truncate max-w-[80px] md:max-w-none">{ach.titleReward}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Concluído
                        </div>
                      )}

                      {ach.titleReward && (
                        state.equippedTitle === ach.titleReward ? (
                          <span className="text-[9px] md:text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-bold uppercase tracking-tighter shrink-0">Ativo</span>
                        ) : (
                          <button 
                            onClick={() => dispatch({ type: "SET_TITLE", title: ach.titleReward! })}
                            className="text-[9px] md:text-[10px] bg-amber-900/20 hover:bg-amber-600 hover:text-amber-950 transition-all px-2 py-0.5 rounded border border-amber-800/40 text-amber-500 uppercase font-bold tracking-tighter shrink-0"
                          >
                            Equipar
                          </button>
                        )
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Bloqueadas */}
                {lockedAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="bg-[#0f0d0b]/40 border border-stone-800/30 rounded-2xl p-4 md:p-5 flex gap-3 md:gap-4 opacity-50 grayscale group"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-stone-900/50 border border-stone-800/50 flex items-center justify-center text-3xl grayscale overflow-hidden shrink-0">
                      <Lock className="w-5 h-5 text-stone-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm md:text-base text-stone-500 truncate">{ach.title}</h4>
                      <p className="text-[10px] md:text-[11px] text-stone-600 leading-tight mt-0.5 md:mt-1 line-clamp-2">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-amber-900/10 flex justify-end bg-[#171412]/50 shrink-0">
              <Button 
                onClick={onClose}
                className="w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold px-8 rounded-xl h-11 md:h-12 text-sm md:text-base"
              >
                Voltar ao Reino
              </Button>
            </div>
          </motion.div>

          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(120, 80, 20, 0.4);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(180, 130, 40, 0.6);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
