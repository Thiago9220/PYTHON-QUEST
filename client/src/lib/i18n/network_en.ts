import type { AppLanguage } from "@/contexts/LanguageContext";

export interface CodexRitual {
  title: string;
  desc: string;
  code: string;
}

export type CodexTabId = "net101" | "recon" | "scanning" | "exploitation" | "post_ex" | "defense";

export const NETWORK_CODEX_I18N: Record<
  AppLanguage,
  {
    brandPrefix: string;
    subtitleDefault: string;
    subtitleRose: string;
    interceptActive: string;
    copiedToast: string;
    injectBtn: string;
    closeBtn: string;
    tabs: Record<CodexTabId, string>;
    tabDescriptions: Record<Exclude<CodexTabId, "net101">, string>;
    net101: {
      heading: string;
      intro: string;
      ipTitle: string;
      ipDesc: string;
      portsTitle: string;
      portsDesc: string;
    };
    rituals: Record<CodexTabId, CodexRitual[]>;
  }
> = {
  pt: {
    brandPrefix: "Rede.",
    subtitleDefault: "Manual de Rede & Pentest",
    subtitleRose: "SOC & Pentest Protocol",
    interceptActive: "Network Intercept Active",
    copiedToast: "Copiado para o clipboard.",
    injectBtn: "Injetar",
    closeBtn: "Fechar Manual",
    tabs: {
      net101: "Redes 101",
      recon: "Reconhecimento",
      scanning: "Escaneamento",
      exploitation: "Exploração",
      post_ex: "Pós-Acesso",
      defense: "Defesa (Blue)",
    },
    tabDescriptions: {
      recon: "Mapeie o terreno externo antes de qualquer ação direta. Silêncio é a chave.",
      scanning: "Várzea as portas do alvo para descobrir serviços, versões e falhas óbvias.",
      exploitation: "O momento da brecha. Use ferramentas para ganhar acesso inicial ao sistema.",
      post_ex: "Você entrou. Agora escale privilégios e vasculhe por informações críticas.",
      defense: "Proteja seu ambiente: monitore tráfego, filtre pacotes e aplique hardening.",
    },
    net101: {
      heading: "O Sistema Nervoso Digital",
      intro:
        "Toda invasão ou defesa começa com a compreensão de como os dados viajam. Uma rede é um conjunto de dispositivos (nós) conversando via protocolos padronizados.",
      ipTitle: "IP (Internet Protocol)",
      ipDesc:
        "Seu endereço na rede. No IPv4, são 4 números de 0 a 255. IPs privados (ex: 192.168.x.x) não são roteáveis na internet pública.",
      portsTitle: "Portas (Serviços)",
      portsDesc:
        "Imagine o IP como o prédio e a Porta como o apartamento. Cada serviço (Web, SSH, DB) escuta em uma porta específica.",
    },
    rituals: {
      net101: [
        { title: "ifconfig / ip a", desc: "Mostra seu endereço IP local e interfaces de rede.", code: "ifconfig" },
        { title: "Gateway Padrão", desc: "O IP do roteador que te conecta ao mundo externo.", code: "192.168.1.1" },
        { title: "DNS (Domain Name System)", desc: "Traduz nomes legíveis (google.com) em IPs numéricos.", code: "nslookup google.com" },
        { title: "Subnetting", desc: "Define o tamanho da rede. /24 significa 254 IPs possíveis.", code: "192.168.1.0/24" },
      ],
      recon: [
        { title: "ping", desc: "Verifica se um host está vivo e medindo a latência.", code: "ping 192.168.1.1" },
        { title: "traceroute", desc: "Mapeia todos os saltos (roteadores) entre você e o alvo.", code: "traceroute 8.8.8.8" },
        { title: "whois", desc: "Consulta informações de registro de um domínio externo.", code: "whois corp.local" },
        { title: "dig", desc: "Interroga servidores DNS por registros específicos (A, MX, TXT).", code: "dig TXT corp.local" },
      ],
      scanning: [
        { title: "nmap -sn", desc: "Ping sweep: descobre quais hosts estão ligados na rede sem scaneá-los.", code: "nmap -sn 192.168.1.0/24" },
        { title: "nmap -sV", desc: "Scan de Versão: tenta descobrir qual software e versão rodam em cada porta.", code: "nmap -sV 192.168.1.50" },
        { title: "nmap -A", desc: "Scan Agressivo: habilita detecção de OS, versão e scripts padrão.", code: "nmap -A 192.168.1.100" },
        { title: "nmap --script vuln", desc: "Verifica automaticamente se o alvo possui vulnerabilidades conhecidas.", code: "nmap --script vuln 192.168.1.100" },
      ],
      exploitation: [
        { title: "nc (Netcat)", desc: "O 'canivete suíço' da rede. Conecta, escuta e transfere dados.", code: "nc 192.168.1.100 21" },
        { title: "hydra", desc: "Ferramenta de força bruta para quebrar senhas de SSH, HTTP, FTP, etc.", code: "hydra -l admin -P rockyou.txt ssh://192.168.1.50" },
        { title: "smbclient", desc: "Interage com compartilhamentos de arquivos do Windows (SMB).", code: "smbclient -L //192.168.1.100 -N" },
        { title: "searchsploit", desc: "Busca exploits conhecidos no banco de dados do Exploit-DB.", code: "searchsploit vsftpd 2.3.4" },
      ],
      post_ex: [
        { title: "sudo -l", desc: "Lista quais comandos seu usuário atual pode rodar como root.", code: "sudo -l" },
        { title: "find SUID", desc: "Busca arquivos com a flag SUID que podem levar a escalação de privilégio.", code: "find / -perm -4000 2>/dev/null" },
        { title: "GTFOBins", desc: "Técnica para abusar de binários legítimos para ganhar shell de root.", code: "sudo find . -exec /bin/sh \\; -quit" },
        { title: "Looting", desc: "Buscar por arquivos sensíveis: .env, .bash_history, backups, chaves SSH.", code: "cat /home/user/.bash_history" },
      ],
      defense: [
        { title: "iptables", desc: "Configura as regras de firewall do kernel Linux.", code: "iptables -A INPUT -p tcp --dport 22 -j DROP" },
        { title: "tcpdump", desc: "Captura e analisa pacotes de rede em tempo real no terminal.", code: "tcpdump -i eth0 host 192.168.1.50" },
        { title: "netstat", desc: "Lista todas as conexões ativas e portas abertas no seu sistema.", code: "netstat -tuln" },
        { title: "wireshark", desc: "Analisador visual de tráfego de rede (GUI para arquivos .pcap).", code: "wireshark" },
      ],
    },
  },
  en: {
    brandPrefix: "Net.",
    subtitleDefault: "Networking & Pentest Manual",
    subtitleRose: "SOC & Pentest Protocol",
    interceptActive: "Network Intercept Active",
    copiedToast: "Copied to clipboard.",
    injectBtn: "Inject",
    closeBtn: "Close Manual",
    tabs: {
      net101: "Networking 101",
      recon: "Reconnaissance",
      scanning: "Scanning",
      exploitation: "Exploitation",
      post_ex: "Post-Exploitation",
      defense: "Defense (Blue)",
    },
    tabDescriptions: {
      recon: "Map the external terrain before taking any direct action. Stealth is key.",
      scanning: "Sweep the target's ports to discover running services, versions, and obvious flaws.",
      exploitation: "Time for the breach. Use tools to gain initial access to the system.",
      post_ex: "You're in. Now escalate privileges and hunt for critical information.",
      defense: "Protect your environment: monitor traffic, filter packets, and apply hardening.",
    },
    net101: {
      heading: "The Digital Nervous System",
      intro:
        "Every attack or defense begins with understanding how data travels. A network is a collection of devices (nodes) communicating over standardized protocols.",
      ipTitle: "IP (Internet Protocol)",
      ipDesc:
        "Your address on the network. In IPv4, it consists of 4 numbers from 0 to 255. Private IPs (e.g., 192.168.x.x) are not routable on the public internet.",
      portsTitle: "Ports (Services)",
      portsDesc:
        "Think of the IP as the building and the Port as the apartment. Each service (Web, SSH, DB) listens on a specific port.",
    },
    rituals: {
      net101: [
        { title: "ifconfig / ip a", desc: "Displays your local IP address and network interfaces.", code: "ifconfig" },
        { title: "Default Gateway", desc: "The router IP that connects you to the outside world.", code: "192.168.1.1" },
        { title: "DNS (Domain Name System)", desc: "Translates human-readable names (google.com) into numeric IPs.", code: "nslookup google.com" },
        { title: "Subnetting", desc: "Defines the network size. /24 means 254 usable host IPs.", code: "192.168.1.0/24" },
      ],
      recon: [
        { title: "ping", desc: "Checks whether a host is alive and measures latency.", code: "ping 192.168.1.1" },
        { title: "traceroute", desc: "Maps every hop (router) between you and the target.", code: "traceroute 8.8.8.8" },
        { title: "whois", desc: "Queries registration information for an external domain.", code: "whois corp.local" },
        { title: "dig", desc: "Queries DNS servers for specific records (A, MX, TXT).", code: "dig TXT corp.local" },
      ],
      scanning: [
        { title: "nmap -sn", desc: "Ping sweep: discovers which hosts are online without port-scanning them.", code: "nmap -sn 192.168.1.0/24" },
        { title: "nmap -sV", desc: "Version Scan: detects which software and version run on each port.", code: "nmap -sV 192.168.1.50" },
        { title: "nmap -A", desc: "Aggressive Scan: enables OS detection, version detection, and default scripts.", code: "nmap -A 192.168.1.100" },
        { title: "nmap --script vuln", desc: "Automatically checks whether the target has known vulnerabilities.", code: "nmap --script vuln 192.168.1.100" },
      ],
      exploitation: [
        { title: "nc (Netcat)", desc: "The networking 'Swiss Army knife'. Connects, listens, and transfers data.", code: "nc 192.168.1.100 21" },
        { title: "hydra", desc: "Brute-force tool for cracking passwords on SSH, HTTP, FTP, etc.", code: "hydra -l admin -P rockyou.txt ssh://192.168.1.50" },
        { title: "smbclient", desc: "Interacts with Windows file shares (SMB).", code: "smbclient -L //192.168.1.100 -N" },
        { title: "searchsploit", desc: "Searches for known exploits in the Exploit-DB database.", code: "searchsploit vsftpd 2.3.4" },
      ],
      post_ex: [
        { title: "sudo -l", desc: "Lists which commands your current user can run as root.", code: "sudo -l" },
        { title: "find SUID", desc: "Searches for files with the SUID flag that may allow privilege escalation.", code: "find / -perm -4000 2>/dev/null" },
        { title: "GTFOBins", desc: "Technique for abusing legitimate binaries to spawn a root shell.", code: "sudo find . -exec /bin/sh \\; -quit" },
        { title: "Looting", desc: "Search for sensitive files: .env, .bash_history, backups, SSH keys.", code: "cat /home/user/.bash_history" },
      ],
      defense: [
        { title: "iptables", desc: "Configures Linux kernel firewall rules.", code: "iptables -A INPUT -p tcp --dport 22 -j DROP" },
        { title: "tcpdump", desc: "Captures and analyzes network packets in real time from the terminal.", code: "tcpdump -i eth0 host 192.168.1.50" },
        { title: "netstat", desc: "Lists all active connections and open ports on your system.", code: "netstat -tuln" },
        { title: "wireshark", desc: "Visual network traffic analyzer (GUI for .pcap files).", code: "wireshark" },
      ],
    },
  },
};

export interface LevelTextEn {
  title: string;
  briefing: string;
  missions: Record<string, { title: string; hint?: string }>;
}

export const NETWORK_LEVELS_EN: Record<number, LevelTextEn> = {
  1: {
    title: "Local Reconnaissance",
    briefing:
      "Before mapping the network, scout the ground YOU are standing on: your own IP, the gateway connecting your machine to the rest, and direct neighbors on the network segment.",
    missions: {
      ifconfig: { title: "Discover your local IP", hint: "ifconfig (or: ip a)" },
      "ping-gw": { title: "Verify if the gateway responds" },
      arp: { title: "List direct neighbors on the link" },
      trace: { title: "Trace the route to the internet" },
    },
  },
  2: {
    title: "DNS — Translating Names",
    briefing:
      "Humans remember names (corp.local), machines speak IPs (192.168.1.50). DNS is the 'phonebook' that performs the translation. Use nslookup, dig, and whois to extract information.",
    missions: {
      nslookup: { title: "Resolve 'web.corp.local' to an IP" },
      dig: { title: "Fetch detailed records using dig" },
      whois: { title: "Inspect the domain with whois" },
    },
  },
  3: {
    title: "Port Mapping",
    briefing:
      "Every IP has 65,535 'ports' where services talk. Web on 80, SSH on 22, database on 5432. Use nmap to sweep these ports and uncover what is exposed.",
    missions: {
      discover: { title: "Discover all active hosts on the subnet" },
      scan: { title: "Scan the ports on the web server" },
      version: { title: "Detect service versions (crucial for finding vulnerabilities)" },
    },
  },
  4: {
    title: "Interacting with Services",
    briefing:
      "Found open ports? Time to talk to them. curl speaks HTTP, nc (netcat) does banner grabbing, ssh attempts to connect. Each protocol has its own language.",
    missions: {
      curl: { title: "Send a GET request to the web server (internal portal)" },
      banner: { title: "Grab the SSH banner to see its exact version" },
      ftp: { title: "Connect to the vulnerable host's FTP port and find the flag" },
    },
  },
  5: {
    title: "Forensics & Traffic",
    briefing:
      "The final phase: monitoring traffic. netstat shows your connections, tcpdump captures packets in real time. Knowing how to observe the network is half of security.",
    missions: {
      netstat: { title: "List your active connections and listening local ports" },
      tcpdump: { title: "Capture packets passing through the interface" },
      summary: { title: "Investigation complete — run 'report'" },
    },
  },
  6: {
    title: "Brute Force & SMB Enum",
    briefing:
      "Recon gives you open ports — but what lies BEHIND them? In this level you will brute-force weak auth with hydra, discover hidden subdomains with dnsrecon, and enumerate SMB shares to find credentials no one should have left exposed.",
    missions: {
      dnsrecon: { title: "Enumerate corp.local subdomains with dnsrecon" },
      "hydra-iot": { title: "Crack the IoT camera (.150) login with hydra (HTTP basic, admin/admin is default)" },
      enum4linux: { title: "Enumerate the Windows server (.100) — discover users and SMB shares" },
      smbclient: { title: "Connect anonymously to the 'Backups' share and read the files" },
      "ssh-creds": { title: "Use the leaked credentials from .env.bak to log into the DB via SSH" },
    },
  },
  7: {
    title: "Inside the Server: Privilege Escalation",
    briefing:
      "You logged into the DB as 'postgres' using leaked creds. But a regular user won't get you far — want to read /root/flag.txt? Enumerate what's misconfigured: loose SUIDs, sudo NOPASSWD, vulnerable cron jobs. The classic Linux privesc path.",
    missions: {
      "ls-home": { title: "Check what is in your home directory (use 'ls -la')" },
      "read-history": { title: "Read the previous user's .bash_history — it has clues" },
      "sudo-l": { title: "Check what you can run with sudo: sudo -l" },
      "find-suid": { title: "List SUID binaries — another privesc route" },
      escalate: { title: "Use the classic find GTFOBins trick to escalate to root" },
      "root-flag": { title: "Read /root/flag.txt — you nailed the privesc" },
    },
  },
  8: {
    title: "Forensic Capture Analysis",
    briefing:
      "The IDS recorded a capture.pcap file during an incident. Use the built-in Wireshark to filter packets, find the plaintext credential used by the attacker, and identify the suspicious IP. Start by generating traffic with ping/curl/nc — then 'wireshark' opens the visual analyzer.",
    missions: {
      open: { title: "Open Wireshark to analyze the capture" },
      "find-cred": {
        title: "Filter by HTTP and find the POST /admin/login containing the plaintext credential",
        hint: "use the 'http' filter in the modal",
      },
      "find-attacker": {
        title: "Identify the attacker's IP (ping or curl .99 to confirm its presence on the network)",
        hint: "ping 192.168.1.99 or curl http://192.168.1.99",
      },
      "report-final": { title: "Generate the final incident report" },
    },
  },
  9: {
    title: "Hardening: Firewall (iptables)",
    briefing:
      "Flip the script: now you are the sysadmin of web server 192.168.1.50. The nmap scan from Level 3 revealed too many open ports. Configure iptables to block what shouldn't be exposed to the entire subnet and restrict SSH to the admin workstation (192.168.1.42) only.",
    missions: {
      "list-rules": { title: "List the current firewall rules" },
      "block-ftp": { title: "Block FTP connection attempts (port 21) on the INPUT chain" },
      "allow-ssh-admin": { title: "Allow SSH (22) only from admin workstation 192.168.1.42" },
      "deny-ssh-others": { title: "Block SSH from any other source" },
      "save-rules": { title: "Persist rules so they survive a reboot" },
      "verify-nmap": { title: "Verify from another host: run 'nmap 192.168.1.50' and see FTP filtered" },
    },
  },
};

export const NETWORK_HELP_LINES_EN = [
  "Supported commands (case-insensitive):",
  "",
  "  RECONNAISSANCE",
  "  ifconfig | ip a                       your network interface",
  "  ping <ip|host>                        ICMP echo",
  "  traceroute <host> | tracert           trace network route",
  "  arp -a                                neighbors on segment",
  "",
  "  DNS",
  "  host <domain>                         concise DNS lookup",
  "  nslookup <host>                       resolve via DNS",
  "  dig [TXT|MX|NS|+short] <host>         detailed DNS query",
  "  dig -x <ip>                           reverse DNS (PTR)",
  "  whois <domain>                        domain registration info",
  "",
  "  PORT SCAN",
  "  nmap [-sn|-sV|-O|-A] <ip|cidr>        full scan",
  "  nmap [-sS|-sT|-sU] <ip>               scan type (SYN/Connect/UDP)",
  "  nmap -p <ports> <ip>                  ranges: 22,80,443  or  1-1000  or  -",
  "  nmap --top-ports <N> <ip>             top N most common ports",
  "",
  "  SERVICE INTERACTION",
  "  curl [-u user:pass] [-I] <url>        HTTP (URL can omit http://)",
  "  wget <url>                            alias for curl",
  "  nc <ip> <port> | telnet <ip> <port>   raw TCP connection / banner grab",
  "  ssh <user@ip>                         interactive attempt (will fail)",
  "  sshpass -p <password> ssh <user@ip>   non-interactive authentication",
  "",
  "  ADVANCED ENUMERATION",
  "  dnsrecon -d <domain>                  DNS enum + subdomain brute force",
  "  enum4linux <ip>                       SMB enum (workgroup/users/shares)",
  "  smbclient -L <ip> -N                  list SMB shares anonymously",
  "  smbclient //<ip>/<share> -N           connect to share",
  "  nmap --script vuln <ip>               NSE vulnerability scripts",
  "  nmap --script smb-vuln-* <ip>         specific SMB scripts",
  "",
  "  EXPLOITATION & FORENSICS",
  "  hydra -l <user> -P <wl> <proto>://<ip>   brute force (ssh/ftp/http)",
  "  searchsploit <term|ip|cve>            search CVEs/exploits",
  "  netstat -tuln                         local connections (dynamic)",
  "  tcpdump [host X] [port N] [-c N]      packet capture (live log)",
  "  wireshark                             open visual packet analyzer (modal)",
  "  openssl s_client -connect <host>:<port>  inspect TLS certificate",
  "  report                                final investigation report",
  "",
  "  BLUE TEAM / DEFENSE (Level 9+)",
  "  iptables -L                           list firewall rules",
  "  iptables -A <chain> -p tcp --dport N [-s IP] -j ACCEPT|DROP",
  "                                        append rule (chain: INPUT/OUTPUT/FORWARD)",
  "  iptables -D <chain> <num>             delete rule N from chain",
  "  iptables -F                           flush (clear all rules)",
  "  iptables-save                         persist rules to /etc/iptables/rules.v4",
  "",
  "  POST-EXPLOITATION (after successful sshpass)",
  "  ls/ls -la, cat, cd, pwd, whoami, id, uname -a, hostname, ps",
  "  sudo -l                               see what can run with sudo",
  "  find / -perm -4000 2>/dev/null        list SUID binaries",
  "  sudo find . -exec /bin/sh \\;          escalate to root (GTFOBins)",
  "  strings <file>, hexdump -C <file>     binary/file analysis",
  "  exit                                  exit remote shell",
  "",
  "  clear | reset | help",
  "Shortcuts: ↑/↓ history  •  Tab contextual autocomplete  •  click hosts on the map",
  "",
  "⚠️ These commands only work in this simulated environment.",
  "To use them on your PC, install the real tools (nmap.org, wireshark.org, etc.).",
];

export const NETWORK_HELP_LINES_PT = [
  "Comandos suportados (case-insensitive):",
  "",
  "  RECONHECIMENTO",
  "  ifconfig | ip a                       sua interface de rede",
  "  ping <ip|host>                        ICMP echo",
  "  traceroute <host> | tracert           rastreia caminho",
  "  arp -a                                vizinhos no segmento",
  "",
  "  DNS",
  "  host <domain>                         resolução enxuta",
  "  nslookup <host>                       resolve via DNS",
  "  dig [TXT|MX|NS|+short] <host>         query DNS detalhada",
  "  dig -x <ip>                           reverse DNS (PTR)",
  "  whois <domain>                        registro do domínio",
  "",
  "  PORT SCAN",
  "  nmap [-sn|-sV|-O|-A] <ip|cidr>        varredura completa",
  "  nmap [-sS|-sT|-sU] <ip>               tipo de scan (SYN/Connect/UDP)",
  "  nmap -p <portas> <ip>                 ranges: 22,80,443  ou  1-1000  ou  -",
  "  nmap --top-ports <N> <ip>             N portas mais comuns",
  "",
  "  INTERAÇÃO COM SERVIÇOS",
  "  curl [-u user:pass] [-I] <url>        HTTP (URL pode omitir http://)",
  "  wget <url>                            alias de curl",
  "  nc <ip> <port> | telnet <ip> <port>   conexão TCP raw / banner grab",
  "  ssh <user@ip>                         tentativa interativa (vai falhar)",
  "  sshpass -p <senha> ssh <user@ip>      autenticação não-interativa",
  "",
  "  ENUMERAÇÃO AVANÇADA",
  "  dnsrecon -d <domain>                  enum DNS + brute subdomains",
  "  enum4linux <ip>                       enum SMB (workgroup/users/shares)",
  "  smbclient -L <ip> -N                  lista shares SMB anonimamente",
  "  smbclient //<ip>/<share> -N           conecta no share",
  "  nmap --script vuln <ip>               NSE scripts de vulnerabilidades",
  "  nmap --script smb-vuln-* <ip>         scripts SMB específicos",
  "",
  "  EXPLOITATION & FORENSE",
  "  hydra -l <user> -P <wl> <proto>://<ip>   brute force (ssh/ftp/http)",
  "  searchsploit <termo|ip|cve>           busca CVEs/exploits",
  "  netstat -tuln                         conexões locais (dinâmico)",
  "  tcpdump [host X] [port N] [-c N]      captura de pacotes (real)",
  "  wireshark                             abre análise visual de pacotes (modal)",
  "  openssl s_client -connect <host>:<port>  inspeciona certificado TLS",
  "  report                                relatório final",
  "",
  "  BLUE TEAM / DEFESAS (Nível 9+)",
  "  iptables -L                           lista regras de firewall",
  "  iptables -A <chain> -p tcp --dport N [-s IP] -j ACCEPT|DROP",
  "                                        adiciona regra (chain: INPUT/OUTPUT/FORWARD)",
  "  iptables -D <chain> <num>             remove regra N da chain",
  "  iptables -F                           flush (limpa todas as regras)",
  "  iptables-save                         persiste regras em /etc/iptables/rules.v4",
  "",
  "  PÓS-EXPLORAÇÃO (após sshpass bem-sucedido)",
  "  ls/ls -la, cat, cd, pwd, whoami, id, uname -a, hostname, ps",
  "  sudo -l                               vê o que pode rodar com sudo",
  "  find / -perm -4000 2>/dev/null        lista binários SUID",
  "  sudo find . -exec /bin/sh \\;          escala para root (GTFOBins)",
  "  strings <arq>, hexdump -C <arq>       análise de binários/arquivos",
  "  exit                                  sai do shell remoto",
  "",
  "  clear | reset | help",
  "Atalhos: ↑/↓ histórico  •  Tab autocomplete contextual  •  clique nos hosts do mapa",
  "",
  "⚠️ Estes comandos funcionam apenas neste ambiente simulado.",
  "Para usá-los no seu PC, instale as ferramentas reais (nmap.org, wireshark.org, etc).",
];
