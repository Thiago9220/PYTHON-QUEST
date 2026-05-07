import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft, Wifi, ChevronDown, Lock, Trophy, Globe, Server, Shield, Lightbulb, BookOpen, Radio,
  Router, Laptop, ShieldAlert, FileSearch, Flag, X, Zap, Network as NetworkIcon, Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onBack: () => void }

type Line = { type: "in" | "out" | "ok" | "err" | "info"; text: string };

interface PortInfo {
  port: number;
  state: "open" | "closed" | "filtered";
  service: string;
  version?: string;
  banner?: string;
  cves?: string[];
}

interface HttpResponse {
  status: number;
  headers?: Record<string, string>;
  body: string;
  authRequired?: { user: string; pass: string };
  flag?: string;
}

interface Host {
  ip: string;
  hostname?: string;
  os: string;
  vendor?: string;
  status: "up" | "down";
  ports: PortInfo[];
  whois?: string;
  webContent?: string;
  webPaths?: Record<string, HttpResponse>;
  sshBanner?: string;
  flag?: string;
  defaultCreds?: { user: string; pass: string };
  exploit?: { vector: "vsftpd234" | "eternalblue" | "boa-traversal"; port: number; rootFlag?: string; loot?: string[] };
  postExLoot?: string[];
}


interface NetState {
  myIp: string;
  gateway: string;
  subnet: string;
  hosts: Record<string, Host>;
  discovered: Set<string>;       // IPs the user has "found"
  scanned: Set<string>;          // IPs the user has fully nmap'd
  dnsCache: Record<string, string>;
  dnsTxt: Record<string, string[]>;
  flags: Set<string>;            // captured CTF flags
  // ephemeral packet flight for animation
  packets: { id: number; from: string; to: string; type: "icmp" | "tcp" | "dns"; t: number }[];
  // mission flags
  _ifconfigViewed?: boolean;
  _arpViewed?: boolean;
  _tracerouteViewed?: boolean;
  _whoisViewed?: boolean;
  _digViewed?: boolean;
  _netstatViewed?: boolean;
  _tcpdumpViewed?: boolean;
}

interface LevelDef {
  id: number;
  title: string;
  briefing: string;
  starter: () => NetState;
  missions: { id: string; title: string; hint: string; check: (s: NetState) => boolean }[];
}

const initialNet = (): NetState => ({
  myIp: "192.168.1.42",
  gateway: "192.168.1.1",
  subnet: "192.168.1.0/24",
  hosts: {
    "192.168.1.1":   { ip: "192.168.1.1",   hostname: "router.local",      os: "RouterOS", vendor: "MikroTik", status: "up",
      ports: [
        { port: 22,  state: "open",   service: "ssh",  version: "OpenSSH 7.4", banner: "SSH-2.0-OpenSSH_7.4",
          cves: ["CVE-2018-15473 (user enumeration)"] },
        { port: 80,  state: "open",   service: "http", version: "MikroTik HTTP", banner: "HTTP/1.1 200 OK\nServer: MikroTik\n" },
        { port: 53,  state: "open",   service: "dns" },
      ]
    },
    "192.168.1.50":  { ip: "192.168.1.50",  hostname: "web.corp.local",    os: "Linux 5.15", status: "up",
      ports: [
        { port: 22,  state: "open",   service: "ssh",   version: "OpenSSH 8.9p1 Ubuntu", banner: "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1" },
        { port: 80,  state: "open",   service: "http",  version: "nginx 1.18.0",
          banner: "HTTP/1.1 200 OK\nServer: nginx/1.18.0 (Ubuntu)\nContent-Type: text/html\n\n<!DOCTYPE html><html><body><h1>CorpHQ Internal Portal</h1><p>Authorized personnel only</p><!-- TODO: remove this — admin panel at /admin --></body></html>" },
        { port: 443, state: "open",   service: "https", version: "nginx 1.18.0" },
        { port: 3306, state: "filtered", service: "mysql" },
      ],
      webContent: "<!DOCTYPE html>\n<html><body>\n<h1>CorpHQ Internal Portal</h1>\n<p>Authorized personnel only</p>\n<!-- TODO: remove this — admin panel at /admin -->\n</body></html>",
      webPaths: {
        "/": { status: 200, headers: { "Server": "nginx/1.18.0", "Content-Type": "text/html" },
          body: "<!DOCTYPE html>\n<html><body>\n<h1>CorpHQ Internal Portal</h1>\n<p>Authorized personnel only</p>\n<!-- TODO: remove this — admin panel at /admin -->\n</body></html>" },
        "/admin": { status: 200, headers: { "Server": "nginx/1.18.0", "Content-Type": "text/html", "X-Powered-By": "Internal-CMS/2.1" },
          body: "<!DOCTYPE html>\n<html><body>\n<h1>Admin Panel — CorpHQ</h1>\n<form><input name=user><input name=pass type=password><button>Login</button></form>\n<!-- DEBUG token vazado em produção: CTF{admin_panel_index_was_public} -->\n</body></html>",
          flag: "CTF{admin_panel_index_was_public}" },
        "/.git/config": { status: 200, headers: { "Server": "nginx/1.18.0", "Content-Type": "text/plain" },
          body: "[core]\n  repositoryformatversion = 0\n[remote \"origin\"]\n  url = git@github.com:corphq/portal.git\n[branch \"main\"]\n  merge = refs/heads/main\n",
          flag: "CTF{dotgit_exposed_on_webroot}" },
        "/api/health": { status: 200, headers: { "Content-Type": "application/json" },
          body: "{\"status\":\"ok\",\"version\":\"2.1.4\",\"db\":\"192.168.1.77:5432\"}" },
        "/robots.txt": { status: 200, headers: { "Content-Type": "text/plain" },
          body: "User-agent: *\nDisallow: /admin\nDisallow: /.git\nDisallow: /backup\n" },
      },
    },
    "192.168.1.77":  { ip: "192.168.1.77",  hostname: "db.corp.local",     os: "Linux 5.15", status: "up",
      ports: [
        { port: 22,   state: "open", service: "ssh", version: "OpenSSH 8.9p1" },
        { port: 5432, state: "open", service: "postgresql", version: "PostgreSQL 16.1", banner: "PostgreSQL 16.1 — needs auth" },
      ],
    },
    "192.168.1.100": { ip: "192.168.1.100", hostname: "ftp-legacy.corp.local", os: "Windows Server 2008", status: "up",
      ports: [
        { port: 21,  state: "open", service: "ftp",     version: "vsftpd 2.3.4", banner: "220 vsftpd 2.3.4 (vulneravel - CVE-2011-2523)",
          cves: ["CVE-2011-2523 (vsftpd backdoor)"] },
        { port: 139, state: "open", service: "netbios" },
        { port: 445, state: "open", service: "smb",     version: "Samba 3.6 (vulnerável a EternalBlue)",
          cves: ["CVE-2017-0144 (EternalBlue/MS17-010)", "CVE-2017-7494 (SambaCry)"] },
        { port: 3389, state: "filtered", service: "rdp" },
      ],
      flag: "CTF{ftp_anonymous_was_enabled}",
    },
    "192.168.1.150": { ip: "192.168.1.150", hostname: "iot-cam.corp.local", os: "Embedded Linux", status: "up",
      ports: [
        { port: 80, state: "open", service: "http", version: "Boa/0.94.14", banner: "HTTP/1.1 200 OK\nServer: Boa/0.94.14rc21\n",
          cves: ["CVE-2017-9833 (Boa path traversal)", "CVE-2021-33558 (Boa info disclosure)"] },
        { port: 554, state: "open", service: "rtsp", version: "RTSP/1.0" },
      ],
      defaultCreds: { user: "admin", pass: "admin" },
      webPaths: {
        "/": { status: 401, headers: { "Server": "Boa/0.94.14rc21", "WWW-Authenticate": "Basic realm=\"IPCam\"" },
          body: "401 Unauthorized — autenticação necessária",
          authRequired: { user: "admin", pass: "admin" } },
        "/cgi-bin/snapshot": { status: 200, headers: { "Server": "Boa/0.94.14rc21", "Content-Type": "image/jpeg", "X-Flag": "CTF{iot_default_admin_admin}" },
          body: "[binary jpeg snapshot — 38 KB] (header X-Flag vazou a flag)",
          flag: "CTF{iot_default_admin_admin}",
          authRequired: { user: "admin", pass: "admin" } },
      },
    },
    "8.8.8.8":       { ip: "8.8.8.8",       hostname: "dns.google",         os: "Unknown", status: "up", ports: [{ port: 53, state: "open", service: "dns" }] },
  },
  discovered: new Set(["192.168.1.42", "192.168.1.1"]),
  scanned: new Set(),
  dnsCache: {
    "router.local": "192.168.1.1",
    "web.corp.local": "192.168.1.50",
    "db.corp.local": "192.168.1.77",
    "ftp-legacy.corp.local": "192.168.1.100",
    "iot-cam.corp.local": "192.168.1.150",
    "google.com": "142.250.78.78",
    "dns.google": "8.8.8.8",
    "corp.local": "192.168.1.50",
  },
  dnsTxt: {
    "corp.local": [
      "v=spf1 include:_spf.corp.local -all",
      "corphq-site-verify=8f3a91",
      "ctf-flag=CTF{dns_txt_records_leak_secrets}",
    ],
    "web.corp.local": ["deploy=blue-green", "owner=devops@corp.local"],
    "_dmarc.corp.local": ["v=DMARC1; p=quarantine; rua=mailto:dmarc@corp.local"],
  },
  flags: new Set(),
  packets: [],
});

const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: "Reconhecimento Local",
    briefing: "Antes de mapear a rede, descubra o terreno em que VOCÊ está: seu próprio IP, o gateway que conecta sua máquina ao resto e os vizinhos diretos no segmento de rede.",
    starter: initialNet,
    missions: [
      { id: "ifconfig", title: "Descubra seu IP local", hint: "ifconfig (ou: ip a)", check: (s) => !!s._ifconfigViewed },
      { id: "ping-gw", title: "Verifique se o gateway responde", hint: "ping 192.168.1.1", check: (s) => s.discovered.has("192.168.1.1") },
      { id: "arp", title: "Liste os vizinhos diretos no link", hint: "arp -a", check: (s) => !!s._arpViewed },
      { id: "trace", title: "Rastreie o caminho até a internet", hint: "traceroute 8.8.8.8", check: (s) => !!s._tracerouteViewed && s.discovered.has("8.8.8.8") },
    ],
  },
  {
    id: 2,
    title: "DNS — Traduzindo Nomes",
    briefing: "Humanos lembram nomes (corp.local), máquinas falam IPs (192.168.1.50). O DNS é a 'agenda telefônica' que faz a tradução. Use nslookup, dig e whois pra extrair informação.",
    starter: initialNet,
    missions: [
      { id: "nslookup", title: "Resolva 'web.corp.local' para um IP", hint: "nslookup web.corp.local", check: (s) => s.discovered.has("192.168.1.50") },
      { id: "dig", title: "Busque informações detalhadas com dig", hint: "dig web.corp.local", check: (s) => !!s._digViewed },
      { id: "whois", title: "Inspecione o domínio com whois", hint: "whois corp.local", check: (s) => !!s._whoisViewed },
    ],
  },
  {
    id: 3,
    title: "Mapeamento de Portas",
    briefing: "Cada IP tem 65535 'portas' por onde serviços conversam. Web na 80, SSH na 22, banco na 5432. Use nmap pra varrer essas portas e descobrir o que está exposto.",
    starter: initialNet,
    missions: [
      { id: "discover", title: "Descubra todos os hosts ativos da subrede", hint: "nmap -sn 192.168.1.0/24", check: (s) => s.discovered.has("192.168.1.50") && s.discovered.has("192.168.1.77") && s.discovered.has("192.168.1.100") && s.discovered.has("192.168.1.150") },
      { id: "scan", title: "Varra as portas do servidor web", hint: "nmap 192.168.1.50", check: (s) => s.scanned.has("192.168.1.50") },
      { id: "version", title: "Detecte as versões dos serviços (importante pra achar vulnerabilidades)", hint: "nmap -sV 192.168.1.100", check: (s) => s.scanned.has("192.168.1.100") },
    ],
  },
  {
    id: 4,
    title: "Interagindo com Serviços",
    briefing: "Achou portas abertas? Hora de conversar com elas. curl fala HTTP, nc (netcat) faz banner grabbing, ssh tenta conectar. Cada protocolo tem sua linguagem.",
    starter: initialNet,
    missions: [
      { id: "curl", title: "Faça GET no servidor web (portal interno)", hint: "curl http://192.168.1.50", check: (s) => s.flags.has("portal-fetched") },
      { id: "banner", title: "Capture o banner SSH para ver a versão exata", hint: "nc 192.168.1.50 22 (banner grabbing)", check: (s) => s.flags.has("ssh-banner") },
      { id: "ftp", title: "Conecte na porta FTP do host vulnerável e ache a flag", hint: "nc 192.168.1.100 21", check: (s) => s.flags.has("CTF{ftp_anonymous_was_enabled}") },
    ],
  },
  {
    id: 5,
    title: "Forense & Tráfego",
    briefing: "A última fase: monitorar o tráfego. netstat mostra suas conexões, tcpdump captura pacotes em tempo real. Saber observar a rede é metade da segurança.",
    starter: initialNet,
    missions: [
      { id: "netstat", title: "Liste suas conexões/portas locais em escuta", hint: "netstat -tuln", check: (s) => !!s._netstatViewed },
      { id: "tcpdump", title: "Capture os pacotes que passam pela interface", hint: "tcpdump -i eth0", check: (s) => !!s._tcpdumpViewed },
      { id: "summary", title: "Investigação concluída — rode 'report'", hint: "report", check: (s) => s.flags.has("investigation-done") },
    ],
  },
];

export function NetworkSimulator({ onBack }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing">(() => {
    return localStorage.getItem("network_sim_intro_seen") ? "playing" : "intro";
  });
  const [introStep, setIntroStep] = useState(0);
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set([0]));
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [state, setState] = useState<NetState>(() => initialNet());
  const [missionIdx, setMissionIdx] = useState(0);
  const [lines, setLines] = useState<Line[]>([
    { type: "info", text: "NetSim v2.0 inicializado. Digite 'help' para comandos." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const packetIdRef = useRef(0);

  const level = LEVELS[levelIdx];
  const mission = level.missions[missionIdx];
  const levelDone = missionIdx >= level.missions.length;

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);
  useEffect(() => { if (phase === "playing") inputRef.current?.focus({ preventScroll: true }); }, [levelIdx, phase]);

  // mission auto-advance
  useEffect(() => {
    if (levelDone || !mission) return;
    if (mission.check(state)) {
      setLines((l) => [...l, { type: "ok", text: `[+] Missão concluída: ${mission.title}` }]);
      const next = missionIdx + 1;
      if (next >= level.missions.length) {
        setLines((l) => [...l, { type: "ok", text: `=== NÍVEL ${level.id} CONCLUÍDO: ${level.title} ===` }]);
        setCompleted((s) => new Set(s).add(levelIdx));
        if (levelIdx + 1 < LEVELS.length) setUnlocked((s) => new Set(s).add(levelIdx + 1));
      }
      setMissionIdx(next);
    }
  }, [state]);

  // packet expiration
  useEffect(() => {
    if (!state.packets.length) return;
    const t = setTimeout(() => {
      setState((s) => ({ ...s, packets: s.packets.filter((p) => Date.now() - p.t < 1500) }));
    }, 1600);
    return () => clearTimeout(t);
  }, [state.packets]);

  const launchPacket = (from: string, to: string, type: "icmp" | "tcp" | "dns") => {
    const id = ++packetIdRef.current;
    setState((s) => ({ ...s, packets: [...s.packets, { id, from, to, type, t: Date.now() }] }));
  };

  const out = (text: string) => setLines((l) => [...l, { type: "out", text }]);
  const err = (text: string) => setLines((l) => [...l, { type: "err", text }]);
  const ok = (text: string) => setLines((l) => [...l, { type: "ok", text }]);
  const info = (text: string) => setLines((l) => [...l, { type: "info", text }]);

  const loadLevel = (idx: number) => {
    setLevelIdx(idx);
    setState(LEVELS[idx].starter());
    setMissionIdx(0);
    setLines([
      { type: "info", text: `=== NÍVEL ${LEVELS[idx].id}: ${LEVELS[idx].title} ===` },
      { type: "info", text: LEVELS[idx].briefing },
    ]);
    setSelectedHost(null);
  };
  const resetLevel = () => loadLevel(levelIdx);

  const resolve = (s: NetState, target: string): string | null => {
    if (/^\d+\.\d+\.\d+\.\d+$/.test(target)) return target;
    return s.dnsCache[target] ?? null;
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { type: "in", text: `$ ${cmd}` }]);
    if (!cmd) return;
    if (cmd !== history[history.length - 1]) setHistory((h) => [...h, cmd]);
    setHistoryIdx(-1);

    if (cmd === "clear") { setLines([]); return; }
    if (cmd === "reset") { resetLevel(); return; }
    if (cmd === "help") {
      out("Comandos suportados:");
      out("  ifconfig | ip a               sua interface de rede");
      out("  ping <ip|host>                envia ICMP pra testar host");
      out("  traceroute <host>             rastreia caminho até host");
      out("  arp -a                        vizinhos no segmento (cache ARP)");
      out("  nslookup <host>               resolve nome em IP");
      out("  dig [TXT|MX|+short] <host>    consulta DNS detalhada");
      out("  dig -x <ip>                   reverse DNS (PTR)");
      out("  whois <domain>                informação de registro do domínio");
      out("  nmap [-sn|-sV|-A] <ip|cidr>   varredura de portas");
      out("  nmap -p <portas> <ip>         portas específicas");
      out("  searchsploit <termo|ip>       busca CVEs/exploits conhecidos");
      out("  curl [-u user:pass] [-I] <url>  requisição HTTP (suporta paths e basic auth)");
      out("  nc <ip> <port>                netcat — banner grabbing / conexão raw");
      out("  ssh <user@ip>                 tenta sessão SSH");
      out("  netstat -tuln                 portas em escuta no seu host");
      out("  tcpdump [-i eth0]             captura pacotes");
      out("  report                        gera relatório final da investigação");
      out("  clear | reset | help");
      out("Atalhos: ↑/↓ histórico • Tab autocomplete • clique nos hosts do mapa pra detalhes");
      return;
    }

    const args = cmd.split(/\s+/).filter(Boolean);
    const c = args[0];

    setState((s) => {
      const next = { ...s, hosts: { ...s.hosts }, discovered: new Set(s.discovered), scanned: new Set(s.scanned), flags: new Set(s.flags) };

      // ifconfig / ip a
      if (c === "ifconfig" || (c === "ip" && args[1] === "a")) {
        out(`eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500`);
        out(`        inet ${s.myIp}  netmask 255.255.255.0  broadcast 192.168.1.255`);
        out(`        ether 5c:f9:dd:1a:2b:3c  txqueuelen 1000  (Ethernet)`);
        out(`        RX packets 18234  bytes 21340712`);
        out(`        TX packets 12891  bytes 4523891`);
        out(``);
        out(`lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536`);
        out(`        inet 127.0.0.1  netmask 255.0.0.0`);
        return { ...next, _ifconfigViewed: true };
      }

      // ping
      if (c === "ping") {
        const target = args[1];
        if (!target) { err("Uso: ping <ip|host>"); return s; }
        const ip = resolve(s, target);
        if (!ip) { err(`ping: ${target}: Name or service not known`); return s; }
        const host = s.hosts[ip];
        if (!host || host.status === "down") { err(`From ${s.myIp} icmp_seq=1 Destination Host Unreachable`); return s; }
        launchPacket(s.myIp, ip, "icmp");
        out(`PING ${target} (${ip}) 56(84) bytes of data.`);
        for (let i = 1; i <= 3; i++) out(`64 bytes from ${ip}: icmp_seq=${i} ttl=${ip === "8.8.8.8" ? 117 : 64} time=${(Math.random() * 20 + 0.3).toFixed(1)} ms`);
        out(``);
        out(`--- ${target} ping statistics ---`);
        out(`3 packets transmitted, 3 received, 0% packet loss, time 2003ms`);
        next.discovered.add(ip);
        return next;
      }

      // traceroute
      if (c === "traceroute" || c === "tracert") {
        const target = args[1];
        if (!target) { err("Uso: traceroute <host>"); return s; }
        const ip = resolve(s, target);
        if (!ip) { err(`traceroute: unknown host ${target}`); return s; }
        out(`traceroute to ${target} (${ip}), 30 hops max, 60 byte packets`);
        out(` 1  router.local (192.168.1.1)  1.234 ms  1.012 ms  0.987 ms`);
        if (ip !== "192.168.1.1") {
          out(` 2  10.50.1.1 (10.50.1.1)  4.231 ms  4.012 ms  3.987 ms`);
          out(` 3  isp-gateway.net (200.130.1.1)  12.412 ms  11.987 ms  12.001 ms`);
          out(` 4  * * *`);
          out(` 5  ${target} (${ip})  ${(Math.random() * 30 + 10).toFixed(2)} ms`);
        }
        next.discovered.add(ip);
        next.discovered.add("192.168.1.1");
        launchPacket(s.myIp, ip, "icmp");
        return { ...next, _tracerouteViewed: true };
      }

      // arp -a
      if (c === "arp" && args[1] === "-a") {
        out(`? (192.168.1.1) at b8:27:eb:11:22:33 [ether] on eth0`);
        Array.from(s.discovered).filter((ip) => ip !== s.myIp && ip.startsWith("192.168.1.")).forEach((ip) => {
          const h = s.hosts[ip];
          out(`${h?.hostname ? h.hostname : "?"} (${ip}) at ${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)} [ether] on eth0`);
        });
        return { ...next, _arpViewed: true };
      }

      // nslookup
      if (c === "nslookup") {
        const target = args[1];
        if (!target) { err("Uso: nslookup <host>"); return s; }
        const ip = resolve(s, target);
        launchPacket(s.myIp, "192.168.1.1", "dns");
        out(`Server:\t\t192.168.1.1`);
        out(`Address:\t192.168.1.1#53`);
        out(``);
        if (ip) {
          out(`Non-authoritative answer:`);
          out(`Name:\t${target}`);
          out(`Address: ${ip}`);
          next.discovered.add(ip);
        } else { err(`** server can't find ${target}: NXDOMAIN`); }
        return next;
      }

      // dig  (supports: TXT, MX, A, -x reverso, +short)
      if (c === "dig") {
        const dArgs = args.slice(1);
        const isReverse = dArgs.includes("-x");
        const isShort = dArgs.includes("+short");
        const reverseIp = isReverse ? dArgs[dArgs.indexOf("-x") + 1] : null;
        const recordType = (dArgs.find((a) => /^(A|TXT|MX|NS|AAAA|ANY)$/.test(a)) ?? "A").toUpperCase();
        const target = reverseIp ?? dArgs.find((a) => !a.startsWith("-") && !a.startsWith("+") && !/^(A|TXT|MX|NS|AAAA|ANY)$/i.test(a)) ?? "";
        if (!target) { err("Uso: dig [TXT|MX|NS] <host>  |  dig -x <ip>  |  dig +short <host>"); return s; }
        launchPacket(s.myIp, "192.168.1.1", "dns");

        if (isReverse) {
          const reverseHost = Object.entries(s.dnsCache).find(([, v]) => v === reverseIp)?.[0];
          if (isShort) { reverseHost ? out(`${reverseHost}.`) : out(``); return { ...next, _digViewed: true }; }
          out(`; <<>> DiG 9.18.1 <<>> -x ${reverseIp}`);
          out(`;; ->>HEADER<<- opcode: QUERY, status: ${reverseHost ? "NOERROR" : "NXDOMAIN"}, id: ${Math.floor(Math.random() * 65535)}`);
          out(``);
          if (reverseHost) {
            const octets = reverseIp!.split(".").reverse().join(".");
            out(`;; ANSWER SECTION:`);
            out(`${octets}.in-addr.arpa.\t300\tIN\tPTR\t${reverseHost}.`);
          }
          return { ...next, _digViewed: true };
        }

        if (recordType === "TXT") {
          const txt = s.dnsTxt?.[target];
          if (isShort) { (txt ?? []).forEach((r) => out(`"${r}"`)); return { ...next, _digViewed: true }; }
          out(`; <<>> DiG 9.18.1 <<>> TXT ${target}`);
          out(`;; ->>HEADER<<- opcode: QUERY, status: ${txt ? "NOERROR" : "NXDOMAIN"}, id: ${Math.floor(Math.random() * 65535)}`);
          out(``);
          out(`;; QUESTION SECTION:`);
          out(`;${target}.\t\t\tIN\tTXT`);
          out(``);
          if (txt && txt.length) {
            out(`;; ANSWER SECTION:`);
            txt.forEach((r) => {
              out(`${target}.\t\t300\tIN\tTXT\t"${r}"`);
              const m = r.match(/CTF\{[^}]+\}/);
              if (m) next.flags.add(m[0]);
            });
          }
          return { ...next, _digViewed: true };
        }

        if (recordType === "MX") {
          out(`; <<>> DiG 9.18.1 <<>> MX ${target}`);
          out(``);
          out(`;; ANSWER SECTION:`);
          out(`${target}.\t\t300\tIN\tMX\t10 mail.${target}.`);
          return { ...next, _digViewed: true };
        }

        const ip = resolve(s, target);
        if (isShort) { ip ? out(ip) : out(``); return { ...next, _digViewed: true }; }
        out(`; <<>> DiG 9.18.1 <<>> ${target}`);
        out(`;; global options: +cmd`);
        out(`;; Got answer:`);
        out(`;; ->>HEADER<<- opcode: QUERY, status: ${ip ? "NOERROR" : "NXDOMAIN"}, id: ${Math.floor(Math.random() * 65535)}`);
        out(`;; flags: qr rd ra; QUERY: 1, ANSWER: ${ip ? 1 : 0}, AUTHORITY: 0, ADDITIONAL: 1`);
        out(``);
        out(`;; QUESTION SECTION:`);
        out(`;${target}.\t\t\tIN\tA`);
        out(``);
        if (ip) {
          out(`;; ANSWER SECTION:`);
          out(`${target}.\t\t300\tIN\tA\t${ip}`);
          out(``);
          out(`;; Query time: 4 msec`);
          out(`;; SERVER: 192.168.1.1#53`);
          out(`;; WHEN: ${new Date().toUTCString()}`);
          next.discovered.add(ip);
        }
        return { ...next, _digViewed: true };
      }

      // whois
      if (c === "whois") {
        const target = args[1];
        if (!target) { err("Uso: whois <domain>"); return s; }
        out(`Domain Name: ${target.toUpperCase()}`);
        out(`Registrar: CorpHQ Internal Registry (interno)`);
        out(`Updated Date: 2024-08-12T14:32:11Z`);
        out(`Creation Date: 2018-03-15T09:21:54Z`);
        out(`Registrant Organization: CorpHQ Ltda`);
        out(`Registrant Country: BR`);
        out(`Name Server: NS1.CORP.LOCAL`);
        out(`Name Server: NS2.CORP.LOCAL`);
        out(`DNSSEC: unsigned`);
        return { ...next, _whoisViewed: true };
      }

      // nmap
      if (c === "nmap") {
        const flags = args.slice(1).filter((a) => a.startsWith("-"));
        const targets = args.slice(1).filter((a) => !a.startsWith("-") && (a !== flags.find((f) => f.startsWith("-p")) ? true : false));
        const isHostDiscovery = flags.includes("-sn");
        const isVersion = flags.includes("-sV") || flags.includes("-A");
        const portFlag = args.find((a) => a.startsWith("-p"));
        let portFilter: number[] | null = null;
        if (portFlag) {
          const portStr = portFlag === "-p" ? args[args.indexOf("-p") + 1] : portFlag.slice(2);
          if (portStr) portFilter = portStr.split(",").map((x) => Number(x.trim())).filter((n) => !isNaN(n));
        }
        const cidr = targets.find((t) => t.includes("/"));
        const singleIp = targets.find((t) => /^\d+\.\d+\.\d+\.\d+$/.test(t));

        out(`Starting Nmap 7.94 ( https://nmap.org )`);

        if (cidr === "192.168.1.0/24" || isHostDiscovery) {
          // host discovery — descobre tudo da subrede
          out(`Nmap scan report for ${s.subnet}`);
          const subnetHosts = Object.values(s.hosts).filter((h) => h.ip.startsWith("192.168.1."));
          subnetHosts.forEach((h) => {
            launchPacket(s.myIp, h.ip, "icmp");
            out(`Nmap scan report for ${h.hostname ?? h.ip} (${h.ip})`);
            out(`Host is up (${(Math.random() * 0.05).toFixed(4)}s latency).`);
            next.discovered.add(h.ip);
          });
          out(`Nmap done: 256 IP addresses (${subnetHosts.length} hosts up) scanned in 2.34 seconds`);
          return next;
        }

        if (singleIp) {
          const h = s.hosts[singleIp];
          if (!h) { err(`Note: Host seems down.`); return s; }
          launchPacket(s.myIp, h.ip, "tcp");
          out(`Nmap scan report for ${h.hostname ?? h.ip} (${h.ip})`);
          out(`Host is up (${(Math.random() * 0.05).toFixed(4)}s latency).`);
          const portsToShow = portFilter ? h.ports.filter((p) => portFilter!.includes(p.port)) : h.ports.filter((p) => p.state !== "closed");
          if (!portsToShow.length) {
            out(`All scanned ports are closed`);
          } else {
            out(`Not shown: ${65535 - h.ports.length} closed ports`);
            out(`PORT     STATE     SERVICE      ${isVersion ? "VERSION" : ""}`);
            portsToShow.forEach((p) => {
              const portStr = `${p.port}/tcp`.padEnd(9);
              const state = p.state.padEnd(10);
              const service = p.service.padEnd(13);
              out(`${portStr}${state}${service}${isVersion ? p.version ?? "" : ""}`);
            });
          }
          if (isVersion) out(`Service detection performed.`);
          out(`MAC Address: ${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)} (${h.vendor ?? "Unknown"})`);
          if (h.os && isVersion) out(`OS guess: ${h.os}`);
          out(`Nmap done: 1 IP address (1 host up) scanned in ${(Math.random() * 5 + 1).toFixed(2)} seconds`);
          next.discovered.add(h.ip);
          if (isVersion || (!portFilter && !isHostDiscovery)) next.scanned.add(h.ip);
          return next;
        }

        err("nmap: alvo inválido. Use IP ou CIDR (ex: 192.168.1.0/24).");
        return s;
      }

      // curl  (supports: -u user:pass, paths, -I head)
      if (c === "curl") {
        const cArgs = args.slice(1);
        let userPass: { user: string; pass: string } | null = null;
        let headOnly = false;
        let urlArg: string | null = null;
        for (let i = 0; i < cArgs.length; i++) {
          const a = cArgs[i];
          if (a === "-u" && cArgs[i + 1]) {
            const [u, p] = cArgs[++i].split(":");
            userPass = { user: u ?? "", pass: p ?? "" };
          } else if (a === "-I" || a === "--head") {
            headOnly = true;
          } else if (!a.startsWith("-")) {
            urlArg = a;
          }
        }
        if (!urlArg) { err("Uso: curl [-u user:pass] [-I] <url>"); return s; }
        const m = urlArg.match(/^https?:\/\/([^\/:]+)(?::(\d+))?(\/[^\s]*)?/);
        if (!m) { err(`curl: (3) URL malformada`); return s; }
        const hostRef = m[1];
        const port = m[2] ? Number(m[2]) : 80;
        const path = m[3] ?? "/";
        const ip = resolve(s, hostRef);
        if (!ip) { err(`curl: (6) Could not resolve host: ${hostRef}`); return s; }
        const h = s.hosts[ip];
        if (!h) { err(`curl: (7) Failed to connect to ${hostRef} port ${port}: No route`); return s; }
        const portInfo = h.ports.find((p) => p.port === port);
        if (!portInfo || portInfo.state !== "open") { err(`curl: (7) Failed to connect to ${hostRef} port ${port}: Connection refused`); return s; }
        launchPacket(s.myIp, ip, "tcp");

        const resp = h.webPaths?.[path];
        if (resp) {
          if (resp.authRequired && (!userPass || userPass.user !== resp.authRequired.user || userPass.pass !== resp.authRequired.pass)) {
            out(`HTTP/1.1 401 Unauthorized`);
            Object.entries(resp.headers ?? {}).forEach(([k, v]) => out(`${k}: ${v}`));
            out(``);
            if (!headOnly) out(`401 Unauthorized — autenticação necessária (Basic)`);
            next.discovered.add(ip);
            return next;
          }
          out(`HTTP/1.1 ${resp.status} ${resp.status === 200 ? "OK" : resp.status === 401 ? "Unauthorized" : resp.status === 404 ? "Not Found" : ""}`);
          Object.entries(resp.headers ?? {}).forEach(([k, v]) => out(`${k}: ${v}`));
          out(``);
          if (!headOnly) out(resp.body);
          if (resp.flag) next.flags.add(resp.flag);
          if (h.ip === "192.168.1.50" && (path === "/" || path === "")) next.flags.add("portal-fetched");
          next.discovered.add(ip);
          return next;
        }
        if (h.webContent && (path === "/" || path === "")) {
          out(`HTTP/1.1 200 OK`);
          out(`Server: ${portInfo.version ?? "unknown"}`);
          out(`Content-Type: text/html`);
          out(``);
          if (!headOnly) out(h.webContent);
          if (h.ip === "192.168.1.50") next.flags.add("portal-fetched");
          next.discovered.add(ip);
          return next;
        }
        out(`HTTP/1.1 404 Not Found`);
        out(`Server: ${portInfo.version ?? "unknown"}`);
        out(``);
        if (!headOnly) out(`<html><body><h1>404 Not Found</h1><p>${path}</p></body></html>`);
        next.discovered.add(ip);
        return next;
      }

      // nc (netcat)
      if (c === "nc") {
        const ipArg = args[1]; const portArg = Number(args[2]);
        if (!ipArg || !portArg) { err("Uso: nc <ip> <porta>"); return s; }
        const ip = resolve(s, ipArg);
        if (!ip) { err(`nc: getaddrinfo for ${ipArg} failed`); return s; }
        const h = s.hosts[ip];
        if (!h) { err(`nc: connect to ${ipArg} port ${portArg} failed: No route`); return s; }
        const p = h.ports.find((x) => x.port === portArg);
        if (!p || p.state !== "open") { err(`nc: connect to ${ipArg} port ${portArg} failed: Connection refused`); return s; }
        launchPacket(s.myIp, ip, "tcp");
        out(`Connection to ${ipArg} ${portArg} port [tcp/${p.service}] succeeded!`);
        if (p.banner) {
          out(p.banner);
          if (p.port === 22) next.flags.add("ssh-banner");
          if (p.port === 21 && h.flag) {
            out(`220 FTP server ready.`);
            out(`USER anonymous`);
            out(`331 Please specify the password.`);
            out(`PASS anonymous@`);
            out(`230 Login successful.`);
            out(`LIST`);
            out(`drwxr-xr-x   2 0   0    4096 Jan 14 10:23 pub`);
            out(`-rw-r--r--   1 0   0      37 Jan 14 10:24 .secret`);
            out(`GET .secret`);
            out(h.flag);
            next.flags.add(h.flag);
          }
        }
        next.discovered.add(ip);
        return next;
      }

      // ssh
      if (c === "ssh") {
        const conn = args[1];
        if (!conn) { err("Uso: ssh <user@ip>"); return s; }
        const m = conn.match(/^(?:([^@]+)@)?(.+)$/);
        if (!m) { err("ssh: formato inválido"); return s; }
        const user = m[1] ?? "root";
        const target = m[2];
        const ip = resolve(s, target);
        if (!ip) { err(`ssh: Could not resolve hostname ${target}`); return s; }
        const h = s.hosts[ip];
        const sshPort = h?.ports.find((p) => p.port === 22 && p.state === "open");
        if (!sshPort) { err(`ssh: connect to host ${target} port 22: Connection refused`); return s; }
        out(`The authenticity of host '${target} (${ip})' can't be established.`);
        out(`ED25519 key fingerprint is SHA256:${Math.random().toString(36).slice(2, 18)}.`);
        out(`Are you sure you want to continue connecting (yes/no)? yes`);
        out(`Warning: Permanently added '${target}' (ED25519) to the list of known hosts.`);
        out(`${user}@${target}'s password: ************`);
        out(`Permission denied, please try again.`);
        out(`(simulador: senha não disponível neste cenário)`);
        next.discovered.add(ip);
        return next;
      }

      // netstat
      if (c === "netstat") {
        out(`Active Internet connections (only servers)`);
        out(`Proto  Local Address            Foreign Address    State`);
        out(`tcp    0.0.0.0:22               0.0.0.0:*          LISTEN`);
        out(`tcp    127.0.0.1:631            0.0.0.0:*          LISTEN`);
        out(`tcp6   :::80                    :::*               LISTEN`);
        out(`udp    0.0.0.0:68               0.0.0.0:*`);
        out(`udp    0.0.0.0:5353             0.0.0.0:*`);
        return { ...next, _netstatViewed: true };
      }

      // tcpdump
      if (c === "tcpdump") {
        out(`tcpdump: verbose output suppressed, use -v or -vv for full protocol decode`);
        out(`listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes`);
        const now = Date.now();
        for (let i = 0; i < 6; i++) {
          const t = new Date(now - (5 - i) * 230).toISOString().slice(11, 23);
          const samples = [
            `IP ${s.myIp}.54231 > 192.168.1.1.53: 0+ A? google.com. (28)`,
            `IP 192.168.1.1.53 > ${s.myIp}.54231: 0 1/0/0 A 142.250.78.78 (44)`,
            `IP ${s.myIp} > 192.168.1.50: ICMP echo request, id 1, seq 1, length 64`,
            `IP 192.168.1.50 > ${s.myIp}: ICMP echo reply, id 1, seq 1, length 64`,
            `ARP, Request who-has 192.168.1.1 tell ${s.myIp}, length 28`,
            `IP 192.168.1.150.554 > ${s.myIp}.41234: Flags [P.], length 1340 RTSP`,
          ];
          out(`${t} ${samples[i]}`);
        }
        out(`6 packets captured`);
        out(`6 packets received by filter`);
        return { ...next, _tcpdumpViewed: true };
      }

      // searchsploit (busca CVEs por termo, versão ou IP scaneado)
      if (c === "searchsploit") {
        const term = args.slice(1).join(" ").trim();
        if (!term) { err("Uso: searchsploit <termo|versão|ip>"); return s; }
        out(`---------------------------------- ----------------------------------`);
        out(` Exploit Title                     |  Path`);
        out(`---------------------------------- ----------------------------------`);

        const collect: { title: string; path: string }[] = [];
        const ipMatch = /^\d+\.\d+\.\d+\.\d+$/.test(term);
        const cveDb: Record<string, { title: string; path: string }> = {
          "CVE-2011-2523": { title: "vsftpd 2.3.4 — Backdoor Command Execution", path: "exploits/unix/remote/17491.rb" },
          "CVE-2017-0144": { title: "Microsoft SMBv1 — Remote Code Execution (EternalBlue)", path: "exploits/windows/smb/ms17_010_eternalblue.rb" },
          "CVE-2017-7494": { title: "Samba 3.5.0-4.6.4 — RCE (SambaCry)", path: "exploits/linux/samba/is_known_pipename.rb" },
          "CVE-2017-9833": { title: "Boa Webserver 0.94.x — Path Traversal", path: "exploits/hardware/webapps/47185.txt" },
          "CVE-2021-33558": { title: "Boa Webserver — Information Disclosure", path: "exploits/hardware/webapps/50202.txt" },
          "CVE-2018-15473": { title: "OpenSSH < 7.7 — User Enumeration", path: "exploits/linux/remote/45233.py" },
        };

        if (ipMatch) {
          const h = s.hosts[term];
          if (!h || !s.scanned.has(term)) { err(`Sem dados para ${term}. Rode 'nmap -sV ${term}' antes.`); return s; }
          h.ports.forEach((p) => (p.cves ?? []).forEach((cve) => {
            const key = cve.split(" ")[0];
            const ent = cveDb[key];
            if (ent) collect.push(ent);
            else collect.push({ title: cve, path: "—" });
          }));
        } else {
          const t = term.toLowerCase();
          Object.entries(cveDb).forEach(([k, v]) => {
            if (k.toLowerCase().includes(t) || v.title.toLowerCase().includes(t)) collect.push(v);
          });
          if (/vsftpd/.test(t)) collect.push(cveDb["CVE-2011-2523"]);
          if (/samba|smb|eternalblue/.test(t)) { collect.push(cveDb["CVE-2017-0144"]); collect.push(cveDb["CVE-2017-7494"]); }
          if (/boa/.test(t)) { collect.push(cveDb["CVE-2017-9833"]); collect.push(cveDb["CVE-2021-33558"]); }
          if (/openssh|ssh/.test(t)) collect.push(cveDb["CVE-2018-15473"]);
        }

        const seen = new Set<string>();
        const dedup = collect.filter((e) => seen.has(e.title) ? false : (seen.add(e.title), true));
        if (!dedup.length) { out(` Exploits: No Results`); }
        else dedup.forEach((e) => out(` ${e.title.padEnd(33).slice(0, 33)} | ${e.path}`));
        out(`---------------------------------- ----------------------------------`);
        out(`Shellcodes: No Results`);
        next.flags.add("searchsploit-used");
        return next;
      }

      // report (final do nível 5)
      if (c === "report") {
        ok(`╔═══════════════════════════════════════════════════════╗`);
        ok(`║  RELATÓRIO DE INVESTIGAÇÃO — REDE 192.168.1.0/24      ║`);
        ok(`╚═══════════════════════════════════════════════════════╝`);
        out(``);
        out(`Hosts descobertos:           ${s.discovered.size}`);
        out(`Hosts totalmente scaneados:  ${s.scanned.size}`);
        out(`Bandeiras CTF capturadas:    ${Array.from(s.flags).filter((f) => f.startsWith("CTF")).length}`);
        out(``);
        out(`Vulnerabilidades identificadas:`);
        out(`  • 192.168.1.100 — vsftpd 2.3.4 (CVE-2011-2523, backdoor)`);
        out(`  • 192.168.1.100 — Samba 3.6 (vulnerável a EternalBlue)`);
        out(`  • 192.168.1.50  — info disclosure no HTML do portal (/admin)`);
        out(`  • 192.168.1.150 — Boa httpd (CVE conhecida em câmeras IoT)`);
        out(``);
        ok(`Investigação encerrada com sucesso. Bom trabalho, operador.`);
        next.flags.add("investigation-done");
        return next;
      }

      err(`comando não reconhecido: ${c}. Digite 'help'.`);
      return s;
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
    } else if (e.key === "Tab") {
      e.preventDefault();
      const completions = [
        "ifconfig", "ip a", "ping 192.168.1.1", "ping 8.8.8.8", "traceroute 8.8.8.8",
        "arp -a", "nslookup web.corp.local", "dig web.corp.local",
        "dig TXT corp.local", "dig -x 192.168.1.50", "dig +short web.corp.local", "whois corp.local",
        "nmap -sn 192.168.1.0/24", "nmap 192.168.1.50", "nmap -sV 192.168.1.100",
        "nmap -p 22,80,443 192.168.1.50",
        "searchsploit vsftpd 2.3.4", "searchsploit 192.168.1.100", "searchsploit boa",
        "curl http://192.168.1.50", "curl http://192.168.1.50/admin", "curl http://192.168.1.50/.git/config",
        "curl http://192.168.1.50/robots.txt", "curl -I http://192.168.1.50",
        "curl -u admin:admin http://192.168.1.150/cgi-bin/snapshot",
        "nc 192.168.1.50 22", "nc 192.168.1.100 21",
        "ssh root@192.168.1.50", "netstat -tuln", "tcpdump -i eth0", "report",
        "help", "clear", "reset",
      ];
      const matches = completions.filter((cmp) => cmp.startsWith(input));
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1) info("Sugestões: " + matches.join(" | "));
    }
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); run(input); setInput(""); };

  // ---------- Topology layout ----------
  const topology = useMemo(() => {
    const W = 900, H = 320;
    const myPos = { x: 110, y: H / 2 };
    const routerPos = { x: 320, y: H / 2 };
    const internetPos = { x: 800, y: 80 };
    const subnetHosts = Object.values(state.hosts).filter((h) => h.ip.startsWith("192.168.1.") && h.ip !== state.myIp && h.ip !== state.gateway);
    const positions: Record<string, { x: number; y: number }> = {
      [state.myIp]: myPos,
      [state.gateway]: routerPos,
    };
    subnetHosts.forEach((h, i) => {
      const angle = -Math.PI / 2 + (i / Math.max(subnetHosts.length - 1, 1)) * Math.PI;
      const r = 180;
      positions[h.ip] = { x: 560 + Math.cos(angle) * r, y: H / 2 + Math.sin(angle) * r };
    });
    positions["8.8.8.8"] = internetPos;
    return { W, H, positions, myPos, routerPos, internetPos, subnetHosts };
  }, [state.hosts, state.myIp, state.gateway]);

  // ---------- Intro ----------
  if (phase === "intro") {
    const levelStyles = [
      { border: "border-cyan-500/20", bg: "bg-cyan-500/10", text: "text-cyan-400", borderInner: "border-cyan-500/30" },
      { border: "border-emerald-500/20", bg: "bg-emerald-500/10", text: "text-emerald-400", borderInner: "border-emerald-500/30" },
      { border: "border-amber-500/20", bg: "bg-amber-500/10", text: "text-amber-400", borderInner: "border-amber-500/30" },
      { border: "border-fuchsia-500/20", bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", borderInner: "border-fuchsia-500/30" },
      { border: "border-red-500/20", bg: "bg-red-500/10", text: "text-red-400", borderInner: "border-red-500/30" },
    ];
    const steps: { title: string; content: React.ReactNode }[] = [
      {
        title: "Boas-vindas",
        content: (
          <div className="text-center pt-6">
            <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-5">
              <Wifi className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Network Simulator</h1>
            <p className="text-cyan-400 font-mono text-xs uppercase tracking-[0.3em] mb-6">Mapeie. Sondoe. Domine a rede.</p>
            <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
              Um laboratório virtual de redes e cibersegurança ofensiva. Você assume o papel de um operador investigando a infraestrutura interna de uma empresa fictícia. Use comandos reais (<code className="text-cyan-300 font-mono text-xs">nmap, dig, nc, tcpdump</code>...) e veja a topologia se revelar conforme você avança.
            </p>
          </div>
        ),
      },
      {
        title: "Por que aprender redes?",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 mb-6 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Por que aprender redes?
            </h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <Globe className="w-6 h-6 text-cyan-400 mb-3" />
                <p className="text-base font-bold text-white mb-2">A internet é redes</p>
                <p className="text-sm text-slate-400 leading-relaxed">Todo serviço (web, email, app, jogo) é tráfego de rede. Quem entende rede entende como tudo funciona.</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <ShieldAlert className="w-6 h-6 text-red-400 mb-3" />
                <p className="text-base font-bold text-white mb-2">Segurança</p>
                <p className="text-sm text-slate-400 leading-relaxed">Pra defender, você precisa pensar como atacante. As mesmas ferramentas servem pra ambos os lados.</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <FileSearch className="w-6 h-6 text-amber-400 mb-3" />
                <p className="text-base font-bold text-white mb-2">Debug & SRE</p>
                <p className="text-sm text-slate-400 leading-relaxed">"Por que esse serviço não responde?" 80% das vezes é rede. Saber sondar economiza horas.</p>
              </div>
            </div>
          </section>
        ),
      },
      {
        title: "Conceitos fundamentais",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Conceitos fundamentais
            </h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl divide-y divide-white/5 mb-6">
              {[
                { t: "IP",         d: "Endereço numérico único de cada máquina na rede. Ex: 192.168.1.42 (privado), 8.8.8.8 (público).", c: "text-cyan-300" },
                { t: "Subrede",    d: "Faixa de IPs do mesmo segmento físico. 192.168.1.0/24 = 256 endereços (192.168.1.0 a 192.168.1.255).", c: "text-emerald-300" },
                { t: "Gateway",    d: "Roteador que conecta sua subrede ao resto do mundo. Geralmente o primeiro IP da faixa.", c: "text-amber-300" },
                { t: "DNS",        d: "Sistema que traduz nomes (google.com) em IPs (142.250.78.78). Sem DNS você só decoraria números.", c: "text-fuchsia-300" },
                { t: "Porta",      d: "Identificador de serviço dentro de um IP. 80=HTTP, 443=HTTPS, 22=SSH, 25=SMTP, 5432=PostgreSQL.", c: "text-violet-300" },
                { t: "Pacote",     d: "Unidade de informação que viaja na rede. ICMP, TCP e UDP são os tipos mais comuns.", c: "text-rose-300" },
                { t: "Banner",     d: "Mensagem inicial que muitos serviços enviam ao conectar — costuma vazar a versão do software.", c: "text-pink-300" },
                { t: "CIDR",       d: "Forma compacta de expressar faixas: /24 = 256 IPs, /16 = 65536 IPs, /32 = 1 IP só.", c: "text-cyan-300" },
              ].map((it, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <span className={`text-sm font-bold font-mono ${it.c} min-w-[120px] pt-0.5`}>{it.t}</span>
                  <span className="text-sm text-slate-400 leading-relaxed flex-1">{it.d}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
              <img 
                src="/assets/images/network_edu.png" 
                alt="Infográfico Educativo: Fluxo de Pacotes na Rede" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </section>
        ),
      },
      {
        title: "Cenário CTF",
        content: (
          <section className="bg-gradient-to-br from-red-900/10 via-slate-900/40 to-cyan-900/10 border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-400 mb-4 flex items-center gap-2">
              <Flag className="w-4 h-4" /> Cenário CTF
            </h2>
            <p className="text-base text-slate-300 leading-relaxed mb-4">
              Você é um pentester contratado pela <strong>CorpHQ</strong> pra avaliar a segurança da rede interna. Sabe-se que existe um host vulnerável escondido entre as máquinas. Sua missão:
            </p>
            <ol className="text-sm text-slate-400 leading-relaxed space-y-2 list-decimal list-inside ml-2">
              <li>Mapear a topologia (descobrir todos os hosts ativos)</li>
              <li>Identificar serviços expostos e suas versões</li>
              <li>Encontrar a "bandeira" (CTF flag) escondida no servidor vulnerável</li>
              <li>Gerar um relatório final com as vulnerabilidades descobertas</li>
            </ol>
          </section>
        ),
      },
      {
        title: "Os 5 níveis",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 mb-6 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Os {LEVELS.length} níveis
            </h2>
            <div className="space-y-2">
              {LEVELS.map((lv, i) => {
                const s = levelStyles[i] ?? levelStyles[0];
                return (
                  <div key={lv.id} className={`bg-slate-900/40 border ${s.border} rounded-xl p-4 flex items-start gap-4`}>
                    <div className={`w-9 h-9 rounded-lg ${s.bg} border ${s.borderInner} ${s.text} flex items-center justify-center font-black text-sm shrink-0`}>{lv.id}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white mb-1">{lv.title} <span className="text-[10px] text-slate-500 font-mono ml-2">{lv.missions.length} missões</span></p>
                      <p className="text-xs text-slate-400 leading-relaxed">{lv.briefing}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ),
      },
      {
        title: "Pronto para começar",
        content: (
          <section>
            <div className="bg-gradient-to-br from-cyan-900/10 via-slate-900/40 to-emerald-900/10 border border-cyan-500/20 rounded-2xl p-6 mb-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Dicas
              </h2>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Digite <code className="text-cyan-300 font-mono">help</code> a qualquer momento para listar todos os comandos</li>
                <li>• <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">↑</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">↓</kbd> navegam o histórico, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">Tab</kbd> autocompleta</li>
                <li>• <strong>Clique nos hosts do mapa de topologia</strong> para ver portas e detalhes</li>
                <li>• Pacotes ICMP/TCP/DNS são animados no mapa quando você dispara comandos</li>
                <li>• <code className="text-cyan-300 font-mono">reset</code> reinicia o nível, <code className="text-cyan-300 font-mono">clear</code> limpa o terminal</li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-base text-slate-300 mb-1">Pronto, operador.</p>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">17 missões · 5 níveis · ~30 minutos</p>
            </div>
          </section>
        ),
      },
    ];

    const isLast = introStep === steps.length - 1;
    const goPrev = () => setIntroStep((s) => Math.max(0, s - 1));
    const goNext = () => {
      if (isLast) {
        localStorage.setItem("network_sim_intro_seen", "true");
        setPhase("playing");
      } else {
        setIntroStep((s) => s + 1);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]">
          <img src="/assets/images/network_bg.png" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex items-center justify-between px-6 py-4">
            <Button variant="ghost" size="icon" onClick={() => localStorage.getItem("network_sim_intro_seen") ? setPhase("playing") : onBack()} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <button onClick={() => {
              localStorage.setItem("network_sim_intro_seen", "true");
              setPhase("playing");
            }} className="text-xs text-slate-500 hover:text-cyan-400 font-mono uppercase tracking-widest transition-colors">
              Pular tour →
            </button>
          </div>

          <div className="flex-1 flex items-start justify-center px-4 pb-32">
            <div className="max-w-4xl w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={introStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {steps[introStep].content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-950/90 backdrop-blur-md border-t border-white/10">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
              <Button variant="ghost" onClick={goPrev} disabled={introStep === 0} className="text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronDown className="w-4 h-4 mr-1 rotate-90" /> Voltar
              </Button>
              <div className="flex-1 flex flex-col items-center gap-2">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{steps[introStep].title} · {introStep + 1} de {steps.length}</p>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <button key={i} onClick={() => setIntroStep(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === introStep ? "w-8 bg-cyan-400" :
                        i < introStep ? "w-1.5 bg-cyan-400/60" : "w-1.5 bg-slate-700"
                      }`} aria-label={`Ir para passo ${i + 1}`} />
                  ))}
                </div>
              </div>
              <Button onClick={goNext} className={isLast ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold" : "bg-slate-800 text-white hover:bg-slate-700"}>
                {isLast ? "Iniciar Operação" : "Próximo"} <ChevronDown className="w-4 h-4 ml-1 -rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Simulator ----------
  const sel = selectedHost ? state.hosts[selectedHost] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06]">
        <img 
          src="/assets/images/network_bg.png" 
          alt="Network Background" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Network Simulator</h2>
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em]">Operador {state.myIp}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPhase("intro")} className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-xs">
              <BookOpen className="w-4 h-4 mr-2" /> Manual
            </Button>
            <Button variant="ghost" size="sm" onClick={resetLevel} className="text-slate-400 hover:text-white text-xs">Reset Nível</Button>
          </div>
        </div>

        {/* Level selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {LEVELS.map((lv, i) => {
            const isUnlocked = unlocked.has(i);
            const isDone = completed.has(i);
            const isCurrent = i === levelIdx;
            return (
              <button key={lv.id} disabled={!isUnlocked} onClick={() => isUnlocked && loadLevel(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                  isCurrent ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" :
                  isDone ? "bg-cyan-500/5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" :
                  isUnlocked ? "bg-slate-900 border-white/10 text-slate-300 hover:border-white/30" :
                  "bg-slate-900/50 border-white/5 text-slate-600 cursor-not-allowed"
                }`}>
                {!isUnlocked ? <Lock className="w-3 h-3" /> : isDone ? <Trophy className="w-3 h-3" /> : <span className="text-[10px]">{lv.id}</span>}
                Nível {lv.id}: {lv.title}
              </button>
            );
          })}
        </div>

        {/* Briefing */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-3 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono mb-1">Briefing do Nível {level.id}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{level.briefing}</p>
          </div>
        </div>

        {/* Mission */}
        <div className={`rounded-2xl p-4 border mb-4 ${levelDone ? "bg-emerald-500/10 border-emerald-500/40" : "bg-cyan-500/10 border-cyan-500/30"}`}>
          <div className="flex items-center gap-3">
            {levelDone ? <Trophy className="w-6 h-6 text-emerald-400 shrink-0" /> :
              <div className="w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0">{missionIdx + 1}</div>}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                {levelDone ? `Nível ${level.id} concluído` : `Nível ${level.id} • Missão ${missionIdx + 1} de ${level.missions.length}`}
              </p>
              <p className="text-sm font-bold text-white">{levelDone ? "Avance para o próximo nível!" : mission.title}</p>
              {!levelDone && <p className="text-xs text-slate-400 font-mono mt-0.5">Dica: <span className="text-cyan-300">{mission.hint}</span></p>}
            </div>
            {levelDone && levelIdx + 1 < LEVELS.length && (
              <Button size="sm" onClick={() => loadLevel(levelIdx + 1)} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold text-xs">
                Próximo Nível →
              </Button>
            )}
          </div>
        </div>

        {/* Topology + Side panel */}
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          {/* Topology */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-cyan-400">
              <NetworkIcon className="w-4 h-4" />
              <h5 className="text-xs font-bold uppercase tracking-widest">Topologia da Rede</h5>
              <span className="ml-auto text-[10px] text-slate-500 font-mono">{state.discovered.size} de {Object.keys(state.hosts).length} hosts visíveis</span>
            </div>
            <div className="overflow-x-auto">
              <svg width={topology.W} height={topology.H} className="w-full" viewBox={`0 0 ${topology.W} ${topology.H}`}>
                {/* Connection lines: my IP -> router -> hosts */}
                <line x1={topology.myPos.x} y1={topology.myPos.y} x2={topology.routerPos.x} y2={topology.routerPos.y} stroke="#475569" strokeWidth={2} />
                <line x1={topology.routerPos.x} y1={topology.routerPos.y} x2={topology.internetPos.x} y2={topology.internetPos.y} stroke="#475569" strokeWidth={2} strokeDasharray="4 4" />
                {topology.subnetHosts.map((h) => {
                  const visible = state.discovered.has(h.ip);
                  const pos = topology.positions[h.ip];
                  return <line key={`l-${h.ip}`} x1={topology.routerPos.x} y1={topology.routerPos.y} x2={pos.x} y2={pos.y}
                    stroke={visible ? "#06b6d4" : "#1e293b"} strokeWidth={visible ? 1.5 : 1} strokeDasharray={visible ? "" : "3 3"} />;
                })}

                {/* Animated packets */}
                {state.packets.map((p) => {
                  const fromPos = topology.positions[p.from] ?? topology.myPos;
                  const toPos = topology.positions[p.to] ?? topology.internetPos;
                  const color = p.type === "icmp" ? "#10b981" : p.type === "dns" ? "#a855f7" : "#06b6d4";
                  return (
                    <motion.circle key={p.id}
                      r={5} fill={color}
                      initial={{ cx: fromPos.x, cy: fromPos.y, opacity: 1 }}
                      animate={{ cx: toPos.x, cy: toPos.y, opacity: [1, 1, 0] }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                    />
                  );
                })}

                {/* My host */}
                <g transform={`translate(${topology.myPos.x},${topology.myPos.y})`}>
                  <circle r={28} fill="#0e7490" stroke="#22d3ee" strokeWidth={2} />
                  <foreignObject x={-14} y={-14} width={28} height={28}>
                    <div className="w-full h-full flex items-center justify-center text-white"><Laptop className="w-5 h-5" /></div>
                  </foreignObject>
                  <text x={0} y={48} fill="#cbd5e1" fontSize="11" fontFamily="monospace" textAnchor="middle">VOCÊ</text>
                  <text x={0} y={62} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">{state.myIp}</text>
                </g>

                {/* Router */}
                <g transform={`translate(${topology.routerPos.x},${topology.routerPos.y})`}>
                  <circle r={26} fill="#1e293b" stroke="#fbbf24" strokeWidth={2} />
                  <foreignObject x={-12} y={-12} width={24} height={24}>
                    <div className="w-full h-full flex items-center justify-center text-amber-300"><Router className="w-5 h-5" /></div>
                  </foreignObject>
                  <text x={0} y={46} fill="#cbd5e1" fontSize="11" fontFamily="monospace" textAnchor="middle">router.local</text>
                  <text x={0} y={60} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">{state.gateway}</text>
                </g>

                {/* Internet */}
                <g transform={`translate(${topology.internetPos.x},${topology.internetPos.y})`}>
                  <circle r={22} fill="#1e293b" stroke="#475569" strokeWidth={1} strokeDasharray="3 3" />
                  <foreignObject x={-10} y={-10} width={20} height={20}>
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><Globe className="w-5 h-5" /></div>
                  </foreignObject>
                  <text x={0} y={40} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">internet</text>
                </g>

                {/* Subnet hosts */}
                {topology.subnetHosts.map((h) => {
                  const visible = state.discovered.has(h.ip);
                  const pos = topology.positions[h.ip];
                  const isSelected = selectedHost === h.ip;
                  const isVuln = h.flag !== undefined;
                  const color = isVuln && state.scanned.has(h.ip) ? "#ef4444" : visible ? "#10b981" : "#475569";
                  return (
                    <g key={h.ip} transform={`translate(${pos.x},${pos.y})`} style={{ cursor: visible ? "pointer" : "not-allowed" }}
                      onClick={() => visible && setSelectedHost(h.ip)}>
                      <circle r={isSelected ? 22 : 18} fill={visible ? "#0f172a" : "#1e293b"} stroke={color} strokeWidth={isSelected ? 3 : 2} opacity={visible ? 1 : 0.3} />
                      <foreignObject x={-9} y={-9} width={18} height={18}>
                        <div className="w-full h-full flex items-center justify-center" style={{ color }}>
                          {h.os.includes("Windows") ? <Monitor className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                        </div>
                      </foreignObject>
                      <text x={0} y={36} fill={visible ? "#cbd5e1" : "#475569"} fontSize="10" fontFamily="monospace" textAnchor="middle">
                        {visible ? (h.hostname?.split(".")[0] ?? "host") : "?"}
                      </text>
                      <text x={0} y={50} fill={visible ? "#64748b" : "#334155"} fontSize="9" fontFamily="monospace" textAnchor="middle">
                        {visible ? h.ip : "•••.•••.•.•"}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />ICMP</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" />TCP</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" />DNS</span>
              <span className="flex items-center gap-1 ml-auto"><span className="w-2 h-2 rounded-full bg-red-400" />vulnerável</span>
            </div>
          </div>

          {/* Side: host details */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-cyan-400">
              <Shield className="w-4 h-4" />
              <h5 className="text-xs font-bold uppercase tracking-widest">Detalhes do Host</h5>
              {sel && <button onClick={() => setSelectedHost(null)} className="ml-auto text-slate-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
            </div>
            {!sel ? (
              <div className="text-center py-8">
                <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Clique num host descoberto no mapa para ver detalhes.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Hostname</p>
                  <p className="font-mono text-cyan-300">{sel.hostname ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">IP</p>
                  <p className="font-mono text-white">{sel.ip}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">SO</p>
                  <p className="font-mono text-slate-300">{sel.os}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Portas {state.scanned.has(sel.ip) ? "" : "(rode nmap pra descobrir)"}</p>
                  {state.scanned.has(sel.ip) ? (
                    <div className="space-y-1">
                      {sel.ports.filter((p) => p.state !== "closed").map((p) => (
                        <div key={p.port} className={`rounded px-2 py-1 font-mono text-[11px] ${
                          p.state === "open" ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-300" :
                          "bg-amber-500/5 border border-amber-500/20 text-amber-300"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span>{p.port}/tcp</span>
                            <span>{p.service}</span>
                            <span className="text-[10px] text-slate-500">{p.state}</span>
                          </div>
                          {p.version && <div className="text-[10px] text-slate-400 mt-0.5">{p.version}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-600 italic font-mono">execute nmap {sel.ip}</p>
                  )}
                </div>
                {state.scanned.has(sel.ip) && (() => {
                  const allCves = sel.ports.flatMap((p) => p.cves ?? []);
                  if (!allCves.length) return null;
                  return (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-red-400 font-mono mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> CVEs detectadas
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {allCves.map((cve, i) => (
                          <span key={i} className="bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5 font-mono text-[10px] text-red-300">
                            {cve}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 italic">dica: searchsploit {sel.ip}</p>
                    </div>
                  );
                })()}
                {sel.defaultCreds && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-amber-400 font-mono mb-1">Credenciais padrão (suspeitas)</p>
                    <code className="text-[11px] text-amber-300 font-mono bg-amber-500/5 border border-amber-500/20 rounded px-2 py-1 inline-block">
                      {sel.defaultCreds.user}:{sel.defaultCreds.pass}
                    </code>
                  </div>
                )}
                {sel.flag && state.flags.has(sel.flag) && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-red-400" />
                    <code className="text-[11px] text-red-300 font-mono">{sel.flag}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Hosts Descobertos</p>
            <p className="text-lg font-black text-cyan-300 font-mono">{state.discovered.size}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Hosts Scaneados</p>
            <p className="text-lg font-black text-emerald-300 font-mono">{state.scanned.size}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">CTF Flags</p>
            <p className="text-lg font-black text-red-300 font-mono">{Array.from(state.flags).filter((f) => f.startsWith("CTF")).length}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Pacotes em Trânsito</p>
            <p className="text-lg font-black text-fuchsia-300 font-mono flex items-center gap-1">{state.packets.length}<Zap className="w-4 h-4" /></p>
          </div>
        </div>

        {/* Terminal */}
        <div onClick={() => inputRef.current?.focus()}
          className="bg-slate-950 border border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col h-96 cursor-text shadow-[0_0_30px_-10px_rgba(6,182,212,0.4)] focus-within:border-cyan-400 focus-within:shadow-[0_0_40px_-10px_rgba(6,182,212,0.7)] transition-all">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-slate-900/80">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 text-[11px] text-slate-500 font-mono flex-1">root@kali:~#</span>
            <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest animate-pulse">● digite aqui</span>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-0.5">
            {lines.map((l, i) => (
              <pre key={i} className={`whitespace-pre-wrap break-words ${
                l.type === "in" ? "text-white" :
                l.type === "ok" ? "text-emerald-400" :
                l.type === "err" ? "text-red-400" :
                l.type === "info" ? "text-cyan-300" : "text-slate-400"
              }`}>{l.text}</pre>
            ))}
            <form onSubmit={onSubmit} className="flex items-center gap-2 pt-1">
              <span className="text-cyan-400 font-bold">$</span>
              <input ref={inputRef} value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false} autoComplete="off"
                placeholder="ifconfig"
                className="flex-1 bg-transparent outline-none text-white caret-cyan-400 placeholder:text-slate-600 placeholder:italic" />
              <span className="w-2 h-4 bg-cyan-400 animate-pulse" aria-hidden />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
