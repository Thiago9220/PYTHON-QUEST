import { motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStoreUrl } from "@/lib/platform";

interface Props {
  /** true quando o jogador terminou a demo; false quando só tentou abrir conteúdo trancado. */
  completed: boolean;
  onClose: () => void;
}

const TEXT = {
  pt: {
    titleDone: "FIM DA DEMO",
    titleLocked: "DISPONÍVEL NO JOGO COMPLETO",
    bodyDone:
      "Você atravessou os dois primeiros setores da CorpHQ. Mas a cidade continua isolada — e quem a isolou ainda não mostrou o rosto.",
    bodyLocked: "Este setor faz parte do jogo completo.",
    features:
      "O jogo completo tem 16 setores, 440 desafios, 9 chefes, 4 simuladores (Git, Docker, Redes e CyberSec) e o confronto final com dois finais.",
    carry: "Seu progresso da demo continua no jogo completo.",
    wishlist: "Adicionar à lista de desejos",
    noStore: "Procure por Python Quest na Steam e adicione à sua lista de desejos.",
    keepPlaying: "Continuar jogando",
  },
  en: {
    titleDone: "END OF DEMO",
    titleLocked: "AVAILABLE IN THE FULL GAME",
    bodyDone:
      "You made it through CorpHQ's first two sectors. But the city is still locked down — and whoever did it has not shown their face yet.",
    bodyLocked: "This sector is part of the full game.",
    features:
      "The full game has 16 sectors, 440 challenges, 9 bosses, 4 simulators (Git, Docker, Networking and CyberSec) and a final confrontation with two endings.",
    carry: "Your demo progress carries over to the full game.",
    wishlist: "Add to wishlist",
    noStore: "Search for Python Quest on Steam and add it to your wishlist.",
    keepPlaying: "Keep playing",
  },
};

export function DemoUpsellModal({ completed, onClose }: Props) {
  const { lang } = useLanguage();
  const copy = lang === "en" ? TEXT.en : TEXT.pt;
  const storeUrl = getStoreUrl();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={completed ? copy.titleDone : copy.titleLocked}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-[2rem] border border-sky-500/30 bg-slate-900/90 p-8 text-center shadow-[0_0_80px_-20px_rgba(14,165,233,0.6)]"
      >
        <button
          onClick={onClose}
          aria-label={copy.keepPlaying}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.4em] text-sky-400">PYTHON QUEST</p>
        <h2 className="mb-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
          {completed ? copy.titleDone : copy.titleLocked}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-300">{completed ? copy.bodyDone : copy.bodyLocked}</p>
        <p className="mb-2 text-sm leading-relaxed text-slate-400">{copy.features}</p>
        <p className="mb-8 text-xs font-bold text-emerald-400">{copy.carry}</p>
        <div className="flex flex-col gap-3">
          {storeUrl ? (
            <Button
              onClick={() => window.open(storeUrl, "_blank", "noopener")}
              className="h-12 rounded-xl bg-sky-600 font-black uppercase tracking-widest text-[11px] text-white hover:bg-sky-500"
            >
              <Heart className="mr-2 h-4 w-4" />
              {copy.wishlist}
            </Button>
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">{copy.noStore}</p>
          )}
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-11 rounded-xl border border-white/10 font-bold text-slate-300 hover:bg-white/5 hover:text-white"
          >
            {copy.keepPlaying}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
