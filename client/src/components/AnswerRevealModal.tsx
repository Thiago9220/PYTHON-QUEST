import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  expectedCode: string;
  remainingUses: number;
};

export function AnswerRevealModal({ isOpen, onClose, onConfirm, expectedCode, remainingUses }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(expectedCode);
    setCopied(true);
    toast.success("Codigo copiado.");
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
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            className="relative w-full max-w-lg bg-white border border-sky-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sky-700">
                  <Eye className="w-5 h-5" />
                  <h2 className="text-xl font-bold">Resposta de estudo</h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-slate-600 text-sm mb-2 leading-relaxed">
                Compare com a sua tentativa e observe a sintaxe usada. Use a resposta como referencia para aprender o padrao.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-start gap-3">
                <div className="mt-0.5 text-amber-600">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-0.5">Penalidade de XP</p>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Ao revelar a resposta, o ganho de XP para este desafio será reduzido a <strong>0</strong>.
                  </p>
                </div>
              </div>

              <pre className="bg-slate-950 text-sky-100 border border-slate-800 rounded-xl p-5 font-mono text-sm whitespace-pre-wrap overflow-auto min-h-[96px]">
                {expectedCode}
              </pre>

              <div className="mt-6 flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={handleCopy} 
                  className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                >
                  {copied ? <Check className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copiado!" : "Copiar Código"}
                </Button>
                <Button 
                  onClick={() => {
                    onConfirm?.();
                    onClose();
                  }} 
                  className="flex-1 h-11 bg-sky-600 hover:bg-sky-700 font-bold"
                >
                  Entendi
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Usos diários restantes: <span className="text-sky-600">{remainingUses}</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
