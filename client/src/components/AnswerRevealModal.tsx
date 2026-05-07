import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Eye, Zap } from "lucide-react";
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
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRevealed(false);
    }
  }, [isOpen]);

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
                  <h2 className="text-xl font-bold">
                    {!isRevealed ? "Confirmar Revelação" : "Resposta de Estudo"}
                  </h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!isRevealed ? (
                <>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Você está prestes a revelar a solução deste sistema. Isso deve ser usado apenas para fins de estudo quando você estiver realmente travado.
                  </p>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-0.5 text-amber-600 bg-amber-100 p-1.5 rounded-lg">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-amber-900 text-sm font-black uppercase tracking-tight">Penalidade de XP</p>
                        <p className="text-amber-800 text-xs leading-relaxed mt-0.5">
                          Ao revelar a resposta, o ganho de XP para este desafio será reduzido a <strong>ZERO</strong> permanentemente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200">
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsRevealed(true);
                        onConfirm?.();
                      }} 
                      className="flex-1 h-12 bg-sky-600 hover:bg-sky-700 font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-sky-900/20"
                    >
                      Revelar Solução
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    Compare com a sua tentativa e observe a sintaxe usada. Use a resposta como referencia para aprender o padrao.
                  </p>

                  <pre className="bg-slate-950 text-sky-100 border border-slate-800 rounded-xl p-5 font-mono text-sm whitespace-pre-wrap overflow-auto min-h-[120px] max-h-[300px]">
                    {expectedCode}
                  </pre>

                  <div className="mt-6 flex gap-3">
                    <Button 
                      variant="ghost" 
                      onClick={handleCopy} 
                      className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-xl"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? "Copiado!" : "Copiar Código"}
                    </Button>
                    <Button 
                      onClick={onClose} 
                      className="flex-1 h-11 bg-sky-600 hover:bg-sky-700 font-bold rounded-xl"
                    >
                      Entendi
                    </Button>
                  </div>
                </>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
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
