import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { soundManager } from "@/lib/sounds";

type Props = {
  isMuted: boolean;
  onToggleMute: () => void;
  className?: string;
};

export function VolumeControl({ isMuted, onToggleMute, className = "" }: Props) {
  const [volume, setVolume] = useState(() => Math.round(soundManager.volume * 100));
  const [showSlider, setShowSlider] = useState(false);
  const [side, setSide] = useState<"left" | "right">("left");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const Icon = isMuted ? VolumeX : volume < 40 ? Volume1 : Volume2;

  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => setShowSlider(false), 300);
  };

  useLayoutEffect(() => {
    if (!showSlider || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = popoverRef.current?.offsetWidth ?? 200;
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;
    if (spaceLeft < popoverWidth + 16 && spaceRight > spaceLeft) {
      setSide("right");
    } else {
      setSide("left");
    }
  }, [showSlider]);

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

  const popoverPositionClass =
    side === "left"
      ? "right-full mr-2"
      : "left-full ml-2";

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center ${className}`}
      onMouseLeave={scheduleHide}
      onMouseEnter={cancelHide}
    >
      {showSlider && (
        <div
          ref={popoverRef}
          className={`absolute ${popoverPositionClass} top-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#1c1917] border border-amber-900/40 rounded-lg px-3 py-1.5 shadow-xl z-50`}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="text-amber-600/70 hover:text-amber-400 flex-shrink-0"
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
            className="w-24 accent-amber-500 cursor-pointer disabled:opacity-50"
          />
          <span className="text-xs font-mono text-amber-500/70 w-6 text-right">
            {isMuted ? 0 : volume}
          </span>
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowSlider((v) => !v)}
        onMouseEnter={() => { cancelHide(); setShowSlider(true); }}
        className="text-amber-600/60 hover:text-amber-400 hover:bg-amber-900/20 w-8 h-8 flex-shrink-0"
        title="Controle de volume"
      >
        <Icon className="w-4 h-4" />
      </Button>
    </div>
  );
}
