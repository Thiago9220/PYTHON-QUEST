import React, { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Terminal, Server, Globe, Cpu, ChevronDown, CheckCircle2, Lock, Trophy, Wifi, Radio, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// --- Network Engine Types & State ---
type NetworkState = {
  dnsCache: Record<string, string>;
  openPorts: Record<string, number[]>;
  servers: Record<string, { status: "up" | "down", os: string }>;
};

type Mission = {
  title: string;
  hint: string;
  check: (state: NetworkState, cmd: string) => boolean;
};

type Level = {
  id: number;
  title: string;
  briefing: string;
  missions: Mission[];
};

const LEVELS: Level[] = [
  {
    id: 1,
    title: "Eco na Rede (Ping)",
    briefing: "O primeiro passo de qualquer varredura é descobrir se o alvo está online. O comando 'ping' envia pacotes ICMP para um endereço IP e espera uma resposta.",
    missions: [
      {
        title: "Dispare um ping para o servidor do Google (8.8.8.8)",
        hint: "Digite: ping 8.8.8.8",
        check: (_, cmd) => cmd.startsWith("ping 8.8.8.8")
      }
    ]
  },
  {
    id: 2,
    title: "Resolução de Nomes (DNS)",
    briefing: "Humanos usam nomes (google.com), máquinas usam IPs (8.8.8.8). O DNS faz essa tradução. Use o comando 'nslookup' para interrogar os servidores DNS.",
    missions: [
      {
        title: "Descubra o IP do domínio 'alvo.local'",
        hint: "Digite: nslookup alvo.local",
        check: (_, cmd) => cmd.startsWith("nslookup alvo.local")
      }
    ]
  },
  {
    id: 3,
    title: "Mapeamento de Portas (Nmap)",
    briefing: "Descobriu o IP? Agora precisamos saber quais portas estão abertas para encontrar uma vulnerabilidade. O 'nmap' varre as portas de um servidor.",
    missions: [
      {
        title: "Faça uma varredura no IP 192.168.1.100",
        hint: "Digite: nmap 192.168.1.100",
        check: (_, cmd) => cmd.startsWith("nmap 192.168.1.100")
      }
    ]
  },
  {
    id: 4,
    title: "Captura de Carga (Curl)",
    briefing: "Com a porta 80 (HTTP) aberta, podemos forjar uma requisição web diretamente pelo terminal para extrair dados da aplicação.",
    missions: [
      {
        title: "Faça uma requisição GET para http://192.168.1.100",
        hint: "Digite: curl http://192.168.1.100",
        check: (_, cmd) => cmd.startsWith("curl http://192.168.1.100")
      }
    ]
  }
];

export function NetworkSimulator({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<"intro" | "playing">("intro");
  const [levelIdx, setLevelIdx] = useState(0);
  const [missionIdx, setMissionIdx] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set([0]));
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  
  const [netState, setNetState] = useState<NetworkState>({
    dnsCache: { "alvo.local": "192.168.1.100", "google.com": "8.8.8.8" },
    openPorts: { "192.168.1.100": [22, 80, 443] },
    servers: { "192.168.1.100": { status: "up", os: "Linux" }, "8.8.8.8": { status: "up", os: "Unknown" } }
  });

  const [input, setInput] = useState("");
  const [lines, setLines] = useState<{ type: "in" | "out" | "err" | "ok" | "info"; text: string }[]>([
    { type: "info", text: "NetSim v1.0.0 inicializado. Digite 'help' para comandos." }
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const level = LEVELS[levelIdx];
  const mission = level.missions[missionIdx];
  const levelDone = missionIdx >= level.missions.length;

  const pushLine = (type: "in" | "out" | "err" | "ok" | "info", text: string) => {
    setLines((prev) => [...prev, { type, text }]);
  };

  const processCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;
    pushLine("in", `$ ${raw}`);
    setHistory((prev) => [...prev, raw]);
    setHistoryIdx(-1);

    const args = raw.split(" ").filter(Boolean);
    const cmd = args[0].toLowerCase();

    let output = "";
    let type: "out" | "err" | "ok" | "info" = "out";

    if (cmd === "clear") {
      setLines([]);
      return;
    } else if (cmd === "help") {
      output = `Comandos disponíveis:
  ping <ip>        - Envia pacotes ICMP para testar conectividade
  nslookup <host>  - Consulta servidores DNS para descobrir IPs
  nmap <ip>        - Varredura de portas abertas em um alvo
  curl <url>       - Transfere dados de ou para um servidor (HTTP)
  clear            - Limpa a tela
  reset            - Reinicia o nível atual`;
      type = "info";
    } else if (cmd === "ping") {
      const target = args[1];
      if (!target) {
        output = "Uso: ping <ip ou host>";
        type = "err";
      } else {
        const ip = netState.dnsCache[target] || target;
        if (netState.servers[ip]?.status === "up" || ip === "8.8.8.8") {
          output = `PING ${target} (${ip}) 56 bytes of data.
64 bytes from ${ip}: icmp_seq=1 ttl=64 time=14.2 ms
64 bytes from ${ip}: icmp_seq=2 ttl=64 time=12.1 ms
64 bytes from ${ip}: icmp_seq=3 ttl=64 time=13.5 ms

--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms`;
          type = "ok";
        } else {
          output = `PING ${target} (${ip}) 56 bytes of data.\nDestination Host Unreachable.`;
          type = "err";
        }
      }
    } else if (cmd === "nslookup") {
      const target = args[1];
      if (!target) {
        output = "Uso: nslookup <dominio>";
        type = "err";
      } else {
        const ip = netState.dnsCache[target];
        if (ip) {
          output = `Server:		127.0.0.53\nAddress:	127.0.0.53#53\n\nNon-authoritative answer:\nName:	${target}\nAddress: ${ip}`;
          type = "ok";
        } else {
          output = `** server can't find ${target}: NXDOMAIN`;
          type = "err";
        }
      }
    } else if (cmd === "nmap") {
      const target = args[1];
      if (!target) {
        output = "Uso: nmap <ip>";
        type = "err";
      } else {
        const ports = netState.openPorts[target];
        if (ports) {
          output = `Starting Nmap 7.92 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.012s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
443/tcp open  https

Nmap done: 1 IP address (1 host up) scanned in 1.45 seconds`;
          type = "ok";
        } else {
          output = `Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn`;
          type = "err";
        }
      }
    } else if (cmd === "curl") {
      const target = args[1];
      if (!target) {
        output = "Uso: curl <url>";
        type = "err";
      } else if (target.includes("192.168.1.100") || target.includes("alvo.local")) {
        output = `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "online",
  "system": "CorpHQ_Internal_API",
  "version": "1.0.4-vulnerable"
}`;
        type = "ok";
      } else {
        output = `curl: (7) Failed to connect to ${target} port 80: Connection refused`;
        type = "err";
      }
    } else if (cmd === "reset") {
      setMissionIdx(0);
      setLines([{ type: "info", text: "Nível reiniciado." }]);
      return;
    } else {
      output = `Comando não encontrado: ${cmd}. Digite 'help' para ajuda.`;
      type = "err";
    }

    pushLine(type, output);

    if (!levelDone && mission.check(netState, raw)) {
      setTimeout(() => {
        pushLine("info", `[SUCESSO] Missão concluída: ${mission.title}`);
        if (missionIdx + 1 < level.missions.length) {
          setMissionIdx((m) => m + 1);
        } else {
          pushLine("ok", `[NÍVEL CONCLUÍDO] Você dominou o nível: ${level.title}`);
          setCompletedLevels((prev) => new Set(prev).add(levelIdx));
          if (levelIdx + 1 < LEVELS.length) {
            setUnlocked((prev) => new Set(prev).add(levelIdx + 1));
          }
        }
      }, 500);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCommand(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const i = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const i = historyIdx + 1;
      if (i >= history.length) { setHistoryIdx(-1); setInput(""); }
      else { setHistoryIdx(i); setInput(history[i]); }
    }
  };

  const loadLevel = (idx: number) => {
    setLevelIdx(idx);
    setMissionIdx(0);
    setLines([{ type: "info", text: `Carregando Nível ${LEVELS[idx].id}: ${LEVELS[idx].title}...` }]);
    setPhase("playing");
  };

  if (phase === "intro") {
    const levelStyles = [
      { border: "border-sky-500/20", bg: "bg-sky-500/10", text: "text-sky-400" },
      { border: "border-emerald-500/20", bg: "bg-emerald-500/10", text: "text-emerald-400" },
      { border: "border-amber-500/20", bg: "bg-amber-500/10", text: "text-amber-400" },
      { border: "border-fuchsia-500/20", bg: "bg-fuchsia-500/10", text: "text-fuchsia-400" },
    ];
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]">
            <img 
              src="/assets/images/infrastructure_bg.png" 
              alt="Infrastructure" 
              className="w-full h-full object-cover"
            />
          </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="px-6 py-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="max-w-4xl mx-auto px-4 pb-16 space-y-10 flex-1">
          <div className="text-center pt-6">
            <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-5">
              <Wifi className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">Network Simulator</h1>
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-[0.3em] mb-6">Mapeie, intercepte, domine a rede</p>
            <p className="text-slate-200 text-lg max-w-3xl mx-auto leading-relaxed">
              Um ambiente virtual para você treinar comandos reais de redes e cibersegurança. Descubra IPs, varra portas abertas e extraia dados como um verdadeiro arquiteto da rede.
            </p>
          </div>

          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 flex items-center gap-2">
              <Server className="w-4 h-4" /> Fundamentos de Redes
            </h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                <Globe className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-base font-bold text-white mb-1">Endereços IP</p>
                <p className="text-sm text-slate-400 leading-relaxed">A placa de identificação de cada máquina. Como um endereço postal na internet (ex: 192.168.1.5).</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                <Radio className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-base font-bold text-white mb-1">DNS</p>
                <p className="text-sm text-slate-400 leading-relaxed">A agenda telefônica da web. Traduz nomes amigáveis (google.com) para os IPs reais que os computadores entendem.</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                <ShieldAlert className="w-5 h-5 text-red-400 mb-2" />
                <p className="text-base font-bold text-white mb-1">Portas</p>
                <p className="text-sm text-slate-400 leading-relaxed">As "portas e janelas" virtuais de um IP. A porta 80 é pra web, a 22 é pra acesso remoto (SSH).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Os {LEVELS.length} níveis
            </h2>
            <div className="space-y-2">
              {LEVELS.map((lv, i) => {
                const s = levelStyles[i % levelStyles.length];
                return (
                  <div key={lv.id} className={`bg-slate-900/40 border ${s.border} rounded-xl p-4 flex items-start gap-4`}>
                    <div className={`w-10 h-10 rounded-lg ${s.bg} border border-white/5 ${s.text} flex items-center justify-center font-black text-base shrink-0`}>{lv.id}</div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-white mb-1">{lv.title}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{lv.briefing}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex flex-col items-center gap-3 pt-4">
            <Button onClick={() => setPhase("playing")} size="lg" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-black uppercase tracking-widest px-10 py-6 text-base">
              Iniciar Treinamento <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
            </Button>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Pronto em ~15 minutos</p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
        <img 
          src="/assets/images/infrastructure_bg.png" 
          alt="Infrastructure" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 min-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Network Simulator</h2>
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em]">Varredura em andamento</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => processCommand("reset")} className="text-slate-400 hover:text-white text-xs">Reset Nível</Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {LEVELS.map((lv, i) => {
            const isUnlocked = unlocked.has(i);
            const isDone = completedLevels.has(i);
            const isCurrent = i === levelIdx;
            return (
              <button
                key={lv.id}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && loadLevel(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                  isCurrent ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" :
                  isDone ? "bg-cyan-500/5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" :
                  isUnlocked ? "bg-slate-900 border-white/10 text-slate-300 hover:border-white/30" :
                  "bg-slate-900/50 border-white/5 text-slate-600 cursor-not-allowed"
                }`}
              >
                {!isUnlocked ? <Lock className="w-3 h-3" /> : isDone ? <Trophy className="w-3 h-3" /> : <span className="text-[10px]">{lv.id}</span>}
                Nível {lv.id}: {lv.title}
              </button>
            );
          })}
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 mb-4 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-cyan-400 font-mono mb-2">Briefing do Nível {level.id}</p>
            <p className="text-base text-slate-300 leading-relaxed">{level.briefing}</p>
          </div>
        </div>

        <div className={`rounded-2xl p-5 border mb-4 ${levelDone ? "bg-emerald-500/10 border-emerald-500/40" : "bg-sky-500/10 border-sky-500/30"}`}>
          <div className="flex items-center gap-4">
            {levelDone ? <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" /> :
              <div className="w-8 h-8 rounded-full bg-sky-500/30 text-sky-300 text-sm font-bold flex items-center justify-center shrink-0">{missionIdx + 1}</div>}
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-1">
                {levelDone ? `Nível ${level.id} concluído` : `Nível ${level.id} • Missão ${missionIdx + 1} de ${level.missions.length}`}
              </p>
              <p className="text-base font-bold text-white">{levelDone ? "Avance para o próximo nível!" : mission.title}</p>
              {!levelDone && <p className="text-sm text-slate-400 font-mono mt-1">Dica: <span className="text-cyan-300">{mission.hint}</span></p>}
            </div>
            {levelDone && levelIdx + 1 < LEVELS.length && (
              <Button onClick={() => loadLevel(levelIdx + 1)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold">
                Próximo Nível →
              </Button>
            )}
          </div>
        </div>

        <div
          onClick={() => inputRef.current?.focus()}
          className="bg-slate-950 border border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col h-[400px] cursor-text shadow-[0_0_30px_-10px_rgba(6,182,212,0.4)] focus-within:border-cyan-400 focus-within:shadow-[0_0_40px_-10px_rgba(6,182,212,0.7)] transition-all"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-900/80">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-slate-500 font-mono flex-1">root@kali:~#</span>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 font-mono text-sm space-y-1">
            {lines.map((l, i) => (
              <pre key={i} className={`whitespace-pre-wrap break-words ${
                l.type === "in" ? "text-white font-bold" :
                l.type === "ok" ? "text-emerald-400" :
                l.type === "err" ? "text-red-400" :
                l.type === "info" ? "text-cyan-300" : "text-slate-400"
              }`}>{l.text}</pre>
            ))}
            <form onSubmit={onSubmit} className="flex items-center gap-2 pt-2">
              <span className="text-cyan-400 font-bold">$</span>
              <input ref={inputRef} value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false} autoComplete="off"
                className="flex-1 bg-transparent outline-none text-white caret-cyan-400" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
