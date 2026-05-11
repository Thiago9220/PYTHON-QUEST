import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ChevronDown,
  BookOpen,
  Bug,
  CheckCircle2,
  Crosshair,
  Eye,
  FileSearch,
  Flame,
  KeyRound,
  Laptop,
  Lock,
  Network,
  Radar,
  RotateCcw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TerminalSquare,
  AlertTriangle,
  Unlock,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
}

type Line = { type: "in" | "out" | "ok" | "err" | "info" | "warn"; text: string };
type ControlStatus = "weak" | "partial" | "strong";
type AssetStatus = "normal" | "investigating" | "isolated";
type KnowledgeTab = "principios" | "ataques" | "defesas";
type ViewMode = "guided" | "soc" | "attack";
type DetailPanel = "ambiente" | "alertas" | "ativos";

interface Service {
  port: number;
  name: string;
  state: "open" | "closed" | "filtered";
  exposure: "internet" | "internal" | "private";
  note: string;
}

interface Weakness {
  id: string;
  title: string;
  impact: string;
  defense: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved?: boolean;
}

interface Asset {
  id: string;
  ip: string;
  name: string;
  zone: string;
  owner: string;
  criticality: "baixa" | "media" | "alta" | "critica";
  status: AssetStatus;
  services: Service[];
  weaknesses: Weakness[];
  controls: Record<string, ControlStatus>;
  evidence: string[];
}

interface AlertItem {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  assetId: string;
  status: "novo" | "investigando" | "contido" | "fechado";
}

interface LabState {
  assets: Record<string, Asset>;
  discovered: Set<string>;
  scanned: Set<string>;
  reviewedLogs: Set<string>;
  completedActions: Set<string>;
  alerts: AlertItem[];
  incidentNotes: string[];
}

interface Mission {
  id: string;
  title: string;
  hint: string;
  principle: string;
  defense: string;
  check: (state: LabState) => boolean;
}

interface LevelDef {
  id: number;
  title: string;
  focus: string;
  briefing: string;
  starter: () => LabState;
  missions: Mission[];
}

interface AttackStep {
  id: string;
  title: string;
  phase: string;
  command: string;
  objective: string;
  safety: string;
  defense: string;
}

interface IntroSlide {
  title: string;
  eyebrow: string;
  body: string;
  icon: LucideIcon;
  items: { label: string; text: string }[];
  command?: string;
}

const severityWeight: Record<Weakness["severity"], number> = {
  low: 4,
  medium: 8,
  high: 14,
  critical: 22,
};

const controlPenalty: Record<ControlStatus, number> = {
  weak: 8,
  partial: 4,
  strong: 0,
};

const PRINCIPLES = [
  {
    title: "Confidencialidade, Integridade e Disponibilidade",
    body: "Proteja dados sensíveis, garanta que não sejam alterados sem autorização e mantenha os serviços essenciais operando.",
  },
  {
    title: "Menor privilégio",
    body: "Cada usuário, serviço e chave deve ter apenas o acesso necessário. Menos permissão reduz o dano quando algo falha.",
  },
  {
    title: "Defesa em profundidade",
    body: "Combine camadas: MFA, segmentação, logs, EDR, backups, hardening, revisão de código e resposta a incidentes.",
  },
  {
    title: "Zero trust",
    body: "Não confie apenas na rede. Verifique identidade, dispositivo, contexto e comportamento antes de liberar acesso.",
  },
];

const ATTACKS = [
  {
    title: "Phishing e engenharia social",
    body: "O invasor tenta convencer a vítima a entregar credenciais, abrir anexos ou autorizar ações. Defesa: treinamento, filtros, MFA e verificação fora do canal.",
  },
  {
    title: "Credential stuffing",
    body: "Senhas vazadas em outros sites são testadas em contas corporativas. Defesa: MFA, senhas únicas, rate limit e monitoramento de login.",
  },
  {
    title: "Injeção SQL",
    body: "Entradas não validadas alteram consultas ao banco. Defesa: queries parametrizadas, validação, testes de segurança e logs de anomalia.",
  },
  {
    title: "Ransomware",
    body: "Malware criptografa dados e pressiona a organização. Defesa: EDR, menor privilégio, segmentação, patching e backups testados.",
  },
  {
    title: "Exposição de serviços",
    body: "SSH, banco ou painéis administrativos abertos na internet viram alvos. Defesa: VPN, allowlist, firewall e inventário contínuo.",
  },
];

const DEFENSES = [
  {
    title: "Inventário e superfície de ataque",
    body: "Você só protege bem o que conhece. Liste ativos, donos, portas, dados sensíveis, dependências e exposição externa.",
  },
  {
    title: "Hardening",
    body: "Remova padrões inseguros, feche portas, atualize sistemas, aplique headers, proteja segredos e automatize configurações seguras.",
  },
  {
    title: "Detecção e resposta",
    body: "Colete logs, crie alertas úteis, investigue evidências, contenha o impacto, erradique a causa e documente lições aprendidas.",
  },
  {
    title: "Backups resilientes",
    body: "Tenha cópias offline ou imutáveis, criptografadas, com acesso restrito e restauração testada regularmente.",
  },
];

const ATTACK_STEPS: AttackStep[] = [
  {
    id: "attack_scope",
    title: "Escopo e regras",
    phase: "Preparação",
    command: "ambiente ataque",
    objective: "Entender quais alvos fictícios podem ser analisados e o que nunca deve sair do laboratório.",
    safety: "Nada aqui executa tráfego real, força senha, entrega malware ou exibe payload reutilizável.",
    defense: "Todo exercício ofensivo termina conectado a evidências e controles defensivos.",
  },
  {
    id: "attack_recon_portal-web",
    title: "Reconhecimento seguro",
    phase: "Recon",
    command: "recon portal-web",
    objective: "Mapear serviços, zona, dono e exposição do Portal Web dentro do cenário simulado.",
    safety: "A saída é pré-calculada e limitada aos ativos fictícios do jogo.",
    defense: "Inventário, firewall e redução de superfície diminuem o que o atacante enxerga.",
  },
  {
    id: "attack_fingerprint_portal-web",
    title: "Fingerprint da aplicação",
    phase: "Enumeração",
    command: "fingerprint portal-web",
    objective: "Relacionar tecnologia, cabeçalhos e comportamento anômalo a hipóteses de risco.",
    safety: "O laboratório mostra sinais didáticos, sem instruções de exploração real.",
    defense: "Headers, validação, logs e patching reduzem chance de abuso.",
  },
  {
    id: "attack_sqli_portal-web",
    title: "Exploração simulada",
    phase: "Exploração",
    command: "simular-sqli portal-web",
    objective: "Ver o impacto conceitual de uma falha de entrada sem payload, bypass ou extração real.",
    safety: "O teste só marca evidências fictícias e não ensina cadeia operacional reutilizável.",
    defense: "Prepared statements, validação server-side, WAF e testes de regressão.",
  },
  {
    id: "attack_creds_idp",
    title: "Abuso de credenciais",
    phase: "Identidade",
    command: "cred-test idp",
    objective: "Entender por que MFA, rate limit e alertas protegem contas privilegiadas.",
    safety: "Não há lista de senhas, brute force, automação de login ou alvo externo.",
    defense: "MFA resistente a phishing, bloqueio progressivo e revisão de sessões.",
  },
  {
    id: "attack_pivot_db",
    title: "Movimento lateral simulado",
    phase: "Pós-exploração",
    command: "pivot-sim db-core",
    objective: "Mostrar como segmentação fraca pode aproximar um atacante do banco crítico.",
    safety: "O pivot é narrativo e não abre shell, túnel, sessão ou comando real.",
    defense: "Segmentação, ACL por origem, menor privilégio e auditoria.",
  },
  {
    id: "attack_impact_db",
    title: "Impacto e evidência",
    phase: "Impacto",
    command: "impacto-sim db-core",
    objective: "Classificar dados afetados e transformar impacto técnico em prioridade de correção.",
    safety: "O exercício não mostra dados reais nem técnica de exfiltração.",
    defense: "Criptografia, auditoria, backups testados e resposta a incidentes.",
  },
  {
    id: "attack_report",
    title: "Relatório ofensivo",
    phase: "Fechamento",
    command: "relatorio ataque",
    objective: "Fechar a cadeia com causa, evidência, impacto, risco e recomendações defensivas.",
    safety: "O relatório descreve o caminho em linguagem didática, sem payloads ou procedimentos abusáveis.",
    defense: "A correção prioriza controles que quebram a cadeia de ataque.",
  },
];

const INTRO_SLIDES: IntroSlide[] = [
  {
    eyebrow: "Visão geral",
    title: "O que é este laboratório",
    icon: ShieldAlert,
    body: "Este módulo ensina cibersegurança como um ciclo completo: você entende o ataque, observa evidências, toma decisões de defesa e mede se o risco caiu.",
    items: [
      { label: "Tudo é simulado", text: "Os alvos, logs, alertas e ataques são fictícios. Nenhum comando toca sistemas reais." },
      { label: "Aprendizado guiado", text: "Cada etapa mostra o motivo técnico e a defesa relacionada." },
      { label: "Objetivo", text: "Sair sabendo conectar ameaça, evidência, impacto e controle." },
    ],
  },
  {
    eyebrow: "Modos",
    title: "Como escolher o modo certo",
    icon: BookOpen,
    body: "O laboratório tem três formas de estudar. Você pode alternar entre elas a qualquer momento sem perder o progresso do nível atual.",
    items: [
      { label: "Modo guiado", text: "Mostra uma missão por vez, com conceito, comando recomendado e painéis abertos sob demanda." },
      { label: "Modo SOC", text: "Mostra terminal, mapa, alertas, base de conhecimento e controles ao mesmo tempo." },
      { label: "Modo Ataque", text: "Abre a AttackBox didática para entender a cadeia ofensiva sem payload real." },
    ],
  },
  {
    eyebrow: "Terminal",
    title: "O que é o terminal",
    icon: TerminalSquare,
    body: "O terminal é a área de interação do simulador. Você digita comandos curtos para revelar evidências, concluir missões e aplicar controles.",
    command: "help",
    items: [
      { label: "Prompt", text: "`analyst@soc` indica investigação defensiva; `student@attackbox` indica simulação ofensiva." },
      { label: "Comandos", text: "Use `help` para ver a lista completa. Exemplos: `inventario`, `logs portal-web`, `ambiente ataque`." },
      { label: "Histórico", text: "Use as setas do teclado para recuperar comandos já digitados." },
    ],
  },
  {
    eyebrow: "Métricas",
    title: "Como ler o topo da tela",
    icon: Activity,
    body: "As métricas resumem o estado do laboratório e ajudam você a entender se está melhorando a postura de segurança.",
    items: [
      { label: "Risco", text: "Pontuação de 0 a 100 calculada com exposição, fraquezas abertas e controles fracos." },
      { label: "Alertas", text: "Mostra quantos alertas foram contidos em relação ao total existente." },
      { label: "Controles fortes", text: "Conta quantos controles já foram reforçados nos ativos." },
      { label: "Nível ou Ataque", text: "No modo normal mostra o nível; no modo ataque mostra etapas ofensivas concluídas." },
    ],
  },
  {
    eyebrow: "Painéis",
    title: "O que cada painel representa",
    icon: Radar,
    body: "Os painéis transformam o terminal em uma investigação visual. Eles mostram onde estão os ativos, quais alertas existem e quais defesas ainda estão fracas.",
    items: [
      { label: "Ambiente", text: "Mapa dos ativos, zonas e sinais de risco no cenário." },
      { label: "Alertas", text: "Fila de eventos suspeitos que precisam ser investigados, contidos ou fechados." },
      { label: "Ativos e Controles", text: "Lista de sistemas, fraquezas abertas e estado dos controles defensivos." },
      { label: "Base de Conhecimento", text: "Resumo rápido de princípios, ataques e defesas para consultar durante o exercício." },
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
      { label: "2. Execute no terminal", text: "O simulador responde com evidência, risco ou correção." },
      { label: "3. Veja os painéis", text: "Confirme se alertas, controles e risco mudaram." },
      { label: "4. Conecte ataque e defesa", text: "Use o Modo Ataque para entender como a falha seria explorada de forma conceitual." },
    ],
  },
];

const MISSION_CONCEPTS: Record<string, { title: string; label: string; body: string; checks: string[] }> = {
  principles: {
    title: "Pense como defensor",
    label: "Fundamento",
    body: "Antes de usar ferramenta, defina o que precisa proteger e qual princípio justifica cada controle.",
    checks: ["Identifique dado sensível", "Reduza permissão", "Adicione mais de uma camada"],
  },
  inventory: {
    title: "Inventário defensivo",
    label: "Superfície",
    body: "Inventário não é lista decorativa: ele mostra dono, criticidade, zona e exposição de cada ativo.",
    checks: ["Quem e o dono?", "Qual a criticidade?", "Está exposto na internet?"],
  },
  scan: {
    title: "Superfície de ataque",
    label: "Reconhecimento",
    body: "Mapear portas ajuda a encontrar serviços que precisam ser fechados, filtrados ou monitorados.",
    checks: ["Porta aberta tem justificativa?", "Administração está restrita?", "Serviço precisa de patch?"],
  },
  risk: {
    title: "Priorização por risco",
    label: "Decisão",
    body: "Risco alto combina ativo crítico, exposição, falha explorável e controles fracos.",
    checks: ["Impacto no negocio", "Probabilidade de exploração", "Controle compensatorio"],
  },
  attacks: {
    title: "Entender ataques com segurança",
    label: "Ameaça",
    body: "O objetivo aqui é reconhecer padrões de ataque e conectar cada um a uma defesa concreta.",
    checks: ["Qual é o alvo?", "Qual evidência aparece?", "Qual controle reduz o dano?"],
  },
  sqli: {
    title: "Injeção SQL",
    label: "Aplicacao",
    body: "A falha nasce quando a entrada do usuário influencia uma consulta. A defesa principal é consulta parametrizada.",
    checks: ["Não exibir payload real", "Registrar erro sem vazar dado", "Corrigir causa raiz"],
  },
  logs: {
    title: "Logs viram evidência",
    label: "Investigação",
    body: "Logs bons ajudam a separar suspeita de incidente e mostram origem, horário, ação e impacto.",
    checks: ["Evento de autenticação", "Erro de aplicação", "Ação administrativa"],
  },
  patch: {
    title: "Corrigir a causa raiz",
    label: "Correção",
    body: "Bloquear um indicador ajuda, mas a proteção real vem de remover a falha que permitiu o ataque.",
    checks: ["Prepared statements", "Validação server-side", "Teste de regressão"],
  },
  mfa: {
    title: "Identidade forte",
    label: "Acesso",
    body: "Senhas vazam. MFA, rate limit e revisão de sessões reduzem o impacto de credenciais comprometidas.",
    checks: ["MFA para admin", "Bloqueio progressivo", "Alerta de login anômalo"],
  },
  phishing: {
    title: "Phishing",
    label: "Pessoa",
    body: "Ataques sociais exploram pressa e confiança. A defesa combina verificação, filtros, MFA e treinamento.",
    checks: ["Remetente e domínio", "Anexo e link", "Pedido fora do padrão"],
  },
  edr: {
    title: "Investigação no endpoint",
    label: "Endpoint",
    body: "EDR mostra processos, conexões e persistência. Use para confirmar impacto antes de erradicar.",
    checks: ["Processo suspeito", "Origem da execução", "Conexão externa"],
  },
  isolate: {
    title: "Contenção",
    label: "Resposta",
    body: "Isolar reduz movimento lateral e preserva evidências para entender o que aconteceu.",
    checks: ["Limitar comunicação", "Preservar artefatos", "Avisar time afetado"],
  },
  block: {
    title: "Indicadores confirmados",
    label: "Bloqueio",
    body: "Depois de confirmar um indicador, transforme-o em bloqueio e detecção nos controles certos.",
    checks: ["DNS filtering", "Gateway de email", "EDR"],
  },
  firewall: {
    title: "Acesso administrativo",
    label: "Perímetro",
    body: "SSH e painéis administrativos devem ficar atrás de VPN, allowlist e autenticação forte.",
    checks: ["Fechar internet", "Exigir chave forte", "Revisar regras"],
  },
  dbacl: {
    title: "Segmentação de dados",
    label: "Banco",
    body: "Banco crítico deve aceitar conexão apenas de origens necessárias e contas com menor privilégio.",
    checks: ["ACL por origem", "Conta mínima", "Auditoria ligada"],
  },
  backup: {
    title: "Backup que restaura",
    label: "Resiliência",
    body: "Backup só tem valor quando a restauração foi testada e o acesso ao cofre está protegido.",
    checks: ["Restore testado", "Imutabilidade", "Acesso separado"],
  },
  incident: {
    title: "Relatório de incidente",
    label: "Melhoria",
    body: "O fechamento registra causa, impacto, contenção, erradicação e melhorias para não repetir o problema.",
    checks: ["Causa raiz", "Impacto", "Ações preventivas"],
  },
  score: {
    title: "Segurança contínua",
    label: "Postura",
    body: "O score não é fim do trabalho; ele mostra se os principais riscos do laboratório foram reduzidos.",
    checks: ["Risco abaixo do limite", "Alertas contidos", "Controles fortes"],
  },
};

const createInitialState = (): LabState => ({
  assets: {
    "edge-fw": {
      id: "edge-fw",
      ip: "10.10.10.1",
      name: "Edge Firewall",
      zone: "Perímetro",
      owner: "Infra",
      criticality: "critica",
      status: "normal",
      services: [
        { port: 443, name: "vpn", state: "open", exposure: "internet", note: "Acesso remoto corporativo" },
        { port: 22, name: "ssh", state: "filtered", exposure: "private", note: "Administração restrita" },
      ],
      weaknesses: [
        {
          id: "flat-network",
          title: "Segmentação insuficiente",
          impact: "Um host comprometido pode tentar se mover lateralmente com menos barreiras.",
          defense: "Separar zonas, aplicar regras de firewall internas e revisar fluxos permitidos.",
          severity: "high",
        },
      ],
      controls: {
        firewall: "partial",
        segmentation: "weak",
        vpn: "partial",
        logging: "partial",
      },
      evidence: ["Fluxos internos liberais entre estações e servidores."],
    },
    "portal-web": {
      id: "portal-web",
      ip: "10.10.10.20",
      name: "Portal Web",
      zone: "DMZ",
      owner: "Aplicações",
      criticality: "alta",
      status: "normal",
      services: [
        { port: 80, name: "http", state: "open", exposure: "internet", note: "Redireciona para HTTPS" },
        { port: 443, name: "https", state: "open", exposure: "internet", note: "Portal público" },
        { port: 22, name: "ssh", state: "open", exposure: "internet", note: "Deveria estar restrito a VPN" },
      ],
      weaknesses: [
        {
          id: "sqli",
          title: "Entrada de login sem consulta parametrizada",
          impact: "Pode permitir leitura indevida de dados se a entrada do usuário for tratada como comando.",
          defense: "Usar prepared statements, validar entradas e cobrir login com testes de segurança.",
          severity: "critical",
        },
        {
          id: "ssh-public",
          title: "SSH exposto na internet",
          impact: "Aumenta tentativas de brute force e exploração de credenciais.",
          defense: "Restringir por VPN ou allowlist, desabilitar senha e exigir chaves fortes.",
          severity: "high",
        },
      ],
      controls: {
        inputValidation: "weak",
        waf: "weak",
        headers: "partial",
        patching: "partial",
        logging: "partial",
      },
      evidence: ["Logs mostram erros de banco após entradas anormais no formulário de login."],
    },
    "idp": {
      id: "idp",
      ip: "10.10.10.30",
      name: "Identity Provider",
      zone: "Core",
      owner: "Segurança",
      criticality: "critica",
      status: "normal",
      services: [
        { port: 443, name: "auth", state: "open", exposure: "internet", note: "Login SSO" },
        { port: 636, name: "ldaps", state: "open", exposure: "internal", note: "Diretório corporativo" },
      ],
      weaknesses: [
        {
          id: "no-mfa-admin",
          title: "MFA ausente para administradores",
          impact: "Credenciais vazadas podem virar acesso privilegiado.",
          defense: "Exigir MFA resistente a phishing e revisar acessos privilegiados.",
          severity: "critical",
        },
        {
          id: "weak-rate-limit",
          title: "Rate limit parcial em login",
          impact: "Facilita tentativas automatizadas de senha reutilizada.",
          defense: "Aplicar rate limit adaptativo, bloqueio progressivo e alerta por anomalia.",
          severity: "high",
        },
      ],
      controls: {
        mfa: "weak",
        rateLimit: "partial",
        passwordPolicy: "partial",
        privilegedAccess: "weak",
        audit: "partial",
      },
      evidence: ["Picos de login falho em contas administrativas fora do horário comercial."],
    },
    "db-core": {
      id: "db-core",
      ip: "10.10.10.40",
      name: "Banco de Dados",
      zone: "Dados",
      owner: "Dados",
      criticality: "critica",
      status: "normal",
      services: [
        { port: 5432, name: "postgresql", state: "open", exposure: "internal", note: "Acesso deveria vir apenas da aplicação" },
      ],
      weaknesses: [
        {
          id: "db-acl",
          title: "ACL de banco permissiva",
          impact: "Mais servidores conseguem tentar conexão direta ao banco.",
          defense: "Permitir somente origens necessárias e auditar contas de serviço.",
          severity: "high",
        },
      ],
      controls: {
        networkAcl: "weak",
        leastPrivilege: "partial",
        audit: "weak",
        encryption: "partial",
      },
      evidence: ["Conexões negadas vindas de sub-redes de usuário aparecem no log."],
    },
    "ws-17": {
      id: "ws-17",
      ip: "10.10.20.17",
      name: "Workstation Financeiro",
      zone: "Usuários",
      owner: "Financeiro",
      criticality: "alta",
      status: "normal",
      services: [
        { port: 0, name: "endpoint", state: "closed", exposure: "private", note: "Ativo de usuário monitorado por EDR" },
      ],
      weaknesses: [
        {
          id: "phishing",
          title: "Usuário recebeu phishing com anexo malicioso",
          impact: "Pode iniciar roubo de sessão, malware ou ransomware.",
          defense: "Analisar indicadores, isolar endpoint, bloquear domínio e reforçar treinamento.",
          severity: "critical",
        },
      ],
      controls: {
        edr: "partial",
        isolation: "weak",
        emailSecurity: "weak",
        patching: "partial",
        awareness: "partial",
      },
      evidence: ["Email externo simulou fornecedor e pediu abertura urgente de anexo."],
    },
    "backup-vault": {
      id: "backup-vault",
      ip: "10.10.30.5",
      name: "Backup Vault",
      zone: "Recuperação",
      owner: "Infra",
      criticality: "critica",
      status: "normal",
      services: [
        { port: 443, name: "object-storage", state: "open", exposure: "private", note: "Repositórios de backup" },
      ],
      weaknesses: [
        {
          id: "untested-backup",
          title: "Restauração não testada",
          impact: "Em ransomware, backup que não restaura equivale a não ter backup.",
          defense: "Testar restauração, usar cópias imutáveis e restringir operadores.",
          severity: "critical",
        },
      ],
      controls: {
        backupValidation: "weak",
        immutability: "partial",
        encryption: "partial",
        accessControl: "weak",
      },
      evidence: ["Último teste formal de restore não foi registrado."],
    },
  },
  discovered: new Set(["edge-fw", "portal-web", "idp"]),
  scanned: new Set(),
  reviewedLogs: new Set(),
  completedActions: new Set(),
  alerts: [
    {
      id: "web-sqli",
      title: "Erros de banco após entrada anormal no login",
      severity: "critical",
      assetId: "portal-web",
      status: "novo",
    },
    {
      id: "idp-stuffing",
      title: "Falhas de login distribuídas em contas admin",
      severity: "high",
      assetId: "idp",
      status: "novo",
    },
    {
      id: "mail-phish",
      title: "Email suspeito entregue ao Financeiro",
      severity: "critical",
      assetId: "ws-17",
      status: "novo",
    },
  ],
  incidentNotes: [],
});

const cloneState = (state: LabState): LabState => ({
  assets: Object.fromEntries(
    Object.entries(state.assets).map(([id, asset]) => [
      id,
      {
        ...asset,
        services: asset.services.map((service) => ({ ...service })),
        weaknesses: asset.weaknesses.map((weakness) => ({ ...weakness })),
        controls: { ...asset.controls },
        evidence: [...asset.evidence],
      },
    ])
  ) as Record<string, Asset>,
  discovered: new Set(state.discovered),
  scanned: new Set(state.scanned),
  reviewedLogs: new Set(state.reviewedLogs),
  completedActions: new Set(state.completedActions),
  alerts: state.alerts.map((alert) => ({ ...alert })),
  incidentNotes: [...state.incidentNotes],
});

const markResolved = (asset: Asset, weaknessId: string) => ({
  ...asset,
  weaknesses: asset.weaknesses.map((weakness) =>
    weakness.id === weaknessId ? { ...weakness, resolved: true } : weakness
  ),
});

const calculateRisk = (state: LabState) => {
  const assetRisk = Object.values(state.assets).reduce((sum, asset) => {
    const exposure = asset.services.some((service) => service.exposure === "internet" && service.state === "open") ? 8 : 0;
    const weaknesses = asset.weaknesses
      .filter((weakness) => !weakness.resolved)
      .reduce((total, weakness) => total + severityWeight[weakness.severity], 0);
    const controls = Object.values(asset.controls).reduce((total, status) => total + controlPenalty[status], 0);
    const containment = asset.status === "isolated" ? -8 : 0;
    return sum + exposure + weaknesses + controls + containment;
  }, 0);

  return Math.max(0, Math.min(100, Math.round(assetRisk / 5)));
};

const levelTwoState = () => {
  const state = createInitialState();
  state.completedActions.add("principles_read");
  state.completedActions.add("inventory_reviewed");
  state.discovered.add("db-core");
  state.scanned.add("portal-web");
  state.completedActions.add("risk_portal-web");
  return state;
};

const levelThreeState = () => {
  const state = levelTwoState();
  state.completedActions.add("attacks_read");
  state.completedActions.add("sqli_detected");
  state.reviewedLogs.add("portal-web");
  state.completedActions.add("patch_sqli");
  state.completedActions.add("mfa_admin");
  state.assets["portal-web"] = markResolved(
    {
      ...state.assets["portal-web"],
      controls: { ...state.assets["portal-web"].controls, inputValidation: "strong", waf: "partial", logging: "strong" },
    },
    "sqli"
  );
  state.assets.idp = markResolved(
    {
      ...state.assets.idp,
      controls: { ...state.assets.idp.controls, mfa: "strong", rateLimit: "strong", privilegedAccess: "strong" },
    },
    "no-mfa-admin"
  );
  return state;
};

const levelFourState = () => {
  const state = levelThreeState();
  state.completedActions.add("phishing_analyzed");
  state.completedActions.add("edr_scanned");
  state.completedActions.add("domain_blocked");
  state.assets["ws-17"] = markResolved(
    {
      ...state.assets["ws-17"],
      status: "isolated",
      controls: { ...state.assets["ws-17"].controls, edr: "strong", isolation: "strong", emailSecurity: "strong", awareness: "strong" },
    },
    "phishing"
  );
  state.alerts = state.alerts.map((alert) =>
    alert.id === "mail-phish" ? { ...alert, status: "contido" } : alert
  );
  return state;
};

const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: "Fundamentos e Superfície",
    focus: "Conhecer antes de proteger",
    briefing:
      "Comece como analista defensivo: revise princípios, inventarie ativos e descubra quais serviços aumentam a superfície de ataque.",
    starter: createInitialState,
    missions: [
      {
        id: "principles",
        title: "Revisar os princípios essenciais de segurança",
        hint: "principios",
        principle: "CIA, menor privilégio, defesa em profundidade e zero trust.",
        defense: "Use esses princípios para justificar cada controle aplicado.",
        check: (state) => state.completedActions.has("principles_read"),
      },
      {
        id: "inventory",
        title: "Montar inventário inicial dos ativos conhecidos",
        hint: "inventario",
        principle: "Não existe defesa consistente sem saber o que precisa ser protegido.",
        defense: "Classifique criticidade, dono, zona e exposição de cada ativo.",
        check: (state) => state.completedActions.has("inventory_reviewed"),
      },
      {
        id: "scan",
        title: "Mapear portas do Portal Web",
        hint: "nmap 10.10.10.20",
        principle: "Superfície de ataque e tudo que pode receber interacao externa.",
        defense: "Feche ou restrinja portas que não precisam estar expostas.",
        check: (state) => state.scanned.has("portal-web"),
      },
      {
        id: "risk",
        title: "Registrar risco do Portal Web",
        hint: "risco portal-web",
        principle: "Risco combina impacto, probabilidade, exposição e controles existentes.",
        defense: "Priorize falhas críticas expostas na internet.",
        check: (state) => state.completedActions.has("risk_portal-web"),
      },
    ],
  },
  {
    id: 2,
    title: "Ataques Web e Identidade",
    focus: "Entender para bloquear",
    briefing:
      "Investigue ataques comuns contra aplicações e contas. O objetivo não é invadir: é reconhecer sinais, corrigir causas e reduzir impacto.",
    starter: levelTwoState,
    missions: [
      {
        id: "attacks",
        title: "Estudar os principais ataques do ambiente",
        hint: "ataques",
        principle: "A defesa melhora quando você entende técnicas, objetivos e sinais de ataque.",
        defense: "Conecte cada ataque a um controle: MFA, validação, segmentação, logs ou backup.",
        check: (state) => state.completedActions.has("attacks_read"),
      },
      {
        id: "sqli",
        title: "Detectar uma tentativa de SQL Injection simulada",
        hint: "sqli-test portal-web",
        principle: "Entrada de usuário nunca deve virar comando confiável.",
        defense: "Use consultas parametrizadas e registre anomalias sem expor dados sensíveis.",
        check: (state) => state.completedActions.has("sqli_detected"),
      },
      {
        id: "logs",
        title: "Revisar logs do Portal Web",
        hint: "logs portal-web",
        principle: "Logs transformam suspeita em evidência.",
        defense: "Colete eventos de autenticação, erros de aplicação e mudanças administrativas.",
        check: (state) => state.reviewedLogs.has("portal-web"),
      },
      {
        id: "patch",
        title: "Aplicar correção defensiva contra injeção",
        hint: "patch sqli",
        principle: "Corrigir causa raiz vale mais que bloquear apenas um indicador.",
        defense: "Prepared statements, validação, testes automatizados e WAF como camada adicional.",
        check: (state) => state.completedActions.has("patch_sqli"),
      },
      {
        id: "mfa",
        title: "Proteger administradores contra credential stuffing",
        hint: "mfa admin",
        principle: "Credenciais podem vazar; identidade forte limita dano.",
        defense: "MFA resistente a phishing, rate limit, alertas e revisão de sessões.",
        check: (state) => state.completedActions.has("mfa_admin"),
      },
    ],
  },
  {
    id: 3,
    title: "Phishing, Malware e Contenção",
    focus: "Detectar rápido, conter melhor",
    briefing:
      "Trate um alerta de phishing no Financeiro. Analise indicadores, investigue o endpoint e contenha antes que vire ransomware.",
    starter: levelThreeState,
    missions: [
      {
        id: "phishing",
        title: "Analisar email suspeito recebido pelo Financeiro",
        hint: "phishing analisar email-42",
        principle: "Engenharia social explora pressa, autoridade e medo.",
        defense: "Verifique remetente, domínio, links, anexos e contexto antes de confiar.",
        check: (state) => state.completedActions.has("phishing_analyzed"),
      },
      {
        id: "edr",
        title: "Investigar o endpoint afetado",
        hint: "edr scan ws-17",
        principle: "EDR ajuda a enxergar processo, persistência e conexões suspeitas.",
        defense: "Procure execução anômala, conexões externas e alterações de inicialização.",
        check: (state) => state.completedActions.has("edr_scanned"),
      },
      {
        id: "isolate",
        title: "Conter a workstation antes de movimento lateral",
        hint: "isolar ws-17",
        principle: "Contenção reduz blast radius.",
        defense: "Isole o host, preserve evidências e mantenha comunicação com o time afetado.",
        check: (state) => state.assets["ws-17"].status === "isolated",
      },
      {
        id: "block",
        title: "Bloquear domínio malicioso e reforçar email security",
        hint: "bloquear dominio evil-login.example",
        principle: "Indicadores confirmados devem virar bloqueios e detecções.",
        defense: "Atualize gateway de email, DNS filtering, EDR e treinamento direcionado.",
        check: (state) => state.completedActions.has("domain_blocked"),
      },
    ],
  },
  {
    id: 4,
    title: "Hardening e Resposta",
    focus: "Fechar o ciclo defensivo",
    briefing:
      "Aplique defesa em profundidade: restrinja administração, valide backups e formalize a resposta ao incidente.",
    starter: levelFourState,
    missions: [
      {
        id: "firewall",
        title: "Restringir administração remota exposta",
        hint: "firewall ssh private",
        principle: "Serviços administrativos não devem ficar abertos para qualquer origem.",
        defense: "Use VPN, allowlist, chaves fortes e regras revisadas.",
        check: (state) => state.completedActions.has("firewall_ssh_private"),
      },
      {
        id: "dbacl",
        title: "Ajustar ACL do banco para menor privilégio",
        hint: "hardening db",
        principle: "Segmentação limita movimento lateral.",
        defense: "Permita apenas origens necessárias e audite contas de serviço.",
        check: (state) => state.completedActions.has("hardening_db"),
      },
      {
        id: "backup",
        title: "Validar backup e restauração",
        hint: "backup validar",
        principle: "Disponibilidade depende de restauração testada, não de promessa de backup.",
        defense: "Teste restore, aplique imutabilidade, criptografia e acesso separado.",
        check: (state) => state.completedActions.has("backup_validated"),
      },
      {
        id: "incident",
        title: "Fechar relatório de incidente",
        hint: "incident report",
        principle: "Resposta madura documenta causa, impacto, contenção, erradicação e melhorias.",
        defense: "Registre evidências, ações tomadas e controles preventivos.",
        check: (state) => state.completedActions.has("incident_reported"),
      },
      {
        id: "score",
        title: "Reduzir risco operacional para nível aceitável",
        hint: "score",
        principle: "Segurança e melhoria continua orientada por risco.",
        defense: "Risco abaixo de 35 indica que as principais exposições foram tratadas no laboratório.",
        check: (state) => calculateRisk(state) < 35,
      },
    ],
  },
];

const typeClass: Record<Line["type"], string> = {
  in: "text-slate-100",
  out: "text-slate-300",
  ok: "text-emerald-300",
  err: "text-red-300",
  info: "text-sky-300",
  warn: "text-amber-300",
};

const statusLabel: Record<ControlStatus, string> = {
  weak: "Fraco",
  partial: "Parcial",
  strong: "Forte",
};

const statusClass: Record<ControlStatus, string> = {
  weak: "bg-red-500/15 text-red-200 border-red-500/30",
  partial: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  strong: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
};

const severityClass: Record<Weakness["severity"], string> = {
  low: "text-sky-300 bg-sky-500/10 border-sky-500/30",
  medium: "text-amber-200 bg-amber-500/10 border-amber-500/30",
  high: "text-orange-200 bg-orange-500/10 border-orange-500/30",
  critical: "text-red-200 bg-red-500/10 border-red-500/30",
};

export function CyberSecSimulator({ onBack }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing">(() =>
    localStorage.getItem("cyber_sim_intro") ? "playing" : "intro"
  );
  const [introStep, setIntroStep] = useState(0);
  const [levelIdx, setLevelIdx] = useState(0);
  const [missionIdx, setMissionIdx] = useState(0);
  const [state, setState] = useState<LabState>(() => LEVELS[0].starter());
  const [lines, setLines] = useState<Line[]>([
    { type: "info", text: "Cyber Security Lab v3.0" },
    { type: "warn", text: "Ambiente 100% simulado. Pratique apenas em sistemas próprios ou com autorização." },
    { type: "info", text: "Digite 'help' para ver comandos de defesa e ataque simulado." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [knowledgeTab, setKnowledgeTab] = useState<KnowledgeTab>("principios");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("cyber_sim_view_mode");
    return savedMode === "soc" || savedMode === "attack" ? savedMode : "guided";
  });
  const [detailPanel, setDetailPanel] = useState<DetailPanel | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const level = LEVELS[levelIdx];
  const mission = level.missions[missionIdx];
  const levelDone = missionIdx >= level.missions.length;
  const assets = Object.values(state.assets);
  const riskScore = useMemo(() => calculateRisk(state), [state]);
  const containedAlerts = state.alerts.filter((alert) => alert.status === "contido" || alert.status === "fechado").length;
  const completedAttackSteps = ATTACK_STEPS.filter((step) => state.completedActions.has(step.id)).length;
  const strongControls = assets.reduce(
    (sum, asset) => sum + Object.values(asset.controls).filter((status) => status === "strong").length,
    0
  );
  const totalControls = assets.reduce((sum, asset) => sum + Object.values(asset.controls).length, 0);
  const introSlide = INTRO_SLIDES[introStep];
  const IntroIcon = introSlide.icon;
  const introDone = introStep === INTRO_SLIDES.length - 1;

  const startLab = () => {
    localStorage.setItem("cyber_sim_intro", "true");
    setPhase("playing");
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [levelIdx, phase]);

  useEffect(() => {
    localStorage.setItem("cyber_sim_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (levelDone || !mission) return;
    if (!mission.check(state)) return;

    setLines((current) => [
      ...current,
      { type: "ok", text: `[+] Missão concluída: ${mission.title}` },
      { type: "info", text: `Defesa aplicada: ${mission.defense}` },
    ]);

    const next = missionIdx + 1;
    if (next >= level.missions.length) {
      setLines((current) => [
        ...current,
        { type: "ok", text: `=== NÍVEL ${level.id} CONCLUÍDO: ${level.title} ===` },
      ]);
    }
    setMissionIdx(next);
  }, [levelDone, level.id, level.missions.length, level.title, mission, missionIdx, state]);

  const pushLine = (type: Line["type"], text: string) => {
    setLines((current) => [...current, { type, text }]);
  };

  const printLines = (type: Line["type"], output: string[]) => {
    setLines((current) => [...current, ...output.map((text) => ({ type, text }))]);
  };

  const resetLevel = (index = levelIdx) => {
    const nextLevel = LEVELS[index];
    setLevelIdx(index);
    setMissionIdx(0);
    setState(nextLevel.starter());
    setLines([
      { type: "info", text: `Nível ${nextLevel.id}: ${nextLevel.title}` },
      { type: "info", text: nextLevel.briefing },
      { type: "info", text: "Digite 'help' para comandos ou siga a missão atual." },
    ]);
    setInput("");
    setHistoryIdx(-1);
  };

  const updateState = (updater: (draft: LabState) => void) => {
    setState((current) => {
      const draft = cloneState(current);
      updater(draft);
      return draft;
    });
  };

  const findAsset = (token: string) =>
    assets.find((asset) => asset.id === token || asset.ip === token || asset.name.toLowerCase() === token.toLowerCase());

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;

    const prompt = viewMode === "attack" ? "student@attackbox:~$" : "analyst@soc:~$";
    setLines((current) => [...current, { type: "in", text: `${prompt} ${cmd}` }]);
    if (cmd !== history[history.length - 1]) setHistory((current) => [...current, cmd]);
    setHistoryIdx(-1);

    if (cmd === "clear") {
      setLines([]);
      return;
    }

    if (cmd === "reset") {
      resetLevel();
      return;
    }

    if (cmd === "next") {
      if (levelIdx < LEVELS.length - 1) resetLevel(levelIdx + 1);
      else pushLine("ok", "Todos os níveis já foram liberados neste laboratório.");
      return;
    }

    if (/^nivel\s+[1-4]$/.test(cmd)) {
      resetLevel(Number(cmd.split(/\s+/)[1]) - 1);
      return;
    }

    if (cmd === "help") {
      printLines("out", [
        "Comandos principais:",
        "  principios                         Estuda CIA, menor privilégio, defesa em profundidade e zero trust",
        "  ataques                            Lista ataques comuns e sinais defensivos",
        "  defesas                            Lista controles e boas práticas de proteção",
        "  inventario                         Mostra ativos, donos, zonas e criticidade",
        "  nmap <ip|ativo>                    Mapeia portas do ativo simulado",
        "  risco <ip|ativo>                   Resume riscos e controles fracos",
        "  logs <ativo>                       Revisa evidências do ativo",
        "  sqli-test portal-web               Detecta SQLi sem executar payload real",
        "  patch sqli                         Corrige causa raiz da injeção no Portal Web",
        "  mfa admin                          Ativa MFA e controles de login privilegiado",
        "  phishing analisar email-42         Analisa indicadores de phishing",
        "  edr scan ws-17                     Investiga endpoint suspeito",
        "  isolar ws-17                       Contém workstation afetada",
        "  bloquear dominio evil-login.example Bloqueia indicador malicioso",
        "  firewall ssh private               Restringe SSH administrativo",
        "  hardening db                       Aplica menor privilégio no banco",
        "  backup validar                     Testa restore e reforça backup",
        "  incident report                    Fecha relatório de resposta",
        "  score                              Mostra postura atual de risco",
        "",
        "Comandos do ambiente de ataque simulado:",
        "  ataque                             Mostra a cadeia ofensiva segura",
        "  ambiente ataque                    Define escopo, regras e alvos fictícios",
        "  recon portal-web                   Reconhecimento controlado do alvo web",
        "  fingerprint portal-web             Enumeração didática da aplicação",
        "  simular-sqli portal-web            Exploração conceitual sem payload real",
        "  cred-test idp                      Simula risco de credenciais sem brute force",
        "  pivot-sim db-core                  Movimento lateral narrativo e seguro",
        "  impacto-sim db-core                Classifica impacto sem exfiltrar dados",
        "  relatorio ataque                   Fecha achados ofensivos e defesas",
      ]);
      return;
    }

    if (cmd === "principios" || cmd === "cia") {
      printLines("info", [
        "Princípios defensivos essenciais:",
        "  1. Confidencialidade: dados sensíveis só para quem precisa.",
        "  2. Integridade: alterações devem ser autorizadas, rastreáveis e verificáveis.",
        "  3. Disponibilidade: serviços críticos precisam resistir a falhas e ataques.",
        "  4. Menor privilégio: reduza permissões para limitar impacto.",
        "  5. Defesa em profundidade: nenhuma camada sozinha é suficiente.",
        "  6. Zero trust: verifique identidade, dispositivo e contexto continuamente.",
      ]);
      updateState((draft) => draft.completedActions.add("principles_read"));
      setKnowledgeTab("principios");
      return;
    }

    if (cmd === "ataques") {
      printLines("warn", [
        "Principais ataques que este laboratório cobre:",
        "  Phishing: manipula pessoas para obter acesso ou executar malware.",
        "  Credential stuffing: usa senhas vazadas contra contas corporativas.",
        "  SQL Injection: explora entrada não tratada em consultas ao banco.",
        "  Ransomware: criptografa dados e pressiona por resgate.",
        "  Exposição de serviços: administra sistemas por portas abertas indevidamente.",
      ]);
      updateState((draft) => draft.completedActions.add("attacks_read"));
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "defesas") {
      printLines("ok", [
        "Defesas prioritárias:",
        "  Inventário contínuo e classificação de criticidade.",
        "  MFA para contas sensíveis e políticas de senha fortes.",
        "  Segmentação, firewall e acesso administrativo via VPN ou allowlist.",
        "  Queries parametrizadas, validação de entrada e testes de segurança.",
        "  Logs centralizados, alertas acionáveis e EDR em endpoints.",
        "  Backups imutáveis com restauração testada.",
      ]);
      updateState((draft) => draft.completedActions.add("defenses_read"));
      setKnowledgeTab("defesas");
      return;
    }

    if (cmd === "ataque" || cmd === "attack help" || cmd === "killchain") {
      printLines("warn", [
        "Ambiente de ataque simulado:",
        "  1. Preparação: ambiente ataque",
        "  2. Reconhecimento: recon portal-web",
        "  3. Enumeração: fingerprint portal-web",
        "  4. Exploração conceitual: simular-sqli portal-web",
        "  5. Identidade: cred-test idp",
        "  6. Movimento lateral: pivot-sim db-core",
        "  7. Impacto: impacto-sim db-core",
        "  8. Fechamento: relatorio ataque",
        "Regra do laboratório: aprender o raciocínio ofensivo sem payload, malware, brute force ou alvo real.",
      ]);
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "ambiente ataque") {
      printLines("info", [
        "AttackBox online em rede isolada: 172.16.50.10",
        "Escopo autorizado: portal-web, idp, db-core e ws-17 fictícios deste laboratório.",
        "Fora do escopo: internet real, contas reais, malware, brute force, exfiltração e payloads reutilizáveis.",
        "Objetivo didático: entender a cadeia de ataque para escolher melhores controles defensivos.",
        "Comece por: recon portal-web",
      ]);
      updateState((draft) => draft.completedActions.add("attack_scope"));
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "recon portal-web" || cmd === "recon 10.10.10.20") {
      const asset = state.assets["portal-web"];
      printLines("out", [
        "Reconhecimento controlado do Portal Web:",
        `  Alvo: ${asset.name} (${asset.ip}) | Zona: ${asset.zone} | Dono: ${asset.owner}`,
        "  Serviço público: HTTPS para usuários externos.",
        "  Sinal de risco: SSH também aparece exposto no cenário inicial.",
        "  Próximo passo didático: fingerprint portal-web",
        "Defesa relacionada: inventário contínuo, firewall, VPN e allowlist para administração.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("attack_recon_portal-web");
        draft.discovered.add("portal-web");
        draft.scanned.add("portal-web");
      });
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "fingerprint portal-web") {
      printLines("warn", [
        "Fingerprint didático do Portal Web:",
        "  Stack fictícia: app de login, banco PostgreSQL interno e logs no SOC.",
        "  Observação: erro controlado de autenticação aparece quando a entrada é anômala.",
        "  Hipótese de risco: validação fraca antes da consulta ao banco.",
        "  Próximo passo didático: simular-sqli portal-web",
        "Defesa relacionada: headers, validação server-side, prepared statements e testes automatizados.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("attack_fingerprint_portal-web");
        draft.reviewedLogs.add("portal-web");
      });
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "simular-sqli portal-web" || cmd === "simular-sqli 10.10.10.20") {
      printLines("warn", [
        "Exploração simulada de SQL Injection:",
        "  Payload real: omitido por segurança.",
        "  Resultado didático: a aplicação reagiu como se entrada não confiável alterasse a consulta.",
        "  Evidência fictícia: erro de banco e alerta de anomalia no endpoint /login.",
        "  Impacto conceitual: risco de leitura indevida se a causa raiz não for corrigida.",
        "Defesa relacionada: patch sqli, WAF, logs úteis e revisão de código.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("attack_sqli_portal-web");
        draft.completedActions.add("sqli_detected");
        draft.alerts = draft.alerts.map((alert) =>
          alert.id === "web-sqli" ? { ...alert, status: "investigando" } : alert
        );
      });
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "cred-test idp") {
      printLines("warn", [
        "Simulação de abuso de credenciais contra o IdP:",
        "  Senhas reais: não usadas.",
        "  Brute force: não executado.",
        "  Sinal observado: muitas falhas distribuídas em contas administrativas.",
        "  Impacto conceitual: uma senha vazada pode escalar risco quando MFA está ausente.",
        "Defesa relacionada: mfa admin, rate limit adaptativo, alertas e revisão de sessões.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("attack_creds_idp");
        draft.reviewedLogs.add("idp");
        draft.alerts = draft.alerts.map((alert) =>
          alert.id === "idp-stuffing" ? { ...alert, status: "investigando" } : alert
        );
      });
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "pivot-sim db-core") {
      printLines("warn", [
        "Movimento lateral simulado:",
        "  Sessão real: não criada.",
        "  Túnel ou shell: não executado.",
        "  Caminho narrativo: Portal Web comprometido tentaria alcançar o banco se a ACL estivesse permissiva.",
        "  Evidência fictícia: conexão negada de origem indevida aparece nos logs do banco.",
        "Defesa relacionada: hardening db, segmentação, ACL por origem e menor privilégio.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("attack_pivot_db");
        draft.discovered.add("db-core");
        draft.reviewedLogs.add("db-core");
      });
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "impacto-sim db-core") {
      printLines("warn", [
        "Impacto simulado no banco crítico:",
        "  Dados reais: não exibidos.",
        "  Exfiltração: não simulada operacionalmente.",
        "  Classe de impacto: confidencialidade alta, integridade média, disponibilidade alta.",
        "  Prioridade: corrigir ACL, validar contas de serviço e reforçar auditoria.",
        "Defesa relacionada: criptografia, logs, backups testados e plano de resposta.",
      ]);
      updateState((draft) => draft.completedActions.add("attack_impact_db"));
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "relatorio ataque") {
      const completed = ATTACK_STEPS.filter((step) => state.completedActions.has(step.id)).length;
      printLines("ok", [
        "Relatório ofensivo didático:",
        `  Etapas concluídas: ${completed}/${ATTACK_STEPS.length}`,
        "  Cadeia provável: exposição -> enumeração -> falha de entrada -> acesso a dados -> impacto.",
        "  Principais quebras da cadeia: fechar SSH público, prepared statements, MFA, segmentação e backups testados.",
        "  Evidências usadas: alertas SOC, logs do Portal Web, logs do IdP e logs do banco.",
        "  Próximo passo defensivo: aplicar patch sqli, mfa admin, firewall ssh private e hardening db.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("attack_report");
        draft.incidentNotes.push("Relatório ofensivo didático criado com cadeia, impacto e recomendações defensivas.");
      });
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "inventario") {
      printLines(
        "out",
        assets.map(
          (asset) =>
            `${asset.id.padEnd(13)} ${asset.ip.padEnd(12)} zona=${asset.zone.padEnd(11)} criticidade=${asset.criticality.padEnd(8)} dono=${asset.owner}`
        )
      );
      updateState((draft) => {
        draft.completedActions.add("inventory_reviewed");
        Object.keys(draft.assets).forEach((assetId) => draft.discovered.add(assetId));
      });
      return;
    }

    if (cmd.startsWith("nmap ")) {
      const target = cmd.split(/\s+/)[1];
      const asset = findAsset(target);
      if (!asset) {
        pushLine("err", "Ativo não encontrado no escopo autorizado do laboratório.");
        return;
      }

      printLines("out", [
        "Starting SafeMap 2.0 (simulação defensiva)",
        `Scan report for ${asset.name} (${asset.ip})`,
        "PORT     STATE     SERVICE        EXPOSIÇÃO      NOTA",
        ...asset.services.map((service) => {
          const port = service.port === 0 ? "n/a" : `${service.port}/tcp`;
          return `${port.padEnd(8)} ${service.state.padEnd(9)} ${service.name.padEnd(14)} ${service.exposure.padEnd(12)} ${service.note}`;
        }),
      ]);
      updateState((draft) => {
        draft.discovered.add(asset.id);
        draft.scanned.add(asset.id);
      });
      return;
    }

    if (cmd.startsWith("risco ")) {
      const target = cmd.split(/\s+/)[1];
      const asset = findAsset(target);
      if (!asset) {
        pushLine("err", "Ativo não encontrado. Use 'inventario' para listar escopo.");
        return;
      }

      const weakControls = Object.entries(asset.controls)
        .filter(([, status]) => status !== "strong")
        .map(([name, status]) => `${name}=${statusLabel[status]}`);
      const openInternet = asset.services.filter((service) => service.exposure === "internet" && service.state === "open");
      printLines("warn", [
        `Risco: ${asset.name} (${asset.id})`,
        `Criticidade: ${asset.criticality} | Zona: ${asset.zone} | Dono: ${asset.owner}`,
        `Serviços expostos: ${openInternet.length ? openInternet.map((service) => `${service.name}:${service.port}`).join(", ") : "nenhum"}`,
        `Fraquezas abertas: ${asset.weaknesses.filter((weakness) => !weakness.resolved).map((weakness) => weakness.title).join(" | ") || "nenhuma crítica"}`,
        `Controles a melhorar: ${weakControls.join(", ") || "controles fortes"}`,
      ]);
      updateState((draft) => draft.completedActions.add(`risk_${asset.id}`));
      return;
    }

    if (cmd.startsWith("logs ")) {
      const target = cmd.split(/\s+/)[1];
      const asset = findAsset(target);
      if (!asset) {
        pushLine("err", "Ativo não encontrado para consulta de logs.");
        return;
      }

      const logLines: Record<string, string[]> = {
        "portal-web": [
          "2026-05-11T13:14Z auth/login status=500 reason=db_error source=203.0.113.77",
          "2026-05-11T13:15Z waf/anomaly category=input-tampering endpoint=/login action=alert",
          "2026-05-11T13:16Z app/security recommendation=parameterized-query",
        ],
        idp: [
          "2026-05-11T03:22Z login failed user=admin source=198.51.100.14 count=47",
          "2026-05-11T03:23Z login failed user=admin source=198.51.100.31 count=39",
          "2026-05-11T03:25Z policy warning=mfa_not_required group=admins",
        ],
        "ws-17": [
          "2026-05-11T09:41Z mail delivered subject='Fatura urgente' sender=payroll@evil-login.example",
          "2026-05-11T09:44Z endpoint process=invoice_viewer.tmp parent=mail_client action=blocked",
          "2026-05-11T09:45Z network dns_query=evil-login.example verdict=malicious",
        ],
        "db-core": [
          "2026-05-11T12:01Z postgres connection_denied source=10.10.20.17 user=app_readonly",
          "2026-05-11T12:02Z audit recommendation=restrict_network_acl",
        ],
        "backup-vault": [
          "2026-05-10T22:00Z backup completed dataset=finance status=ok",
          "2026-05-11T08:00Z restore_test status=missing evidence=no_recent_restore",
        ],
        "edge-fw": [
          "2026-05-11T00:00Z rule review status=stale any-to-core permitted=true",
          "2026-05-11T00:05Z vpn auth warning=mfa_partial",
        ],
      };

      printLines("out", [`Logs de ${asset.name}:`, ...(logLines[asset.id] || asset.evidence)]);
      updateState((draft) => {
        draft.reviewedLogs.add(asset.id);
        draft.alerts = draft.alerts.map((alert) =>
          alert.assetId === asset.id && alert.status === "novo" ? { ...alert, status: "investigando" } : alert
        );
      });
      return;
    }

    if (cmd === "sqli-test portal-web" || cmd === "sqli-test 10.10.10.20") {
      printLines("warn", [
        "Teste seguro de SQL Injection iniciado contra ambiente simulado.",
        "Resultado: parâmetro de login altera comportamento da consulta quando recebe entrada anômala.",
        "Evidência: erro de banco registrado, sem extração de dados e sem payload real exibido.",
        "Recomendação: prepared statements, validação server-side, testes automatizados e alerta no WAF.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("sqli_detected");
        draft.alerts = draft.alerts.map((alert) =>
          alert.id === "web-sqli" ? { ...alert, status: "investigando" } : alert
        );
      });
      return;
    }

    if (cmd === "patch sqli") {
      printLines("ok", [
        "Patch aplicado no Portal Web:",
        "  - Login migrado para consultas parametrizadas.",
        "  - Validação server-side adicionada aos campos sensíveis.",
        "  - Teste de regressão criado para entrada anomala.",
        "  - WAF passou de fraco para parcial e logs foram reforcados.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("patch_sqli");
        draft.assets["portal-web"] = markResolved(
          {
            ...draft.assets["portal-web"],
            controls: {
              ...draft.assets["portal-web"].controls,
              inputValidation: "strong",
              waf: "partial",
              logging: "strong",
            },
          },
          "sqli"
        );
        draft.alerts = draft.alerts.map((alert) =>
          alert.id === "web-sqli" ? { ...alert, status: "contido" } : alert
        );
      });
      return;
    }

    if (cmd === "mfa admin") {
      printLines("ok", [
        "Controles de identidade aplicados:",
        "  - MFA resistente a phishing para administradores.",
        "  - Rate limit adaptativo para falhas de login.",
        "  - Revisão de sessões ativas e contas privilegiadas.",
        "  - Alerta para login impossível e origem anômala.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("mfa_admin");
        draft.assets.idp = markResolved(
          {
            ...draft.assets.idp,
            controls: {
              ...draft.assets.idp.controls,
              mfa: "strong",
              rateLimit: "strong",
              privilegedAccess: "strong",
              audit: "strong",
            },
          },
          "no-mfa-admin"
        );
        draft.alerts = draft.alerts.map((alert) =>
          alert.id === "idp-stuffing" ? { ...alert, status: "contido" } : alert
        );
      });
      return;
    }

    if (cmd === "phishing analisar email-42") {
      printLines("warn", [
        "Análise do email-42:",
        "  Remetente: payroll@evil-login.example",
        "  Sinal: urgência artificial e domínio parecido com fornecedor real.",
        "  Sinal: anexo executável disfarçado como fatura.",
        "  Sinal: link redireciona para página de login falsa.",
        "Conclusão: phishing confirmado. Acione contenção e bloqueio de indicador.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("phishing_analyzed");
        draft.reviewedLogs.add("ws-17");
        draft.alerts = draft.alerts.map((alert) =>
          alert.id === "mail-phish" ? { ...alert, status: "investigando" } : alert
        );
      });
      return;
    }

    if (cmd === "edr scan ws-17") {
      printLines("out", [
        "EDR scan ws-17:",
        "  Processo suspeito: invoice_viewer.tmp",
        "  Origem: cliente de email",
        "  Ação: tentativa de persistência bloqueada",
        "  Conexão: evil-login.example",
        "  Recomendação: isolar host, coletar artefatos e redefinir sessões do usuário.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("edr_scanned");
        draft.assets["ws-17"].controls.edr = "strong";
      });
      return;
    }

    if (cmd === "isolar ws-17") {
      printLines("ok", [
        "Workstation ws-17 isolada da rede comum.",
        "Canal permitido: console EDR para coleta de evidências.",
        "Próximo passo: bloquear domínio malicioso e revisar credenciais do usuário.",
      ]);
      updateState((draft) => {
        draft.assets["ws-17"].status = "isolated";
        draft.assets["ws-17"].controls.isolation = "strong";
        draft.alerts = draft.alerts.map((alert) =>
          alert.id === "mail-phish" ? { ...alert, status: "contido" } : alert
        );
      });
      return;
    }

    if (cmd === "bloquear dominio evil-login.example") {
      printLines("ok", [
        "Indicador bloqueado em DNS filtering, gateway de email e EDR.",
        "Campanha adicionada ao treinamento direcionado do Financeiro.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("domain_blocked");
        draft.assets["ws-17"] = markResolved(
          {
            ...draft.assets["ws-17"],
            controls: {
              ...draft.assets["ws-17"].controls,
              emailSecurity: "strong",
              awareness: "strong",
            },
          },
          "phishing"
        );
      });
      return;
    }

    if (cmd === "firewall ssh private") {
      printLines("ok", [
        "Regra aplicada:",
        "  - SSH do Portal Web restrito a VPN administrativa.",
        "  - Tentativas diretas da internet agora são bloqueadas.",
        "  - Revisão de regras any-to-core agendada.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("firewall_ssh_private");
        draft.assets["edge-fw"].controls.firewall = "strong";
        draft.assets["edge-fw"].controls.segmentation = "partial";
        draft.assets["portal-web"] = markResolved(
          {
            ...draft.assets["portal-web"],
            services: draft.assets["portal-web"].services.map((service) =>
              service.name === "ssh" ? { ...service, exposure: "private", state: "filtered" } : service
            ),
          },
          "ssh-public"
        );
      });
      return;
    }

    if (cmd === "hardening db") {
      printLines("ok", [
        "Hardening aplicado no banco:",
        "  - ACL aceita conexões apenas do Portal Web e rede de administração.",
        "  - Conta da aplicação revisada para menor privilégio.",
        "  - Auditoria de acesso sensível habilitada.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("hardening_db");
        draft.assets["db-core"] = markResolved(
          {
            ...draft.assets["db-core"],
            controls: {
              ...draft.assets["db-core"].controls,
              networkAcl: "strong",
              leastPrivilege: "strong",
              audit: "strong",
            },
          },
          "db-acl"
        );
      });
      return;
    }

    if (cmd === "backup validar") {
      printLines("ok", [
        "Restore testado com sucesso em ambiente isolado.",
        "Backup marcado como imutável, criptografado e com acesso separado de administradores comuns.",
        "RPO/RTO documentados para sistemas críticos.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("backup_validated");
        draft.assets["backup-vault"] = markResolved(
          {
            ...draft.assets["backup-vault"],
            controls: {
              ...draft.assets["backup-vault"].controls,
              backupValidation: "strong",
              immutability: "strong",
              encryption: "strong",
              accessControl: "strong",
            },
          },
          "untested-backup"
        );
      });
      return;
    }

    if (cmd === "incident report") {
      printLines("ok", [
        "Relatório fechado:",
        "  Causa: phishing e controles parciais de email/endpoint.",
        "  Impacto: endpoint contido antes de propagação.",
        "  Contenção: isolamento, bloqueio de domínio e revisão de sessões.",
        "  Erradicação: artefatos removidos e regras atualizadas.",
        "  Melhorias: MFA, hardening, backups testados e playbooks revisados.",
      ]);
      updateState((draft) => {
        draft.completedActions.add("incident_reported");
        draft.incidentNotes.push("Relatório de incidente fechado com causa, impacto, contencao e melhorias.");
        draft.alerts = draft.alerts.map((alert) => ({ ...alert, status: alert.status === "novo" ? "investigando" : alert.status }));
      });
      return;
    }

    if (cmd === "score") {
      const posture = riskScore < 35 ? "aceitavel" : riskScore < 60 ? "em melhoria" : "alto risco";
      printLines(riskScore < 35 ? "ok" : "warn", [
        `Score de risco: ${riskScore}/100 (${posture})`,
        `Controles fortes: ${strongControls}/${totalControls}`,
        `Alertas contidos: ${containedAlerts}/${state.alerts.length}`,
        `Acoes concluidas: ${state.completedActions.size}`,
      ]);
      updateState((draft) => draft.completedActions.add("score_checked"));
      return;
    }

    pushLine("err", `Comando não reconhecido: ${cmd}. Digite 'help'.`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const index = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(index);
      setInput(history[index]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIdx === -1) return;
      const index = historyIdx + 1;
      if (index >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(index);
        setInput(history[index]);
      }
    }
  };

  const terminalCard = (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-300">
          <TerminalSquare className="h-4 w-4 text-emerald-300" />
          {viewMode === "attack" ? "AttackBox Terminal" : "SOC Terminal"}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => resetLevel()}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={scrollRef}
        className={`${viewMode === "guided" ? "h-[460px]" : "h-[520px]"} overflow-y-auto rounded-md bg-black/40 p-4 font-mono text-sm leading-6`}
      >
        {lines.map((line, index) => (
          <div key={`${line.text}-${index}`} className={`whitespace-pre-wrap break-words ${typeClass[line.type]}`}>
            {line.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          run(input);
          setInput("");
        }}
        className="mt-3 flex items-center rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm"
      >
        <span className="mr-2 shrink-0 text-emerald-300">
          {viewMode === "attack" ? "student@attackbox:~$" : "analyst@soc:~$"}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-600"
          placeholder="Digite um comando"
          spellCheck={false}
          autoFocus
        />
      </form>
    </div>
  );

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden px-4 py-8">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: 'url("/assets/images/cyberpunk_bg.png")' }}
        />
        <div className="absolute inset-0 bg-slate-950/75" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
          <div className="w-full rounded-lg border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between gap-4">
              <Button variant="ghost" onClick={onBack} className="text-slate-300 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Ataque e Defesa Simulados
              </div>
            </div>

            <div className="mb-6 grid gap-2 sm:grid-cols-6">
              {INTRO_SLIDES.map((slide, index) => (
                <button
                  key={slide.title}
                  onClick={() => setIntroStep(index)}
                  className={`h-2 rounded-full transition ${
                    index <= introStep ? "bg-sky-300" : "bg-white/10 hover:bg-white/20"
                  }`}
                  aria-label={`Abrir introdução ${index + 1}: ${slide.title}`}
                />
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300">
                  <IntroIcon className="h-7 w-7" />
                </div>
                <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  {introSlide.eyebrow}
                </div>
                <h1 className="mb-4 text-4xl font-black leading-tight text-white md:text-5xl">
                  {introSlide.title}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  {introSlide.body}
                </p>

                {introSlide.command && (
                  <div className="mt-5 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 font-mono text-sm text-emerald-100">
                    <span className="text-emerald-300">Comando exemplo:</span> {introSlide.command}
                  </div>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => setIntroStep((current) => Math.max(0, current - 1))}
                    disabled={introStep === 0}
                  >
                    Voltar etapa
                  </Button>
                  <Button
                    className="bg-rose-600 text-white hover:bg-rose-700"
                    onClick={() => {
                      if (introDone) startLab();
                      else setIntroStep((current) => Math.min(INTRO_SLIDES.length - 1, current + 1));
                    }}
                  >
                    {introDone ? <TerminalSquare className="mr-2 h-4 w-4" /> : <ChevronDown className="-rotate-90 mr-2 h-4 w-4" />}
                    {introDone ? "Entrar no Laboratório" : "Próxima explicação"}
                  </Button>
                  <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={startLab}>
                    Pular introdução
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      O que observar
                    </div>
                    <div className="text-xs font-bold text-slate-500">
                      {introStep + 1}/{INTRO_SLIDES.length}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {introSlide.items.map((item) => (
                      <div key={item.label} className="rounded-md border border-white/10 bg-black/20 p-3">
                        <div className="mb-1 flex items-center gap-2 text-sm font-black text-white">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-300" />
                          {item.label}
                        </div>
                        <p className="text-xs leading-5 text-slate-400">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Defesa", icon: ShieldCheck, text: "Investigar, conter e corrigir." },
                    { label: "Ataque", icon: Bug, text: "Entender a cadeia sem risco real." },
                    { label: "Evidência", icon: FileSearch, text: "Decidir com logs e alertas." },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                        <Icon className="mb-2 h-4 w-4 text-emerald-300" />
                        <div className="text-xs font-black uppercase tracking-[0.14em] text-white">{item.label}</div>
                        <p className="mt-1 text-[11px] leading-5 text-slate-500">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: 'url("/assets/images/cyberpunk_bg.png")' }}
      />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.65),rgba(2,6,23,0.95))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 md:px-6">
        <header className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-300 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-rose-300">
                <Shield className="h-4 w-4" />
                Cyber Security Lab
              </div>
              <h1 className="text-xl font-black text-white md:text-2xl">{level.title}</h1>
              <p className="text-sm text-slate-400">{level.focus}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Risco" value={`${riskScore}/100`} tone={riskScore < 35 ? "good" : riskScore < 60 ? "warn" : "bad"} />
            <Metric label="Alertas" value={`${containedAlerts}/${state.alerts.length}`} tone="warn" />
            <Metric label="Controles fortes" value={`${strongControls}/${totalControls}`} tone="good" />
            <Metric
              label={viewMode === "attack" ? "Ataque" : "Nível"}
              value={viewMode === "attack" ? `${completedAttackSteps}/${ATTACK_STEPS.length}` : `${level.id}/4`}
              tone="info"
            />
          </div>
        </header>

        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {LEVELS.map((item, index) => (
              <button
                key={item.id}
                onClick={() => resetLevel(index)}
                className={`min-w-[11rem] rounded-lg border px-4 py-3 text-left transition ${
                  index === levelIdx
                    ? "border-rose-400/50 bg-rose-500/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-[0.18em]">Nível {item.id}</div>
                <div className="mt-1 text-sm font-bold">{item.title}</div>
              </button>
            ))}
          </div>

          <div className="grid w-full grid-cols-3 gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1 xl:w-auto">
            {[
              { id: "guided" as ViewMode, label: "Modo guiado", icon: BookOpen },
              { id: "soc" as ViewMode, label: "Modo SOC", icon: ShieldCheck },
              { id: "attack" as ViewMode, label: "Modo Ataque", icon: Bug },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setViewMode(item.id)}
                  className={`flex min-w-0 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[10px] font-black uppercase tracking-[0.08em] transition sm:gap-2 sm:text-xs xl:flex-none xl:px-3 ${
                    viewMode === item.id ? "bg-white/15 text-white" : "text-slate-500 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {viewMode === "guided" ? (
          <main className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            {terminalCard}

            <section className="space-y-5">
              <MissionPanel level={level} mission={mission} levelDone={levelDone} missionIdx={missionIdx} />
              <MissionConceptPanel mission={mission} levelDone={levelDone} />
              <GuidedDetails
                activePanel={detailPanel}
                onChangePanel={setDetailPanel}
                assets={assets}
                scanned={state.scanned}
                alerts={state.alerts}
                assetMap={state.assets}
                discovered={state.discovered}
              />
            </section>
          </main>
        ) : viewMode === "attack" ? (
          <main className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.9fr)]">
            {terminalCard}

            <section className="space-y-5">
              <AttackLabPanel state={state} onRun={run} />
              <KnowledgePanel tab={knowledgeTab} onChange={setKnowledgeTab} />
              <OperationMap assets={assets} scanned={state.scanned} />
            </section>
          </main>
        ) : (
          <main className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.9fr)]">
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              {terminalCard}

              <aside className="space-y-5">
                <MissionPanel level={level} mission={mission} levelDone={levelDone} missionIdx={missionIdx} />
                <OperationMap assets={assets} scanned={state.scanned} />
                <AlertPanel alerts={state.alerts} assets={state.assets} />
              </aside>
            </section>

            <section className="space-y-5">
              <KnowledgePanel tab={knowledgeTab} onChange={setKnowledgeTab} />
              <AssetPanel assets={assets} discovered={state.discovered} />
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "bad" | "info" }) {
  const toneClass = {
    good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    bad: "border-red-500/30 bg-red-500/10 text-red-200",
    info: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  }[tone];

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
      <div className="text-[9px] font-black uppercase tracking-[0.12em] opacity-75 sm:text-[10px]">{label}</div>
      <div className="text-lg font-black">{value}</div>
    </div>
  );
}

function MissionConceptPanel({ mission, levelDone }: { mission?: Mission; levelDone: boolean }) {
  const concept = !levelDone && mission ? MISSION_CONCEPTS[mission.id] : undefined;

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <BookOpen className="h-4 w-4 text-emerald-300" />
        Conceito da Etapa
      </div>

      {concept ? (
        <div>
          <div className="mb-2 inline-flex rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
            {concept.label}
          </div>
          <h2 className="mb-2 text-lg font-black text-white">{concept.title}</h2>
          <p className="mb-4 text-sm leading-6 text-slate-300">{concept.body}</p>
          <div className="grid gap-2">
            {concept.checks.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm leading-6 text-emerald-100">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          Nível finalizado. Use `next` para abrir o próximo conjunto de conceitos.
        </div>
      )}
    </div>
  );
}

function GuidedDetails({
  activePanel,
  onChangePanel,
  assets,
  scanned,
  alerts,
  assetMap,
  discovered,
}: {
  activePanel: DetailPanel | null;
  onChangePanel: (panel: DetailPanel | null) => void;
  assets: Asset[];
  scanned: Set<string>;
  alerts: AlertItem[];
  assetMap: Record<string, Asset>;
  discovered: Set<string>;
}) {
  const panels: { id: DetailPanel; title: string; subtitle: string; icon: LucideIcon; count: string }[] = [
    { id: "ambiente", title: "Ambiente", subtitle: "Mapa de ativos", icon: Radar, count: `${assets.length}` },
    {
      id: "alertas",
      title: "Alertas",
      subtitle: "Triagem SOC",
      icon: Activity,
      count: `${alerts.filter((alert) => alert.status === "novo" || alert.status === "investigando").length}`,
    },
    { id: "ativos", title: "Controles", subtitle: "Estado defensivo", icon: Eye, count: `${discovered.size}/${assets.length}` },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              <ChevronDown className="h-4 w-4 text-sky-300" />
              Painéis Técnicos
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Abra só quando precisar investigar. O modo SOC mostra todos ao mesmo tempo.
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <button
                key={panel.id}
                onClick={() => onChangePanel(activePanel === panel.id ? null : panel.id)}
                className={`rounded-md border p-3 text-left transition ${
                  activePanel === panel.id
                    ? "border-sky-400/50 bg-sky-500/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Icon className="h-4 w-4 text-sky-300" />
                  <span className="rounded bg-black/20 px-2 py-0.5 text-[10px] font-black">{panel.count}</span>
                </div>
                <div className="text-xs font-black">{panel.title}</div>
                <div className="text-[11px] text-slate-500">{panel.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {activePanel === "ambiente" && <OperationMap assets={assets} scanned={scanned} />}
      {activePanel === "alertas" && <AlertPanel alerts={alerts} assets={assetMap} />}
      {activePanel === "ativos" && <AssetPanel assets={assets} discovered={discovered} />}
    </div>
  );
}

function MissionPanel({
  level,
  mission,
  missionIdx,
  levelDone,
}: {
  level: LevelDef;
  mission?: Mission;
  missionIdx: number;
  levelDone: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <Crosshair className="h-4 w-4 text-rose-300" />
        Missão Atual
      </div>
      {levelDone ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <Unlock className="h-5 w-5" />
            <span className="font-black">Nível concluido</span>
          </div>
          <p className="text-sm leading-6 text-slate-400">Digite `next` ou selecione outro nível para continuar o treinamento.</p>
        </div>
      ) : (
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            {missionIdx + 1}/{level.missions.length}
          </div>
          <h2 className="mb-3 text-base font-black text-white">{mission?.title}</h2>
          <p className="mb-3 rounded-md border border-sky-500/20 bg-sky-500/10 p-3 text-xs leading-5 text-sky-100">
            Comando: <span className="font-mono font-bold">{mission?.hint}</span>
          </p>
          <p className="mb-2 text-sm leading-6 text-slate-300">{mission?.principle}</p>
          <p className="text-xs leading-5 text-slate-500">{mission?.defense}</p>
        </div>
      )}
    </div>
  );
}

function OperationMap({ assets, scanned }: { assets: Asset[]; scanned: Set<string> }) {
  const iconFor = (asset: Asset) => {
    if (asset.id === "ws-17") return Laptop;
    if (asset.id === "edge-fw") return Shield;
    if (asset.id === "idp") return KeyRound;
    if (asset.id === "portal-web") return Server;
    return Network;
  };

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <Radar className="h-4 w-4 text-sky-300" />
        Ambiente
      </div>
      <div className="grid grid-cols-2 gap-2">
        {assets.map((asset) => {
          const Icon = iconFor(asset);
          const isScanned = scanned.has(asset.id);
          const unresolved = asset.weaknesses.filter((weakness) => !weakness.resolved).length;
          return (
            <div key={asset.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Icon className={`h-4 w-4 ${asset.status === "isolated" ? "text-amber-300" : "text-sky-300"}`} />
                <span className={`h-2 w-2 rounded-full ${unresolved ? "bg-red-400" : "bg-emerald-400"}`} />
              </div>
              <div className="truncate text-xs font-black text-white">{asset.id}</div>
              <div className="truncate text-[11px] text-slate-500">{isScanned ? asset.ip : asset.zone}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertPanel({ alerts, assets }: { alerts: AlertItem[]; assets: Record<string, Asset> }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <Activity className="h-4 w-4 text-amber-300" />
        Alertas
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className={`rounded border px-2 py-0.5 text-[10px] font-black uppercase ${severityClass[alert.severity]}`}>
                {alert.severity}
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-500">{alert.status}</span>
            </div>
            <p className="text-xs leading-5 text-slate-300">{alert.title}</p>
            <p className="mt-1 text-[11px] text-slate-500">{assets[alert.assetId]?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttackLabPanel({ state, onRun }: { state: LabState; onRun: (command: string) => void }) {
  const completed = ATTACK_STEPS.filter((step) => state.completedActions.has(step.id)).length;

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-rose-300">
            <Flame className="h-4 w-4" />
            Ambiente de Ataque
          </div>
          <h2 className="text-lg font-black text-white">AttackBox didática</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Trilha ofensiva 100% simulada para entender como falhas viram impacto e quais controles quebram a cadeia.
          </p>
        </div>
        <div className="rounded-md border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-200">Progresso</div>
          <div className="text-xl font-black text-white">
            {completed}/{ATTACK_STEPS.length}
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {[
          ["Rede", "172.16.50.0/24 isolada"],
          ["Alvos", "Ativos fictícios do laboratório"],
          ["Regra", "Sem payload real ou alvo externo"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-1 text-xs font-bold text-slate-200">{value}</div>
          </div>
        ))}
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {ATTACK_STEPS.map((step, index) => {
          const done = state.completedActions.has(step.id);
          return (
            <div
              key={step.id}
              className={`rounded-md border p-3 transition ${
                done ? "border-emerald-500/25 bg-emerald-500/10" : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-black/25 px-2 py-0.5 text-[10px] font-black text-slate-300">
                      {index + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-200">{step.phase}</span>
                  </div>
                  <h3 className="text-sm font-black text-white">{step.title}</h3>
                </div>
                <span className={`rounded px-2 py-1 text-[10px] font-black uppercase ${done ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-slate-400"}`}>
                  {done ? "feito" : "pendente"}
                </span>
              </div>

              <p className="mb-2 text-xs leading-5 text-slate-400">{step.objective}</p>
              <p className="mb-3 text-[11px] leading-5 text-slate-500">{step.safety}</p>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <code className="rounded border border-white/10 bg-black/25 px-2 py-1 text-[11px] text-sky-200">{step.command}</code>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 justify-center text-xs font-bold text-slate-300 hover:text-white"
                  onClick={() => onRun(step.command)}
                >
                  Executar
                </Button>
              </div>

              <div className="mt-2 rounded border border-sky-500/15 bg-sky-500/5 p-2 text-[11px] leading-5 text-sky-100">
                Defesa: {step.defense}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KnowledgePanel({ tab, onChange }: { tab: KnowledgeTab; onChange: (tab: KnowledgeTab) => void }) {
  const data = {
    principios: PRINCIPLES,
    ataques: ATTACKS,
    defesas: DEFENSES,
  }[tab];
  const tabLabels: Record<KnowledgeTab, string> = {
    principios: "Princípios",
    ataques: "Ataques",
    defesas: "Defesas",
  };

  const Icon = tab === "principios" ? BookOpen : tab === "ataques" ? Flame : ShieldCheck;

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          <Icon className="h-4 w-4 text-emerald-300" />
          Base de Conhecimento
        </div>
        <div className="grid w-full grid-cols-3 rounded-md border border-white/10 bg-white/[0.04] p-1">
          {(["principios", "ataques", "defesas"] as KnowledgeTab[]).map((item) => (
            <button
              key={item}
              onClick={() => onChange(item)}
              className={`min-w-0 rounded px-1 py-1 text-center text-[8px] font-black uppercase transition focus:outline-none focus-visible:outline-none sm:text-[10px] ${
                tab === item ? "text-white" : "text-slate-500 hover:text-slate-200"
              }`}
            >
              <span className={`inline-block whitespace-nowrap border-b-2 py-1 ${tab === item ? "border-sky-300" : "border-transparent"}`}>
                {tabLabels[item]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.title} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <h3 className="mb-1 text-sm font-black text-white">{item.title}</h3>
            <p className="text-xs leading-5 text-slate-400">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetPanel({ assets, discovered }: { assets: Asset[]; discovered: Set<string> }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <Eye className="h-4 w-4 text-sky-300" />
        Ativos e Controles
      </div>

      <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
        {assets.map((asset) => {
          const visible = discovered.has(asset.id);
          const unresolved = asset.weaknesses.filter((weakness) => !weakness.resolved);
          return (
            <div key={asset.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-white">{visible ? asset.name : "Ativo não inventariado"}</h3>
                  <p className="text-xs text-slate-500">{visible ? `${asset.id} | ${asset.ip} | ${asset.zone}` : "Use inventário para revelar"}</p>
                </div>
                {asset.status === "isolated" ? (
                  <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase text-amber-200">
                    Isolado
                  </span>
                ) : (
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase text-emerald-200">
                    Online
                  </span>
                )}
              </div>

              {visible ? (
                <>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {Object.entries(asset.controls).map(([name, status]) => (
                      <span key={name} className={`rounded border px-2 py-1 text-[10px] font-bold ${statusClass[status]}`}>
                        {name}: {statusLabel[status]}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {unresolved.length ? (
                      unresolved.map((weakness) => (
                        <div key={weakness.id} className="rounded border border-red-500/20 bg-red-500/5 p-2">
                          <div className="mb-1 flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-300" />
                            <span className="text-xs font-bold text-red-100">{weakness.title}</span>
                          </div>
                          <p className="text-[11px] leading-5 text-slate-400">{weakness.defense}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 rounded border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs text-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />
                        Principais fraquezas tratadas
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="h-4 w-4" />
                  Ativo ainda não classificado.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
