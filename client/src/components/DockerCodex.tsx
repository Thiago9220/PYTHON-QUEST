import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Container as ContainerIcon, Package, Cloud, Terminal, X, Zap, 
  History, Flame, LayoutList, Split, Cpu, BookOpen, Search,
  RefreshCw, RotateCcw, Settings, FileCode, Copy, Play, Boxes, HardDrive, Network, Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSendToTerminal?: (code: string) => void;
};

type TabId = "concepts" | "basics" | "management" | "build" | "infra" | "compose" | "best_practices";

const TABS = [
  { id: "concepts", title: "Filosofia Docker", icon: Zap },
  { id: "basics", title: "Ciclo Vital", icon: RefreshCw },
  { id: "management", title: "Controle de Carga", icon: Settings },
  { id: "build", title: "Forja de Imagens", icon: Flame },
  { id: "infra", title: "Redes e Volumes", icon: Network },
  { id: "compose", title: "Orquestração", icon: Boxes },
  { id: "best_practices", title: "Protocolo Slim", icon: Cpu },
] as const;

const RITUALS = {
  basics: [
    { title: "docker pull", desc: "Baixa uma imagem pronta do Docker Hub para o seu servidor local.", code: "docker pull nginx:latest" },
    { title: "docker run", desc: "Cria e inicia um container baseado em uma imagem. O comando fundamental.", code: "docker run -d --name meu-site -p 80:80 nginx" },
    { title: "docker images", desc: "Lista todas as imagens que você já baixou ou construiu localmente.", code: "docker images" },
    { title: "docker ps", desc: "Lista os containers em execução no momento.", code: "docker ps\n# ou docker ps -a para ver todos" },
  ],
  management: [
    { title: "docker stop", desc: "Envia um sinal de encerramento seguro para um container rodando.", code: "docker stop meu-container" },
    { title: "docker rm", desc: "Remove um container permanentemente. Ele deve estar parado (ou use -f).", code: "docker rm meu-container" },
    { title: "docker rmi", desc: "Apaga uma imagem do seu disco local para liberar espaço.", code: "docker rmi nginx:latest" },
    { title: "docker logs", desc: "Exibe a saída (stdout/stderr) do container para debug.", code: "docker logs -f meu-container" },
    { title: "docker inspect", desc: "Retorna um JSON detalhado com toda a configuração do container ou imagem.", code: "docker inspect meu-container" },
    { title: "docker exec", desc: "Executa um comando dentro de um container que já está rodando.", code: "docker exec -it meu-container sh" },
  ],
  build: [
    { title: "Dockerfile", desc: "Arquivo de receita para construir sua própria imagem personalizada.", code: "FROM node:alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"node\", \"index.js\"]" },
    { title: "docker build", desc: "Compila o Dockerfile e gera uma imagem pronta para uso.", code: "docker build -t meu-app:v1 ." },
    { title: "docker tag", desc: "Cria um apelido (alias) para uma imagem existente, útil para versionamento.", code: "docker tag meu-app:v1 meu-usuario/meu-app:latest" },
    { title: "docker push", desc: "Envia sua imagem local para o Docker Hub ou outro registry privado.", code: "docker push meu-usuario/meu-app:latest" },
  ],
  infra: [
    { title: "docker volume create", desc: "Cria uma área de armazenamento persistente fora do ciclo de vida do container.", code: "docker volume create dados-db" },
    { title: "docker network create", desc: "Cria uma rede isolada para que containers possam se comunicar pelo nome.", code: "docker network create minha-rede" },
    { title: "Mapeamento de Porta", desc: "Conecta uma porta do seu PC (host) a uma porta dentro do container.", code: "docker run -p 8080:80 nginx\n# Host:8080 -> Container:80" },
    { title: "Montagem de Volume", desc: "Vincula um volume ou pasta do host a um diretório no container.", code: "docker run -v dados-db:/var/lib/mysql mysql" },
  ],
  compose: [
    { title: "docker-compose up", desc: "Lê o arquivo YAML e sobe toda a sua infraestrutura de uma vez.", code: "docker-compose up -d" },
    { title: "docker-compose down", desc: "Para e remove todos os containers, redes e imagens definidos no compose.", code: "docker-compose down" },
    { title: "docker-compose ps", desc: "Lista o status de todos os serviços orquestrados pelo projeto atual.", code: "docker-compose ps" },
    { title: "docker-compose logs", desc: "Agrega os logs de todos os serviços (web, db, etc) em uma única tela.", code: "docker-compose logs -f" },
  ]
};

export function DockerCodex({ isOpen, onClose, onSendToTerminal }: Props) {
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
    toast.success("Comando copiado.");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "concepts":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border border-sky-500/20 rounded-[1.5rem] bg-sky-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Boxes size={120} />
              </div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-4 relative font-serif">
                <ContainerIcon className="text-sky-400" /> A Revolução dos Containers
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium text-lg relative">
                O Docker resolve o clássico problema do <em className="text-white italic">"na minha máquina funciona"</em>. Ele empacota o software com todas as suas dependências em uma unidade padronizada chamada <strong className="text-sky-400">Container</strong>.
              </p>
            </div>
            
            <div className="p-6 md:p-8 border border-white/5 rounded-[1.5rem] bg-slate-900/50">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-400 mb-6 flex items-center gap-2">
                <Zap size={16} /> Imagem vs Container
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-3">Imagem (A Receita)</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Um arquivo imutável que contém o código, bibliotecas e configurações. É o molde estático.</p>
                </div>
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-3">Container (O Bolo)</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">A instância viva e em execução da imagem. É isolada, leve e pode ser destruída e recriada em segundos.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "best_practices":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border border-amber-500/20 rounded-[1.5rem] bg-amber-500/5 relative overflow-hidden">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400 mb-4 flex items-center gap-2">
                <Flame size={16} /> Imagens Obesas
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium italic text-lg">
                "Uma imagem de 1GB para um app de 10MB é um pecado contra a infraestrutura."
                <br/><br/>
                Imagens grandes demoram para subir, baixar e iniciar. Em produção, cada megabyte conta para a agilidade do sistema.
              </p>
            </div>
            
            <div className="p-6 md:p-8 border border-sky-500/20 rounded-[1.5rem] bg-sky-500/5">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-400 mb-6 flex items-center gap-2">
                <Cpu size={16} /> Protocolos de Otimização
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-sky-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                  <div>
                    <h4 className="text-sky-300 font-bold mb-1">Use Imagens Alpine</h4>
                    <p className="text-slate-300 leading-relaxed">Sempre que possível, use tags <code className="text-white">-alpine</code>. Elas são versões minimalistas (baseadas em musl e busybox) que reduzem o tamanho da imagem de 800MB para 50MB.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-sky-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                  <div>
                    <h4 className="text-sky-300 font-bold mb-1">Multi-stage Builds</h4>
                    <p className="text-slate-300 leading-relaxed">Use uma imagem pesada para compilar (build) e copie apenas o binário final para uma imagem leve. Isso descarta ferramentas de build desnecessárias em produção.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-sky-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                  <div>
                    <h4 className="text-sky-300 font-bold mb-1">Caching de Layers</h4>
                    <p className="text-slate-300 leading-relaxed">Copie o arquivo de dependências (package.json) e instale-as ANTES de copiar o resto do código. Isso evita reinstalar tudo a cada pequena mudança no código.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        );

      case "basics":
      case "management":
      case "build":
      case "infra":
      case "compose":
        const rituals = RITUALS[activeTab as keyof typeof RITUALS];
        
        const tabDesc = {
          basics: "Comandos essenciais para interagir com o Docker Hub e rodar seus primeiros containers.",
          management: "Ferramentas para monitorar, depurar e limpar containers e imagens no seu ambiente local.",
          build: "Transforme seu código em uma infraestrutura portável criando suas próprias imagens.",
          infra: "Configure o isolamento e a persistência: conecte containers e salve dados além do reboot.",
          compose: "Orquestre múltiplos serviços complexos usando um único arquivo de configuração declarativo."
        }[activeTab as keyof typeof RITUALS];

        return (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-slate-300 leading-relaxed font-medium text-lg mb-2">
              {tabDesc}
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
                      {onSendToTerminal && (
                        <Button onClick={() => {
                          onSendToTerminal(r.code.split('\n')[0]);
                          onClose();
                        }} className="h-8 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest px-3 rounded-lg shadow-lg shadow-sky-900/20">
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
                <div className="w-12 h-12 rounded-xl border border-sky-500/30 bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <ContainerIcon className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-white font-mono tracking-tight uppercase">Manual.🐳</h2>
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
                          ? "bg-sky-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] border border-sky-500/50" 
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
                  <Server className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Core Engine Active</span>
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
                      Módulo de Simulação
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
                  className="bg-sky-600 hover:bg-sky-500 text-white font-black px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all hover:scale-105 active:scale-95 text-sm"
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
