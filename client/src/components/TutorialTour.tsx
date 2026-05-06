import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X, CheckCircle2, Scroll } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TourStep = {
  targetId: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
};

type Props = {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
};

export default function TutorialTour({ steps, isOpen, onClose }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  const currentStep = steps[currentStepIndex];
  const isSplash = !targetRect;

  // Reseta ao passo inicial sempre que o tour é (re)aberto
  useEffect(() => {
    if (isOpen) setCurrentStepIndex(0);
  }, [isOpen]);

  // Bloqueia scroll do fundo durante o tutorial
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const updatePosition = useCallback(() => {
    if (!isOpen || !currentStep) return;
    const el = document.getElementById(currentStep.targetId);
    if (el) {
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(new DOMRect(rect.x - 8, rect.y - 8, rect.width + 16, rect.height + 16));
        
        if (rect.bottom > window.innerHeight || rect.top < 0) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isOpen, windowSize]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      updatePosition();
    });
    window.addEventListener("scroll", updatePosition);
    
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [updatePosition]);

  if (!isOpen) return null;

  /* ── Navegação compartilhada ── */
  const navControls = (
    <div className="flex items-center justify-between mt-auto">
      <div className="flex gap-1.5">
        {steps.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all ${idx === currentStepIndex ? 'w-4 bg-sky-500' : 'w-1.5 bg-sky-900/40'}`} 
          />
        ))}
      </div>

      <div className="flex gap-2">
        {currentStepIndex > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCurrentStepIndex(p => p - 1)}
            className="w-8 h-8 rounded-full text-sky-600 hover:text-sky-400 hover:bg-sky-900/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        
        {currentStepIndex < steps.length - 1 ? (
          <Button 
            onClick={() => setCurrentStepIndex(p => p + 1)}
            className={`text-slate-950 rounded-full h-8 text-xs font-bold ${
              isSplash
                ? "bg-sky-400 hover:bg-sky-300 px-5"
                : "bg-sky-500 hover:bg-sky-400 px-4"
            }`}
          >
            Continuar <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        ) : (
          <Button 
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-emerald-950 rounded-full h-8 px-5 text-xs font-bold"
          >
            Começar Jornada <CheckCircle2 className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden">
      {/* Splash overlay — fundo escuro completo quando não há target (intro) */}
      {isSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/92 backdrop-blur-md z-[100]"
        />
      )}

      {/* Elemento Spotlight com box-shadow gigante para escurecer o fundo */}
      {targetRect && (
        <div
          className="fixed pointer-events-none transition-all duration-500 ease-out border-2 border-sky-500 rounded-2xl animate-pulse"
          style={{
            top: targetRect.y,
            left: targetRect.x,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.85)",
            zIndex: 100
          }}
        />
      )}

      {/* Card do tutorial */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, scale: isSplash ? 0.9 : 1, y: isSplash ? "-45%" : 20, x: isSplash ? "-50%" : 0 }}
          animate={{ opacity: 1, scale: 1, y: isSplash ? "-50%" : 0, x: isSplash ? "-50%" : 0 }}
          exit={{ opacity: 0, scale: isSplash ? 0.95 : 1, y: isSplash ? "-55%" : -20, x: isSplash ? "-50%" : 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={`absolute z-[101] bg-slate-900 border rounded-3xl flex flex-col transition-all duration-300 ${
            isSplash
              ? "border-sky-500/40 w-[92vw] xs:w-[420px] sm:w-[480px] max-w-[500px] p-7 md:p-10 shadow-[0_0_80px_rgba(14,165,233,0.18),0_0_160px_rgba(14,165,233,0.06)]"
              : "border-sky-500/30 w-[290px] xs:w-[340px] max-w-[calc(100vw-32px)] p-5 md:p-6 shadow-[0_0_40px_rgba(14,165,233,0.15)]"
          }`}
          style={{
            top: isSplash
              ? "50%"
              : (targetRect!.y > window.innerHeight / 2 
                  ? Math.max(16, targetRect!.y - 240) 
                  : Math.min(window.innerHeight - 240, targetRect!.bottom + 16)),
            left: isSplash
              ? "50%"
              : Math.max(16, Math.min(window.innerWidth - (window.innerWidth < 400 ? 306 : 356), targetRect!.x + targetRect!.width / 2 - 160)),
          }}
        >
          {/* ── SPLASH MODE: intro completa com logo ── */}
          {isSplash ? (
            <>
              {/* Imagem de Fundo (Modal inteiro) */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center rounded-3xl opacity-30 mix-blend-luminosity"
                style={{ backgroundImage: "url('/imagem-fundo.webp')" }}
              />
              <div className="absolute inset-0 z-0 rounded-3xl bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/40 pointer-events-none" />
              <div className="absolute inset-0 z-0 rounded-3xl bg-gradient-to-br from-sky-500/10 to-transparent pointer-events-none mix-blend-overlay" />

              {/* Brilho decorativo no topo (relativo ao modal) */}
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent z-10" />
              <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-sky-300/50 to-transparent blur-[1px] z-10" />

              {/* Conteúdo (relativo para ficar acima do fundo) */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Logo do jogo */}
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-sky-500/40 mb-4 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
                    <Terminal className="w-7 h-7 text-sky-400" />
                  </div>
                  <h2
                    className="text-2xl md:text-3xl font-black text-white mb-1 drop-shadow-md uppercase tracking-tight"
                  >
                    Python Protocol
                  </h2>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-sky-500/70 font-mono font-bold drop-shadow-sm">
                    Operação: Domínio Digital
                  </p>
                </div>

                {/* Divider sky */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-sky-700/60" />
                  <span className="text-sky-500/50 text-[10px]">●</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-sky-700/60" />
                </div>

                {/* Título do passo */}
                <h3 className="font-black text-white text-base md:text-lg mb-3 text-center drop-shadow-sm uppercase tracking-wider">
                  {currentStep.title}
                </h3>

                {/* Conteúdo */}
                <p className="text-slate-300 text-[13px] md:text-sm leading-relaxed font-mono mb-8 text-center px-2 drop-shadow-sm">
                  {currentStep.content}
                </p>

                {/* Step counter */}
                <div className="text-center mb-5">
                  <span className="text-[10px] font-mono font-bold text-sky-400/80 bg-sky-950/50 px-3 py-1 rounded-full border border-sky-900/50 backdrop-blur-sm">
                    {currentStepIndex + 1} / {steps.length}
                  </span>
                </div>

                {navControls}
              </div>
            </>
          ) : (
            /* ── TOOLTIP MODE: posicionado ao lado do target ── */
            <>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-black text-white text-sm flex items-center gap-2 uppercase tracking-wide">
                  <span>{currentStep.title}</span>
                </h3>
                <span className="text-[10px] font-mono text-sky-500/60 bg-sky-950/30 px-2 py-1 rounded-full border border-sky-900/40 shrink-0">
                  {currentStepIndex + 1} / {steps.length}
                </span>
              </div>
              
              <p className="text-slate-300 text-xs leading-relaxed font-mono mb-6">
                {currentStep.content}
              </p>

              {navControls}
            </>
          )}
          
          {/* Close button that aborts the tour */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 border border-sky-500/30 text-sky-600/50 hover:text-sky-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
