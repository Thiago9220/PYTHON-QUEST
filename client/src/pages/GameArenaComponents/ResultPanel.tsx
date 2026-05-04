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
}: Props) {
  return (
    <div className={`${isExpanded ? "flex-[2]" : "lg:w-[380px]"} flex flex-col bg-white border border-sky-100 rounded-xl overflow-hidden shadow-sm`}>
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 text-sky-100">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-sky-300" />
          <span className="text-xs font-mono uppercase tracking-widest">Console</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sky-200/70 hover:text-white"
          title={isExpanded ? "Reduzir console" : "Expandir console"}
        >
          {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <div className="flex-1 p-5 font-mono text-sm overflow-y-auto bg-slate-950 text-slate-100 min-h-[220px]">
        {output ? (
          <pre className="whitespace-pre-wrap">{output}</pre>
        ) : (
          <div className="text-slate-500 italic">Aguardando execucao...</div>
        )}
      </div>

      <div className="p-4 border-t border-sky-100 bg-white">
        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg border ${
              isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-1 font-bold">
              {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span>{isCorrect ? "Correto" : "Ajuste necessario"}</span>
            </div>
            <p className="text-sm opacity-90">{feedback}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
          <div className="rounded-lg bg-sky-50 p-2">
            <div className="font-bold text-sky-700">{attempts}</div>
            <div className="text-slate-500">tentativas</div>
          </div>
          <div className="rounded-lg bg-amber-50 p-2">
            <div className="font-bold text-amber-700">{hintsUsed}</div>
            <div className="text-slate-500">dicas</div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2">
            <div className="font-bold text-emerald-700">{xpEarned}</div>
            <div className="text-slate-500">XP</div>
          </div>
        </div>

        {isCorrect && (
          <Button onClick={hasNextChallenge ? onNext : onBack} className="w-full bg-sky-600 hover:bg-sky-700">
            {hasNextChallenge ? "Proximo desafio" : "Voltar ao mundo"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
