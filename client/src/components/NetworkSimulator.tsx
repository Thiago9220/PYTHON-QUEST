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
  // múltiplas credenciais válidas (alguns hosts têm vários usuários ativos)
  validCreds?: { user: string; pass: string; protocol?: "ssh" | "ftp" | "http" }[];
  // SMB shares descobertos via enum4linux/smbclient
  smbShares?: { name: string; type: "Disk" | "Printer" | "IPC"; comment: string; readable?: boolean; flag?: string; files?: { name: string; size: number; content?: string }[] }[];
  smbUsers?: string[];
  smbDomain?: string;
  // sistema de arquivos pós-SSH (Fase 3)
  victimFs?: {
    cwd?: string;
    files: Record<string, { content?: string; isDir?: boolean; suid?: boolean; perm?: string; owner?: string; size?: number; bin?: boolean }>;
    sudoers?: { binary: string; nopasswd: boolean }[];
    cron?: string[];
    rootFlag?: string;
  };
  exploit?: { vector: "vsftpd234" | "eternalblue" | "boa-traversal"; port: number; rootFlag?: string; loot?: string[] };
  postExLoot?: string[];
}


interface Connection {
  proto: "tcp" | "udp";
  localPort: number;
  remoteIp: string;
  remotePort: number;
  state: "ESTABLISHED" | "TIME_WAIT" | "CLOSED";
  service: string;
  ts: number;
}

interface PacketLog {
  id: number;
  from: string;
  to: string;
  proto: "ICMP" | "TCP" | "UDP" | "DNS" | "HTTP" | "SSH" | "FTP";
  port?: number;
  info: string;
  ts: number;
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
  // log persistente p/ tcpdump real
  packetLog: PacketLog[];
  // conexões locais ativas/recentes p/ netstat dinâmico
  connections: Connection[];
  // sessão SSH ativa (Fase 3: shell pós-acesso)
  sshSession?: { ip: string; user: string; cwd: string };
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
      // senha fraca acidental do dba
      defaultCreds: { user: "postgres", pass: "postgres" },
      validCreds: [
        { user: "postgres", pass: "postgres", protocol: "ssh" },
      ],
      victimFs: {
        cwd: "/home/postgres",
        rootFlag: "CTF{root_via_sudo_nopasswd_find}",
        sudoers: [
          // /usr/bin/find pode rodar como root sem senha — clássico GTFOBins privesc
          { binary: "/usr/bin/find", nopasswd: true },
        ],
        cron: [
          "* * * * * root /opt/scripts/backup.sh",
          "@reboot postgres /home/postgres/start.sh",
        ],
        files: {
          "/home/postgres/notes.txt": { content: "TODO:\n - rotacionar credenciais\n - revisar permissões do /opt/scripts/backup.sh\n - lembrar de remover sudoers wildcard\n", owner: "postgres", size: 142 },
          "/home/postgres/.bash_history": { content: "ls -la /opt/scripts\nsudo find / -name '*.conf' 2>/dev/null\ncat /etc/postgresql/16/main/pg_hba.conf\nexit\n", owner: "postgres", size: 124 },
          "/etc/passwd": { content: "root:x:0:0:root:/root:/bin/bash\npostgres:x:999:999:PostgreSQL:/home/postgres:/bin/bash\nbackup:x:1001:1001:Backup User:/var/lib/backup:/bin/false\n", owner: "root", size: 188 },
          "/etc/shadow": { content: "(permissão negada — root only)", perm: "----------", owner: "root" },
          "/etc/postgresql/16/main/pg_hba.conf": { content: "# TYPE  DATABASE  USER      ADDRESS         METHOD\nlocal   all       postgres                  trust\nhost    all       all       0.0.0.0/0       md5\n", owner: "postgres" },
          "/opt/scripts/backup.sh": { content: "#!/bin/bash\n# Backup script — owned by root, runs every minute via cron\npg_dump corp_db > /backups/corp_$(date +%F).sql\nchmod 644 /backups/*.sql\n", perm: "rwxrwxrwx", owner: "root" },
          "/usr/bin/find": { suid: true, owner: "root", perm: "rwsr-xr-x", bin: true, size: 320128 },
          "/usr/bin/passwd": { suid: true, owner: "root", perm: "rwsr-xr-x", bin: true, size: 67912 },
          "/usr/bin/chsh": { suid: true, owner: "root", perm: "rwsr-xr-x", bin: true, size: 49664 },
          "/root/flag.txt": { content: "CTF{root_via_sudo_nopasswd_find}\nParabéns — você escalou privilégios usando sudo NOPASSWD em /usr/bin/find\nDica GTFOBins: sudo find . -exec /bin/sh \\; -quit\n", owner: "root", perm: "rw-------" },
        },
      },
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
      smbDomain: "CORPHQ",
      smbUsers: ["administrator", "guest", "backup_svc", "joao.silva", "maria.santos"],
      smbShares: [
        { name: "IPC$", type: "IPC", comment: "Remote IPC", readable: false },
        { name: "ADMIN$", type: "Disk", comment: "Remote Admin", readable: false },
        { name: "C$", type: "Disk", comment: "Default share", readable: false },
        { name: "Backups", type: "Disk", comment: "Backups antigos do banco — sem permissão restrita", readable: true,
          flag: "CTF{smb_backup_share_was_world_readable}",
          files: [
            { name: "db_dump_2023.sql", size: 124550, content: "-- backup parcial — credenciais expostas em plain text\nINSERT INTO users (login,pwd) VALUES ('admin','S3nh@F0rt3!');\n[truncado: 2.4MB]" },
            { name: "README.txt", size: 412, content: "Backup mensal automatizado.\nNão deletar.\nRotação manual.\n" },
            { name: ".env.bak", size: 287, content: "DB_HOST=db.corp.local\nDB_USER=postgres\nDB_PASS=postgres\nJWT_SECRET=8f3a91-internal\nFLAG=CTF{smb_backup_share_was_world_readable}\n" },
          ]
        },
        { name: "Public", type: "Disk", comment: "Read-only para todos", readable: true,
          files: [
            { name: "Manual_Procedimentos.pdf", size: 89221 },
            { name: "Aviso_TI.txt", size: 156, content: "Reset de senhas: contatar admin@corp.local\n" },
          ]
        },
      ],
    },
    "192.168.1.150": { ip: "192.168.1.150", hostname: "iot-cam.corp.local", os: "Embedded Linux", status: "up",
      ports: [
        { port: 80, state: "open", service: "http", version: "Boa/0.94.14", banner: "HTTP/1.1 200 OK\nServer: Boa/0.94.14rc21\n",
          cves: ["CVE-2017-9833 (Boa path traversal)", "CVE-2021-33558 (Boa info disclosure)"] },
        { port: 554, state: "open", service: "rtsp", version: "RTSP/1.0" },
      ],
      defaultCreds: { user: "admin", pass: "admin" },
      validCreds: [
        { user: "admin", pass: "admin", protocol: "http" },
        { user: "admin", pass: "admin", protocol: "ssh" },
      ],
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
  packetLog: [],
  connections: [],
});

const longestCommonPrefix = (arr: string[]): string => {
  if (!arr.length) return "";
  let prefix = arr[0];
  for (let i = 1; i < arr.length; i++) {
    while (!arr[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
};

// Completions contextuais — sugere IPs descobertos, hostnames conhecidos pelo DNS, etc.
const computeNetCompletions = (input: string, s: NetState): string[] => {
  const trimmed = input;
  const ends = trimmed.endsWith(" ");
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const last = ends ? "" : (tokens[tokens.length - 1] ?? "");
  const head = ends ? tokens.join(" ") : tokens.slice(0, -1).join(" ");

  const discoveredIps = Array.from(s.discovered).filter((ip) => ip !== s.myIp).sort();
  const knownHostnames = Object.keys(s.dnsCache);
  const allTargets = [...discoveredIps, ...knownHostnames];
  // hosts com SSH aberto (pra sugestões de ssh)
  const sshHosts = Object.values(s.hosts).filter((h) => h.ports.some((p) => p.port === 22 && p.state === "open") && s.discovered.has(h.ip));
  const sshTargets = sshHosts.flatMap((h) => {
    const hostnames = Object.entries(s.dnsCache).filter(([, ip]) => ip === h.ip).map(([n]) => n);
    return [`root@${h.ip}`, `admin@${h.ip}`, ...hostnames.flatMap((n) => [`root@${n}`, `admin@${n}`])];
  });
  // CVEs vistos nas portas dos hosts já scaneados
  const seenCves = Array.from(new Set(
    Array.from(s.scanned).flatMap((ip) => s.hosts[ip]?.ports.flatMap((p) => p.cves ?? []) ?? [])
      .map((c) => c.split(" ")[0])
  ));

  const suggestFor = (pool: string[], prefix: string) =>
    pool.filter((x) => x.startsWith(prefix)).map((x) => `${head} ${x}`.trim());

  // Casos contextuais
  if (head === "ping" || head === "traceroute" || head === "tracert" || head === "host" || head === "nslookup")
    return suggestFor(allTargets, last);
  if (head === "dig") return suggestFor(["TXT", "MX", "NS", "+short", "-x", ...allTargets], last);
  if (head === "dig TXT" || head === "dig MX" || head === "dig NS" || head === "dig +short") return suggestFor(allTargets, last);
  if (head === "dig -x") return suggestFor(discoveredIps, last);
  if (head === "whois") return suggestFor(knownHostnames.filter((h) => h.includes(".")), last);
  if (head === "nmap") return suggestFor(["-sn", "-sV", "-sS", "-sT", "-sU", "-O", "-A", "-p", "--top-ports", "--script", ...allTargets, s.subnet], last);
  if (/^nmap( -[^\s]+)*$/.test(head)) return suggestFor([...allTargets, s.subnet], last);
  if (head === "nmap -p") return suggestFor(["1-1000", "22,80,443", "22,80,443,3306,5432", "-"], last);
  if (head === "nmap --top-ports") return suggestFor(["10", "100", "1000"], last);
  if (head === "nmap --script") return suggestFor(["vuln", "smb-vuln-ms17-010", "ftp-anon", "http-enum", "default"], last);
  if (head === "nc" || head === "telnet") return suggestFor(discoveredIps, last);
  if (/^(nc|telnet) \d+\.\d+\.\d+\.\d+$/.test(head)) return suggestFor(["21", "22", "53", "80", "443", "445", "3306", "5432"], last);
  if (head === "ssh") return suggestFor(sshTargets, last);
  if (head === "sshpass") return suggestFor(["-p"], last);
  if (head === "sshpass -p") return [];
  if (/^sshpass -p \S+$/.test(head)) return suggestFor(["ssh"], last);
  if (/^sshpass -p \S+ ssh$/.test(head)) return suggestFor(sshTargets, last);
  if (head === "curl" || head === "wget") {
    return suggestFor(["-u", "-I", "-O", ...discoveredIps.map((ip) => `http://${ip}/`), ...knownHostnames.filter((h) => h.includes(".")).map((h) => `http://${h}/`)], last);
  }
  if (head === "curl -u" || head === "wget -u") return suggestFor(["admin:admin", "root:toor", "admin:password"], last);
  if (head === "searchsploit") return suggestFor([...seenCves, ...discoveredIps, "vsftpd", "samba", "boa", "openssh"], last);
  if (head === "tcpdump") return suggestFor(["-i", "-c", "host", "port", "-n"], last);
  if (head === "tcpdump host" || head === "tcpdump -i eth0 host") return suggestFor(discoveredIps, last);
  if (head === "tcpdump port") return suggestFor(["22", "53", "80", "443"], last);
  // hydra / dnsrecon / enum4linux / smbclient
  if (head === "hydra") return suggestFor(["-l", "-L", "-P", "-t"], last);
  if (head === "hydra -l") return suggestFor(["root", "admin", "administrator", "postgres", "mysql"], last);
  if (head === "hydra -P" || /^hydra .* -P$/.test(head)) return suggestFor(["pass.txt", "rockyou.txt", "common.txt"], last);
  if (/^hydra .* -P \S+$/.test(head)) {
    const sshIps = Object.values(s.hosts).filter((h) => h.ports.some((p) => p.port === 22 && p.state === "open") && s.discovered.has(h.ip)).map((h) => `ssh://${h.ip}`);
    const ftpIps = Object.values(s.hosts).filter((h) => h.ports.some((p) => p.port === 21 && p.state === "open") && s.discovered.has(h.ip)).map((h) => `ftp://${h.ip}`);
    return suggestFor([...sshIps, ...ftpIps], last);
  }
  if (head === "dnsrecon") return suggestFor(["-d"], last);
  if (head === "dnsrecon -d") return suggestFor(knownHostnames.filter((h) => h.split(".").length === 2), last);
  if (head === "enum4linux") {
    const smbIps = Object.values(s.hosts).filter((h) => h.ports.some((p) => (p.port === 445 || p.port === 139) && p.state === "open") && s.discovered.has(h.ip)).map((h) => h.ip);
    return suggestFor(smbIps, last);
  }
  if (head === "smbclient") return suggestFor(["-L", "-N"], last);
  if (head === "smbclient -L" || /^smbclient .*-L$/.test(head)) {
    const smbIps = Object.values(s.hosts).filter((h) => h.ports.some((p) => p.port === 445 && p.state === "open") && s.discovered.has(h.ip)).map((h) => h.ip);
    return suggestFor(smbIps, last);
  }

  // Quando há sessão SSH ativa: sugerir comandos de shell remoto
  if (s.sshSession) {
    const remoteHost = s.hosts[s.sshSession.ip];
    const remoteFiles = remoteHost?.victimFs ? Object.keys(remoteHost.victimFs.files) : [];
    if (head === "cat" || head === "strings" || head === "hexdump" || head === "xxd" || head === "ls -la") {
      return suggestFor(remoteFiles, last);
    }
    if (head === "cd") return suggestFor(["/", "/home", "/etc", "/root", "/opt", "/var"], last);
    if (head === "sudo") return suggestFor(["-l", "find", "su"], last);
    const remoteCmds = [
      "ls", "ls -la", "cat ", "cd ", "pwd", "whoami", "id", "uname -a", "hostname",
      "sudo -l", "sudo find . -exec /bin/sh \\; -quit",
      "find / -perm -4000 2>/dev/null", "crontab -l",
      "strings ", "hexdump -C ", "xxd ", "ps", "echo ", "exit",
    ];
    return remoteCmds.filter((c) => c.startsWith(trimmed));
  }

  // Caso geral (sem SSH session)
  const baseCompletions = [
    "ifconfig", "ip a",
    "ping ", "traceroute ", "host ", "nslookup ",
    "arp -a", "dig ", "dig TXT ", "dig +short ", "dig -x ", "whois ",
    "nmap -sn ", "nmap -sV ", "nmap -O ", "nmap -A ", "nmap -p ", "nmap --top-ports 100 ",
    "nmap --script vuln ", "nmap ",
    "searchsploit ",
    "curl http://", "curl -I http://", "curl -u ", "wget http://",
    "nc ", "telnet ", "ssh ", "sshpass -p ",
    "hydra -l ", "hydra -L ",
    "dnsrecon -d ",
    "enum4linux ",
    "smbclient -L ", "smbclient //",
    "openssl s_client -connect ",
    "wireshark",
    "netstat -tuln", "tcpdump", "tcpdump -i eth0", "tcpdump host ", "tcpdump port ",
    "report",
    "help", "clear", "reset",
  ];
  return baseCompletions.filter((c) => c.startsWith(trimmed));
};

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
  {
    id: 6,
    title: "Brute Force & SMB Enum",
    briefing: "Recon te dá portas abertas — mas o que tem POR TRÁS delas? Nesse nível você vai forçar autenticação fraca com hydra, descobrir subdomínios escondidos com dnsrecon, e enumerar shares SMB para achar credenciais que ninguém deveria ter deixado expostas.",
    starter: () => {
      const s = initialNet();
      // pré-descoberto: já passou pelos níveis anteriores
      s.discovered.add("192.168.1.50");
      s.discovered.add("192.168.1.77");
      s.discovered.add("192.168.1.100");
      s.discovered.add("192.168.1.150");
      s.scanned.add("192.168.1.100");
      s.scanned.add("192.168.1.150");
      return s;
    },
    missions: [
      {
        id: "dnsrecon",
        title: "Enumere os subdomínios de corp.local com dnsrecon",
        hint: "dnsrecon -d corp.local",
        check: (s) => s.flags.has("subdomain-enum-done"),
      },
      {
        id: "hydra-iot",
        title: "Quebre o login da câmera IoT (.150) com hydra (HTTP basic, admin/admin é padrão)",
        hint: "hydra -l admin -P pass.txt http-get://192.168.1.150",
        check: (s) => s.flags.has("hydra-cracked-192.168.1.150-http-get") || s.flags.has("CTF{weak_password_was_dictionary_listed}"),
      },
      {
        id: "enum4linux",
        title: "Enumere o servidor Windows (.100) — descubra users e shares SMB",
        hint: "enum4linux 192.168.1.100",
        check: (s) => s.flags.has("smb-enum-192.168.1.100"),
      },
      {
        id: "smbclient",
        title: "Conecte no share 'Backups' anonimamente e leia os arquivos",
        hint: "smbclient //192.168.1.100/Backups -N",
        check: (s) => s.flags.has("CTF{smb_backup_share_was_world_readable}"),
      },
      {
        id: "ssh-creds",
        title: "Use as credenciais vazadas no .env.bak para logar via SSH no DB",
        hint: "sshpass -p postgres ssh postgres@192.168.1.77",
        check: (s) => s.flags.has("ssh-login-192.168.1.77"),
      },
    ],
  },
  {
    id: 7,
    title: "Dentro do Servidor: Privilege Escalation",
    briefing: "Você logou no DB como 'postgres' usando creds vazadas. Mas user comum não te leva longe — quer ver o /root/flag.txt? Enumere o que tem de errado: SUIDs frouxos, sudo NOPASSWD, cron jobs vulneráveis. O caminho clássico do privesc Linux.",
    starter: () => {
      const s = initialNet();
      // pré-popular: descoberta + scan + sessão SSH como postgres@.77
      s.discovered.add("192.168.1.77");
      s.scanned.add("192.168.1.77");
      s.flags.add("ssh-login-192.168.1.77");
      s.sshSession = { ip: "192.168.1.77", user: "postgres", cwd: "/home/postgres" };
      return s;
    },
    missions: [
      {
        id: "ls-home",
        title: "Veja o que tem na sua home (use 'ls -la')",
        hint: "ls -la",
        check: (s) => !!s.sshSession, // qualquer comando funciona pois marca uso do shell
      },
      {
        id: "read-history",
        title: "Leia o .bash_history do usuário anterior — tem pistas",
        hint: "cat .bash_history",
        check: (s) => s.flags.has("CTF{root_via_sudo_nopasswd_find}") || true, // avança ao fazer cat
      },
      {
        id: "sudo-l",
        title: "Veja o que pode rodar com sudo: sudo -l",
        hint: "sudo -l",
        check: (s) => s.flags.has("sudo-l-seen-192.168.1.77"),
      },
      {
        id: "find-suid",
        title: "Liste binários SUID — outra rota de privesc",
        hint: "find / -perm -4000 2>/dev/null",
        check: (s) => s.flags.has("suid-listed-192.168.1.77"),
      },
      {
        id: "escalate",
        title: "Use o GTFOBins clássico do find para escalar para root",
        hint: "sudo find . -exec /bin/sh \\; -quit",
        check: (s) => s.flags.has("root-shell-192.168.1.77"),
      },
      {
        id: "root-flag",
        title: "Leia /root/flag.txt — ganhou o privesc",
        hint: "cat /root/flag.txt",
        check: (s) => s.flags.has("CTF{root_via_sudo_nopasswd_find}"),
      },
    ],
  },
  {
    id: 8,
    title: "Análise Forense de Captura",
    briefing: "O IDS gravou um arquivo capture.pcap durante um incidente. Use o Wireshark integrado para filtrar pacotes, achar a credencial em texto puro que o atacante usou, e identificar o IP suspeito. Comece gerando tráfego com ping/curl/nc — depois 'wireshark' abre o analisador visual.",
    starter: () => {
      const s = initialNet();
      // adiciona host fictício "atacante" pra missão
      s.hosts["192.168.1.99"] = {
        ip: "192.168.1.99", hostname: "kali-attacker.evil", os: "Kali Linux 2024", status: "up",
        ports: [
          { port: 22, state: "open", service: "ssh", version: "OpenSSH 9.0" },
          { port: 4444, state: "open", service: "shell-handler", banner: "Metasploit reverse shell handler — porta de C2" },
        ],
      };
      s.dnsCache["kali-attacker.evil"] = "192.168.1.99";
      // pré-popular alguns pacotes interessantes (cenário pré-gravado)
      s.discovered.add("192.168.1.50");
      s.discovered.add("192.168.1.100");
      s.scanned.add("192.168.1.100");
      const now = Date.now();
      s.packetLog = [
        { id: 1, from: "192.168.1.99", to: "192.168.1.1", proto: "DNS", port: 53, info: "Standard query 0x4a3f A web.corp.local", ts: now - 30000 },
        { id: 2, from: "192.168.1.1", to: "192.168.1.99", proto: "DNS", port: 53, info: "Standard query response 0x4a3f A web.corp.local A 192.168.1.50", ts: now - 29800 },
        { id: 3, from: "192.168.1.99", to: "192.168.1.50", proto: "TCP", port: 80, info: "Flags [S], seq 0, length 0", ts: now - 29500 },
        { id: 4, from: "192.168.1.50", to: "192.168.1.99", proto: "TCP", port: 80, info: "Flags [S.], seq 1, ack 1, length 0", ts: now - 29400 },
        { id: 5, from: "192.168.1.99", to: "192.168.1.50", proto: "HTTP", port: 80, info: "GET / HTTP/1.1 — User-Agent: curl/7.88.1", ts: now - 29000 },
        { id: 6, from: "192.168.1.50", to: "192.168.1.99", proto: "HTTP", port: 80, info: "HTTP/1.1 200 OK Content-Type: text/html", ts: now - 28800 },
        { id: 7, from: "192.168.1.99", to: "192.168.1.50", proto: "HTTP", port: 80, info: "POST /admin/login HTTP/1.1 user=admin&pass=hunter2 — body length 27", ts: now - 27000 },
        { id: 8, from: "192.168.1.50", to: "192.168.1.99", proto: "HTTP", port: 80, info: "HTTP/1.1 302 Found Set-Cookie: SESSIONID=8a3f91...; Path=/", ts: now - 26800 },
        { id: 9, from: "192.168.1.99", to: "192.168.1.100", proto: "TCP", port: 21, info: "Flags [S], seq 0, length 0", ts: now - 25000 },
        { id: 10, from: "192.168.1.100", to: "192.168.1.99", proto: "FTP", port: 21, info: "220 vsftpd 2.3.4 ready", ts: now - 24800 },
        { id: 11, from: "192.168.1.99", to: "192.168.1.100", proto: "FTP", port: 21, info: "USER anonymous", ts: now - 24500 },
        { id: 12, from: "192.168.1.100", to: "192.168.1.99", proto: "FTP", port: 21, info: "331 Please specify the password.", ts: now - 24300 },
        { id: 13, from: "192.168.1.99", to: "192.168.1.100", proto: "FTP", port: 21, info: "PASS attacker@evil.com", ts: now - 24100 },
        { id: 14, from: "192.168.1.100", to: "192.168.1.99", proto: "FTP", port: 21, info: "230 Login successful.", ts: now - 23900 },
        { id: 15, from: "192.168.1.99", to: "192.168.1.100", proto: "TCP", port: 4444, info: "Flags [P.], seq 1, length 1340 — payload looks like reverse shell handshake", ts: now - 22000 },
      ];
      return s;
    },
    missions: [
      {
        id: "open",
        title: "Abra o Wireshark para analisar a captura",
        hint: "wireshark",
        check: (s) => s.packetLog.length > 0 && s.flags.has("wireshark-opened") || true,
      },
      {
        id: "find-cred",
        title: "Filtre por HTTP e encontre o POST /admin/login com a credencial em texto puro",
        hint: "use o filtro 'http' no modal",
        check: (s) => s.flags.has("forensic-cred-found"),
      },
      {
        id: "find-attacker",
        title: "Identifique o IP do atacante (faça curl no IP 99 pra confirmar a presença na rede)",
        hint: "ping 192.168.1.99 ou curl http://192.168.1.99",
        check: (s) => s.flags.has("forensic-attacker-id"),
      },
      {
        id: "report-final",
        title: "Gere o relatório final do incidente",
        hint: "report",
        check: (s) => s.flags.has("investigation-done"),
      },
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
  const [showWireshark, setShowWireshark] = useState(false);
  const [wsFilter, setWsFilter] = useState("");
  const [wsSelectedPacket, setWsSelectedPacket] = useState<number | null>(null);
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

  // ===== Shell pós-SSH: executa comandos no contexto do host remoto =====
  const runRemoteShell = (cmd: string) => {
    const sess = state.sshSession;
    if (!sess) return;
    const h = state.hosts[sess.ip];
    const fs = h?.victimFs;
    if (!fs) {
      err("(simulador: host remoto sem filesystem definido)");
      return;
    }
    const args = cmd.split(/\s+/).filter(Boolean);
    const c = (args[0] ?? "").toLowerCase();

    // resolver path relativo ao cwd
    const resolvePath = (p: string): string => {
      if (!p) return sess.cwd;
      if (p.startsWith("/")) return p;
      if (p === "~") return `/home/${sess.user}`;
      if (p.startsWith("~/")) return `/home/${sess.user}/${p.slice(2)}`;
      // relativo
      const parts = (sess.cwd + "/" + p).split("/").filter(Boolean);
      const stack: string[] = [];
      for (const part of parts) {
        if (part === ".") continue;
        if (part === "..") stack.pop();
        else stack.push(part);
      }
      return "/" + stack.join("/");
    };

    setLines((l) => [...l, { type: "in", text: `${sess.user}@${h.hostname ?? sess.ip}:${sess.cwd === `/home/${sess.user}` ? "~" : sess.cwd}$ ${cmd}` }]);

    // exit
    if (c === "exit" || c === "logout") {
      setLines((l) => [...l, { type: "info", text: `logout` }]);
      setLines((l) => [...l, { type: "info", text: `Connection to ${sess.ip} closed.` }]);
      setState((s) => ({ ...s, sshSession: undefined }));
      return;
    }

    // pwd
    if (c === "pwd") { out(sess.cwd); return; }

    // whoami / id
    if (c === "whoami") { out(sess.user); return; }
    if (c === "id") {
      const uid = sess.user === "root" ? 0 : sess.user === "postgres" ? 999 : 1000;
      out(`uid=${uid}(${sess.user}) gid=${uid}(${sess.user}) groups=${uid}(${sess.user})`);
      return;
    }

    // hostname
    if (c === "hostname") { out(h.hostname ?? sess.ip); return; }

    // uname
    if (c === "uname") {
      const aFlag = args.includes("-a");
      out(aFlag ? `Linux ${h.hostname ?? "host"} 5.15.0-92-generic #102-Ubuntu SMP x86_64 GNU/Linux` : "Linux");
      return;
    }

    // cd
    if (c === "cd") {
      const target = resolvePath(args[1] ?? `/home/${sess.user}`);
      // valida se algum arquivo existe nesse path ou se é prefixo de algum
      const dirExists = target === "/" || Object.keys(fs.files).some((f) => f === target || f.startsWith(target + "/"));
      if (!dirExists) { err(`bash: cd: ${args[1]}: No such file or directory`); return; }
      setState((s) => s.sshSession ? { ...s, sshSession: { ...s.sshSession, cwd: target } } : s);
      return;
    }

    // ls (com -la)
    if (c === "ls") {
      const showAll = args.some((a) => a.includes("a"));
      const longFmt = args.some((a) => a.includes("l"));
      const target = args.find((a, i) => i > 0 && !a.startsWith("-"));
      const dir = target ? resolvePath(target) : sess.cwd;
      // entradas diretas naquela pasta
      const entries: { name: string; full: string; meta?: typeof fs.files[string] }[] = [];
      const seen = new Set<string>();
      Object.keys(fs.files).forEach((path) => {
        if (path === dir) {
          // arquivo exato — ls mostra ele só
          if (!seen.has(path)) { entries.push({ name: path.split("/").pop()!, full: path, meta: fs.files[path] }); seen.add(path); }
        } else if (path.startsWith(dir + "/") || (dir === "/" && path.startsWith("/"))) {
          const rest = path.slice(dir === "/" ? 1 : dir.length + 1);
          const head = rest.split("/")[0];
          if (!head) return;
          const full = dir === "/" ? "/" + head : dir + "/" + head;
          if (!seen.has(full)) {
            const isDir = rest.includes("/");
            entries.push({ name: head, full, meta: isDir ? { isDir: true, owner: "root", perm: "rwxr-xr-x" } : fs.files[full] });
            seen.add(full);
          }
        }
      });
      const sorted = entries.sort((a, b) => a.name.localeCompare(b.name)).filter((e) => showAll || !e.name.startsWith("."));
      if (!sorted.length) { out("(diretório vazio)"); return; }
      if (longFmt) {
        out(`total ${sorted.length * 4}`);
        sorted.forEach((e) => {
          const isDir = e.meta?.isDir;
          const perm = (isDir ? "drwxr-xr-x" : (e.meta?.perm ?? "rw-r--r--").padStart(10, "-")).slice(0, 10);
          const owner = (e.meta?.owner ?? "user").padEnd(8);
          const size = String(e.meta?.size ?? (e.meta?.content?.length ?? 4096)).padStart(7);
          out(`${perm}  1 ${owner} ${owner} ${size} Jan 14 10:23 ${e.name}${isDir ? "/" : ""}`);
        });
      } else {
        out(sorted.map((e) => e.meta?.isDir ? `\x1b[34m${e.name}/\x1b[0m` : (e.meta?.suid ? `\x1b[31m${e.name}\x1b[0m` : e.name)).join("  "));
      }
      return;
    }

    // cat <arq>
    if (c === "cat") {
      const target = args[1];
      if (!target) { err("Uso: cat <arquivo>"); return; }
      const path = resolvePath(target);
      const file = fs.files[path];
      if (!file) { err(`cat: ${target}: No such file or directory`); return; }
      // checagem de permissão simples
      if (file.perm?.startsWith("----------") && sess.user !== "root") {
        err(`cat: ${target}: Permission denied`);
        return;
      }
      if (file.bin) { err(`cat: ${target}: binary file (use 'strings' or 'hexdump')`); return; }
      const content = file.content ?? "";
      content.split("\n").forEach((l) => out(l));
      // capturar flags
      const m = content.match(/CTF\{[^}]+\}/g);
      if (m) setState((s) => { const f = new Set(s.flags); m.forEach((x) => f.add(x)); return { ...s, flags: f }; });
      return;
    }

    // sudo -l
    if (c === "sudo" && args[1] === "-l") {
      out(`Matching Defaults entries for ${sess.user} on ${h.hostname ?? sess.ip}:`);
      out(`    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin`);
      out(``);
      out(`User ${sess.user} may run the following commands on ${h.hostname ?? sess.ip}:`);
      if (!fs.sudoers || fs.sudoers.length === 0) { out(`    (none)`); return; }
      fs.sudoers.forEach((su) => {
        out(`    ${su.nopasswd ? "(ALL : ALL) NOPASSWD: " : "(ALL : ALL) "}${su.binary}`);
      });
      setState((s) => { const f = new Set(s.flags); f.add(`sudo-l-seen-${sess.ip}`); return { ...s, flags: f }; });
      return;
    }

    // sudo find ... (privesc clássico GTFOBins)
    if (c === "sudo" && args[1] === "find") {
      const isFindSudoer = fs.sudoers?.some((su) => su.binary === "/usr/bin/find" && su.nopasswd);
      if (!isFindSudoer) {
        err(`[sudo] password for ${sess.user}:`);
        err(`Sorry, user ${sess.user} is not allowed to execute 'find ...' as root.`);
        return;
      }
      // detectar -exec /bin/sh ou similar (escape para root shell)
      const isShellEscape = args.some((a, i) => a === "-exec" && /\/bin\/(sh|bash)/.test(args[i + 1] ?? ""));
      if (isShellEscape) {
        out(`# (escalou para root via sudo find -exec /bin/sh — você é root agora!)`);
        if (fs.rootFlag) {
          setState((s) => { const f = new Set(s.flags); f.add(fs.rootFlag!); f.add(`root-shell-${sess.ip}`); return { ...s, flags: f }; });
          out(`# cat /root/flag.txt`);
          out(fs.rootFlag);
          out(``);
          out(`# (sessão elevada — comandos seguintes rodam como root)`);
        }
        // promover sessão a root
        setState((s) => s.sshSession ? { ...s, sshSession: { ...s.sshSession, user: "root", cwd: "/root" } } : s);
        return;
      }
      out(`(simulado: find executou. Use '-exec /bin/sh \\;' para escalar para root shell.)`);
      return;
    }

    // find / -perm -4000 (lista SUIDs)
    if (c === "find") {
      const wantsSuid = args.includes("-4000") || args.some((a) => a.startsWith("-perm"));
      if (wantsSuid) {
        Object.entries(fs.files).filter(([, f]) => f.suid).forEach(([path]) => out(path));
        setState((s) => { const f = new Set(s.flags); f.add(`suid-listed-${sess.ip}`); return { ...s, flags: f }; });
        return;
      }
      out("(use 'find / -perm -4000 2>/dev/null' para listar binários SUID)");
      return;
    }

    // crontab -l / cat /etc/crontab
    if (c === "crontab" && args[1] === "-l") {
      out(`# m h dom mon dow command`);
      out(`(no crontab for ${sess.user})`);
      return;
    }
    // (cat /etc/crontab via cat handler já funciona)

    // strings <arq>
    if (c === "strings") {
      const target = args[1];
      if (!target) { err("Uso: strings <arquivo>"); return; }
      const path = resolvePath(target);
      const file = fs.files[path];
      if (!file) { err(`strings: '${target}': No such file`); return; }
      const content = file.content ?? `(binary blob ~${file.size ?? 0} bytes)`;
      // simula extração de strings imprimíveis: basicamente split por \n + ruído
      ["ELF", "GNU C Library", "/lib64/ld-linux-x86-64.so.2", "__libc_start_main"].forEach((s) => out(s));
      content.split(/[\n\0]+/).filter((l) => l.trim().length >= 4).forEach((l) => out(l));
      return;
    }

    // hexdump -C <arq>
    if (c === "hexdump" || c === "xxd") {
      const target = args[args.length - 1];
      if (!target || target.startsWith("-")) { err(`Uso: ${c} -C <arquivo>`); return; }
      const path = resolvePath(target);
      const file = fs.files[path];
      if (!file) { err(`${c}: '${target}': No such file`); return; }
      const content = file.content ?? `binary content placeholder`;
      const bytes = Array.from(content.slice(0, 64)).map((ch) => ch.charCodeAt(0));
      for (let i = 0; i < bytes.length; i += 16) {
        const slice = bytes.slice(i, i + 16);
        const hex = slice.map((b) => b.toString(16).padStart(2, "0")).join(" ").padEnd(48);
        const ascii = slice.map((b) => b >= 32 && b < 127 ? String.fromCharCode(b) : ".").join("");
        out(`${i.toString(16).padStart(8, "0")}  ${hex}  |${ascii}|`);
      }
      if (content.length > 64) out(`... (truncado: ${content.length} bytes total)`);
      return;
    }

    // echo
    if (c === "echo") { out(args.slice(1).join(" ").replace(/^["']|["']$/g, "")); return; }

    // ps
    if (c === "ps") {
      out(`  PID TTY          TIME CMD`);
      out(`    1 ?        00:00:01 systemd`);
      out(`  423 ?        00:00:00 sshd`);
      out(`  892 ?        00:00:00 postgres`);
      out(` 1024 pts/0    00:00:00 bash`);
      out(` 1042 pts/0    00:00:00 ps`);
      return;
    }

    err(`-bash: ${c}: command not found`);
    out(`(comandos disponíveis no shell remoto: ls, cat, cd, pwd, whoami, id, uname, sudo -l, sudo find, find, crontab -l, strings, hexdump, ps, echo, exit)`);
  };

  const run = (raw: string) => {
    const cmd = raw.trim().replace(/\s+/g, " ");
    setLines((l) => [...l, { type: "in", text: `$ ${cmd}` }]);
    if (!cmd) return;
    if (cmd !== history[history.length - 1]) setHistory((h) => [...h, cmd]);
    setHistoryIdx(-1);

    const cmdLower = cmd.toLowerCase();
    if (cmdLower === "clear") { setLines([]); return; }
    if (cmdLower === "reset") { resetLevel(); return; }

    // ===== SHELL PÓS-SSH (Fase 3) =====
    // Quando sshSession está ativa, comandos rodam no host remoto
    if (state.sshSession && cmdLower !== "help") {
      runRemoteShell(cmd);
      return;
    }

    if (cmdLower === "help") {
      out("Comandos suportados (case-insensitive):");
      out("");
      out("  RECONHECIMENTO");
      out("  ifconfig | ip a                       sua interface de rede");
      out("  ping <ip|host>                        ICMP echo");
      out("  traceroute <host> | tracert           rastreia caminho");
      out("  arp -a                                vizinhos no segmento");
      out("");
      out("  DNS");
      out("  host <domain>                         resolução enxuta");
      out("  nslookup <host>                       resolve via DNS");
      out("  dig [TXT|MX|NS|+short] <host>         query DNS detalhada");
      out("  dig -x <ip>                           reverse DNS (PTR)");
      out("  whois <domain>                        registro do domínio");
      out("");
      out("  PORT SCAN");
      out("  nmap [-sn|-sV|-O|-A] <ip|cidr>        varredura completa");
      out("  nmap [-sS|-sT|-sU] <ip>               tipo de scan (SYN/Connect/UDP)");
      out("  nmap -p <portas> <ip>                 ranges: 22,80,443  ou  1-1000  ou  -");
      out("  nmap --top-ports <N> <ip>             N portas mais comuns");
      out("");
      out("  INTERAÇÃO COM SERVIÇOS");
      out("  curl [-u user:pass] [-I] <url>        HTTP (URL pode omitir http://)");
      out("  wget <url>                            alias de curl");
      out("  nc <ip> <port> | telnet <ip> <port>   conexão TCP raw / banner grab");
      out("  ssh <user@ip>                         tentativa interativa (vai falhar)");
      out("  sshpass -p <senha> ssh <user@ip>      autenticação não-interativa");
      out("");
      out("  ENUMERAÇÃO AVANÇADA");
      out("  dnsrecon -d <domain>                  enum DNS + brute subdomains");
      out("  enum4linux <ip>                       enum SMB (workgroup/users/shares)");
      out("  smbclient -L <ip> -N                  lista shares SMB anonimamente");
      out("  smbclient //<ip>/<share> -N           conecta no share");
      out("  nmap --script vuln <ip>               NSE scripts de vulnerabilidades");
      out("  nmap --script smb-vuln-* <ip>         scripts SMB específicos");
      out("");
      out("  EXPLOITATION & FORENSE");
      out("  hydra -l <user> -P <wl> <proto>://<ip>   brute force (ssh/ftp/http)");
      out("  searchsploit <termo|ip|cve>           busca CVEs/exploits");
      out("  netstat -tuln                         conexões locais (dinâmico)");
      out("  tcpdump [host X] [port N] [-c N]      captura de pacotes (real)");
      out("  wireshark                             abre análise visual de pacotes (modal)");
      out("  openssl s_client -connect <host>:<port>  inspeciona certificado TLS");
      out("  report                                relatório final");
      out("");
      out("  PÓS-EXPLORAÇÃO (após sshpass bem-sucedido)");
      out("  ls/ls -la, cat, cd, pwd, whoami, id, uname -a, hostname, ps");
      out("  sudo -l                               vê o que pode rodar com sudo");
      out("  find / -perm -4000 2>/dev/null        lista binários SUID");
      out("  sudo find . -exec /bin/sh \\;          escala para root (GTFOBins)");
      out("  strings <arq>, hexdump -C <arq>       análise de binários/arquivos");
      out("  exit                                  sai do shell remoto");
      out("");
      out("  clear | reset | help");
      out("Atalhos: ↑/↓ histórico  •  Tab autocomplete contextual  •  clique nos hosts do mapa");
      return;
    }

    const args = cmd.split(/\s+/).filter(Boolean);
    const c = (args[0] ?? "").toLowerCase();

    setState((s) => {
      const next = {
        ...s,
        hosts: { ...s.hosts },
        discovered: new Set(s.discovered),
        scanned: new Set(s.scanned),
        flags: new Set(s.flags),
        packetLog: [...s.packetLog],
        connections: [...s.connections],
      };

      // Helper local: registrar pacote no log persistente p/ tcpdump
      const logPacket = (from: string, to: string, proto: PacketLog["proto"], info: string, port?: number) => {
        next.packetLog.push({
          id: next.packetLog.length + 1,
          from, to, proto, port, info,
          ts: Date.now(),
        });
        // mantém só últimos 200 pra não estourar memória
        if (next.packetLog.length > 200) next.packetLog = next.packetLog.slice(-200);
      };

      // Helper local: registrar/atualizar conexão p/ netstat
      const trackConnection = (remoteIp: string, remotePort: number, service: string, proto: "tcp" | "udp" = "tcp", state: Connection["state"] = "ESTABLISHED") => {
        next.connections = next.connections.filter((c) => Date.now() - c.ts < 60000); // expira em 1min
        next.connections.push({
          proto,
          localPort: 40000 + Math.floor(Math.random() * 20000),
          remoteIp, remotePort, service, state,
          ts: Date.now(),
        });
      };

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
        for (let i = 1; i <= 3; i++) {
          logPacket(s.myIp, ip, "ICMP", `echo request, id 1, seq ${i}, length 64`);
          logPacket(ip, s.myIp, "ICMP", `echo reply, id 1, seq ${i}, length 64`);
        }
        out(`PING ${target} (${ip}) 56(84) bytes of data.`);
        for (let i = 1; i <= 3; i++) out(`64 bytes from ${ip}: icmp_seq=${i} ttl=${ip === "8.8.8.8" ? 117 : 64} time=${(Math.random() * 20 + 0.3).toFixed(1)} ms`);
        out(``);
        out(`--- ${target} ping statistics ---`);
        out(`3 packets transmitted, 3 received, 0% packet loss, time 2003ms`);
        next.discovered.add(ip);
        if (ip === "192.168.1.99") next.flags.add("forensic-attacker-id");
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

      // nmap — agora com ranges, top-ports, -O, -sS/-sT/-sU, CIDR genérico, --script
      if (c === "nmap") {
        const rest = args.slice(1);
        const flags = rest.filter((a) => a.startsWith("-"));
        const isHostDiscovery = flags.includes("-sn");
        const isVersion = flags.includes("-sV") || flags.includes("-A");
        const isOsDetect = flags.includes("-O") || flags.includes("-A");
        const scanType =
          flags.includes("-sS") ? "TCP SYN Scan" :
          flags.includes("-sT") ? "TCP Connect Scan" :
          flags.includes("-sU") ? "UDP Scan" :
          "TCP Default Scan";
        const isUdp = flags.includes("-sU");
        // --script vuln / smb-vuln-ms17-010 / etc
        const scriptIdx = rest.findIndex((a) => a === "--script" || a.startsWith("--script="));
        const scriptArg = scriptIdx !== -1
          ? (rest[scriptIdx].includes("=") ? rest[scriptIdx].split("=")[1] : rest[scriptIdx + 1])
          : null;
        const useScripts = scriptArg !== null;

        // Parsear -p ranges: -p 22, -p 22,80, -p 1-1000, -p- (todas), --top-ports N
        let portFilter: number[] | null = null;
        const pIdx = rest.findIndex((a) => a === "-p" || a.startsWith("-p"));
        const topIdx = rest.indexOf("--top-ports");
        if (pIdx !== -1) {
          const portStr = rest[pIdx] === "-p" ? rest[pIdx + 1] : rest[pIdx].slice(2);
          if (portStr === "-" || rest[pIdx] === "-p-") {
            // todas as portas — aceita
            portFilter = null;
          } else if (portStr) {
            const parts = portStr.split(",");
            const expanded: number[] = [];
            parts.forEach((p) => {
              const m = p.match(/^(\d+)-(\d+)$/);
              if (m) {
                const a0 = Number(m[1]), b0 = Number(m[2]);
                for (let n = a0; n <= b0 && expanded.length < 5000; n++) expanded.push(n);
              } else {
                const n = Number(p);
                if (!isNaN(n)) expanded.push(n);
              }
            });
            portFilter = expanded;
          }
        } else if (topIdx !== -1 && rest[topIdx + 1]) {
          const top = Number(rest[topIdx + 1]);
          // top-N portas comuns
          const TOP = [80, 23, 443, 21, 22, 25, 3389, 110, 445, 139, 143, 53, 135, 3306, 8080, 1723, 111, 995, 993, 5900, 1025, 587, 8888, 199, 1720, 113, 81, 465, 5432, 6379];
          portFilter = TOP.slice(0, isNaN(top) ? 100 : top);
        }

        // Targets: pode ser IP único, CIDR, ou hostname resolvível
        const nonFlagArgs = rest.filter((a, i) => {
          if (a.startsWith("-")) return false;
          // descartar valores de flags que esperam argumento
          const prev = rest[i - 1];
          if (prev === "-p" || prev === "--top-ports") return false;
          return true;
        });
        const cidr = nonFlagArgs.find((t) => t.includes("/"));
        const singleIp = nonFlagArgs.find((t) => /^\d+\.\d+\.\d+\.\d+$/.test(t));
        const hostnameTarget = nonFlagArgs.find((t) => !t.includes("/") && !/^\d+\.\d+\.\d+\.\d+$/.test(t));

        out(`Starting Nmap 7.94 ( https://nmap.org )`);
        if (scanType !== "TCP Default Scan") out(`(${scanType})`);

        // CIDR: filtra hosts cujo IP cai no range
        if (cidr || isHostDiscovery) {
          const cidrStr = cidr ?? s.subnet;
          const cidrMatch = cidrStr.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
          let matchHosts: Host[] = [];
          if (cidrMatch) {
            const [a0, b0, c0] = cidrMatch[1].split(".").map(Number);
            const mask = Number(cidrMatch[2]);
            // pra simplicidade, suportamos /24 como prefixo a.b.c.* e /16 como a.b.*
            if (mask === 24) matchHosts = Object.values(s.hosts).filter((h) => h.ip.startsWith(`${a0}.${b0}.${c0}.`));
            else if (mask === 16) matchHosts = Object.values(s.hosts).filter((h) => h.ip.startsWith(`${a0}.${b0}.`));
            else if (mask === 8) matchHosts = Object.values(s.hosts).filter((h) => h.ip.startsWith(`${a0}.`));
            else matchHosts = Object.values(s.hosts).filter((h) => h.ip.startsWith(`${a0}.${b0}.${c0}.`));
          } else {
            matchHosts = Object.values(s.hosts).filter((h) => h.ip.startsWith("192.168.1."));
          }
          out(`Nmap scan report for ${cidrStr}`);
          matchHosts.forEach((h) => {
            launchPacket(s.myIp, h.ip, "icmp");
            logPacket(s.myIp, h.ip, "ICMP", `host discovery probe`);
            out(`Nmap scan report for ${h.hostname ?? h.ip} (${h.ip})`);
            out(`Host is up (${(Math.random() * 0.05).toFixed(4)}s latency).`);
            next.discovered.add(h.ip);
          });
          const totalIps = cidrMatch ? Math.pow(2, 32 - Number(cidrMatch[2])) : 256;
          out(`Nmap done: ${totalIps} IP addresses (${matchHosts.length} hosts up) scanned in ${(matchHosts.length * 0.4 + 1).toFixed(2)} seconds`);
          return next;
        }

        // Resolver hostname se não veio IP cru
        const targetIp = singleIp ?? (hostnameTarget ? resolve(s, hostnameTarget) : null);
        if (targetIp) {
          const h = s.hosts[targetIp];
          if (!h) { err(`Note: Host seems down.`); return s; }
          launchPacket(s.myIp, h.ip, "tcp");
          logPacket(s.myIp, h.ip, isUdp ? "UDP" : "TCP", `${scanType} probe`);
          out(`Nmap scan report for ${h.hostname ?? h.ip} (${h.ip})`);
          out(`Host is up (${(Math.random() * 0.05).toFixed(4)}s latency).`);
          const portsToShow = portFilter
            ? h.ports.filter((p) => portFilter!.includes(p.port))
            : h.ports.filter((p) => p.state !== "closed");
          const totalScanned = portFilter ? portFilter.length : 1000;
          if (!portsToShow.length) {
            out(`All ${totalScanned} scanned ports on ${h.hostname ?? h.ip} are closed`);
          } else {
            const closedCount = totalScanned - portsToShow.length;
            if (closedCount > 0) out(`Not shown: ${closedCount} closed ports`);
            out(`PORT     STATE     SERVICE      ${isVersion ? "VERSION" : ""}`);
            portsToShow.forEach((p) => {
              const portStr = `${p.port}/${isUdp ? "udp" : "tcp"}`.padEnd(9);
              const state = p.state.padEnd(10);
              const service = p.service.padEnd(13);
              out(`${portStr}${state}${service}${isVersion ? p.version ?? "" : ""}`);
            });
          }
          if (isVersion) out(`Service detection performed.`);
          out(`MAC Address: ${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)}:${Math.random().toString(16).slice(2, 4)} (${h.vendor ?? "Unknown"})`);
          if (isOsDetect && h.os) {
            out(`Device type: general purpose`);
            out(`Running: ${h.os}`);
            out(`OS CPE: cpe:/o:${h.os.toLowerCase().replace(/\s+/g, "_")}`);
            out(`OS details: ${h.os}`);
            out(`Network Distance: 1 hop`);
          } else if (isVersion && h.os) {
            out(`OS guess: ${h.os}`);
          }
          // NSE scripts (--script vuln / smb-vuln-* / http-* / ftp-anon)
          if (useScripts) {
            out(``);
            out(`Host script results:`);
            const allCves = portsToShow.flatMap((p) => (p.cves ?? []).map((cve) => ({ port: p.port, service: p.service, cve })));
            const wantsVuln = scriptArg === "vuln" || scriptArg?.includes("vuln") || scriptArg === "default";
            const wantsSmb = scriptArg?.includes("smb") || wantsVuln;
            const wantsHttp = scriptArg?.includes("http") || wantsVuln;
            const wantsFtp = scriptArg?.includes("ftp") || wantsVuln;

            if (wantsSmb && portsToShow.some((p) => p.port === 445)) {
              const eb = allCves.find((c) => c.cve.includes("MS17-010") || c.cve.includes("CVE-2017-0144"));
              if (eb) {
                out(`| smb-vuln-ms17-010:`);
                out(`|   VULNERABLE:`);
                out(`|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)`);
                out(`|     State: VULNERABLE`);
                out(`|     IDs:  CVE:CVE-2017-0144`);
                out(`|_    Risk factor: HIGH  CVSSv3: 8.1`);
                next.flags.add(`nse-vuln-${h.ip}-ms17-010`);
              }
            }
            if (wantsFtp && portsToShow.some((p) => p.port === 21 && p.service === "ftp")) {
              out(`| ftp-anon: Anonymous FTP login allowed (FTP code 230)`);
              out(`|_  drwxr-xr-x   2 0   0   4096 Jan 14 10:23 pub`);
              const vsftpd = allCves.find((c) => c.cve.includes("CVE-2011-2523"));
              if (vsftpd) {
                out(`| ftp-vsftpd-backdoor:`);
                out(`|   VULNERABLE:`);
                out(`|   vsftpd 2.3.4 Backdoor`);
                out(`|     State: VULNERABLE (Exploitable)`);
                out(`|     IDs:  CVE:CVE-2011-2523`);
                out(`|_    Risk factor: CRITICAL  CVSSv2: 10.0`);
                next.flags.add(`nse-vuln-${h.ip}-vsftpd-backdoor`);
              }
            }
            if (wantsHttp && portsToShow.some((p) => p.port === 80 || p.port === 443)) {
              const boa = allCves.find((c) => c.cve.includes("CVE-2017-9833"));
              if (boa) {
                out(`| http-vuln-cve2017-9833:`);
                out(`|   VULNERABLE:`);
                out(`|   Boa webserver path traversal`);
                out(`|     State: VULNERABLE`);
                out(`|_    IDs:  CVE:CVE-2017-9833`);
                next.flags.add(`nse-vuln-${h.ip}-boa-traversal`);
              }
              out(`| http-enum:`);
              if (h.webPaths) {
                Object.keys(h.webPaths).filter((p) => p !== "/").forEach((p) => {
                  out(`|   ${p}: Possibly interesting endpoint`);
                });
              }
              out(`|_  /robots.txt: Disallow entries leak admin/.git paths`);
            }
            if (allCves.length === 0 && !wantsSmb && !wantsHttp && !wantsFtp) {
              out(`(nenhum NSE script bateu — tente --script vuln em host vulnerável)`);
            }
          }
          out(`Nmap done: 1 IP address (1 host up) scanned in ${(Math.random() * 5 + 1).toFixed(2)} seconds`);
          next.discovered.add(h.ip);
          if (isVersion || (!portFilter && !isHostDiscovery)) next.scanned.add(h.ip);
          return next;
        }

        err("nmap: alvo inválido. Use IP, hostname ou CIDR (ex: 192.168.1.0/24).");
        return s;
      }

      // curl / wget  (supports: -u user:pass, paths, -I head)
      if (c === "curl" || c === "wget") {
        const cArgs = args.slice(1);
        let userPass: { user: string; pass: string } | null = null;
        let headOnly = false;
        let urlArg: string | null = null;
        const isWget = c === "wget";
        for (let i = 0; i < cArgs.length; i++) {
          const a = cArgs[i];
          if (a === "-u" && cArgs[i + 1]) {
            const [u, p] = cArgs[++i].split(":");
            userPass = { user: u ?? "", pass: p ?? "" };
          } else if (a === "-I" || a === "--head") {
            headOnly = true;
          } else if (a === "-O" || a === "--remote-name") {
            // wget -O ou curl -O — só aceita, não muda comportamento
          } else if (!a.startsWith("-")) {
            urlArg = a;
          }
        }
        if (!urlArg) { err(`Uso: ${c} [-u user:pass] [-I] <url>`); return s; }
        // tolerância: aceitar URL sem scheme (assume http://)
        let url = urlArg;
        if (!/^https?:\/\//.test(url)) url = "http://" + url;
        const m = url.match(/^https?:\/\/([^\/:]+)(?::(\d+))?(\/[^\s]*)?/);
        if (!m) { err(`${c}: (3) URL malformada`); return s; }
        const hostRef = m[1];
        const port = m[2] ? Number(m[2]) : 80;
        const path = m[3] ?? "/";
        const ip = resolve(s, hostRef);
        if (!ip) { err(`${c}: (6) Could not resolve host: ${hostRef}`); return s; }
        const h = s.hosts[ip];
        if (!h) { err(`${c}: (7) Failed to connect to ${hostRef} port ${port}: No route`); return s; }
        const portInfo = h.ports.find((p) => p.port === port);
        if (!portInfo || portInfo.state !== "open") { err(`${c}: (7) Failed to connect to ${hostRef} port ${port}: Connection refused`); return s; }
        launchPacket(s.myIp, ip, "tcp");
        logPacket(s.myIp, ip, "HTTP", `${headOnly ? "HEAD" : "GET"} ${path} HTTP/1.1`, port);
        trackConnection(ip, port, portInfo.service);
        if (isWget) {
          out(`--${new Date().toISOString().slice(0, 19)}-- ${url}`);
          out(`Resolving ${hostRef} (${hostRef})... ${ip}`);
          out(`Connecting to ${hostRef} (${hostRef})|${ip}|:${port}... connected.`);
          out(`HTTP request sent, awaiting response... `);
        }

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

      // nc (netcat) — também aceita 'telnet <ip> <port>' como alias
      if (c === "nc" || c === "telnet") {
        const ipArg = args[1]; const portArg = Number(args[2]);
        if (!ipArg || !portArg) { err(`Uso: ${c} <ip> <porta>`); return s; }
        const ip = resolve(s, ipArg);
        if (!ip) { err(`${c}: getaddrinfo for ${ipArg} failed`); return s; }
        const h = s.hosts[ip];
        if (!h) { err(`${c}: connect to ${ipArg} port ${portArg} failed: No route`); return s; }
        const p = h.ports.find((x) => x.port === portArg);
        if (!p || p.state !== "open") { err(`${c}: connect to ${ipArg} port ${portArg} failed: Connection refused`); return s; }
        launchPacket(s.myIp, ip, "tcp");
        logPacket(s.myIp, ip, "TCP", `Flags [S], seq 0, length 0`, portArg);
        logPacket(ip, s.myIp, "TCP", `Flags [S.], seq 1, ack 1, length 0`, portArg);
        logPacket(s.myIp, ip, "TCP", `Flags [.], ack 1, length 0`, portArg);
        trackConnection(ip, portArg, p.service);
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

      // sshpass -p <senha> ssh <user@ip>  (comando real do mundo Linux)
      // ssh <user@ip>                    sem senha — falha como Git real
      if (c === "sshpass" || c === "ssh") {
        let providedPass: string | null = null;
        let user = "root";
        let target = "";
        if (c === "sshpass") {
          const pIdx = args.indexOf("-p");
          if (pIdx === -1 || !args[pIdx + 1]) { err("Uso: sshpass -p <senha> ssh <user@ip>"); return s; }
          providedPass = args[pIdx + 1];
          const sshIdx = args.indexOf("ssh");
          if (sshIdx === -1 || !args[sshIdx + 1]) { err("Uso: sshpass -p <senha> ssh <user@ip>"); return s; }
          const conn = args[sshIdx + 1];
          const mm = conn.match(/^(?:([^@]+)@)?(.+)$/);
          if (!mm) { err("ssh: formato inválido"); return s; }
          user = mm[1] ?? "root";
          target = mm[2];
        } else {
          const conn = args[1];
          if (!conn) { err("Uso: ssh <user@ip>   |   sshpass -p <senha> ssh <user@ip>"); return s; }
          const mm = conn.match(/^(?:([^@]+)@)?(.+)$/);
          if (!mm) { err("ssh: formato inválido"); return s; }
          user = mm[1] ?? "root";
          target = mm[2];
        }
        const ip = resolve(s, target);
        if (!ip) { err(`ssh: Could not resolve hostname ${target}`); return s; }
        const h = s.hosts[ip];
        const sshPort = h?.ports.find((p) => p.port === 22 && p.state === "open");
        if (!sshPort) { err(`ssh: connect to host ${target} port 22: Connection refused`); return s; }
        launchPacket(s.myIp, ip, "tcp");
        logPacket(s.myIp, ip, "SSH", `client banner exchange`, 22);
        next.discovered.add(ip);

        // verificar credenciais (defaultCreds + validCreds para SSH)
        const allCreds = [
          ...(h?.defaultCreds ? [h.defaultCreds] : []),
          ...(h?.validCreds ?? []).filter((c) => !c.protocol || c.protocol === "ssh"),
        ];
        const matchedCred = allCreds.find((c) => c.user === user && c.pass === providedPass);
        const creds = h?.defaultCreds; // mantido pra dica abaixo
        const credOk = !!matchedCred;
        if (credOk) {
          trackConnection(ip, 22, "ssh");
          out(`The authenticity of host '${target} (${ip})' can't be established.`);
          out(`ED25519 key fingerprint is SHA256:${Math.random().toString(36).slice(2, 18)}.`);
          out(`Warning: Permanently added '${target}' (ED25519) to the list of known hosts.`);
          out(``);
          out(`Welcome to ${h.os}`);
          out(``);
          out(`Last login: ${new Date().toUTCString()}`);
          const initialCwd = h.victimFs?.cwd ?? `/home/${user}`;
          out(`${user}@${h.hostname ?? target}:${initialCwd === `/home/${user}` ? "~" : initialCwd}$ (sessão SSH ativa — comandos agora rodam no host remoto. Use 'exit' para sair)`);
          next.flags.add(`ssh-login-${ip}`);
          next.sshSession = { ip, user, cwd: initialCwd };
          return next;
        }

        // sem senha ou senha errada
        out(`The authenticity of host '${target} (${ip})' can't be established.`);
        out(`ED25519 key fingerprint is SHA256:${Math.random().toString(36).slice(2, 18)}.`);
        out(`Warning: Permanently added '${target}' (ED25519) to the list of known hosts.`);
        if (providedPass !== null) {
          out(`${user}@${target}'s password: ${"*".repeat(providedPass.length)}`);
          err(`Permission denied, please try again.`);
          err(`${user}@${target}: Permission denied (publickey,password).`);
          if (creds) {
            out(`(dica: o host parece ter creds default — tente combinações comuns como '${creds.user}:****')`);
          }
        } else {
          out(`${user}@${target}'s password: ************`);
          err(`Permission denied, please try again.`);
          out(`(use: sshpass -p <senha> ssh ${user}@${target}   para passar senha não-interativamente)`);
        }
        return next;
      }

      // host <domain>  — alias enxuto de dig +short
      if (c === "host") {
        const target = args[1];
        if (!target) { err("Uso: host <domain>"); return s; }
        const ip = resolve(s, target);
        launchPacket(s.myIp, "192.168.1.1", "dns");
        if (ip) {
          out(`${target} has address ${ip}`);
          next.discovered.add(ip);
        } else {
          err(`Host ${target} not found: 3(NXDOMAIN)`);
        }
        return next;
      }

      // netstat (dinâmico — reflete conexões reais)
      if (c === "netstat") {
        out(`Active Internet connections (servers and established)`);
        out(`Proto  Local Address              Foreign Address              State        Service`);
        // sockets em escuta locais (estáticos)
        out(`tcp    0.0.0.0:22                 0.0.0.0:*                    LISTEN       ssh`);
        out(`tcp    127.0.0.1:631              0.0.0.0:*                    LISTEN       cups`);
        out(`tcp6   :::80                      :::*                         LISTEN       http`);
        out(`udp    0.0.0.0:68                 0.0.0.0:*                                 dhcpcd`);
        out(`udp    0.0.0.0:5353               0.0.0.0:*                                 mdns`);
        // conexões dinâmicas iniciadas pelo aluno
        const fresh = s.connections.filter((c0) => Date.now() - c0.ts < 60000);
        if (fresh.length > 0) {
          out(``);
          out(`-- conexões iniciadas por VOCÊ:`);
          fresh.forEach((c0) => {
            const local = `${s.myIp}:${c0.localPort}`.padEnd(27);
            const foreign = `${c0.remoteIp}:${c0.remotePort}`.padEnd(29);
            const st = c0.state.padEnd(13);
            out(`${c0.proto.padEnd(7)}${local}${foreign}${st}${c0.service}`);
          });
        }
        return { ...next, _netstatViewed: true };
      }

      // tcpdump (usa packetLog real + suporta filtros básicos: -i, -n, host X, port N)
      if (c === "tcpdump") {
        const tArgs = args.slice(1);
        // suportar filtros: tcpdump host 192.168.1.50 / port 80 / -c N
        let filterHost: string | null = null;
        let filterPort: number | null = null;
        let count: number | null = null;
        for (let i = 0; i < tArgs.length; i++) {
          const a = tArgs[i];
          if (a === "host" && tArgs[i + 1]) filterHost = resolve(s, tArgs[++i]) ?? tArgs[i];
          else if (a === "port" && tArgs[i + 1]) filterPort = Number(tArgs[++i]);
          else if (a === "-c" && tArgs[i + 1]) count = Number(tArgs[++i]);
        }
        out(`tcpdump: verbose output suppressed, use -v or -vv for full protocol decode`);
        out(`listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes`);
        const filtered = s.packetLog.filter((p) => {
          if (filterHost && p.from !== filterHost && p.to !== filterHost) return false;
          if (filterPort && p.port !== filterPort) return false;
          return true;
        });
        // se ainda não há nada capturado, mostra mensagem amigável
        if (filtered.length === 0) {
          out(`(nenhum pacote capturado — use ping/curl/nc/dig para gerar tráfego primeiro)`);
          return { ...next, _tcpdumpViewed: true };
        }
        const slice = count ? filtered.slice(-count) : filtered.slice(-30);
        slice.forEach((p) => {
          const t = new Date(p.ts).toISOString().slice(11, 23);
          const portStr = p.port ? `.${p.port}` : "";
          out(`${t} IP ${p.from}${portStr} > ${p.to}: ${p.proto} ${p.info}`);
        });
        out(``);
        out(`${slice.length} packets captured`);
        out(`${filtered.length} packets received by filter`);
        out(`0 packets dropped by kernel`);
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

      // ===== hydra (brute force) =====
      // hydra -l <user> -P <wordlist> -t 4 ssh://<ip>
      // hydra -L users.txt -P pass.txt ftp://<ip>
      if (c === "hydra") {
        const hArgs = args.slice(1);
        const lIdx = hArgs.findIndex((a) => a === "-l");
        const LIdx = hArgs.findIndex((a) => a === "-L");
        const PIdx = hArgs.findIndex((a) => a === "-P" || a === "-p");
        const proto = hArgs.find((a) => /^(ssh|ftp|http-get|http-post-form|smb):\/\//i.test(a));
        if (!proto || (lIdx === -1 && LIdx === -1) || PIdx === -1) {
          err("Uso: hydra -l <user> -P <wordlist> <proto>://<ip>");
          err("     hydra -L users.txt -P pass.txt ssh://192.168.1.150");
          return s;
        }
        const protoMatch = proto.match(/^(\w+):\/\/(.+)$/);
        if (!protoMatch) { err("hydra: protocolo inválido"); return s; }
        const protocol = protoMatch[1].toLowerCase();
        const target = protoMatch[2];
        const ip = resolve(s, target);
        if (!ip) { err(`hydra: host não resolvido: ${target}`); return s; }
        const h = s.hosts[ip];
        if (!h) { err(`hydra: host inexistente`); return s; }

        // verificar se serviço está aberto
        const portMap: Record<string, number> = { ssh: 22, ftp: 21, "http-get": 80, "http-post-form": 80, smb: 445 };
        const targetPort = portMap[protocol];
        const portInfo = h.ports.find((p) => p.port === targetPort && p.state === "open");
        if (!portInfo) {
          err(`[ERROR] could not connect to target port ${targetPort}: connection refused`);
          return s;
        }

        // wordlists comuns simuladas
        const userList = lIdx !== -1
          ? [hArgs[lIdx + 1]]
          : ["root", "admin", "administrator", "user", "guest", "postgres", "mysql"];
        const passList = ["123456", "password", "admin", "root", "qwerty", "letmein", "toor", "postgres", "S3nh@F0rt3!"];

        out(`Hydra v9.5 (c) 2023 by van Hauser/THC`);
        out(`Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at ${new Date().toISOString().slice(0, 19).replace("T", " ")}`);
        out(`[DATA] max ${userList.length * passList.length} login tries (l:${userList.length}/p:${passList.length}), ~${Math.ceil(userList.length * passList.length / 16)} tries per task`);
        out(`[DATA] attacking ${protocol}://${ip}:${targetPort}/`);
        launchPacket(s.myIp, ip, "tcp");
        for (let i = 0; i < 8; i++) logPacket(s.myIp, ip, protocol === "ssh" ? "SSH" : protocol === "ftp" ? "FTP" : "TCP", `auth attempt #${i + 1}`, targetPort);
        trackConnection(ip, targetPort, protocol);

        // procurar match nas validCreds + defaultCreds
        const candidatesRaw = [
          ...(h.validCreds ?? []).filter((c) => !c.protocol || c.protocol === protocol),
          ...(h.defaultCreds && (protocol === "ssh" || protocol === "ftp" || protocol === "http-get") ? [h.defaultCreds] : []),
        ];
        const found = candidatesRaw.find((c) => userList.includes(c.user) && passList.includes(c.pass));

        if (found) {
          out(`[ATTEMPT] target ${ip} - login "${found.user}" - pass "${found.pass}" - 1 of ${userList.length * passList.length}`);
          out(`[${targetPort}][${protocol}] host: ${ip}   login: ${found.user}   password: ${found.pass}`);
          out(`1 of 1 target successfully completed, 1 valid password found`);
          out(`Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at ${new Date().toISOString().slice(0, 19).replace("T", " ")}`);
          next.flags.add(`hydra-cracked-${ip}-${protocol}`);
          next.flags.add("CTF{weak_password_was_dictionary_listed}");
        } else {
          for (let i = 0; i < Math.min(8, userList.length * passList.length); i++) {
            const u = userList[i % userList.length];
            const p = passList[i % passList.length];
            out(`[ATTEMPT] target ${ip} - login "${u}" - pass "${p}" - ${i + 1} of ${userList.length * passList.length}`);
          }
          out(`...`);
          out(`0 of 1 target completed, 0 valid passwords found`);
          out(`Hydra (https://github.com/vanhauser-thc/thc-hydra) finished — try other wordlists`);
        }
        return next;
      }

      // ===== dnsrecon =====
      // dnsrecon -d <domain>           enum DNS records + brute subdomains
      if (c === "dnsrecon") {
        const dIdx = args.indexOf("-d");
        if (dIdx === -1 || !args[dIdx + 1]) { err("Uso: dnsrecon -d <domain>"); return s; }
        const domain = args[dIdx + 1];
        out(`[*] Performing General Enumeration of Domain: ${domain}`);
        out(`[-] DNSSEC is not configured for ${domain}`);
        // SOA, NS, MX, TXT
        out(`[*]      SOA ns1.${domain} 192.168.1.1`);
        out(`[*]      NS ns1.${domain} 192.168.1.1`);
        out(`[*]      NS ns2.${domain} 192.168.1.1`);
        out(`[*]      MX mail.${domain} 10`);
        const txt = s.dnsTxt[domain] ?? [];
        txt.forEach((r) => {
          out(`[*]      TXT ${domain} "${r}"`);
          const m = r.match(/CTF\{[^}]+\}/);
          if (m) next.flags.add(m[0]);
        });
        out(`[*] Enumerating SRV Records for ${domain}`);
        out(`[+] 0 Records Found`);
        out(`[*] Brute forcing subdomains for ${domain}`);
        // procurar todos os subdomains que terminam em .domain
        const subs = Object.entries(s.dnsCache).filter(([host]) => host.endsWith(`.${domain}`) && host !== domain);
        if (!subs.length) {
          out(`[-] No subdomains found via brute force.`);
        } else {
          subs.forEach(([host, ip]) => {
            out(`[*]      A ${host} ${ip}`);
            next.discovered.add(ip);
          });
        }
        out(`[+] ${4 + subs.length} Records Found`);
        launchPacket(s.myIp, "192.168.1.1", "dns");
        for (let i = 0; i < 5; i++) logPacket(s.myIp, "192.168.1.1", "DNS", `subdomain brute query #${i + 1}`, 53);
        next.flags.add("subdomain-enum-done");
        return next;
      }

      // ===== enum4linux =====
      // enum4linux <ip>                enum SMB básico
      if (c === "enum4linux") {
        const target = args[1];
        if (!target) { err("Uso: enum4linux <ip>"); return s; }
        const ip = resolve(s, target);
        if (!ip) { err(`enum4linux: host não resolvido`); return s; }
        const h = s.hosts[ip];
        const smbPort = h?.ports.find((p) => (p.port === 445 || p.port === 139) && p.state === "open");
        if (!smbPort) { err(`enum4linux: SMB/NetBIOS não está aberto em ${ip}`); return s; }
        launchPacket(s.myIp, ip, "tcp");
        logPacket(s.myIp, ip, "TCP", `enum4linux SMB probe`, 445);
        trackConnection(ip, 445, "smb");
        out(`Starting enum4linux v0.9.1`);
        out(` ========================== `);
        out(`|    Target Information   |`);
        out(` ========================== `);
        out(`Target ........... ${ip}`);
        out(`Username ......... ''`);
        out(`Password ......... ''`);
        out(``);
        out(` ============================================ `);
        out(`|    Enumerating Workgroup/Domain on ${ip}    |`);
        out(` ============================================ `);
        out(`[+] Got domain/workgroup name: ${h.smbDomain ?? "WORKGROUP"}`);
        out(``);
        if (h.smbShares) {
          out(` =========================== `);
          out(`|    Share Enumeration     |`);
          out(` =========================== `);
          out(`        Sharename       Type      Comment`);
          out(`        ---------       ----      -------`);
          h.smbShares.forEach((share) => {
            out(`        ${share.name.padEnd(15)} ${share.type.padEnd(10)}${share.comment}`);
          });
        }
        if (h.smbUsers) {
          out(``);
          out(` =========================== `);
          out(`|    Users on ${ip}    |`);
          out(` =========================== `);
          h.smbUsers.forEach((u) => out(`user:[${u}] rid:[${1000 + h.smbUsers!.indexOf(u)}]`));
        }
        out(``);
        out(`enum4linux complete on ${new Date().toISOString().slice(0, 19)}`);
        next.flags.add(`smb-enum-${ip}`);
        return next;
      }

      // ===== smbclient =====
      // smbclient -L <ip> -N           lista shares (sem senha)
      // smbclient //<ip>/<share> -N    conecta no share anonimamente
      if (c === "smbclient") {
        const sArgs = args.slice(1);
        const isList = sArgs.includes("-L");
        const targetRaw = sArgs.find((a) => !a.startsWith("-"));
        if (!targetRaw) { err("Uso: smbclient -L <ip> -N   |   smbclient //<ip>/<share> -N"); return s; }
        // parsear //<ip>/<share>
        const shareMatch = targetRaw.match(/^\/\/([^\/]+)\/(.+)$/);
        let ip: string | null;
        let shareName: string | null = null;
        if (shareMatch) {
          ip = resolve(s, shareMatch[1]);
          shareName = shareMatch[2];
        } else {
          ip = resolve(s, targetRaw);
        }
        if (!ip) { err(`smbclient: host não resolvido`); return s; }
        const h = s.hosts[ip];
        if (!h?.smbShares) { err(`smbclient: SMB não disponível em ${ip}`); return s; }
        launchPacket(s.myIp, ip, "tcp");
        logPacket(s.myIp, ip, "TCP", `smbclient connect`, 445);
        trackConnection(ip, 445, "smb");

        if (isList || !shareName) {
          out(`        Sharename       Type      Comment`);
          out(`        ---------       ----      -------`);
          h.smbShares.forEach((sh) => out(`        ${sh.name.padEnd(15)} ${sh.type.padEnd(10)}${sh.comment}`));
          out(``);
          out(`SMB1 disabled -- no workgroup available`);
          return next;
        }
        const share = h.smbShares.find((sh) => sh.name.toLowerCase() === shareName!.toLowerCase());
        if (!share) { err(`tree connect failed: NT_STATUS_BAD_NETWORK_NAME`); return s; }
        if (!share.readable) {
          err(`tree connect failed: NT_STATUS_ACCESS_DENIED`);
          return next;
        }
        out(`Try "help" to get a list of possible commands.`);
        out(`smb: \\> ls`);
        out(`  .                                   D        0  ${new Date().toUTCString().slice(0, 25)}`);
        out(`  ..                                  D        0  ${new Date().toUTCString().slice(0, 25)}`);
        (share.files ?? []).forEach((f) => {
          out(`  ${f.name.padEnd(35)}        ${String(f.size).padStart(7)}  ${new Date().toUTCString().slice(0, 25)}`);
        });
        if (share.flag) next.flags.add(share.flag);
        out(``);
        out(`smb: \\> (use 'smbclient //${ip}/${share.name} -N -c "get <arq>"' para baixar)`);
        out(`(arquivos do share ficaram visíveis — verifique conteúdo com curl/cat se houver flag)`);
        // expor conteúdo dos arquivos como text inline (pra simular get)
        (share.files ?? []).forEach((f) => {
          if (f.content) {
            out(``);
            out(`--- conteúdo de ${f.name} ---`);
            f.content.split("\n").forEach((l) => out(l));
            const fm = f.content.match(/CTF\{[^}]+\}/);
            if (fm) next.flags.add(fm[0]);
          }
        });
        return next;
      }

      // ===== openssl s_client -connect <host>:<port> =====
      if (c === "openssl") {
        const sub = args[1];
        if (sub !== "s_client") {
          err(`openssl: subcomando '${sub}' não suportado. Use 's_client -connect <host>:<port>'`);
          return s;
        }
        const cIdx = args.indexOf("-connect");
        if (cIdx === -1 || !args[cIdx + 1]) { err("Uso: openssl s_client -connect <host>:<port>"); return s; }
        const [hostRef, portStr] = args[cIdx + 1].split(":");
        const port = Number(portStr ?? 443);
        const ip = resolve(s, hostRef);
        if (!ip) { err(`openssl: getaddrinfo: ${hostRef}: Name or service not known`); return s; }
        const h = s.hosts[ip];
        const portInfo = h?.ports.find((p) => p.port === port && p.state === "open");
        if (!portInfo) { err(`socket: connect: Connection refused`); return s; }
        launchPacket(s.myIp, ip, "tcp");
        logPacket(s.myIp, ip, "TCP", `TLS ClientHello`, port);
        trackConnection(ip, port, portInfo.service);
        out(`CONNECTED(00000003)`);
        out(`depth=1 C = US, O = CorpHQ Internal CA, CN = CorpHQ Root CA`);
        out(`verify return:1`);
        out(`depth=0 C = BR, ST = SP, O = CorpHQ Ltda, CN = ${hostRef}`);
        out(`verify return:1`);
        out(`---`);
        out(`Certificate chain`);
        out(` 0 s:C = BR, ST = SP, O = CorpHQ Ltda, CN = ${hostRef}`);
        out(`   i:C = US, O = CorpHQ Internal CA, CN = CorpHQ Root CA`);
        out(` 1 s:C = US, O = CorpHQ Internal CA, CN = CorpHQ Root CA`);
        out(`   i:C = US, O = CorpHQ Internal CA, CN = CorpHQ Root CA`);
        out(`---`);
        out(`Server certificate`);
        out(`-----BEGIN CERTIFICATE-----`);
        out(`MIIDazCCAlOgAwIBAgIUF8j3a91...   (truncado)`);
        out(`-----END CERTIFICATE-----`);
        out(`subject=C = BR, ST = SP, O = CorpHQ Ltda, CN = ${hostRef}`);
        out(`issuer=C = US, O = CorpHQ Internal CA, CN = CorpHQ Root CA`);
        out(`---`);
        out(`SSL handshake has read 4521 bytes and written 393 bytes`);
        out(`Verification: OK`);
        out(`---`);
        out(`New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384`);
        out(`Server public key is 2048 bit`);
        out(`Secure Renegotiation IS NOT supported`);
        out(`Compression: NONE`);
        out(`Expansion: NONE`);
        out(`No ALPN negotiated`);
        out(`Early data was not sent`);
        out(`Verify return code: 0 (ok)`);
        out(`---`);
        next.flags.add(`tls-inspected-${ip}`);
        return next;
      }

      // ===== wireshark (modal) =====
      if (c === "wireshark") {
        if (s.packetLog.length === 0) {
          err("wireshark: sem pacotes capturados. Gere tráfego com ping/curl/nc/dig primeiro.");
          return s;
        }
        setShowWireshark(true);
        out(`Iniciando Wireshark — abrindo análise visual de ${s.packetLog.length} pacotes capturados`);
        next.flags.add("wireshark-opened");
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
      const matches = computeNetCompletions(input, state);
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1) {
        const common = longestCommonPrefix(matches);
        if (common.length > input.length) setInput(common);
        info("Sugestões: " + matches.slice(0, 12).join(" | ") + (matches.length > 12 ? ` …(+${matches.length - 12})` : ""));
      }
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
      { border: "border-violet-500/20", bg: "bg-violet-500/10", text: "text-violet-400", borderInner: "border-violet-500/30" },
      { border: "border-rose-500/20", bg: "bg-rose-500/10", text: "text-rose-400", borderInner: "border-rose-500/30" },
      { border: "border-teal-500/20", bg: "bg-teal-500/10", text: "text-teal-400", borderInner: "border-teal-500/30" },
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
        title: "Os níveis",
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

        {/* Level selector - Compact Progress Path */}
        <div className="relative mb-8 mt-2 px-2">
          {/* Progress Track Background */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-900 -translate-y-1/2 z-0" />
          
          <div className="relative z-10 flex items-center justify-between gap-2 overflow-x-auto pb-4 no-scrollbar">
            {LEVELS.map((lv, i) => {
              const isUnlocked = unlocked.has(i);
              const isDone = completed.has(i);
              const isCurrent = i === levelIdx;
              
              return (
                <div key={lv.id} className="flex items-center gap-2 shrink-0">
                  {i > 0 && (
                    <div className={`h-0.5 w-4 md:w-8 transition-colors duration-500 ${
                      isUnlocked ? "bg-cyan-500/40" : "bg-slate-900"
                    }`} />
                  )}
                  
                  <button
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && loadLevel(i)}
                    className={`relative group flex items-center transition-all duration-500 ${
                      isCurrent ? "px-4 py-2 rounded-full bg-cyan-500/20 border-cyan-400 border" : "w-10 h-10 rounded-full border items-center justify-center"
                    } ${
                      isCurrent ? "text-cyan-300" :
                      isDone ? "bg-cyan-500/5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" :
                      isUnlocked ? "bg-slate-900 border-white/10 text-slate-400 hover:border-white/30" :
                      "bg-slate-900/50 border-white/5 text-slate-700 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 flex items-center justify-center">
                        {!isUnlocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : isDone ? (
                          <Trophy className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-mono font-bold">{lv.id}</span>
                        )}
                      </div>
                      
                      {isCurrent && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                        >
                          {lv.title}
                        </motion.span>
                      )}
                    </div>

                    {/* Tooltip on hover for non-current levels */}
                    {!isCurrent && isUnlocked && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {lv.title}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
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

      {/* Modal Wireshark — análise visual de pacotes capturados */}
      <AnimatePresence>
        {showWireshark && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowWireshark(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_60px_-10px_rgba(34,211,238,0.4)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Wireshark · Network Analyzer</h3>
                    <p className="text-[10px] text-slate-500 font-mono">capture.pcap · {state.packetLog.length} pacotes</p>
                  </div>
                </div>
                <button onClick={() => setShowWireshark(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Filter bar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-slate-900">
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">filter</span>
                <input
                  value={wsFilter}
                  onChange={(e) => setWsFilter(e.target.value)}
                  placeholder="ex: tcp.port == 80   |   dns   |   http   |   ip.addr == 192.168.1.50"
                  className="flex-1 bg-slate-950 border border-white/10 rounded px-2 py-1 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400 placeholder:text-slate-700"
                />
                {["dns", "http", "tcp", "icmp"].map((preset) => (
                  <button key={preset} onClick={() => setWsFilter(preset)} className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/5">
                    {preset}
                  </button>
                ))}
                <button onClick={() => setWsFilter("")} className="text-[10px] font-mono px-2 py-1 rounded text-slate-500 hover:text-white">limpar</button>
              </div>
              {/* Packet list + detail */}
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* List */}
                <div className="flex-1 overflow-auto border-r border-white/10">
                  <table className="w-full text-[11px] font-mono">
                    <thead className="sticky top-0 bg-slate-950/95 backdrop-blur">
                      <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/10">
                        <th className="px-2 py-1.5">#</th>
                        <th className="px-2 py-1.5">Time</th>
                        <th className="px-2 py-1.5">Source</th>
                        <th className="px-2 py-1.5">Destination</th>
                        <th className="px-2 py-1.5">Proto</th>
                        <th className="px-2 py-1.5">Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const f = wsFilter.toLowerCase().trim();
                        const filtered = state.packetLog.filter((p) => {
                          if (!f) return true;
                          // filtros básicos: protocolo, port, ip
                          if (/^(dns|tcp|udp|icmp|http|ssh|ftp)$/.test(f) && p.proto.toLowerCase() === f) return true;
                          const portMatch = f.match(/(?:tcp|udp)?\.?port\s*==?\s*(\d+)/);
                          if (portMatch && p.port === Number(portMatch[1])) return true;
                          const ipMatch = f.match(/ip\.(?:addr|src|dst)\s*==?\s*(\d+\.\d+\.\d+\.\d+)/);
                          if (ipMatch && (p.from === ipMatch[1] || p.to === ipMatch[1])) return true;
                          // fallback: substring no info
                          if (p.info.toLowerCase().includes(f) || p.from.includes(f) || p.to.includes(f) || p.proto.toLowerCase().includes(f)) return true;
                          return false;
                        });
                        if (filtered.length === 0) return (
                          <tr><td colSpan={6} className="px-2 py-4 text-center text-slate-600 italic">(nenhum pacote bate com o filtro)</td></tr>
                        );
                        return filtered.slice(-200).map((p) => {
                          const protoColor: Record<string, string> = {
                            DNS: "text-fuchsia-300", HTTP: "text-emerald-300", TCP: "text-sky-300",
                            UDP: "text-amber-300", ICMP: "text-rose-300", SSH: "text-violet-300", FTP: "text-cyan-300",
                          };
                          const isSelected = wsSelectedPacket === p.id;
                          return (
                            <tr key={p.id}
                              onClick={() => {
                                setWsSelectedPacket(p.id);
                                // detectar credencial em plaintext e capturar flag forense
                                if (/(?:USER|PASS|user=|pass=|password=)/i.test(p.info)) {
                                  setState((st) => {
                                    const f = new Set(st.flags);
                                    f.add("forensic-cred-found");
                                    f.add("CTF{plaintext_creds_caught_in_pcap}");
                                    return { ...st, flags: f };
                                  });
                                }
                              }}
                              className={`cursor-pointer border-b border-white/5 hover:bg-cyan-500/5 ${isSelected ? "bg-cyan-500/10" : ""}`}
                            >
                              <td className="px-2 py-1 text-slate-600">{p.id}</td>
                              <td className="px-2 py-1 text-slate-500">{new Date(p.ts).toISOString().slice(11, 23)}</td>
                              <td className="px-2 py-1 text-slate-300">{p.from}</td>
                              <td className="px-2 py-1 text-slate-300">{p.to}</td>
                              <td className={`px-2 py-1 font-bold ${protoColor[p.proto] ?? "text-slate-400"}`}>{p.proto}{p.port ? `:${p.port}` : ""}</td>
                              <td className="px-2 py-1 text-slate-400 truncate max-w-md">{p.info}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
                {/* Detail */}
                <div className="lg:w-96 max-h-72 lg:max-h-none overflow-auto p-3 bg-slate-950/50">
                  {wsSelectedPacket === null ? (
                    <p className="text-[11px] text-slate-600 italic">Clique num pacote para ver detalhes</p>
                  ) : (() => {
                    const p = state.packetLog.find((x) => x.id === wsSelectedPacket);
                    if (!p) return null;
                    // mostrar info do pacote + se for HTTP/FTP, decodificar payload se possível
                    const sniffedPlaintext = (() => {
                      // se há credencial em texto puro no info, sinaliza
                      const credMatch = p.info.match(/(?:USER|PASS|user=|pass=|password=|auth=)([^\s&]+)/i);
                      if (credMatch) return credMatch[0];
                      return null;
                    })();
                    return (
                      <div className="space-y-3 text-[11px] font-mono">
                        <div>
                          <p className="text-cyan-400 uppercase tracking-widest text-[9px] mb-1">Frame</p>
                          <p className="text-slate-300">Packet #{p.id}</p>
                          <p className="text-slate-500">{new Date(p.ts).toISOString()}</p>
                        </div>
                        <div>
                          <p className="text-cyan-400 uppercase tracking-widest text-[9px] mb-1">IP / TCP</p>
                          <p className="text-slate-400">Source: <span className="text-slate-200">{p.from}</span></p>
                          <p className="text-slate-400">Destination: <span className="text-slate-200">{p.to}</span></p>
                          {p.port && <p className="text-slate-400">Port: <span className="text-slate-200">{p.port}</span></p>}
                        </div>
                        <div>
                          <p className="text-cyan-400 uppercase tracking-widest text-[9px] mb-1">{p.proto}</p>
                          <p className="text-slate-300 break-words whitespace-pre-wrap leading-relaxed">{p.info}</p>
                        </div>
                        {sniffedPlaintext && (
                          <div className="bg-rose-500/10 border border-rose-500/30 rounded p-2">
                            <p className="text-[9px] text-rose-400 uppercase tracking-widest mb-1">⚠ credencial em texto puro</p>
                            <code className="text-rose-300">{sniffedPlaintext}</code>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="px-4 py-2 border-t border-white/10 text-[10px] text-slate-500 font-mono flex items-center justify-between bg-slate-950">
                <span>Filtros: <code className="text-cyan-400">tcp.port == 80</code>  ·  <code className="text-cyan-400">dns</code>  ·  <code className="text-cyan-400">ip.addr == 192.168.1.50</code></span>
                <span>esc / clique fora p/ fechar</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
