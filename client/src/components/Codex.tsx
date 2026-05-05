import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Book, BookOpen, Code2, Copy, Play, X, Zap, History, Flame, LayoutList, Split, Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSendToEditor?: (code: string) => void;
};

type TabId = "why_python" | "basics" | "control_flow" | "collections" | "history" | "clean_code";

const TABS = [
  { id: "why_python", title: "Protocolo Zero", icon: Zap },
  { id: "basics", title: "Comandos de Núcleo", icon: BookOpen },
  { id: "control_flow", title: "Roteamento Lógico", icon: Split },
  { id: "collections", title: "Bancos de Memória", icon: LayoutList },
  { id: "history", title: "Logs do Sistema", icon: History },
  { id: "clean_code", title: "Diretrizes de Segurança", icon: Flame },
] as const;

const RITUALS = {
  basics: [
    { title: "print()", desc: "Envia dados para a interface de saída (console). Seu primeiro sinal para o Core.", code: "print('Conexão estabelecida.')" },
    { title: "Variáveis", desc: "Aloca blocos de memória para armazenar dados temporários na rede.", code: "operador = 'Neo'\nprint(operador)" },
    { title: "Operadores", desc: "Processamento aritmético com módulos +, -, *, /.", code: "criptografia = 10 + 5\nprint(criptografia)" }
  ],
  control_flow: [
    { title: "if / else", desc: "Bifurcação lógica do sistema. Toma decisões baseadas em pacotes de dados.", code: "acesso = 1\nif acesso > 0:\n    print('Acesso Garantido')\nelse:\n    print('Acesso Negado')" },
    { title: "for (Loops)", desc: "Automatiza a execução de um script em massa para vários alvos.", code: "for i in range(3):\n    print('Bypass no Firewall...')" }
  ],
  collections: [
    { title: "Listas", desc: "Vetores para carregar múltiplos pacotes de dados em uma ordem sequencial.", code: "modulos = ['Stealth', 'Scanner', 'Overclock']\nprint(modulos[0])" },
    { title: "Dicionários", desc: "Banco de dados local associando chaves de registro aos seus valores.", code: "alvo = {'ip': '192.168.1.1', 'status': 'ativo'}\nprint(alvo['ip'])" }
  ]
};

export function Codex({ isOpen, onClose, onSendToEditor }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("why_python");

  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Script copiado para a área de transferência.");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "why_python":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border border-sky-500/20 rounded-[1.5rem] bg-sky-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Terminal size={120} />
              </div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-4 relative font-serif">
                <BookOpen className="text-sky-400" /> Acesso à Mainframe
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium text-lg relative">
                Sua credencial é de um <strong className="text-sky-400">Operador de Sistemas</strong> (Hacker). 
                O núcleo da cidade (Core) foi isolado. Python é a linguagem nativa capaz de fazer o bypass nos firewalls e restaurar o controle.
              </p>
            </div>
            
            <div className="p-6 md:p-8 border border-white/5 rounded-[1.5rem] bg-slate-900/50">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-400 mb-4 flex items-center gap-2">
                <Zap size={16} /> Por que Python?
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium mb-8">
                Criada para ser lida por humanos, não apenas por máquinas. O Python permite que você foque na lógica da intrusão, e não na sintaxe pesada dos sistemas legados.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-300 mb-3">Eficiência</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Scripts enxutos. O que levava 100 linhas em C, você resolve com 10 no terminal Python.</p>
                </div>
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-300 mb-3">Poder Computacional</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Desde Machine Learning para driblar IAs até servidores web massivos.</p>
                </div>
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-300 mb-3">A Rede (Comunidade)</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">A maior rede colaborativa do planeta. Sempre há módulos open-source prontos para uso.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "history":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 md:p-10 border border-white/5 rounded-[1.5rem] bg-slate-900/50 relative overflow-hidden">
            <div className="absolute top-4 right-8 text-8xl font-black text-white/[0.02] pointer-events-none font-serif">1991</div>
            <h3 className="text-3xl font-black text-sky-400 mb-8 font-serif italic">Arquivos do Arquiteto</h3>
            <div className="space-y-6 text-slate-300 leading-relaxed font-medium text-lg">
              <p>
                Nos primórdios da rede de 1989, <strong className="text-white">Guido van Rossum</strong> compilou a primeira versão da linguagem no Centrum Wiskunde & Informatica (CWI) na Holanda, para simplificar a comunicação entre humanos e as máquinas primordiais.
              </p>
              <div className="p-5 border-l-4 border-sky-500 bg-sky-500/5 rounded-r-xl my-8">
                <p className="text-sky-100">
                  <strong className="text-sky-400">Log Fragmentado:</strong> Ao contrário da lenda de que o nome veio de uma cobra peçonhenta cibernética, os registros apontam que Guido nomeou o sistema em homenagem ao programa britânico <em className="text-white">Monty Python's Flying Circus</em>.
                </p>
              </div>
              <p>
                Hoje, os Operadores seguem o <strong className="text-sky-300">Zen of Python</strong> (PEP 20), os 19 mandamentos hardcoded no sistema: 
                <br/><br/>
                <em className="text-slate-400 italic block pl-4 border-l-2 border-slate-700">"Bonito é melhor que feio."</em>
                <em className="text-slate-400 italic block pl-4 border-l-2 border-slate-700 mt-2">"Explícito é melhor que implícito."</em>
                <em className="text-slate-400 italic block pl-4 border-l-2 border-slate-700 mt-2">"Simples é melhor que complexo."</em>
              </p>
            </div>
          </div>
        );

      case "clean_code":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border border-red-500/20 rounded-[1.5rem] bg-red-500/5 relative overflow-hidden">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 mb-4 flex items-center gap-2">
                <X size={16} /> Falha de Compilação
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium italic text-lg">
                "Código mal otimizado é rapidamente detectado pelos Scanners do Sistema." 
                <br/><br/>
                Evite injetar scripts confusos! Ignorar a indentação em um loop <code className="text-red-300">for</code> ou usar variáveis obscuras como <code className="text-red-300">x</code> causará um SyntaxError letal.
              </p>
            </div>
            
            <div className="p-6 md:p-8 border border-emerald-500/20 rounded-[1.5rem] bg-emerald-500/5">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2">
                <Flame size={16} /> Protocolos de Código Limpo
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Semântica de Variáveis</h4>
                    <p className="text-slate-300 leading-relaxed">Sempre declare <strong className="text-white">nomes significativos</strong> (ex: <code className="bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded text-sm">firewall_ativo</code>) para clareza. Evite <code className="bg-red-500/20 text-red-200 px-1.5 py-0.5 rounded text-sm">f</code>.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Hierarquia de Espaços (PEP 8)</h4>
                    <p className="text-slate-300 leading-relaxed">Em Python, os blocos de execução são baseados estritamente em identação. Use <strong className="text-white">4 espaços exatos</strong> para declarar o que está dentro do escopo.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Anotações Estratégicas</h4>
                    <p className="text-slate-300 leading-relaxed">Comente o <strong className="text-white">motivo</strong> ("Bypass temporário para evitar detecção"), e não o óbvio ("Este código faz um loop de 3"). A sintaxe já é autodescritiva.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        );

      case "basics":
      case "control_flow":
      case "collections":
        const rituals = RITUALS[activeTab];
        return (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-slate-300 leading-relaxed font-medium text-lg mb-2">
              Acesse as bibliotecas fundamentais do sistema. Utilize estes scripts como blocos de construção para suas invasões:
            </p>
            {rituals.map((r, i) => (
              <div key={i} className="border border-white/10 rounded-2xl bg-slate-900/60 overflow-hidden hover:border-sky-500/30 transition-all group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-black text-sky-400">{r.title}</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => copyCode(r.code)} className="h-8 w-8 text-slate-500 hover:text-white bg-white/5 rounded-lg">
                        <Copy size={14} />
                      </Button>
                      {onSendToEditor && (
                        <Button onClick={() => onSendToEditor(r.code)} className="h-8 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest px-3 rounded-lg shadow-lg shadow-sky-900/20">
                          <Play size={12} className="mr-1.5" /> Injetar
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 font-medium mb-5">{r.desc}</p>
                  <pre className="bg-slate-950 border border-white/5 text-sky-100 rounded-xl p-5 text-sm font-mono overflow-x-auto selection:bg-sky-500/30">
                    {r.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1200px] h-[85vh] bg-[#0d1117] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden backdrop-blur-xl"
          >
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-[#080b0f] border-b md:border-b-0 md:border-r border-white/5 flex flex-col shrink-0">
              <div className="p-8 pb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border border-sky-500/30 bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <Terminal className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-white font-mono tracking-tight">MANUAL.OS</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                        isActive 
                          ? "bg-sky-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] border border-sky-500/50" 
                          : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-white" : "text-sky-500"} />
                      <span className="font-bold text-[15px]">{tab.title}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="p-6 mt-auto border-t border-white/5 hidden md:block">
                <div className="flex items-center gap-3 text-sky-500/50 hover:text-sky-400 transition-colors cursor-default">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Acesso Root</span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative bg-[#0f172a]/20">
              <div className="p-8 pb-6 flex justify-between items-center border-b border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
                    {(() => {
                      const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon || BookOpen;
                      return <ActiveIcon size={20} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white font-mono tracking-tight">
                      {TABS.find(t => t.id === activeTab)?.title}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500/50 mt-1">
                      Registro de Dados
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl text-slate-500 hover:text-white hover:bg-white/5">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-white/10">
                <div className="max-w-3xl mx-auto">
                  {renderContent()}
                </div>
              </div>
              
              <div className="p-6 px-8 border-t border-white/5 flex justify-end shrink-0 bg-[#080b0f]/80 backdrop-blur-md">
                <Button 
                  onClick={onClose}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-black px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:scale-105 active:scale-95 text-sm"
                >
                  Fechar Janela
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
