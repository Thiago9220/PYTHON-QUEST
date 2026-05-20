import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { Button } from "./ui/button";
import { RotateCcw, Terminal, Trash2, Zap, Unlock, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function DevPanel() {
  const { user } = useAuth();
  const { dispatch, state, resetAllProgress, resetWorldProgress } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  // Ferramentas locais de desenvolvimento nao devem aparecer no build publicado.
  if (!import.meta.env.DEV || user?.email !== "thiago.ramoss2009@gmail.com") return null;

  const getActiveWorldId = () => {
    if (state.currentWorldId) return state.currentWorldId;

    try {
      const savedView = JSON.parse(localStorage.getItem("python_quest_current_view") ?? "null");
      if (
        savedView?.name === "list" ||
        savedView?.name === "arena" ||
        savedView?.name === "boss"
      ) {
        return typeof savedView.worldId === "string" ? savedView.worldId : null;
      }
    } catch {
      return null;
    }

    return null;
  };

  const handleAddXP = () => {
    dispatch({ type: "DEBUG_ADD_XP", amount: 1000 });
    toast.success("Adicionado 1000 XP (DEV)");
  };

  const handleCompleteWorld = () => {
    const activeWorldId = getActiveWorldId();
    if (!activeWorldId) {
      toast.error("Entre em um mundo primeiro para completá-lo.");
      return;
    }
    dispatch({ type: "DEBUG_COMPLETE_WORLD", worldId: activeWorldId });
    toast.success("Mundo atual completado (DEV)");
  };

  const handleUnlockAllAchievements = () => {
    dispatch({ type: "DEBUG_UNLOCK_ALL_ACHIEVEMENTS" });
    toast.success("Todas as conquistas desbloqueadas (DEV)");
  };

  const handleCompleteAll = () => {
    dispatch({ type: "DEBUG_COMPLETE_ALL" });
    toast.success("Tudo completado (DEV)");
  };

  const handleResetWorld = async () => {
    const activeWorldId = getActiveWorldId();
    if (!activeWorldId) {
      toast.error("Entre em um mundo primeiro para zerá-lo.");
      return;
    }
    if (!window.confirm("Zerar o progresso do mundo atual?")) return;
    await resetWorldProgress(activeWorldId);
  };

  const handleResetAll = async () => {
    if (!window.confirm("Zerar TODO o progresso da conta?")) return;
    await resetAllProgress();
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex flex-col items-start gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-slate-900 border border-fuchsia-500/50 rounded-xl p-4 shadow-2xl shadow-fuchsia-500/20 w-64"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-fuchsia-400 font-black text-xs uppercase tracking-widest">
                <Terminal size={14} /> Painel Master
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handleAddXP} variant="outline" size="sm" className="w-full justify-start text-xs border-white/10 hover:bg-white/5">
                <Zap className="mr-2 h-3 w-3 text-sky-400" /> Dar 1000 XP
              </Button>
              <Button onClick={handleCompleteWorld} variant="outline" size="sm" className="w-full justify-start text-xs border-white/10 hover:bg-white/5">
                <CheckCircle2 className="mr-2 h-3 w-3 text-emerald-400" /> Completar Mundo Atual
              </Button>
              <Button onClick={handleUnlockAllAchievements} variant="outline" size="sm" className="w-full justify-start text-xs border-white/10 hover:bg-white/5">
                <TrophyIcon className="mr-2 h-3 w-3 text-amber-400" /> Liberar Conquistas
              </Button>
              <Button onClick={handleCompleteAll} variant="outline" size="sm" className="w-full justify-start text-xs border-white/10 hover:bg-white/5 text-fuchsia-400 hover:text-fuchsia-300 border-fuchsia-500/30">
                <Unlock className="mr-2 h-3 w-3" /> Modo Deus (Tudo)
              </Button>
              <Button onClick={handleResetWorld} variant="outline" size="sm" className="w-full justify-start text-xs border-white/10 hover:bg-white/5 text-amber-300 hover:text-amber-200">
                <RotateCcw className="mr-2 h-3 w-3" /> Zerar Mundo Atual
              </Button>
              <Button onClick={handleResetAll} variant="outline" size="sm" className="w-full justify-start text-xs border-red-500/30 hover:bg-red-500/10 text-red-300 hover:text-red-200">
                <Trash2 className="mr-2 h-3 w-3" /> Zerar Tudo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 border border-fuchsia-500/50 hover:bg-slate-800 text-fuchsia-400 rounded-full h-10 px-4 shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <Terminal className="mr-2 h-3 w-3" /> Dev Mode
        </Button>
      )}
    </div>
  );
}

// Inline Trophy since I didn't import it at the top to save space
function TrophyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7c0 6 3 10 6 10s6-4 6-10V2z" />
    </svg>
  );
}
