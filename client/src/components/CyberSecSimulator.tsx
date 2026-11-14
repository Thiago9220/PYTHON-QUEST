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
  ShieldCheck,
  TerminalSquare,
  AlertTriangle,
  Unlock,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NetworkCodex } from "./NetworkCodex";
import { useGame } from "@/contexts/GameContext";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import {
  getAttackSteps,
  getAttackTerminalOutput,
  getAttacks,
  getDefenses,
  getIntroSlides,
  getMissionConcepts,
  getPrinciples,
} from "./cyber-lab/content";
import {
  ALERTS_EN,
  ASSETS_EN,
  LEVELS_EN,
  LOG_LINES_EN,
} from "@/lib/i18n/cybersec_en";

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

const statusLabelByLang: Record<AppLanguage, Record<ControlStatus, string>> = {
  pt: {
    weak: "Fraco",
    partial: "Parcial",
    strong: "Forte",
  },
  en: {
    weak: "Weak",
    partial: "Partial",
    strong: "Strong",
  },
};

function getCriticalityLabel(criticality: Asset["criticality"], lang: AppLanguage): string {
  if (lang !== "en") return criticality;
  return {
    baixa: "low",
    media: "medium",
    alta: "high",
    critica: "critical",
  }[criticality];
}

function getAlertStatusLabel(status: AlertItem["status"], lang: AppLanguage): string {
  if (lang !== "en") return status;
  return {
    novo: "new",
    investigando: "investigating",
    contido: "contained",
    fechado: "closed",
  }[status];
}

function getLocalizedAsset(asset: Asset, lang: AppLanguage): Asset {
  if (lang !== "en") return asset;
  const tr = ASSETS_EN[asset.id];
  if (!tr) return asset;
  return {
    ...asset,
    name: tr.name,
    zone: tr.zone,
    owner: tr.owner,
    services: asset.services.map((service, idx) => ({
      ...service,
      note: tr.serviceNotes[idx] ?? service.note,
    })),
    weaknesses: asset.weaknesses.map((weakness) => {
      const wTr = tr.weaknesses[weakness.id];
      return wTr ? { ...weakness, ...wTr } : weakness;
    }),
    evidence: tr.evidence,
  };
}

function getLocalizedAlertTitle(alert: AlertItem, lang: AppLanguage): string {
  if (lang !== "en") return alert.title;
  return ALERTS_EN[alert.id] ?? alert.title;
}

function getLocalizedLevel(level: LevelDef, lang: AppLanguage): LevelDef {
  if (lang !== "en") return level;
  const tr = LEVELS_EN[level.id];
  if (!tr) return level;
  return {
    ...level,
    title: tr.title,
    focus: tr.focus,
    briefing: tr.briefing,
    missions: level.missions.map((mission) => {
      const mTr = tr.missions[mission.id];
      return mTr ? { ...mission, ...mTr } : mission;
    }),
  };
}

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
  const { state: gameState, dispatch, hasHydrated } = useGame();
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const [phase, setPhase] = useState<"intro" | "playing">(() =>
    localStorage.getItem("cyber_sim_intro") ? "playing" : "intro"
  );
  const [introStep, setIntroStep] = useState(0);
  const [levelIdx, setLevelIdx] = useState(0);
  const [missionIdx, setMissionIdx] = useState(0);
  const [state, setState] = useState<LabState>(() => LEVELS[0].starter());
  const [lines, setLines] = useState<Line[]>(() => [
    { type: "info", text: "Cyber Security Lab v3.0" },
    {
      type: "warn",
      text: isEn
        ? "100% simulated environment. Practice only on systems you own or have authorization to test."
        : "Ambiente 100% simulado. Pratique apenas em sistemas próprios ou com autorização.",
    },
    {
      type: "info",
      text: isEn
        ? "Type 'help' to see defense and simulated attack commands."
        : "Digite 'help' para ver comandos de defesa e ataque simulado.",
    },
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
  const [isManualOpen, setIsManualOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const localizedLevels = useMemo(() => LEVELS.map((lv) => getLocalizedLevel(lv, lang)), [lang]);
  const level = localizedLevels[levelIdx];
  const mission = level.missions[missionIdx];
  const levelDone = missionIdx >= level.missions.length;
  const assets = useMemo(
    () => Object.values(state.assets).map((asset) => getLocalizedAsset(asset, lang)),
    [state.assets, lang]
  );
  const localizedAssetMap = useMemo(
    () => Object.fromEntries(assets.map((asset) => [asset.id, asset])) as Record<string, Asset>,
    [assets]
  );
  const riskScore = useMemo(() => calculateRisk(state), [state]);
  const containedAlerts = state.alerts.filter((alert) => alert.status === "contido" || alert.status === "fechado").length;
  const attackSteps = useMemo(() => getAttackSteps(lang), [lang]);
  const attackTerminalOutput = useMemo(() => getAttackTerminalOutput(lang), [lang]);
  const completedAttackSteps = attackSteps.filter((step) => state.completedActions.has(step.id)).length;
  const strongControls = assets.reduce(
    (sum, asset) => sum + Object.values(asset.controls).filter((status) => status === "strong").length,
    0
  );
  const totalControls = assets.reduce((sum, asset) => sum + Object.values(asset.controls).length, 0);
  const introSlides = useMemo(() => getIntroSlides(lang), [lang]);
  const introSlide = introSlides[introStep];
  const IntroIcon = introSlide.icon;
  const introDone = introStep === introSlides.length - 1;

  const startLab = () => {
    localStorage.setItem("cyber_sim_intro", "true");
    if (!gameState.hasSeenCyberSecIntro) dispatch({ type: "COMPLETE_CYBERSEC_INTRO" });
    setPhase("playing");
  };

  useEffect(() => {
    if (!hasHydrated) return;

    if (gameState.hasSeenCyberSecIntro) {
      localStorage.setItem("cyber_sim_intro", "true");
      setPhase("playing");
      return;
    }

    if (localStorage.getItem("cyber_sim_intro") === "true") {
      dispatch({ type: "COMPLETE_CYBERSEC_INTRO" });
    }
  }, [dispatch, gameState.hasSeenCyberSecIntro, hasHydrated]);

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
      { type: "ok", text: isEn ? `[+] Mission completed: ${mission.title}` : `[+] Missão concluída: ${mission.title}` },
      { type: "info", text: isEn ? `Defense applied: ${mission.defense}` : `Defesa aplicada: ${mission.defense}` },
    ]);

    const next = missionIdx + 1;
    if (next >= level.missions.length) {
      setLines((current) => [
        ...current,
        {
          type: "ok",
          text: isEn ? `=== LEVEL ${level.id} COMPLETED: ${level.title} ===` : `=== NÍVEL ${level.id} CONCLUÍDO: ${level.title} ===`,
        },
      ]);
    }
    setMissionIdx(next);
  }, [isEn, levelDone, level.id, level.missions.length, level.title, mission, missionIdx, state]);

  const pushLine = (type: Line["type"], text: string) => {
    setLines((current) => [...current, { type, text }]);
  };

  const printLines = (type: Line["type"], output: string[]) => {
    setLines((current) => [...current, ...output.map((text) => ({ type, text }))]);
  };

  const resetLevel = (index = levelIdx) => {
    const nextLevel = localizedLevels[index];
    setLevelIdx(index);
    setMissionIdx(0);
    setState(nextLevel.starter());
    setLines([
      { type: "info", text: isEn ? `Level ${nextLevel.id}: ${nextLevel.title}` : `Nível ${nextLevel.id}: ${nextLevel.title}` },
      { type: "info", text: nextLevel.briefing },
      {
        type: "info",
        text: isEn ? "Type 'help' for commands or follow the current mission." : "Digite 'help' para comandos ou siga a missão atual.",
      },
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
    assets.find(
      (asset) =>
        asset.id === token ||
        asset.ip === token ||
        asset.name.toLowerCase() === token.toLowerCase() ||
        state.assets[asset.id]?.name.toLowerCase() === token.toLowerCase()
    );

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
      else
        pushLine(
          "ok",
          isEn ? "All levels have already been unlocked in this lab." : "Todos os níveis já foram liberados neste laboratório."
        );
      return;
    }

    if (/^(nivel|level)\s+[1-4]$/.test(cmd)) {
      resetLevel(Number(cmd.split(/\s+/)[1]) - 1);
      return;
    }

    if (cmd === "help") {
      printLines(
        "out",
        isEn
          ? [
              "Main commands:",
              "  principios                         Study CIA, least privilege, defense in depth, and zero trust",
              "  ataques                            List common attacks and defensive signals",
              "  defesas                            List protection controls and best practices",
              "  inventario                         Show assets, owners, zones, and criticality",
              "  nmap <ip|asset>                    Map ports on the simulated asset",
              "  risco <ip|asset>                   Summarize risks and weak controls",
              "  logs <asset>                       Review evidence for the asset",
              "  sqli-test portal-web               Detect SQLi without running a real payload",
              "  patch sqli                         Fix injection root cause on Portal Web",
              "  mfa admin                          Enable MFA and privileged login controls",
              "  phishing analisar email-42         Analyze phishing indicators",
              "  edr scan ws-17                     Investigate suspicious endpoint",
              "  isolar ws-17                       Contain affected workstation",
              "  bloquear dominio evil-login.example Block malicious indicator",
              "  firewall ssh private               Restrict administrative SSH",
              "  hardening db                       Apply least privilege on the database",
              "  backup validar                     Test restore and harden backup",
              "  incident report                    Close incident response report",
              "  score                              Show current risk posture",
              "",
              "Simulated attack environment commands:",
              "  ataque                             Show the safe offensive chain",
              "  ambiente ataque                    Define scope, rules, and fictional targets",
              "  recon portal-web                   Controlled recon of the web target",
              "  fingerprint portal-web             Educational application enumeration",
              "  simular-sqli portal-web            Conceptual exploitation without a real payload",
              "  cred-test idp                      Simulate credential risk without brute force",
              "  pivot-sim db-core                  Safe narrative lateral movement",
              "  impacto-sim db-core                Classify impact without exfiltrating data",
              "  relatorio ataque                   Close offensive findings and defenses",
            ]
          : [
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
            ]
      );
      return;
    }

    if (cmd === "principios" || cmd === "cia") {
      printLines(
        "info",
        isEn
          ? [
              "Essential defensive principles:",
              "  1. Confidentiality: sensitive data only for those who need it.",
              "  2. Integrity: changes must be authorized, traceable, and verifiable.",
              "  3. Availability: critical services must withstand failures and attacks.",
              "  4. Least privilege: minimize permissions to limit impact.",
              "  5. Defense in depth: no single layer is sufficient on its own.",
              "  6. Zero trust: continuously verify identity, device, and context.",
            ]
          : [
              "Princípios defensivos essenciais:",
              "  1. Confidencialidade: dados sensíveis só para quem precisa.",
              "  2. Integridade: alterações devem ser autorizadas, rastreáveis e verificáveis.",
              "  3. Disponibilidade: serviços críticos precisam resistir a falhas e ataques.",
              "  4. Menor privilégio: reduza permissões para limitar impacto.",
              "  5. Defesa em profundidade: nenhuma camada sozinha é suficiente.",
              "  6. Zero trust: verifique identidade, dispositivo e contexto continuamente.",
            ]
      );
      updateState((draft) => draft.completedActions.add("principles_read"));
      setKnowledgeTab("principios");
      return;
    }

    if (cmd === "ataques") {
      printLines(
        "warn",
        isEn
          ? [
              "Main attacks covered by this lab:",
              "  Phishing: manipulates people to gain access or execute malware.",
              "  Credential stuffing: tests leaked passwords against corporate accounts.",
              "  SQL Injection: exploits unhandled input in database queries.",
              "  Ransomware: encrypts data and demands a ransom.",
              "  Service exposure: administers systems over improperly open ports.",
            ]
          : [
              "Principais ataques que este laboratório cobre:",
              "  Phishing: manipula pessoas para obter acesso ou executar malware.",
              "  Credential stuffing: usa senhas vazadas contra contas corporativas.",
              "  SQL Injection: explora entrada não tratada em consultas ao banco.",
              "  Ransomware: criptografa dados e pressiona por resgate.",
              "  Exposição de serviços: administra sistemas por portas abertas indevidamente.",
            ]
      );
      updateState((draft) => draft.completedActions.add("attacks_read"));
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "defesas") {
      printLines(
        "ok",
        isEn
          ? [
              "Priority defenses:",
              "  Continuous inventory and criticality classification.",
              "  MFA for sensitive accounts and strong password policies.",
              "  Segmentation, firewall, and admin access via VPN or allowlist.",
              "  Parameterized queries, input validation, and security testing.",
              "  Centralized logs, actionable alerts, and EDR on endpoints.",
              "  Immutable backups with tested restoration.",
            ]
          : [
              "Defesas prioritárias:",
              "  Inventário contínuo e classificação de criticidade.",
              "  MFA para contas sensíveis e políticas de senha fortes.",
              "  Segmentação, firewall e acesso administrativo via VPN ou allowlist.",
              "  Queries parametrizadas, validação de entrada e testes de segurança.",
              "  Logs centralizados, alertas acionáveis e EDR em endpoints.",
              "  Backups imutáveis com restauração testada.",
            ]
      );
      updateState((draft) => draft.completedActions.add("defenses_read"));
      setKnowledgeTab("defesas");
      return;
    }

    if (cmd === "ataque" || cmd === "attack help" || cmd === "killchain") {
      printLines(
        "warn",
        isEn
          ? [
              "Simulated attack environment:",
              "  1. Preparation: ambiente ataque",
              "  2. Reconnaissance: recon portal-web",
              "  3. Enumeration: fingerprint portal-web",
              "  4. Conceptual exploitation: simular-sqli portal-web",
              "  5. Identity: cred-test idp",
              "  6. Lateral movement: pivot-sim db-core",
              "  7. Impact: impacto-sim db-core",
              "  8. Closure: relatorio ataque",
              "Lab rule: learn offensive reasoning without real payloads, malware, brute force, or real targets.",
            ]
          : [
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
            ]
      );
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "ambiente ataque") {
      printLines("out", attackTerminalOutput.attack_scope);
      updateState((draft) => draft.completedActions.add("attack_scope"));
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "recon portal-web" || cmd === "recon 10.10.10.20") {
      printLines("out", attackTerminalOutput["attack_recon_portal-web"]);
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
      printLines("out", attackTerminalOutput["attack_fingerprint_portal-web"]);
      updateState((draft) => {
        draft.completedActions.add("attack_fingerprint_portal-web");
        draft.reviewedLogs.add("portal-web");
      });
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "simular-sqli portal-web" || cmd === "simular-sqli 10.10.10.20") {
      printLines("out", attackTerminalOutput["attack_sqli_portal-web"]);
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
      printLines("out", attackTerminalOutput.attack_creds_idp);
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
      printLines("out", attackTerminalOutput.attack_pivot_db);
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
      printLines("out", attackTerminalOutput.attack_impact_db);
      updateState((draft) => draft.completedActions.add("attack_impact_db"));
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "relatorio ataque") {
      const completed = attackSteps.filter((step) => state.completedActions.has(step.id)).length;
      printLines("ok", [
        ...attackTerminalOutput.attack_report,
        "",
        isEn
          ? `Steps completed by student: ${completed}/${attackSteps.length}`
          : `Etapas concluídas pelo aluno: ${completed}/${attackSteps.length}`,
      ]);
      updateState((draft) => {
        draft.completedActions.add("attack_report");
        draft.incidentNotes.push(
          isEn
            ? "Educational offensive report created with Lockheed Martin kill chain, MITRE ATT&CK, and NIST CSF."
            : "Relatório ofensivo didático criado com cadeia Lockheed Martin, MITRE ATT&CK e NIST CSF."
        );
      });
      setViewMode("attack");
      setKnowledgeTab("ataques");
      return;
    }

    if (cmd === "inventario") {
      printLines(
        "out",
        assets.map((asset) =>
          isEn
            ? `${asset.id.padEnd(13)} ${asset.ip.padEnd(12)} zone=${asset.zone.padEnd(11)} criticality=${getCriticalityLabel(asset.criticality, lang).padEnd(8)} owner=${asset.owner}`
            : `${asset.id.padEnd(13)} ${asset.ip.padEnd(12)} zona=${asset.zone.padEnd(11)} criticidade=${asset.criticality.padEnd(8)} dono=${asset.owner}`
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
        pushLine(
          "err",
          isEn ? "Asset not found in the authorized lab scope." : "Ativo não encontrado no escopo autorizado do laboratório."
        );
        return;
      }

      printLines("out", [
        isEn ? "Starting SafeMap 2.0 (defensive simulation)" : "Starting SafeMap 2.0 (simulação defensiva)",
        `Scan report for ${asset.name} (${asset.ip})`,
        isEn ? "PORT     STATE     SERVICE        EXPOSURE       NOTE" : "PORT     STATE     SERVICE        EXPOSIÇÃO      NOTA",
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
        pushLine(
          "err",
          isEn ? "Asset not found. Use 'inventario' to list scope." : "Ativo não encontrado. Use 'inventario' para listar escopo."
        );
        return;
      }

      const weakControls = Object.entries(asset.controls)
        .filter(([, status]) => status !== "strong")
        .map(([name, status]) => `${name}=${statusLabelByLang[lang][status]}`);
      const openInternet = asset.services.filter((service) => service.exposure === "internet" && service.state === "open");
      printLines(
        "warn",
        isEn
          ? [
              `Risk: ${asset.name} (${asset.id})`,
              `Criticality: ${getCriticalityLabel(asset.criticality, lang)} | Zone: ${asset.zone} | Owner: ${asset.owner}`,
              `Exposed services: ${openInternet.length ? openInternet.map((service) => `${service.name}:${service.port}`).join(", ") : "none"}`,
              `Open weaknesses: ${asset.weaknesses.filter((weakness) => !weakness.resolved).map((weakness) => weakness.title).join(" | ") || "no critical weaknesses"}`,
              `Controls to improve: ${weakControls.join(", ") || "strong controls"}`,
            ]
          : [
              `Risco: ${asset.name} (${asset.id})`,
              `Criticidade: ${asset.criticality} | Zona: ${asset.zone} | Dono: ${asset.owner}`,
              `Serviços expostos: ${openInternet.length ? openInternet.map((service) => `${service.name}:${service.port}`).join(", ") : "nenhum"}`,
              `Fraquezas abertas: ${asset.weaknesses.filter((weakness) => !weakness.resolved).map((weakness) => weakness.title).join(" | ") || "nenhuma crítica"}`,
              `Controles a melhorar: ${weakControls.join(", ") || "controles fortes"}`,
            ]
      );
      updateState((draft) => draft.completedActions.add(`risk_${asset.id}`));
      return;
    }

    if (cmd.startsWith("logs ")) {
      const target = cmd.split(/\s+/)[1];
      const asset = findAsset(target);
      if (!asset) {
        pushLine("err", isEn ? "Asset not found for log inspection." : "Ativo não encontrado para consulta de logs.");
        return;
      }

      const logLines: Record<string, string[]> = isEn
        ? LOG_LINES_EN
        : {
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

      printLines("out", [
        isEn ? `Logs for ${asset.name}:` : `Logs de ${asset.name}:`,
        ...(logLines[asset.id] || asset.evidence),
      ]);
      updateState((draft) => {
        draft.reviewedLogs.add(asset.id);
        draft.alerts = draft.alerts.map((alert) =>
          alert.assetId === asset.id && alert.status === "novo" ? { ...alert, status: "investigando" } : alert
        );
      });
      return;
    }

    if (cmd === "sqli-test portal-web" || cmd === "sqli-test 10.10.10.20") {
      printLines(
        "warn",
        isEn
          ? [
              "Safe SQL Injection test started against the simulated environment.",
              "Result: login parameter alters query behavior when given anomalous input.",
              "Evidence: database error logged, without data extraction or real payload shown.",
              "Recommendation: prepared statements, server-side validation, automated tests, and WAF alerting.",
            ]
          : [
              "Teste seguro de SQL Injection iniciado contra ambiente simulado.",
              "Resultado: parâmetro de login altera comportamento da consulta quando recebe entrada anômala.",
              "Evidência: erro de banco registrado, sem extração de dados e sem payload real exibido.",
              "Recomendação: prepared statements, validação server-side, testes automatizados e alerta no WAF.",
            ]
      );
      updateState((draft) => {
        draft.completedActions.add("sqli_detected");
        draft.alerts = draft.alerts.map((alert) =>
          alert.id === "web-sqli" ? { ...alert, status: "investigando" } : alert
        );
      });
      return;
    }

    if (cmd === "patch sqli") {
      printLines(
        "ok",
        isEn
          ? [
              "Patch applied on Portal Web:",
              "  - Login migrated to parameterized queries.",
              "  - Server-side validation added to sensitive fields.",
              "  - Regression test added for anomalous input.",
              "  - WAF upgraded from weak to partial and logging strengthened.",
            ]
          : [
              "Patch aplicado no Portal Web:",
              "  - Login migrado para consultas parametrizadas.",
              "  - Validação server-side adicionada aos campos sensíveis.",
              "  - Teste de regressão criado para entrada anomala.",
              "  - WAF passou de fraco para parcial e logs foram reforcados.",
            ]
      );
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
      printLines(
        "ok",
        isEn
          ? [
              "Identity controls applied:",
              "  - Phishing-resistant MFA enabled for administrators.",
              "  - Adaptive rate limiting for failed logins.",
              "  - Active sessions and privileged accounts reviewed.",
              "  - Alerts enabled for impossible travel and anomalous sources.",
            ]
          : [
              "Controles de identidade aplicados:",
              "  - MFA resistente a phishing para administradores.",
              "  - Rate limit adaptativo para falhas de login.",
              "  - Revisão de sessões ativas e contas privilegiadas.",
              "  - Alerta para login impossível e origem anômala.",
            ]
      );
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
      printLines(
        "warn",
        isEn
          ? [
              "Analysis of email-42:",
              "  Sender: payroll@evil-login.example",
              "  Signal: artificial urgency and lookalike vendor domain.",
              "  Signal: executable attachment disguised as an invoice.",
              "  Signal: link redirects to a fake login page.",
              "Conclusion: phishing confirmed. Trigger containment and indicator blocking.",
            ]
          : [
              "Análise do email-42:",
              "  Remetente: payroll@evil-login.example",
              "  Sinal: urgência artificial e domínio parecido com fornecedor real.",
              "  Sinal: anexo executável disfarçado como fatura.",
              "  Sinal: link redireciona para página de login falsa.",
              "Conclusão: phishing confirmado. Acione contenção e bloqueio de indicador.",
            ]
      );
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
      printLines(
        "out",
        isEn
          ? [
              "EDR scan ws-17:",
              "  Suspicious process: invoice_viewer.tmp",
              "  Origin: email client",
              "  Action: persistence attempt blocked",
              "  Connection: evil-login.example",
              "  Recommendation: isolate host, collect artifacts, and reset user sessions.",
            ]
          : [
              "EDR scan ws-17:",
              "  Processo suspeito: invoice_viewer.tmp",
              "  Origem: cliente de email",
              "  Ação: tentativa de persistência bloqueada",
              "  Conexão: evil-login.example",
              "  Recomendação: isolar host, coletar artefatos e redefinir sessões do usuário.",
            ]
      );
      updateState((draft) => {
        draft.completedActions.add("edr_scanned");
        draft.assets["ws-17"].controls.edr = "strong";
      });
      return;
    }

    if (cmd === "isolar ws-17") {
      printLines(
        "ok",
        isEn
          ? [
              "Workstation ws-17 isolated from the corporate network.",
              "Allowed channel: EDR console for forensic evidence collection.",
              "Next step: block the malicious domain and review user credentials.",
            ]
          : [
              "Workstation ws-17 isolada da rede comum.",
              "Canal permitido: console EDR para coleta de evidências.",
              "Próximo passo: bloquear domínio malicioso e revisar credenciais do usuário.",
            ]
      );
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
      printLines(
        "ok",
        isEn
          ? [
              "Indicator blocked across DNS filtering, email gateway, and EDR.",
              "Campaign added to targeted Finance security training.",
            ]
          : [
              "Indicador bloqueado em DNS filtering, gateway de email e EDR.",
              "Campanha adicionada ao treinamento direcionado do Financeiro.",
            ]
      );
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
      printLines(
        "ok",
        isEn
          ? [
              "Rule applied:",
              "  - Portal Web SSH restricted to administrative VPN.",
              "  - Direct internet attempts are now blocked.",
              "  - Review of any-to-core rules scheduled.",
            ]
          : [
              "Regra aplicada:",
              "  - SSH do Portal Web restrito a VPN administrativa.",
              "  - Tentativas diretas da internet agora são bloqueadas.",
              "  - Revisão de regras any-to-core agendada.",
            ]
      );
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
      printLines(
        "ok",
        isEn
          ? [
              "Hardening applied to the database:",
              "  - ACL accepts connections only from Portal Web and the admin network.",
              "  - Application account tightened to least privilege.",
              "  - Sensitive access auditing enabled.",
            ]
          : [
              "Hardening aplicado no banco:",
              "  - ACL aceita conexões apenas do Portal Web e rede de administração.",
              "  - Conta da aplicação revisada para menor privilégio.",
              "  - Auditoria de acesso sensível habilitada.",
            ]
      );
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
      printLines(
        "ok",
        isEn
          ? [
              "Restore tested successfully in an isolated environment.",
              "Backup marked as immutable, encrypted, and isolated from standard admin accounts.",
              "RPO/RTO documented for critical systems.",
            ]
          : [
              "Restore testado com sucesso em ambiente isolado.",
              "Backup marcado como imutável, criptografado e com acesso separado de administradores comuns.",
              "RPO/RTO documentados para sistemas críticos.",
            ]
      );
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
      printLines(
        "ok",
        isEn
          ? [
              "Report closed:",
              "  Cause: phishing and partial email/endpoint controls.",
              "  Impact: endpoint contained before propagation.",
              "  Containment: isolation, domain blocking, and session review.",
              "  Eradication: artifacts removed and rules updated.",
              "  Improvements: MFA, hardening, tested backups, and revised playbooks.",
            ]
          : [
              "Relatório fechado:",
              "  Causa: phishing e controles parciais de email/endpoint.",
              "  Impacto: endpoint contido antes de propagação.",
              "  Contenção: isolamento, bloqueio de domínio e revisão de sessões.",
              "  Erradicação: artefatos removidos e regras atualizadas.",
              "  Melhorias: MFA, hardening, backups testados e playbooks revisados.",
            ]
      );
      updateState((draft) => {
        draft.completedActions.add("incident_reported");
        draft.incidentNotes.push(
          isEn
            ? "Incident report closed with cause, impact, containment, and improvements."
            : "Relatório de incidente fechado com causa, impacto, contencao e melhorias."
        );
        draft.alerts = draft.alerts.map((alert) => ({ ...alert, status: alert.status === "novo" ? "investigando" : alert.status }));
      });
      return;
    }

    if (cmd === "score") {
      const posture = isEn
        ? riskScore < 35
          ? "acceptable"
          : riskScore < 60
            ? "improving"
            : "high risk"
        : riskScore < 35
          ? "aceitavel"
          : riskScore < 60
            ? "em melhoria"
            : "alto risco";
      printLines(
        riskScore < 35 ? "ok" : "warn",
        isEn
          ? [
              `Risk score: ${riskScore}/100 (${posture})`,
              `Strong controls: ${strongControls}/${totalControls}`,
              `Alerts contained: ${containedAlerts}/${state.alerts.length}`,
              `Completed actions: ${state.completedActions.size}`,
            ]
          : [
              `Score de risco: ${riskScore}/100 (${posture})`,
              `Controles fortes: ${strongControls}/${totalControls}`,
              `Alertas contidos: ${containedAlerts}/${state.alerts.length}`,
              `Acoes concluidas: ${state.completedActions.size}`,
            ]
      );
      updateState((draft) => draft.completedActions.add("score_checked"));
      return;
    }

    pushLine(
      "err",
      isEn ? `Unrecognized command: ${cmd}. Type 'help'.` : `Comando não reconhecido: ${cmd}. Digite 'help'.`
    );
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
          placeholder={isEn ? "Type a command" : "Digite um comando"}
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
                {isEn ? "Back" : "Voltar"}
              </Button>
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                {isEn ? "Simulated Attack & Defense" : "Ataque e Defesa Simulados"}
              </div>
            </div>

            <div className="mb-6 grid gap-2 sm:grid-cols-6">
              {introSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  onClick={() => setIntroStep(index)}
                  className={`h-2 rounded-full transition ${
                    index <= introStep ? "bg-sky-300" : "bg-white/10 hover:bg-white/20"
                  }`}
                  aria-label={isEn ? `Open introduction ${index + 1}: ${slide.title}` : `Abrir introdução ${index + 1}: ${slide.title}`}
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
                    <span className="text-emerald-300">{isEn ? "Example command:" : "Comando exemplo:"}</span> {introSlide.command}
                  </div>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => setIntroStep((current) => Math.max(0, current - 1))}
                    disabled={introStep === 0}
                  >
                    {isEn ? "Previous step" : "Voltar etapa"}
                  </Button>
                  <Button
                    className="bg-rose-600 text-white hover:bg-rose-700"
                    onClick={() => {
                      if (introDone) startLab();
                      else setIntroStep((current) => Math.min(introSlides.length - 1, current + 1));
                    }}
                  >
                    {introDone ? <TerminalSquare className="mr-2 h-4 w-4" /> : <ChevronDown className="-rotate-90 mr-2 h-4 w-4" />}
                    {introDone ? (isEn ? "Enter the Lab" : "Entrar no Laboratório") : (isEn ? "Next explanation" : "Próxima explicação")}
                  </Button>
                  <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={startLab}>
                    {isEn ? "Skip introduction" : "Pular introdução"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      {isEn ? "What to observe" : "O que observar"}
                    </div>
                    <div className="text-xs font-bold text-slate-500">
                      {introStep + 1}/{introSlides.length}
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
                  {(isEn
                    ? [
                        { label: "Defense", icon: ShieldCheck, text: "Investigate, contain, and remediate." },
                        { label: "Attack", icon: Bug, text: "Understand the chain without real risk." },
                        { label: "Evidence", icon: FileSearch, text: "Decide using logs and alerts." },
                      ]
                    : [
                        { label: "Defesa", icon: ShieldCheck, text: "Investigar, conter e corrigir." },
                        { label: "Ataque", icon: Bug, text: "Entender a cadeia sem risco real." },
                        { label: "Evidência", icon: FileSearch, text: "Decidir com logs e alertas." },
                      ]
                  ).map((item) => {
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
            <Metric label={isEn ? "Risk" : "Risco"} value={`${riskScore}/100`} tone={riskScore < 35 ? "good" : riskScore < 60 ? "warn" : "bad"} />
            <Metric label={isEn ? "Alerts" : "Alertas"} value={`${containedAlerts}/${state.alerts.length}`} tone="warn" />
            <Metric label={isEn ? "Strong controls" : "Controles fortes"} value={`${strongControls}/${totalControls}`} tone="good" />
            <Metric
              label={viewMode === "attack" ? (isEn ? "Attack" : "Ataque") : (isEn ? "Level" : "Nível")}
              value={viewMode === "attack" ? `${completedAttackSteps}/${attackSteps.length}` : `${level.id}/4`}
              tone="info"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsManualOpen(true)}
              className="border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:text-white font-black uppercase tracking-widest text-[10px]"
            >
              <BookOpen className="h-3.5 w-3.5 mr-2" /> Manual
            </Button>
          </div>
        </header>

        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {localizedLevels.map((item, index) => (
              <button
                key={item.id}
                onClick={() => resetLevel(index)}
                className={`min-w-[11rem] rounded-lg border px-4 py-3 text-left transition ${
                  index === levelIdx
                    ? "border-rose-400/50 bg-rose-500/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-[0.18em]">{isEn ? `Level ${item.id}` : `Nível ${item.id}`}</div>
                <div className="mt-1 text-sm font-bold">{item.title}</div>
              </button>
            ))}
          </div>

          <div className="grid w-full grid-cols-3 gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1 xl:w-auto">
            {[
              { id: "guided" as ViewMode, label: isEn ? "Guided mode" : "Modo guiado", icon: BookOpen },
              { id: "soc" as ViewMode, label: isEn ? "SOC mode" : "Modo SOC", icon: ShieldCheck },
              { id: "attack" as ViewMode, label: isEn ? "Attack mode" : "Modo Ataque", icon: Bug },
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
                assetMap={localizedAssetMap}
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
                <AlertPanel alerts={state.alerts} assets={localizedAssetMap} />
              </aside>
            </section>

            <section className="space-y-5">
              <KnowledgePanel tab={knowledgeTab} onChange={setKnowledgeTab} />
              <AssetPanel assets={assets} discovered={state.discovered} />
            </section>
          </main>
        )}
      </div>
      <NetworkCodex 
        isOpen={isManualOpen} 
        onClose={() => setIsManualOpen(false)} 
        primaryColor="rose"
        onSendToTerminal={(cmd) => {
          setInput(cmd);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      />
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
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const concepts = getMissionConcepts(lang);
  const concept = !levelDone && mission ? concepts[mission.id] : undefined;

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <BookOpen className="h-4 w-4 text-emerald-300" />
        {isEn ? "Stage Concept" : "Conceito da Etapa"}
      </div>

      {concept ? (
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
              {concept.label}
            </span>
            {concept.nistCsf && (
              <span className="inline-flex rounded border border-sky-500/25 bg-sky-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-200">
                NIST CSF · {concept.nistCsf}
              </span>
            )}
          </div>
          <h2 className="mb-2 text-lg font-black text-white">{concept.title}</h2>
          <p className="mb-3 text-sm leading-6 text-slate-300">{concept.body}</p>
          {concept.reference && (
            <p className="mb-3 text-[11px] font-mono leading-5 text-slate-500">
              ref: {concept.reference}
            </p>
          )}
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
          {isEn
            ? "Level completed. Use `next` to open the next set of concepts."
            : "Nível finalizado. Use `next` para abrir o próximo conjunto de conceitos."}
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
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const panels: { id: DetailPanel; title: string; subtitle: string; icon: LucideIcon; count: string }[] = [
    {
      id: "ambiente",
      title: isEn ? "Environment" : "Ambiente",
      subtitle: isEn ? "Asset map" : "Mapa de ativos",
      icon: Radar,
      count: `${assets.length}`,
    },
    {
      id: "alertas",
      title: isEn ? "Alerts" : "Alertas",
      subtitle: isEn ? "SOC triage" : "Triagem SOC",
      icon: Activity,
      count: `${alerts.filter((alert) => alert.status === "novo" || alert.status === "investigando").length}`,
    },
    {
      id: "ativos",
      title: isEn ? "Controls" : "Controles",
      subtitle: isEn ? "Defensive state" : "Estado defensivo",
      icon: Eye,
      count: `${discovered.size}/${assets.length}`,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              <ChevronDown className="h-4 w-4 text-sky-300" />
              {isEn ? "Technical Panels" : "Painéis Técnicos"}
            </div>
            <p className="text-xs leading-5 text-slate-500">
              {isEn
                ? "Open only when you need to investigate. SOC mode shows all of them at once."
                : "Abra só quando precisar investigar. O modo SOC mostra todos ao mesmo tempo."}
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
  const { lang } = useLanguage();
  const isEn = lang === "en";
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <Crosshair className="h-4 w-4 text-rose-300" />
        {isEn ? "Current Mission" : "Missão Atual"}
      </div>
      {levelDone ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <Unlock className="h-5 w-5" />
            <span className="font-black">{isEn ? "Level completed" : "Nível concluido"}</span>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            {isEn
              ? "Type `next` or select another level to continue training."
              : "Digite `next` ou selecione outro nível para continuar o treinamento."}
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            {missionIdx + 1}/{level.missions.length}
          </div>
          <h2 className="mb-3 text-base font-black text-white">{mission?.title}</h2>
          <p className="mb-3 rounded-md border border-sky-500/20 bg-sky-500/10 p-3 text-xs leading-5 text-sky-100">
            {isEn ? "Command:" : "Comando:"} <span className="font-mono font-bold">{mission?.hint}</span>
          </p>
          <p className="mb-2 text-sm leading-6 text-slate-300">{mission?.principle}</p>
          <p className="text-xs leading-5 text-slate-500">{mission?.defense}</p>
        </div>
      )}
    </div>
  );
}

function OperationMap({ assets, scanned }: { assets: Asset[]; scanned: Set<string> }) {
  const { lang } = useLanguage();
  const isEn = lang === "en";
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
        {isEn ? "Environment" : "Ambiente"}
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
  const { lang } = useLanguage();
  const isEn = lang === "en";
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <Activity className="h-4 w-4 text-amber-300" />
        {isEn ? "Alerts" : "Alertas"}
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className={`rounded border px-2 py-0.5 text-[10px] font-black uppercase ${severityClass[alert.severity]}`}>
                {alert.severity}
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-500">{getAlertStatusLabel(alert.status, lang)}</span>
            </div>
            <p className="text-xs leading-5 text-slate-300">{getLocalizedAlertTitle(alert, lang)}</p>
            <p className="mt-1 text-[11px] text-slate-500">{assets[alert.assetId]?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttackLabPanel({ state, onRun }: { state: LabState; onRun: (command: string) => void }) {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const attackSteps = useMemo(() => getAttackSteps(lang), [lang]);
  const [quizAnswered, setQuizAnswered] = useState<Set<string>>(new Set());
  const [quizPick, setQuizPick] = useState<Record<string, number>>({});
  const [openStep, setOpenStep] = useState<string | null>(null);

  const masteredCount = attackSteps.filter(
    (step) => state.completedActions.has(step.id) && quizAnswered.has(step.id)
  ).length;

  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-rose-300">
            <Flame className="h-4 w-4" />
            {isEn ? "Attack Environment · Cyber Kill Chain" : "Ambiente de Ataque · Cyber Kill Chain"}
          </div>
          <h2 className="text-lg font-black text-white">{isEn ? "Educational AttackBox" : "AttackBox didática"}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {isEn
              ? "Offensive track aligned with MITRE ATT&CK, OWASP Top 10, and NIST CSF. Each step ends with a comprehension quiz."
              : "Trilha ofensiva alinhada a MITRE ATT&CK, OWASP Top 10 e NIST CSF. Cada etapa termina com um quiz de compreensão."}
          </p>
        </div>
        <div className="rounded-md border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-200">{isEn ? "Mastery" : "Domínio"}</div>
          <div className="text-xl font-black text-white">
            {masteredCount}/{attackSteps.length}
          </div>
          <div className="text-[10px] text-rose-200/80">{isEn ? "command + quiz" : "comando + quiz"}</div>
        </div>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {(isEn
          ? [
              ["Network", "172.16.50.0/24 isolated"],
              ["Frameworks", "MITRE ATT&CK · OWASP · NIST CSF"],
              ["Rule", "No real payload or external target"],
            ]
          : [
              ["Rede", "172.16.50.0/24 isolada"],
              ["Frameworks", "MITRE ATT&CK · OWASP · NIST CSF"],
              ["Regra", "Sem payload real ou alvo externo"],
            ]
        ).map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-1 text-xs font-bold text-slate-200">{value}</div>
          </div>
        ))}
      </div>

      <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
        {attackSteps.map((step, index) => {
          const ran = state.completedActions.has(step.id);
          const mastered = ran && quizAnswered.has(step.id);
          const isOpen = openStep === step.id;
          const pick = quizPick[step.id];
          const showQuiz = ran && !mastered;

          const status = isEn
            ? mastered
              ? "done"
              : ran
                ? "quiz pending"
                : "pending"
            : mastered
              ? "feito"
              : ran
                ? "quiz pendente"
                : "pendente";
          const statusClasses = mastered
            ? "bg-emerald-500/20 text-emerald-200"
            : ran
              ? "bg-amber-500/20 text-amber-200"
              : "bg-white/10 text-slate-400";
          const cardClasses = mastered
            ? "border-emerald-500/25 bg-emerald-500/10"
            : ran
              ? "border-amber-500/25 bg-amber-500/5"
              : "border-white/10 bg-white/[0.04]";

          return (
            <div key={step.id} className={`rounded-md border p-3 transition ${cardClasses}`}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 text-left"
                onClick={() => setOpenStep(isOpen ? null : step.id)}
              >
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-black/25 px-2 py-0.5 text-[10px] font-black text-slate-300">
                      {index + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-200">
                      {step.phase}
                    </span>
                    <span className="rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] text-rose-200">
                      {step.mitre.technique.split(" ")[0]}
                    </span>
                    {step.owasp && (
                      <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-200">
                        {step.owasp.split(" ")[0]}
                      </span>
                    )}
                    {step.nistCsf.map((fn) => (
                      <span
                        key={fn}
                        className="rounded border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-200"
                      >
                        {fn}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-black text-white">{step.title}</h3>
                </div>
                <span className={`shrink-0 rounded px-2 py-1 text-[10px] font-black uppercase ${statusClasses}`}>
                  {status}
                </span>
              </button>

              {isOpen && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs leading-5 text-slate-300">{step.objective}</p>
                  <div className="rounded border border-white/10 bg-black/20 p-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">MITRE ATT&CK</div>
                    <div className="mt-1 font-mono text-[11px] text-rose-100">{step.mitre.tactic}</div>
                    <div className="font-mono text-[11px] text-rose-100">{step.mitre.technique}</div>
                  </div>
                  <div className="rounded border border-white/10 bg-black/20 p-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      {isEn ? "Real tools (reference)" : "Ferramentas reais (referência)"}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {step.realTools.map((tool) => (
                        <span key={tool} className="rounded bg-slate-800/60 px-2 py-0.5 font-mono text-[10px] text-slate-200">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] leading-5 text-slate-500">{step.safety}</p>
                </div>
              )}

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <code className="rounded border border-white/10 bg-black/25 px-2 py-1 text-[11px] text-sky-200">
                  {step.command}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 justify-center text-xs font-bold text-slate-300 hover:text-white"
                  onClick={() => {
                    onRun(step.command);
                    setOpenStep(step.id);
                  }}
                >
                  {isEn ? "Run in terminal" : "Executar no terminal"}
                </Button>
              </div>

              <div className="mt-2 rounded border border-sky-500/15 bg-sky-500/5 p-2 text-[11px] leading-5 text-sky-100">
                <span className="font-bold text-sky-200">{isEn ? "Defense:" : "Defesa:"}</span> {step.defense}
              </div>

              {showQuiz && (
                <div className="mt-3 rounded border border-amber-500/25 bg-amber-500/5 p-3">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200">
                    <BookOpen className="h-3.5 w-3.5" />
                    {isEn ? "Comprehension check" : "Check de compreensão"}
                  </div>
                  <p className="mb-3 text-xs leading-5 text-slate-200">{step.quiz.question}</p>
                  <div className="space-y-1.5">
                    {step.quiz.options.map((option, optionIdx) => {
                      const selected = pick === optionIdx;
                      const showAnswer = pick !== undefined;
                      const isCorrect = !!option.correct;
                      let optionClass = "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-slate-200";
                      if (showAnswer && selected && isCorrect) optionClass = "border-emerald-500/40 bg-emerald-500/15 text-emerald-100";
                      else if (showAnswer && selected && !isCorrect) optionClass = "border-red-500/40 bg-red-500/10 text-red-100";
                      else if (showAnswer && isCorrect) optionClass = "border-emerald-500/30 bg-emerald-500/5 text-emerald-200";
                      else if (showAnswer) optionClass = "border-white/10 bg-white/[0.02] text-slate-500";
                      return (
                        <button
                          type="button"
                          key={option.text}
                          disabled={showAnswer}
                          onClick={() => {
                            setQuizPick((current) => ({ ...current, [step.id]: optionIdx }));
                            if (isCorrect) {
                              setQuizAnswered((current) => {
                                const next = new Set(current);
                                next.add(step.id);
                                return next;
                              });
                            }
                          }}
                          className={`flex w-full items-start gap-2 rounded border px-3 py-2 text-left text-xs leading-5 transition ${optionClass}`}
                        >
                          <span className="mt-0.5 font-mono text-[10px] text-slate-500">
                            {String.fromCharCode(65 + optionIdx)}
                          </span>
                          <span className="min-w-0 flex-1">{option.text}</span>
                          {showAnswer && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />}
                          {showAnswer && selected && !isCorrect && (
                            <AlertTriangle className="h-4 w-4 shrink-0 text-red-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {pick !== undefined && (
                    <div className="mt-3 rounded border border-sky-500/20 bg-sky-500/10 p-2 text-[11px] leading-5 text-sky-100">
                      <span className="font-bold text-sky-200">{isEn ? "Explanation: " : "Explicação: "}</span>
                      {step.quiz.explanation}
                    </div>
                  )}
                  {pick !== undefined && !step.quiz.options[pick]?.correct && (
                    <button
                      type="button"
                      onClick={() => setQuizPick((current) => {
                        const next = { ...current };
                        delete next[step.id];
                        return next;
                      })}
                      className="mt-2 text-[11px] font-bold text-amber-200 hover:text-amber-100"
                    >
                      {isEn ? "Try again" : "Tentar novamente"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KnowledgePanel({ tab, onChange }: { tab: KnowledgeTab; onChange: (tab: KnowledgeTab) => void }) {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const data = {
    principios: getPrinciples(lang),
    ataques: getAttacks(lang),
    defesas: getDefenses(lang),
  }[tab];
  const tabLabels: Record<KnowledgeTab, string> = isEn
    ? {
        principios: "Principles",
        ataques: "Attacks",
        defesas: "Defenses",
      }
    : {
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
          {isEn ? "Knowledge Base" : "Base de Conhecimento"}
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
            <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-black text-white">{item.title}</h3>
              {item.framework && (
                <span className="rounded border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-200">
                  {item.framework}
                </span>
              )}
            </div>
            <p className="text-xs leading-5 text-slate-400">{item.body}</p>
            {item.examples && item.examples.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.examples.map((example) => (
                  <span
                    key={example}
                    className="rounded bg-slate-800/60 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                  >
                    {example}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetPanel({ assets, discovered }: { assets: Asset[]; discovered: Set<string> }) {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
      <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        <Eye className="h-4 w-4 text-sky-300" />
        {isEn ? "Assets & Controls" : "Ativos e Controles"}
      </div>

      <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
        {assets.map((asset) => {
          const visible = discovered.has(asset.id);
          const unresolved = asset.weaknesses.filter((weakness) => !weakness.resolved);
          return (
            <div key={asset.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-white">
                    {visible ? asset.name : isEn ? "Uninventoried asset" : "Ativo não inventariado"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {visible
                      ? `${asset.id} | ${asset.ip} | ${asset.zone}`
                      : isEn
                        ? "Run 'inventario' to reveal"
                        : "Use inventário para revelar"}
                  </p>
                </div>
                {asset.status === "isolated" ? (
                  <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase text-amber-200">
                    {isEn ? "Isolated" : "Isolado"}
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
                        {name}: {statusLabelByLang[lang][status]}
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
                        {isEn ? "Main weaknesses addressed" : "Principais fraquezas tratadas"}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="h-4 w-4" />
                  {isEn ? "Asset not yet classified." : "Ativo ainda não classificado."}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
