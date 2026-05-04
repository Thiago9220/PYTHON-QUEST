import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Terminal } from "lucide-react";

interface Props {
  isCorrect: boolean | null;
  feedback: string;
  output: string;
}

export function ResultPanel({ isCorrect, feedback, output }: Props) {
  return (
    <div className="flex flex-col h-full bg-[#1a1612] border border-[#3d352a] rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center px-4 py-2 bg-[#26201a] border-b border-[#3d352a]">
        <Terminal size={16} className="text-[#a68d6d] mr-2" />
        <span className="text-xs font-mono text-[#a68d6d] uppercase tracking-widest">Output Console</span>
      </div>

      <div className="flex-1 p-6 font-mono text-sm overflow-y-auto">
        {output ? (
          <div className="text-[#e6d5bc] whitespace-pre-wrap mb-4">
            <span className="text-[#a68d6d] mr-2">>>></span>
            {output}
          </div>
        ) : (
          <div className="text-[#3d352a] italic">Aguardando execução...</div>
        )}

        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg border ${
              isCorrect 
                ? "bg-emerald-900/20 border-emerald-700/30 text-emerald-400" 
                : "bg-red-900/20 border-red-700/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span className="font-bold uppercase tracking-wider">
                {isCorrect ? "Sucesso!" : "Erro de Validação"}
              </span>
            </div>
            <p className="text-sm opacity-90">{feedback}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
