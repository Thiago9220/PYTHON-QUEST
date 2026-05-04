import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Copy, Check, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  expectedSQL: string;
};

export function AnswerRevealModal({ isOpen, onClose, expectedSQL }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(expectedSQL);
    setCopied(true);
    toast.success("Código copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#1c1917] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.1)] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-500">
                  <Lock className="w-5 h-5" />
                  <h2 className="text-xl font-bold font-serif">Segredo do Arcanista</h2>
                </div>
                <button onClick={onClose} className="text-amber-800 hover:text-amber-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-amber-200/70 text-sm mb-6 leading-relaxed">
                As páginas do destino se abrem. Aqui está o pergaminho com a invocação correta para este desafio. Use este conhecimento para aprender e prosseguir.
              </p>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-black/60 border border-amber-900/40 rounded-xl p-5 font-mono text-amber-400 text-sm break-all whitespace-pre-wrap min-h-[80px] flex items-center justify-center text-center">
                  {expectedSQL}
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCopy}
                  className="flex-1 border-amber-900/50 text-amber-600 hover:bg-amber-950/30 hover:text-amber-400 h-12"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copiado!" : "Copiar Código"}
                </Button>
                <Button 
                  onClick={onClose}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold h-12"
                >
                  Entendido
                </Button>
              </div>
              
              <p className="mt-4 text-[10px] text-center text-amber-900 font-mono uppercase tracking-widest">
                O custo da sabedoria é a persistência
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
