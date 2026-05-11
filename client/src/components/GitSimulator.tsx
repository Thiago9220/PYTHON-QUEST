import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Terminal, FileCode, Github, CheckCircle2, Folder, GitCommit,
  ChevronDown, GitBranch, Save, X, Edit3, Lock, Trophy, AlertTriangle,
  Shield, Cloud, Users, Clock, BookOpen, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
}

// ---------- Types ----------
type Line = { type: "in" | "out" | "ok" | "err" | "info"; text: string };

interface Commit {
  hash: string;
  parents: string[];
  message: string;
  files: Record<string, string>; // snapshot
  branch: string; // branch this commit was authored on (for graph color)
  timestamp: number;
}

interface Repo {
  initialized: boolean;
  files: Record<string, string>;          // working directory
  staged: Record<string, string> | null;  // null = nothing staged; mapping file -> staged content
  commits: Record<string, Commit>;        // hash -> commit
  branches: Record<string, string>;       // branch name -> head hash
  HEAD: { type: "branch"; name: string } | { type: "detached"; hash: string };
  remote: {
    enabled: boolean;
    url?: string;
    branches: Record<string, string>;
    commits: Record<string, Commit>;
  };
  conflicts: Set<string>;                 // files in conflict
  stash: Record<string, string>[];        // stack of working dir snapshots
  config: {
    userName?: string;
    userEmail?: string;
  };
}

interface LevelDef {
  id: number;
  title: string;
  briefing: string;
  starter: () => Repo;
  missions: { id: string; title: string; hint: string; check: (r: Repo) => boolean }[];
  // For levels with simulated remote/branch state
  setup?: (r: Repo) => Repo;
}

// ---------- Helpers ----------
const randHash = () => Math.random().toString(16).slice(2, 9);

const headCommit = (r: Repo): Commit | null => {
  const h = r.HEAD.type === "branch" ? r.branches[r.HEAD.name] : r.HEAD.hash;
  return h ? r.commits[h] : null;
};

const headBranchName = (r: Repo): string | null =>
  r.HEAD.type === "branch" ? r.HEAD.name : null;

const fileStatus = (r: Repo, name: string): "untracked" | "modified" | "staged" | "clean" | "conflict" => {
  if (r.conflicts.has(name)) return "conflict";
  const head = headCommit(r);
  const headContent = head?.files[name];
  const stagedContent = r.staged?.[name];
  const wdContent = r.files[name];
  if (stagedContent !== undefined && stagedContent === wdContent && stagedContent !== headContent) return "staged";
  if (stagedContent !== undefined && stagedContent !== wdContent) return "staged"; // partial
  if (headContent === undefined && wdContent !== undefined) return "untracked";
  if (headContent !== wdContent) return "modified";
  return "clean";
};

const ancestors = (r: Repo, hash: string): Set<string> => {
  const out = new Set<string>();
  const stack = [hash];
  while (stack.length) {
    const h = stack.pop()!;
    if (out.has(h)) continue;
    out.add(h);
    const c = r.commits[h];
    if (c) stack.push(...c.parents);
  }
  return out;
};

const findMergeBase = (r: Repo, a: string, b: string): string | null => {
  const ancA = ancestors(r, a);
  const stack = [b];
  const seen = new Set<string>();
  while (stack.length) {
    const h = stack.pop()!;
    if (seen.has(h)) continue;
    seen.add(h);
    if (ancA.has(h)) return h;
    const c = r.commits[h];
    if (c) stack.push(...c.parents);
  }
  return null;
};

/**
 * Resolve uma ref para um hash de commit. Aceita:
 *  - HEAD / head / Head (case-insensitive)
 *  - HEAD~N (N gerações pelo primeiro pai)
 *  - HEAD^ (= HEAD~1) e HEAD^N (N-ésimo pai)
 *  - <branch>~N / <branch>^
 *  - hash completo (7 chars) ou prefixo (4-6) que case unicamente
 *  - nome de branch
 * Retorna null se não conseguir resolver.
 */
const resolveRef = (r: Repo, refRaw: string): string | null => {
  if (!refRaw) return null;
  const ref = refRaw.trim();
  // separar base de modificadores (~N, ^, ^N)
  const match = ref.match(/^(.+?)((?:~\d+|\^\d*)*)$/);
  if (!match) return null;
  const base = match[1];
  const mods = match[2] ?? "";

  // resolver a base
  let hash: string | null = null;
  // HEAD (case-insensitive)
  if (/^head$/i.test(base)) {
    hash = r.HEAD.type === "branch" ? r.branches[r.HEAD.name] ?? null : r.HEAD.hash;
  } else if (r.branches[base] !== undefined) {
    hash = r.branches[base];
  } else if (r.commits[base]) {
    hash = base;
  } else {
    // prefixo de hash (mínimo 4 chars)
    if (base.length >= 4) {
      const candidates = Object.keys(r.commits).filter((h) => h.startsWith(base));
      if (candidates.length === 1) hash = candidates[0];
      else if (candidates.length > 1) return null; // ambiguo
    }
  }
  if (!hash) return null;

  // aplicar modificadores em sequência: ~N pula N gerações pelo primeiro pai; ^N pega o N-ésimo pai
  let cursor: string = hash;
  const tokens = mods.match(/(~\d+|\^\d*)/g) ?? [];
  for (const tok of tokens) {
    const cur: Commit | undefined = r.commits[cursor];
    if (!cur) return null;
    if (tok.startsWith("~")) {
      const n = parseInt(tok.slice(1), 10);
      for (let i = 0; i < n; i++) {
        const parent: Commit | undefined = r.commits[cursor];
        const next: string | undefined = parent?.parents[0];
        if (!next) return null;
        cursor = next;
      }
    } else if (tok.startsWith("^")) {
      const n = tok === "^" ? 1 : parseInt(tok.slice(1), 10);
      const next: string | undefined = cur.parents[n - 1];
      if (!next) return null;
      cursor = next;
    }
  }
  return cursor;
};


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

// Completions contextuais: o que sugerir depende do comando atual + estado do repo.
const computeGitCompletions = (input: string, r: Repo): string[] => {
  const trimmed = input;
  const ends = trimmed.endsWith(" ");
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const last = ends ? "" : (tokens[tokens.length - 1] ?? "");
  const head = ends ? tokens.join(" ") : tokens.slice(0, -1).join(" ");

  const branches = Object.keys(r.branches);
  const otherBranches = branches.filter((b) => headBranchName(r) !== b);
  const files = Object.keys(r.files);
  const recentHashes = Object.values(r.commits)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map((c) => c.hash);

  const suggestFor = (pool: string[], prefix: string) =>
    pool.filter((x) => x.startsWith(prefix)).map((x) => `${head} ${x}`.trim());

  // Casos contextuais
  if (head === "git checkout" || head === "git switch") return suggestFor([...otherBranches, ...recentHashes], last);
  if (head === "git checkout -b" || head === "git switch -c") return [];
  if (head === "git merge" || head === "git rebase") return suggestFor(otherBranches, last);
  if (head === "git branch -d" || head === "git branch -D") return suggestFor(otherBranches, last);
  if (head === "git revert" || head === "git show" || head === "git cherry-pick") return suggestFor([...recentHashes, "HEAD", "HEAD~1", "HEAD~2"], last);
  if (head === "git restore" || head === "git rm" || head === "git add") return suggestFor(files, last);
  if (head === "git diff") return suggestFor(["--staged", ...recentHashes, ...files], last);
  if (head === "git push origin" || head === "git pull origin" || head === "git fetch origin") return suggestFor(branches, last);
  if (head === "git config" || head === "git config --global") return suggestFor(["user.name", "user.email", "--list"], last);
  if (head === "git stash") return suggestFor(["pop", "list", "drop", "show", "apply"], last);
  if (head === "git remote") return suggestFor(["add", "remove", "-v", "rename"], last);
  if (head === "git reset") return suggestFor(["--soft", "--mixed", "--hard", "HEAD~1", ...recentHashes], last);
  if (head === "git tag") return suggestFor(["-a", "-d", "-l"], last);

  // Caso geral
  const baseCompletions = [
    "git init", "git status", "git add .", "git add ", 'git commit -m "', "git commit --amend",
    "git log", "git log --oneline", "git log --graph", "git log --all",
    "git diff", "git diff --staged",
    "git branch", "git branch -d ", "git checkout ", "git checkout -b ", "git switch ", "git switch -c ",
    "git merge ", "git restore ", "git revert ", "git reset --hard", "git reset --soft HEAD~1",
    'git config user.name "', 'git config user.email "', "git config --list",
    "git remote add origin ", "git remote -v",
    "git push origin main", "git pull origin main", "git pull --rebase", "git fetch",
    "git stash", "git stash pop", "git stash list",
    "git tag ", "git show HEAD",
    "help", "clear", "reset",
  ];
  return baseCompletions.filter((c) => c.startsWith(trimmed));
};

// ---------- Initial states per level ----------
const baseRepo = (): Repo => ({
  initialized: false,
  files: {},
  staged: null,
  commits: {},
  branches: {},
  HEAD: { type: "branch", name: "main" },
  remote: { enabled: false, branches: {}, commits: {} },
  conflicts: new Set(),
  stash: [],
  config: {},
});

const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: "Fluxo Básico",
    briefing: "Aprenda o ciclo essencial: inicializar um repositório, adicionar arquivos ao stage, commitar e enviar para o GitHub.",
    starter: () => {
      const r = baseRepo();
      r.files = { "main.py": "print('hello')\n", "README.md": "# Meu Projeto\n" };
      return r;
    },
    missions: [
      { id: "init", title: "Inicialize o repositório", hint: "git init", check: (r) => r.initialized },
      { id: "config", title: "Configure sua identidade (nome e email) — Git exige antes do primeiro commit", hint: 'git config user.name "Seu Nome" e depois git config user.email "voce@exemplo.com"', check: (r) => !!r.config.userName && !!r.config.userEmail },
      { id: "add", title: "Adicione todos os arquivos ao stage", hint: "git add .", check: (r) => !!r.staged && Object.keys(r.staged).length === Object.keys(r.files).length },
      { id: "commit", title: "Faça o primeiro commit", hint: 'git commit -m "primeiro commit"', check: (r) => Object.keys(r.commits).length >= 1 },
      { id: "remote", title: "Conecte ao GitHub remoto", hint: "git remote add origin <url>", check: (r) => r.remote.enabled },
      { id: "push", title: "Envie para o GitHub", hint: "git push origin main", check: (r) => Object.keys(r.remote.commits).length >= 1 },
    ],
  },
  {
    id: 2,
    title: "Branches & Merge",
    briefing: "Crie uma branch para uma feature, faça commits nela e merge de volta na main sem conflitos.",
    starter: () => {
      const r = baseRepo();
      r.initialized = true;
      r.config = { userName: "Operador", userEmail: "operador@exemplo.com" };
      r.files = { "main.py": "print('app v1')\n", "README.md": "# Projeto\n" };
      const hash = randHash();
      const c: Commit = { hash, parents: [], message: "initial commit", files: { ...r.files }, branch: "main", timestamp: Date.now() };
      r.commits[hash] = c;
      r.branches.main = hash;
      r.HEAD = { type: "branch", name: "main" };
      return r;
    },
    missions: [
      { id: "branch", title: "Crie e mude para a branch 'feature'", hint: "git checkout -b feature", check: (r) => r.branches.feature !== undefined && headBranchName(r) === "feature" },
      { id: "edit", title: "Edite main.py (clique no arquivo) e faça commit na feature", hint: 'Edite o arquivo, depois: git add . && git commit -m "nova feature"', check: (r) => {
        const featureHead = r.branches.feature;
        if (!featureHead) return false;
        const c = r.commits[featureHead];
        return !!c && c.parents.length > 0;
      }},
      { id: "merge", title: "Volte para main e faça merge da feature", hint: "git checkout main && git merge feature", check: (r) => {
        const mainHead = r.branches.main;
        const featureHead = r.branches.feature;
        if (!mainHead || !featureHead) return false;
        return mainHead === featureHead || ancestors(r, mainHead).has(featureHead);
      }},
    ],
  },
  {
    id: 3,
    title: "Resolvendo Conflitos",
    briefing: "Duas branches modificaram a mesma linha. Tente o merge, resolva o conflito editando o arquivo, e finalize o commit.",
    starter: () => {
      const r = baseRepo();
      r.initialized = true;
      r.config = { userName: "Operador", userEmail: "operador@exemplo.com" };
      r.files = { "config.py": "VERSION = '1.0'\n" };
      const c0Hash = randHash();
      r.commits[c0Hash] = { hash: c0Hash, parents: [], message: "init", files: { "config.py": "VERSION = '1.0'\n" }, branch: "main", timestamp: Date.now() - 3000 };
      r.branches.main = c0Hash;

      // main moves forward
      const c1Hash = randHash();
      r.commits[c1Hash] = { hash: c1Hash, parents: [c0Hash], message: "bump version on main", files: { "config.py": "VERSION = '1.1'\n" }, branch: "main", timestamp: Date.now() - 2000 };
      r.branches.main = c1Hash;

      // hotfix branch from c0
      const c2Hash = randHash();
      r.commits[c2Hash] = { hash: c2Hash, parents: [c0Hash], message: "hotfix version", files: { "config.py": "VERSION = '1.0.1'\n" }, branch: "hotfix", timestamp: Date.now() - 1000 };
      r.branches.hotfix = c2Hash;

      r.HEAD = { type: "branch", name: "main" };
      r.files = { "config.py": "VERSION = '1.1'\n" };
      return r;
    },
    missions: [
      { id: "merge", title: "Tente: git merge hotfix (vai dar conflito!)", hint: "git merge hotfix", check: (r) => r.conflicts.size > 0 || r.commits[r.branches.main]?.parents.length === 2 },
      { id: "resolve", title: "Edite config.py e remova os marcadores <<<<<<< ======= >>>>>>>", hint: "Clique em config.py, escolha a versão correta, salve.", check: (r) => r.conflicts.size === 0 && !r.files["config.py"]?.includes("<<<<<<<") },
      { id: "complete", title: "Finalize: git add . && git commit", hint: 'git add . && git commit -m "merge hotfix"', check: (r) => {
        const head = r.commits[r.branches.main];
        return !!head && head.parents.length === 2;
      }},
    ],
  },
  {
    id: 4,
    title: "Workflow Remoto",
    briefing: "Um colega enviou commits para o remote. Sincronize com pull, depois envie suas mudanças.",
    starter: () => {
      const r = baseRepo();
      r.initialized = true;
      r.config = { userName: "Operador", userEmail: "operador@exemplo.com" };
      r.files = { "app.js": "console.log('v1')\n" };
      const c0 = randHash();
      r.commits[c0] = { hash: c0, parents: [], message: "initial", files: { "app.js": "console.log('v1')\n" }, branch: "main", timestamp: Date.now() - 3000 };
      r.branches.main = c0;
      r.HEAD = { type: "branch", name: "main" };
      r.remote.enabled = true;
      r.remote.commits[c0] = r.commits[c0];
      r.remote.branches.main = c0;

      // remote got a new commit from "colega"
      const cRemote = randHash();
      r.remote.commits[cRemote] = { hash: cRemote, parents: [c0], message: "colega: adiciona logger", files: { "app.js": "console.log('v1')\n", "logger.js": "export const log = console.log\n" }, branch: "main", timestamp: Date.now() - 1500 };
      r.remote.branches.main = cRemote;

      // local makes a different commit
      const cLocal = randHash();
      r.commits[cLocal] = { hash: cLocal, parents: [c0], message: "atualiza versão", files: { "app.js": "console.log('v2')\n" }, branch: "main", timestamp: Date.now() - 500 };
      r.branches.main = cLocal;
      r.files = { "app.js": "console.log('v2')\n" };

      return r;
    },
    missions: [
      { id: "pull", title: "Sincronize com o remote: git pull", hint: "git pull origin main", check: (r) => {
        const head = r.commits[r.branches.main];
        return !!head && head.parents.length === 2;
      }},
      { id: "push", title: "Envie tudo para o GitHub: git push", hint: "git push origin main", check: (r) => r.remote.branches.main === r.branches.main },
    ],
  },
  {
    id: 5,
    title: "Desfazendo Mudanças",
    briefing: "Aprenda a voltar no tempo: descartar mudanças locais com restore, apagar commits com reset, e reverter sem reescrever histórico usando revert.",
    starter: () => {
      const r = baseRepo();
      r.initialized = true;
      r.config = { userName: "Operador", userEmail: "operador@exemplo.com" };
      r.files = { "app.js": "console.log('v1')\n" };
      const c0 = randHash();
      r.commits[c0] = { hash: c0, parents: [], message: "initial", files: { "app.js": "console.log('v1')\n" }, branch: "main", timestamp: Date.now() - 3000 };
      r.branches.main = c0;
      const c1 = randHash();
      r.commits[c1] = { hash: c1, parents: [c0], message: "feature boa", files: { "app.js": "console.log('v1')\n", "feature.js": "// feature útil\n" }, branch: "main", timestamp: Date.now() - 2000 };
      r.branches.main = c1;
      const c2 = randHash();
      r.commits[c2] = { hash: c2, parents: [c1], message: "BUG: quebrou tudo", files: { "app.js": "console.log('quebrado')\n", "feature.js": "// feature útil\n" }, branch: "main", timestamp: Date.now() - 1000 };
      r.branches.main = c2;
      r.HEAD = { type: "branch", name: "main" };
      r.files = { "app.js": "console.log('quebrado')\n", "feature.js": "// feature útil\n" };
      // simular alteração suja na working dir
      r.files["app.js"] = "console.log('quebrado MAIS AINDA')\n";
      return r;
    },
    missions: [
      { id: "restore", title: "Descarte a mudança suja: git restore app.js", hint: "git restore app.js", check: (r) => {
        const head = headCommit(r);
        return !!head && r.files["app.js"] === head.files["app.js"];
      }},
      { id: "revert", title: "Reverta o commit ruim sem apagar do histórico: git revert HEAD", hint: 'git revert HEAD (cria um commit que desfaz)', check: (r) => {
        const head = headCommit(r);
        // procurar um commit cuja mensagem comece com "Revert"
        return !!head && Object.values(r.commits).some((c) => c.message.startsWith("Revert"));
      }},
    ],
  },
];

// ---------- Component ----------
export function GitSimulator({ onBack }: Props) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set([0]));
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [repo, setRepo] = useState<Repo>(() => LEVELS[0].starter());
  const [missionIdx, setMissionIdx] = useState(0);
  const [lines, setLines] = useState<Line[]>([
    { type: "info", text: "Bem-vindo ao Git Simulator. Digite 'help' para ver os comandos." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [phase, setPhase] = useState<"intro" | "playing">(() => {
    return localStorage.getItem("git_sim_intro_seen") ? "playing" : "intro";
  });
  const [introStep, setIntroStep] = useState(0);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const level = LEVELS[levelIdx];
  const mission = level.missions[missionIdx];
  const levelDone = missionIdx >= level.missions.length;

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);
  useEffect(() => { if (phase === "playing") inputRef.current?.focus({ preventScroll: true }); }, [levelIdx, phase]);

  // mission auto-advance
  useEffect(() => {
    if (levelDone) return;
    if (mission.check(repo)) {
      setLines((l) => [...l, { type: "ok", text: `[+] Missão concluída: ${mission.title}` }]);
      const next = missionIdx + 1;
      if (next >= level.missions.length) {
        setLines((l) => [...l, { type: "ok", text: `=== NÍVEL ${level.id} CONCLUÍDO: ${level.title} ===` }]);
        setCompletedLevels((s) => new Set(s).add(levelIdx));
        if (levelIdx + 1 < LEVELS.length) {
          setUnlocked((s) => new Set(s).add(levelIdx + 1));
        }
      }
      setMissionIdx(next);
    }
  }, [repo]);

  const loadLevel = (idx: number) => {
    setLevelIdx(idx);
    setRepo(LEVELS[idx].starter());
    setMissionIdx(0);
    setLines([{ type: "info", text: `=== NÍVEL ${LEVELS[idx].id}: ${LEVELS[idx].title} ===` }, { type: "info", text: LEVELS[idx].briefing }]);
  };

  const resetLevel = () => loadLevel(levelIdx);

  // ---------- Command handling ----------
  const out = (text: string) => setLines((l) => [...l, { type: "out", text }]);
  const err = (text: string) => setLines((l) => [...l, { type: "err", text }]);
  const info = (text: string) => setLines((l) => [...l, { type: "info", text }]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { type: "in", text: `$ ${cmd}` }]);
    if (!cmd) return;
    if (cmd !== history[history.length - 1]) setHistory((h) => [...h, cmd]);
    setHistoryIdx(-1);

    if (cmd === "help") {
      out("Comandos suportados:");
      out("  git init                              inicializa o repositório");
      out("  git config [--global] user.name|user.email \"valor\"");
      out("  git config --list                     mostra a configuração atual");
      out("  git status                            mostra o estado das 3 áreas");
      out("  git add <arq>|.                       prepara arquivo para commit");
      out("  git commit -m <msg>                   aspas duplas, simples ou sem aspas");
      out("  git log [--oneline|--graph|--all]");
      out("  git diff                              compara workdir vs último commit");
      out("  git restore <arq>                     descarta mudanças locais");
      out("  git revert <ref>                      cria commit que desfaz outro");
      out("  git branch [name]                     lista ou cria branch");
      out("  git checkout [-b]|switch [-c] <name>  troca/cria branch");
      out("  git merge <branch>                    junta branch atual com outra");
      out("  git reset --hard                      restaura workdir para o HEAD");
      out("  git remote add origin <url>           conecta ao GitHub");
      out("  git push|pull [origin <branch>]       sincroniza com o remote");
      out("  git fetch                             baixa commits sem aplicar");
      out("  git stash | git stash pop             guarda/recupera trabalho não commitado");
      out("");
      out("Refs aceitas em qualquer comando: HEAD/head/Head, HEAD~N, HEAD^,");
      out("                                  hash completo (7 chars) ou prefixo (4+)");
      out("");
      out("  clear | reset | help");
      out("Atalhos: ↑/↓ histórico  •  Tab autocomplete contextual  •  Clique em arquivo para editar");
      return;
    }
    if (cmd === "clear") { setLines([]); return; }
    if (cmd === "reset") { resetLevel(); return; }

    if (!cmd.startsWith("git ")) { err(`comando não reconhecido: ${cmd}`); return; }
    const args = cmd.slice(4).trim();

    setRepo((r) => {
      const result = exec(r, args, { out, err, info });
      return result || r;
    });
  };

  const exec = (r: Repo, args: string, io: { out: (s: string) => void; err: (s: string) => void; info: (s: string) => void }): Repo | null => {
    const next: Repo = JSON.parse(JSON.stringify({ ...r, conflicts: Array.from(r.conflicts) }));
    next.conflicts = new Set(r.conflicts);

    // git init
    if (args === "init") {
      if (r.initialized) { io.out("Reinitialized existing Git repository"); return null; }
      next.initialized = true;
      next.branches.main = "";
      next.HEAD = { type: "branch", name: "main" };
      io.out("Initialized empty Git repository in /projeto/.git/");
      return next;
    }

    // git config user.name "X" / user.email "X" / --list / --global
    const configMatch = args.match(/^config(?:\s+--global)?\s+(user\.name|user\.email)\s+(?:["'](.+)["']|(\S.*))$/);
    if (configMatch) {
      const key = configMatch[1];
      const val = (configMatch[2] ?? configMatch[3] ?? "").trim();
      if (!val) { io.err(`error: missing value for '${key}'`); return null; }
      if (key === "user.name") next.config.userName = val;
      else next.config.userEmail = val;
      return next;
    }
    if (args === "config --list" || args === "config -l") {
      if (r.config.userName) io.out(`user.name=${r.config.userName}`);
      if (r.config.userEmail) io.out(`user.email=${r.config.userEmail}`);
      if (!r.config.userName && !r.config.userEmail) io.out("(nenhuma configuração definida — use 'git config user.name \"...\"')");
      return null;
    }
    const configGetMatch = args.match(/^config(?:\s+--global)?\s+(user\.name|user\.email)$/);
    if (configGetMatch) {
      const key = configGetMatch[1];
      const val = key === "user.name" ? r.config.userName : r.config.userEmail;
      if (val) io.out(val); else io.err("");
      return null;
    }

    if (!r.initialized) { io.err("fatal: not a git repository (use 'git init')"); return null; }

    // status
    if (args === "status") {
      const branch = headBranchName(r) ?? `(detached at ${r.HEAD.type === "detached" ? r.HEAD.hash : "?"})`;
      io.out(`On branch ${branch}`);
      const conflicts: string[] = [];
      const stagedNew: string[] = [];
      const stagedMod: string[] = [];
      const modified: string[] = [];
      const untracked: string[] = [];
      const allFiles = new Set([...Object.keys(r.files), ...Object.keys(r.staged ?? {}), ...Object.keys(headCommit(r)?.files ?? {})]);
      for (const f of allFiles) {
        if (r.conflicts.has(f)) { conflicts.push(f); continue; }
        const st = fileStatus(r, f);
        const inHead = headCommit(r)?.files[f] !== undefined;
        if (st === "staged") (inHead ? stagedMod : stagedNew).push(f);
        else if (st === "modified") modified.push(f);
        else if (st === "untracked") untracked.push(f);
      }
      if (conflicts.length) io.err(`Unmerged paths (resolva os conflitos):\n  ${conflicts.map((f) => "both modified: " + f).join("\n  ")}`);
      if (stagedNew.length || stagedMod.length) {
        io.out("Changes to be committed:");
        stagedNew.forEach((f) => io.out(`  new file:   ${f}`));
        stagedMod.forEach((f) => io.out(`  modified:   ${f}`));
      }
      if (modified.length) {
        io.out("Changes not staged for commit:");
        modified.forEach((f) => io.out(`  modified:   ${f}`));
      }
      if (untracked.length) {
        io.out("Untracked files:");
        untracked.forEach((f) => io.out(`  ${f}`));
      }
      if (!conflicts.length && !stagedNew.length && !stagedMod.length && !modified.length && !untracked.length) {
        io.out("nothing to commit, working tree clean");
      }
      return null;
    }

    // add
    if (args === "add ." || args === "add -A") {
      if (r.conflicts.size > 0) {
        // adding resolves conflicts if markers removed
        for (const f of Array.from(r.conflicts)) {
          if (!r.files[f].includes("<<<<<<<")) next.conflicts.delete(f);
        }
      }
      next.staged = { ...(next.staged ?? {}) };
      for (const f of Object.keys(r.files)) next.staged[f] = r.files[f];
      io.out(`${Object.keys(r.files).length} arquivo(s) preparado(s) para commit.`);
      return next;
    }
    if (args.startsWith("add ")) {
      const file = args.slice(4).trim();
      if (!(file in r.files)) { io.err(`pathspec '${file}' did not match any files`); return null; }
      if (r.conflicts.has(file) && !r.files[file].includes("<<<<<<<")) next.conflicts.delete(file);
      next.staged = { ...(next.staged ?? {}), [file]: r.files[file] };
      io.out(`'${file}' adicionado ao stage.`);
      return next;
    }

    // commit (aceita aspas duplas, simples, ou sem aspas)
    const commitMatch = args.match(/^commit\s+-m\s+(?:["'](.+)["']|(.+))$/);
    if (commitMatch) {
      const msg = commitMatch[1] ?? commitMatch[2];
      // verifica config user.name/email (Git real exige)
      if (!r.config.userName || !r.config.userEmail) {
        io.err("*** Please tell me who you are.");
        io.err("Run:");
        io.err('  git config user.email "voce@exemplo.com"');
        io.err('  git config user.name "Seu Nome"');
        return null;
      }
      if (r.conflicts.size > 0) { io.err("error: conflitos não resolvidos. Edite os arquivos e use 'git add'."); return null; }
      const branch = headBranchName(r);
      if (!branch) { io.err("HEAD desanexado — não suportado neste simulador."); return null; }
      const headHash = r.branches[branch];
      const head = headHash ? r.commits[headHash] : null;
      const staged = r.staged ?? {};
      // detect if there's actually anything to commit
      const baseFiles = head?.files ?? {};
      const merged = { ...baseFiles, ...staged };
      const changed = JSON.stringify(merged) !== JSON.stringify(baseFiles);
      if (!changed && r.HEAD.type === "branch") { io.err("nothing to commit, working tree clean"); return null; }

      const hash = randHash();
      // Detect merge commit: if there's a pending merge marker in stash-like state? We use commits with two parents only via merge; commit() always single-parent unless we're finishing a merge.
      const pendingMerge = (r as any)._mergeParent as string | undefined;
      const parents = pendingMerge ? [headHash, pendingMerge].filter(Boolean) as string[] : (headHash ? [headHash] : []);
      const c: Commit = { hash, parents, message: msg, files: merged, branch, timestamp: Date.now() };
      next.commits[hash] = c;
      next.branches[branch] = hash;
      next.staged = null;
      delete (next as any)._mergeParent;
      io.out(`[${branch} ${hash}] ${msg}`);
      return next;
    }

    // log
    if (args === "log" || args === "log --oneline" || args === "log --graph" || args === "log --oneline --graph") {
      const head = headCommit(r);
      if (!head) { io.out("(sem commits)"); return null; }
      const visited = new Set<string>();
      const stack: string[] = [head.hash];
      const ordered: Commit[] = [];
      while (stack.length) {
        const h = stack.pop()!;
        if (visited.has(h)) continue;
        visited.add(h);
        const c = r.commits[h];
        if (!c) continue;
        ordered.push(c);
        stack.push(...c.parents);
      }
      ordered.sort((a, b) => b.timestamp - a.timestamp);
      const oneline = args.includes("--oneline");
      ordered.forEach((c) => {
        if (oneline) io.out(`${c.hash} ${c.message}`);
        else { io.out(`commit ${c.hash}${c.parents.length > 1 ? " (merge)" : ""}`); io.out(`  ${c.message}`); }
      });
      return null;
    }

    // diff
    if (args === "diff") {
      const head = headCommit(r);
      const baseFiles = head?.files ?? {};
      let any = false;
      for (const f of Object.keys(r.files)) {
        if (r.files[f] !== (baseFiles[f] ?? "")) {
          any = true;
          io.out(`diff --git a/${f} b/${f}`);
          const oldLines = (baseFiles[f] ?? "").split("\n");
          const newLines = r.files[f].split("\n");
          oldLines.forEach((l) => l && io.out(`- ${l}`));
          newLines.forEach((l) => l && io.out(`+ ${l}`));
        }
      }
      if (!any) io.out("(sem diferenças)");
      return null;
    }

    // restore
    if (args.startsWith("restore ")) {
      const file = args.slice(8).trim();
      const head = headCommit(r);
      const original = head?.files[file];
      if (original === undefined) { io.err(`pathspec '${file}' did not match`); return null; }
      next.files[file] = original;
      if (next.staged) delete next.staged[file];
      io.out(`'${file}' restaurado.`);
      return next;
    }

    // revert <ref>  (HEAD/head/hash curto/HEAD~N tudo aceito via resolveRef)
    const revertMatch = args.match(/^revert\s+(\S+)$/);
    if (revertMatch) {
      const ref = revertMatch[1];
      const branch = headBranchName(r);
      if (!branch) { io.err("HEAD desanexado"); return null; }
      const headHash = r.branches[branch];
      const target = resolveRef(r, ref);
      if (!target) { io.err(`commit '${ref}' não encontrado`); return null; }
      const targetCommit = r.commits[target];
      if (!targetCommit) { io.err(`commit '${ref}' não encontrado`); return null; }
      if (!targetCommit.parents.length) { io.err("não dá pra reverter o commit inicial neste simulador"); return null; }
      const parent = r.commits[targetCommit.parents[0]];
      // o revert produz um commit cujo conteúdo aplica diff invertido — simplificamos: snapshot = pai do commit + arquivos não tocados pelo commit revertido
      const newFiles: Record<string, string> = { ...r.commits[headHash].files };
      // arquivos modificados/adicionados pelo commit revertido voltam ao estado do pai
      const allTouched = new Set([...Object.keys(targetCommit.files), ...Object.keys(parent.files)]);
      for (const f of allTouched) {
        if (parent.files[f] === undefined) delete newFiles[f];
        else newFiles[f] = parent.files[f];
      }
      const hash = randHash();
      next.commits[hash] = { hash, parents: [headHash], message: `Revert "${targetCommit.message}"`, files: newFiles, branch, timestamp: Date.now() };
      next.branches[branch] = hash;
      next.files = { ...newFiles };
      next.staged = null;
      io.out(`[${branch} ${hash}] Revert "${targetCommit.message}"`);
      return next;
    }

    // branch
    if (args === "branch") {
      Object.keys(r.branches).forEach((b) => io.out(`${headBranchName(r) === b ? "* " : "  "}${b}`));
      return null;
    }
    const branchMatch = args.match(/^branch\s+(\S+)$/);
    if (branchMatch) {
      const name = branchMatch[1];
      if (r.branches[name]) { io.err(`branch '${name}' já existe`); return null; }
      const head = headCommit(r);
      if (!head) { io.err("não há commits ainda"); return null; }
      next.branches[name] = head.hash;
      io.out(`branch '${name}' criada.`);
      return next;
    }

    // checkout / switch
    const coNew = args.match(/^(?:checkout\s+-b|switch\s+-c)\s+(\S+)$/);
    if (coNew) {
      const name = coNew[1];
      if (r.branches[name]) { io.err(`branch '${name}' já existe`); return null; }
      const head = headCommit(r);
      if (!head) { io.err("não há commits ainda"); return null; }
      next.branches[name] = head.hash;
      next.HEAD = { type: "branch", name };
      io.out(`Switched to a new branch '${name}'`);
      return next;
    }
    const coMatch = args.match(/^(?:checkout|switch)\s+(\S+)$/);
    if (coMatch) {
      const name = coMatch[1];
      const target = r.branches[name];
      if (!target) { io.err(`branch '${name}' não existe`); return null; }
      if (r.conflicts.size > 0) { io.err("resolva os conflitos antes de trocar de branch"); return null; }
      const c = r.commits[target];
      next.HEAD = { type: "branch", name };
      next.files = { ...c.files };
      next.staged = null;
      io.out(`Switched to branch '${name}'`);
      return next;
    }

    // merge
    const mergeMatch = args.match(/^merge\s+(\S+)$/);
    if (mergeMatch) {
      const target = mergeMatch[1];
      const targetHash = r.branches[target];
      if (!targetHash) { io.err(`branch '${target}' não existe`); return null; }
      const branch = headBranchName(r);
      if (!branch) { io.err("HEAD desanexado"); return null; }
      const headHash = r.branches[branch];
      if (headHash === targetHash) { io.out("Already up to date"); return null; }
      // fast-forward?
      if (ancestors(r, targetHash).has(headHash)) {
        next.branches[branch] = targetHash;
        next.files = { ...r.commits[targetHash].files };
        io.out(`Fast-forward to ${targetHash}`);
        return next;
      }
      const base = findMergeBase(r, headHash, targetHash);
      if (!base) { io.err("no merge base"); return null; }
      const baseFiles = r.commits[base].files;
      const headFiles = r.commits[headHash].files;
      const targetFiles = r.commits[targetHash].files;
      const allFiles = new Set([...Object.keys(headFiles), ...Object.keys(targetFiles), ...Object.keys(baseFiles)]);
      const merged: Record<string, string> = {};
      const conflicts: string[] = [];
      for (const f of allFiles) {
        const baseV = baseFiles[f] ?? "";
        const headV = headFiles[f] ?? "";
        const targetV = targetFiles[f] ?? "";
        if (headV === targetV) merged[f] = headV;
        else if (baseV === headV) merged[f] = targetV;
        else if (baseV === targetV) merged[f] = headV;
        else {
          merged[f] = `<<<<<<< HEAD\n${headV}=======\n${targetV}>>>>>>> ${target}\n`;
          conflicts.push(f);
        }
      }
      next.files = merged;
      next.staged = conflicts.length ? null : { ...merged };
      conflicts.forEach((f) => next.conflicts.add(f));
      (next as any)._mergeParent = targetHash;
      if (conflicts.length) {
        io.err(`Auto-merging falhou. CONFLICTS em: ${conflicts.join(", ")}`);
        io.err("Edite os arquivos para resolver, depois 'git add' e 'git commit'.");
      } else {
        io.out("Auto-merge bem-sucedido. Use 'git commit' para finalizar.");
      }
      return next;
    }

    // reset --hard
    if (args === "reset --hard") {
      const head = headCommit(r);
      if (head) next.files = { ...head.files };
      next.staged = null;
      next.conflicts = new Set();
      delete (next as any)._mergeParent;
      io.out("HEAD agora aponta para a posição original. Working dir restaurada.");
      return next;
    }

    // remote add
    if (args.startsWith("remote add origin")) {
      next.remote.enabled = true;
      io.out("Remote 'origin' adicionado.");
      return next;
    }

    // push
    const pushMatch = args.match(/^push(?:\s+origin\s+(\S+))?$/) || args === "push";
    if (typeof pushMatch === "object" && pushMatch) {
      const branchName = (pushMatch as RegExpMatchArray)[1] ?? headBranchName(r);
      if (!r.remote.enabled) { io.err("fatal: no remote 'origin' configured"); return null; }
      if (!branchName || !r.branches[branchName]) { io.err("branch inválida"); return null; }
      const localHead = r.branches[branchName];
      const remoteHead = r.remote.branches[branchName];
      if (remoteHead && !ancestors(r, localHead).has(remoteHead)) {
        io.err("rejected: o remote tem commits que você não possui. Faça 'git pull' primeiro.");
        return null;
      }
      // push all ancestors of localHead not already on remote
      const need = ancestors(r, localHead);
      need.forEach((h) => { if (r.commits[h]) next.remote.commits[h] = r.commits[h]; });
      next.remote.branches[branchName] = localHead;
      io.out(`Enumerating objects... ${need.size} object(s)\nTo origin\n  ${remoteHead ?? "0000000"}..${localHead}  ${branchName} -> ${branchName}`);
      return next;
    }

    // fetch
    if (args.startsWith("fetch")) {
      if (!r.remote.enabled) { io.err("no remote"); return null; }
      Object.entries(r.remote.commits).forEach(([h, c]) => { if (!next.commits[h]) next.commits[h] = c; });
      io.out("From origin (fetched)");
      return next;
    }

    // pull
    const pullMatch = args.match(/^pull(?:\s+origin\s+(\S+))?$/);
    if (pullMatch) {
      const branchName = pullMatch[1] ?? headBranchName(r);
      if (!r.remote.enabled) { io.err("no remote"); return null; }
      if (!branchName) { io.err("branch inválida"); return null; }
      const remoteHead = r.remote.branches[branchName];
      if (!remoteHead) { io.err(`remote não tem branch '${branchName}'`); return null; }
      // copy remote commits into local store
      Object.entries(r.remote.commits).forEach(([h, c]) => { if (!next.commits[h]) next.commits[h] = c; });
      const localHead = r.branches[branchName];
      if (!localHead) {
        next.branches[branchName] = remoteHead;
        next.files = { ...next.commits[remoteHead].files };
        io.out("Fast-forward (cloned remote branch)");
        return next;
      }
      if (localHead === remoteHead) { io.out("Already up to date"); return null; }
      if (ancestors(next, remoteHead).has(localHead)) {
        next.branches[branchName] = remoteHead;
        next.files = { ...next.commits[remoteHead].files };
        io.out(`Fast-forward to ${remoteHead}`);
        return next;
      }
      // merge remote into local
      const base = findMergeBase(next, localHead, remoteHead);
      if (!base) { io.err("no merge base"); return null; }
      const baseFiles = next.commits[base].files;
      const headFiles = next.commits[localHead].files;
      const targetFiles = next.commits[remoteHead].files;
      const allFiles = new Set([...Object.keys(headFiles), ...Object.keys(targetFiles), ...Object.keys(baseFiles)]);
      const merged: Record<string, string> = {};
      const conflicts: string[] = [];
      for (const f of allFiles) {
        const baseV = baseFiles[f] ?? "";
        const headV = headFiles[f] ?? "";
        const targetV = targetFiles[f] ?? "";
        if (headV === targetV) merged[f] = headV;
        else if (baseV === headV) merged[f] = targetV;
        else if (baseV === targetV) merged[f] = headV;
        else { merged[f] = `<<<<<<< HEAD\n${headV}=======\n${targetV}>>>>>>> origin/${branchName}\n`; conflicts.push(f); }
      }
      if (conflicts.length) {
        next.files = merged;
        conflicts.forEach((f) => next.conflicts.add(f));
        (next as any)._mergeParent = remoteHead;
        io.err(`CONFLICTS em: ${conflicts.join(", ")}. Resolva e commit.`);
        return next;
      }
      // auto-merge commit
      const mergeHash = randHash();
      const c: Commit = { hash: mergeHash, parents: [localHead, remoteHead], message: `Merge branch '${branchName}' of origin`, files: merged, branch: branchName, timestamp: Date.now() };
      next.commits[mergeHash] = c;
      next.branches[branchName] = mergeHash;
      next.files = merged;
      next.staged = null;
      io.out(`Merge made by 'recursive' strategy. ${conflicts.length === 0 ? "Auto-merged." : ""}`);
      return next;
    }

    // stash
    if (args === "stash") {
      const head = headCommit(r);
      const baseFiles = head?.files ?? {};
      const dirty = Object.keys(r.files).some((f) => r.files[f] !== baseFiles[f]);
      if (!dirty) { io.out("No local changes to save"); return null; }
      next.stash.push({ ...r.files });
      next.files = { ...baseFiles };
      next.staged = null;
      io.out("Saved working directory and index state");
      return next;
    }
    if (args === "stash pop") {
      if (!r.stash.length) { io.err("No stash entries"); return null; }
      const top = r.stash[r.stash.length - 1];
      next.stash = r.stash.slice(0, -1);
      next.files = { ...top };
      io.out("Stash aplicado.");
      return next;
    }

    io.err(`git: '${args}' não suportado neste simulador. Use 'help'.`);
    return null;
  };

  // ---------- File editor ----------
  const openEditor = (file: string) => {
    setEditingFile(file);
    setEditorContent(repo.files[file] ?? "");
  };
  const saveEditor = () => {
    if (!editingFile) return;
    const file = editingFile;
    setRepo((r) => {
      const next = { ...r, files: { ...r.files, [file]: editorContent }, conflicts: new Set(r.conflicts) };
      if (!editorContent.includes("<<<<<<<")) next.conflicts.delete(file);
      return next;
    });
    setLines((l) => [...l, { type: "info", text: `[editor] '${file}' salvo.` }]);
    setEditingFile(null);
  };

  // ---------- Terminal input handling ----------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const i = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const i = historyIdx + 1;
      if (i >= history.length) { setHistoryIdx(-1); setInput(""); }
      else { setHistoryIdx(i); setInput(history[i]); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const matches = computeGitCompletions(input, repo);
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1) {
        const common = longestCommonPrefix(matches);
        if (common.length > input.length) setInput(common);
        info("Sugestões: " + matches.slice(0, 12).join(" | ") + (matches.length > 12 ? ` …(+${matches.length - 12})` : ""));
      }
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(input);
    setInput("");
  };

  // ---------- Commit graph layout ----------
  const graph = useMemo(() => {
    const commits = Object.values(repo.commits).sort((a, b) => a.timestamp - b.timestamp);
    if (!commits.length) return { nodes: [] as any[], edges: [] as any[], width: 0, height: 0, branchLabels: [] as any[] };
    const branchOrder: string[] = [];
    Object.keys(repo.branches).forEach((b) => branchOrder.push(b));
    const colOf: Record<string, number> = {};
    branchOrder.forEach((b, i) => (colOf[b] = i));
    const colW = 50, rowH = 44;
    const nodes = commits.map((c, i) => ({
      hash: c.hash,
      x: 24 + (colOf[c.branch] ?? 0) * colW,
      y: 24 + i * rowH,
      msg: c.message,
      branch: c.branch,
      isHead: headCommit(repo)?.hash === c.hash,
    }));
    const nodeMap: Record<string, any> = {};
    nodes.forEach((n) => (nodeMap[n.hash] = n));
    const edges: any[] = [];
    commits.forEach((c) => {
      const child = nodeMap[c.hash];
      c.parents.forEach((p) => {
        const parent = nodeMap[p];
        if (parent) edges.push({ from: parent, to: child });
      });
    });
    const branchLabels = Object.entries(repo.branches).map(([name, hash]) => {
      const n = nodeMap[hash];
      return n ? { name, x: n.x, y: n.y, isHead: headBranchName(repo) === name } : null;
    }).filter(Boolean);
    return { nodes, edges, width: 24 + branchOrder.length * colW + 80, height: 48 + commits.length * rowH, branchLabels };
  }, [repo]);

  const branchColor = (b: string) => {
    const colors = ["#34d399", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa", "#fb7185"];
    const keys = Object.keys(repo.branches);
    const i = keys.indexOf(b);
    return colors[i % colors.length] || "#94a3b8";
  };

  // ---------- Render ----------
  // ---------- Intro screen ----------
  if (phase === "intro") {
    const levelStyles = [
      { border: "border-amber-500/20", bg: "bg-amber-500/10", borderInner: "border-amber-500/30", text: "text-amber-400" },
      { border: "border-sky-500/20", bg: "bg-sky-500/10", borderInner: "border-sky-500/30", text: "text-sky-400" },
      { border: "border-red-500/20", bg: "bg-red-500/10", borderInner: "border-red-500/30", text: "text-red-400" },
      { border: "border-fuchsia-500/20", bg: "bg-fuchsia-500/10", borderInner: "border-fuchsia-500/30", text: "text-fuchsia-400" },
      { border: "border-violet-500/20", bg: "bg-violet-500/10", borderInner: "border-violet-500/30", text: "text-violet-400" },
    ];
    const steps: { title: string; content: React.ReactNode }[] = [
      {
        title: "Boas-vindas",
        content: (
          <div className="text-center pt-6">
            <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-5">
              <Terminal className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">Git Simulator</h1>
            <p className="text-emerald-400 font-mono text-sm uppercase tracking-[0.3em] mb-6">Treine sem medo de quebrar nada</p>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Um terminal simulado para você praticar Git e GitHub digitando comandos reais. Sem instalar nada, com grafo de commits ao vivo e missões que ensinam do zero.
            </p>
          </div>
        ),
      },
      {
        title: "Por que aprender Git?",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Por que aprender Git?
            </h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <Clock className="w-6 h-6 text-amber-400 mb-3" />
                <p className="text-base font-bold text-white mb-2">Máquina do tempo</p>
                <p className="text-sm text-slate-400 leading-relaxed">Volte para qualquer versão anterior do seu código com um comando. Quebrou algo? Desfaça em segundos.</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <Users className="w-6 h-6 text-sky-400 mb-3" />
                <p className="text-base font-bold text-white mb-2">Trabalho em time</p>
                <p className="text-sm text-slate-400 leading-relaxed">Várias pessoas mexendo no mesmo projeto sem pisar no pé umas das outras. O Git resolve quem mudou o quê.</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <Shield className="w-6 h-6 text-fuchsia-400 mb-3" />
                <p className="text-base font-bold text-white mb-2">Indispensável no mercado</p>
                <p className="text-sm text-slate-400 leading-relaxed">99% das empresas de tecnologia usam Git. É o requisito mais básico — saber Git é como saber abrir um arquivo.</p>
              </div>
            </div>
          </section>
        ),
      },
      {
        title: "Git vs GitHub",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Git vs GitHub
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-widest mb-3">
                  <Terminal className="w-3.5 h-3.5" /> Git (programa)
                </div>
                <p className="text-base text-slate-300 leading-relaxed mb-3">Programa de linha de comando instalado no seu computador. Tira "fotografias" do projeto a cada commit, mantém histórico, gerencia branches.</p>
                <p className="text-xs text-slate-500 font-mono">Local • Offline • Linha de comando</p>
              </div>
              <div className="bg-slate-900/60 border border-sky-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-sky-400 text-sm font-bold uppercase tracking-widest mb-3">
                  <Cloud className="w-3.5 h-3.5" /> GitHub (site)
                </div>
                <p className="text-base text-slate-300 leading-relaxed mb-3">Plataforma na nuvem que hospeda repositórios Git. Permite compartilhar código, colaborar via Pull Requests, e funciona como portfólio público.</p>
                <p className="text-xs text-slate-500 font-mono">Nuvem • Online • Interface web</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4 text-center italic">Analogia: Git é o Word; GitHub é o Google Drive. Você usa o programa local e sincroniza com a nuvem.</p>
          </section>
        ),
      },
      {
        title: "As 3 áreas do Git",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-2">
              <Folder className="w-4 h-4" /> As 3 áreas do Git
            </h2>
            <p className="text-base text-slate-400 mb-5">Quando você edita um arquivo, ele passa por três estágios antes de virar parte do histórico:</p>
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">1. Working Directory</div>
                <p className="text-base text-slate-300 leading-relaxed mb-3">Os arquivos que você está editando agora. Mudanças aqui são "voláteis" até serem salvas.</p>
                <code className="text-xs text-amber-300 font-mono">edita arquivo.js</code>
              </div>
              <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-5">
                <div className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-2">2. Staging (Índice)</div>
                <p className="text-base text-slate-300 leading-relaxed mb-3">Sala de espera. Você marca aqui o que vai entrar no próximo commit (snapshot).</p>
                <code className="text-xs text-sky-300 font-mono">git add arquivo.js</code>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">3. Repository</div>
                <p className="text-base text-slate-300 leading-relaxed mb-3">Histórico permanente. Cada commit é uma fotografia imutável com hash único.</p>
                <code className="text-xs text-emerald-300 font-mono">git commit -m "msg"</code>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
              <img 
                src="/assets/images/git_edu.png" 
                alt="Infográfico Educativo: As 3 áreas do Git" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </section>
        ),
      },
      {
        title: "Glossário",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Glossário rápido
            </h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl divide-y divide-white/5">
              {[
                { t: "Repositório", d: "Pasta monitorada pelo Git (tem uma subpasta .git oculta com o histórico).", c: "text-emerald-300" },
                { t: "Commit", d: "Uma fotografia do estado dos arquivos num momento, com mensagem e hash único (ex: a3f9c1b).", c: "text-sky-300" },
                { t: "Branch", d: "Linha do tempo paralela. Permite trabalhar em features sem mexer na main.", c: "text-fuchsia-300" },
                { t: "HEAD", d: "Ponteiro que indica onde você está. Geralmente aponta para o último commit da branch atual.", c: "text-amber-300" },
                { t: "Merge", d: "Juntar duas branches em uma só. Pode ser fast-forward (limpinho) ou criar um commit de merge.", c: "text-violet-300" },
                { t: "Conflito", d: "Quando duas branches modificam a mesma linha. Você precisa escolher manualmente o que fica.", c: "text-red-300" },
                { t: "Remote", d: "Cópia do repositório em outro lugar (ex: GitHub). 'origin' é o nome padrão.", c: "text-cyan-300" },
                { t: "Push / Pull", d: "Push envia commits locais para o remote. Pull baixa commits do remote para o local.", c: "text-pink-300" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <span className={`text-sm font-bold font-mono ${item.c} min-w-[120px] pt-0.5`}>{item.t}</span>
                  <span className="text-sm text-slate-400 leading-relaxed flex-1">{item.d}</span>
                </div>
              ))}
            </div>
          </section>
        ),
      },
      {
        title: "Os 5 níveis",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Os {LEVELS.length} níveis
            </h2>
            <div className="space-y-2">
              {LEVELS.map((lv, i) => {
                const s = levelStyles[i] ?? levelStyles[0];
                return (
                  <div key={lv.id} className={`bg-slate-900/40 border ${s.border} rounded-xl p-4 flex items-start gap-4`}>
                    <div className={`w-10 h-10 rounded-lg ${s.bg} border ${s.borderInner} ${s.text} flex items-center justify-center font-black text-base shrink-0`}>{lv.id}</div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-white mb-1">{lv.title}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{lv.briefing}</p>
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
            <div className="bg-gradient-to-br from-emerald-900/10 via-slate-900/40 to-sky-900/10 border border-emerald-500/20 rounded-2xl p-6 mb-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Dicas do simulador
              </h2>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Digite <code className="text-emerald-300 font-mono">help</code> a qualquer momento para ver todos os comandos</li>
                <li>• Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">↑</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">↓</kbd> para navegar no histórico</li>
                <li>• <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">Tab</kbd> autocompleta comandos</li>
                <li>• Clique em qualquer arquivo do Working Directory para abrir o editor</li>
                <li>• <code className="text-emerald-300 font-mono">reset</code> reinicia o nível, <code className="text-emerald-300 font-mono">clear</code> limpa o terminal</li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-base text-slate-300 mb-1">Você está pronto.</p>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Comece pelo Nível 1 — os outros desbloqueiam conforme você avança</p>
            </div>
          </section>
        ),
      },
    ];

    const isLast = introStep === steps.length - 1;
    const goPrev = () => setIntroStep((s) => Math.max(0, s - 1));
    const goNext = () => {
      if (isLast) {
        localStorage.setItem("git_sim_intro_seen", "true");
        setPhase("playing");
      } else {
        setIntroStep((s) => s + 1);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]">
          <img src="/assets/images/git_bg.png" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4">
            <Button variant="ghost" size="icon" onClick={() => localStorage.getItem("git_sim_intro_seen") ? setPhase("playing") : onBack()} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <button onClick={() => {
              localStorage.setItem("git_sim_intro_seen", "true");
              setPhase("playing");
            }} className="text-xs text-slate-500 hover:text-emerald-400 font-mono uppercase tracking-widest transition-colors">
              Pular tour →
            </button>
          </div>

          {/* Step content */}
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

          {/* Footer nav */}
          <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-950/90 backdrop-blur-md border-t border-white/10">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={goPrev}
                disabled={introStep === 0}
                className="text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4 mr-1 rotate-90" /> Voltar
              </Button>

              <div className="flex-1 flex flex-col items-center gap-2">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{steps[introStep].title} · {introStep + 1} de {steps.length}</p>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIntroStep(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === introStep ? "w-8 bg-emerald-400" :
                        i < introStep ? "w-1.5 bg-emerald-400/60" : "w-1.5 bg-slate-700"
                      }`}
                      aria-label={`Ir para passo ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={goNext}
                className={isLast ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold" : "bg-slate-800 text-white hover:bg-slate-700"}
              >
                {isLast ? "Iniciar Treinamento" : "Próximo"} <ChevronDown className="w-4 h-4 ml-1 -rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06]">
        <img 
          src="/assets/images/git_bg.png" 
          alt="Git Background" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 min-h-screen flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Git Simulator</h2>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-[0.2em]">Treine sem medo de quebrar nada</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPhase("intro")} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs">
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
              const isDone = completedLevels.has(i);
              const isCurrent = i === levelIdx;
              
              return (
                <div key={lv.id} className="flex items-center gap-2 shrink-0">
                  {i > 0 && (
                    <div className={`h-0.5 w-4 md:w-8 transition-colors duration-500 ${
                      isUnlocked ? "bg-emerald-500/40" : "bg-slate-900"
                    }`} />
                  )}
                  
                  <button
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && loadLevel(i)}
                    className={`relative group flex items-center transition-all duration-500 ${
                      isCurrent ? "px-4 py-2 rounded-full bg-emerald-500/20 border-emerald-400 border" : "w-10 h-10 rounded-full border items-center justify-center"
                    } ${
                      isCurrent ? "text-emerald-300" :
                      isDone ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" :
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

        {/* Level briefing */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono mb-1">Briefing do Nível {level.id}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{level.briefing}</p>
          </div>
        </div>

        {/* Mission bar */}
        <div className={`rounded-2xl p-4 border mb-4 ${levelDone ? "bg-emerald-500/10 border-emerald-500/40" : "bg-sky-500/10 border-sky-500/30"}`}>
          <div className="flex items-center gap-3">
            {levelDone ? <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" /> :
              <div className="w-6 h-6 rounded-full bg-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">{missionIdx + 1}</div>}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                {levelDone ? `Nível ${level.id} concluído` : `Nível ${level.id} • Missão ${missionIdx + 1} de ${level.missions.length}`}
              </p>
              <p className="text-sm font-bold text-white">{levelDone ? "Avance para o próximo nível!" : mission.title}</p>
              {!levelDone && <p className="text-xs text-slate-400 font-mono mt-0.5">Dica: <span className="text-emerald-300">{mission.hint}</span></p>}
            </div>
            {levelDone && levelIdx + 1 < LEVELS.length && (
              <Button size="sm" onClick={() => loadLevel(levelIdx + 1)} className="bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold text-xs">
                Próximo Nível →
              </Button>
            )}
          </div>
        </div>

        {/* Conflict banner */}
        {repo.conflicts.size > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1 text-xs">
              <p className="text-red-300 font-bold">Conflito de merge em: {Array.from(repo.conflicts).join(", ")}</p>
              <p className="text-slate-400 mt-0.5">Clique no arquivo para abrir o editor, remova os marcadores <code className="text-amber-300">&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code className="text-amber-300">=======</code>, <code className="text-amber-300">&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> e salve.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Identidade Git (visível só se já configurada) */}
          {(repo.config.userName || repo.config.userEmail) && (
            <div className="bg-slate-900/40 border border-white/5 rounded-xl px-3 py-2 flex items-center gap-3 text-[11px] font-mono">
              <span className="text-emerald-400 uppercase tracking-widest text-[9px]">git config</span>
              <span className="text-slate-300">{repo.config.userName ?? "(sem nome)"}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{repo.config.userEmail ?? "(sem email)"}</span>
            </div>
          )}

          {/* Row 1: Working Directory | Staging Area | Grafo */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Working Directory — só untracked + modified + clean */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-amber-400">
                <Folder className="w-4 h-4" />
                <h5 className="text-xs font-bold uppercase tracking-widest">Working Directory</h5>
                <span className="text-[10px] text-slate-500 font-mono ml-auto">clique p/ editar</span>
              </div>
              <div className="space-y-1.5">
                {Object.keys(repo.files).length === 0 && <p className="text-[11px] text-slate-600 italic">(vazio)</p>}
                {Object.keys(repo.files).sort().map((f) => {
                  const st = fileStatus(repo, f);
                  const color =
                    st === "conflict" ? "text-red-400 border-red-500/40 bg-red-500/5" :
                    st === "staged" ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/5 opacity-60" :
                    st === "modified" ? "text-amber-300 border-amber-500/30 bg-amber-500/5" :
                    st === "untracked" ? "text-slate-300 border-slate-500/30 bg-slate-700/20" :
                    "text-slate-400 border-white/10 bg-slate-950/40";
                  return (
                    <button key={f} onClick={() => openEditor(f)}
                      className={`w-full flex items-center gap-2 text-xs rounded-md px-2 py-2 font-mono border transition-all hover:scale-[1.01] ${color}`}>
                      <FileCode className="w-3 h-3 shrink-0" />
                      <span className="truncate flex-1 text-left">{f}</span>
                      <span className="text-[9px] uppercase shrink-0 opacity-70">{st === "clean" ? "" : st}</span>
                      <Edit3 className="w-3 h-3 opacity-50 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Staging Area */}
            <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h5 className="text-xs font-bold uppercase tracking-widest">Staging Area</h5>
                <span className="text-[10px] text-slate-500 font-mono ml-auto">{repo.staged ? Object.keys(repo.staged).length : 0} preparado(s)</span>
              </div>
              <div className="space-y-1.5">
                {(!repo.staged || Object.keys(repo.staged).length === 0) ? (
                  <div className="text-[11px] text-slate-600 italic space-y-1">
                    <p>(nada preparado)</p>
                    <p className="text-slate-700">Use <code className="text-emerald-400">git add &lt;arq&gt;</code> para preparar.</p>
                  </div>
                ) : (
                  Object.keys(repo.staged).sort().map((f) => {
                    const headFiles = headCommit(repo)?.files ?? {};
                    const isNew = headFiles[f] === undefined;
                    return (
                      <div key={f} className="flex items-center gap-2 text-xs rounded-md px-2 py-2 font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                        <span className="text-emerald-500 text-[9px]">●</span>
                        <span className="truncate flex-1">{f}</span>
                        <span className="text-[9px] uppercase opacity-70">{isNew ? "new" : "mod"}</span>
                      </div>
                    );
                  })
                )}
              </div>
              {repo.staged && Object.keys(repo.staged).length > 0 && (
                <p className="text-[10px] text-slate-500 mt-3 pt-3 border-t border-white/5 font-mono">
                  Próximo passo: <code className="text-emerald-400">git commit -m "..."</code>
                </p>
              )}
            </div>

            {/* Commit graph */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <GitCommit className="w-4 h-4" />
                <h5 className="text-xs font-bold uppercase tracking-widest">Grafo de Commits</h5>
                {repo.remote.enabled && <span className="ml-auto flex items-center gap-1 text-[10px] text-fuchsia-400 font-mono"><Github className="w-3 h-3" /> origin</span>}
              </div>
              <div className="overflow-auto max-h-80">
                {graph.nodes.length === 0 ? (
                  <p className="text-[11px] text-slate-600 italic">Sem commits ainda. Use <code className="text-emerald-300">git commit</code>.</p>
                ) : (
                  <svg width={Math.max(graph.width, 300)} height={graph.height}>
                    {graph.edges.map((e, i) => (
                      <line key={i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
                        stroke={branchColor(e.to.branch)} strokeWidth={2} opacity={0.6} />
                    ))}
                    {graph.nodes.map((n, i) => (
                      <g key={i}>
                        <circle cx={n.x} cy={n.y} r={n.isHead ? 9 : 7} fill={branchColor(n.branch)}
                          stroke={n.isHead ? "#fff" : "transparent"} strokeWidth={2} />
                        <text x={n.x + 16} y={n.y + 4} fill="#cbd5e1" fontSize="11" fontFamily="monospace">
                          <tspan fill="#64748b">{n.hash}</tspan>  {n.msg.length > 38 ? n.msg.slice(0, 36) + "…" : n.msg}
                        </text>
                      </g>
                    ))}
                    {graph.branchLabels.map((b: any, i: number) => (
                      <g key={i}>
                        <rect x={b.x - 22} y={b.y - 22} width={Math.max(b.name.length * 7 + 16, 40)} height={16} rx={3}
                          fill={branchColor(b.name)} opacity={0.95} />
                        <text x={b.x - 14} y={b.y - 10} fill="#0f172a" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {b.isHead ? "HEAD→" : ""}{b.name}
                        </text>
                      </g>
                    ))}
                  </svg>
                )}
              </div>
              {Object.keys(repo.branches).length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {Object.keys(repo.branches).map((b) => (
                    <span key={b} className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ background: branchColor(b) + "22", color: branchColor(b), border: `1px solid ${branchColor(b)}55` }}>
                      <GitBranch className="w-2.5 h-2.5" />
                      {headBranchName(repo) === b && "* "}{b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Remote panel (origin) */}
          {repo.remote.enabled && (() => {
            const localBranch = headBranchName(repo);
            const localHead = localBranch ? repo.branches[localBranch] : null;
            const remoteHead = localBranch ? repo.remote.branches[localBranch] : null;
            // calcula ahead/behind
            let ahead = 0, behind = 0;
            if (localHead && remoteHead && localHead !== remoteHead) {
              const localAnc = ancestors(repo, localHead);
              const remoteAnc = new Set<string>();
              const stack = [remoteHead];
              while (stack.length) {
                const h = stack.pop()!;
                if (remoteAnc.has(h)) continue;
                remoteAnc.add(h);
                const c = repo.remote.commits[h] ?? repo.commits[h];
                if (c) stack.push(...c.parents);
              }
              localAnc.forEach((h) => { if (!remoteAnc.has(h)) ahead++; });
              remoteAnc.forEach((h) => { if (!localAnc.has(h)) behind++; });
            } else if (localHead && !remoteHead) ahead = 1;
            const inSync = ahead === 0 && behind === 0 && localHead === remoteHead;
            const remoteBranches = Object.keys(repo.remote.branches);
            return (
              <div className="bg-slate-900/60 border border-fuchsia-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="w-4 h-4 text-fuchsia-400" />
                  <h5 className="text-xs font-bold uppercase tracking-widest text-fuchsia-400">Remote · origin</h5>
                  <span className="text-[10px] text-slate-500 font-mono">github.com (simulado)</span>
                  <div className="ml-auto flex items-center gap-2 text-[10px] font-mono">
                    {inSync ? (
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> em sincronia</span>
                    ) : (
                      <>
                        {ahead > 0 && <span className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-1.5 rounded">↑ {ahead} ahead</span>}
                        {behind > 0 && <span className="text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 rounded">↓ {behind} behind</span>}
                      </>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Branches no remote</p>
                    <div className="space-y-1">
                      {remoteBranches.length === 0 && <p className="text-[11px] text-slate-600 italic">(nenhuma branch publicada)</p>}
                      {remoteBranches.map((b) => {
                        const rh = repo.remote.branches[b];
                        const lh = repo.branches[b];
                        const same = rh === lh;
                        return (
                          <div key={b} className="flex items-center gap-2 text-[11px] font-mono px-2 py-1 rounded bg-slate-950/50 border border-white/5">
                            <GitBranch className="w-3 h-3 text-fuchsia-400" />
                            <span className="text-fuchsia-300">origin/{b}</span>
                            <span className="text-slate-600 ml-auto">{rh.slice(0, 7)}</span>
                            {same && <span className="text-emerald-400 text-[9px]">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Sugestão</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {inSync && <>Tudo sincronizado. Continue trabalhando localmente.</>}
                      {!inSync && ahead > 0 && behind === 0 && (
                        <>Você tem <span className="text-emerald-300">{ahead}</span> commit(s) à frente. Use <code className="text-emerald-300">git push</code> pra publicar.</>
                      )}
                      {!inSync && ahead === 0 && behind > 0 && (
                        <>O remote tem <span className="text-amber-300">{behind}</span> commit(s) novo(s). Use <code className="text-amber-300">git pull</code> pra sincronizar.</>
                      )}
                      {!inSync && ahead > 0 && behind > 0 && (
                        <>Histórico divergente: <span className="text-emerald-300">{ahead}↑</span> e <span className="text-amber-300">{behind}↓</span>. <code className="text-amber-300">git pull</code> primeiro, depois <code className="text-emerald-300">git push</code>.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Right column: terminal */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="bg-slate-950 border border-emerald-500/30 rounded-2xl overflow-hidden flex flex-col h-96 cursor-text shadow-[0_0_30px_-10px_rgba(34,197,94,0.4)] focus-within:border-emerald-400 focus-within:shadow-[0_0_40px_-10px_rgba(34,197,94,0.7)] transition-all"
          >
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-slate-900/80">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-[11px] text-slate-500 font-mono flex-1">~/projeto ({headBranchName(repo) ?? "?"})</span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest animate-pulse">● digite aqui</span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-0.5">
              {lines.map((l, i) => (
                <pre key={i} className={`whitespace-pre-wrap break-words ${
                  l.type === "in" ? "text-white" :
                  l.type === "ok" ? "text-emerald-400" :
                  l.type === "err" ? "text-red-400" :
                  l.type === "info" ? "text-sky-300" : "text-slate-400"
                }`}>{l.text}</pre>
              ))}
              <form onSubmit={onSubmit} className="flex items-center gap-2 pt-1">
                <span className="text-emerald-400 font-bold">$</span>
                <input ref={inputRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck={false} autoComplete="off"
                  placeholder="git init"
                  className="flex-1 bg-transparent outline-none text-white caret-emerald-400 placeholder:text-slate-600 placeholder:italic" />
                <span className="w-2 h-4 bg-emerald-400 animate-pulse" aria-hidden />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* File editor modal */}
      <AnimatePresence>
        {editingFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2 font-mono text-sm">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  {editingFile}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingFile(null)} className="text-slate-400 rounded-full"><X className="w-4 h-4" /></Button>
              </div>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                spellCheck={false}
                className="w-full h-80 bg-slate-950 text-slate-100 font-mono text-sm p-4 outline-none resize-none"
              />
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-white/10 bg-slate-900">
                <Button variant="ghost" size="sm" onClick={() => setEditingFile(null)} className="text-slate-400">Cancelar</Button>
                <Button size="sm" onClick={saveEditor} className="bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold">
                  <Save className="w-3.5 h-3.5 mr-1" /> Salvar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
