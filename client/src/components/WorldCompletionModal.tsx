import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronRight, Star, Award, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { World } from "@/lib/types";

type Props = {
  world: World;
  isOpen: boolean;
  onClose: () => void;
};

export function WorldCompletionModal({ world, isOpen, onClose }: Props) {
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Se não houver mundo, não renderiza nada para evitar erro de 'null'
  if (!world) return null;

  const bgImage = `/modals/${world.id}.webp`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[3rem] border-2 border-amber-500/30 shadow-[0_0_100px_rgba(251,191,36,0.15)]"
          >
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-110"
              style={{ 
                backgroundImage: `url(${bgImage})`,
                animation: "slow-zoom 20s linear infinite alternate"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b08]/80 via-[#1c1917]/90 to-[#1c1917]" />

            {/* Content Container */}
            <div className="relative z-10 p-8 md:p-12 text-center">
              {/* Efeitos de Luz de Fundo */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 blur-[80px] rounded-full pointer-events-none" />
              
              {/* Ícone de Troféu Animado */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative z-10 w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-700 rounded-3xl mx-auto flex items-center justify-center shadow-[0_15px_40px_rgba(251,191,36,0.3)] border-2 border-amber-300/50 mb-8"
              >
                 <Trophy className="w-12 h-12 text-amber-950 fill-amber-950/20" />
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="absolute -top-3 -right-3 bg-amber-200 text-amber-950 p-1.5 rounded-full border-2 border-amber-600 shadow-lg"
                 >
                   <CheckCircle2 className="w-5 h-5" />
                 </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 relative z-10"
              >
                 <h2 className="text-sm font-mono font-black text-amber-500 uppercase tracking-[0.4em] mb-2 drop-shadow-lg">
                   Missão Cumprida
                 </h2>
                 <h1 className="text-4xl md:text-5xl font-black font-serif text-amber-100 leading-tight drop-shadow-2xl">
                   Mestre da {world.title.split(' ').slice(-1)}
                 </h1>
                 <p className="text-amber-200/80 text-sm max-w-xs mx-auto leading-relaxed font-medium">
                   Você resolveu todos os enigmas de <b className="text-amber-400">{world.title}</b>. Seu nome foi gravado nos anais desta região.
                 </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-10 grid grid-cols-3 gap-3"
              >
                 {[
                   { label: "Desafios", val: world.challenges.length, icon: Award },
                   { label: "Maestria", val: "100%", icon: Star },
                   { label: "Status", val: "Lendário", icon: Trophy },
                 ].map((stat, i) => (
                   <div key={i} className="bg-black/40 backdrop-blur-md border border-amber-500/20 p-3 rounded-2xl flex flex-col items-center gap-1 shadow-inner">
                     <stat.icon className="w-4 h-4 text-amber-500/70" />
                     <span className="text-[10px] uppercase font-mono text-amber-500/60 tracking-tighter">{stat.label}</span>
                     <span className="text-xs font-bold text-amber-100">{stat.val}</span>
                   </div>
                 ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12"
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black py-7 rounded-2xl text-lg shadow-[0_10px_30px_rgba(249,115,22,0.3)] transition-all active:scale-95 group border-t border-amber-400/30"
                >
                  PROSSEGUIR JORNADA
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Confetes Virtuais Simples */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ 
                y: [null, window.innerHeight],
                x: [null, (Math.random() - 0.5) * 600],
                rotate: [0, 720],
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
              className="absolute top-0 left-1/2 w-2 h-2 bg-amber-400 rounded-sm pointer-events-none z-[110]"
              style={{ 
                left: `${Math.random() * 100}%`,
                background: i % 2 === 0 ? "#fbbf24" : "#f59e0b"
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1.1); }
          to { transform: scale(1.25); }
        }
      `}</style>
    </AnimatePresence>
  );
}
