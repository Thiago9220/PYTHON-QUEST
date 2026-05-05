import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  npc: string;
  text: string;
  onComplete: () => void;
  avatar?: string;
  themeColor?: string;
}

export function DialogueCutscene({ npc, text, onComplete, avatar = "PY", themeColor = "#0ea5e9" }: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    setDisplayedText("");
    setIsTyping(true);

    const interval = setInterval(() => {
      setDisplayedText((current) => {
        if (current.length >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
          return current;
        }
        return current + text.charAt(current.length);
      });
    }, 18);

    return () => clearInterval(interval);
  }, [text, avatar]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }
    onComplete();
  };

  const isImageAvatar = (avatar.startsWith("/") || avatar.includes(".")) && !imgError;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] overflow-hidden bg-slate-950/40 backdrop-blur-[8px] flex items-end justify-center p-6 md:p-10 select-none"
      onClick={handleNext}
    >
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 150 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/20 bg-slate-950/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-[180px_1fr]">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center border-b border-white/10 bg-white/5 p-5 md:border-b-0 md:border-r">
            <div 
              className="relative h-24 w-24 overflow-hidden rounded-xl border-2 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              style={{ borderColor: `${themeColor}4d` }} // 30% opacity hex
            >
              {isImageAvatar ? (
                <img
                  src={avatar}
                  alt={npc}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div 
                  className="flex h-full w-full items-center justify-center text-2xl font-black text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  {avatar === "PY" ? "PY" : avatar.charAt(0)}
                </div>
              )}
              
              {/* Scanning Line Animation */}
              <motion.div 
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-[20%] bg-gradient-to-b from-transparent via-white/20 to-transparent" 
              />
            </div>

            <div className="mt-4 text-center">
              <div 
                className="inline-block rounded-full px-2.5 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-white"
                style={{ backgroundColor: `${themeColor}33` }} // 20% opacity hex
              >
                Transmissão
              </div>
              <div className="mt-2 text-base font-black text-white leading-tight">{npc}</div>
            </div>
          </div>

          {/* Main Text Content */}
          <div className="relative flex flex-col justify-between p-5 md:p-6">
            <div className="relative">
              {/* Quote Icon Background */}
              <div className="absolute -left-1 -top-5 text-5xl font-serif text-white/5 pointer-events-none">"</div>
              
              <p className="relative min-h-[60px] text-sm md:text-base font-medium leading-[1.6] text-slate-100">
                {displayedText}
                {isTyping && <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="ml-1 inline-block h-4 w-1 bg-white align-middle"
                />}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest text-slate-500">
                  <Radio className="h-2 w-2 animate-pulse text-slate-400" />
                  Signal v1.0
                </div>
              </div>
              
              <Button 
                onClick={handleNext}
                className="group h-7 rounded-lg bg-white/10 px-3 text-[9px] font-black uppercase tracking-widest text-slate-300 border border-white/10 transition-all hover:bg-white hover:text-slate-900"
              >
                {isTyping ? "Pular" : "Continuar"}
                <ChevronRight size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 h-1 bg-sky-500/40 transition-all" style={{ width: `${(displayedText.length / text.length) * 100}%` }} />
      </motion.div>
    </motion.div>
  );
}
