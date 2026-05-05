import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Terminal, Maximize2, Minimize2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isCorrect: boolean | null;
  feedback: string;
  output: string;
  attempts: number;
  hintsUsed: number;
  xpEarned: number;
  onNext: () => void;
  onBack: () => void;
  hasNextChallenge: boolean;
  wasAlreadyCompleted?: boolean;
}

export function ResultPanel({
  isExpanded,
  setIsExpanded,
  isCorrect,
  feedback,
  output,
  attempts,
  hintsUsed,
  xpEarned,
  onNext,
  onBack,
  hasNextChallenge,
  wasAlreadyCompleted = false,
}: Props) {
  const showNextButton = isCorrect || wasAlreadyCompleted;

  return (
    <div className={`${isExpanded ? "flex-[2]" : "lg:w-[380px]"} flex flex-col bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-500`}>
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 text-sky-100 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-sky-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Console Terminal</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-500 hover:text-white transition-colors"
          title={isExpanded ? "Reduzir console" : "Expandir console"}
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      <div className="flex-1 p-5 font-mono text-sm overflow-y-auto bg-slate-950/80 text-slate-100 min-h-[200px] scrollbar-thin scrollbar-thumb-white/10">
        {output ? (
          <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
        ) : (
          <div className="text-slate-600 italic animate-pulse">Aguardando execução dos rituais...</div>
        )}
      </div>

      <div className="p-4 bg-slate-900/60 border-t border-white/5">
        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-xl border backdrop-blur-md ${
              isCorrect
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-black text-xs uppercase tracking-wider">
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>{isCorrect ? "Protocolo Sincronizado" : "Erro na Frequência"}</span>
            </div>
            <p className="text-xs font-medium leading-relaxed opacity-90">{feedback}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 transition-colors hover:bg-white/10">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">TENTATIVAS</div>
            <div className="text-sm font-black text-white">{attempts}</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 transition-colors hover:bg-white/10">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">DICAS</div>
            <div className="text-sm font-black text-amber-400">{hintsUsed}</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 transition-colors hover:bg-white/10">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">RECOMPENSA</div>
            <div className="text-sm font-black text-emerald-400">{xpEarned} XP</div>
          </div>
        </div>

        {showNextButton && (
          <Button 
            onClick={hasNextChallenge ? onNext : onBack} 
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl shadow-lg shadow-sky-900/20 transition-all active:scale-95"
          >
            {hasNextChallenge ? "PRÓXIMO RITUAL" : "VOLTAR AO ARQUIPÉLAGO"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
