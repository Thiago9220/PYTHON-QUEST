import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, ShieldCheck, Zap, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PremiumModalProps {
  world: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ world, isOpen, onClose }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);
  
  if (!world) return null;

  const handleBuy = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para adquirir expansões!");
      return;
    }

    setLoading(true);
    try {
      // O SDK do Supabase anexa o Authorization: Bearer <jwt> do usuario logado
      // automaticamente. A edge function deriva user_id/email do JWT — nao
      // enviamos esses campos pelo body para evitar que sejam forjados.
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          worldId: world.id,
          worldTitle: world.title,
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error("Não foi possível gerar o link de pagamento.");

      // Redireciona para o Mercado Pago (Checkout Pro)
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      toast.error(err.message || "Ocorreu um erro ao processar o pagamento.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#1c1917] border border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] relative"
          >
            {/* Efeitos de Luz de Fundo */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
            
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] to-transparent z-10" />
              {world.bgImage ? (
                <img
                  src={world.bgImage}
                  alt={world.title}
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover object-center transform transition-transform duration-[10s] hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-900 to-stone-900" />
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/80 text-white/70 hover:text-white rounded-full backdrop-blur-md border border-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-6 pb-8 pt-2 relative z-10">
              <div className="flex flex-col items-center text-center -mt-16 mb-6">
                <div className="w-20 h-20 bg-gradient-to-b from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] border-2 border-amber-200 mb-4 transform -rotate-3">
                  <Crown className="w-10 h-10 text-amber-950" />
                </div>
                <h2 className="text-2xl font-bold font-serif text-amber-100 mb-1 leading-tight">
                  {world.title}
                </h2>
                <p className="text-amber-500/80 font-mono text-xs tracking-widest uppercase mb-4">
                  Expansão Premium
                </p>
                <p className="text-amber-200/60 text-sm leading-relaxed px-4">
                  {world.lore || "Mundos desconhecidos repletos de magias complexas. Desbloqueie essa expansão para testar suas habilidades avançadas em bases de dados hostis."}
                </p>
              </div>

              <div className="space-y-3 mb-8 bg-black/40 rounded-2xl border border-amber-900/30 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                     <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-100">Desafios Exclusivos</h4>
                    <p className="text-xs text-amber-200/50">Acesso antecipado a {world.challenges?.length || 5} novas missões e chefões complexos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                     <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-100">Bônus de XP Global</h4>
                    <p className="text-xs text-amber-200/50">Aumente imensamente o seu limite de progressão.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                     <Crown className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-100">Cosméticos e Títulos</h4>
                    <p className="text-xs text-amber-200/50">Conquistas Lendárias e Brasões visíveis no seu perfil online.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleBuy} 
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-amber-950 font-bold text-base shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02] disabled:opacity-70"
                >
                   {loading ? (
                     <Loader2 className="w-5 h-5 animate-spin" />
                   ) : (
                     <>
                       <CreditCard className="w-5 h-5 mr-2" />
                       Adquirir Expansão Mágica
                     </>
                   )}
                </Button>
                <div className="text-center text-[10px] text-amber-600/50 font-mono flex items-center justify-center gap-1">
                   Pagamento seguro processado via API externa <ExternalLink className="w-3 h-3" />
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
