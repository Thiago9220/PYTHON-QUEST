import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, ChevronRight, X } from "lucide-react";
import { BossChallenge } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface Props {
  boss: BossChallenge;
  themeColor: string;
  onAccept: () => void;
  onCancel: () => void;
}

export function BossIntroModal({ boss, themeColor, onAccept, onCancel }: Props) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= boss.intro.length) return;
    const id = setTimeout(
      () => setRevealed((r) => Math.min(r + 2, boss.intro.length)),
      12
    );
    return () => clearTimeout(id);
  }, [revealed, boss.intro.length]);

  const fullyRevealed = revealed >= boss.intro.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative max-w-3xl w-full bg-slate-900/80 border-2 rounded-[2rem] overflow-hidden shadow-2xl"
          style={{ borderColor: `${themeColor}60`, boxShadow: `0 0 80px -10px ${themeColor}40` }}
        >
          {/* Scanlines effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] [background:repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_3px)]" />

          {/* Glow corners */}
          <div
            className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: themeColor }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: themeColor }}
          />

          <button
            onClick={onCancel}
            className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative p-10 md:p-14">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center border"
                style={{ backgroundColor: `${themeColor}22`, borderColor: `${themeColor}50` }}
              >
                <Skull className="w-5 h-5" style={{ color: themeColor }} />
              </div>
              <div>
                <div
                  className="text-[10px] font-black uppercase tracking-[0.35em]"
                  style={{ color: themeColor }}
                >
                  // Boss Encounter
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  Classified Operation
                </div>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight leading-none">
              {boss.title}
            </h2>
            <p
              className="text-base md:text-lg font-bold mb-8 tracking-tight"
              style={{ color: themeColor }}
            >
              » {boss.codename}
            </p>

            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 mb-8 min-h-[160px] font-mono text-sm md:text-[15px] text-slate-300 leading-relaxed">
              <span className="text-emerald-400">AI-7&gt;</span>{" "}
              {boss.intro.slice(0, revealed)}
              {!fullyRevealed && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-emerald-400 ml-1 align-middle"
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                  Atos
                </div>
                <div className="text-2xl font-black text-white">{boss.acts.length}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                  XP Reward
                </div>
                <div className="text-2xl font-black" style={{ color: themeColor }}>
                  {boss.xpReward.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                  Tempo Est.
                </div>
                <div className="text-2xl font-black text-white">~30m</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onCancel}
                variant="ghost"
                className="flex-1 h-12 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/10"
              >
                Recusar Missão
              </Button>
              <Button
                onClick={onAccept}
                disabled={!fullyRevealed}
                className="flex-1 h-12 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
              >
                Aceitar Operação <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
