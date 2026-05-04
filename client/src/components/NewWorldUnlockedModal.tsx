import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ChevronRight, Map as MapIcon, BookOpen, Quote } from "lucide-react";
import { Button } from "./ui/button";
import { World } from "@/lib/types";

type Props = {
  world: World;
  isOpen: boolean;
  onClose: () => void;
};

export function NewWorldUnlockedModal({ world, isOpen, onClose }: Props) {
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop com desfoque pesado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#1c1917] border-2 border-amber-500/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(251,191,36,0.15)]"
          >
            {/* Ornamentos de Canto */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-500/10 to-transparent pointer-events-none" />

            {/* Banner Superior */}
            <div className="h-64 relative overflow-hidden">
               {world.bgImage ? (
                 <motion.img
                   initial={{ scale: 1.2 }}
                   animate={{ scale: 1 }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   src={world.bgImage}
                   decoding="async"
                   fetchPriority="high"
                   className="w-full h-full object-cover"
                   alt={world.title}
                 />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-amber-900 to-stone-950" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-transparent to-black/20" />
               
               {/* Selo de Novo Mundo */}
               <motion.div 
                 initial={{ y: -50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="absolute top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-amber-950 font-black px-6 py-2 rounded-full text-xs uppercase tracking-[0.3em] flex items-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.5)] border-2 border-amber-400/50"
               >
                 Novo Mundo Descoberto
               </motion.div>

               {/* Ícone Dimensional Central */}
               <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, delay: 0.5 }}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#1c1917] rounded-full p-1 border-2 border-amber-500/50 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] translate-y-1/2 flex items-center justify-center transform group"
               >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/30 group-hover:scale-110 transition-transform" />
               </motion.div>
            </div>

            <div className="pt-16 pb-10 px-8 md:px-12 text-center space-y-6">
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.7 }}
               >
                  <h2 className="text-4xl md:text-5xl font-black font-serif text-amber-100 mb-2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                    {world.title}
                  </h2>
                  <div className="flex items-center justify-center gap-3 text-amber-500 font-mono text-xs uppercase tracking-widest bg-amber-900/10 py-1 px-4 rounded-full border border-amber-900/30 w-fit mx-auto">
                    <MapIcon className="w-3 h-3" />
                    <span>Região Desbloqueada</span>
                  </div>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.9 }}
                 className="relative bg-amber-950/20 border border-amber-900/30 rounded-2xl p-6 italic text-amber-200/70 text-sm leading-relaxed"
               >
                  <Quote className="absolute -top-3 -left-3 w-8 h-8 text-amber-500/20" />
                  <p className="relative z-10">
                    "{world.lore}"
                  </p>
                  <Quote className="absolute -bottom-3 -right-3 w-8 h-8 text-amber-500/20 rotate-180" />
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 1.1 }}
                 className="grid grid-cols-2 gap-4 text-left"
               >
                  <div className="bg-black/30 p-4 rounded-xl border border-amber-900/20">
                    <p className="text-[10px] text-amber-600 font-mono uppercase tracking-tighter mb-1">Missão Principal</p>
                    <p className="text-sm font-bold text-amber-100">{world.subtitle}</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-xl border border-amber-900/20">
                    <p className="text-[10px] text-amber-600 font-mono uppercase tracking-tighter mb-1">Exploração</p>
                    <p className="text-sm font-bold text-amber-100">{world.challenges.length} Desafios de Dados</p>
                  </div>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 1.3 }}
                 className="pt-4"
               >
                  <Button 
                    onClick={onClose}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-amber-950 font-black py-8 rounded-2xl text-xl shadow-[0_10px_40px_rgba(217,119,6,0.3)] hover:scale-[1.02] active:scale-95 transition-all group"
                  >
                    COMEÇAR JORNADA
                    <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="mt-4 text-[10px] font-mono text-amber-700 uppercase tracking-widest">
                    Boa sorte, Explorador de SQL
                  </p>
               </motion.div>
            </div>
          </motion.div>

          {/* Efeito de partículas/fogos no fundo (simulado com círculos animados) */}
          <div className="fixed inset-0 pointer-events-none z-[-1]">
             {[...Array(6)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                 animate={{ 
                   scale: [0, 1.5, 0], 
                   opacity: [0, 0.4, 0],
                   x: [0, (i % 2 === 0 ? 300 : -300) * Math.random()],
                   y: [0, (i % 3 === 0 ? 300 : -300) * Math.random()]
                 }}
                 transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                 className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-500 blur-[100px] rounded-full"
               />
             ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
