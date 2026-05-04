import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Edit2,
  Flame,
  LogOut,
  Medal,
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

export default function Profile({ onBack }: Props) {
  const { state, dispatch, getPlayerLevel, getCompletedCount, getTotalChallenges } = useGame();
  const { user, logout, updateProfile } = useAuth();
  const { level, title, progress, nextLevelXP, isMaxLevel } = getPlayerLevel();

  const completedCount = getCompletedCount();
  const totalCount = getTotalChallenges();
  const unlockedAchievements = state.achievements.filter((achievement) => achievement.unlocked);
  const completionPercent = totalCount > 0 ? completedCount / totalCount : 0;
  const isCertificateReady = completionPercent >= 0.8;
  const challengesLeft = Math.max(totalCount - completedCount, 0);
  const displayTitle = state.equippedTitle ? `${title} - ${state.equippedTitle}` : title;

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
      label: "Desafios",
      value: `${completedCount}/${totalCount}`,
      helper: challengesLeft > 0 ? `${challengesLeft} restantes` : "trilha completa",
      icon: Target,
      bg: "bg-sky-50",
      color: "text-sky-700",
    },
    {
      label: "Conquistas",
      value: `${unlockedAchievements.length}/${state.achievements.length}`,
      helper: "titulos e marcos",
      icon: Trophy,
      bg: "bg-emerald-50",
      color: "text-emerald-700",
    },
    {
      label: "Sequencia",
      value: String(state.streak),
      helper: "dias ativos",
      icon: Flame,
      bg: "bg-orange-50",
      color: "text-orange-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} className="text-slate-600 hover:text-sky-700">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Mapa
            </Button>
            <div className="hidden h-6 w-px bg-sky-100 sm:block" />
            <h1 className="text-xl font-black text-sky-700">Perfil Python Quest</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowCodex(true)} className="text-slate-600 hover:text-sky-700" title="Guia Python">
              <BookOpen className="h-5 w-5" />
            </Button>
            <VolumeControl isMuted={state.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
            <Button variant="ghost" onClick={logout} className="text-slate-500 hover:text-red-600">
              <LogOut className="mr-1 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
          <div className="grid gap-8 p-6 md:grid-cols-[220px_1fr] md:p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-emerald-400 text-5xl font-black text-white shadow-lg shadow-sky-950/10">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    (displayName || "P").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-black text-sky-700 shadow-sm">
                  <Medal className="h-3 w-3" />
                  LVL {level}
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="mb-2 font-mono text-xs uppercase tracking-widest text-sky-700">Arquipelago Aurora</p>
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-4xl font-black text-slate-950">{displayName || "Explorador"}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowEditProfile(true)} className="text-slate-400 hover:text-sky-700">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{displayTitle}</p>
                </div>

                <Button onClick={() => setShowAchievements(true)} variant="outline" className="border-sky-200 bg-white text-sky-700 hover:bg-sky-50">
                  <Trophy className="mr-2 h-4 w-4" />
                  Conquistas
                </Button>
              </div>

              <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-600">
                Sua proxima meta: {challengesLeft > 0 ? `faltam ${challengesLeft} desafios para ampliar sua pratica em Python.` : "voce concluiu todos os desafios disponiveis."}
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-slate-500">
                  <span>{state.totalXP.toLocaleString()} XP</span>
                  <span>{isMaxLevel ? "nivel maximo" : `proximo nivel: ${nextLevelXP} XP`}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-sky-100 bg-sky-50/50 p-6 md:grid-cols-3">
            {stats.map((stat) => (
              <button
                key={stat.label}
                onClick={stat.label === "Conquistas" ? () => setShowAchievements(true) : undefined}
                className={`rounded-2xl border border-white bg-white p-5 text-left shadow-sm ${stat.label === "Conquistas" ? "hover:border-sky-300" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-slate-500">{stat.label}</span>
                  <div className={`rounded-xl ${stat.bg} p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-black text-slate-950">{stat.value}</div>
                <p className="mt-1 text-sm text-slate-500">{stat.helper}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Award className={isCertificateReady ? "h-8 w-8 text-emerald-600" : "h-8 w-8 text-slate-300"} />
                  <h3 className="text-2xl font-black text-slate-950">Certificado de Jornada Python</h3>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                  O certificado e liberado quando voce conclui pelo menos 80% dos desafios do Arquipelago Aurora.
                </p>
              </div>
              <Button onClick={handleOpenCertificate} disabled={!isCertificateReady} className="bg-sky-600 font-bold hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-500">
                {isCertificateReady ? "Abrir certificado" : "Bloqueado"}
              </Button>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between font-mono text-xs uppercase tracking-widest text-slate-500">
                <span>Progresso</span>
                <span>{Math.round(completionPercent * 100)}% / 80%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, completionPercent * 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-sky-600" />
              <h3 className="text-xl font-black text-slate-950">Resumo</h3>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p>XP total: <span className="font-bold text-slate-950">{state.totalXP.toLocaleString()}</span></p>
              <p>Conquistas liberadas: <span className="font-bold text-slate-950">{unlockedAchievements.length}</span></p>
              <p>Titulo ativo: <span className="font-bold text-slate-950">{state.equippedTitle || title}</span></p>
            </div>
          </div>
        </section>
      </main>

      {showEditProfile && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-sky-950/25 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-950/10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-950">Editar perfil</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowEditProfile(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Nome</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={24} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">URL do avatar</label>
                <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditProfile(false)}>Cancelar</Button>
              <Button onClick={handleSaveProfile} className="bg-sky-600 hover:bg-sky-700">Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {showNameInput && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-sky-950/25 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-950/10">
            <h2 className="text-2xl font-black text-slate-950">Nome no certificado</h2>
            <p className="mt-2 text-sm text-slate-600">Use o nome que deve aparecer no certificado final.</p>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-5" />
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNameInput(false)}>Cancelar</Button>
              <Button onClick={handleConfirmCertificateName} className="bg-sky-600 hover:bg-sky-700">Confirmar</Button>
            </div>
          </div>
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
