import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type ArenaTutorialProps = {
  onComplete: () => void;
  onSwitchTab: (tab: "mission" | "schema" | "concept") => void;
};

export function ArenaTutorial({ onComplete, onSwitchTab }: ArenaTutorialProps) {
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; arrowSide: string }>({ top: 0, left: 0, arrowSide: "top" });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      title: "Boas-vindas ao SQL Quest! 🗺️",
      text: "Este é o seu painel de comando. Aqui no topo você navega entre mundos e acompanha a dificuldade e XP do desafio atual.",
      target: "tutorial-header",
      onEnter: null,
      position: "bottom" as const,
    },
    {
      title: "Leia a Missão 📖",
      text: "Cada desafio tem uma história e um objetivo claro. Leia aqui o que você precisa resolver com SQL.",
      target: "tutorial-tabs",
      onEnter: () => onSwitchTab("mission"),
      position: "top" as const,
    },
    {
      title: "Consulte as Tabelas 📊",
      text: "A aba 'Tabelas' mostra a estrutura do banco de dados. Use 'Ver Amostra' para espiar os dados reais antes de escrever sua query!",
      target: "tutorial-tabs",
      onEnter: () => onSwitchTab("schema"),
      position: "top" as const,
    },
    {
      title: "Aprenda o Conceito 💡",
      text: "Na aba 'Conceito' você encontra uma explicação teórica sobre o comando SQL sendo ensinado. Consulte sempre que tiver dúvida!",
      target: "tutorial-tabs",
      onEnter: () => onSwitchTab("concept"),
      position: "top" as const,
    },
    {
      title: "Escreva sua Query ✍️",
      text: "Este é o seu editor de código SQL. Escreva aqui e pressione Ctrl+Enter ou o botão Executar.",
      target: "tutorial-editor",
      onEnter: () => onSwitchTab("mission"),
      position: "top" as const,
    },
    {
      title: "XP e Dificuldade ⭐",
      text: "Acompanhe aqui a dificuldade do desafio e quantos pontos de experiência você vai ganhar.",
      target: "tutorial-stats",
      onEnter: null,
      position: "bottom" as const,
    },
    {
      title: "Veja o Resultado ✅",
      text: "Depois de executar sua query, o resultado aparece aqui. Verifique se os dados batem com o pedido.",
      target: "tutorial-output",
      onEnter: null,
      position: "top" as const,
    },
    {
      title: "Técnica Pomodoro 🍅",
      text: "Use o timer Pomodoro aqui no canto para manter o foco: 25min de estudo seguidos de uma pausa curta. A cada 4 ciclos, uma pausa longa. Ele continua rodando enquanto você resolve os desafios.",
      target: "tutorial-pomodoro",
      onEnter: null,
      position: "top" as const,
    }
  ];

  const currentStep = steps[step];

  useEffect(() => {
    if (currentStep.onEnter) {
      currentStep.onEnter();
    }
  }, [step]);

  useEffect(() => {
    const targetId = currentStep.target;
    if (!targetId) {
      setSpotlightRect(null);
      return;
    }

    const el = document.getElementById(targetId);
    if (!el) {
      setSpotlightRect(null);
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);

      const pad = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 640;
      const tooltipW = Math.min(340, vw - 24);
      // Medir altura real do tooltip se já renderizado; fallback menor no mobile
      const measuredH = tooltipRef.current?.offsetHeight ?? 0;
      const tooltipH = measuredH > 0 ? measuredH : (isMobile ? 170 : 220);

      const leftPos = Math.min(Math.max(12, rect.left + rect.width / 2 - tooltipW / 2), vw - tooltipW - 12);

      const canGoBottom = rect.bottom + pad + tooltipH < vh - 12;
      const canGoTop = rect.top - pad - tooltipH > 12;

      if (currentStep.position === "top" && canGoTop) {
        setTooltipPos({
          top: rect.top - pad - tooltipH,
          left: leftPos,
          arrowSide: "bottom",
        });
      } else if (currentStep.position === "bottom" && canGoBottom) {
        setTooltipPos({
          top: rect.bottom + pad,
          left: leftPos,
          arrowSide: "top",
        });
      } else if (canGoBottom) {
        setTooltipPos({
          top: rect.bottom + pad,
          left: leftPos,
          arrowSide: "top",
        });
      } else if (canGoTop) {
        setTooltipPos({
          top: rect.top - pad - tooltipH,
          left: leftPos,
          arrowSide: "bottom",
        });
      } else {
        // Sem espaço em cima nem embaixo: ancora no rodapé da viewport
        setTooltipPos({
          top: Math.max(12, vh - tooltipH - 16),
          left: leftPos,
          arrowSide: "none",
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [step, currentStep.target]);

  const pad = 8;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]">
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "auto" }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left - pad}
                y={spotlightRect.top - pad}
                width={spotlightRect.width + pad * 2}
                height={spotlightRect.height + pad * 2}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#spotlight-mask)" />
      </svg>

      {spotlightRect && (
        <motion.div
          key={`border-${step}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute rounded-xl border-2 border-amber-400/70 pointer-events-none"
          style={{
            top: spotlightRect.top - pad,
            left: spotlightRect.left - pad,
            width: spotlightRect.width + pad * 2,
            height: spotlightRect.height + pad * 2,
            boxShadow: "0 0 20px rgba(251,191,36,0.3)",
          }}
        />
      )}

      <motion.div
        ref={tooltipRef}
        key={step}
        initial={{
          opacity: 0,
          y: currentStep.target ? 15 : "-45%",
          x: currentStep.target ? 0 : "-50%"
        }}
        animate={{
          opacity: 1,
          y: currentStep.target ? 0 : "-50%",
          x: currentStep.target ? 0 : "-50%"
        }}
        className="absolute z-[101]"
        style={{
          top: currentStep.target
            ? Math.max(12, Math.min(window.innerHeight - (tooltipRef.current?.offsetHeight ?? 180) - 12, tooltipPos.top))
            : "50%",
          left: currentStep.target ? tooltipPos.left : "50%",
          width: Math.min(340, window.innerWidth - 24),
        }}
      >
        <div className="bg-[#1c1917] border border-amber-500/50 rounded-2xl p-4 md:p-6 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl overflow-hidden bg-amber-900/30">
            <motion.div className="h-full bg-gradient-to-r from-amber-600 to-amber-400" initial={{ width: 0 }} animate={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>

          <h3 className="text-base md:text-xl font-bold text-amber-100 font-serif mb-1 md:mb-2 mt-1 md:mt-2">{currentStep.title}</h3>
          <p className="text-amber-300/80 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">{currentStep.text}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-amber-400" : "bg-amber-900/50"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => {
                if (step < steps.length - 1) setStep(s => s + 1);
                else onComplete();
              }} className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold h-8 text-xs px-4">
                {step === steps.length - 1 ? "Começar!" : "Próximo"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
