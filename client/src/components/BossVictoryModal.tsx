import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronRight, Star, Clock, Zap } from "lucide-react";
import { BossChallenge } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface Props {
  boss: BossChallenge;
  themeColor: string;
  durationSec: number;
  hintsUsed: number;
  onClose: () => void;
}

export function BossVictoryModal({
  boss,
  themeColor,
  durationSec,
  hintsUsed,
  onClose,
}: Props) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= boss.finalStory.length) return;
    const id = setTimeout(
      () => setRevealed((r) => Math.min(r + 2, boss.finalStory.length)),
      15
    );
    return () => clearTimeout(id);
  }, [revealed, boss.finalStory.length]);

  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const speedrun = durationSec < 20 * 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-2xl w-full bg-slate-900/80 border-2 rounded-[2rem] overflow-hidden shadow-2xl"
          style={{
            borderColor: `${themeColor}80`,
            boxShadow: `0 0 100px -10px ${themeColor}80`,
          }}
        >
          {/* Animated background */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 20%, ${themeColor}, transparent 50%), radial-gradient(circle at 70% 80%, ${themeColor}, transparent 50%)`,
              backgroundSize: "200% 200%",
            }}
          />

          <div className="relative p-10 md:p-12 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 border-2"
              style={{
                backgroundColor: `${themeColor}22`,
                borderColor: themeColor,
                boxShadow: `0 0 40px ${themeColor}60`,
              }}
            >
              <Trophy className="w-10 h-10" style={{ color: themeColor }} />
            </motion.div>

            <div
              className="text-[10px] font-black uppercase tracking-[0.35em] mb-3"
              style={{ color: themeColor }}
            >
              // Boss Defeated
            </div>
            <h2 className="text-5xl font-black text-white mb-1 tracking-tight leading-none">
              {boss.title}
            </h2>
            <p className="text-[15px] font-bold text-slate-400 mb-8">
              » {boss.codename}
            </p>

            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 mb-8 font-mono text-sm text-slate-300 leading-relaxed min-h-[100px] text-left">
              <span className="text-emerald-400">AI-7&gt;</span>{" "}
              {boss.finalStory.slice(0, revealed)}
              {revealed < boss.finalStory.length && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-emerald-400 ml-1 align-middle"
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4" style={{ color: themeColor }} />
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                  XP Ganho
                </div>
                <div className="text-xl font-black" style={{ color: themeColor }}>
                  +{boss.xpReward.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                  Tempo
                </div>
                <div className="text-xl font-black text-white">
                  {minutes}m {seconds}s
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-4 h-4 text-fuchsia-400" />
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                  Hints
                </div>
                <div className="text-xl font-black text-white">{hintsUsed}</div>
              </div>
            </div>

            {speedrun && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-[10px] uppercase tracking-widest"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Badge Bônus: BlackBox Speedrun
              </motion.div>
            )}

            <Button
              onClick={onClose}
              className="w-full h-12 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              Retornar ao Mundo <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
