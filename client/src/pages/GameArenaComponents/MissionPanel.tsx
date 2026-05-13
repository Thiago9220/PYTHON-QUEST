import { useState, useEffect } from "react";
import { BookOpen, ClipboardList, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Challenge } from "@/lib/types";
import { ConceptExplanation } from "./ConceptExplanation";

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
              <p className="text-white leading-relaxed font-bold text-base tracking-tight">{challenge.description}</p>
            </div>

            {hintsUsed > 0 && (
              <HintCarousel hints={challenge.hints.slice(0, hintsUsed)} />
            )}
          </div>
        ) : (
          <ConceptExplanation
            concept={challenge.concept}
            text={challenge.conceptExplanation}
            themeColor={themeColor}
          />
        )}
      </div>
    </div>
  );
}

function HintCarousel({ hints }: { hints: { text: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(hints.length - 1);

  // Update index when new hint arrives
  useEffect(() => {
    if (hints.length > 0) {
      setCurrentIndex(hints.length - 1);
    }
  }, [hints.length]);

  if (!hints || hints.length === 0) return null;

  const currentHint = hints[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/20 p-1.5 rounded-lg">
            <Lightbulb className="text-amber-400" size={14} />
          </div>
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
            Arquivo de Ajuda {currentIndex + 1} de {hints.length}
          </span>
        </div>
        
        {hints.length > 1 && (
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1 hover:bg-white/5 rounded-md disabled:opacity-30 text-slate-400"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentIndex(Math.min(hints.length - 1, currentIndex + 1))}
              disabled={currentIndex === hints.length - 1}
              className="p-1 hover:bg-white/5 rounded-md disabled:opacity-30 text-slate-400"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl min-h-[80px] flex items-center">
        <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
          "{currentHint.text}"
        </p>
      </div>

      <div className="mt-2 flex justify-center gap-1">
        {hints.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all ${i === currentIndex ? "w-4 bg-amber-500" : "w-1 bg-white/10"}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
