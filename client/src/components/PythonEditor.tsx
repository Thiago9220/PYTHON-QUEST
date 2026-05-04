import React from "react";
import { motion } from "framer-motion";
import { Play, Terminal } from "lucide-react";

interface Props {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
  pythonReady: boolean;
}

export default function PythonEditor({ code, onChange, onRun, isRunning, pythonReady }: Props) {
  return (
    <div className="flex flex-col h-full bg-[#1a1612] border border-[#3d352a] rounded-xl overflow-hidden shadow-2xl">
      {/* Header do Terminal */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#26201a] border-b border-[#3d352a]">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-[#a68d6d]" />
          <span className="text-xs font-mono text-[#a68d6d] uppercase tracking-widest">Python Interpreter</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3d352a]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#3d352a]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#3d352a]" />
        </div>
      </div>

      {/* Área de Edição */}
      <div className="relative flex-1 group">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full h-full p-6 bg-transparent text-[#e6d5bc] font-mono text-sm resize-none focus:outline-none selection:bg-[#a68d6d]/30"
          placeholder="# Escreva seu feitiço Python aqui..."
          disabled={!pythonReady || isRunning}
        />
        
        {/* Botão de Execução Flutuante */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRun}
          disabled={!pythonReady || isRunning}
          className="absolute bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-[#a68d6d] hover:bg-[#c4a484] text-[#1a1612] font-bold rounded-full shadow-[0_0_20px_rgba(166,141,109,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <div className="w-5 h-5 border-2 border-[#1a1612]/30 border-t-[#1a1612] rounded-full animate-spin" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
          <span>EXECUTAR</span>
        </motion.button>
      </div>
    </div>
  );
}
