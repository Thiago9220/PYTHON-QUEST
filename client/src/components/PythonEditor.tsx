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
    <div className="flex flex-col h-full bg-white border border-sky-100 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-sky-300" />
          <span className="text-xs font-mono text-sky-100 uppercase tracking-widest">Python</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
      </div>

      <div className="relative flex-1 min-h-[320px] lg:min-h-[360px]">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full h-full min-h-[320px] lg:min-h-[360px] p-5 bg-slate-950 text-sky-50 font-mono text-sm resize-none focus:outline-none selection:bg-sky-500/30"
          placeholder="# Escreva seu codigo Python aqui..."
          disabled={!pythonReady || isRunning}
        />
      </div>
    </div>
  );
}
