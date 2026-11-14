import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Maximize2, Settings, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import {
  useLanguage,
  isScreenShakeEnabled,
  setScreenShakeEnabled,
} from "@/contexts/LanguageContext";
import { soundManager } from "@/lib/sounds";
import { toggleDesktopFullscreen } from "@/lib/platform";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: Props) {
  const { state, dispatch } = useGame();
  const { lang, setLang, t } = useLanguage();
  const [volume, setVolume] = useState(() => Math.round(soundManager.volume * 100));
  const [shakeEnabled, setShakeEnabled] = useState(() => isScreenShakeEnabled());

  useEffect(() => {
    if (!isOpen) return;
    setVolume(Math.round(soundManager.volume * 100));
    setShakeEnabled(isScreenShakeEnabled());
  }, [isOpen]);

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    soundManager.setVolume(val / 100);
  };

  const handleToggleShake = (checked: boolean) => {
    setShakeEnabled(checked);
    setScreenShakeEnabled(checked);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-md rounded-2xl border border-sky-500/30 bg-slate-900/95 shadow-[0_0_60px_rgba(14,165,233,0.2)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">
                    {t("settingsTitle")}
                  </h2>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-sky-400">
                    {t("settingsSub")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Language Selector */}
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    {t("languageLabel")}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setLang("pt")}
                    className={`px-2.5 py-1 rounded-md text-xs font-black transition-all ${
                      lang === "pt"
                        ? "bg-sky-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    PT-BR
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`px-2.5 py-1 rounded-md text-xs font-black transition-all ${
                      lang === "en"
                        ? "bg-sky-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    EN-US
                  </button>
                </div>
              </div>

              {/* Audio Toggle */}
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {state.isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-sky-400" />
                  )}
                  <span className="text-sm font-bold text-white">
                    {t("audioEnabledLabel")}
                  </span>
                </div>
                <Switch
                  checked={!state.isMuted}
                  onCheckedChange={() => dispatch({ type: "TOGGLE_MUTE" })}
                />
              </div>

              {/* Music Volume Slider */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    {t("musicVolumeLabel")}
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {volume}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  disabled={state.isMuted}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Screen Shake Toggle */}
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-white">
                      {t("screenShakeLabel")}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      {t("screenShakeDesc")}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={shakeEnabled}
                  onCheckedChange={handleToggleShake}
                />
              </div>

              {/* Fullscreen */}
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Maximize2 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">
                    {t("fullscreenLabel")}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void toggleDesktopFullscreen()}
                  className="h-8 text-[10px] font-black uppercase tracking-wider border-white/15 hover:bg-white/10"
                >
                  {t("toggleFullscreenBtn")}
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-white/10 bg-slate-950/60 flex justify-end">
              <Button
                onClick={onClose}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black uppercase tracking-widest text-[10px] px-6 rounded-xl"
              >
                {t("close")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

