import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Book,
  Camera,
  ChevronRight,
  Edit2,
  FileBadge,
  Flame,
  HelpCircle,
  Loader2,
  LogOut,
  ScrollText,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Target,
  Terminal,
  Trash2,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

import { Certificate } from "@/components/Certificate";
import { Codex } from "@/components/Codex";
import { VolumeControl } from "@/components/VolumeControl";
import TutorialTour, { TourStep } from "@/components/TutorialTour";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth, AVATAR_EMOJI_GROUPS } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { WORLDS } from "@/lib/challenges";

type Props = {
  onBack: () => void;
};

export default function Profile({ onBack }: Props) {
  const {
    state,
    dispatch,
    getPlayerLevel,
    getCompletedCount,
    getTotalChallenges,
    resetAllProgress,
    resetWorldProgress,
  } = useGame();
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const { level, title, progress, nextLevelXP, isMaxLevel } = getPlayerLevel();

  const unlockedAchievements = state.achievements.filter((a) => a.unlocked);
  const lockedAchievements = state.achievements.filter((a) => !a.unlocked);
  const completedCount = getCompletedCount();
  const totalCount = getTotalChallenges();
  const completionPercent = totalCount > 0 ? completedCount / totalCount : 0;
  const isEligible = completionPercent >= 0.8;
  const titleLabel = state.equippedTitle ? `${title} • ${state.equippedTitle}` : title;
  const challengesLeft = Math.max(totalCount - completedCount, 0);
  const achievementsLeft = Math.max(state.achievements.length - unlockedAchievements.length, 0);
  const nextQuestLabel =
    challengesLeft > 0
      ? `Restam ${challengesLeft} missões para ampliar seu domínio no reino dos dados.`
      : "Todas as missões foram vencidas. Sua lenda está completa.";
  const masteryNarrative = isEligible
    ? "O reino já reconhece sua maestria. O diploma está pronto para ser reclamado."
    : `Faltam ${Math.max(80 - Math.floor(completionPercent * 100), 0)}% para gravar seu nome no diploma final.`;
  const journeyHighlights = [
    {
      label: "Missões",
      value: `${completedCount}/${totalCount}`,
      helper: challengesLeft > 0 ? `${challengesLeft} restantes` : "mapa completo",
      icon: Target,
      color: "text-blue-300",
      border: "border-blue-500/30",
      glow: "shadow-blue-500/10",
    },
    {
      label: "Conquistas",
      value: unlockedAchievements.length.toString(),
      helper: achievementsLeft > 0 ? `${achievementsLeft} por descobrir` : "coleção completa",
      icon: Trophy,
      color: "text-amber-300",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/10",
    },
    {
      label: "Chama Ativa",
      value: `${state.streak}`,
      helper: "sequência atual",
      icon: Flame,
      color: "text-orange-300",
      border: "border-orange-500/30",
      glow: "shadow-orange-500/10",
    },
  ];

  const [showCertificate, setShowCertificate] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showProfileTour, setShowProfileTour] = useState(false);

  const PROFILE_TOUR_STEPS: TourStep[] = [
    {
      targetId: "profile-tour-ficha",
      title: "Ficha do Explorador",
      content: "Aqui fica o seu avatar, nível, XP acumulado, título ativo e o progresso rumo ao próximo rank.",
    },
    {
      targetId: "profile-tour-highlights",
      title: "Destaques da jornada",
      content: "Missões concluídas, conquistas desbloqueadas e sua chama ativa (sequência de dias).",
    },
    {
      targetId: "profile-tour-certificate",
      title: "Certificado de Maestria",
      content: "O diploma é liberado quando você conclui mais de 80% das missões do reino.",
    },

    {
      targetId: "profile-tour-achievements",
      title: "Sala das Conquistas",
      content: "Lendas desbloqueadas, títulos equipáveis e conquistas que ainda aguardam descoberta.",
    },
  ];
  const [fullName, setFullName] = useState("");
  const [savedCertName, setSavedCertName] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<string>(AVATAR_EMOJI_GROUPS[0].id);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [showResetWorldConfirm, setShowResetWorldConfirm] = useState(false);
  const [worldToReset, setWorldToReset] = useState("");
  const [tempData, setTempData] = useState({
    displayName: user?.displayName || "",
    avatarUrl: user?.avatarUrl || "",
    avatarEmoji: user?.avatarEmoji || "👤",
  });

  const certNameStorageKey = user?.id ? `sql-quest:certificate-name:${user.id}` : null;

  useEffect(() => {
    if (!certNameStorageKey) return;
    const stored = localStorage.getItem(certNameStorageKey);
    if (stored) {
      setSavedCertName(stored);
      setFullName(stored);
    }
  }, [certNameStorageKey]);

  useEffect(() => {
    if (!user?.id) return;
    const legacyKey = `sql-quest:profile-tour-seen:${user.id}`;
    if (!state.hasSeenProfileTour && localStorage.getItem(legacyKey)) {
      dispatch({ type: "COMPLETE_PROFILE_TOUR" });
      localStorage.removeItem(legacyKey);
      return;
    }
    if (state.hasSeenProfileTour) return;
    const tm = setTimeout(() => setShowProfileTour(true), 600);
    return () => clearTimeout(tm);
  }, [user?.id, state.hasSeenProfileTour, dispatch]);

  const handleCloseProfileTour = () => {
    setShowProfileTour(false);
    dispatch({ type: "COMPLETE_PROFILE_TOUR" });
  };

  const handleClaimDiploma = () => {
    if (savedCertName) {
      setFullName(savedCertName);
      setShowCertificate(true);
      return;
    }
    setShowNameInput(true);
  };

  const handleConfirmCertName = () => {
    const trimmed = fullName.trim();
    if (trimmed.length < 3) return;
    if (certNameStorageKey) {
      localStorage.setItem(certNameStorageKey, trimmed);
    }
    setSavedCertName(trimmed);
    setFullName(trimmed);
    setShowNameInput(false);
    setShowCertificate(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        displayName: tempData.displayName,
        avatarUrl: tempData.avatarUrl || null,
        avatarEmoji: tempData.avatarEmoji,
      });
      dispatch({ type: "SET_PLAYER_NAME", name: tempData.displayName });
      setShowEditProfile(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Falha ao salvar perfil", err);
      toast.error("Erro ao atualizar perfil.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      toast.success("Sua conta e todos os dados foram removidos permanentemente.");
    } catch (err) {
      console.error("Erro ao deletar conta:", err);
      toast.error("Falha ao deletar conta. Tente novamente mais tarde.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0b08] text-amber-100 flex flex-col">
      <header className="border-b border-amber-900/30 bg-[#0d0b08]/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-4 md:py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-amber-300 hover:text-amber-100 hover:bg-amber-900/30 h-10 px-2 md:px-4 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 md:mr-2" />
              <span className="hidden sm:inline">Voltar ao Mapa</span>
              <span className="inline sm:hidden">Voltar</span>
            </Button>
            <div className="h-6 w-px bg-amber-900/30 mx-1 md:mx-2 hidden xs:block shrink-0" />
            <h1 className="text-lg md:text-xl font-bold font-serif text-amber-500 truncate">Perfil do Explorador</h1>
          </div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProfileTour(true)}
              className="text-amber-600/60 hover:text-amber-400 hover:bg-amber-900/20 h-9 w-9 md:h-10 md:w-10"
              title="Tour do perfil"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>

            <VolumeControl
              isMuted={state.isMuted}
              onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCodex(true)}
              className="text-amber-600/60 hover:text-amber-400 hover:bg-amber-900/20 h-9 w-9 md:h-10 md:w-10"
              title="Abrir Códice"
            >
              <Book className="w-5 h-5" />
            </Button>

            <div className="h-6 w-px bg-amber-900/30 mx-1 hidden md:block" />

            <Button
              variant="ghost"
              onClick={logout}
              className="text-amber-600/60 hover:text-red-400 hover:bg-red-950/20 transition-all gap-2 h-10 px-2 md:px-4 group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-8">
        <section
          id="profile-tour-ficha"
          className="bg-[#1c1917] border border-amber-900/40 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.12),transparent_55%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.06),transparent_50%)] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(251,191,36,1) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="absolute -top-24 -right-24 w-80 h-80 opacity-[0.04] pointer-events-none">
            <Shield className="w-full h-full text-amber-400" />
          </div>

          <div className="absolute top-2 left-2 w-5 h-5 border-t border-l border-amber-500/60 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t border-r border-amber-500/60 rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b border-l border-amber-500/60 rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b border-r border-amber-500/60 rounded-br-2xl pointer-events-none" />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 text-[#1c1917] px-5 py-1 text-[10px] font-bold font-mono uppercase tracking-[0.35em] rounded-b-md shadow-lg shadow-amber-900/40 z-20">
            <span className="opacity-70">◆</span>
            <span>Ficha do Explorador</span>
            <span className="opacity-70">◆</span>
          </div>

          <div className="p-8 pt-14 relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-3 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(251,191,36,0.55) 60deg, transparent 140deg, transparent 220deg, rgba(251,191,36,0.55) 280deg, transparent 360deg)",
                  }}
                />
                <div className="absolute -inset-1 rounded-full bg-[#1c1917]" />

                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-500/60 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(251,191,36,0.25)] overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={state.playerName} className="w-full h-full object-cover" />
                  ) : user?.avatarEmoji && user.avatarEmoji.startsWith("/") ? (
                    <img src={user.avatarEmoji} alt={state.playerName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.avatarEmoji || state.playerName.charAt(0).toUpperCase()}</span>
                  )}

                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-6 h-6 text-amber-400 mb-1" />
                    <span className="text-xs uppercase font-bold text-amber-400">Alterar</span>
                  </button>
                </div>

                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-400 blur-md opacity-60" />
                    <div className="relative bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-2 border-[#1c1917] rounded-md px-3 py-1 shadow-xl flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-[#1c1917] text-[#1c1917]" />
                      <span className="text-[11px] font-black text-[#1c1917] tracking-wider">LVL {level}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-5 min-w-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <h2 className="text-4xl font-bold font-serif text-amber-100 drop-shadow-[0_2px_10px_rgba(251,191,36,0.25)]">
                      {state.playerName}
                    </h2>
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="p-1.5 rounded-full hover:bg-amber-900/30 text-amber-600 hover:text-amber-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <div className="inline-flex items-center gap-2 pl-3 pr-4 py-1 border-l-2 border-amber-500/70 bg-gradient-to-r from-amber-900/30 via-amber-900/10 to-transparent rounded-r">
                      <span className="text-amber-500/80 text-[11px]">◆</span>
                      <p className="text-amber-300 font-serif italic tracking-wide text-sm">{titleLabel}</p>
                      {state.equippedTitle && (
                        <span className="text-[9px] text-amber-100/40 font-mono uppercase ml-1 border border-amber-100/20 px-1.5 rounded">
                          equipado
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-950/20 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300/80">
                      <Award className="w-3.5 h-3.5" />
                      Rank {level}
                    </div>
                  </div>

                  <p className="max-w-2xl text-sm leading-relaxed text-amber-200/75">
                    <span className="text-amber-100 font-semibold">Sua próxima meta:</span> {nextQuestLabel}
                  </p>

                  {user?.email && (
                    <p className="text-amber-600/50 text-xs font-mono flex items-center gap-1.5 justify-center md:justify-start">
                      <Terminal className="w-3 h-3" />
                      {user.email}
                    </p>
                  )}
                </div>

                <div className="max-w-2xl mx-auto md:mx-0 space-y-2">
                  <div className="flex justify-between items-end gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-amber-600/60 tracking-[0.3em] font-mono">
                        Conhecimento acumulado
                      </p>
                      <p className="text-xl font-bold text-amber-100 font-mono">{state.totalXP.toLocaleString()} XP</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-amber-600/60 tracking-[0.3em] font-mono">
                        {isMaxLevel ? "Status" : "Próximo marco"}
                      </p>
                      <p className="text-sm font-mono text-amber-200">
                        {isMaxLevel ? "Lendário" : `${nextLevelXP!.toLocaleString()} XP`}
                      </p>
                    </div>
                  </div>

                  <div className="relative h-3 bg-amber-950/70 rounded-full overflow-hidden border border-amber-900/60 shadow-inner">
                    <div
                      style={{ width: `${progress}%` }}
                      className={`h-full relative transition-all duration-700 ${
                        isMaxLevel
                          ? "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 shadow-[0_0_12px_rgba(251,191,36,0.55)]"
                          : "bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300"
                      }`}
                    >
                      <div
                        className="absolute inset-0 animate-[xpshimmer_2.5s_ease-in-out_infinite]"
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
                          backgroundSize: "200% 100%",
                        }}
                      />
                    </div>
                  </div>

                  <div className={`mt-3 text-[10px] font-mono uppercase tracking-[0.18em] ${
                    isMaxLevel ? "text-amber-300 font-bold" : "text-amber-300/70"
                  }`}>
                    <span>
                      {isMaxLevel
                        ? "✦ Rank máximo atingido ✦"
                        : `${Math.floor(progress)}% rumo ao próximo rank`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div id="profile-tour-highlights" className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {journeyHighlights.map((stat) => (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() => {
                    if (stat.label === "Conquistas") {
                      document.getElementById("achievements-section")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 bg-black/15 ${stat.border} ${stat.glow} ${stat.label === "Conquistas" ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-amber-100/85">{stat.label}</p>
                      <p className="mt-2 text-2xl font-bold font-mono text-amber-50">{stat.value}</p>
                    </div>
                    <div className={`rounded-xl border border-current/20 bg-black/20 p-2 ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-amber-100/85 uppercase tracking-wide font-mono">{stat.helper}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          id="profile-tour-certificate"
          className={`bg-[#1c1917] border rounded-3xl p-8 relative overflow-hidden transition-all duration-500 ${
            isEligible ? "border-amber-500/50 shadow-[0_0_30px_rgba(251,191,36,0.15)]" : "border-amber-900/20"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-stretch justify-between gap-8 relative z-10">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <FileBadge className={`w-8 h-8 ${isEligible ? "text-amber-400" : "text-amber-900/50"}`} />
                <h3 className="text-2xl font-bold font-serif text-amber-100">Certificado de Maestria SQL</h3>
              </div>
              <p className="text-amber-400/75 text-sm max-w-xl">
                O diploma final é concedido apenas aos exploradores que provarem sua maestria em mais de 80% do
                reino. Sua jornada está sendo registrada nos anais da história.
              </p>

              <div className="mt-4">
                <div className="flex justify-between text-sm font-mono text-amber-500/80 mb-1.5 px-1 font-bold uppercase">
                  <span>Progresso para o Diploma</span>
                  <span>{Math.floor(completionPercent * 100)}% / 80%</span>
                </div>
                <div className="relative h-4 bg-amber-950/40 rounded-full border border-amber-900/30 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (completionPercent / 0.8) * 100)}%` }}
                    className={`h-full relative transition-all duration-1000 ${
                      isEligible ? "bg-gradient-to-r from-amber-600 to-amber-400" : "bg-amber-700/60"
                    }`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinity]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {isEligible ? (
                <Button
                  onClick={handleClaimDiploma}
                  className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold text-lg px-8 py-8 rounded-2xl shadow-xl shadow-amber-900/40 transition-all hover:scale-105 group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex items-center gap-2">
                      {savedCertName ? "Ver Diploma" : "Resgatar Diploma"}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-sm font-mono opacity-60 font-medium">
                      {savedCertName ? "EMITIDO PARA SEU NOME" : "META DE 80% ALCANÇADA"}
                    </span>
                  </div>
                </Button>
              ) : (
                <div className="bg-[#110f0d] border border-amber-900/30 rounded-2xl px-8 py-10 text-center opacity-70 self-stretch flex flex-col items-center justify-center min-w-[200px]">
                  <Target className="w-8 h-8 text-amber-700 mx-auto mb-3" />
                  <div className="text-xs font-mono text-amber-500/80 uppercase tracking-widest">Aguardando conclusão</div>
                </div>
              )}
            </div>
          </div>
        </section>



        {showNameInput && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="max-w-md w-full bg-[#1c1917] border-2 border-amber-600/50 rounded-3xl p-10 shadow-[0_0_50px_rgba(251,191,36,0.2)]">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                  <FileBadge className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-3xl font-bold font-serif text-amber-100 mb-2">Quase la</h2>
                <p className="text-amber-400/70 text-sm">
                  Use seu nome completo real. Ele sera gravado permanentemente no diploma e nao podera ser alterado.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-mono text-amber-600/50 uppercase ml-1">Nome Completo</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Maria Silva Oliveira"
                    className="bg-amber-950/20 border-amber-900/50 text-amber-100 text-lg py-6 focus:border-amber-500"
                    autoFocus
                  />
                  <p className="text-[11px] text-amber-700/80 mt-2 ml-1 flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>Apos confirmar, o nome ficara vinculado a esta conta.</span>
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setShowNameInput(false)} className="flex-1 text-amber-600">
                    Cancelar
                  </Button>
                  <Button
                    disabled={fullName.trim().length < 3}
                    onClick={handleConfirmCertName}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold"
                  >
                    Confirmar e Gerar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditProfile && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xl w-full bg-[#1c1917] border border-amber-500/30 rounded-3xl p-8 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-serif text-amber-100">Editar Perfil</h2>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="text-amber-600 hover:text-amber-400 font-bold p-2"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-amber-900/20 border-2 border-amber-500/50 flex items-center justify-center text-3xl overflow-hidden shadow-inner">
                    {tempData.avatarUrl ? (
                      <img src={tempData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : tempData.avatarEmoji.startsWith("/") ? (
                      <img src={tempData.avatarEmoji} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{tempData.avatarEmoji}</span>
                    )}
                  </div>
                  <p className="text-xs text-amber-600 uppercase font-mono tracking-widest">Pre-visualizacao</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-amber-600 uppercase tracking-widest block ml-1">Nickname</label>
                  <Input
                    value={tempData.displayName}
                    onChange={(e) => setTempData((prev) => ({ ...prev, displayName: e.target.value }))}
                    className="bg-amber-950/20 border-amber-900/40 text-amber-100 placeholder:text-amber-900/40"
                    placeholder="Seu apelido lendario..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 ml-1">
                    <label className="text-xs font-mono text-amber-600 uppercase tracking-widest">Escolha um Avatar</label>
                    <div className="relative flex-1 max-w-[180px]">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-700/60" />
                      <input
                        type="text"
                        value={emojiSearch}
                        onChange={(e) => setEmojiSearch(e.target.value)}
                        placeholder="buscar..."
                        className="w-full bg-amber-950/30 border border-amber-900/40 rounded-lg pl-8 pr-2 py-1.5 text-xs text-amber-100 placeholder:text-amber-800/60 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-950/10 border border-amber-900/30 rounded-2xl overflow-hidden">
                    {!emojiSearch && (
                      <div className="flex border-b border-amber-900/30 bg-[#0f0d0b]/60">
                        {AVATAR_EMOJI_GROUPS.map((group) => (
                          <button
                            key={group.id}
                            onClick={() => setEmojiCategory(group.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-all relative ${
                              emojiCategory === group.id ? "text-amber-300" : "text-amber-700/60 hover:text-amber-500"
                            }`}
                          >
                            <span className="text-sm">{group.icon}</span>
                            <span className="hidden sm:inline">{group.label}</span>
                            {emojiCategory === group.id && (
                              <motion.span
                                layoutId="emoji-tab-indicator"
                                className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="p-4 max-h-52 overflow-y-auto">
                      {(() => {
                        const activeGroup = AVATAR_EMOJI_GROUPS.find((g) => g.id === emojiCategory);
                        const emojis = emojiSearch
                          ? AVATAR_EMOJI_GROUPS.flatMap((g) => g.emojis).filter((emoji) =>
                              emoji.toLowerCase().includes(emojiSearch.toLowerCase()),
                            )
                          : activeGroup?.emojis || [];

                        if (emojis.length === 0) {
                          return (
                            <p className="text-center text-amber-700/50 text-xs font-mono py-6">Nenhum avatar encontrado</p>
                          );
                        }

                        return (
                          <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5">
                            {emojis.map((emoji) => {
                              const selected = tempData.avatarEmoji === emoji && !tempData.avatarUrl;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => setTempData((prev) => ({ ...prev, avatarEmoji: emoji, avatarUrl: "" }))}
                                  className={`aspect-square text-2xl flex items-center justify-center rounded-xl transition-all overflow-hidden ${
                                    selected
                                      ? "bg-gradient-to-br from-amber-500/30 to-amber-700/10 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-110"
                                      : "bg-[#1c1917]/60 border border-amber-900/30 hover:bg-amber-900/20 hover:border-amber-600/50 hover:-translate-y-0.5"
                                  }`}
                                >
                                  {emoji.startsWith("/") ? (
                                    <img
                                      src={emoji}
                                      alt="Avatar"
                                      loading="lazy"
                                      decoding="async"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    emoji
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-amber-900/20">
                  <Button
                    variant="ghost"
                    onClick={() => setShowEditProfile(false)}
                    className="flex-1 text-amber-600 hover:text-amber-400 hover:bg-amber-900/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold shadow-lg shadow-amber-900/20"
                  >
                    Salvar Alteracoes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showCertificate && (
          <Certificate
            fullName={savedCertName || fullName || state.playerName}
            completionDate={new Date().toLocaleDateString("pt-BR")}
            totalXP={state.totalXP}
            challengesCompleted={completedCount}
            onClose={() => setShowCertificate(false)}
          />
        )}

        <section id="achievements-section">
          <div id="profile-tour-achievements" className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold font-serif text-amber-200 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-400" />
              Sala das Conquistas
            </h3>
            <span className="text-sm font-mono text-amber-500">
              {unlockedAchievements.length} de {state.achievements.length} desbloqueadas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((ach) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1c1917] border border-amber-500/40 rounded-2xl p-5 flex gap-4 shadow-lg shadow-amber-900/10 group"
              >
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform overflow-hidden">
                  {ach.icon.startsWith("/") ? (
                    <img src={ach.icon} alt={ach.title} className="w-full h-full object-cover p-1" />
                  ) : (
                    ach.icon
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-100">{ach.title}</h4>
                  <p className="text-xs text-amber-400/60 leading-tight mt-1">{ach.description}</p>

                  {ach.titleReward && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-xs font-mono text-amber-500">
                        Titulo: <span className="text-amber-200">{ach.titleReward}</span>
                      </div>
                      {state.equippedTitle === ach.titleReward ? (
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-bold uppercase tracking-tighter">
                          Ativo
                        </span>
                      ) : (
                        <button
                          onClick={() => dispatch({ type: "SET_TITLE", title: ach.titleReward! })}
                          className="text-xs bg-stone-800 hover:bg-amber-600 hover:text-amber-950 transition-colors px-2 py-0.5 rounded border border-stone-700 text-stone-400 uppercase font-bold tracking-tighter"
                        >
                          Equipar
                        </button>
                      )}
                    </div>
                  )}

                  {!ach.titleReward && ach.unlockedAt && (
                    <div className="text-xs font-mono text-amber-600 mt-2">
                      {new Date(ach.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {lockedAchievements.map((ach) => (
              <div
                key={ach.id}
                className="bg-[#1c1917]/40 border border-stone-800/50 rounded-2xl p-5 flex gap-4 opacity-60 grayscale"
              >
                <div className="w-14 h-14 rounded-xl bg-stone-900 border border-stone-800/50 flex items-center justify-center text-3xl grayscale overflow-hidden">
                  {ach.icon.startsWith("/") ? (
                    <img src={ach.icon} alt={ach.title} className="w-full h-full object-cover p-2 opacity-50" />
                  ) : (
                    ach.icon
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-stone-400">{ach.title}</h4>
                  <p className="text-xs text-stone-500 leading-tight mt-1">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {(user?.email?.toLowerCase() === "thiago.ramos356@gmail.com" ||
          user?.email?.toLowerCase() === "thiago.ramos.pro@gmail.com") && (
          <details className="bg-[#1c1917]/35 border border-amber-900/10 rounded-3xl p-5 md:p-6 border-dashed group">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-4">
              <div className="flex items-start md:items-center gap-3 md:gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-amber-900/20 flex items-center justify-center shrink-0">
                  <Terminal className="w-5 h-5 text-amber-500/50" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold font-serif text-amber-100/70">Ferramentas de Desenvolvedor</h3>
                  <p className="text-xs text-amber-600/40 font-mono leading-relaxed">
                    Painel tecnico recolhido para nao competir com a jornada principal.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-600/60 group-open:text-amber-400 transition-colors">
                Expandir
              </span>
            </summary>

            <div className="mt-6 space-y-6 border-t border-amber-900/10 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-base font-bold font-serif text-amber-100/70">Modo Desenvolvedor</h4>
                  <p className="text-xs text-amber-600/40 font-mono leading-relaxed">
                    Ignora requisitos de XP para desbloquear mundos.
                  </p>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 bg-amber-950/20 px-4 py-2 rounded-2xl border border-amber-900/20 shrink-0">
                  <Label htmlFor="dev-mode" className="text-[10px] font-mono uppercase tracking-tighter text-amber-600/60">
                    {state.isDevMode ? "Ativado" : "Desativado"}
                  </Label>
                  <Switch
                    id="dev-mode"
                    checked={state.isDevMode}
                    onCheckedChange={() => dispatch({ type: "TOGGLE_DEV_MODE" })}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-amber-900/10 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-4 bg-amber-950/10 border border-amber-900/20 rounded-2xl">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-amber-100/60 font-mono">XP de Teste</h4>
                      <p className="text-[10px] text-amber-600/40 font-mono">Adicionar XP para testar leveis.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => dispatch({ type: "DEBUG_ADD_XP", amount: 5000 })}
                      className="bg-amber-900/20 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    >
                      +5000 XP
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 bg-amber-950/10 border border-amber-900/20 rounded-2xl">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-amber-100/60 font-mono">Conquistas</h4>
                      <p className="text-[10px] text-amber-600/40 font-mono">Desbloquear todas as lendas.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => dispatch({ type: "DEBUG_UNLOCK_ALL_ACHIEVEMENTS" })}
                      className="bg-amber-900/20 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    >
                      Unlock All
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-4 bg-amber-950/10 border border-amber-900/20 rounded-2xl">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-amber-100/60 font-mono">Onboarding</h4>
                      <p className="text-[10px] text-amber-600/40 font-mono">Resetar tutorial inicial.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        dispatch({ type: "DEBUG_RESET_TUTORIAL" });
                        toast.success("Tutorial resetado! Recarregue ou navegue para ver.");
                      }}
                      className="bg-amber-900/20 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    >
                      Reset Tutorial
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 bg-amber-950/10 border border-amber-900/20 rounded-2xl">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-amber-100/60 font-mono">Sequencia (Streak)</h4>
                      <p className="text-[10px] text-amber-600/40 font-mono">Aumentar chama ativa (+7 dias).</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => dispatch({ type: "DEBUG_ADD_STREAK", days: 7 })}
                      className="bg-amber-900/20 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    >
                      +7 Dias
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 bg-amber-950/10 border border-amber-900/20 rounded-2xl">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-amber-100/60 font-mono">Debug State</h4>
                      <p className="text-[10px] text-amber-600/40 font-mono">Copiar estado JSON para o clipboard.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(state, null, 2));
                        toast.info("Estado copiado para o clipboard!");
                        console.log("GAME STATE DEBUG:", state);
                      }}
                      className="bg-amber-900/20 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    >
                      Copy State
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-amber-900/10 pt-6">
                <h4 className="text-sm font-bold text-amber-100/60 font-mono mb-4">Completar Mundo (Debug)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {WORLDS.map((world) => (
                    <Button
                      key={world.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        dispatch({ type: "DEBUG_COMPLETE_WORLD", worldId: world.id });
                        
                        // Limpar notificações para que o modal apareça ao voltar ao mapa
                        const storageKeyNotif = `sql_quest_completed_worlds_notif_${user?.id || 'guest'}`;
                        const raw = localStorage.getItem(storageKeyNotif);
                        if (raw) {
                          try {
                            const ids = JSON.parse(raw) as string[];
                            localStorage.setItem(storageKeyNotif, JSON.stringify(ids.filter(id => id !== world.id)));
                          } catch (e) {}
                        }

                        toast.success(`Mundo "${world.title}" completado! Volte ao mapa para ver a celebração.`);
                      }}
                      className="bg-amber-900/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] font-mono h-auto py-2 px-1 text-center leading-tight"
                    >
                      {world.title}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-amber-900/10 pt-6">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-amber-100/60 font-mono">Teste de Maestria</h4>
                  <p className="text-[10px] text-amber-600/40 font-mono">
                    Concluir instantaneamente todo o jogo para validar o diploma.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    dispatch({ type: "DEBUG_COMPLETE_ALL" });
                    
                    // Limpar todas as notificações para que os modals apareçam ao voltar ao mapa
                    const storageKeyUnlock = `sql_quest_notified_worlds_${user?.id || 'guest'}`;
                    const storageKeyNotif = `sql_quest_completed_worlds_notif_${user?.id || 'guest'}`;
                    localStorage.removeItem(storageKeyUnlock);
                    localStorage.removeItem(storageKeyNotif);

                    toast.success("Jogo 100% completado! Volte ao mapa para ver as celebrações.");
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-amber-950 border border-amber-500/30 font-bold px-6"
                >
                  Completar 100%
                </Button>
              </div>
            </div>
          </details>
        )}

        <details className="relative overflow-hidden group bg-[#120a0a]/55 border border-red-900/20 rounded-3xl p-6">
          <summary className="list-none cursor-pointer flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-950 to-[#120a0a] border border-red-900/40 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-serif text-red-100 tracking-tight">Zona de Perigo</h3>
                <p className="text-sm text-red-500/55 font-mono max-w-xl">
                  Acoes irreversiveis ficam recolhidas aqui para nao poluir a leitura principal do perfil.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-500/60 group-open:text-red-300 transition-colors">
              Expandir
            </span>
          </summary>

          <div className="mt-6 border-t border-red-900/15 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1c1414] border border-red-900/20 rounded-2xl p-6 space-y-6 flex flex-col justify-between hover:border-red-600/20 transition-colors shadow-inner">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    <h4 className="text-red-200/90 font-bold font-serif text-lg">Reiniciar Jornada</h4>
                  </div>
                  <p className="text-[11px] text-red-500/50 font-mono leading-relaxed">
                    Todo o seu XP, nivel e lendas conquistadas serao apagados. Voce retornara as sombras como um
                    completo desconhecido.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowResetAllConfirm(true)}
                  className="w-full h-11 bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white transition-all gap-2 font-bold text-xs uppercase tracking-widest"
                >
                  <Target className="w-4 h-4" />
                  Zerar todo o progresso
                </Button>
              </div>

              <div className="bg-[#1c1414] border border-red-900/20 rounded-2xl p-6 space-y-6 flex flex-col justify-between hover:border-red-600/20 transition-colors shadow-inner">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                    <h4 className="text-amber-200/90 font-bold font-serif text-lg">Resetar Mundo</h4>
                  </div>
                  <p className="text-[11px] text-amber-500/50 font-mono leading-relaxed">
                    Apague as cronicas de um reino especifico sem afetar o restante das suas conquistas.
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    className="bg-[#0d0b08] border border-amber-900/20 text-amber-100/70 rounded-xl px-4 text-xs flex-1 focus:border-amber-500 outline-none transition-all cursor-pointer hover:bg-black/40"
                    value={worldToReset}
                    onChange={(e) => setWorldToReset(e.target.value)}
                  >
                    <option value="">Selecione um Mundo...</option>
                    {WORLDS.map((world) => (
                      <option key={world.id} value={world.id}>
                        {world.title}
                      </option>
                    ))}
                  </select>
                  <Button
                    disabled={!worldToReset}
                    onClick={() => setShowResetWorldConfirm(true)}
                    className="px-5 bg-amber-900/20 border border-amber-900/30 text-amber-600 hover:bg-amber-600 hover:text-amber-950 disabled:opacity-30 transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    Zerar
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-center border-t border-red-900/10 pt-6 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500/50 hover:text-red-400 transition-all gap-2 text-[10px] font-mono uppercase tracking-[0.3em] h-auto py-3 px-6 group/del rounded-xl hover:bg-red-500/5"
              >
                <Trash2 className="w-3.5 h-3.5 group-hover/del:scale-110 transition-all" />
                <span>Encerrar Conta Permanentemente</span>
              </Button>
            </div>
          </div>
        </details>

        <AnimatePresence>
          {showResetAllConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full bg-[#1c1917] border-2 border-amber-600/30 rounded-3xl p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-serif text-white">Zerar tudo?</h2>
                  <p className="text-amber-400/60 text-sm">
                    Isso resetara seu nivel, todo o seu XP acumulado e conquistas. Voce voltara a ser um novato
                    absoluto.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    onClick={() => {
                      resetAllProgress();
                      setShowResetAllConfirm(false);
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold"
                  >
                    Sim, recomecar jornada
                  </Button>
                  <Button variant="ghost" onClick={() => setShowResetAllConfirm(false)} className="text-stone-500">
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {showResetWorldConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full bg-[#1c1917] border-2 border-amber-600/30 rounded-3xl p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                  <Settings className="w-8 h-8 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-serif text-white">
                    Resetar {WORLDS.find((world) => world.id === worldToReset)?.title}?
                  </h2>
                  <p className="text-amber-400/60 text-sm">
                    Apenas o progresso deste mundo especifico sera apagado. Seu XP total sera recalculado com base nos
                    mundos restantes.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    onClick={() => {
                      resetWorldProgress(worldToReset);
                      setShowResetWorldConfirm(false);
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold"
                  >
                    Confirmar reset de mundo
                  </Button>
                  <Button variant="ghost" onClick={() => setShowResetWorldConfirm(false)} className="text-stone-500">
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-[#1c1917] border-2 border-red-600/30 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(220,38,38,0.1)]"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-serif text-white">Tem certeza absoluta?</h2>
                <p className="text-red-400/70 text-sm">
                  Esta acao ira apagar permanentemente seu perfil, seu nivel {level}, todos os seus{" "}
                  {state.totalXP.toLocaleString()} XP, conquistas e progresso em todos os mundos.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold h-12 gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Sim, excluir tudo permanentemente
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="text-stone-500 hover:text-white"
                >
                  Cancelar e manter minha lenda
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes slide {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
        @keyframes xpshimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <TutorialTour
        steps={PROFILE_TOUR_STEPS}
        isOpen={showProfileTour}
        onClose={handleCloseProfileTour}
      />

      <Codex isOpen={showCodex} onClose={() => setShowCodex(false)} />
    </div>
  );
}
