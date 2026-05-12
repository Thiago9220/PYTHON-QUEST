import {
  Activity,
  BookOpen,
  Crosshair,
  Radar,
  ShieldAlert,
  TerminalSquare,
  type LucideIcon,
} from "lucide-react";

export interface KnowledgeItem {
  title: string;
  body: string;
  framework?: string;
  examples?: string[];
}

export interface IntroSlide {
  title: string;
  eyebrow: string;
  body: string;
  icon: LucideIcon;
  items: { label: string; text: string }[];
  command?: string;
}

export interface QuizOption {
  text: string;
  correct?: boolean;
}

export interface AttackQuiz {
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface AttackStep {
  id: string;
  title: string;
  phase: string;
  command: string;
  objective: string;
  safety: string;
  defense: string;
  mitre: { tactic: string; technique: string };
  owasp?: string;
  nistCsf: string[];
  realTools: string[];
  quiz: AttackQuiz;
}

export interface MissionConcept {
  title: string;
  label: string;
  body: string;
  checks: string[];
  nistCsf?: string;
  reference?: string;
}

export const PRINCIPLES: KnowledgeItem[] = [
  {
    title: "Confidencialidade, Integridade e Disponibilidade (CIA)",
    body: "Proteja dados sensíveis, garanta que não sejam alterados sem autorização e mantenha os serviços essenciais operando. É a base de qualquer modelo de ameaça.",
    framework: "ISO/IEC 27000 · NIST SP 800-12",
    examples: ["TLS protege C", "Hash + assinatura protege I", "Redundância e backups protegem A"],
  },
  {
    title: "Menor privilégio (PoLP)",
    body: "Cada usuário, serviço e chave deve ter apenas o acesso necessário. Menos permissão reduz o dano quando algo falha.",
    framework: "NIST SP 800-53 AC-6 · CIS Control 6",
    examples: ["sudo restrito a um grupo", "IAM por escopo de recurso", "DB role separado para leitura"],
  },
  {
    title: "Defesa em profundidade",
    body: "Combine camadas: MFA, segmentação, logs, EDR, backups, hardening, revisão de código e resposta a incidentes. Nenhuma camada sozinha é suficiente.",
    framework: "NIST CSF · OWASP ASVS",
    examples: ["WAF + prepared statements + auditoria", "VPN + MFA + condicional"],
  },
  {
    title: "Zero Trust",
    body: "Não confie apenas na rede. Verifique identidade, dispositivo, contexto e comportamento antes de liberar acesso. 'Never trust, always verify'.",
    framework: "NIST SP 800-207",
    examples: ["mTLS entre serviços", "Conditional Access por device posture", "Re-autenticação em ação sensível"],
  },
];

export const ATTACKS: KnowledgeItem[] = [
  {
    title: "Phishing e engenharia social",
    body: "O invasor tenta convencer a vítima a entregar credenciais, abrir anexos ou autorizar ações. Defesa: treinamento, filtros, MFA resistente a phishing e verificação fora do canal.",
    framework: "MITRE ATT&CK T1566 · OWASP Top 10 Hum.",
    examples: ["Fatura urgente com link falso", "Pedido de pagamento por WhatsApp", "MFA fatigue (push bombing)"],
  },
  {
    title: "Credential Stuffing",
    body: "Senhas vazadas em outros sites são testadas em contas corporativas. Diferente de brute force, usa pares user/senha reais. Defesa: MFA, senhas únicas, rate limit e monitoramento.",
    framework: "MITRE T1110.004 · OWASP A07:2021",
    examples: ["Falhas distribuídas de muitos IPs", "Picos fora do horário comercial", "Sucesso isolado entre falhas"],
  },
  {
    title: "Injeção SQL",
    body: "Entradas não validadas alteram consultas ao banco. Permite leitura indevida, alteração ou exclusão de dados. Defesa: queries parametrizadas, validação, testes de segurança e WAF.",
    framework: "MITRE T1190 · OWASP A03:2021 · CWE-89",
    examples: ["' OR 1=1 -- ", "UNION SELECT em campo de busca", "Erros de banco vazando no JSON"],
  },
  {
    title: "Ransomware",
    body: "Malware criptografa dados e pressiona a organização. Costuma chegar por phishing ou serviço exposto. Defesa: EDR, menor privilégio, segmentação, patching e backups imutáveis testados.",
    framework: "MITRE T1486 · NIST IR 8374",
    examples: ["LockBit, BlackCat/ALPHV, Conti", "Dupla extorsão (cripto + leak)"],
  },
  {
    title: "Exposição de serviços",
    body: "SSH, banco, RDP ou painéis administrativos abertos na internet viram alvos. Defesa: VPN, allowlist, firewall, inventário contínuo e ASM (Attack Surface Management).",
    framework: "MITRE T1133 · CIS Control 12",
    examples: ["SSH 22 público em produção", "RDP exposto sem NLA", "Painel /admin sem auth"],
  },
];

export const DEFENSES: KnowledgeItem[] = [
  {
    title: "Inventário e superfície de ataque",
    body: "Você só protege bem o que conhece. Liste ativos, donos, portas, dados sensíveis, dependências e exposição externa. Mantenha vivo, não estático.",
    framework: "NIST CSF ID.AM · CIS Controls 1 & 2",
    examples: ["CMDB com criticidade", "EASM contínuo", "SBOM por aplicação"],
  },
  {
    title: "Hardening",
    body: "Remova padrões inseguros, feche portas, atualize sistemas, aplique headers, proteja segredos e automatize configurações seguras (IaC).",
    framework: "CIS Benchmarks · NIST CSF PR.IP",
    examples: ["Headers CSP/HSTS/X-Content-Type", "ssh sem senha", "Hashicorp Vault para segredos"],
  },
  {
    title: "Detecção e resposta (SOC)",
    body: "Colete logs, crie alertas úteis, investigue evidências, contenha o impacto, erradique a causa e documente lições aprendidas. Métricas: MTTD e MTTR.",
    framework: "NIST CSF DE/RS · NIST SP 800-61",
    examples: ["SIEM com regras MITRE", "Playbook de phishing", "Post-mortem sem culpa"],
  },
  {
    title: "Backups resilientes (3-2-1-1-0)",
    body: "3 cópias, 2 mídias, 1 offsite, 1 imutável/offline, 0 erros no restore testado. Backup que não restaura equivale a não ter backup.",
    framework: "NIST CSF PR.IP-4 / RC.RP",
    examples: ["Object Lock S3", "Restore drill trimestral", "Acesso ao cofre separado do admin geral"],
  },
];

export const INTRO_SLIDES: IntroSlide[] = [
  {
    eyebrow: "Visão geral",
    title: "O que é este laboratório",
    icon: ShieldAlert,
    body: "Este módulo ensina cibersegurança como um ciclo completo alinhado a NIST CSF, OWASP e MITRE ATT&CK: você entende o ataque, observa evidências, toma decisões de defesa e mede se o risco caiu.",
    items: [
      { label: "Tudo é simulado", text: "Alvos, logs, alertas e ataques são fictícios. Nenhum comando toca sistemas reais." },
      { label: "Frameworks reais", text: "Cada passo é mapeado em MITRE ATT&CK, OWASP Top 10 e funções do NIST CSF." },
      { label: "Objetivo", text: "Sair sabendo conectar técnica de ataque, evidência, impacto e controle defensivo." },
    ],
  },
  {
    eyebrow: "Modos",
    title: "Como escolher o modo certo",
    icon: BookOpen,
    body: "O laboratório tem três formas de estudar. Você pode alternar entre elas a qualquer momento sem perder o progresso do nível atual.",
    items: [
      { label: "Modo guiado", text: "Mostra uma missão por vez, com conceito, comando recomendado e painéis abertos sob demanda." },
      { label: "Modo SOC", text: "Mostra terminal, mapa, alertas, base de conhecimento e controles ao mesmo tempo (visão Blue Team)." },
      { label: "Modo Ataque", text: "AttackBox didática para entender a cadeia ofensiva (Red Team) sem payload real." },
    ],
  },
  {
    eyebrow: "Terminal",
    title: "Saídas de ferramentas reais",
    icon: TerminalSquare,
    body: "O terminal devolve saídas no formato real de nmap, curl, whatweb, syslog e psql — pré-gravadas e didáticas. Isso treina sua leitura de evidência como em um SOC ou pentest de verdade.",
    command: "help",
    items: [
      { label: "Prompts", text: "analyst@soc indica investigação defensiva; student@attackbox indica simulação ofensiva." },
      { label: "Decoder", text: "Toda saída técnica vem com um bloco [ decoder ] explicando o que cada linha significa." },
      { label: "Histórico", text: "Use as setas do teclado para recuperar comandos já digitados." },
    ],
  },
  {
    eyebrow: "Métricas",
    title: "Como ler o topo da tela",
    icon: Activity,
    body: "As métricas resumem o estado do laboratório e ajudam você a entender se está melhorando a postura de segurança — é assim que se reporta a liderança.",
    items: [
      { label: "Risco", text: "Pontuação de 0 a 100 calculada com exposição, fraquezas abertas e controles fracos." },
      { label: "Alertas", text: "Mostra quantos alertas foram contidos em relação ao total existente (mede MTTR conceitual)." },
      { label: "Controles fortes", text: "Conta quantos controles foram reforçados nos ativos (NIST CSF Protect)." },
      { label: "Nível ou Ataque", text: "No modo normal mostra o nível; no modo ataque mostra etapas da Cyber Kill Chain concluídas." },
    ],
  },
  {
    eyebrow: "Painéis",
    title: "O que cada painel representa",
    icon: Radar,
    body: "Os painéis transformam o terminal em uma investigação visual. Mostram onde estão os ativos, quais alertas existem e quais defesas ainda estão fracas.",
    items: [
      { label: "Ambiente", text: "Mapa dos ativos, zonas e sinais de risco no cenário." },
      { label: "Alertas", text: "Fila de eventos suspeitos para investigar, conter ou fechar (workflow SOC L1→L3)." },
      { label: "Ativos e Controles", text: "Lista de sistemas, fraquezas abertas e estado dos controles (gap analysis)." },
      { label: "Base de Conhecimento", text: "Resumo rápido de princípios, ataques e defesas com referência de framework." },
    ],
  },
  {
    eyebrow: "Fluxo de estudo",
    title: "Como avançar sem se perder",
    icon: Crosshair,
    body: "Siga a missão atual primeiro. Quando quiser explorar, use a Base de Conhecimento e o Modo Ataque para entender o outro lado do mesmo problema.",
    command: "inventario",
    items: [
      { label: "1. Leia a missão", text: "Ela indica o comando principal e o motivo de segurança daquela etapa." },
      { label: "2. Execute no terminal", text: "O simulador responde com evidência fac-símile, risco ou correção." },
      { label: "3. Responda o quiz", text: "No Modo Ataque, cada etapa fecha com uma pergunta de compreensão." },
      { label: "4. Conecte ataque e defesa", text: "Compare a técnica MITRE com o controle NIST CSF que a quebra." },
    ],
  },
];

export const ATTACK_STEPS: AttackStep[] = [
  {
    id: "attack_scope",
    title: "Escopo e regras de engajamento",
    phase: "Preparação",
    command: "ambiente ataque",
    objective: "Definir o que pode e o que NÃO pode ser feito. Pentest sem escopo formal é crime, não exercício.",
    safety: "Nada aqui executa tráfego real, força senha, entrega malware ou exibe payload reutilizável.",
    defense: "Todo exercício ofensivo termina conectado a evidências e controles defensivos (PTES, OSSTMM).",
    mitre: { tactic: "TA0042 Resource Development", technique: "Engagement Scoping (PTES Pre-engagement)" },
    nistCsf: ["Identify"],
    realTools: ["Rules of Engagement (ROE)", "PTES Pre-engagement", "NDA"],
    quiz: {
      question: "Qual desses está SEMPRE fora do escopo de um laboratório didático de segurança?",
      options: [
        { text: "Mapear portas de ativos fictícios autorizados" },
        { text: "Capturar headers HTTP do alvo simulado" },
        { text: "Testar credenciais reais de funcionários ou sistemas em produção", correct: true },
        { text: "Documentar achados em formato de relatório" },
      ],
      explanation:
        "Testar credenciais reais sem autorização formal viola lei (no Brasil: art. 154-A do CP) e princípios de engajamento. Mesmo em pentest contratado é preciso ROE assinada antes.",
    },
  },
  {
    id: "attack_recon_portal-web",
    title: "Reconhecimento ativo (port scan)",
    phase: "Recon",
    command: "recon portal-web",
    objective: "Mapear serviços, versões e portas abertas. É o que o atacante vê antes de qualquer tentativa.",
    safety: "A saída é pré-calculada e limitada aos ativos fictícios do jogo.",
    defense: "Inventário (ID.AM), firewall (PR.AC) e ASM contínuo reduzem o que o atacante enxerga.",
    mitre: { tactic: "TA0043 Reconnaissance", technique: "T1595.001 Active Scanning: Scanning IP Blocks" },
    nistCsf: ["Identify", "Protect"],
    realTools: ["nmap", "masscan", "rustscan", "Shodan", "Censys"],
    quiz: {
      question: "nmap retornou 22/tcp open ssh OpenSSH 8.2 na DMZ. Qual é a PRIMEIRA ação defensiva?",
      options: [
        { text: "Atualizar o OpenSSH para a versão mais recente" },
        { text: "Bloquear SSH público; expor só via VPN ou allowlist administrativa", correct: true },
        { text: "Adicionar mais usuários sysadmin para revezamento" },
        { text: "Habilitar autenticação por senha além de chave" },
      ],
      explanation:
        "Patch é importante, mas reduzir a superfície vem antes. SSH administrativo NÃO deve ficar exposto à internet (NIST CSF PR.AC-5 — proteção da integridade de rede).",
    },
  },
  {
    id: "attack_fingerprint_portal-web",
    title: "Fingerprint da aplicação (headers e tech)",
    phase: "Enumeração",
    command: "fingerprint portal-web",
    objective: "Identificar tecnologia, framework e configurações inseguras antes de procurar falhas específicas.",
    safety: "O laboratório mostra sinais didáticos, sem instruções de exploração real.",
    defense: "Headers de segurança (CSP, HSTS, X-Frame-Options), omitir Server, validação, logs e patching reduzem chance de abuso.",
    mitre: { tactic: "TA0043 Reconnaissance", technique: "T1592.002 Gather Victim Host Information: Software" },
    owasp: "A05:2021 Security Misconfiguration",
    nistCsf: ["Protect"],
    realTools: ["whatweb", "curl -I", "wappalyzer", "httpx", "nikto"],
    quiz: {
      question: "Cookie SESSIONID sem flag HttpOnly significa que...",
      options: [
        { text: "O cookie é mais leve para o servidor" },
        { text: "JavaScript do navegador pode lê-lo, viabilizando roubo via XSS", correct: true },
        { text: "O cookie é automaticamente criptografado" },
        { text: "Só conexões HTTPS aceitam o cookie" },
      ],
      explanation:
        "Sem HttpOnly, código JS (inclusive XSS injetado) lê document.cookie e exfiltra a sessão. Defesa: Set-Cookie SESSIONID=...; HttpOnly; Secure; SameSite=Strict.",
    },
  },
  {
    id: "attack_sqli_portal-web",
    title: "Exploração simulada de SQL Injection",
    phase: "Exploração",
    command: "simular-sqli portal-web",
    objective: "Ver o impacto conceitual de uma falha de entrada sem payload, bypass ou extração real.",
    safety: "O teste só marca evidências fictícias e não ensina cadeia operacional reutilizável.",
    defense: "Prepared statements são a defesa primária. WAF, validação e testes de regressão são camadas extras.",
    mitre: { tactic: "TA0001 Initial Access", technique: "T1190 Exploit Public-Facing Application" },
    owasp: "A03:2021 Injection (CWE-89)",
    nistCsf: ["Protect", "Detect"],
    realTools: ["sqlmap (autorizado)", "Burp Suite", "OWASP ZAP"],
    quiz: {
      question: "Qual é a defesa PRIMÁRIA contra SQL Injection?",
      options: [
        { text: "WAF com assinatura genérica" },
        { text: "Hash da senha do usuário em bcrypt" },
        { text: "Prepared statements / queries parametrizadas com binding", correct: true },
        { text: "Rate limit no endpoint de login" },
      ],
      explanation:
        "Prepared statements separam código de dados na consulta — a entrada nunca é interpretada como SQL. WAF ajuda como camada adicional, mas é contornável; bcrypt e rate limit resolvem problemas diferentes.",
    },
  },
  {
    id: "attack_creds_idp",
    title: "Credential Stuffing contra o IdP",
    phase: "Acesso a credenciais",
    command: "cred-test idp",
    objective: "Entender por que MFA, rate limit e detecção comportamental protegem contas privilegiadas.",
    safety: "Não há lista de senhas, brute force, automação de login ou alvo externo.",
    defense: "MFA resistente a phishing (FIDO2/WebAuthn), bloqueio progressivo, alerta SIEM e revisão de sessões.",
    mitre: { tactic: "TA0006 Credential Access", technique: "T1110.004 Brute Force: Credential Stuffing" },
    owasp: "A07:2021 Identification & Authentication Failures",
    nistCsf: ["Protect", "Detect"],
    realTools: ["SIEM (Splunk, Elastic)", "Have I Been Pwned API", "FIDO2 keys"],
    quiz: {
      question: "47 IPs distintos tentando admin@corp em 60s. Qual técnica MITRE descreve melhor isso?",
      options: [
        { text: "T1110.001 Password Guessing (uma senha por vez)" },
        { text: "T1110.003 Password Spraying (uma senha em muitas contas)" },
        { text: "T1110.004 Credential Stuffing (pares user/senha de leaks)", correct: true },
        { text: "T1078 Valid Accounts (já tem credencial)" },
      ],
      explanation:
        "Stuffing usa combos de leaks anteriores, espalhando-se entre muitos IPs (residencial proxies, botnet) para escapar de rate limit por origem. Defesa: MFA + detecção de anomalia comportamental.",
    },
  },
  {
    id: "attack_pivot_db",
    title: "Movimento lateral para o banco",
    phase: "Lateral Movement",
    command: "pivot-sim db-core",
    objective: "Mostrar como segmentação fraca aproxima o atacante do banco crítico.",
    safety: "O pivot é narrativo e não abre shell, túnel, sessão ou comando real.",
    defense: "Segmentação (pg_hba.conf restritivo, security groups), ACL por origem, menor privilégio e auditoria.",
    mitre: { tactic: "TA0008 Lateral Movement", technique: "T1021 Remote Services" },
    nistCsf: ["Protect"],
    realTools: ["psql", "BloodHound (AD)", "CrackMapExec", "Chisel/SSF (tunneling)"],
    quiz: {
      question: "Por que um pg_hba.conf restrito a 10.10.10.20 quebra a cadeia neste passo?",
      options: [
        { text: "Porque criptografa a conexão TLS" },
        { text: "Porque o banco só aceita origens autorizadas, bloqueando lateral movement", correct: true },
        { text: "Porque desativa o usuário 'app_readonly'" },
        { text: "Porque acelera as consultas SQL" },
      ],
      explanation:
        "pg_hba.conf é o controle de acesso de host do PostgreSQL. Restringir origem mata o caminho de pivot mesmo se o atacante já tem credencial — princípio Zero Trust aplicado em camada de rede + identidade.",
    },
  },
  {
    id: "attack_impact_db",
    title: "Impacto e obrigações regulatórias",
    phase: "Impacto",
    command: "impacto-sim db-core",
    objective: "Classificar dados afetados e transformar impacto técnico em prioridade de correção e notificação legal.",
    safety: "O exercício não mostra dados reais nem técnica de exfiltração.",
    defense: "Criptografia at-rest, auditoria separada, backups testados e plano de resposta com notificação.",
    mitre: { tactic: "TA0010 Exfiltration", technique: "T1041 Exfiltration Over C2 Channel (não executado)" },
    nistCsf: ["Respond", "Recover"],
    realTools: ["LGPD (BR)", "GDPR (EU)", "Cofre separado para audit_log"],
    quiz: {
      question: "Banco com customers + invoices é comprometido no Brasil. Qual obrigação a empresa tem?",
      options: [
        { text: "Apagar logs para preservar a privacidade dos titulares" },
        { text: "Notificar ANPD e titulares em prazo razoável (LGPD art. 48)", correct: true },
        { text: "Trocar de provedor de hospedagem antes de comunicar" },
        { text: "Nenhuma obrigação, se o ataque foi externo" },
      ],
      explanation:
        "A LGPD (art. 48) exige comunicação à ANPD e aos titulares em prazo razoável quando o incidente puder gerar risco. Apagar logs é destruição de evidência — agrava o caso. GDPR pede 72h.",
    },
  },
  {
    id: "attack_report",
    title: "Relatório ofensivo e Cyber Kill Chain",
    phase: "Fechamento",
    command: "relatorio ataque",
    objective: "Fechar a cadeia com causa, evidência, impacto, risco e recomendações alinhadas a NIST CSF.",
    safety: "O relatório descreve o caminho em linguagem didática, sem payloads ou procedimentos abusáveis.",
    defense: "A correção prioriza controles que quebram a cadeia o mais cedo possível (shift-left).",
    mitre: { tactic: "Cyber Kill Chain (Lockheed Martin)", technique: "End-to-end reporting" },
    nistCsf: ["Respond", "Recover"],
    realTools: ["Dradis", "PlexTrac", "templates SANS / NIST SP 800-61"],
    quiz: {
      question: "Qual função do NIST CSF cobre 'lições aprendidas e melhorias após incidente'?",
      options: [
        { text: "Identify (gestão de ativos e risco)" },
        { text: "Protect (controles preventivos)" },
        { text: "Respond — categoria Improvements (RS.IM)", correct: true },
        { text: "Recover (restauração de capacidades)" },
      ],
      explanation:
        "RS.IM (Response Improvements) define que as atividades de resposta sejam aprimoradas com lições aprendidas. Recover também tem RC.IM, focado em melhoria do plano de recuperação especificamente.",
    },
  },
];

export const MISSION_CONCEPTS: Record<string, MissionConcept> = {
  principles: {
    title: "Pense como defensor",
    label: "Fundamento",
    body: "Antes de usar ferramenta, defina o que precisa proteger e qual princípio justifica cada controle.",
    checks: ["Identifique dado sensível (CIA)", "Reduza permissão (PoLP)", "Adicione mais de uma camada (Defense-in-Depth)"],
    nistCsf: "Identify",
    reference: "NIST SP 800-12 · ISO 27001 A.5",
  },
  inventory: {
    title: "Inventário defensivo (ID.AM)",
    label: "Superfície",
    body: "Inventário não é lista decorativa: ele mostra dono, criticidade, zona e exposição de cada ativo. NIST CSF ID.AM-1/2 exige inventário de hardware e software.",
    checks: ["Quem é o dono?", "Qual a criticidade?", "Está exposto na internet?"],
    nistCsf: "Identify",
    reference: "NIST CSF ID.AM-1 · CIS Controls 1 & 2",
  },
  scan: {
    title: "Superfície de ataque",
    label: "Reconhecimento",
    body: "Mapear portas com nmap revela serviços que precisam ser fechados, filtrados ou monitorados. É o mesmo que o atacante faz primeiro.",
    checks: ["Porta aberta tem justificativa de negócio?", "Administração está restrita a VPN?", "Serviço precisa de patch?"],
    nistCsf: "Identify",
    reference: "MITRE T1595 · nmap.org",
  },
  risk: {
    title: "Priorização por risco",
    label: "Decisão",
    body: "Risco = impacto × probabilidade. Combina ativo crítico, exposição, falha explorável e força dos controles existentes.",
    checks: ["Impacto no negócio (CIA)", "Probabilidade de exploração (CVSS, KEV)", "Controle compensatório"],
    nistCsf: "Identify",
    reference: "NIST SP 800-30 · FAIR · CVSS v3.1",
  },
  attacks: {
    title: "Entender ataques com segurança",
    label: "Ameaça",
    body: "O objetivo é reconhecer padrões (TTPs) e conectar cada um a uma defesa concreta. MITRE ATT&CK é o catálogo padrão.",
    checks: ["Qual é o alvo?", "Qual evidência aparece?", "Qual controle reduz o dano?"],
    nistCsf: "Detect",
    reference: "MITRE ATT&CK · OWASP Top 10",
  },
  sqli: {
    title: "Injeção SQL (OWASP A03:2021)",
    label: "Aplicação",
    body: "A falha nasce quando a entrada do usuário influencia uma consulta. A defesa primária é consulta parametrizada — separa código de dado.",
    checks: ["Não exibir payload real", "Registrar erro sem vazar dado sensível", "Corrigir causa raiz (prepared)"],
    nistCsf: "Protect",
    reference: "OWASP A03:2021 · CWE-89",
  },
  logs: {
    title: "Logs viram evidência (DE.AE)",
    label: "Investigação",
    body: "Logs bons separam suspeita de incidente. Devem ter: timestamp, ator, ação, recurso, resultado.",
    checks: ["Evento de autenticação", "Erro de aplicação", "Ação administrativa"],
    nistCsf: "Detect",
    reference: "NIST CSF DE.AE-3 · SP 800-92",
  },
  patch: {
    title: "Corrigir a causa raiz",
    label: "Correção",
    body: "Bloquear um indicador ajuda no curto prazo, mas proteção real vem de remover a falha que permitiu o ataque.",
    checks: ["Prepared statements", "Validação server-side", "Teste de regressão automatizado"],
    nistCsf: "Protect",
    reference: "NIST CSF PR.IP-12 · OWASP ASVS V5",
  },
  mfa: {
    title: "Identidade forte (MFA)",
    label: "Acesso",
    body: "Senhas vazam. MFA resistente a phishing (FIDO2/WebAuthn), rate limit e revisão de sessões reduzem impacto de credenciais comprometidas.",
    checks: ["MFA FIDO2 para admin", "Bloqueio progressivo", "Alerta de login impossível/anômalo"],
    nistCsf: "Protect",
    reference: "NIST SP 800-63B · CISA MFA guidance",
  },
  phishing: {
    title: "Phishing (MITRE T1566)",
    label: "Pessoa",
    body: "Ataques sociais exploram pressa, autoridade e confiança. Defesa combina verificação, filtros, MFA e treinamento.",
    checks: ["Remetente e domínio", "Anexo e link", "Pedido fora do padrão"],
    nistCsf: "Detect",
    reference: "MITRE T1566 · NIST SP 800-177",
  },
  edr: {
    title: "Investigação no endpoint (EDR)",
    label: "Endpoint",
    body: "EDR mostra processos, conexões e persistência. Use para confirmar impacto antes de erradicar.",
    checks: ["Processo suspeito (LOLBins)", "Origem da execução (parent process)", "Conexão externa (IoC)"],
    nistCsf: "Detect",
    reference: "MITRE T1055 / T1547 · CrowdStrike/Defender/SentinelOne",
  },
  isolate: {
    title: "Contenção (RS.MI)",
    label: "Resposta",
    body: "Isolar reduz movimento lateral (blast radius) e preserva evidências para forense.",
    checks: ["Limitar comunicação (network containment)", "Preservar artefatos (memory, disk image)", "Avisar time afetado"],
    nistCsf: "Respond",
    reference: "NIST CSF RS.MI · SP 800-61r2",
  },
  block: {
    title: "Indicadores confirmados (IoC)",
    label: "Bloqueio",
    body: "Depois de confirmar um indicador, transforme em bloqueio nos controles certos e compartilhe com a comunidade (MISP, STIX/TAXII).",
    checks: ["DNS filtering / RPZ", "Gateway de email (allow/deny list)", "EDR custom indicator"],
    nistCsf: "Respond",
    reference: "MISP · STIX 2.1 · CISA AIS",
  },
  firewall: {
    title: "Acesso administrativo",
    label: "Perímetro",
    body: "SSH, RDP e painéis administrativos devem ficar atrás de VPN, allowlist e autenticação forte (bastion / jump host).",
    checks: ["Fechar exposição direta à internet", "Exigir chave forte + MFA", "Revisar regras periodicamente"],
    nistCsf: "Protect",
    reference: "NIST CSF PR.AC-5 · CIS Control 12",
  },
  dbacl: {
    title: "Segmentação de dados",
    label: "Banco",
    body: "Banco crítico deve aceitar conexão apenas de origens necessárias e contas com menor privilégio (RBAC).",
    checks: ["ACL por origem (pg_hba/security group)", "Conta mínima (RBAC)", "Auditoria ligada"],
    nistCsf: "Protect",
    reference: "NIST CSF PR.AC-5 · PostgreSQL pg_hba.conf",
  },
  backup: {
    title: "Backup que restaura (3-2-1-1-0)",
    label: "Resiliência",
    body: "Backup só tem valor quando a restauração foi testada e o acesso ao cofre está protegido (idealmente imutável).",
    checks: ["Restore testado periodicamente", "Imutabilidade (Object Lock)", "Acesso separado do admin geral"],
    nistCsf: "Recover",
    reference: "NIST CSF PR.IP-4 / RC.RP · Veeam 3-2-1-1-0",
  },
  incident: {
    title: "Relatório de incidente (NIST SP 800-61)",
    label: "Melhoria",
    body: "Fechamento registra causa, impacto, contenção, erradicação e melhorias. Sem culpa (blameless post-mortem).",
    checks: ["Causa raiz", "Impacto e timeline", "Ações preventivas (RS.IM)"],
    nistCsf: "Respond",
    reference: "NIST SP 800-61r2 · SANS IR Handbook",
  },
  score: {
    title: "Segurança contínua",
    label: "Postura",
    body: "O score não é fim do trabalho; mostra se os principais riscos do laboratório foram reduzidos. Métricas reais: MTTD, MTTR, % de controles fortes.",
    checks: ["Risco abaixo do limite", "Alertas contidos (MTTR)", "Controles fortes (% de cobertura)"],
    nistCsf: "Identify",
    reference: "NIST CSF · CIS CSAT",
  },
};

export const ATTACK_TERMINAL_OUTPUT: Record<string, string[]> = {
  attack_scope: [
    "$ cat ./engagement/rules-of-engagement.md",
    "",
    "# Rules of Engagement — Cyber Lab Pythoneer v3",
    "Cliente:        Empresa fictícia 'Corp Lab'",
    "Janela:         2026-05-10 09:00 → 2026-05-12 18:00 BRT",
    "Escopo IN:      172.16.50.0/24, ativos: portal-web, idp, db-core, ws-17, backup-vault",
    "Escopo OUT:     internet pública, contas reais, cadeia de fornecedores, DoS, brute-force real",
    "Contato:        soc@corplab.test (ack obrigatório antes de qualquer teste)",
    "Notificação:    incidente real → parar imediatamente e ligar para o SOC",
    "",
    "AttackBox  online  →  172.16.50.10  (rede isolada)",
    "Operator:  student@attackbox  (acesso temporário, expira em 48h)",
    "",
    "[ decoder ]",
    "ROE define o contrato técnico-legal entre pentester e cliente (PTES Pre-engagement).",
    "Sem ROE assinada, qualquer teste é não-autorizado → art. 154-A CP (BR) / CFAA (US).",
    "Defesa equivalente: gestão de fornecedores e contratos (NIST CSF ID.SC-3).",
  ],

  "attack_recon_portal-web": [
    "$ nmap -Pn -sV --top-ports 1000 -oN recon-portalweb.txt 10.10.10.20",
    "Starting Nmap 7.94 ( https://nmap.org ) at 2026-05-11 13:02 BRT",
    "Nmap scan report for portal-web.lab.local (10.10.10.20)",
    "Host is up (0.0034s latency).",
    "Not shown: 997 closed tcp ports (reset)",
    "",
    "PORT     STATE  SERVICE   VERSION",
    "22/tcp   open   ssh       OpenSSH 8.2p1 Ubuntu (protocol 2.0)",
    "80/tcp   open   http      nginx 1.18.0  (302 → /login)",
    "443/tcp  open   ssl/http  nginx 1.18.0  (Subject: CN=portal.corplab.test)",
    "",
    "Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel",
    "Nmap done: 1 IP address (1 host up) scanned in 6.21 seconds",
    "",
    "[ decoder ]",
    "22/tcp aberto → SSH público é alto risco; deveria estar atrás de VPN/allowlist (CSF PR.AC-5).",
    "80→302→/login revela endpoint de autenticação; alvo natural para SQLi/Stuffing.",
    "nginx 1.18.0 → conferir CVE-2021-23017 (DNS resolver, alta). Patch nível de SO.",
    "Certificado interno (.test) → ok pra lab; em produção forçar CT logs e domain validation.",
  ],

  "attack_fingerprint_portal-web": [
    "$ whatweb -a 3 https://10.10.10.20/",
    "https://10.10.10.20/ [200 OK]",
    "  HTTPServer[nginx/1.18.0]",
    "  X-Powered-By[Express]",
    "  Cookies[SESSIONID]",
    "  Title[Portal Corporativo — Login]",
    "  HTML5",
    "  Bootstrap[4.5.0]",
    "  JQuery[3.4.1]",
    "  Login-Form[username, password]",
    "",
    "$ curl -sI https://10.10.10.20/",
    "HTTP/1.1 200 OK",
    "Server: nginx/1.18.0",
    "X-Powered-By: Express",
    "Set-Cookie: SESSIONID=eyJhbGc...; Path=/",
    "Content-Type: text/html; charset=utf-8",
    "  (ausente) Content-Security-Policy",
    "  (ausente) Strict-Transport-Security",
    "  (ausente) X-Content-Type-Options",
    "  (ausente) HttpOnly / Secure / SameSite no cookie",
    "",
    "[ decoder ]",
    "Cookie sem HttpOnly → roubável por XSS (OWASP A03+A07).",
    "Sem CSP → XSS refletido fica mais fácil de explorar (A05:2021 Security Misconfiguration).",
    "Sem HSTS → vulnerável a SSL stripping em rede hostil.",
    "X-Powered-By: Express + jQuery 3.4.1 → enumera tecnologia e CVEs.",
    "Defesa: helmet.js (Node) / nginx add_header + auditoria de cookies.",
  ],

  "attack_sqli_portal-web": [
    "$ curl -s -X POST https://10.10.10.20/login \\",
    "       -H 'Content-Type: application/x-www-form-urlencoded' \\",
    "       -d 'user=admin&pass=teste'",
    '{"ok":false,"error":"Authentication failed"}',
    "",
    "$ # entrada didática de teste (NÃO é payload reutilizável)",
    "$ curl -s -X POST https://10.10.10.20/login -d \"user=admin&pass=<TESTE-SQLI>\"",
    '{"ok":false,',
    ' "error":"Internal Server Error",',
    ' "trace":"PostgresError: syntax error at or near \\"...\\" at character 38",',
    ' "request_id":"d2a4-7f1c-9b22"}',
    "",
    "$ # comparativo: mesma rota após o patch (prepared)",
    "$ curl -s -X POST https://10.10.10.20/login -d \"user=admin&pass=<TESTE-SQLI>\"",
    '{"ok":false,"error":"Authentication failed"}',
    "",
    "[ decoder ]",
    "Erro de banco vaza no JSON → confirma concatenação direta (CWE-89, OWASP A03:2021).",
    "request_id repete em logs do SOC → casamento entre evidência atacante e defensor.",
    "Após o patch (prepared statements), a mesma entrada vira erro genérico de auth.",
    "Defesa primária: parameter binding. Secundária: WAF + alerta SIEM por 5xx.",
  ],

  attack_creds_idp: [
    "$ tail -f /var/log/idp/auth.log | grep -E 'Failed|MFA'",
    "2026-05-11T03:22:14Z [WARN] auth: Failed login user=admin@corp src=198.51.100.14 ua=python-requests/2.31",
    "2026-05-11T03:22:31Z [WARN] auth: Failed login user=admin@corp src=198.51.100.31 ua=python-requests/2.31",
    "2026-05-11T03:22:48Z [WARN] auth: Failed login user=admin@corp src=203.0.113.88  ua=okhttp/4.10",
    "2026-05-11T03:23:02Z [WARN] auth: Failed login user=svc-bkp@corp src=198.51.100.14 ua=python-requests/2.31",
    "2026-05-11T03:23:19Z [WARN] auth: Failed login user=ceo@corp    src=203.0.113.42  ua=okhttp/4.10",
    "... (truncado: 312 falhas em 47 IPs distintos nos últimos 90s)",
    "",
    "$ # consulta no SIEM (Splunk SPL fictício)",
    "$ idp_auth status=failed | stats dc(src_ip) as ips count by user | where count>5",
    "user                  ips   count",
    "admin@corp            47    312",
    "svc-bkp@corp           9     22",
    "ceo@corp              31     71",
    "mfa_required=false em 100% dos eventos.",
    "",
    "[ decoder ]",
    "Distribuição em 47 IPs → credential stuffing (T1110.004), não brute force simples.",
    "User-Agents misturados (requests + okhttp) → botnet / proxies residenciais.",
    "MFA=false em todos → uma senha de leak já basta. Defesa #1: MFA FIDO2 obrigatório p/ admin.",
    "Detecção: NIST CSF DE.CM-1 — monitorar comportamento, não só falhas por IP.",
  ],

  attack_pivot_db: [
    "$ # da Portal Web comprometida, tenta-se alcançar o banco (cenário narrativo)",
    "$ psql -h 10.10.10.40 -U app_readonly -d corp",
    "psql: error: connection to server at \"10.10.10.40\", port 5432 failed:",
    "FATAL:  no pg_hba.conf entry for host \"10.10.20.17\", user \"app_readonly\",",
    "        database \"corp\", no encryption",
    "",
    "$ # mesma origem a partir do host autorizado (10.10.10.20) seria aceita",
    "$ grep -E 'connection|denied' /var/log/postgresql/postgresql-2026-05-11.log",
    "2026-05-11T12:01:03 LOG: connection authorized: user=app db=corp host=10.10.10.20",
    "2026-05-11T12:01:47 LOG: connection authorized: user=app db=corp host=10.10.10.20",
    "2026-05-11T12:02:11 FATAL: no pg_hba entry — host=10.10.20.17 user=app_readonly",
    "2026-05-11T12:02:13 FATAL: no pg_hba entry — host=10.10.20.17 user=app_readonly",
    "",
    "$ cat /etc/postgresql/15/main/pg_hba.conf | grep -v '^#'",
    "host    corp    app           10.10.10.20/32    scram-sha-256",
    "host    corp    app_readonly  10.10.10.20/32    scram-sha-256",
    "host    all     all           0.0.0.0/0         reject",
    "",
    "[ decoder ]",
    "pg_hba.conf restritivo + 'reject' final = controle PR.AC-5 (segmentação) funcionando.",
    "Sem ele, T1021 Remote Services viabilizaria movimento lateral imediato.",
    "Logs em FATAL = sinal de detecção; alimentar SIEM com essa pattern (DE.CM-1).",
    "Lição: defesa em profundidade — credencial comprometida não basta se a rede recusar.",
  ],

  attack_impact_db: [
    "$ # classificação didática — NENHUM DADO REAL é mostrado",
    "$ psql -h 10.10.10.40 -U app -d corp -c \"\\dt+\"",
    "                              List of relations",
    " Schema |    Name      | Type  |  Owner   | Rows (est.) | Size",
    "--------+--------------+-------+----------+-------------+-------",
    " public | customers    | table | app      |     124,500 |  82 MB",
    " public | invoices     | table | app      |     982,103 | 410 MB",
    " public | sessions     | table | app      |      23,481 |   8 MB",
    " public | audit_log    | table | postgres |   4,201,888 |  1.2 GB",
    "",
    "$ # cálculo de impacto regulatório",
    "Classe de dado:          PII + financeiro (LGPD art. 5° I/II)",
    "Titulares estimados:     124.5k",
    "CIA estimada:            C=ALTA  I=MÉDIA  A=ALTA",
    "Notificação:             ANPD + titulares (LGPD art. 48) — prazo razoável",
    "Equivalente UE:          GDPR art. 33 → 72h para autoridade supervisora",
    "audit_log no mesmo cluster: atacante poderia apagar trilhas (DE.AE-2 comprometido)",
    "",
    "[ decoder ]",
    "Impacto técnico vira impacto legal-regulatório quando há PII envolvido.",
    "Manter audit_log no mesmo banco que dados é anti-pattern: separar em cofre WORM.",
    "Defesa: criptografia at-rest (TDE), backups imutáveis, plano de resposta com jurídico.",
  ],

  attack_report: [
    "=== Relatório Ofensivo Didático — Cyber Lab v3 ===",
    "Engagement:      Cyber Lab Pythoneer v3",
    "Janela:          2026-05-10 → 2026-05-12",
    "Operador:        student@attackbox",
    "Severidade:      ALTA  →  reduzida para BAIXA após correções",
    "",
    "[CYBER KILL CHAIN — Lockheed Martin]",
    "  1. Reconnaissance   → portal-web exposto; SSH 22 público; nginx 1.18 fingerprint",
    "  2. Weaponization    → SQLi conceitual no /login (sem payload reutilizável)",
    "  3. Delivery         → entrada manipulada via formulário web",
    "  4. Exploitation     → causa raiz: ausência de prepared statements (CWE-89)",
    "  5. Installation     → NÃO executado (escopo didático)",
    "  6. C2               → NÃO executado (escopo didático)",
    "  7. Actions/Impact   → acesso conceitual a banco com PII (LGPD)",
    "",
    "[MITRE ATT&CK]",
    "  T1595.001  Active Scanning",
    "  T1592.002  Gather Victim Host Information: Software",
    "  T1190      Exploit Public-Facing Application",
    "  T1110.004  Credential Stuffing",
    "  T1021      Remote Services (tentativa lateral)",
    "  T1041      Exfiltration Over C2 (não executado)",
    "",
    "[CONTROLES QUE QUEBRAM A CADEIA — NIST CSF]",
    "  [Identify]  Inventário + classificação CIA (ID.AM, ID.RA)",
    "  [Protect]   Prepared statements, MFA-FIDO2, pg_hba.conf, VPN admin (PR.AC, PR.IP)",
    "  [Detect]    SIEM + alerta de stuffing + 5xx anômalo no Portal Web (DE.CM, DE.AE)",
    "  [Respond]   Playbooks de SQLi e Credential Stuffing (RS.RP, RS.MI)",
    "  [Recover]   Backups imutáveis testados, cofre separado (RC.RP, RC.IM)",
    "",
    "[RECOMENDAÇÃO PRIORIZADA]",
    "  P0  patch sqli              (causa raiz da exposição crítica)",
    "  P0  mfa admin               (interrompe T1110.004 imediatamente)",
    "  P1  firewall ssh private    (reduz superfície administrativa)",
    "  P1  hardening db            (corta lateral movement)",
    "  P2  backup validar          (resiliência contra ransomware)",
    "",
    "Próxima rodada: revalidar em 30 dias e medir MTTD/MTTR do SOC.",
  ],
};
