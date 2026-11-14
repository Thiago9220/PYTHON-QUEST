import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Network as NetworkIcon, Globe, Shield, Terminal, X, 
  Flame, BookOpen, Search,
  Copy, Play,
  Wifi, Crosshair, Radar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { NETWORK_CODEX_I18N, type CodexTabId } from "@/lib/i18n/network_en";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSendToTerminal?: (code: string) => void;
  primaryColor?: "cyan" | "rose" | "emerald" | "sky" | "amber";
};

type TabId = CodexTabId;

const TAB_DEFS = [
  { id: "net101", icon: Wifi },
  { id: "recon", icon: Radar },
  { id: "scanning", icon: Search },
  { id: "exploitation", icon: Flame },
  { id: "post_ex", icon: Crosshair },
  { id: "defense", icon: Shield },
] as const;

export function NetworkCodex({ isOpen, onClose, onSendToTerminal, primaryColor = "cyan" }: Props) {
  const { lang } = useLanguage();
  const copy = NETWORK_CODEX_I18N[lang];
  const [activeTab, setActiveTab] = useState<TabId>("net101");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const colors = {
    cyan: {
      border: "border-cyan-500/20",
      bg: "bg-cyan-500/5",
      text: "text-cyan-400",
      accent: "bg-cyan-600 hover:bg-cyan-500",
      shadow: "shadow-cyan-900/20",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
      active: "bg-cyan-600",
      pre: "text-cyan-100",
      selection: "selection:bg-cyan-500/30",
      ring: "border-cyan-500/50"
    },
    rose: {
      border: "border-rose-500/20",
      bg: "bg-rose-500/5",
      text: "text-rose-400",
      accent: "bg-rose-600 hover:bg-rose-500",
      shadow: "shadow-rose-900/20",
      glow: "shadow-[0_0_20px_rgba(225,29,72,0.3)]",
      active: "bg-rose-600",
      pre: "text-rose-100",
      selection: "selection:bg-rose-500/30",
      ring: "border-rose-500/50"
    },
    emerald: {
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
      text: "text-emerald-400",
      accent: "bg-emerald-600 hover:bg-emerald-500",
      shadow: "shadow-emerald-900/20",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      active: "bg-emerald-600",
      pre: "text-emerald-100",
      selection: "selection:bg-emerald-500/30",
      ring: "border-emerald-500/50"
    },
    sky: {
      border: "border-sky-500/20",
      bg: "bg-sky-500/5",
      text: "text-sky-400",
      accent: "bg-sky-600 hover:bg-sky-500",
      shadow: "shadow-sky-900/20",
      glow: "shadow-[0_0_20px_rgba(14,165,233,0.3)]",
      active: "bg-sky-600",
      pre: "text-sky-100",
      selection: "selection:bg-sky-500/30",
      ring: "border-sky-500/50"
    },
    amber: {
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
      text: "text-amber-400",
      accent: "bg-amber-600 hover:bg-amber-500",
      shadow: "shadow-amber-900/20",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
      active: "bg-amber-600",
      pre: "text-amber-100",
      selection: "selection:bg-amber-500/30",
      ring: "border-amber-500/50"
    }
  }[primaryColor];

  useEffect(() => {
    if (isOpen) {
      setActiveTab("net101");
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }
    
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [activeTab]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(copy.copiedToast);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "net101":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`p-6 md:p-8 border ${colors.border} rounded-[1.5rem] ${colors.bg} relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 p-8 opacity-10 pointer-events-none ${colors.text}`}>
                <NetworkIcon size={120} />
              </div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-4 relative font-serif">
                <Globe className={colors.text} /> {copy.net101.heading}
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium text-lg relative">
                {copy.net101.intro}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-3">{copy.net101.ipTitle}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{copy.net101.ipDesc}</p>
              </div>
              <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3">{copy.net101.portsTitle}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{copy.net101.portsDesc}</p>
              </div>
            </div>
          </div>
        );

      case "recon":
      case "scanning":
      case "exploitation":
      case "post_ex":
      case "defense":
        const rituals = copy.rituals[activeTab];
        const tabDesc = copy.tabDescriptions[activeTab];

        return (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-slate-300 leading-relaxed font-medium text-lg mb-2">
              {tabDesc}
            </p>
            {rituals.map((r, i) => (
              <div key={i} className={`border border-white/10 rounded-2xl bg-slate-900/60 overflow-hidden hover:${colors.border.replace('500/20', '500/30')} transition-all group`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xl font-black ${colors.text}`}>{r.title}</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => copyCode(r.code)} className="h-8 w-8 text-slate-500 hover:text-white bg-white/5 rounded-lg">
                        <Copy size={14} />
                      </Button>
                      {onSendToTerminal && (
                        <Button onClick={() => {
                          onSendToTerminal(r.code);
                          onClose();
                        }} className={`h-8 ${colors.accent} text-white text-[10px] font-black uppercase tracking-widest px-3 rounded-lg shadow-lg ${colors.shadow}`}>
                          <Play size={12} className="mr-1.5" /> {copy.injectBtn}
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 font-medium mb-5">{r.desc}</p>
                  <pre className={`bg-slate-950 border border-white/5 ${colors.pre} rounded-xl p-5 text-sm font-mono overflow-x-auto ${colors.selection}`}>
                    {r.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1200px] h-[85vh] bg-[#0d1117] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden backdrop-blur-xl"
          >
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-[#080b0f] border-b md:border-b-0 md:border-r border-white/5 flex flex-col shrink-0">
              <div className="p-8 pb-6 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl border ${colors.border.replace('20', '30')} ${colors.bg.replace('5', '10')} flex items-center justify-center ${colors.text}`}>
                  <Wifi className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-white font-mono tracking-tight uppercase leading-none">{copy.brandPrefix}<span className={colors.text}>{primaryColor === 'rose' ? 'Sec' : 'Ops'}</span></h2>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2">
                {TAB_DEFS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                        isActive 
                          ? `${colors.active} text-white ${colors.glow} border ${colors.ring}` 
                          : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-white" : colors.text} />
                      <span className="font-bold text-[15px]">{copy.tabs[tab.id]}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="p-6 mt-auto border-t border-white/5 hidden md:block">
                <div className={`flex items-center gap-3 ${colors.text} opacity-50 hover:opacity-100 transition-colors cursor-default`}>
                  <Terminal className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{copy.interceptActive}</span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative bg-[#0f172a]/20">
              <div className="p-8 pb-6 flex justify-between items-center border-b border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
                    {(() => {
                      const ActiveIcon = TAB_DEFS.find(t => t.id === activeTab)?.icon || BookOpen;
                      return <ActiveIcon size={20} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white font-mono tracking-tight">
                      {copy.tabs[activeTab]}
                    </h2>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${colors.text} opacity-50 mt-1`}>
                      {primaryColor === 'rose' ? copy.subtitleRose : copy.subtitleDefault}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl text-slate-500 hover:text-white hover:bg-white/5">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-white/10">
                <div className="max-w-3xl mx-auto">
                  {renderContent()}
                </div>
              </div>
              
              <div className="p-6 px-8 border-t border-white/5 flex justify-end shrink-0 bg-[#080b0f]/80 backdrop-blur-md">
                <Button 
                  onClick={onClose}
                  className={`${colors.accent} text-white font-black px-8 py-6 rounded-xl ${colors.glow} transition-all hover:scale-105 active:scale-95 text-sm`}
                >
                  {copy.closeBtn}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
