import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  Trophy,
  Settings,
  Power,
  Globe,
  Maximize2,
  Volume2,
  VolumeX,
  Shield,
  Terminal,
  Zap,
  AlertTriangle,
  ChevronRight,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedLevelTitle } from "@/lib/i18n/localize";
import { isSteamMode, quitDesktopGame, toggleDesktopFullscreen } from "@/lib/platform";
import { AchievementsModal } from "@/components/AchievementsModal";
import { SettingsModal } from "@/components/SettingsModal";
import { soundManager } from "@/lib/sounds";
import { WORLDS } from "@/lib/challenges";

type MainMenuProps = {
  onContinue: () => void;
  onStartNewGame: () => void;
};

type MenuAction = {
  id: "continue" | "new" | "achievements" | "settings" | "quit";
  label: string;
  sublabel?: string;
  icon: typeof Play;
  primary?: boolean;
  danger?: boolean;
  onSelect: () => void;
};

export default function MainMenu({ onContinue, onStartNewGame }: MainMenuProps) {
  const {
    state,
    getPlayerLevel,
    getCompletedCount,
    getTotalChallenges,
    resetAllProgress,
  } = useGame();
  const { lang, toggleLang } = useLanguage();
  const isEn = lang === "en";

  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmNewGame, setConfirmNewGame] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.enabled);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const completedCount = getCompletedCount();
  const totalChallenges = getTotalChallenges();
  const levelInfo = getPlayerLevel();
  const localizedRank = getLocalizedLevelTitle(levelInfo.title, lang);
  const unlockedAch = state.achievements.filter((a) => a.unlocked).length;
  const totalAch = state.achievements.length;
  const defeatedBosses = Object.values(state.bossProgress || {}).filter((b) => b.defeated).length;
  const totalBosses = WORLDS.filter((w) => Boolean(w.boss)).length || 7;

  const hasExistingSave =
    state.hasSeenTutorial ||
    state.totalXP > 0 ||
    completedCount > 0 ||
    (Boolean(state.playerName) &&
      state.playerName !== "Operador" &&
      state.playerName !== "Scriptweaver");

  const hasAnyModalOpen =
    showAchievements || showSettings || confirmNewGame || confirmQuit;

  const menuActions = useMemo<MenuAction[]>(() => {
    const items: MenuAction[] = [];

    if (hasExistingSave) {
      items.push({
        id: "continue",
        label: isEn ? "Continue" : "Continuar",
        sublabel: `${state.playerName || "Operador"} · ${
          isEn ? "Lv." : "Nv."
        }${levelInfo.level} · ${state.totalXP.toLocaleString()} XP`,
        icon: Play,
        primary: true,
        onSelect: onContinue,
      });
    }

    items.push({
      id: "new",
      label: hasExistingSave
        ? isEn
          ? "New Game"
          : "Novo Jogo"
        : isEn
        ? "Start Campaign"
        : "Iniciar Campanha",
      sublabel: hasExistingSave
        ? isEn
          ? "Reset progress and restart story"
          : "Zerar progresso e recomeçar história"
        : isEn
        ? "Begin your infiltration mission"
        : "Começar sua missão de infiltração",
      icon: hasExistingSave ? RotateCcw : Play,
      primary: !hasExistingSave,
      onSelect: () => {
        if (hasExistingSave) {
          setConfirmNewGame(true);
        } else {
          onStartNewGame();
        }
      },
    });

    items.push({
      id: "achievements",
      label: isEn ? "Achievements" : "Conquistas",
      sublabel: `${unlockedAch} / ${totalAch} ${isEn ? "unlocked" : "desbloqueadas"}`,
      icon: Trophy,
      onSelect: () => setShowAchievements(true),
    });

    items.push({
      id: "settings",
      label: isEn ? "Settings" : "Configurações",
      sublabel: isEn ? "Audio, language & display" : "Áudio, idioma e tela",
      icon: Settings,
      onSelect: () => setShowSettings(true),
    });

    if (isSteamMode() || (typeof window !== "undefined" && window.steamBridge)) {
      items.push({
        id: "quit",
        label: isEn ? "Quit to Desktop" : "Sair do Jogo",
        icon: Power,
        danger: true,
        onSelect: () => setConfirmQuit(true),
      });
    }

    return items;
  }, [
    hasExistingSave,
    isEn,
    state.playerName,
    state.totalXP,
    levelInfo.level,
    unlockedAch,
    totalAch,
    onContinue,
    onStartNewGame,
  ]);

  // Keep focused index in bounds if menu items change
  useEffect(() => {
    if (focusedIndex >= menuActions.length) {
      setFocusedIndex(0);
    }
  }, [focusedIndex, menuActions.length]);

  // Keyboard navigation (Up/Down/Enter/Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasAnyModalOpen) {
        if (e.key === "Escape") {
          setShowAchievements(false);
          setShowSettings(false);
          setConfirmNewGame(false);
          setConfirmQuit(false);
        }
        return;
      }

      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        soundManager.playClick();
        setFocusedIndex((prev) => (prev + 1) % menuActions.length);
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        soundManager.playClick();
        setFocusedIndex((prev) => (prev - 1 + menuActions.length) % menuActions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        soundManager.playClick();
        menuActions[focusedIndex]?.onSelect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, menuActions, hasAnyModalOpen]);

  const handleConfirmResetAndStart = async () => {
    soundManager.playClick();
    await resetAllProgress();
    setConfirmNewGame(false);
    onStartNewGame();
  };

  const handleToggleAudio = () => {
    const next = !soundEnabled;
    soundManager.enabled = next;
    setSoundEnabled(next);
    if (next) soundManager.playClick();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-100 select-none flex flex-col">
      {/* Background artwork & cinematic vignette */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src="/assets/images/cyberpunk_bg.png"
          alt="Python Quest Backdrop"
          className="h-full w-full object-cover opacity-35 scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/85 to-[#020617]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/75" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      {/* Top utility header */}
      <header className="relative z-20 flex items-center justify-between px-6 pt-5 md:px-12">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-500/25 bg-slate-950/75 px-3.5 py-1.5 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300">
            {isSteamMode() ? "Steam Desktop Edition · Offline Ready" : "Scriptweaver OS"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            title="Idioma / Language"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200 hover:border-sky-400/50 hover:bg-slate-800 transition-all backdrop-blur-md"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            {lang === "pt" ? "PT-BR" : "EN-US"}
          </button>

          <button
            type="button"
            onClick={handleToggleAudio}
            title={soundEnabled ? (isEn ? "Mute Audio" : "Silenciar Áudio") : isEn ? "Enable Audio" : "Ativar Áudio"}
            className="flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 p-2 text-slate-200 hover:border-sky-400/50 hover:bg-slate-800 transition-all backdrop-blur-md"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-sky-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => void toggleDesktopFullscreen()}
            title={isEn ? "Fullscreen (F11)" : "Tela Cheia (F11)"}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 font-mono text-[11px] font-bold text-slate-200 hover:border-sky-400/50 hover:bg-slate-800 transition-all backdrop-blur-md"
          >
            <Maximize2 className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden sm:inline">F11</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-8 md:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left Rail: Title & Menu Buttons */}
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-sky-400/35 bg-slate-900/90 shadow-[0_0_30px_rgba(14,165,233,0.28)]">
                <img
                  src="/assets/images/python-protocol-mark.png"
                  alt="Python Quest"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  PYTHON QUEST
                </h1>
                <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.26em] text-sky-400">
                  {isEn ? "The Rise of the Scriptweaver" : "A Ascensão do Scriptweaver"}
                </p>
              </div>
            </div>

            <nav className="flex max-w-md flex-col gap-3" aria-label="Main Menu">
              {menuActions.map((item, idx) => {
                const Icon = item.icon;
                const isFocused = focusedIndex === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setFocusedIndex(idx)}
                    onClick={() => {
                      soundManager.playClick();
                      item.onSelect();
                    }}
                    className={`group relative flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-150 ${
                      item.primary && isFocused
                        ? "border-sky-400 bg-sky-500/20 shadow-[0_0_28px_rgba(14,165,233,0.3)] translate-x-1.5"
                        : item.danger && isFocused
                        ? "border-rose-500/60 bg-rose-500/15 shadow-[0_0_24px_rgba(244,63,94,0.2)] translate-x-1.5"
                        : isFocused
                        ? "border-sky-400/60 bg-slate-900/95 shadow-[0_0_22px_rgba(56,189,248,0.16)] translate-x-1.5"
                        : "border-white/10 bg-slate-950/70 hover:border-white/25"
                    }`}
                  >
                    {isFocused && (
                      <span
                        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                          item.danger ? "bg-rose-400" : "bg-sky-400"
                        }`}
                      />
                    )}

                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                          item.danger
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                            : item.primary
                            ? "border-sky-400/40 bg-sky-500/20 text-sky-300"
                            : "border-white/10 bg-white/5 text-slate-300 group-hover:text-sky-300"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-base font-black tracking-wide text-white">
                          {item.label}
                        </div>
                        {item.sublabel && (
                          <div className="truncate font-mono text-[11px] text-slate-400">
                            {item.sublabel}
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className={`h-5 w-5 shrink-0 transition-transform ${
                        isFocused
                          ? "translate-x-0.5 text-sky-300 opacity-100"
                          : "text-slate-600 opacity-40"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </motion.section>

          {/* Right Column: Operator Dossier or Briefing Card */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block"
          >
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-7 backdrop-blur-xl shadow-2xl">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
                    {hasExistingSave ? <Shield className="h-5 w-5" /> : <Terminal className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-sky-400">
                      {hasExistingSave
                        ? isEn
                          ? "Active Operator Save"
                          : "Save Ativo do Operador"
                        : isEn
                        ? "Mission Briefing"
                        : "Briefing da Missão"}
                    </div>
                    <div className="text-xl font-black text-white">
                      {hasExistingSave
                        ? state.playerName || "Operador"
                        : isEn
                        ? "Mainframe Recovery"
                        : "Recuperação do Mainframe"}
                    </div>
                  </div>
                </div>
                {hasExistingSave && (
                  <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                    {isEn ? "Lv." : "Nv."} {levelInfo.level}
                  </span>
                )}
              </div>

              {hasExistingSave ? (
                <>
                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{localizedRank}</span>
                      <span className="font-mono text-sky-300">{state.totalXP.toLocaleString()} XP</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all"
                        style={{ width: `${Math.min(100, Math.max(6, levelInfo.progress))}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        {isEn ? "Challenges" : "Desafios"}
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">
                        {completedCount}
                        <span className="text-xs font-semibold text-slate-500">/{totalChallenges}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        {isEn ? "Bosses" : "Chefes"}
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">
                        {defeatedBosses}
                        <span className="text-xs font-semibold text-slate-500">/{totalBosses}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        {isEn ? "Trophies" : "Troféus"}
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">
                        {unlockedAch}
                        <span className="text-xs font-semibold text-slate-500">/{totalAch}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-300">
                    {isEn
                      ? "Infiltrate corrupted network sectors, rewrite broken modules with real Python, defeat system bosses, and master Git, Docker, Networking, and Cybersecurity."
                      : "Infiltre setores corrompidos da rede, reescreva módulos em Python real, derrote chefes do sistema e domine Git, Docker, Redes e Cibersegurança."}
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <Zap className="mb-2 h-4 w-4 text-sky-400" />
                      <div className="text-xl font-black text-white">{totalChallenges}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        {isEn ? "Missions" : "Missões"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <Cpu className="mb-2 h-4 w-4 text-emerald-400" />
                      <div className="text-xl font-black text-white">{WORLDS.length}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        {isEn ? "Worlds" : "Mundos"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <Terminal className="mb-2 h-4 w-4 text-amber-400" />
                      <div className="text-xl font-black text-white">4</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        Labs
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </main>

      {/* Bottom control hints */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 bg-slate-950/60 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 md:px-12">
        <span>
          {isEn
            ? "[↑↓] Navigate · [Enter] Select · [F11] Fullscreen"
            : "[↑↓] Navegar · [Enter] Selecionar · [F11] Tela Cheia"}
        </span>
        <span>Python Quest · v0.1.0</span>
      </footer>

      {/* Existing Achievements & Settings Modals */}
      <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Confirm New Game Reset Modal */}
      <AnimatePresence>
        {confirmNewGame && (
          <div className="fixed inset-0 z-[9996] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-md rounded-2xl border border-amber-500/35 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center gap-3 text-amber-400">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h2 className="text-lg font-black text-white">
                  {isEn ? "Start New Game?" : "Iniciar Novo Jogo?"}
                </h2>
              </div>
              <p className="mb-6 text-sm text-slate-300">
                {isEn
                  ? `This will permanently erase your current local save (${completedCount} challenges, ${state.totalXP.toLocaleString()} XP) and start from the beginning.`
                  : `Isso apagará permanentemente seu save local atual (${completedCount} desafios, ${state.totalXP.toLocaleString()} XP) e recomeçará do zero.`}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmNewGame(false)}>
                  {isEn ? "Cancel" : "Cancelar"}
                </Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                  onClick={handleConfirmResetAndStart}
                >
                  {isEn ? "Erase & Start" : "Zerar e Começar"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Quit Modal */}
      <AnimatePresence>
        {confirmQuit && (
          <div className="fixed inset-0 z-[9996] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-sm rounded-2xl border border-rose-500/35 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="mb-3 flex items-center gap-3">
                <Power className="h-5 w-5 text-rose-400" />
                <h2 className="text-base font-black text-white">
                  {isEn ? "Quit to Desktop?" : "Sair do Jogo?"}
                </h2>
              </div>
              <p className="mb-5 text-xs text-slate-400">
                {isEn
                  ? "Your progress is safely stored on disk."
                  : "Seu progresso já está salvo com segurança no disco."}
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmQuit(false)}>
                  {isEn ? "Cancel" : "Cancelar"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void quitDesktopGame()}
                >
                  {isEn ? "Quit" : "Sair"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
