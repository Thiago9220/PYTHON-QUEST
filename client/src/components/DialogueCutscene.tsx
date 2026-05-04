import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Props {
  npc: string;
  text: string;
  onComplete: () => void;
  avatar?: string;
}

export function DialogueCutscene({ npc, text, onComplete, avatar = "🧙‍♂️" }: Props) {
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
    }, 25);

    return () => clearInterval(interval);
  }, [text, avatar]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayedText(text);
      setIsTyping(false);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-end justify-center pb-12 px-4 bg-black/80 backdrop-blur-md"
      onClick={handleNext}
    >
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, delay: 0.2 }}
        className="w-full max-w-4xl bg-gradient-to-b from-[#1c1917] to-[#0a0908] border-2 border-amber-600/50 rounded-xl p-8 shadow-[0_0_50px_rgba(217,119,6,0.15)] relative cursor-pointer"
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
      >
        {/* Name Plate */}
        <div className="absolute -top-6 left-8 font-bold text-amber-200 bg-gradient-to-r from-stone-800 to-stone-900 border-2 border-amber-600/60 px-6 py-2 rounded-lg uppercase tracking-wider text-sm shadow-xl font-serif">
          {npc}
        </div>
        
        {/* Avatar Placeholder */}
        <div className="absolute -top-16 right-8 w-24 h-24 bg-gradient-to-br from-stone-800 to-black border-2 border-amber-700/50 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
          {(avatar.startsWith("/") || avatar.includes(".")) && !imgError ? (
            <motion.img
              src={avatar}
              alt={npc}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
          ) : (
            <motion.span 
              className="text-5xl drop-shadow-xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {avatar.startsWith("/") ? "🧙‍♂️" : avatar}
            </motion.span>
          )}
        </div>

        {/* Text Body */}
        <p className="text-xl md:text-2xl text-amber-50 font-serif leading-relaxed mt-4 min-h-[96px]">
          {displayedText}
        </p>

        {/* Continue hint */}
        <div className="absolute bottom-4 right-6 text-amber-500/60 text-xs flex items-center gap-1 font-mono uppercase tracking-widest">
          {isTyping ? "Pular..." : (
            <motion.span 
              animate={{ opacity: [1, 0.4, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center"
            >
              Clique para continuar <ChevronRight className="w-3 h-3 ml-1" />
            </motion.span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
