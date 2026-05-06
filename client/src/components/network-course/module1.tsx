import { motion } from "framer-motion";
import type { CourseModule } from "./types";

// ---------- Diagrams ----------

const LayerStackDiagram = () => (
  <svg viewBox="0 0 520 280" className="w-full h-auto">
    {[
      { y: 20, name: "Aplicação",   color: "#a855f7", desc: "HTTP, DNS, SSH" },
      { y: 70, name: "Transporte",  color: "#06b6d4", desc: "TCP, UDP" },
      { y: 120, name: "Rede",       color: "#22c55e", desc: "IP, ICMP" },
      { y: 170, name: "Enlace",     color: "#fbbf24", desc: "Ethernet, ARP" },
      { y: 220, name: "Físico",     color: "#94a3b8", desc: "Cabo, fibra, RF" },
    ].map((l, i) => (
      <g key={i}>
        <rect x={60} y={l.y} width={400} height={42} rx={8}
          fill={l.color} fillOpacity={0.12} stroke={l.color} strokeWidth={1.5} />
        <text x={80} y={l.y + 26} fill="#e2e8f0" fontSize="14" fontFamily="monospace" fontWeight="bold">{l.name}</text>
        <text x={440} y={l.y + 26} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="end">{l.desc}</text>
      </g>
    ))}
    <motion.circle r={6} fill="#06b6d4"
      initial={{ cx: 260, cy: 10, opacity: 0 }}
      animate={{ cx: [260, 260, 260, 260, 260], cy: [10, 41, 91, 141, 191, 241], opacity: [0, 1, 1, 1, 1, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

const EncapDiagram = () => (
  <svg viewBox="0 0 600 200" className="w-full h-auto">
    <defs>
      <linearGradient id="g1" x1="0" x2="1"><stop offset="0" stopColor="#a855f7" /><stop offset="1" stopColor="#a855f7" stopOpacity="0.6" /></linearGradient>
    </defs>
    {/* Application data (innermost) */}
    <g>
      <rect x={250} y={80} width={100} height={40} rx={4} fill="#a855f7" fillOpacity={0.25} stroke="#a855f7" />
      <text x={300} y={104} fill="#e9d5ff" fontSize="12" fontFamily="monospace" textAnchor="middle">HTTP</text>
    </g>
    {/* +TCP */}
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
      <rect x={210} y={75} width={40} height={50} rx={3} fill="#06b6d4" fillOpacity={0.25} stroke="#06b6d4" />
      <text x={230} y={104} fill="#a5f3fc" fontSize="10" fontFamily="monospace" textAnchor="middle">TCP</text>
    </motion.g>
    {/* +IP */}
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}>
      <rect x={170} y={70} width={40} height={60} rx={3} fill="#22c55e" fillOpacity={0.25} stroke="#22c55e" />
      <text x={190} y={104} fill="#bbf7d0" fontSize="10" fontFamily="monospace" textAnchor="middle">IP</text>
    </motion.g>
    {/* +ETH header */}
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.5 }}>
      <rect x={130} y={65} width={40} height={70} rx={3} fill="#fbbf24" fillOpacity={0.25} stroke="#fbbf24" />
      <text x={150} y={104} fill="#fde68a" fontSize="10" fontFamily="monospace" textAnchor="middle">ETH</text>
      {/* trailer */}
      <rect x={350} y={65} width={40} height={70} rx={3} fill="#fbbf24" fillOpacity={0.25} stroke="#fbbf24" />
      <text x={370} y={104} fill="#fde68a" fontSize="10" fontFamily="monospace" textAnchor="middle">FCS</text>
    </motion.g>
    {/* labels below */}
    <text x={300} y={170} fill="#94a3b8" fontSize="12" fontFamily="monospace" textAnchor="middle">
      cada camada adiciona seu cabeçalho na descida
    </text>
    {/* arrows */}
    <text x={70} y={108} fill="#64748b" fontSize="14" fontFamily="monospace">L1 →</text>
    <text x={530} y={108} fill="#64748b" fontSize="14" fontFamily="monospace">→</text>
  </svg>
);

const PostalAnalogy = () => (
  <svg viewBox="0 0 540 200" className="w-full h-auto">
    <g transform="translate(20, 50)">
      <rect width={120} height={100} rx={6} fill="#1e293b" stroke="#a855f7" strokeWidth={1.5} />
      <text x={60} y={30} fill="#e9d5ff" fontSize="11" fontFamily="monospace" textAnchor="middle">Mensagem</text>
      <text x={60} y={55} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">"Oi, João!"</text>
      <text x={60} y={85} fill="#a855f7" fontSize="9" fontFamily="monospace" textAnchor="middle">CAMADA 7</text>
    </g>
    <text x={150} y={108} fill="#64748b" fontSize="20">→</text>
    <g transform="translate(170, 50)">
      <rect width={120} height={100} rx={6} fill="#1e293b" stroke="#22c55e" strokeWidth={1.5} />
      <text x={60} y={30} fill="#bbf7d0" fontSize="11" fontFamily="monospace" textAnchor="middle">Envelope</text>
      <text x={60} y={50} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">Rua 5, nº 12</text>
      <text x={60} y={65} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">CEP 01310</text>
      <text x={60} y={85} fill="#22c55e" fontSize="9" fontFamily="monospace" textAnchor="middle">CAMADA 3 (IP)</text>
    </g>
    <text x={300} y={108} fill="#64748b" fontSize="20">→</text>
    <g transform="translate(320, 50)">
      <rect width={120} height={100} rx={6} fill="#1e293b" stroke="#fbbf24" strokeWidth={1.5} />
      <text x={60} y={30} fill="#fde68a" fontSize="11" fontFamily="monospace" textAnchor="middle">Saco postal</text>
      <text x={60} y={55} fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">Rota São Paulo</text>
      <text x={60} y={85} fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle">CAMADA 2 (Enlace)</text>
    </g>
    <text x={450} y={108} fill="#64748b" fontSize="20">→</text>
    <g transform="translate(470, 50)">
      <rect width={60} height={100} rx={6} fill="#1e293b" stroke="#94a3b8" strokeWidth={1.5} />
      <text x={30} y={45} fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle">Avião /</text>
      <text x={30} y={58} fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle">caminhão</text>
      <text x={30} y={85} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">L1</text>
    </g>
  </svg>
);

// ---------- Module ----------

export const module1: CourseModule = {
  id: 1,
  title: "Modelos de Camadas",
  subtitle: "Como qualquer comunicação na rede é organizada em camadas",
  briefing: "Antes de qualquer protocolo específico, você precisa entender o vocabulário: o que é uma camada, por que dividir a rede assim e como um pedaço de dado vira um sinal elétrico no cabo.",
  estimatedMinutes: 25,
  lessons: [
    {
      title: "A ideia de camadas",
      body: (
        <div className="space-y-5">
          <p className="text-slate-300 leading-relaxed">
            Toda comunicação em rede atravessa <strong className="text-cyan-300">camadas</strong>. Camada é só um nome bonito pra um nível de responsabilidade. Cada uma se preocupa com uma coisa só e ignora as outras.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Pensa em mandar uma carta:
          </p>
          <PostalAnalogy />
          <ul className="text-sm text-slate-400 leading-relaxed space-y-2 ml-4 list-disc">
            <li>Você escreve a <strong>mensagem</strong> (o conteúdo importa pra você e pro destinatário, e mais ninguém).</li>
            <li>Põe num <strong>envelope com endereço</strong> (a agência postal só lê o endereço — ela nem precisa abrir).</li>
            <li>O envelope vai pra um <strong>saco postal</strong> rumo a uma cidade (rotas, sub-rotas — coisa do correio).</li>
            <li>O saco viaja num <strong>caminhão ou avião</strong> (transporte físico, totalmente desligado do conteúdo).</li>
          </ul>
          <p className="text-slate-300 leading-relaxed">
            Cada camada faz o trabalho dela e <strong className="text-cyan-300">confia que a de baixo vai entregar</strong>. Se você troca o avião por um navio, a mensagem chega igual. Se você muda do português pro japonês, o avião não muda. <em>É essa independência que faz a internet escalar.</em>
          </p>
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">Por que importa</p>
            <p className="text-sm text-slate-300">Quando algo quebra na rede, a primeira pergunta é "<em>em qual camada?</em>". Cabo desconectado é camada 1. ARP errado é camada 2. Roteamento ruim é camada 3. Firewall barrando porta é camada 4. Configuração de site é camada 7. Dividir o problema em camadas economiza horas de debug.</p>
          </div>
        </div>
      ),
    },
    {
      title: "OSI: as 7 camadas teóricas",
      body: (
        <div className="space-y-5">
          <p className="text-slate-300 leading-relaxed">
            O <strong className="text-cyan-300">modelo OSI</strong> é a referência teórica criada nos anos 80. Tem 7 camadas, da mais "perto do fio" pra mais "perto do usuário":
          </p>
          <div className="bg-slate-900/40 border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
            {[
              { n: 7, name: "Aplicação",     desc: "É o que o usuário e o programa veem. HTTP, DNS, SSH, SMTP, FTP.", color: "text-purple-300" },
              { n: 6, name: "Apresentação",  desc: "Tradução de formato: TLS/SSL, codificação, criptografia, compressão.", color: "text-fuchsia-300" },
              { n: 5, name: "Sessão",        desc: "Abre, mantém e fecha 'conversas'. Pouco usada na prática moderna.", color: "text-pink-300" },
              { n: 4, name: "Transporte",    desc: "Comunicação fim-a-fim entre processos. TCP (confiável) e UDP (rápido). Portas vivem aqui.", color: "text-cyan-300" },
              { n: 3, name: "Rede",          desc: "Endereçamento e roteamento entre redes. IP, ICMP. 'Como chego de uma rede pra outra?'", color: "text-emerald-300" },
              { n: 2, name: "Enlace",        desc: "Comunicação dentro do mesmo segmento. MAC, Ethernet, Wi-Fi, ARP. Switches operam aqui.", color: "text-amber-300" },
              { n: 1, name: "Físico",        desc: "Bits virando sinais elétricos, ópticos ou de rádio. Cabo, fibra, antena.", color: "text-slate-300" },
            ].map((l) => (
              <div key={l.n} className="flex items-start gap-4 p-3">
                <span className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-sm ${l.color} shrink-0`}>{l.n}</span>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${l.color}`}>{l.name}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">Mnemônica</p>
            <p className="text-sm text-slate-300 italic">"<strong>P</strong>essoas <strong>E</strong>stão <strong>R</strong>ealmente <strong>T</strong>entando <strong>S</strong>uportar <strong>P</strong>rogramadores <strong>A</strong>borrecidos" → Físico, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação (de baixo pra cima).</p>
          </div>
        </div>
      ),
    },
    {
      title: "TCP/IP: o modelo que a internet realmente usa",
      body: (
        <div className="space-y-5">
          <p className="text-slate-300 leading-relaxed">
            OSI é didático e ótimo pra falar de teoria. Mas a internet não foi construída nele — foi construída no <strong className="text-cyan-300">TCP/IP</strong>, que tem só <strong>4 camadas</strong> e fez fundir ou ignorar algumas do OSI.
          </p>
          <LayerStackDiagram />
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-slate-900/40 border border-white/10 rounded-xl p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">OSI (7)</p>
              <ol className="text-sm text-slate-300 space-y-1">
                <li>7. Aplicação</li>
                <li>6. Apresentação</li>
                <li>5. Sessão</li>
                <li>4. Transporte</li>
                <li>3. Rede</li>
                <li>2. Enlace</li>
                <li>1. Físico</li>
              </ol>
            </div>
            <div className="bg-cyan-500/5 border border-cyan-500/30 rounded-xl p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">TCP/IP (4)</p>
              <ol className="text-sm text-slate-300 space-y-1">
                <li className="text-purple-300">Aplicação <span className="text-slate-500 text-xs">(funde 5+6+7 do OSI)</span></li>
                <li className="text-cyan-300">Transporte <span className="text-slate-500 text-xs">(= 4 do OSI)</span></li>
                <li className="text-emerald-300">Internet <span className="text-slate-500 text-xs">(= 3 do OSI)</span></li>
                <li className="text-amber-300">Acesso à Rede <span className="text-slate-500 text-xs">(funde 1+2 do OSI)</span></li>
              </ol>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm">
            Na prática, todo mundo mistura os dois. Você ouve "camada 2" (do OSI) e "camada de aplicação" (do TCP/IP) na mesma frase. <strong className="text-cyan-300">Não confunda — guarde os dois.</strong>
          </p>
        </div>
      ),
    },
    {
      title: "Encapsulamento: como um GET vira bits",
      body: (
        <div className="space-y-5">
          <p className="text-slate-300 leading-relaxed">
            Quando você abre <code className="text-cyan-300 font-mono text-sm">curl http://web.corp.local/admin</code>, o seguinte acontece, na ordem:
          </p>
          <EncapDiagram />
          <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
            <li><strong className="text-purple-300">Camada 7</strong>: o curl monta a requisição HTTP <code className="font-mono text-xs bg-slate-900 px-1 rounded">GET /admin HTTP/1.1\nHost: web.corp.local</code></li>
            <li><strong className="text-cyan-300">Camada 4</strong>: a stack TCP envolve isso num segmento, com <strong>porta de origem</strong> (digamos 53401) e <strong>porta de destino</strong> 80.</li>
            <li><strong className="text-emerald-300">Camada 3</strong>: o IP envolve o segmento num pacote, com <strong>IP de origem</strong> 192.168.1.42 e <strong>destino</strong> 192.168.1.50.</li>
            <li><strong className="text-amber-300">Camada 2</strong>: a placa de rede coloca isso num frame Ethernet, com <strong>MAC do gateway</strong> como destino (porque o IP está fora do switch direto, então passa pelo router).</li>
            <li><strong className="text-slate-300">Camada 1</strong>: os bytes viram pulsos elétricos no cabo (ou ondas de rádio no Wi-Fi).</li>
          </ol>
          <p className="text-slate-300 leading-relaxed">
            No outro lado, o processo se inverte: o frame é desenvolvido até a aplicação ler o HTTP. Cada camada <strong className="text-cyan-300">só remove o seu próprio cabeçalho</strong>. Isso se chama <strong>desencapsulamento</strong>.
          </p>
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">PDU (Protocol Data Unit) por camada</p>
            <ul className="text-sm text-slate-300 space-y-1 font-mono">
              <li>L7 → <span className="text-purple-300">data</span> (mensagem da aplicação)</li>
              <li>L4 → <span className="text-cyan-300">segment</span> (TCP) ou <span className="text-cyan-300">datagram</span> (UDP)</li>
              <li>L3 → <span className="text-emerald-300">packet</span></li>
              <li>L2 → <span className="text-amber-300">frame</span></li>
              <li>L1 → <span className="text-slate-300">bit</span></li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Quem opera onde",
      body: (
        <div className="space-y-5">
          <p className="text-slate-300 leading-relaxed">
            Cada equipamento de rede tem uma "altura" — até qual camada ele lê o pacote. Saber isso ajuda a entender por que um switch não roteia entre redes e por que um firewall consegue bloquear por porta.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { eq: "Hub",          layers: "1",       desc: "Repete o sinal pra todas as portas. Burro. Praticamente extinto.", color: "border-slate-500/30 text-slate-300" },
              { eq: "Switch",       layers: "2",       desc: "Lê o MAC de destino e entrega só na porta certa. Inteligente sobre o segmento local.", color: "border-amber-500/30 text-amber-300" },
              { eq: "Roteador",     layers: "3",       desc: "Lê o IP de destino e decide pra qual rede mandar. Conecta segmentos diferentes.", color: "border-emerald-500/30 text-emerald-300" },
              { eq: "Firewall",     layers: "3-4 (e até 7)", desc: "Filtra por IP e porta. Modernos (NGFW) inspecionam até a camada 7.", color: "border-red-500/30 text-red-300" },
              { eq: "Load balancer",layers: "4 ou 7",  desc: "L4 distribui por IP/porta. L7 distribui por host header, path, cookie.", color: "border-cyan-500/30 text-cyan-300" },
              { eq: "Proxy / CDN",  layers: "7",       desc: "Entende o protocolo da aplicação. Pode cachear, modificar, autenticar.", color: "border-purple-500/30 text-purple-300" },
              { eq: "NIC (placa)",  layers: "1-2",     desc: "Sua placa de rede. Converte bytes do SO em frames Ethernet.", color: "border-slate-500/30 text-slate-300" },
              { eq: "Browser / curl", layers: "7",     desc: "Aplicação pura. Só conversa em HTTP — quem cuida do resto é o sistema operacional.", color: "border-purple-500/30 text-purple-300" },
            ].map((it, i) => (
              <div key={i} className={`bg-slate-900/40 border rounded-xl p-3 ${it.color.split(" ")[0]}`}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className={`font-bold text-sm ${it.color.split(" ")[1]}`}>{it.eq}</p>
                  <p className="text-[10px] text-slate-500 font-mono">L{it.layers}</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{it.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">Pra fixar</p>
            <p className="text-sm text-slate-300">Se um pacote precisa <em>sair</em> da sua rede local, ele <strong>obrigatoriamente</strong> passa por um equipamento que entenda L3 (roteador). Switch sozinho nunca conecta redes diferentes.</p>
          </div>
        </div>
      ),
    },
  ],
  practice: [
    {
      id: "p1-ifconfig",
      prompt: "Liste sua interface com `ifconfig`. Identifique seu MAC (camada 2) e seu IP (camada 3).",
      hint: "Digite: ifconfig",
      expectedCommand: /^(ifconfig|ip\s+a)\s*$/i,
      output: [
        "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500",
        "        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255",
        "        ether 5c:f9:dd:1a:2b:3c  txqueuelen 1000  (Ethernet)",
        "        RX packets 18234  bytes 21340712",
        "lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536",
        "        inet 127.0.0.1  netmask 255.0.0.0",
      ],
      successMessage: "Boa. `inet` é sua camada 3 (IP). `ether` é sua camada 2 (MAC). Repare que coexistem na mesma interface.",
    },
    {
      id: "p1-ping",
      prompt: "Pingue o gateway (192.168.1.1). ICMP roda em qual camada?",
      hint: "Digite: ping 192.168.1.1",
      expectedCommand: /^ping\s+192\.168\.1\.1\s*$/i,
      output: [
        "PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.",
        "64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.2 ms",
        "64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=0.9 ms",
        "64 bytes from 192.168.1.1: icmp_seq=3 ttl=64 time=1.4 ms",
        "--- 192.168.1.1 ping statistics ---",
        "3 packets transmitted, 3 received, 0% packet loss",
      ],
      successMessage: "ICMP é camada 3 (Rede). Ele anda no IP, sem porta — repara que ping não usa número de porta.",
    },
    {
      id: "p1-arp",
      prompt: "Veja a tabela ARP local com `arp -a`. ARP traduz IP em quê?",
      hint: "Digite: arp -a",
      expectedCommand: /^arp\s+-a\s*$/i,
      output: [
        "? (192.168.1.1) at b8:27:eb:11:22:33 [ether] on eth0",
        "? (192.168.1.50) at 00:15:5d:aa:bb:cc [ether] on eth0",
      ],
      successMessage: "ARP traduz IP (L3) → MAC (L2). É a 'cola' que une as duas camadas mais baixas dentro de uma rede local.",
    },
    {
      id: "p1-curl",
      prompt: "Faça um GET HTTP no portal interno: `curl http://192.168.1.50`. Quantas camadas esse comando, sozinho, acaba envolvendo?",
      hint: "Digite: curl http://192.168.1.50",
      expectedCommand: /^curl\s+http:\/\/192\.168\.1\.50\/?\s*$/i,
      output: [
        "HTTP/1.1 200 OK",
        "Server: nginx/1.18.0",
        "Content-Type: text/html",
        "",
        "<h1>CorpHQ Internal Portal</h1>",
      ],
      successMessage: "Resposta: TODAS. O curl fala HTTP (L7), o SO fala TCP (L4), o IP roteia (L3), a placa Ethernet enquadra (L2), o cabo transporta (L1). Esse comando minúsculo aciona a stack inteira.",
    },
  ],
  quiz: [
    {
      q: "Um switch operates principalmente em qual camada do OSI?",
      options: ["1 — Físico", "2 — Enlace", "3 — Rede", "4 — Transporte"],
      correct: 1,
      explanation: "Switch lê endereços MAC (camada 2). Pra rotear entre redes diferentes você precisa de um roteador (camada 3).",
    },
    {
      q: "ARP serve para traduzir...",
      options: ["IP em nome de host", "IP em endereço MAC", "MAC em nome de host", "Porta em serviço"],
      correct: 1,
      explanation: "ARP (Address Resolution Protocol) descobre qual MAC corresponde a um IP no segmento local. Sem ARP, frames não chegariam ao destinatário certo.",
    },
    {
      q: "O que significa 'encapsulamento' em redes?",
      options: [
        "Criptografar o pacote antes de enviar",
        "Adicionar o cabeçalho de cada camada conforme o pacote desce a stack",
        "Dividir o pacote em fragmentos menores",
        "Calcular o checksum de verificação",
      ],
      correct: 1,
      explanation: "Cada camada empacota o que recebeu de cima e adiciona seu próprio cabeçalho. No destino, isso é desempacotado de baixo pra cima.",
    },
    {
      q: "Qual é a PDU (unidade de dado) da camada de transporte TCP?",
      options: ["Frame", "Pacote", "Segmento", "Bit"],
      correct: 2,
      explanation: "L4 TCP = segmento. UDP = datagrama. L3 = pacote. L2 = frame. L1 = bit.",
    },
    {
      q: "HTTP vive em qual camada do OSI?",
      options: ["4 — Transporte", "5 — Sessão", "6 — Apresentação", "7 — Aplicação"],
      correct: 3,
      explanation: "HTTP é protocolo de aplicação (L7). Ele usa TCP (L4) por baixo, mas o protocolo em si é L7.",
    },
    {
      q: "Por que separamos a rede em camadas?",
      options: [
        "Pra deixar a comunicação mais lenta e segura",
        "Pra cada camada poder evoluir/ser trocada sem afetar as outras",
        "Porque é exigência da ITU desde 1980",
        "Pra reduzir o uso de memória do roteador",
      ],
      correct: 1,
      explanation: "Modularidade: você troca cabo de cobre por fibra (L1) e nada na pilha acima precisa mudar. É o princípio que faz a internet escalar e durar.",
    },
  ],
  boss: {
    title: "Disseque o pacote",
    description: "Capturamos um pacote real saindo da sua máquina pro servidor web. Cada bloco abaixo é um cabeçalho. Atribua cada um à sua camada correta. Acerte os 4 pra fechar o módulo.",
    fields: [
      { label: "ff:ff:ff:ff:ff:ff → 5c:f9:dd:1a:2b:3c (Ethernet)", layer: 2, example: "MAC origem/destino, EtherType 0x0800" },
      { label: "192.168.1.42 → 192.168.1.50, TTL=64, Proto=TCP",     layer: 3, example: "IP origem/destino, TTL, protocolo" },
      { label: "src port 53401 → dst port 80, [SYN, ACK], seq=1234", layer: 4, example: "porta, flags TCP, sequence number" },
      { label: "GET /admin HTTP/1.1\\nHost: web.corp.local",         layer: 7, example: "método HTTP, path, headers de aplicação" },
    ],
  },
};
