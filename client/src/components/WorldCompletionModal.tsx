import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trophy, Star, ArrowRight, Code2, Cpu, Database, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { World } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  world: World;
}

export function WorldCompletionModal({ isOpen, onClose, world }: Props) {
  const summaryItems = [
    { icon: Cpu, label: "Variáveis & Memória", desc: "Criação de identificadores, atribuição múltipla e swap de valores." },
    { icon: Database, label: "Tipos & Casting", desc: "Manipulação de Inteiros, Floats e conversão de tipos (casting)." },
    { icon: Terminal, label: "Entrada e Saída", desc: "Comunicação com o sistema via print() e captura de dados com input()." },
    { icon: Code2, label: "Métodos de String", desc: "Uso de .strip(), .split(), .replace(), .upper() e .lower()." },
    { icon: Star, label: "Aritmética Python", desc: "Operadores de divisão inteira (//), resto (%) e potência (**)." },
    { icon: Star, label: "Slicing & Busca", desc: "Fatiamento de strings [start:end] e localização de índices com .find()." },
    { icon: Star, label: "Formatação f-string", desc: "Interpolação moderna de variáveis e expressões dentro de textos." },
    { icon: Star, label: "Análise de Dados", desc: "Medição de tamanho com len() e contagem de ocorrências com .count()." },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
        >
          {/* Backdrop with heavy blur */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-[0_0_100px_-20px_rgba(14,165,233,0.3)]"
          >
            {/* Animated background patterns */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#0ea5e9,transparent_70%)]" />
              <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />
            </div>

            <div className="relative p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-emerald-400 shadow-[0_0_40px_rgba(14,165,233,0.4)]"
              >
                <Trophy className="h-12 w-12 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="mb-2 text-4xl font-black text-white tracking-tight">Setor Comprometido!</h2>
                <p className="mb-8 text-sky-400 font-mono text-sm uppercase tracking-[0.3em]">Handshake Completo: {world.title}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left"
              >
                {summaryItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
                      <item.icon className="h-5 w-5 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{item.label}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 items-center justify-center"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                    <Star className="h-4 w-4 fill-emerald-400" />
                    Mestre do Terminal
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Próximo Alvo: Nó de Roteamento (Estruturas de Decisão)
                  </div>
                </div>
                
                <Button 
                  onClick={onClose}
                  className="w-full sm:w-auto h-14 px-10 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_15px_30px_-10px_rgba(14,165,233,0.5)] transition-all active:scale-95"
                >
                  Continuar Ritual
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            {/* Success particle effects (simulated with CSS/motion) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
               <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-sky-400 rounded-full animate-ping opacity-20" />
               <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-20" />
               <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full animate-ping opacity-20" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
