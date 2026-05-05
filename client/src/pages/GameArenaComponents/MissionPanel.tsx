import { BookOpen, ClipboardList, Lightbulb } from "lucide-react";
import { Challenge } from "@/lib/types";

interface Props {
  challenge: Challenge;
  activeTab: "mission" | "concept";
  setActiveTab: (tab: "mission" | "concept") => void;
  themeColor?: string;
}

export function MissionPanel({ challenge, activeTab, setActiveTab, themeColor = "#0ea5e9" }: Props) {
  return (
    <div className="flex flex-col glass overflow-hidden rounded-2xl border-white/50">
      <div className="flex bg-slate-50/50 border-b border-sky-100/50 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab("mission")}
          className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2`}
          style={{ 
            borderColor: activeTab === "mission" ? themeColor : "transparent",
            color: activeTab === "mission" ? themeColor : undefined
          }}
        >
          <ClipboardList size={12} className={activeTab === "mission" ? "" : "text-slate-400"} />
          Missão
        </button>
        <button
          onClick={() => setActiveTab("concept")}
          className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2`}
          style={{ 
            borderColor: activeTab === "concept" ? themeColor : "transparent",
            color: activeTab === "concept" ? themeColor : undefined
          }}
        >
          <BookOpen size={12} className={activeTab === "concept" ? "" : "text-slate-400"} />
          Conceito
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[40vh] lg:max-h-[400px] space-y-4">
        {activeTab === "mission" ? (
          <div className="space-y-4">
            <div className="relative">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-2" style={{ color: themeColor }}>
                <span className="h-1 w-3 rounded-full" style={{ backgroundColor: themeColor }} />
                Contexto Narrativo
              </h3>
              <p className="text-slate-700 leading-relaxed text-sm font-medium pl-4 border-l-2 border-sky-100/50 italic">
                "{challenge.narrative}"
              </p>
            </div>

            <div className="p-3.5 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border border-emerald-100 rounded-xl shadow-inner-white">
              <h3 className="text-emerald-800 text-[9px] font-black uppercase tracking-[0.25em] mb-1.5">Objetivo do Scriptweaver</h3>
              <p className="text-slate-800 leading-relaxed font-bold text-base">{challenge.description}</p>
            </div>

            {challenge.hints[0] && (
              <div className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                  <Lightbulb className="text-amber-500" size={16} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Dica Ancestral</span>
                  <p className="text-xs text-slate-600 font-medium">{challenge.hints[0].text}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div 
              className="inline-block px-2 py-0.5 text-white rounded-md text-[9px] font-black uppercase tracking-[0.2em] mb-1"
              style={{ backgroundColor: themeColor }}
            >
              Conceito: {challenge.concept}
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm font-medium">
              {challenge.conceptExplanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
