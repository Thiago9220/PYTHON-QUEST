import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { soundManager } from "@/lib/sounds";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isMuted: boolean;
  onToggleMute: () => void;
  className?: string;
};

export function VolumeControl({ isMuted, onToggleMute, className = "" }: Props) {
  const [volume, setVolume] = useState(() => Math.round(soundManager.volume * 100));
  const [showSlider, setShowSlider] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const Icon = isMuted ? VolumeX : volume < 40 ? Volume1 : Volume2;

  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => setShowSlider(false), 300);
  };

  useEffect(() => {
    if (!showSlider) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSlider(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showSlider]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center ${className}`}
      onMouseLeave={scheduleHide}
      onMouseEnter={cancelHide}
    >
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -10, scale: 0.9, x: "-50%" }}
            className="absolute top-full left-1/2 mt-3 flex items-center gap-3 bg-slate-900/95 border border-white/10 rounded-xl px-4 py-2 shadow-2xl backdrop-blur-xl z-50 min-w-[160px]"
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              className="text-slate-400 hover:text-sky-400 transition-colors flex-shrink-0"
              title={isMuted ? "Ativar som" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              disabled={isMuted}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                soundManager.setVolume(v / 100);
              }}
              className="w-24 accent-sky-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer disabled:opacity-30 transition-all hover:accent-sky-400"
            />
            <span className="text-[10px] font-black font-mono text-sky-400/80 w-6 text-right tracking-tighter">
              {isMuted ? 0 : volume}
            </span>
            
            {/* Arrow pointer (pointing UP now) */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900/95" />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowSlider((v) => !v)}
        onMouseEnter={() => { cancelHide(); setShowSlider(true); }}
        className="text-slate-400 hover:text-white hover:bg-white/5 w-8 h-8 flex-shrink-0 rounded-lg transition-all"
        title="Controle de volume"
      >
        <Icon className="w-4 h-4" />
      </Button>
    </div>
  );
}
