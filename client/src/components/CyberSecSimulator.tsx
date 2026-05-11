import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Shield, ShieldAlert, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { onBack: () => void }
type Line = { type: "in" | "out" | "ok" | "err" | "info"; text: string };

interface Target {
  ip: string;
  name: string;
  status: "up" | "down";
  ports: { port: number; service: string; state: string; version?: string }[];
  vulns: string[];
  directories: string[];
  db?: { vulnerable: boolean; dumped: boolean };
  root?: boolean;
}

interface State {
  targets: Record<string, Target>;
  discoveredIPs: Set<string>;
  scannedIPs: Set<string>;
  flags: Set<string>;
  sshSession: string | null;
}

interface LevelDef {
  id: number;
  title: string;
  briefing: string;
  starter: () => State;
  missions: { id: string; title: string; hint: string; check: (s: State) => boolean }[];
}

const initialState = (): State => ({
  targets: {
    "10.0.0.5": {
      ip: "10.0.0.5", name: "corp-web", status: "up",
      ports: [
        { port: 22, service: "ssh", state: "open", version: "OpenSSH 8.2p1" },
        { port: 80, service: "http", state: "open", version: "Apache httpd 2.4.41" }
      ],
      vulns: ["sql_injection"],
      directories: ["/admin", "/login", "/uploads"],
      db: { vulnerable: true, dumped: false }
    },
    "10.0.0.10": {
      ip: "10.0.0.10", name: "internal-db", status: "up",
      ports: [
        { port: 5432, service: "postgresql", state: "open", version: "PostgreSQL 12.3" }
      ],
      vulns: ["weak_password"],
      directories: []
    }
  },
  discoveredIPs: new Set(["10.0.0.5"]),
  scannedIPs: new Set(),
  flags: new Set(),
  sshSession: null
});

const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: "Reconhecimento Ativo",
    briefing: "Sua primeira missão é mapear a superfície de ataque. Use 'nmap' para descobrir portas abertas e 'gobuster' para encontrar diretórios ocultos no servidor web.",
    starter: initialState,
    missions: [
      { id: "scan", title: "Faça um scan no servidor 10.0.0.5", hint: "nmap 10.0.0.5", check: s => s.scannedIPs.has("10.0.0.5") },
      { id: "dir", title: "Encontre diretórios ocultos via gobuster", hint: "gobuster dir -u http://10.0.0.5 -w common.txt", check: s => s.flags.has("gobuster_10.0.0.5") }
    ]
  },
  {
    id: 2,
    title: "Exploração Web (SQLi)",
    briefing: "O diretório /login foi encontrado. Parece vulnerável a SQL Injection. Use a ferramenta 'sqlmap' para extrair informações do banco de dados.",
    starter: () => {
      const s = initialState();
      s.scannedIPs.add("10.0.0.5");
      s.flags.add("gobuster_10.0.0.5");
      return s;
    },
    missions: [
      { id: "sqli", title: "Teste o parâmetro de login com sqlmap", hint: "sqlmap -u http://10.0.0.5/login --dbs", check: s => s.targets["10.0.0.5"].db?.dumped || false },
      { id: "creds", title: "Extraia credenciais e use SSH", hint: "ssh admin@10.0.0.5", check: s => s.sshSession === "10.0.0.5" }
    ]
  },
  {
    id: 3,
    title: "Escalonamento de Privilégios",
    briefing: "Você conseguiu acesso via SSH, mas é um usuário comum. Procure binários com SUID root ou configurações malfeitas no sudoers para obter acesso total (root).",
    starter: () => {
      const s = initialState();
      s.sshSession = "10.0.0.5";
      return s;
    },
    missions: [
      { id: "sudo", title: "Verifique privilégios sudo", hint: "sudo -l", check: s => s.flags.has("sudo_checked") },
      { id: "root", title: "Escale para root", hint: "sudo su", check: s => s.targets["10.0.0.5"].root || false }
    ]
  }
];

export function CyberSecSimulator({ onBack }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing">(() => localStorage.getItem("cyber_sim_intro") ? "playing" : "intro");
  const [introStep] = useState(0);
  const [levelIdx, setLevelIdx] = useState(0);
  const [state, setState] = useState<State>(() => LEVELS[0].starter());
  const [missionIdx, setMissionIdx] = useState(0);
  const [lines, setLines] = useState<Line[]>([
    { type: "info", text: "CyberSec Terminal v1.0. Digite 'help' para listar as ferramentas." },
    { type: "info", text: "⚠️ Aviso: Ambientes simulados. Para uso real ético, estude e certifique-se." }
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const level = LEVELS[levelIdx];
  const mission = level.missions[missionIdx];
  const levelDone = missionIdx >= level.missions.length;

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);
  useEffect(() => { if (phase === "playing") inputRef.current?.focus(); }, [levelIdx, phase]);

  useEffect(() => {
    if (levelDone || !mission) return;
    if (mission.check(state)) {
      setLines(l => [...l, { type: "ok", text: `[+] Missão concluída: ${mission.title}` }]);
      const next = missionIdx + 1;
      if (next >= level.missions.length) {
        setLines(l => [...l, { type: "ok", text: `=== NÍVEL ${level.id} CONCLUÍDO ===` }]);
      }
      setMissionIdx(next);
    }
  }, [state, levelDone, mission, level.id, level.missions.length, missionIdx]);

  const out = (t: string) => setLines(l => [...l, { type: "out", text: t }]);
  const err = (t: string) => setLines(l => [...l, { type: "err", text: t }]);

  const runShell = (cmd: string) => {
     if (cmd === "sudo -l") {
         out("User admin may run the following commands on corp-web:");
         out("    (ALL : ALL) NOPASSWD: ALL");
         setState(s => { const f = new Set(s.flags); f.add("sudo_checked"); return { ...s, flags: f }; });
     } else if (cmd === "sudo su" || cmd === "sudo -i" || cmd === "su") {
         out("root@corp-web:~#");
         setState(s => ({ ...s, targets: { ...s.targets, "10.0.0.5": { ...s.targets["10.0.0.5"], root: true } } }));
     } else if (cmd === "whoami") {
         out(state.targets["10.0.0.5"].root ? "root" : "admin");
     } else if (cmd === "exit") {
         out("logout");
         setState(s => ({ ...s, sshSession: null }));
     } else {
         err(`bash: ${cmd}: command not found`);
     }
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setLines(l => [...l, { type: "in", text: state.sshSession ? `${state.targets[state.sshSession].root ? 'root' : 'admin'}@${state.targets[state.sshSession].name}:~# ${cmd}` : `attacker@kali:~$ ${cmd}` }]);
    if (cmd !== history[history.length - 1]) setHistory(h => [...h, cmd]);
    setHistoryIdx(-1);

    if (cmd === "clear") { setLines([]); return; }
    if (cmd === "help") {
       out("Ferramentas disponíveis no arsenal:");
       out("  nmap <ip>                        Scan de portas e serviços");
       out("  gobuster dir -u <url> -w <list>  Descoberta de diretórios web");
       out("  sqlmap -u <url> --dbs            Exploração de Injeção SQL");
       out("  ssh <user>@<ip>                  Conexão remota segura");
       out("");
       out("Pós-exploração (via SSH):");
       out("  sudo -l, sudo su, whoami, exit");
       return;
    }

    if (state.sshSession) {
        runShell(cmd);
        return;
    }

    setState(s => {
      const next = { ...s, targets: { ...s.targets }, flags: new Set(s.flags), scannedIPs: new Set(s.scannedIPs) };
      
      if (cmd.startsWith("nmap ")) {
        const ip = cmd.split(" ")[1];
        if (s.targets[ip]) {
          out(`Starting Nmap 7.94`);
          out(`Nmap scan report for ${ip}`);
          out(`PORT     STATE SERVICE VERSION`);
          s.targets[ip].ports.forEach(p => {
             out(`${p.port.toString().padEnd(8)} ${p.state.padEnd(5)} ${p.service.padEnd(7)} ${p.version || ''}`);
          });
          next.scannedIPs.add(ip);
        } else {
          err("Host seems down.");
        }
      } else if (cmd.startsWith("gobuster ")) {
        const urlMatch = cmd.match(/-u\s+http:\/\/([^\s]+)/);
        if (urlMatch && s.targets[urlMatch[1]]) {
            const ip = urlMatch[1];
            out("Starting gobuster dir...");
            s.targets[ip].directories.forEach(d => out(`Found: ${d} (Status: 200)`));
            next.flags.add(`gobuster_${ip}`);
        } else {
            err("Error: URL target not provided or unreachable.");
        }
      } else if (cmd.startsWith("sqlmap ")) {
          const urlMatch = cmd.match(/-u\s+http:\/\/([^\s/]+)/);
          if (urlMatch && s.targets[urlMatch[1]]?.db?.vulnerable) {
              const ip = urlMatch[1];
              out("sqlmap resumed the following injection point(s) from stored session:");
              out("Parameter: login (POST)");
              out("    Type: time-based blind");
              out("[*] fetching database names");
              out("available databases [2]:\n[*] information_schema\n[*] corp_db");
              out("[*] fetching tables for database: 'corp_db'");
              out("Table: users\n[1 entry]\n+----+-------+----------+\n| id | user  | password |\n+----+-------+----------+\n| 1  | admin | super123 |\n+----+-------+----------+");
              next.targets[ip].db = { ...next.targets[ip].db!, dumped: true };
          } else {
              err("CRITICAL: all tested parameters do not appear to be injectable.");
          }
      } else if (cmd.startsWith("ssh ")) {
          const match = cmd.match(/ssh\s+([^@]+)@(.+)/);
          if (match) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const [_, user, ip] = match;
              if (s.targets[ip] && user === "admin") { // Simulating knowing the password from sqlmap
                  out(`${user}@${ip}'s password: `);
                  out(`Welcome to Ubuntu 20.04 LTS`);
                  next.sshSession = ip;
              } else {
                  err("Permission denied (publickey,password).");
              }
          }
      } else {
          err(`bash: ${cmd}: command not found`);
      }
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const i = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(i); setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const i = historyIdx + 1;
      if (i >= history.length) { setHistoryIdx(-1); setInput(""); }
      else { setHistoryIdx(i); setInput(history[i]); }
    }
  };

  if (phase === "intro") {
    const steps = [
      {
        title: "CyberSec Simulator",
        content: (
          <div className="text-center pt-6">
            <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-5">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3">CyberSec Simulator</h1>
            <p className="text-rose-400 font-mono text-xs uppercase tracking-[0.3em] mb-6">Ataque. Defenda. Domine.</p>
            <p className="text-slate-400">Aprenda segurança da informação na prática usando ferramentas reais como nmap, gobuster e sqlmap em um ambiente seguro e controlado.</p>
          </div>
        )
      }
    ];

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-purple-600"></div>
             {steps[introStep].content}
             <div className="mt-8 flex justify-between items-center">
                <Button variant="ghost" onClick={onBack}>Sair</Button>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { localStorage.setItem("cyber_sim_intro", "true"); setPhase("playing"); }}>Iniciar Simulação</Button>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft /></Button>
             <h2 className="text-xl font-black uppercase text-rose-400 flex items-center gap-2"><Shield /> Operações Ofensivas</h2>
           </div>
           <div className="flex gap-2">
             {LEVELS.map(l => (
                <button key={l.id} onClick={() => { setLevelIdx(l.id - 1); setMissionIdx(0); setState(l.starter()); setLines([{type:'info',text:l.briefing}]); }} className={`w-8 h-8 rounded-full font-bold flex items-center justify-center transition-colors ${levelIdx === l.id - 1 ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{l.id}</button>
             ))}
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col h-[600px] font-mono text-sm">
            <div className="flex-1 overflow-y-auto space-y-1 mb-4" ref={scrollRef}>
              {lines.map((l, i) => (
                <div key={i} className={`${l.type === 'err' ? 'text-red-400' : l.type === 'ok' ? 'text-emerald-400' : l.type === 'info' ? 'text-sky-400' : 'text-slate-300'}`}>
                  {l.text}
                </div>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); run(input); setInput(""); }} className="flex items-center border-t border-slate-800 pt-4">
              <span className="text-rose-400 mr-2 whitespace-nowrap">{state.sshSession ? `${state.targets[state.sshSession].root ? 'root' : 'admin'}@${state.targets[state.sshSession].name}:~#` : `attacker@kali:~$`}</span>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} ref={inputRef} className="flex-1 bg-transparent border-none outline-none text-slate-100" spellCheck={false} autoFocus />
            </form>
          </div>

          <div className="space-y-6">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Missão Atual</h3>
                {mission ? (
                   <div>
                     <p className="font-bold text-white mb-2">{mission.title}</p>
                     <p className="text-xs text-slate-400 mb-4 bg-slate-800 p-2 rounded">Dica: {mission.hint}</p>
                   </div>
                ) : (
                   <p className="text-emerald-400 font-bold flex items-center gap-2"><Unlock className="w-4 h-4"/> Nível Concluído!</p>
                )}
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Alvos Conhecidos</h3>
                <div className="space-y-3">
                   {Array.from(state.discoveredIPs).map(ip => {
                       const t = state.targets[ip];
                       return (
                           <div key={ip} className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                               <div className="flex justify-between items-center mb-2">
                                  <span className="font-bold text-sky-400">{ip}</span>
                                  <span className="text-[10px] uppercase bg-slate-950 px-2 py-0.5 rounded text-slate-400">{t.name}</span>
                               </div>
                               {state.scannedIPs.has(ip) ? (
                                   <div className="text-xs text-slate-300">
                                      {t.ports.map(p => <div key={p.port}>Port {p.port}: {p.service}</div>)}
                                   </div>
                               ) : <div className="text-xs text-slate-500 italic">Desconhecido (Use nmap)</div>}
                           </div>
                       )
                   })}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
