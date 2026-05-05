import { BookOpen, ClipboardList, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { Challenge } from "@/lib/types";

interface Props {
  challenge: Challenge;
  activeTab: "mission" | "concept";
  setActiveTab: (tab: "mission" | "concept") => void;
  themeColor?: string;
  hintsUsed?: number;
}

export function MissionPanel({ 
  challenge, 
  activeTab, 
  setActiveTab, 
  themeColor = "#0ea5e9", 
  hintsUsed = 0,
}: Props) {
  return (
    <div className="flex flex-col glass-dark overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl">
      <div className="flex bg-slate-900/60 border-b border-white/5 backdrop-blur-md">
        <button
          onClick={() => setActiveTab("mission")}
          className={`flex items-center gap-2 px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all border-b-2`}
          style={{ 
            borderColor: activeTab === "mission" ? themeColor : "transparent",
            color: activeTab === "mission" ? themeColor : "#94a3b8"
          }}
        >
          <ClipboardList size={14} className={activeTab === "mission" ? "" : "text-slate-600"} />
          Missão
        </button>
        <button
          onClick={() => setActiveTab("concept")}
          className={`flex items-center gap-2 px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all border-b-2`}
          style={{ 
            borderColor: activeTab === "concept" ? themeColor : "transparent",
            color: activeTab === "concept" ? themeColor : "#94a3b8"
          }}
        >
          <BookOpen size={14} className={activeTab === "concept" ? "" : "text-slate-600"} />
          Conceito
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[40vh] lg:max-h-[400px] space-y-6 scrollbar-thin scrollbar-thumb-white/10 bg-slate-950/20">
        {activeTab === "mission" ? (
          <div className="space-y-6">
            <div className="relative">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2" style={{ color: themeColor }}>
                <span className="h-1 w-3 rounded-full" style={{ backgroundColor: themeColor }} />
                Contexto Narrativo
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm font-medium pl-5 border-l border-white/10 italic">
                "{challenge.narrative}"
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl shadow-inner-white overflow-hidden relative group">
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ backgroundImage: `linear-gradient(to bottom right, ${themeColor}, transparent)` }}
              />
              <h3 className="text-white/50 text-[9px] font-black uppercase tracking-[0.25em] mb-2">Diretriz do Operador</h3>
              <p className="text-white leading-relaxed font-bold text-lg tracking-tight">{challenge.description}</p>
            </div>

            {hintsUsed > 0 && challenge.hints.slice(0, hintsUsed).map((hint, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl"
              >
                <div className="bg-amber-500/10 p-2 rounded-xl shadow-sm">
                  <Lightbulb className="text-amber-400" size={18} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest">Dica do Sistema {idx + 1}</span>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{hint.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 p-6 rounded-2xl border border-sky-500/20 shadow-lg">
            <div className="inline-block px-3 py-1 bg-sky-500/20 text-sky-400 font-bold uppercase tracking-wider text-[10px] rounded-full mb-4">
              Conceito: {challenge.concept}
            </div>
            <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
              {challenge.conceptExplanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
