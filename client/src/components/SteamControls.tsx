import { useState } from "react";
import { Maximize2, Minimize2, Power, Gamepad2 } from "lucide-react";
import { isSteamMode, toggleDesktopFullscreen, quitDesktopGame } from "@/lib/platform";

export function SteamControls() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isSteamMode()) return null;

  const handleToggleFullscreen = async () => {
    await toggleDesktopFullscreen();
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9990] flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-slate-950/85 px-3 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(14,165,233,0.2)]">
      <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
        <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
        <span className="text-[9px] font-mono font-black uppercase tracking-widest text-sky-300">
          Steam Build
        </span>
      </div>

      <button
        onClick={handleToggleFullscreen}
        title="Alternar Tela Cheia (F11)"
        className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        {isFullscreen ? (
          <Minimize2 className="w-3 h-3 text-sky-400" />
        ) : (
          <Maximize2 className="w-3 h-3 text-sky-400" />
        )}
        <span className="hidden sm:inline">F11</span>
      </button>

      {typeof window !== "undefined" && window.steamBridge && (
        <button
          onClick={() => {
            if (window.confirm("Deseja sair para a área de trabalho?")) {
              void quitDesktopGame();
            }
          }}
          title="Sair do Jogo"
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
        >
          <Power className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

