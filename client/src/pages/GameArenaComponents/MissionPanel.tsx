import React from "react";
import { Book, Scroll, Lightbulb } from "lucide-react";
import { Challenge } from "@/lib/types";

interface Props {
  challenge: Challenge;
  activeTab: "mission" | "concept";
  setActiveTab: (tab: "mission" | "concept") => void;
}

export function MissionPanel({ challenge, activeTab, setActiveTab }: Props) {
  return (
    <div className="flex flex-col h-full bg-[#1a1612] border border-[#3d352a] rounded-xl overflow-hidden shadow-2xl">
      {/* Tabs */}
      <div className="flex bg-[#26201a] border-b border-[#3d352a]">
        <button
          onClick={() => setActiveTab("mission")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-widest transition-all ${
            activeTab === "mission" 
              ? "bg-[#1a1612] text-[#a68d6d] border-r border-[#3d352a]" 
              : "text-[#3d352a] hover:text-[#a68d6d]"
          }`}
        >
          <Scroll size={14} />
          Missão
        </button>
        <button
          onClick={() => setActiveTab("concept")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-widest transition-all ${
            activeTab === "concept" 
              ? "bg-[#1a1612] text-[#a68d6d] border-l border-r border-[#3d352a]" 
              : "text-[#3d352a] hover:text-[#a68d6d]"
          }`}
        >
          <Book size={14} />
          Conceito
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === "mission" ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-[#a68d6d] text-xs font-mono uppercase tracking-[0.2em] mb-2">Narrativa</h3>
              <p className="text-[#e6d5bc] italic leading-relaxed font-serif text-lg">
                "{challenge.narrative}"
              </p>
            </div>
            
            <div className="p-6 bg-[#26201a] border border-[#3d352a] rounded-lg">
              <h3 className="text-[#a68d6d] text-xs font-mono uppercase tracking-[0.2em] mb-3">Objetivo</h3>
              <p className="text-[#e6d5bc] leading-relaxed">
                {challenge.description}
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-900/10 border border-blue-800/20 rounded-lg">
              <Lightbulb className="text-blue-400 shrink-0" size={18} />
              <p className="text-sm text-blue-200/70 italic">
                Dica: {challenge.hints[0].text}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-[#a68d6d] text-xs font-mono uppercase tracking-[0.2em] mb-2">
              {challenge.concept}
            </h3>
            <div className="prose prose-invert prose-sepia max-w-none">
              <p className="text-[#e6d5bc] leading-relaxed whitespace-pre-line">
                {challenge.conceptExplanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
