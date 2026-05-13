import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GitBranch, GitCommit, GitMerge, Github, Terminal, X, Zap, 
  History, Flame, LayoutList, Split, Cpu, BookOpen, Search,
  RefreshCw, RotateCcw, Cloud, Settings, FileCode, Copy, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSendToTerminal?: (code: string) => void;
};

type TabId = "concepts" | "basics" | "branching" | "remote" | "undoing" | "config" | "best_practices";

const TABS = [
  { id: "concepts", title: "Arquitetura Git", icon: Zap },
  { id: "basics", title: "Ciclo de Vida", icon: RefreshCw },
  { id: "branching", title: "Fluxo de Ramais", icon: Split },
  { id: "remote", title: "Sincronização", icon: Cloud },
  { id: "undoing", title: "Viagem no Tempo", icon: RotateCcw },
  { id: "config", title: "Sinal de Identidade", icon: Settings },
  { id: "best_practices", title: "Protocolo Limpo", icon: Flame },
] as const;

const RITUALS = {
  basics: [
    { title: "git init", desc: "Inicializa um novo repositório local. Cria a pasta oculta .git onde a mágica acontece.", code: "git init" },
    { title: "git status", desc: "Verifica o estado atual da sua Working Directory e Staging Area.", code: "git status" },
    { title: "git add", desc: "Prepara arquivos para o próximo commit. Move do Working Dir para a Staging Area.", code: "git add .\n# ou\ngit add index.html" },
    { title: "git commit", desc: "Grava um snapshot permanente do seu projeto no histórico.", code: 'git commit -m "feat: adiciona sistema de login"' },
    { title: "git log", desc: "Exibe a linha do tempo de todos os commits realizados no repositório.", code: "git log --oneline --graph --all" },
  ],
  branching: [
    { title: "git branch", desc: "Lista todas as branches locais ou cria uma nova sem sair da atual.", code: "git branch feature-x" },
    { title: "git checkout", desc: "Troca de branch ou restaura arquivos da working tree.", code: "git checkout main" },
    { title: "git switch", desc: "Uma alternativa moderna e mais intuitiva ao checkout para trocar de branches.", code: "git switch feature-ui" },
    { title: "git merge", desc: "Funde o histórico de outra branch na sua branch atual.", code: "git merge feature-x" },
    { title: "git checkout -b", desc: "Cria uma nova branch e já muda para ela instantaneamente.", code: "git checkout -b fix-bug" },
  ],
  remote: [
    { title: "git remote add", desc: "Conecta seu repositório local a um servidor remoto (ex: GitHub).", code: "git remote add origin https://github.com/user/repo.git" },
    { title: "git push", desc: "Envia seus commits locais para o servidor remoto.", code: "git push origin main" },
    { title: "git pull", desc: "Baixa as novidades do remote e já tenta fundir (merge) no seu local.", code: "git pull origin main" },
    { title: "git fetch", desc: "Baixa os dados do remote sem alterar seu código local. Seguro para inspeção.", code: "git fetch origin" },
    { title: "git clone", desc: "Cria uma cópia idêntica de um repositório remoto na sua máquina.", code: "git clone https://github.com/user/repo.git" },
  ],
  undoing: [
    { title: "git restore", desc: "Descarta mudanças não commitadas em um arquivo, voltando ao último estado salvo.", code: "git restore index.html" },
    { title: "git reset --soft", desc: "Desfaz o último commit mas mantém as alterações na sua Staging Area.", code: "git reset --soft HEAD~1" },
    { title: "git reset --hard", desc: "PERIGO: Apaga o último commit e todas as mudanças não salvas. Sem volta.", code: "git reset --hard HEAD~1" },
    { title: "git revert", desc: "Cria um novo commit que desfaz exatamente o que um commit anterior fez.", code: "git revert abc1234" },
    { title: "git stash", desc: "Guarda suas mudanças temporariamente em uma pilha para limpar a working dir.", code: "git stash\n# ... depois ...\ngit stash pop" },
  ],
  config: [
    { title: "git config user.name", desc: "Define o nome que aparecerá nos seus commits.", code: 'git config --global user.name "Seu Nome"' },
    { title: "git config user.email", desc: "Define o email vinculado aos seus commits no histórico.", code: 'git config --global user.email "seu@email.com"' },
    { title: "git config --list", desc: "Lista todas as configurações ativas no seu ambiente Git.", code: "git config --list" },
    { title: "git show", desc: "Exibe detalhes e as mudanças específicas de um commit ou objeto.", code: "git show HEAD" },
  ]
};

export function GitCodex({ isOpen, onClose, onSendToTerminal }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("concepts");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("concepts");
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
    
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Comando copiado para a área de transferência.");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "concepts":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border border-emerald-500/20 rounded-[1.5rem] bg-emerald-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <GitBranch size={120} />
              </div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-4 relative font-serif">
                <Terminal className="text-emerald-400" /> A Máquina do Tempo
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium text-lg relative">
                O Git não é apenas um sistema de backup. Ele é uma <strong className="text-emerald-400">infraestrutura de snapshots</strong> que permite ramificar a realidade do código e fundir universos paralelos sem perder um único bit.
              </p>
            </div>
            
            <div className="p-6 md:p-8 border border-white/5 rounded-[1.5rem] bg-slate-900/50">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2">
                <Zap size={16} /> As 3 Áreas Fundamentais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-300 mb-3">Working Directory</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Onde você edita seus arquivos. É a sua área "suja" e não rastreada pelo Git.</p>
                </div>
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-3">Staging Area</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">A sala de espera. Você escolhe quais mudanças entrarão no próximo snapshot.</p>
                </div>
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-fuchsia-300 mb-3">Repository (.git)</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Onde o Git guarda permanentemente os snapshots (commits) e o histórico.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "best_practices":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border border-red-500/20 rounded-[1.5rem] bg-red-500/5 relative overflow-hidden">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 mb-4 flex items-center gap-2">
                <X size={16} /> Alerta de Conflito
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium italic text-lg">
                "Um histórico sujo é pior que um bug. Ele esconde a verdade do sistema."
                <br/><br/>
                Nunca use <code className="text-red-300">git push --force</code> em branches compartilhadas. Isso reescreve a realidade dos outros operadores e causa caos na rede.
              </p>
            </div>
            
            <div className="p-6 md:p-8 border border-emerald-500/20 rounded-[1.5rem] bg-emerald-500/5">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2">
                <Flame size={16} /> Protocolos de Commit
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Commits Atômicos</h4>
                    <p className="text-slate-300 leading-relaxed">Faça commits pequenos e focados. Um commit deve resolver apenas <strong className="text-white">uma coisa</strong>. Isso facilita reverter se algo quebrar.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Mensagens Imperativas</h4>
                    <p className="text-slate-300 leading-relaxed">Escreva como um comando: "Add login feature" em vez de "Added login". O Git lê suas mensagens como instruções para o histórico.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">O .gitignore</h4>
                    <p className="text-slate-300 leading-relaxed">Nunca suba senhas, arquivos binários pesados ou pastas de dependências (node_modules). Use o arquivo <code className="bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded text-sm">.gitignore</code> para filtrar o ruído.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        );

      case "basics":
      case "branching":
      case "remote":
      case "undoing":
      case "config":
        const rituals = RITUALS[activeTab as keyof typeof RITUALS];
        
        const tabDesc = {
          basics: "Comandos fundamentais para iniciar seu rastro no sistema e salvar seu progresso local.",
          branching: "Crie realidades alternativas. Trabalhe em features isoladas sem corromper o núcleo principal (main).",
          remote: "Conecte sua máquina à rede global. Colabore com outros operadores e mantenha backups na nuvem.",
          undoing: "O poder de corrigir o passado. Resgate arquivos deletados ou desfaça decisões erradas com precisão.",
          config: "Personalize sua assinatura criptográfica e ajuste o comportamento da ferramenta Git."
        }[activeTab as keyof typeof RITUALS];

        return (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-slate-300 leading-relaxed font-medium text-lg mb-2">
              {tabDesc}
            </p>
            {rituals.map((r, i) => (
              <div key={i} className="border border-white/10 rounded-2xl bg-slate-900/60 overflow-hidden hover:border-emerald-500/30 transition-all group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-black text-emerald-400">{r.title}</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => copyCode(r.code)} className="h-8 w-8 text-slate-500 hover:text-white bg-white/5 rounded-lg">
                        <Copy size={14} />
                      </Button>
                      {onSendToTerminal && (
                        <Button onClick={() => {
                          onSendToTerminal(r.code.split('\n')[0]);
                          onClose();
                        }} className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 rounded-lg shadow-lg shadow-emerald-900/20">
                          <Play size={12} className="mr-1.5" /> Injetar
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 font-medium mb-5">{r.desc}</p>
                  <pre className="bg-slate-950 border border-white/5 text-emerald-100 rounded-xl p-5 text-sm font-mono overflow-x-auto selection:bg-emerald-500/30">
                    {r.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
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
                <div className="w-12 h-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <GitCommit className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-white font-mono tracking-tight uppercase">Manual.git</h2>
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
                          ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/50" 
                          : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-white" : "text-emerald-500"} />
                      <span className="font-bold text-[15px]">{tab.title}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="p-6 mt-auto border-t border-white/5 hidden md:block">
                <div className="flex items-center gap-3 text-emerald-500/50 hover:text-emerald-400 transition-colors cursor-default">
                  <Github className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Protocolo Open Source</span>
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
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50 mt-1">
                      Snapshot de Memória
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl text-slate-500 hover:text-white hover:bg-white/5">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-white/10">
                <div className="max-w-3xl mx-auto">
                  {renderContent()}
                </div>
              </div>
              
              <div className="p-6 px-8 border-t border-white/5 flex justify-end shrink-0 bg-[#080b0f]/80 backdrop-blur-md">
                <Button 
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 text-sm"
                >
                  Fechar Manual
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
