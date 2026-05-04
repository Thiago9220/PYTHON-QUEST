import { BookOpen, ClipboardList, Lightbulb } from "lucide-react";
import { Challenge } from "@/lib/types";

interface Props {
  challenge: Challenge;
  activeTab: "mission" | "concept";
  setActiveTab: (tab: "mission" | "concept") => void;
}

export function MissionPanel({ challenge, activeTab, setActiveTab }: Props) {
  return (
    <div className="flex flex-col h-full bg-white border border-sky-100 rounded-xl overflow-hidden shadow-sm">
      <div className="flex bg-sky-50 border-b border-sky-100">
        <button
          onClick={() => setActiveTab("mission")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === "mission" ? "bg-white text-sky-700" : "text-slate-500 hover:text-sky-700"
          }`}
        >
          <ClipboardList size={14} />
          Missao
        </button>
        <button
          onClick={() => setActiveTab("concept")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === "concept" ? "bg-white text-sky-700" : "text-slate-500 hover:text-sky-700"
          }`}
        >
          <BookOpen size={14} />
          Conceito
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "mission" ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-sky-700 text-xs font-bold uppercase tracking-[0.2em] mb-2">Contexto</h3>
              <p className="text-slate-700 leading-relaxed text-base">{challenge.narrative}</p>
            </div>

            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-lg">
              <h3 className="text-emerald-700 text-xs font-bold uppercase tracking-[0.2em] mb-2">Objetivo</h3>
              <p className="text-slate-800 leading-relaxed">{challenge.description}</p>
            </div>

            {challenge.hints[0] && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <Lightbulb className="text-amber-500 shrink-0" size={18} />
                <p className="text-sm text-slate-700">Dica inicial: {challenge.hints[0].text}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sky-700 text-xs font-bold uppercase tracking-[0.2em]">
              {challenge.concept}
            </h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {challenge.conceptExplanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
