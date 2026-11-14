import { useState } from "react";
import { Maximize2, Minimize2, Power, Gamepad2, Globe, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isSteamMode, toggleDesktopFullscreen, quitDesktopGame } from "@/lib/platform";
import { useLanguage } from "@/contexts/LanguageContext";
import { SettingsModal } from "./SettingsModal";

export function SteamControls({ onOpenPause }: { onOpenPause?: () => void }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  if (!isSteamMode()) return null;

  const handleToggleFullscreen = async () => {
    await toggleDesktopFullscreen();
    setIsFullscreen((prev) => !prev);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[9990] flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-slate-950/90 px-3 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(14,165,233,0.25)]">
        <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
          <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-sky-300">
            {t("steamBuild")}
          </span>
        </div>

        <button
          onClick={toggleLang}
          title="Idioma / Language (PT-BR / EN-US)"
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Globe className="w-3 h-3 text-emerald-400" />
          <span>{lang.toUpperCase()}</span>
        </button>

        {onOpenPause && (
          <button
            onClick={onOpenPause}
            title={lang === "en" ? "Pause Menu (ESC)" : "Menu de Pausa (ESC)"}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span>ESC</span>
          </button>
        )}

        <button
          onClick={() => setShowSettings(true)}
          title={t("settingsTooltip")}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Settings className="w-3 h-3 text-amber-400" />
        </button>

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
            onClick={() => setShowQuitModal(true)}
            title="Sair para a Área de Trabalho"
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
          >
            <Power className="w-3 h-3" />
          </button>
        )}
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <AnimatePresence>
        {showQuitModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuitModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-2xl border border-rose-500/30 bg-slate-900/95 p-6 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <Power className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mb-1">
                {t("quitTitle")}
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                {t("quitDesc")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowQuitModal(false)}
                  className="h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-slate-300 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => void quitDesktopGame()}
                  className="h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-rose-900/30 transition-colors"
                >
                  {t("quitConfirm")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
