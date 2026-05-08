import { Terminal } from "lucide-react";

interface Props {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
  pythonReady: boolean;
}

export default function PythonEditor({ code, onChange, isRunning, pythonReady }: Props) {
  return (
    <div className="flex flex-col h-full bg-slate-900/60 border-t border-white/5 overflow-hidden transition-all focus-within:border-sky-500/30">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-[10px] font-mono text-sky-200/50 uppercase tracking-[0.2em]">Câmara de Código</span>
        </div>
        <div className="flex gap-1.5 opacity-50">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
        </div>
      </div>

      <div className="relative flex-1">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newCode = code.substring(0, start) + "    " + code.substring(end);
              onChange(newCode);
              
              // Set cursor position after the next render
              setTimeout(() => {
                const target = e.target as HTMLTextAreaElement;
                target.selectionStart = target.selectionEnd = start + 4;
              }, 0);
            }
          }}
          spellCheck={false}
          className="w-full h-full p-6 bg-transparent text-sky-100 font-mono text-sm resize-none focus:outline-none selection:bg-sky-500/30 placeholder:text-slate-600 transition-colors"
          placeholder="# Invoque seus comandos aqui..."
          disabled={!pythonReady || isRunning}
        />
        
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-sky-500/[0.03] to-transparent" />
      </div>
    </div>
  );
}
