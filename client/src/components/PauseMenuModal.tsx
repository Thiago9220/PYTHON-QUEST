import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Map,
  Trophy,
  Settings,
  Maximize2,
  Home,
  Power,
  PauseCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isSteamMode, quitDesktopGame, toggleDesktopFullscreen } from "@/lib/platform";
import { SettingsModal } from "@/components/SettingsModal";
import { AchievementsModal } from "@/components/AchievementsModal";
import { soundManager } from "@/lib/sounds";

type PauseMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onTogglePause: () => void;
  canReturnToMap: boolean;
  onGoToMap: () => void;
  onGoToMainMenu?: () => void;
};

export function PauseMenuModal({
  isOpen,
  onClose,
  onTogglePause,
  canReturnToMap,
  onGoToMap,
  onGoToMainMenu,
}: PauseMenuModalProps) {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Close submodals cleanly when Pause closes
  useEffect(() => {
    if (!isOpen) {
      setShowSettings(false);
      setShowAchievements(false);
    }
  }, [isOpen]);

  // Global ESC listener to toggle pause menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      if (showSettings) {
        e.preventDefault();
        setShowSettings(false);
        return;
      }
      if (showAchievements) {
        e.preventDefault();
        setShowAchievements(false);
        return;
      }
      // Do not hijack ESC if another external dialog is open
      if (!isOpen && document.querySelector('[role="dialog"]')) {
        return;
      }

      e.preventDefault();
      soundManager.playClick();
      onTogglePause();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showSettings, showAchievements, onTogglePause]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9992] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-sky-500/30 bg-slate-900/95 p-6 shadow-[0_0_60px_rgba(14,165,233,0.22)]"
            >
              <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/15 text-sky-400">
                  <PauseCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">
                    {isEn ? "Game Paused" : "Jogo Pausado"}
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    {isEn ? "Press ESC to resume" : "Pressione ESC para continuar"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                  }}
                  className="flex items-center gap-3 rounded-xl border border-sky-400/50 bg-sky-500/20 px-4 py-3 text-sm font-black text-white hover:bg-sky-500/30 transition-colors"
                >
                  <Play className="h-4 w-4 text-sky-300" />
                  {isEn ? "Resume Game" : "Continuar Jogo"}
                </button>

                {canReturnToMap && (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onGoToMap();
                    }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    <Map className="h-4 w-4 text-emerald-400" />
                    {isEn ? "World Map" : "Mapa de Mundos"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setShowAchievements(true);
                  }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 transition-colors"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  {isEn ? "Achievements" : "Conquistas"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setShowSettings(true);
                  }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 transition-colors"
                >
                  <Settings className="h-4 w-4 text-sky-400" />
                  {isEn ? "Settings" : "Configurações"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    void toggleDesktopFullscreen();
                  }}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Maximize2 className="h-4 w-4 text-cyan-400" />
                    {isEn ? "Toggle Fullscreen" : "Tela Cheia / Janela"}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">F11</span>
                </button>

                {onGoToMainMenu && (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onGoToMainMenu();
                    }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    <Home className="h-4 w-4 text-slate-300" />
                    {isEn ? "Main Menu" : "Menu Principal"}
                  </button>
                )}

                {(isSteamMode() || (typeof window !== "undefined" && window.steamBridge)) && (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      void quitDesktopGame();
                    }}
                    className="mt-1 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-300 hover:bg-rose-500/20 transition-colors"
                  >
                    <Power className="h-4 w-4 text-rose-400" />
                    {isEn ? "Quit to Desktop" : "Sair para a Área de Trabalho"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
    </>
  );
}

