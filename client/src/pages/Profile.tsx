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
  Zap,
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
      helper: challengesLeft > 0 ? `${challengesLeft} restantes` : "Trilha completa",
      icon: Target,
      color: "text-sky-400",
      glow: "shadow-sky-500/20",
    },
    {
      label: "Conquistas",
      value: `${unlockedAchievements.length}/${state.achievements.length}`,
      helper: "Títulos e marcos",
      icon: Trophy,
      color: "text-amber-400",
      glow: "shadow-amber-500/20",
    },
    {
      label: "Sequência",
      value: String(state.streak),
      helper: "Dias ativos",
      icon: Flame,
      color: "text-orange-400",
      glow: "shadow-orange-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30 overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.1),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.08),transparent_50%)]" />
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px]" 
        />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Mapa
            </Button>
            <div className="hidden h-6 w-px bg-white/10 sm:block" />
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-sky-400">Terminal do Operador</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowCodex(true)} 
              className="text-slate-400 hover:text-sky-400 hover:bg-sky-500/10" 
              title="Códice de Python"
            >
              <BookOpen className="h-5 w-5" />
            </Button>
            <VolumeControl isMuted={state.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
            <Button 
              variant="ghost" 
              onClick={logout} 
              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Main Profile Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark overflow-hidden rounded-[2.5rem] border border-white/20 p-1"
        >
          <div className="bg-slate-900/40 rounded-[2.4rem] p-6 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-sky-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-[2.5rem] border-2 border-white/20 bg-gradient-to-br from-sky-600/40 to-emerald-600/40 text-6xl font-black text-white shadow-2xl backdrop-blur-xl">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      (displayName || "P").charAt(0).toUpperCase()
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-sky-400/50 bg-slate-950 px-4 py-1.5 text-xs font-black text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)] backdrop-blur-xl"
                  >
                    <Medal className="h-4 w-4" />
                    NÍVEL {level}
                  </motion.div>
                </div>
              </div>

              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
                      <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Iniciado do Arquipélago</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <h2 className="truncate text-5xl font-black text-white tracking-tight leading-tight">{displayName || "Explorador"}</h2>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowEditProfile(true)} 
                        className="text-slate-500 hover:text-sky-400 hover:bg-white/5"
                      >
                        <Edit2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="mt-3 text-lg font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">{displayTitle}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => setShowAchievements(true)} 
                      className="bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md font-bold px-6 rounded-xl"
                    >
                      <Trophy className="mr-2 h-4 w-4 text-amber-400" />
                      Conquistas
                    </Button>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <span className="text-sky-400">{state.totalXP.toLocaleString()} XP TOTAL</span>
                    <span>{isMaxLevel ? "nível máximo" : `PRÓXIMO NÍVEL EM ${nextLevelXP - state.totalXP} XP`}</span>
                  </div>
                  <div className="relative h-4 overflow-hidden rounded-full bg-white/5 border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.2, ease: "circOut" }}
                      className="absolute inset-0 h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-px border-t border-white/10 bg-white/5 p-1 md:grid-cols-3">
            {stats.map((stat, idx) => (
              <motion.button
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                onClick={stat.label === "Conquistas" ? () => setShowAchievements(true) : undefined}
                className="group relative bg-slate-900/60 p-8 text-left hover:bg-slate-800/60 transition-all first:md:rounded-bl-[2.4rem] last:md:rounded-br-[2.4rem]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{stat.label}</span>
                  <div className={`rounded-xl bg-white/5 p-2.5 transition-transform group-hover:scale-110 group-hover:rotate-6 ${stat.color} shadow-lg ${stat.glow}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-4xl font-black text-white">{stat.value}</div>
                <p className="mt-2 text-xs font-medium text-slate-400 group-hover:text-slate-300">{stat.helper}</p>
                <div className="absolute inset-0 border-r border-white/5 group-last:border-r-0" />
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Certificate and Summary */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-dark rounded-[2rem] border border-white/20 p-8 flex flex-col justify-between"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${isCertificateReady ? "text-emerald-400" : "text-slate-600"}`}>
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Certificado de Acesso Root</h3>
                    <p className="text-sm font-medium text-slate-400">Valide seus conhecimentos arcanos em Python.</p>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm mb-6 max-w-xl">
                  O Core concede permissão Root apenas àqueles que invadem 80% dos nós da rede. O certificado é a chave mestra final.
                </p>
              </div>
              <Button 
                onClick={handleOpenCertificate} 
                disabled={!isCertificateReady} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-xl disabled:bg-white/5 disabled:text-slate-600 shadow-lg shadow-emerald-900/20"
              >
                {isCertificateReady ? "RECLAMAR SELO" : "BLOQUEADO"}
              </Button>
            </div>

            <div className="mt-auto">
              <div className="mb-3 flex justify-between font-mono text-[9px] font-black uppercase tracking-[0.2em]">
                <span className="text-slate-500">PROGRESSO DE MAESTRIA</span>
                <span className={isCertificateReady ? "text-emerald-400" : "text-slate-400"}>
                  {Math.round(completionPercent * 100)}% / 80%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/5 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, completionPercent * 100)}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className={`h-full rounded-full ${isCertificateReady ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-slate-700"}`}
                />
              </div>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-dark rounded-[2rem] border border-white/20 p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <Zap className="h-6 w-6 text-sky-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Registros do Codex</h3>
            </div>
            
            <div className="space-y-6">
              {[
                { label: "Experiência Pura", value: state.totalXP.toLocaleString(), suffix: "XP", color: "text-sky-400" },
                { label: "Marcas Desbloqueadas", value: unlockedAchievements.length, suffix: "RITUAIS", color: "text-emerald-400" },
                { label: "Título da Ordem", value: state.equippedTitle || title, suffix: "", color: "text-amber-400" },
                { label: "Eficiência de Script", value: "A+", suffix: "RATING", color: "text-rose-400" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">{item.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${item.color}`}>{item.value}</span>
                    <span className="text-[10px] font-black text-slate-600">{item.suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      {/* Modals with Glassmorphism */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" 
            onClick={() => setShowEditProfile(false)}
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-lg glass-dark rounded-[2.5rem] border border-white/20 p-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Reforjar Perfil</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowEditProfile(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Codinome do Operador</label>
                <Input 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  maxLength={24} 
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-12 rounded-xl focus:border-sky-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Frequência Visual (URL Avatar)</label>
                <Input 
                  value={avatarUrl} 
                  onChange={(e) => setAvatarUrl(e.target.value)} 
                  placeholder="https://..." 
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-12 rounded-xl focus:border-sky-500"
                />
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowEditProfile(false)} 
                className="flex-1 text-slate-400 hover:text-white hover:bg-white/5 font-bold h-12 rounded-xl"
              >
                Abafar
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-black h-12 rounded-xl shadow-lg shadow-sky-900/40"
              >
                REFORJAR
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {showNameInput && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" 
            onClick={() => setShowNameInput(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md glass-dark rounded-[2.5rem] border border-white/20 p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-black text-white">Nome do Receptáculo</h2>
            <p className="mt-2 text-sm text-slate-400 font-medium">Informe seu nome completo para selar o certificado.</p>
            <Input 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="mt-6 bg-white/5 border-white/10 text-white h-14 rounded-xl text-center text-lg font-bold" 
            />
            <div className="mt-8 flex gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowNameInput(false)} 
                className="flex-1 text-slate-400 hover:text-white h-12 font-bold"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleConfirmCertificateName} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black h-12 rounded-xl"
              >
                CONFIRMAR
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
