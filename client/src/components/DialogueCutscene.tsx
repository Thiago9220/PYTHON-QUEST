import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Radio } from "lucide-react";

interface Props {
  npc: string;
  text: string;
  onComplete: () => void;
  avatar?: string;
}

export function DialogueCutscene({ npc, text, onComplete, avatar = "PY" }: Props) {
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
      className="fixed inset-0 z-[120] overflow-hidden bg-[#eaf8ff]/92 backdrop-blur-sm"
      onClick={handleNext}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,0.2),transparent_28%),radial-gradient(circle_at_82%_82%,rgba(16,185,129,0.26),transparent_34%)]" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(14,165,233,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.16)_1px,transparent_1px)] [background-size:52px_52px]" />
        <svg className="absolute left-1/2 top-[14%] h-[54vh] w-[80vw] -translate-x-1/2 opacity-45" viewBox="0 0 900 420" fill="none">
          <path d="M76 282C210 96 346 350 462 192C604 0 706 182 826 84" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" strokeDasharray="12 18" />
          <path d="M104 314C250 185 350 360 506 230C640 118 718 214 812 144" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 14" />
        </svg>
      </div>

      <div className="relative flex min-h-screen items-end justify-center px-4 pb-8 md:pb-12">
        <motion.div
          initial={{ y: 70, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 35, opacity: 0 }}
          transition={{ type: "spring", damping: 24, delay: 0.08 }}
          className="relative w-full max-w-5xl cursor-pointer overflow-hidden rounded-[2rem] border border-white/80 bg-white/88 shadow-2xl shadow-sky-950/12 backdrop-blur-md"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-emerald-400 to-sky-500" />

          <div className="grid md:grid-cols-[220px_1fr]">
            <div className="border-b border-sky-100 bg-gradient-to-br from-sky-50 to-emerald-50 p-6 md:border-b-0 md:border-r">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700">
                <Radio className="h-3.5 w-3.5" />
                transmissao
              </div>

              <div className="flex items-center gap-4 md:block">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-100 to-emerald-100 shadow-lg shadow-sky-950/10 md:h-28 md:w-28">
                  {isImageAvatar ? (
                    <motion.img
                      src={avatar}
                      alt={npc}
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    />
                  ) : (
                    <motion.span
                      className="text-2xl font-black text-sky-700 md:text-3xl"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    >
                      {avatar.startsWith("/") ? "PY" : avatar}
                    </motion.span>
                  )}
                </div>
                <div className="mt-0 md:mt-5">
                  <div className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-slate-500">guia</div>
                  <div className="mt-1 text-2xl font-black text-slate-950">{npc}</div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="min-h-[120px] max-w-3xl text-xl font-semibold leading-relaxed text-slate-800 md:text-3xl md:leading-snug">
                {displayedText}
              </p>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-sky-100 pt-5">
                <div className="hidden font-mono text-xs uppercase tracking-widest text-slate-400 sm:block">
                  Clique em qualquer lugar do painel
                </div>
                <div className="ml-auto font-mono text-xs uppercase tracking-widest text-sky-700">
                  {isTyping ? (
                    "Pular..."
                  ) : (
                    <motion.span
                      animate={{ opacity: [1, 0.45, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex items-center"
                    >
                      Continuar <ChevronRight className="ml-1 h-3 w-3" />
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
