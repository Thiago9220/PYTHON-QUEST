import { useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Flame,
  Lock,
  LogOut,
  Star,
  Trophy,
  ChevronRight,
  BookOpen,
  Zap,
  Skull
} from "lucide-react";
import { VolumeControl } from "@/components/VolumeControl";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { getWorldById } from "@/lib/challenges";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DIFFICULTY_COLORS = {
  iniciante: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  intermediario: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  avancado: "text-red-400 bg-red-500/10 border-red-500/20",
  epico: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  lendario: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
};

type Props = {
  worldId: string;
  onSelectChallenge: (challengeId: string) => void;
  onSelectBoss?: () => void;
  onBack: () => void;
  onBackToHome: () => void;
  onOpenProfile: () => void;
};

export default function ChallengeList({ worldId, onSelectChallenge, onSelectBoss, onBack, onBackToHome, onOpenProfile }: Props) {
  const { isChallengeCompleted, isBossDefeated, isBossUnlocked, state, getPlayerLevel, dispatch } = useGame();
  const { user, logout } = useAuth();
  const world = getWorldById(worldId);
  const nextChallengeRef = useRef<HTMLDivElement>(null);

  if (!world) return null;

  const completedCount = world.challenges.filter((c) => isChallengeCompleted(c.id)).length;
  const completionPct = world.challenges.length > 0 ? Math.round((completedCount / world.challenges.length) * 100) : 0;
  const remaining = world.challenges.length - completedCount;
  const nextIncompleteIdx = world.challenges.findIndex((c) => !isChallengeCompleted(c.id));
  const { level, title, progress } = getPlayerLevel();
  const unlockedAchievements = state.achievements.filter((a) => a.unlocked);
  
  const themeColor = world.color || "#0EA5E9";

  const motivationalMessage = (() => {
    if (completedCount === 0) return "Inicie o protocolo de invasão e restaure o Core do sistema.";
    if (completionPct === 100) return "Domínio total do setor alcançado! Todos os módulos foram reescritos.";
    if (completionPct >= 75) return `Quase lá: restam apenas ${remaining} script${remaining > 1 ? "s" : ""} para o bypass final.`;
    if (completionPct >= 50) return "Sua sincronia com o Protocolo está se fortalecendo.";
    return "Um bom começo. O conhecimento Python aguarda sua determinação.";
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500/30 overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 transition-colors duration-1000" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 20% 30%, ${themeColor}33, transparent 50%), radial-gradient(circle at 80% 70%, ${themeColor}22, transparent 50%)` 
          }} 
        />
        
        {/* Animated Scanning Lines */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <motion.div 
            animate={{ y: ["0%", "100%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-full h-[100px] bg-gradient-to-b from-transparent via-white to-transparent"
          />
        </div>

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
            <button 
              className="hidden sm:block text-sm font-black uppercase tracking-[0.2em] text-sky-400 hover:text-sky-300 transition-colors" 
              onClick={onBackToHome}
            >
              Python Protocol
            </button>
          </div>

          <div className="flex items-center gap-3">
            {state.streak > 0 && (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <Flame className="w-4 h-4 fill-orange-500/20" />
                <span className="font-mono font-black text-xs">{state.streak}D</span>
              </div>
            )}
            <VolumeControl isMuted={state.isMuted} onToggleMute={() => dispatch({ type: "TOGGLE_MUTE" })} />
            
            <div
              className="flex bg-white/5 pl-4 py-1 pr-1 rounded-full border border-white/10 items-center gap-3 cursor-pointer hover:bg-white/10 transition-all hover:border-white/20"
              onClick={onOpenProfile}
            >
              <div className="hidden md:block text-right">
                <div className="text-[8px] uppercase font-black text-slate-500 tracking-widest leading-none mb-1">
                  {title}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-[11px] font-black text-white tracking-tighter">
                    {state.totalXP.toLocaleString()} <span className="text-[7px] text-sky-400">XP</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-sky-400 uppercase">LVL {level}</span>
                    <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div className="h-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]" animate={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-600 to-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-lg overflow-hidden border border-white/20">
                {user?.avatarEmoji?.startsWith("/") ? <img src={user.avatarEmoji} alt={state.playerName} className="w-full h-full object-cover" /> : state.playerName.charAt(0).toUpperCase() || "P"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* World Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20">
          {/* World Background Image with mask */}
          {world.bgImage && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <motion.img 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                transition={{ duration: 2 }}
                src={world.bgImage} 
                alt={world.title} 
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-50"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
              {/* Scanline pattern overlay on image */}
              <div className="absolute inset-0 opacity-10 pointer-events-none [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_3px,rgba(255,255,255,0.1)_3px)]" />
            </div>
          )}
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-1 backdrop-blur-md mb-4">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Setor Identificado: {worldId.replace(/-/g, '_').toUpperCase()}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-none relative group cursor-default">
                <span className="relative z-10">{world.title}</span>
                <motion.span 
                  className="absolute inset-0 z-0 opacity-20 blur-sm pointer-events-none group-hover:opacity-40 transition-opacity"
                  style={{ color: themeColor }}
                  animate={{ x: [-1, 1, -1], y: [1, -1, 1] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                >
                  {world.title}
                </motion.span>
              </h1>
              <p className="max-w-2xl text-slate-400 text-sm md:text-base leading-relaxed font-medium border-l-2 pl-6" style={{ borderColor: `${themeColor}40` }}>
                {world.lore}
              </p>
            </motion.div>
          </div>
          
          {/* HUD Decorative Elements */}
          <div className="absolute top-10 right-10 hidden lg:block opacity-20 font-mono text-[10px] text-slate-500 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} className="w-1/2 h-full bg-white/20" />
              </div>
              <span>COORDS_X: 42.12</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="w-1/2 h-full bg-white/20" />
              </div>
              <span>COORDS_Y: 89.04</span>
            </div>
          </div>
        </section>

        {/* Challenge List Section */}
        <section className="max-w-4xl mx-auto px-6 pb-32">
          {/* Progress Card */}
          {/* Progress Card (Diagnostic View) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-5 md:p-6 mb-10 shadow-2xl backdrop-blur-xl overflow-hidden group"
          >
            {/* Technical Border Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 opacity-50" style={{ borderColor: themeColor }} />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 opacity-50" style={{ borderColor: themeColor }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 opacity-50" style={{ borderColor: themeColor }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 opacity-50" style={{ borderColor: themeColor }} />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <BookOpen className="w-4 h-4" style={{ color: themeColor }} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Relatório de Diagnóstico</p>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">{motivationalMessage}</h3>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Progresso de Infiltração</span>
                    <span className="text-white font-mono">{completedCount}/{world.challenges.length} NODES SINCRO</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      {/* Grid background on progress bar */}
                      <div className="absolute inset-0 opacity-20 [background-size:10px_100%] [background-image:linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]" />
                      <motion.div 
                        className="h-full rounded-full relative z-10" 
                        style={{ 
                          backgroundColor: themeColor,
                          boxShadow: `0 0 15px ${themeColor}80`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPct}%` }} 
                        transition={{ duration: 1.5, ease: "circOut" }}
                      />
                    </div>
                    <span className="text-xs font-black font-mono text-white min-w-[3ch]" style={{ color: themeColor }}>
                      {completionPct}%
                    </span>
                  </div>
                </div>
              </div>
              
              {nextIncompleteIdx !== -1 && (
                <Button 
                  onClick={() => nextChallengeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })} 
                  className="w-full md:w-auto h-14 px-10 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all border group-hover:-translate-y-0.5 active:translate-y-0"
                  style={{ 
                    backgroundColor: `${themeColor}20`,
                    borderColor: `${themeColor}40`,
                    color: themeColor,
                    boxShadow: `0 0 20px ${themeColor}20`
                  }}
                >
                  {completedCount === 0 ? "INICIAR PROTOCOLO" : `BYPASS NODE #${nextIncompleteIdx + 1}`}
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </motion.div>

          {/* List */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 pl-4 border-l-2 border-white/10">Scripts Disponíveis</h2>
            {world.challenges.map((challenge, idx) => {
              const completed = isChallengeCompleted(challenge.id);
              const progressState = state.challengeProgress[challenge.id];
              const isLocked = idx > 0 && !isChallengeCompleted(world.challenges[idx - 1].id);

              return (
                <div key={challenge.id} ref={idx === nextIncompleteIdx ? nextChallengeRef : undefined}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (idx % 10) * 0.05 }}
                    onClick={() => {
                      if (isLocked) {
                        toast.error("Este conhecimento ainda está selado. Complete o ritual anterior.");
                        return;
                      }
                      onSelectChallenge(challenge.id);
                    }}
                    className={`group relative flex items-center gap-4 sm:gap-6 rounded-2xl p-5 sm:p-6 transition-all border backdrop-blur-sm ${
                      completed
                        ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
                        : isLocked
                          ? "border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed"
                          : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer shadow-xl"
                    }`}
                  >
                    <div className="shrink-0 relative">
                      {completed ? (
                        <div className="relative">
                          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                          <div className="absolute inset-0 blur-lg bg-emerald-500/40 opacity-50" />
                        </div>
                      ) : isLocked ? (
                        <Lock className="w-10 h-10 text-slate-600" />
                      ) : (
                        <div className="relative">
                          <Circle className="w-10 h-10 text-sky-400/50" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 hidden sm:flex w-10 h-10 rounded-xl border border-white/10 bg-white/5 items-center justify-center font-mono font-black text-xs text-slate-400 group-hover:border-white/30 transition-colors">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className={`text-xl font-black tracking-tight transition-colors ${isLocked ? "text-slate-600" : "text-white"}`}>
                          {isLocked ? "???" : challenge.title}
                        </h3>
                        {!isLocked && (
                          <span className={`text-[9px] px-3 py-1 rounded-full border font-black uppercase tracking-widest ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                            {challenge.difficulty}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm leading-relaxed truncate font-medium ${isLocked ? "text-slate-700" : "text-slate-400"}`}>
                        {isLocked ? "Complete o script anterior para desbloquear este módulo." : challenge.description}
                      </p>

                      {!isLocked && (
                        <div className="flex items-center gap-3 mt-4 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">
                            {challenge.concept}
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[9px] font-black uppercase tracking-widest text-sky-400">
                            <Zap className="w-3 h-3" />
                            {challenge.xpReward} XP
                          </div>
                          {progressState && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
                              {progressState.attempts} tentativas
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {!isLocked && (
                      <div className="shrink-0 transition-transform group-hover:translate-x-2 hidden md:block">
                        <ChevronRight className={`w-6 h-6 ${completed ? "text-emerald-500" : "text-slate-700 group-hover:text-white"}`} />
                      </div>
                    )}
                    
                    {completed && (
                      <div className="absolute right-4 top-4">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}

            {world.boss && onSelectBoss && (() => {
              const bossUnlocked = isBossUnlocked(world.id);
              const bossDefeated = isBossDefeated(world.boss.id);
              const threshold = Math.round(world.boss.unlockThreshold * 100);
              const currentPct = completionPct;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  onClick={() => {
                    if (!bossUnlocked) {
                      toast.error(`Complete ${threshold}% dos desafios para liberar o boss.`, {
                        description: `Progresso atual: ${currentPct}%`,
                      });
                      return;
                    }
                    onSelectBoss();
                  }}
                  className={`group relative mt-8 flex items-center gap-4 sm:gap-6 rounded-2xl p-6 sm:p-7 transition-all border-2 backdrop-blur-sm cursor-pointer ${
                    bossDefeated
                      ? "border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent"
                      : bossUnlocked
                        ? "hover:scale-[1.01] shadow-2xl"
                        : "opacity-60 cursor-not-allowed"
                  }`}
                  style={{
                    borderColor: bossDefeated
                      ? undefined
                      : bossUnlocked
                        ? `${themeColor}80`
                        : `${themeColor}30`,
                    background: bossUnlocked && !bossDefeated
                      ? `linear-gradient(to right, ${themeColor}15, transparent 60%)`
                      : undefined,
                    boxShadow: bossUnlocked && !bossDefeated
                      ? `0 0 40px -10px ${themeColor}60`
                      : undefined,
                  }}
                >
                  <div className="shrink-0 relative">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border-2"
                      style={{
                        backgroundColor: bossDefeated ? "#f59e0b22" : `${themeColor}22`,
                        borderColor: bossDefeated ? "#f59e0b" : themeColor,
                        boxShadow: bossUnlocked ? `0 0 30px ${themeColor}40` : undefined,
                      }}
                    >
                      {bossDefeated ? (
                        <Trophy className="w-7 h-7 text-amber-400" />
                      ) : (
                        <Skull className="w-7 h-7" style={{ color: themeColor }} />
                      )}
                    </div>
                    {bossUnlocked && !bossDefeated && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
                        style={{ borderColor: themeColor }}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span
                        className="text-[9px] font-black uppercase tracking-[0.3em]"
                        style={{ color: bossDefeated ? "#fbbf24" : themeColor }}
                      >
                        // Boss Encounter
                      </span>
                      {bossDefeated && (
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black uppercase tracking-widest">
                          Derrotado
                        </span>
                      )}
                      {!bossUnlocked && (
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-black uppercase tracking-widest flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          {threshold}% requerido
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-white leading-tight mb-1">
                      {world.boss.title}
                    </h3>
                    <p className="text-sm font-bold mb-3" style={{ color: themeColor }}>
                      » {world.boss.codename}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-300">
                        <Skull className="w-3 h-3" style={{ color: themeColor }} />
                        {world.boss.acts.length} atos
                      </div>
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest"
                        style={{
                          backgroundColor: `${themeColor}15`,
                          borderColor: `${themeColor}30`,
                          color: themeColor,
                        }}
                      >
                        <Zap className="w-3 h-3" />
                        +{world.boss.xpReward.toLocaleString()} XP
                      </div>
                      {!bossUnlocked && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500">
                          Atual: {currentPct}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 hidden md:block">
                    {bossUnlocked ? (
                      <ChevronRight
                        className="w-7 h-7 transition-transform group-hover:translate-x-2"
                        style={{ color: themeColor }}
                      />
                    ) : (
                      <Lock className="w-6 h-6 text-slate-700" />
                    )}
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </section>
      </main>
    </div>
  );
}
