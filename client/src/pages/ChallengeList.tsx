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
  Zap
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
  onBack: () => void;
  onBackToHome: () => void;
  onOpenProfile: () => void;
};

export default function ChallengeList({ worldId, onSelectChallenge, onBack, onBackToHome, onOpenProfile }: Props) {
  const { isChallengeCompleted, state, getPlayerLevel, dispatch } = useGame();
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
    if (completionPct >= 50) return "Sua conexão com o Arquipélago está se fortalecendo.";
    return "Um bom começo. O conhecimento Python aguarda sua determinação.";
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500/30 overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 20% 30%, ${themeColor}33, transparent 50%), radial-gradient(circle at 80% 70%, ${themeColor}22, transparent 50%)` 
          }} 
        />
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0 bg-slate-950" 
        />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:80px_80px]" />
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
              Python Quest
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
                  LVL {level} {title}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] font-black text-sky-400 font-mono">{state.totalXP.toLocaleString()} XP</span>
                  <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div className="h-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]" animate={{ width: `${progress}%` }} />
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
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-white/5">
          {/* World Background Image */}
          {world.bgImage && (
            <div className="absolute inset-0 z-0">
              <img 
                src={world.bgImage} 
                alt={world.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950" />
            </div>
          )}
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{world.subtitle}</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
                {world.title}
              </h1>
              <p className="max-w-2xl text-slate-400 text-lg md:text-xl leading-relaxed font-medium">
                {world.lore}
              </p>
            </motion.div>
          </div>
          
          {/* Decorative Glow */}
          <div 
            className="absolute -right-[10%] top-0 h-[600px] w-[600px] rounded-full blur-[160px] opacity-20 pointer-events-none"
            style={{ backgroundColor: themeColor }}
          />
        </section>

        {/* Challenge List Section */}
        <section className="max-w-4xl mx-auto px-6 pb-32">
          {/* Progress Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl border border-white/20 p-6 md:p-8 mb-12 shadow-2xl relative overflow-hidden group"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Status da Expedição</p>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{motivationalMessage}</h3>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full rounded-full shadow-[0_0_15px_rgba(56,189,248,0.3)]" 
                      style={{ backgroundColor: themeColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPct}%` }} 
                      transition={{ duration: 1.5, ease: "circOut" }}
                    />
                  </div>
                  <span className="text-sm font-black font-mono text-white" style={{ color: themeColor }}>{completionPct}%</span>
                </div>
              </div>
              
              {nextIncompleteIdx !== -1 && (
                <Button 
                  onClick={() => nextChallengeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })} 
                  className="w-full md:w-auto bg-white text-slate-950 hover:bg-slate-200 font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  {completedCount === 0 ? "INICIAR PROTOCOLO" : `CONTINUAR #${nextIncompleteIdx + 1}`}
                </Button>
              )}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
          </div>
        </section>
      </main>
    </div>
  );
}
