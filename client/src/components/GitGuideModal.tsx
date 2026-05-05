import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, GitCommit, GitMerge, GitPullRequest, Github, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitSimulator } from "./GitSimulator";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GitGuideModal({ isOpen, onClose }: Props) {
  const [simOpen, setSimOpen] = useState(false);
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl flex flex-col glass-dark border border-white/20 rounded-[2rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(34,197,94,0.3)] max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Protocolo Git & GitHub</h2>
                <p className="text-xs text-emerald-400 font-mono uppercase tracking-[0.2em]">Sincronização de Mainframe</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-white/10">
            
            {/* Intro */}
            <div className="mb-12 text-center max-w-3xl mx-auto">
              <Github className="w-16 h-16 text-white mx-auto mb-6 opacity-80" />
              <h3 className="text-4xl font-black text-white mb-4">A Máquina do Tempo do Código</h3>
              <p className="text-slate-400 leading-relaxed text-xl">
                No mundo hacker, perder um script é fatal. O <strong>Git</strong> é o seu sistema de backup temporal, permitindo salvar versões do seu código e voltar no tempo se algo der errado. O <strong>GitHub</strong> é o mainframe global onde você armazena esses backups e colabora com outros operadores.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Git vs GitHub */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h4 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  O que é Git?
                </h4>
                <p className="text-slate-400 text-base leading-relaxed mb-4">
                  É um programa instalado no seu terminal (computador local). Ele cria uma "fotografia" do seu projeto a cada alteração importante que você faz.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-sm text-emerald-300">
                  Sem internet • Roda no seu PC • Linha de comando
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h4 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                  <Github className="w-5 h-5 text-sky-400" />
                  O que é GitHub?
                </h4>
                <p className="text-slate-400 text-base leading-relaxed mb-4">
                  É um site (nuvem) que hospeda seus repositórios Git. Serve como um portfólio para mostrar seus projetos para empresas e outros programadores.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-sm text-sky-300">
                  Precisa de internet • Hospedagem • Rede Social Dev
                </div>
              </div>
            </div>

            {/* Commands */}
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-center">Comandos de Invasão (Fluxo Básico)</h3>
            
            <div className="space-y-4 max-w-4xl mx-auto">
              {[
                {
                  cmd: "git init",
                  icon: GitBranch,
                  color: "text-amber-400",
                  bg: "bg-amber-400/10",
                  border: "border-amber-400/20",
                  title: "Inicializar Repositório",
                  desc: "Transforma uma pasta comum do seu PC em um cofre monitorado pelo Git."
                },
                {
                  cmd: "git add .",
                  icon: GitPullRequest,
                  color: "text-sky-400",
                  bg: "bg-sky-400/10",
                  border: "border-sky-400/20",
                  title: "Adicionar ao Palco (Stage)",
                  desc: "Avisa o Git quais arquivos alterados você quer incluir na próxima fotografia."
                },
                {
                  cmd: 'git commit -m "mensagem"',
                  icon: GitCommit,
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                  border: "border-emerald-400/20",
                  title: "Tirar a Fotografia (Commit)",
                  desc: "Salva permanentemente o estado dos arquivos com uma mensagem descrevendo o que você fez."
                },
                {
                  cmd: "git push origin main",
                  icon: GitMerge,
                  color: "text-fuchsia-400",
                  bg: "bg-fuchsia-400/10",
                  border: "border-fuchsia-400/20",
                  title: "Enviar para o Mainframe (Push)",
                  desc: "Faz o upload dos seus commits locais para a nuvem do GitHub."
                }
              ].map((step, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/50 border border-white/5 rounded-2xl p-4 transition-all hover:bg-slate-800/50">
                  <div className={`p-4 rounded-xl border ${step.bg} ${step.border} ${step.color} shrink-0`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h5 className="text-lg font-bold text-white mb-1">{step.title}</h5>
                    <p className="text-base text-slate-400">{step.desc}</p>
                  </div>
                  <div className="shrink-0 bg-slate-950 px-4 py-3 rounded-xl border border-white/10 font-mono text-base text-slate-300 w-full md:w-auto text-center">
                    {step.cmd}
                  </div>
                </div>
              ))}
            </div>

            {/* Outro */}
            <div className="mt-12 bg-gradient-to-r from-emerald-900/20 to-sky-900/20 border border-emerald-500/20 rounded-3xl p-8 text-center max-w-3xl mx-auto">
              <h4 className="text-emerald-400 text-lg font-bold mb-3">Próximos Passos</h4>
              <p className="text-slate-300 text-base leading-relaxed mb-6">
                Para começar, crie uma conta gratuita em <strong>github.com</strong>, baixe o <strong>Git</strong> no seu terminal e comece a salvar seus scripts da Python Quest na nuvem!
              </p>
              <Button onClick={() => setSimOpen(true)} className="bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-black uppercase tracking-widest">
                <Terminal className="w-4 h-4 mr-1" /> Abrir Simulador
              </Button>
            </div>

          </div>
        </motion.div>
      </div>
      <GitSimulator isOpen={simOpen} onClose={() => setSimOpen(false)} />
    </AnimatePresence>
  );
}
