import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Code2, Copy, Play, X, Zap, History, Flame, LayoutList, Split, Terminal, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSendToEditor?: (code: string) => void;
};

type TabId = "why_python" | "basics" | "control_flow" | "collections" | "functions" | "cyber_tools" | "history" | "clean_code";

const TABS_DATA = {
  pt: [
    { id: "why_python", title: "Protocolo Zero", icon: Zap },
    { id: "basics", title: "Comandos de Núcleo", icon: BookOpen },
    { id: "control_flow", title: "Roteamento Lógico", icon: Split },
    { id: "collections", title: "Bancos de Memória", icon: LayoutList },
    { id: "functions", title: "Sub-rotinas", icon: Code2 },
    { id: "cyber_tools", title: "Módulos Táticos", icon: Cpu },
    { id: "history", title: "Logs do Sistema", icon: History },
    { id: "clean_code", title: "Diretrizes de Segurança", icon: Flame },
  ],
  en: [
    { id: "why_python", title: "Protocol Zero", icon: Zap },
    { id: "basics", title: "Core Commands", icon: BookOpen },
    { id: "control_flow", title: "Control Flow", icon: Split },
    { id: "collections", title: "Memory Banks", icon: LayoutList },
    { id: "functions", title: "Subroutines", icon: Code2 },
    { id: "cyber_tools", title: "Tactical Modules", icon: Cpu },
    { id: "history", title: "System Logs", icon: History },
    { id: "clean_code", title: "Security Guidelines", icon: Flame },
  ],
} as const;

const RITUALS_DATA = {
  pt: {
    basics: [
      { title: "print()", desc: "Envia dados para a interface de saída (console). Seu primeiro sinal para o Core.", code: "print('Conexão estabelecida.')" },
      { title: "input()", desc: "Abre um canal de entrada para receber comandos do usuário em tempo real.", code: "alvo = input('Digite o IP: ')\nprint('Escaneando', alvo)" },
      { title: "Variáveis", desc: "Aloca blocos de memória para armazenar dados temporários na rede.", code: "operador = 'Neo'\nprint(operador)" },
      { title: "Tipos Primitivos", desc: "Classificação de dados: int (inteiros), float (decimais), str (textos) e bool (booleanos).", code: "nivel = 5        # int\npeso = 72.5      # float\nnome = 'Alice'   # str\nativo = True     # bool" },
      { title: "Operadores", desc: "Processamento aritmético com módulos +, -, *, /, //, %.", code: "criptografia = 10 + 5\nsobra = 10 % 3\nprint(criptografia, sobra)" },
      { title: "F-Strings", desc: "Injeção dinâmica de variáveis dentro de strings (textos).", code: "porta = 8080\nprint(f'Atacando a porta {porta}!')" }
    ],
    control_flow: [
      { title: "if / elif / else", desc: "Bifurcação lógica múltipla. Avalia diferentes cenários sequencialmente.", code: "acesso = 2\nif acesso == 1:\n    print('Nível 1')\nelif acesso == 2:\n    print('Nível 2')\nelse:\n    print('Negado')" },
      { title: "for (Loops)", desc: "Automatiza a execução de um script em massa para vários alvos.", code: "for i in range(3):\n    print('Bypass no Firewall...')" },
      { title: "while (Loops)", desc: "Mantém a execução contínua enquanto uma condição for verdadeira.", code: "tentativas = 0\nwhile tentativas < 3:\n    print('Quebrando senha...')\n    tentativas += 1" },
      { title: "break / continue", desc: "Interrompe totalmente um loop (break) ou pula para a próxima iteração (continue).", code: "for p in range(5):\n    if p == 2:\n        continue\n    print(f'Porta {p} aberta')" },
      { title: "try / except", desc: "Bypass de Erros. Evita que o script pare se uma operação falhar (ex: conexão recusada).", code: "try:\n    print('Conectando...')\n    x = 10 / 0 # Erro proposital\nexcept:\n    print('Bypass: Erro detectado e ignorado.')" }
    ],
    collections: [
      { title: "Listas", desc: "Vetores para carregar múltiplos pacotes de dados em uma ordem sequencial.", code: "modulos = ['Stealth', 'Scanner']\nmodulos.append('Rootkit')\nprint(modulos[0])" },
      { title: "Dicionários", desc: "Banco de dados local associando chaves de registro aos seus valores.", code: "alvo = {'ip': '192.168.1.1', 'status': 'ativo'}\nprint(alvo['ip'])" },
      { title: "Tuplas", desc: "Listas blindadas (imutáveis). Seus dados não podem ser alterados após a criação.", code: "coordenadas = (45.5, -22.3)\nprint(coordenadas[1])" },
      { title: "Sets (Conjuntos)", desc: "Coleção de dados únicos não ordenados. Excelente para remover duplicatas.", code: "ips = {'10.0.0.1', '10.0.0.2', '10.0.0.1'}\nprint(ips) # O duplicado some" },
      { title: "Slicing", desc: "Extrai fragmentos específicos de listas ou textos.", code: "hash = 'a3f9c1b7'\nprint(hash[0:4]) # a3f9" },
      { title: "List Comprehension", desc: "Processamento de dados em massa em uma única linha. Otimiza varreduras.", code: "alvos = [f'10.0.0.{i}' for i in range(5)]\nprint(alvos)" }
    ],
    functions: [
      { title: "def (Definir)", desc: "Empacota uma sequência de comandos em uma sub-rotina reutilizável.", code: "def hackear():\n    print('Iniciando invasão...')\n\nhackear()" },
      { title: "Parâmetros", desc: "Variáveis de entrada que a sub-rotina exige para funcionar.", code: "def atacar(ip):\n    print(f'Atacando {ip}')\n\natacar('192.168.1.1')" },
      { title: "return (Retorno)", desc: "O resultado que a sub-rotina devolve para o sistema após a execução.", code: "def descriptografar(dado):\n    return dado + '_decrypted'\n\nresultado = descriptografar('senha')\nprint(resultado)" }
    ],
    cyber_tools: [
      { title: "import os (Sistema)", desc: "Acessa o núcleo do sistema operacional alvo para varredura e manipulação de diretórios.", code: "import os\n# Lista arquivos na raiz do sistema\nprint(os.listdir('.'))" },
      { title: "import hashlib (Criptografia)", desc: "Gera e compara hashes de segurança (ex: SHA-256) para forja ou quebra de senhas.", code: "import hashlib\nalvo = hashlib.sha256(b'admin123').hexdigest()\nprint(f'Hash gerado: {alvo}')" },
      { title: "import base64 (Ofuscação)", desc: "Codifica e decodifica payloads para ocultar o tráfego na rede e burlar firewalls.", code: "import base64\nmensagem = b'Acesso Root'\ncripto = base64.b64encode(mensagem)\nprint(cripto)" },
      { title: "import socket (Rede)", desc: "Abre sockets TCP/UDP de baixo nível para port scanning e interceptação de pacotes.", code: "import socket\nrede = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nprint('Socket TCP pronto.')" },
      { title: "import random (Caos)", desc: "Gera entropia e números aleatórios, vital para criptografia e evasão de padrões.", code: "import random\nporta = random.randint(1024, 65535)\nprint(f'Porta: {porta}')" },
      { title: "with open (Arquivos)", desc: "Acesso silencioso a arquivos. Garante que os vestígios (locks) sejam removidos.", code: "with open('logs.txt', 'w') as f:\n    f.write('Acesso: Admin')\nprint('Logs salvos.')" },
      { title: "import json (Parser)", desc: "Decodifica dados interceptados em formato JSON de bancos de dados remotos.", code: "import json\ndado_raw = '{\"status\": \"ok\", \"id\": 1}'\ndata = json.loads(dado_raw)\nprint(f'ID: {data[\"id\"]}')" },
      { title: "import sys (Argumentos)", desc: "Captura parâmetros passados via linha de comando ao executar seu script de ataque.", code: "import sys\n# Uso: script.py <ip>\nif len(sys.argv) > 1:\n    print(f'Injetando em: {sys.argv[1]}')" }
    ]
  },
  en: {
    basics: [
      { title: "print()", desc: "Sends data to the output terminal (console). Your first signal to the Core.", code: "print('Connection established.')" },
      { title: "input()", desc: "Opens an input channel to receive real-time user commands.", code: "target = input('Enter IP: ')\nprint('Scanning', target)" },
      { title: "Variables", desc: "Allocates memory blocks to store temporary data on the network.", code: "operator = 'Neo'\nprint(operator)" },
      { title: "Primitive Types", desc: "Data classification: int (integers), float (decimals), str (strings), and bool (booleans).", code: "level = 5        # int\nweight = 72.5    # float\nname = 'Alice'   # str\nactive = True    # bool" },
      { title: "Operators", desc: "Arithmetic processing with +, -, *, /, //, %.", code: "cipher = 10 + 5\nremainder = 10 % 3\nprint(cipher, remainder)" },
      { title: "F-Strings", desc: "Dynamic variable interpolation inside strings.", code: "port = 8080\nprint(f'Scanning port {port}!')" }
    ],
    control_flow: [
      { title: "if / elif / else", desc: "Multi-way logical branching. Evaluates conditions sequentially.", code: "access = 2\nif access == 1:\n    print('Level 1')\nelif access == 2:\n    print('Level 2')\nelse:\n    print('Denied')" },
      { title: "for (Loops)", desc: "Automates batch execution across sequences or multiple targets.", code: "for i in range(3):\n    print('Bypassing Firewall...')" },
      { title: "while (Loops)", desc: "Keeps running continuously while a condition holds true.", code: "attempts = 0\nwhile attempts < 3:\n    print('Cracking key...')\n    attempts += 1" },
      { title: "break / continue", desc: "Terminates a loop early (break) or skips to the next iteration (continue).", code: "for p in range(5):\n    if p == 2:\n        continue\n    print(f'Port {p} open')" },
      { title: "try / except", desc: "Error Bypass. Prevents crashes when a risky operation fails.", code: "try:\n    print('Connecting...')\n    x = 10 / 0\nexcept:\n    print('Bypass: Error caught and handled.')" }
    ],
    collections: [
      { title: "Lists", desc: "Ordered mutable arrays for holding sequences of data packets.", code: "modules = ['Stealth', 'Scanner']\nmodules.append('Rootkit')\nprint(modules[0])" },
      { title: "Dictionaries", desc: "Key-value local stores mapping record keys to their values.", code: "target = {'ip': '192.168.1.1', 'status': 'active'}\nprint(target['ip'])" },
      { title: "Tuples", desc: "Armored (immutable) sequences. Data cannot be modified after creation.", code: "coords = (45.5, -22.3)\nprint(coords[1])" },
      { title: "Sets", desc: "Unordered collection of unique items. Great for deduplication.", code: "ips = {'10.0.0.1', '10.0.0.2', '10.0.0.1'}\nprint(ips)" },
      { title: "Slicing", desc: "Extracts specific sub-ranges from lists or strings.", code: "hash_val = 'a3f9c1b7'\nprint(hash_val[0:4]) # a3f9" },
      { title: "List Comprehension", desc: "One-line batch transformations to streamline data pipelines.", code: "targets = [f'10.0.0.{i}' for i in range(5)]\nprint(targets)" }
    ],
    functions: [
      { title: "def (Define)", desc: "Packages a sequence of commands into a reusable subroutine.", code: "def breach():\n    print('Initiating breach...')\n\nbreach()" },
      { title: "Parameters", desc: "Input variables a subroutine requires to execute.", code: "def scan(ip):\n    print(f'Scanning {ip}')\n\nscan('192.168.1.1')" },
      { title: "return", desc: "Sends a computed result back to the caller after execution.", code: "def decrypt(data):\n    return data + '_decrypted'\n\nresult = decrypt('key')\nprint(result)" }
    ],
    cyber_tools: [
      { title: "import os (System)", desc: "Accesses OS interfaces to inspect directories and files.", code: "import os\nprint(os.listdir('.'))" },
      { title: "import hashlib (Crypto)", desc: "Generates cryptographic hashes like SHA-256 for integrity verification.", code: "import hashlib\ndigest = hashlib.sha256(b'admin123').hexdigest()\nprint(f'Hash: {digest}')" },
      { title: "import base64 (Encoding)", desc: "Encodes and decodes payloads into Base64 transport strings.", code: "import base64\nmsg = b'Root Access'\nencoded = base64.b64encode(msg)\nprint(encoded)" },
      { title: "import socket (Network)", desc: "Low-level TCP/UDP sockets for port scanning and network transport.", code: "import socket\nsock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nprint('TCP Socket ready.')" },
      { title: "import random (Entropy)", desc: "Generates pseudo-random numbers for simulations and randomized probes.", code: "import random\nport = random.randint(1024, 65535)\nprint(f'Port: {port}')" },
      { title: "with open (Files)", desc: "Safe context-managed file I/O guaranteeing clean resource closure.", code: "with open('logs.txt', 'w') as f:\n    f.write('Access: Admin')\nprint('Logs saved.')" },
      { title: "import json (Parser)", desc: "Parses JSON payloads intercepted from APIs and remote nodes.", code: "import json\nraw = '{\"status\": \"ok\", \"id\": 1}'\ndata = json.loads(raw)\nprint(f'ID: {data[\"id\"]}')" },
      { title: "import sys (Runtime)", desc: "Reads runtime state and CLI arguments passed to your script.", code: "import sys\nif len(sys.argv) > 1:\n    print(f'Target: {sys.argv[1]}')" }
    ]
  }
} as const;

export function Codex({ isOpen, onClose, onSendToEditor }: Props) {
  const { lang, t } = useLanguage();
  const TABS = TABS_DATA[lang];
  const RITUALS = RITUALS_DATA[lang];
  const [activeTab, setActiveTab] = useState<TabId>("why_python");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("why_python");
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
    toast.success(t("codexCopiedToast"));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "why_python":
        return lang === "en" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border border-sky-500/20 rounded-[1.5rem] bg-sky-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Terminal size={120} />
              </div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-4 relative font-serif">
                <BookOpen className="text-sky-400" /> Mainframe Access
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium text-lg relative">
                Your clearance is that of a <strong className="text-sky-400">Systems Operator</strong>. 
                The city Core has been isolated. Python is the native language capable of bypassing the firewalls and restoring control.
              </p>
            </div>
            
            <div className="p-6 md:p-8 border border-white/5 rounded-[1.5rem] bg-slate-900/50">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-400 mb-4 flex items-center gap-2">
                <Zap size={16} /> Why Python?
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium mb-8">
                Designed to be readable by humans, not just machines. Python lets you focus on intrusion logic instead of heavy legacy boilerplate. It turned everyday operators into <strong className="text-sky-400">Network Architects</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-300 mb-3">Efficiency</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">Lean scripts. What takes 100 lines in C can often be solved in 10 lines of Python.</p>
                </div>
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-300 mb-3">Compute Power</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">From Machine Learning to bypass AI systems to massive web infrastructure.</p>
                </div>
                <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-300 mb-3">The Network</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">The largest open-source ecosystem on Earth with battle-tested libraries ready to deploy.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
                Criada para ser lida por humanos, não apenas por máquinas. O Python permite que você foque na lógica da intrusão, e não na sintaxe pesada dos sistemas legados. É a linguagem que transformou usuários comuns em <strong className="text-sky-400">Aritetos da Rede</strong>.
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
        return lang === "en" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 md:p-10 border border-white/5 rounded-[1.5rem] bg-slate-900/50 relative overflow-hidden">
            <div className="absolute top-4 right-8 text-8xl font-black text-white/[0.02] pointer-events-none font-serif">1991</div>
            <h3 className="text-3xl font-black text-sky-400 mb-8 font-serif italic">Architect's Archives</h3>
            <div className="space-y-6 text-slate-300 leading-relaxed font-medium text-lg">
              <p>
                In the early network era of 1989, <strong className="text-white">Guido van Rossum</strong> built the first version of the language at CWI in the Netherlands to bridge humans and primordial machines.
              </p>
              <div className="p-5 border-l-4 border-sky-500 bg-sky-500/5 rounded-r-xl my-8">
                <p className="text-sky-100">
                  <strong className="text-sky-400">Fragmented Log:</strong> Despite the myth of a cyber-viper, Guido named the language after the British comedy group <em className="text-white">Monty Python's Flying Circus</em>.
                </p>
              </div>
              <p>
                Today, Operators follow the <strong className="text-sky-300">Zen of Python</strong> (PEP 20): 
                <br/><br/>
                <em className="text-slate-400 italic block pl-4 border-l-2 border-slate-700">"Beautiful is better than ugly."</em>
                <em className="text-slate-400 italic block pl-4 border-l-2 border-slate-700 mt-2">"Explicit is better than implicit."</em>
                <em className="text-slate-400 italic block pl-4 border-l-2 border-slate-700 mt-2">"Simple is better than complex."</em>
              </p>
            </div>
          </div>
        ) : (
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
        return lang === "en" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border border-red-500/20 rounded-[1.5rem] bg-red-500/5 relative overflow-hidden">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 mb-4 flex items-center gap-2">
                <X size={16} /> Compilation Failure
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium italic text-lg">
                "Poorly structured code is flagged instantly by System Scanners." 
                <br/><br/>
                Avoid messy scripts! Breaking indentation inside a <code className="text-red-300">for</code> loop or using cryptic variable names like <code className="text-red-300">x</code> leads to fatal errors.
              </p>
            </div>
            
            <div className="p-6 md:p-8 border border-emerald-500/20 rounded-[1.5rem] bg-emerald-500/5">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2">
                <Flame size={16} /> Clean Code Protocols
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Meaningful Variable Names</h4>
                    <p className="text-slate-300 leading-relaxed">Always declare <strong className="text-white">descriptive names</strong> (e.g. <code className="bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded text-sm">firewall_active</code>) for clarity.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Space Hierarchy (PEP 8)</h4>
                    <p className="text-slate-300 leading-relaxed">Python blocks depend strictly on indentation. Use <strong className="text-white">4 spaces</strong> per level.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Strategic Comments</h4>
                    <p className="text-slate-300 leading-relaxed">Explain <strong className="text-white">why</strong> ("Temporary bypass"), not what the code already states.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Input Sanitization</h4>
                    <p className="text-slate-300 leading-relaxed">Never trust raw external inputs blindly. Validate and cast types (e.g. <code className="bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded text-sm">int()</code>) cleanly.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        ) : (
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
                    <p className="text-slate-300 leading-relaxed">Comente o <strong className="text-white">motivo</strong> ("Bypass temporário"), e não o óbvio ("Loop de 3"). A sintaxe já é autodescritiva.</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <div>
                    <h4 className="text-emerald-300 font-bold mb-1">Sanitização de Inputs</h4>
                    <p className="text-slate-300 leading-relaxed">Nunca confie em dados externos. Valide e converta tipos (ex: <code className="bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded text-sm">int()</code>) para evitar injeções acidentais no Core.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        );

      case "basics":
      case "control_flow":
      case "collections":
      case "functions":
      case "cyber_tools":
        const rituals = RITUALS[activeTab as keyof typeof RITUALS];
        
        const tabDesc = (lang === "en"
          ? {
              basics: "Primary syntax for I/O and data processing. The operational core of Python.",
              control_flow: "Decision structures and loops. Essential for conditional routing and automation.",
              collections: "Data structures to store and manipulate multiple packets in memory.",
              functions: "Package command sequences into reusable blocks to optimize and scale your scripts.",
              cyber_tools: "Access core standard libraries and native modules as building blocks."
            }
          : {
              basics: "Sintaxe primária de interação e processamento de dados. O núcleo operacional da linguagem Python.",
              control_flow: "Estruturas de decisão e loops. Essenciais para criar rotas lógicas condicionais e automatizar suas ferramentas.",
              collections: "Vetores de armazenamento para organizar múltiplos pacotes de dados simultâneos na memória volátil do sistema.",
              functions: "Empacote sequências de comandos em blocos reutilizáveis para otimizar seus scripts e escalar seus ataques.",
              cyber_tools: "Acesse as bibliotecas fundamentais do sistema. Utilize estes módulos nativos como blocos de construção para invasões complexas."
            })[activeTab as keyof typeof RITUALS];

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
                      {onSendToEditor && (
                        <Button onClick={() => onSendToEditor(r.code)} className="h-8 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest px-3 rounded-lg shadow-lg shadow-sky-900/20">
                          <Play size={12} className="mr-1.5" /> {t("codexInjectBtn")}
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
                  <span className="text-[10px] font-black uppercase tracking-widest">{t("codexRootAccess")}</span>
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
                      {t("codexDataRecord")}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl text-slate-500 hover:text-white hover:bg-white/5">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-white/10"
              >

                <div className="max-w-3xl mx-auto">
                  {renderContent()}
                </div>
              </div>
              
              <div className="p-6 px-8 border-t border-white/5 flex justify-end shrink-0 bg-[#080b0f]/80 backdrop-blur-md">
                <Button 
                  onClick={onClose}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-black px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:scale-105 active:scale-95 text-sm"
                >
                  {t("codexCloseWindow")}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
