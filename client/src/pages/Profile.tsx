import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Edit2,
  Flame,
  LogOut,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AchievementsModal } from "@/components/AchievementsModal";
import { Certificate } from "@/components/Certificate";
import { Codex } from "@/components/Codex";
import { VolumeControl } from "@/components/VolumeControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";

type Props = {
  onBack: () => void;
};

const asciiBar = (pct: number, width = 24) => {
  const clamped = Math.max(0, Math.min(100, pct));
  const filled = Math.round((clamped / 100) * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
};

const isImagePath = (v?: string | null) => !!v && (v.startsWith("/") || v.startsWith("http"));

const PREDEFINED_AVATARS = [
  "/avatars/avatar_1.png",
  "/avatars/avatar_2.png",
  "/avatars/avatar_3.png",
  "/avatars/guido.webp",
  "/avatars/wizard.webp",
  "/avatars/golem.webp",
  "/avatars/galadriel.webp",
  "/avatars/ai7_guide.png",
];

export default function Profile({ onBack }: Props) {
  const { state, dispatch, getPlayerLevel, getCompletedCount, getTotalChallenges } = useGame();
  const { user, logout, updateProfile } = useAuth();
  const { level, title, progress, nextLevelXP, isMaxLevel } = getPlayerLevel();

  const completedCount = getCompletedCount();
  const totalCount = getTotalChallenges();
  const unlockedAchievements = state.achievements.filter((a) => a.unlocked);
  const completionPercent = totalCount > 0 ? completedCount / totalCount : 0;
  const isCertificateReady = completionPercent >= 0.8;
  const challengesLeft = Math.max(totalCount - completedCount, 0);
  const displayTitle = state.equippedTitle ? `${title} :: ${state.equippedTitle}` : title;

  const [showAchievements, setShowAchievements] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || state.playerName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [fullName, setFullName] = useState("");
  const [savedCertName, setSavedCertName] = useState<string | null>(null);

  const certNameStorageKey = user?.id ? `python-quest:certificate-name:${user.id}` : null;
  const operatorId = (user?.id ?? "guest").replace(/-/g, "").slice(0, 8).toUpperCase();
  const avatarEmoji = user?.avatarEmoji;

  useEffect(() => {
    setDisplayName(user?.displayName || state.playerName || "");
    setAvatarUrl(user?.avatarUrl || "");
  }, [user?.displayName, user?.avatarUrl, state.playerName]);

  useEffect(() => {
    if (!certNameStorageKey) return;
    setSavedCertName(localStorage.getItem(certNameStorageKey));
  }, [certNameStorageKey]);

  const handleSaveProfile = async () => {
    const nextName = displayName.trim();
    if (nextName.length < 2) {
      toast.error("Use pelo menos 2 caracteres no nome.");
      return;
    }
    dispatch({ type: "SET_PLAYER_NAME", name: nextName });
    await updateProfile({
      displayName: nextName,
      avatarUrl: avatarUrl.trim() || null,
    });
    setShowEditProfile(false);
    toast.success("Perfil atualizado.");
  };

  const handleOpenCertificate = () => {
    if (!isCertificateReady) {
      toast.error("Conclua pelo menos 80% dos desafios para liberar o certificado.");
      return;
    }
    if (savedCertName) {
      setShowCertificate(true);
      return;
    }
    setFullName(displayName);
    setShowNameInput(true);
  };

  const handleConfirmCertificateName = () => {
    const nextName = fullName.trim();
    if (nextName.length < 4) {
      toast.error("Informe seu nome completo.");
      return;
    }
    if (certNameStorageKey) localStorage.setItem(certNameStorageKey, nextName);
    setSavedCertName(nextName);
    setShowNameInput(false);
    setShowCertificate(true);
  };

  const stats = [
    {
      key: "missions",
      label: "MISSIONS_CLEARED",
      value: `${completedCount.toString().padStart(3, "0")} / ${totalCount.toString().padStart(3, "0")}`,
      helper: challengesLeft > 0 ? `${challengesLeft} pendentes` : "trilha concluida",
      icon: Target,
      tone: "text-cyan-400",
      bar: completionPercent * 100,
    },
    {
      key: "trophies",
      label: "TROPHY_PROTOCOL",
      value: `${unlockedAchievements.length.toString().padStart(2, "0")} / ${state.achievements.length.toString().padStart(2, "0")}`,
      helper: "selos desbloqueados",
      icon: Trophy,
      tone: "text-amber-400",
      bar: state.achievements.length > 0 ? (unlockedAchievements.length / state.achievements.length) * 100 : 0,
    },
    {
      key: "streak",
      label: "STREAK_DAYS",
      value: state.streak.toString().padStart(2, "0"),
      helper: "dias consecutivos",
      icon: Flame,
      tone: "text-orange-400",
      bar: Math.min(100, state.streak * 10),
    },
  ];

  // Telemetry items reused as side panel
  const telemetry = [
    { label: "XP.TOTAL", value: state.totalXP.toLocaleString(), unit: "pts", tone: "text-cyan-300" },
    { label: "RANK.CURRENT", value: `R-${level.toString().padStart(2, "0")}`, unit: title, tone: "text-emerald-300" },
    { label: "TITLE.ACTIVE", value: state.equippedTitle || "—", unit: "equip", tone: "text-amber-300" },
    { label: "SESSION.LAST", value: state.lastPlayedAt ? new Date(state.lastPlayedAt).toLocaleDateString("pt-BR") : "—", unit: "log", tone: "text-fuchsia-300" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-mono overflow-x-hidden">
      {/* CRT scanlines + grid + vignette */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 [background-image:repeating-linear-gradient(0deg,rgba(0,255,200,0.04)_0px,rgba(0,255,200,0.04)_1px,transparent_1px,transparent_3px)] mix-blend-screen" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,#020617_100%)]" />
        <motion.div
          aria-hidden
          initial={{ y: "-100%" }}
          animate={{ y: "120%" }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-cyan-500/[0.06] to-transparent"
        />
      </div>

      {/* Top status bar */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#020617]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10 font-mono text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              cd ../map
            </Button>
            <div className="hidden h-5 w-px bg-cyan-500/30 sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>uplink_active</span>
              <span className="text-cyan-500/40">::</span>
              <span className="text-slate-400">operator_profile.dat</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCodex(true)}
              className="text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10"
              title="Códice"
            >
              <BookOpen className="h-5 w-5" />
            </Button>
            <VolumeControl isMuted={state.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
            <Button
              variant="ghost"
              onClick={logout}
              className="text-rose-300/80 hover:text-rose-200 hover:bg-rose-500/10 font-mono text-xs uppercase tracking-widest"
            >
              <LogOut className="mr-2 h-4 w-4" />
              logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10 space-y-6">
        {/* Operator dossier */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative border border-cyan-500/30 bg-[#020617]/70"
        >
          {/* military corners */}
          <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <span className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <span className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

          {/* Header strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 bg-cyan-500/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400">// SYS</span>
              <span className="text-slate-500">/</span>
              <span>operator_dossier</span>
              <span className="text-slate-500">/</span>
              <span className="text-emerald-400">load_ok</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">uid::</span>
              <span className="text-cyan-200">{operatorId}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{user?.email || "guest@local"}</span>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[260px_1fr]">
            {/* Avatar block */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-400 via-emerald-400 to-fuchsia-500 opacity-40 blur-md" />
                <div className="relative h-44 w-44 border-2 border-cyan-400/60 bg-slate-950 flex items-center justify-center overflow-hidden">
                  {/* corner ticks */}
                  <span className="absolute top-1 left-1 w-3 h-3 border-t border-l border-cyan-300" />
                  <span className="absolute top-1 right-1 w-3 h-3 border-t border-r border-cyan-300" />
                  <span className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-cyan-300" />
                  <span className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-cyan-300" />

                  {avatarUrl && isImagePath(avatarUrl) ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : avatarEmoji && isImagePath(avatarEmoji) ? (
                    <img src={avatarEmoji} alt={displayName} className="h-full w-full object-cover" />
                  ) : avatarEmoji ? (
                    <span className="text-7xl drop-shadow-[0_0_18px_rgba(34,211,238,0.55)]">{avatarEmoji}</span>
                  ) : (
                    <span className="text-7xl text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.6)]">
                      {(displayName || "P").charAt(0).toUpperCase()}
                    </span>
                  )}

                  {/* targeting reticle */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-0 h-2 w-px bg-cyan-300/60" />
                    <div className="absolute left-1/2 bottom-0 h-2 w-px bg-cyan-300/60" />
                    <div className="absolute top-1/2 left-0 w-2 h-px bg-cyan-300/60" />
                    <div className="absolute top-1/2 right-0 w-2 h-px bg-cyan-300/60" />
                  </div>
                </div>
              </div>

              <div className="w-44 border border-cyan-500/30 bg-cyan-500/[0.05] px-3 py-1.5 text-center">
                <div className="text-[8px] tracking-[0.3em] text-cyan-400/70">LEVEL</div>
                <div className="text-2xl text-cyan-200 font-bold leading-none">
                  {level.toString().padStart(2, "0")}
                </div>
              </div>

              <button
                onClick={() => setShowEditProfile(true)}
                className="text-[10px] uppercase tracking-[0.25em] text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="h-3 w-3" />
                edit_profile
              </button>
            </div>

            {/* Identity + XP */}
            <div className="min-w-0 flex flex-col gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] mb-2">
                  <span className="border border-cyan-400/40 px-2 py-0.5 text-cyan-300">{displayTitle}</span>
                  <span className="border border-emerald-400/40 px-2 py-0.5 text-emerald-300">rank.{level.toString().padStart(2, "0")}</span>
                  {isCertificateReady && (
                    <span className="border border-amber-400/50 px-2 py-0.5 text-amber-300">cert.ready</span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-none break-words">
                  <span className="text-cyan-400">&gt;</span> {displayName || "operator"}
                  <span className="ml-2 inline-block w-3 h-7 align-middle bg-cyan-300 animate-pulse" />
                </h1>

                <pre className="mt-4 text-[11px] leading-relaxed text-slate-400 max-w-2xl whitespace-pre-wrap">
{`# brief
  alvo:   conclusao do protocolo central
  pendente: ${challengesLeft} missoes restantes
  link:   uplink @ supabase//sync_ok`}
                </pre>
              </div>

              {/* XP block */}
              <div className="border border-cyan-500/20 bg-slate-950/60 p-4">
                <div className="flex items-end justify-between gap-2 mb-3">
                  <div>
                    <div className="text-[9px] tracking-[0.3em] text-cyan-400/70">XP.STREAM</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl text-white font-bold tracking-tight">{state.totalXP.toLocaleString()}</span>
                      <span className="text-[10px] text-cyan-400 tracking-widest">pts</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] tracking-[0.3em] text-cyan-400/70">NEXT.MARK</div>
                    <div className="text-sm text-slate-200">
                      {isMaxLevel || nextLevelXP == null ? "MAX" : `${nextLevelXP.toLocaleString()} pts`}
                    </div>
                  </div>
                </div>
                <div className="relative h-2 overflow-hidden border border-cyan-500/20 bg-black/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-cyan-300/70">
                  <span>[{asciiBar(progress, 28)}]</span>
                  <span className="text-cyan-200">{Math.round(progress)}%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowAchievements(true)}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 rounded-none font-mono text-xs uppercase tracking-widest shadow-[0_0_18px_rgba(34,211,238,0.15)]"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  ./open conquistas
                </Button>
                <Button
                  onClick={() => setShowCodex(true)}
                  className="bg-transparent hover:bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/40 rounded-none font-mono text-xs uppercase tracking-widest"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  ./read codex
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((s, idx) => (
            <motion.button
              key={s.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              onClick={s.key === "trophies" ? () => setShowAchievements(true) : undefined}
              className="relative text-left border border-cyan-500/25 bg-[#020617]/70 hover:bg-cyan-500/[0.04] transition-colors"
            >
              <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-cyan-400" />
              <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-cyan-400" />
              <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-cyan-400" />
              <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-cyan-400" />

              <div className="px-5 pt-4 pb-3 border-b border-cyan-500/15 flex items-center justify-between">
                <span className="text-[10px] tracking-[0.3em] text-cyan-400/70">// {s.label}</span>
                <s.icon className={`h-4 w-4 ${s.tone}`} />
              </div>

              <div className="px-5 py-5">
                <div className={`text-3xl font-bold tracking-tight ${s.tone}`}>{s.value}</div>
                <div className="mt-3 text-[10px] text-cyan-300/70">
                  [{asciiBar(s.bar, 22)}]
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                  {s.helper}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Cert + telemetry */}
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <motion.section
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative border border-emerald-500/30 bg-[#020617]/70"
          >
            <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-emerald-400" />
            <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-emerald-400" />
            <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-emerald-400" />
            <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-emerald-400" />

            <div className="border-b border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-emerald-300/80 flex items-center justify-between">
              <span>// cert / root_access.bin</span>
              <span className={isCertificateReady ? "text-emerald-300" : "text-slate-500"}>
                {isCertificateReady ? "status: ready" : "status: locked"}
              </span>
            </div>

            <div className="p-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className={`border px-3 py-3 ${isCertificateReady ? "border-emerald-400/60 text-emerald-300" : "border-slate-700 text-slate-600"}`}>
                  <Award className="h-7 w-7" />
                </div>
                <div className="max-w-xl">
                  <h3 className="text-lg text-white font-bold tracking-tight">Certificado de Acesso Root</h3>
                  <pre className="mt-2 text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
{`# requisito
  >= 80% das missoes concluidas
# status
  ${Math.round(completionPercent * 100)}% / 80%`}
                  </pre>
                </div>
              </div>

              <Button
                onClick={handleOpenCertificate}
                disabled={!isCertificateReady}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 disabled:border-slate-700 disabled:text-slate-600 disabled:bg-transparent rounded-none font-mono text-xs uppercase tracking-widest h-11"
              >
                {isCertificateReady ? "./claim seal" : "[locked]"}
              </Button>
            </div>

            <div className="px-6 pb-5">
              <div className="h-2 overflow-hidden border border-emerald-500/20 bg-black/40">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, completionPercent * 100)}%` }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                  className={`h-full ${isCertificateReady ? "bg-gradient-to-r from-emerald-400 to-cyan-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]" : "bg-slate-700"}`}
                />
              </div>
              <div className="mt-1 text-[10px] text-emerald-300/70">
                [{asciiBar(completionPercent * 100, 34)}] {Math.round(completionPercent * 100)}%
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative border border-fuchsia-500/30 bg-[#020617]/70"
          >
            <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-fuchsia-400" />
            <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-fuchsia-400" />
            <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-fuchsia-400" />
            <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-fuchsia-400" />

            <div className="border-b border-fuchsia-500/20 bg-fuchsia-500/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-fuchsia-300/80">
              // telemetry / live
            </div>

            <div className="p-5 space-y-3">
              {telemetry.map((t) => (
                <div key={t.label} className="flex items-baseline justify-between gap-3 border-b border-fuchsia-500/10 last:border-0 pb-2 last:pb-0">
                  <span className="text-[10px] tracking-[0.25em] text-slate-500 whitespace-nowrap">{t.label}</span>
                  <div className="text-right min-w-0">
                    <div className={`text-sm font-bold truncate ${t.tone}`}>{t.value}</div>
                    <div className="text-[9px] uppercase tracking-widest text-slate-600">{t.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        <footer className="text-center text-[10px] uppercase tracking-[0.3em] text-cyan-300/30 pt-2">
          // end_of_record :: python_quest.exe :: build {state.totalXP.toString().slice(-4) || "0000"}
        </footer>
      </main>

      {/* Edit profile modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-mono">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#020617]/85 backdrop-blur"
            onClick={() => setShowEditProfile(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md border border-cyan-400/50 bg-[#020617]"
          >
            <span className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <span className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <span className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <span className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            <div className="border-b border-cyan-500/20 bg-cyan-500/[0.04] px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] tracking-[0.3em] text-cyan-300">// reforjar_perfil.exe</span>
              <button onClick={() => setShowEditProfile(false)} className="text-slate-400 hover:text-cyan-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-[10px] tracking-[0.25em] text-cyan-400/80">CODINOME</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={24}
                  className="bg-black/40 border-cyan-500/30 text-cyan-100 rounded-none font-mono focus:border-cyan-300"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] tracking-[0.25em] text-cyan-400/80">SELECIONAR AVATAR</label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {PREDEFINED_AVATARS.map((url) => (
                    <button
                      key={url}
                      onClick={() => setAvatarUrl(url)}
                      className={`relative aspect-square overflow-hidden border-2 transition-all ${
                        avatarUrl === url
                          ? "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105 z-10"
                          : "border-cyan-500/20 opacity-60 hover:opacity-100 hover:border-cyan-500/50"
                      }`}
                    >
                      <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <label className="mb-1.5 block text-[10px] tracking-[0.25em] text-cyan-400/80">OU URL CUSTOMIZADA</label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black/40 border-cyan-500/30 text-cyan-100 rounded-none font-mono focus:border-cyan-300"
                />
              </div>
            </div>

            <div className="border-t border-cyan-500/20 p-4 flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowEditProfile(false)}
                className="flex-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-none font-mono text-xs uppercase tracking-widest"
              >
                cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 rounded-none font-mono text-xs uppercase tracking-widest"
              >
                ./save
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Certificate name input modal */}
      {showNameInput && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-mono">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#020617]/85 backdrop-blur"
            onClick={() => setShowNameInput(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md border border-emerald-400/50 bg-[#020617]"
          >
            <span className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
            <span className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
            <span className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
            <span className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

            <div className="border-b border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-2 text-[10px] tracking-[0.3em] text-emerald-300">
              // selar_certificado.bin
            </div>
            <div className="p-6">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Informe seu nome completo para selar o certificado.
              </p>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-4 bg-black/40 border-emerald-500/30 text-emerald-100 h-12 text-center rounded-none font-mono focus:border-emerald-300"
                placeholder="nome.completo"
              />
            </div>
            <div className="border-t border-emerald-500/20 p-4 flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowNameInput(false)}
                className="flex-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-none font-mono text-xs uppercase tracking-widest"
              >
                voltar
              </Button>
              <Button
                onClick={handleConfirmCertificateName}
                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 rounded-none font-mono text-xs uppercase tracking-widest"
              >
                ./confirm
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showCertificate && (
        <Certificate
          fullName={savedCertName || displayName}
          completionDate={new Date().toLocaleDateString("pt-BR")}
          totalXP={state.totalXP}
          challengesCompleted={completedCount}
          onClose={() => setShowCertificate(false)}
        />
      )}

      <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
      <Codex isOpen={showCodex} onClose={() => setShowCodex(false)} />
    </div>
  );
}
