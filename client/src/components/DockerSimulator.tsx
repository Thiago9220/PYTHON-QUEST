import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Terminal, X, Save, Edit3, Lock, Trophy, ChevronDown, BookOpen, Lightbulb,
  Container as ContainerIcon, Package, Cloud, FileCode, Layers, Network, HardDrive, Server, Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
}

type Line = { type: "in" | "out" | "ok" | "err" | "info"; text: string };

interface Image {
  name: string;
  tag: string;
  id: string;
  size: string;
  builtFromDockerfile?: boolean;
}

interface Container {
  id: string;
  imageRef: string;
  name: string;
  command: string;
  status: "running" | "stopped";
  ports: { host: number; container: number }[];
  volumes: { host: string; container: string }[];
  createdAt: number;
  logs: string[];
}

interface State {
  registry: Image[];
  images: Image[];
  containers: Container[];
  dockerfile: string;
  composeFile: string;
  composeUp: boolean;
  composeProject: string;
}

interface LevelDef {
  id: number;
  title: string;
  briefing: string;
  starter: () => State;
  missions: { id: string; title: string; hint: string; check: (s: State) => boolean }[];
}

const randId = () => Math.random().toString(16).slice(2, 14);
const randName = () => {
  const a = ["happy", "brave", "clever", "eager", "fierce", "gentle", "jolly", "kind", "lucky", "merry"];
  const b = ["einstein", "tesla", "curie", "darwin", "newton", "lovelace", "turing", "hopper", "knuth", "ritchie"];
  return `${a[Math.floor(Math.random() * a.length)]}_${b[Math.floor(Math.random() * b.length)]}`;
};

const REGISTRY_BASE: Image[] = [
  { name: "nginx", tag: "latest", id: randId(), size: "142MB" },
  { name: "node", tag: "20", id: randId(), size: "996MB" },
  { name: "python", tag: "3.12", id: randId(), size: "1.02GB" },
  { name: "postgres", tag: "16", id: randId(), size: "425MB" },
  { name: "redis", tag: "7", id: randId(), size: "117MB" },
  { name: "alpine", tag: "latest", id: randId(), size: "7MB" },
];

const baseState = (): State => ({
  registry: [...REGISTRY_BASE],
  images: [],
  containers: [],
  dockerfile: "",
  composeFile: "",
  composeUp: false,
  composeProject: "",
});

const DEFAULT_DOCKERFILE = `FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
`;

const DEFAULT_COMPOSE = `version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - dbdata:/var/lib/postgresql/data

volumes:
  dbdata:
`;

const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: "Imagens & Containers",
    briefing: "Aprenda o ABC do Docker: baixar uma imagem do Docker Hub, rodar um container, listar, parar e remover. Você vai entender a diferença entre imagem (receita) e container (instância).",
    starter: () => baseState(),
    missions: [
      { id: "pull", title: "Baixe a imagem do nginx do Docker Hub", hint: "docker pull nginx", check: (s) => s.images.some((i) => i.name === "nginx") },
      { id: "run", title: "Rode um container a partir do nginx", hint: "docker run -d nginx", check: (s) => s.containers.some((c) => c.imageRef.startsWith("nginx") && c.status === "running") },
      { id: "ps", title: "Liste os containers rodando", hint: "docker ps", check: (s) => (s as any)._listed === true },
      { id: "stop", title: "Pare o container", hint: "docker stop <nome ou id>", check: (s) => s.containers.some((c) => c.imageRef.startsWith("nginx") && c.status === "stopped") },
      { id: "rm", title: "Remova o container parado", hint: "docker rm <nome ou id>", check: (s) => !s.containers.some((c) => c.imageRef.startsWith("nginx")) },
    ],
  },
  {
    id: 2,
    title: "Construindo sua Imagem",
    briefing: "Imagens prontas são ótimas, mas e quando você quer uma do seu jeito? Edite um Dockerfile, construa sua própria imagem com docker build, e rode um container baseado nela.",
    starter: () => {
      const s = baseState();
      s.dockerfile = DEFAULT_DOCKERFILE;
      return s;
    },
    missions: [
      { id: "edit", title: "Abra e revise o Dockerfile (clique no arquivo)", hint: "Clique em 'Dockerfile' à direita pra abrir o editor", check: (s) => (s as any)._dockerfileViewed === true },
      { id: "build", title: "Construa a imagem com tag 'meuapp'", hint: "docker build -t meuapp .", check: (s) => s.images.some((i) => i.name === "meuapp" && i.builtFromDockerfile) },
      { id: "run", title: "Rode um container da sua imagem", hint: "docker run -d --name meu meuapp", check: (s) => s.containers.some((c) => c.imageRef.startsWith("meuapp") && c.status === "running") },
    ],
  },
  {
    id: 3,
    title: "Portas & Volumes",
    briefing: "Containers ficam isolados do host por padrão. Pra acessá-los pelo navegador você mapeia portas (-p), e pra persistir dados além do ciclo de vida do container você usa volumes (-v).",
    starter: () => baseState(),
    missions: [
      { id: "pull", title: "Baixe a imagem do nginx", hint: "docker pull nginx", check: (s) => s.images.some((i) => i.name === "nginx") },
      { id: "port", title: "Rode nginx mapeando a porta 8080 do host para a 80 do container", hint: "docker run -d -p 8080:80 nginx", check: (s) => s.containers.some((c) => c.imageRef.startsWith("nginx") && c.status === "running" && c.ports.some((p) => p.host === 8080 && p.container === 80)) },
      { id: "curl", title: "Teste acessando: curl localhost:8080", hint: "curl localhost:8080", check: (s) => (s as any)._curled === true },
      { id: "volume", title: "Rode postgres com volume persistente em /var/lib/postgresql/data", hint: "docker pull postgres:16 && docker run -d -v dbdata:/var/lib/postgresql/data postgres:16", check: (s) => s.containers.some((c) => c.imageRef.startsWith("postgres") && c.volumes.length > 0) },
    ],
  },
  {
    id: 4,
    title: "Docker Compose",
    briefing: "Quando seu app tem múltiplos serviços (web + banco + cache), gerenciar tudo na mão vira um inferno. O docker-compose orquestra tudo via um arquivo YAML único.",
    starter: () => {
      const s = baseState();
      s.composeFile = DEFAULT_COMPOSE;
      return s;
    },
    missions: [
      { id: "view", title: "Abra o docker-compose.yml para entender a estrutura", hint: "Clique em 'docker-compose.yml'", check: (s) => (s as any)._composeViewed === true },
      { id: "up", title: "Suba todos os serviços", hint: "docker-compose up -d", check: (s) => s.composeUp === true },
      { id: "ps", title: "Liste os serviços rodando do compose", hint: "docker-compose ps", check: (s) => (s as any)._composePs === true },
      { id: "down", title: "Derrube todos os serviços", hint: "docker-compose down", check: (s) => s.composeUp === false && (s as any)._composeWasUp === true },
    ],
  },
];

export function DockerSimulator({ onBack }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing">("intro");
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set([0]));
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [state, setState] = useState<State>(() => LEVELS[0].starter());
  const [missionIdx, setMissionIdx] = useState(0);
  const [lines, setLines] = useState<Line[]>([
    { type: "info", text: "Docker Simulator iniciado. Digite 'help' para ver os comandos." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [editingFile, setEditingFile] = useState<"dockerfile" | "compose" | null>(null);
  const [editorContent, setEditorContent] = useState("");
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

  const loadLevel = (idx: number) => {
    setLevelIdx(idx);
    setState(LEVELS[idx].starter());
    setMissionIdx(0);
    setLines([
      { type: "info", text: `=== NÍVEL ${LEVELS[idx].id}: ${LEVELS[idx].title} ===` },
      { type: "info", text: LEVELS[idx].briefing },
    ]);
  };
  const resetLevel = () => loadLevel(levelIdx);

  const out = (text: string) => setLines((l) => [...l, { type: "out", text }]);
  const err = (text: string) => setLines((l) => [...l, { type: "err", text }]);
  const info = (text: string) => setLines((l) => [...l, { type: "info", text }]);

  const findContainer = (s: State, ref: string): Container | undefined =>
    s.containers.find((c) => c.id.startsWith(ref) || c.name === ref);

  const parseRunArgs = (args: string): { detach: boolean; name?: string; ports: { host: number; container: number }[]; volumes: { host: string; container: string }[]; image: string; command: string } | null => {
    const tokens = args.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
    let detach = false;
    let name: string | undefined;
    const ports: { host: number; container: number }[] = [];
    const volumes: { host: string; container: string }[] = [];
    let image = "";
    let cmd: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t === "-d" || t === "--detach") detach = true;
      else if (t === "--name") name = tokens[++i];
      else if (t === "-p" || t === "--publish") {
        const v = tokens[++i];
        const [h, c] = v.split(":").map(Number);
        ports.push({ host: h, container: c });
      } else if (t === "-v" || t === "--volume") {
        const v = tokens[++i];
        const [h, c] = v.split(":");
        volumes.push({ host: h, container: c });
      } else if (!image) image = t;
      else cmd.push(t);
    }
    if (!image) return null;
    return { detach, name, ports, volumes, image, command: cmd.join(" ") || "(default)" };
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { type: "in", text: `$ ${cmd}` }]);
    if (!cmd) return;
    if (cmd !== history[history.length - 1]) setHistory((h) => [...h, cmd]);
    setHistoryIdx(-1);

    if (cmd === "help") {
      out("Comandos suportados:");
      out("  docker pull <image>[:tag]       baixa imagem do registry");
      out("  docker images                   lista imagens locais");
      out("  docker run [-d] [--name x] [-p H:C] [-v H:C] <image>");
      out("  docker ps [-a]                  lista containers (-a inclui parados)");
      out("  docker stop <id|name>           para um container");
      out("  docker start <id|name>          inicia um container parado");
      out("  docker rm <id|name>             remove container parado");
      out("  docker rmi <image>              remove imagem local");
      out("  docker logs <id|name>           mostra logs do container");
      out("  docker exec <id|name> <cmd>     executa comando no container");
      out("  docker build -t <nome> .        constrói imagem do Dockerfile");
      out("  docker-compose up [-d] | down | ps");
      out("  curl localhost:<porta>          testa porta mapeada");
      out("  clear | reset | help");
      out("Atalhos: ↑/↓ histórico • Tab autocomplete • clique no Dockerfile/compose para editar");
      return;
    }
    if (cmd === "clear") { setLines([]); return; }
    if (cmd === "reset") { resetLevel(); return; }

    // curl localhost:<port>
    const curlMatch = cmd.match(/^curl\s+localhost:(\d+)$/);
    if (curlMatch) {
      const port = Number(curlMatch[1]);
      const c = state.containers.find((c) => c.status === "running" && c.ports.some((p) => p.host === port));
      if (!c) { err(`curl: (7) Failed to connect to localhost port ${port}: Connection refused`); return; }
      out(`<!DOCTYPE html>\n<html><body><h1>Welcome to nginx (container ${c.id.slice(0, 12)})</h1></body></html>`);
      setState((s) => ({ ...s, _curled: true } as any));
      return;
    }

    // docker-compose
    if (cmd.startsWith("docker-compose ") || cmd.startsWith("docker compose ")) {
      const sub = cmd.replace(/^docker[- ]compose\s+/, "");
      setState((s) => execCompose(s, sub, { out, err }) ?? s);
      return;
    }

    if (!cmd.startsWith("docker ")) { err(`comando não reconhecido: ${cmd}`); return; }
    const args = cmd.slice(7).trim();
    setState((s) => execDocker(s, args, { out, err, info }) ?? s);
  };

  const execDocker = (s: State, args: string, io: { out: (x: string) => void; err: (x: string) => void; info: (x: string) => void }): State | null => {
    const next: State = JSON.parse(JSON.stringify(s));

    // pull
    const pullMatch = args.match(/^pull\s+(\S+)$/);
    if (pullMatch) {
      const ref = pullMatch[1];
      const [name, tag = "latest"] = ref.split(":");
      const remote = s.registry.find((i) => i.name === name && i.tag === tag);
      if (!remote) { io.err(`Error: image '${ref}' not found in registry`); return null; }
      if (s.images.some((i) => i.name === name && i.tag === tag)) { io.out(`${name}:${tag} already up to date`); return null; }
      next.images.push({ ...remote });
      io.out(`Using default tag: ${tag}`);
      io.out(`${tag}: Pulling from library/${name}`);
      io.out(`Pulled image: ${name}:${tag} (${remote.size}, id: ${remote.id.slice(0, 12)})`);
      return next;
    }

    if (args === "images") {
      io.out("REPOSITORY        TAG       IMAGE ID       SIZE");
      if (!s.images.length) io.out("(nenhuma imagem local)");
      s.images.forEach((i) => io.out(`${i.name.padEnd(18)}${i.tag.padEnd(10)}${i.id.slice(0, 12).padEnd(15)}${i.size}`));
      return null;
    }

    // ps
    const psMatch = args.match(/^ps(\s+-a)?$/);
    if (psMatch) {
      const all = !!psMatch[1];
      const list = all ? s.containers : s.containers.filter((c) => c.status === "running");
      io.out("CONTAINER ID   IMAGE                 STATUS      PORTS              NAME");
      if (!list.length) io.out("(nenhum container)");
      list.forEach((c) => {
        const ports = c.ports.map((p) => `${p.host}->${p.container}/tcp`).join(", ") || "—";
        io.out(`${c.id.slice(0, 12).padEnd(15)}${c.imageRef.padEnd(22)}${c.status.padEnd(12)}${ports.padEnd(19)}${c.name}`);
      });
      (next as any)._listed = true;
      return next;
    }

    // run
    if (args.startsWith("run ") || args === "run") {
      const parsed = parseRunArgs(args.slice(3).trim());
      if (!parsed) { io.err("docker run: imagem obrigatória"); return null; }
      const [imgName, imgTag = "latest"] = parsed.image.split(":");
      let img = s.images.find((i) => i.name === imgName && i.tag === imgTag);
      if (!img) {
        const remote = s.registry.find((i) => i.name === imgName && i.tag === imgTag);
        if (!remote) { io.err(`Unable to find image '${parsed.image}' locally and not in registry`); return null; }
        io.out(`Unable to find image '${parsed.image}' locally`);
        io.out(`${imgTag}: Pulling from library/${imgName}`);
        next.images.push({ ...remote });
        img = remote;
      }
      const id = randId();
      const name = parsed.name ?? randName();
      if (s.containers.some((c) => c.name === name)) { io.err(`Conflict: container name '${name}' já em uso`); return null; }
      const container: Container = {
        id, name, imageRef: `${imgName}:${imgTag}`, command: parsed.command,
        status: "running", ports: parsed.ports, volumes: parsed.volumes, createdAt: Date.now(), logs: [`[${new Date().toISOString()}] Started container from ${imgName}:${imgTag}`],
      };
      next.containers.push(container);
      io.out(parsed.detach ? id : `${id}\n(running in foreground — Ctrl+C para sair)`);
      return next;
    }

    // stop
    const stopMatch = args.match(/^stop\s+(\S+)$/);
    if (stopMatch) {
      const c = findContainer(s, stopMatch[1]);
      if (!c) { io.err(`No such container: ${stopMatch[1]}`); return null; }
      const idx = next.containers.findIndex((x) => x.id === c.id);
      next.containers[idx] = { ...c, status: "stopped" };
      io.out(c.name);
      return next;
    }

    // start
    const startMatch = args.match(/^start\s+(\S+)$/);
    if (startMatch) {
      const c = findContainer(s, startMatch[1]);
      if (!c) { io.err(`No such container: ${startMatch[1]}`); return null; }
      const idx = next.containers.findIndex((x) => x.id === c.id);
      next.containers[idx] = { ...c, status: "running" };
      io.out(c.name);
      return next;
    }

    // rm
    const rmMatch = args.match(/^rm\s+(-f\s+)?(\S+)$/);
    if (rmMatch) {
      const force = !!rmMatch[1];
      const c = findContainer(s, rmMatch[2]);
      if (!c) { io.err(`No such container: ${rmMatch[2]}`); return null; }
      if (c.status === "running" && !force) { io.err(`Cannot remove running container ${c.name}. Pare antes ou use -f.`); return null; }
      next.containers = next.containers.filter((x) => x.id !== c.id);
      io.out(c.name);
      return next;
    }

    // rmi
    const rmiMatch = args.match(/^rmi\s+(\S+)$/);
    if (rmiMatch) {
      const ref = rmiMatch[1];
      const [n, t = "latest"] = ref.split(":");
      const img = s.images.find((i) => i.name === n && i.tag === t);
      if (!img) { io.err(`No such image: ${ref}`); return null; }
      if (s.containers.some((c) => c.imageRef === `${n}:${t}`)) { io.err(`Image ${ref} está em uso por containers — remova-os primeiro`); return null; }
      next.images = next.images.filter((i) => !(i.name === n && i.tag === t));
      io.out(`Untagged: ${n}:${t}\nDeleted: ${img.id.slice(0, 12)}`);
      return next;
    }

    // logs
    const logsMatch = args.match(/^logs\s+(\S+)$/);
    if (logsMatch) {
      const c = findContainer(s, logsMatch[1]);
      if (!c) { io.err(`No such container: ${logsMatch[1]}`); return null; }
      c.logs.forEach((l) => io.out(l));
      return null;
    }

    // exec
    const execMatch = args.match(/^exec\s+(?:-it\s+)?(\S+)\s+(.+)$/);
    if (execMatch) {
      const c = findContainer(s, execMatch[1]);
      if (!c) { io.err(`No such container: ${execMatch[1]}`); return null; }
      if (c.status !== "running") { io.err(`Container ${c.name} não está rodando`); return null; }
      const command = execMatch[2];
      if (command === "ls" || command === "ls /") io.out("bin  dev  etc  home  lib  opt  proc  root  sbin  tmp  usr  var");
      else if (command.startsWith("echo ")) io.out(command.slice(5).replace(/["']/g, ""));
      else if (command === "whoami") io.out("root");
      else if (command === "uname -a") io.out("Linux container 5.15.0 #1 SMP x86_64 GNU/Linux");
      else io.out(`(simulado) ${command}`);
      return null;
    }

    // build
    const buildMatch = args.match(/^build\s+-t\s+(\S+)\s+\.$/);
    if (buildMatch) {
      if (!s.dockerfile.trim()) { io.err("Erro: nenhum Dockerfile encontrado. Edite o arquivo primeiro."); return null; }
      const ref = buildMatch[1];
      const [n, t = "latest"] = ref.split(":");
      const lines = s.dockerfile.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
      io.out(`Sending build context to Docker daemon ...`);
      lines.forEach((l, i) => io.out(`Step ${i + 1}/${lines.length} : ${l.trim()}`));
      const id = randId();
      next.images = next.images.filter((i) => !(i.name === n && i.tag === t));
      next.images.push({ name: n, tag: t, id, size: "287MB", builtFromDockerfile: true });
      io.out(`Successfully built ${id.slice(0, 12)}`);
      io.out(`Successfully tagged ${n}:${t}`);
      return next;
    }

    io.err(`docker: '${args}' não suportado neste simulador. Use 'help'.`);
    return null;
  };

  const execCompose = (s: State, sub: string, io: { out: (x: string) => void; err: (x: string) => void }): State | null => {
    const next: State = JSON.parse(JSON.stringify(s));
    if (sub === "up" || sub === "up -d" || sub === "up --detach") {
      if (!s.composeFile.trim()) { io.err("Erro: docker-compose.yml não encontrado"); return null; }
      // parse rough: pegar service names após "services:"
      const services: string[] = [];
      let inServices = false;
      s.composeFile.split("\n").forEach((line) => {
        if (/^services:/.test(line)) inServices = true;
        else if (/^\w/.test(line) && !line.startsWith(" ")) inServices = false;
        else if (inServices) {
          const m = line.match(/^  (\w+):/);
          if (m) services.push(m[1]);
        }
      });
      if (!services.length) { io.err("Erro: nenhum serviço encontrado no compose"); return null; }
      services.forEach((svc) => {
        const id = randId();
        next.containers.push({
          id, name: `proj_${svc}_1`, imageRef: svc === "web" ? "nginx:latest" : svc === "db" ? "postgres:16" : "alpine:latest",
          command: "(default)", status: "running", ports: svc === "web" ? [{ host: 8080, container: 80 }] : [], volumes: svc === "db" ? [{ host: "dbdata", container: "/var/lib/postgresql/data" }] : [],
          createdAt: Date.now(), logs: [`Started ${svc}`],
        });
        io.out(`Creating proj_${svc}_1 ... done`);
      });
      next.composeUp = true;
      next.composeProject = "proj";
      (next as any)._composeWasUp = true;
      return next;
    }
    if (sub === "down") {
      if (!s.composeUp) { io.err("Compose não está rodando"); return null; }
      next.containers = next.containers.filter((c) => !c.name.startsWith("proj_"));
      next.composeUp = false;
      io.out("Stopping proj_web_1 ... done");
      io.out("Stopping proj_db_1 ... done");
      io.out("Removing networks ... done");
      return next;
    }
    if (sub === "ps") {
      io.out("NAME            IMAGE              STATUS    PORTS");
      const cs = s.containers.filter((c) => c.name.startsWith("proj_"));
      if (!cs.length) io.out("(nada rodando do compose)");
      cs.forEach((c) => io.out(`${c.name.padEnd(16)}${c.imageRef.padEnd(19)}${c.status.padEnd(10)}${c.ports.map((p) => `${p.host}->${p.container}`).join(",") || "—"}`));
      (next as any)._composePs = true;
      return next;
    }
    io.err(`docker-compose: '${sub}' não suportado.`);
    return null;
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
        "docker pull nginx", "docker pull postgres:16", "docker pull node:20",
        "docker images", "docker ps", "docker ps -a",
        "docker run -d nginx", "docker run -d -p 8080:80 nginx",
        "docker run -d --name meu meuapp",
        "docker stop ", "docker start ", "docker rm ", "docker rmi ",
        "docker logs ", "docker exec -it ",
        "docker build -t meuapp .",
        "docker-compose up -d", "docker-compose down", "docker-compose ps",
        "curl localhost:8080",
        "help", "clear", "reset",
      ];
      const matches = completions.filter((c) => c.startsWith(input));
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1) info("Sugestões: " + matches.join(" | "));
    }
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); run(input); setInput(""); };

  const openEditor = (which: "dockerfile" | "compose") => {
    setEditingFile(which);
    setEditorContent(which === "dockerfile" ? state.dockerfile : state.composeFile);
    setState((s) => ({ ...s, [which === "dockerfile" ? "_dockerfileViewed" : "_composeViewed"]: true } as any));
  };
  const saveEditor = () => {
    if (!editingFile) return;
    setState((s) => ({ ...s, [editingFile === "dockerfile" ? "dockerfile" : "composeFile"]: editorContent }));
    setLines((l) => [...l, { type: "info", text: `[editor] '${editingFile === "dockerfile" ? "Dockerfile" : "docker-compose.yml"}' salvo.` }]);
    setEditingFile(null);
  };

  // ---------- Intro screen ----------
  if (phase === "intro") {
    const levelStyles = [
      { border: "border-sky-500/20", bg: "bg-sky-500/10", borderInner: "border-sky-500/30", text: "text-sky-400" },
      { border: "border-emerald-500/20", bg: "bg-emerald-500/10", borderInner: "border-emerald-500/30", text: "text-emerald-400" },
      { border: "border-amber-500/20", bg: "bg-amber-500/10", borderInner: "border-amber-500/30", text: "text-amber-400" },
      { border: "border-fuchsia-500/20", bg: "bg-fuchsia-500/10", borderInner: "border-fuchsia-500/30", text: "text-fuchsia-400" },
    ];
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/images/infrastructure_bg.png" 
            alt="Infrastructure" 
            className="w-full h-full object-cover opacity-[0.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-slate-950" />
        </div>

        <div className="relative z-10 px-6 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-16 space-y-10">
          <div className="text-center pt-6">
            <div className="inline-flex p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-5">
              <ContainerIcon className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">Docker Simulator</h1>
            <p className="text-sky-400 font-mono text-sm uppercase tracking-[0.3em] mb-6">Containerize sem dor de cabeça</p>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Aprenda Docker digitando comandos reais. Sem instalar Docker, sem WSL, sem configuração — tudo simulado no navegador. Veja imagens sendo baixadas, containers ligando, portas mapeadas e volumes persistindo.
            </p>
          </div>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Por que Docker?
            </h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                <Boxes className="w-5 h-5 text-sky-400 mb-2" />
                <p className="text-base font-bold text-white mb-1">"Funciona na minha máquina"</p>
                <p className="text-sm text-slate-400 leading-relaxed">Empacota seu app + dependências numa caixa portátil que roda igual em qualquer lugar.</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                <Server className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-base font-bold text-white mb-1">Deploy descomplicado</p>
                <p className="text-sm text-slate-400 leading-relaxed">"Build once, run anywhere". A mesma imagem vai do laptop pro servidor sem surpresas.</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                <Layers className="w-5 h-5 text-fuchsia-400 mb-2" />
                <p className="text-base font-bold text-white mb-1">Isolamento</p>
                <p className="text-sm text-slate-400 leading-relaxed">Rode 5 versões diferentes de Node ou Postgres na mesma máquina sem conflitos.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Imagem vs Container
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-slate-900/60 border border-sky-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-sky-400 text-sm font-bold uppercase tracking-widest mb-3">
                  <Package className="w-3.5 h-3.5" /> Imagem (template)
                </div>
                <p className="text-base text-slate-300 leading-relaxed mb-3">Receita imutável e somente-leitura. Define qual SO, quais arquivos e qual comando rodar. Você baixa do Docker Hub ou constrói via Dockerfile.</p>
                <p className="text-xs text-slate-500 font-mono">Estática · Versionada por tag · Compartilhável</p>
              </div>
              <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-widest mb-3">
                  <ContainerIcon className="w-3.5 h-3.5" /> Container (instância)
                </div>
                <p className="text-base text-slate-300 leading-relaxed mb-3">Processo isolado rodando a partir de uma imagem. É descartável: você pode parar, reiniciar, deletar e criar dezenas a partir da mesma imagem.</p>
                <p className="text-xs text-slate-500 font-mono">Dinâmico · Tem estado · Efêmero</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-3 text-center italic">Analogia: Imagem é a classe, Container é a instância. Ou: Imagem é a receita, Container é o bolo assado.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-4 flex items-center gap-2">
              <Network className="w-4 h-4" /> Como tudo se conecta
            </h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
              <div className="grid md:grid-cols-4 gap-3 items-center text-center">
                <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl p-3">
                  <Cloud className="w-6 h-6 text-fuchsia-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-white">Docker Hub</p>
                  <p className="text-[10px] text-slate-500 mt-1">Registry público</p>
                </div>
                <div className="text-slate-600 font-mono text-xs hidden md:block">docker pull →</div>
                <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-3">
                  <Package className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-white">Imagens Locais</p>
                  <p className="text-[10px] text-slate-500 mt-1">No seu disco</p>
                </div>
                <div className="text-slate-600 font-mono text-xs hidden md:block">docker run →</div>
              </div>
              <div className="grid md:grid-cols-4 gap-3 items-center text-center mt-3">
                <div></div>
                <div></div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                  <ContainerIcon className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-white">Containers</p>
                  <p className="text-[10px] text-slate-500 mt-1">Rodando ou parados</p>
                </div>
                <div></div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Glossário rápido
            </h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl divide-y divide-white/5">
              {[
                { t: "Imagem", d: "Template imutável. Identificada por nome:tag (ex: nginx:latest).", c: "text-sky-300" },
                { t: "Container", d: "Instância em execução de uma imagem. Tem ID único e status (running/stopped).", c: "text-emerald-300" },
                { t: "Dockerfile", d: "Arquivo de receita usado pelo 'docker build' para construir uma imagem customizada.", c: "text-amber-300" },
                { t: "Tag", d: "Versão de uma imagem (latest, 1.2, alpine). Permite ter múltiplas versões coexistindo.", c: "text-fuchsia-300" },
                { t: "Registry", d: "Servidor que hospeda imagens. O Docker Hub é o registry padrão e público.", c: "text-cyan-300" },
                { t: "Volume", d: "Pasta persistente fora do container — sobrevive a stops/removes. Usado para dados.", c: "text-violet-300" },
                { t: "Port mapping", d: "Conecta uma porta do host (-p 8080) com uma porta do container (:80) para acesso externo.", c: "text-rose-300" },
                { t: "docker-compose", d: "Ferramenta para orquestrar múltiplos containers via um arquivo YAML único.", c: "text-pink-300" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <span className={`text-sm font-bold font-mono ${item.c} min-w-[160px] pt-0.5`}>{item.t}</span>
                  <span className="text-sm text-slate-400 leading-relaxed flex-1">{item.d}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-4 flex items-center gap-2">
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

          <section className="bg-gradient-to-br from-sky-900/10 via-slate-900/40 to-emerald-900/10 border border-sky-500/20 rounded-2xl p-5">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Dicas do simulador
            </h2>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>• Digite <code className="text-sky-300 font-mono">help</code> a qualquer momento para ver todos os comandos</li>
              <li>• Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">↑</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">↓</kbd> para histórico e <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">Tab</kbd> para autocompletar</li>
              <li>• Clique no <code className="text-amber-300 font-mono">Dockerfile</code> ou <code className="text-amber-300 font-mono">docker-compose.yml</code> para abrir o editor (níveis 2 e 4)</li>
              <li>• <code className="text-sky-300 font-mono">curl localhost:&lt;porta&gt;</code> testa portas mapeadas — o simulador devolve a resposta</li>
              <li>• <code className="text-sky-300 font-mono">reset</code> reinicia o nível atual; <code className="text-sky-300 font-mono">clear</code> limpa o terminal</li>
            </ul>
          </section>

          <div className="flex flex-col items-center gap-3 pt-4">
            <Button onClick={() => setPhase("playing")} size="lg" className="bg-sky-400 text-slate-950 hover:bg-sky-300 font-black uppercase tracking-widest px-10 py-6 text-base">
              Iniciar Treinamento <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
            </Button>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Pronto em ~30 minutos · Sem cadastro · Tudo no seu navegador</p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Simulator ----------
  const running = state.containers.filter((c) => c.status === "running");
  const stopped = state.containers.filter((c) => c.status === "stopped");
  const showDockerfile = level.id === 2;
  const showCompose = level.id === 4;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/assets/images/infrastructure_bg.png" 
          alt="Infrastructure" 
          className="w-full h-full object-cover opacity-[0.05]"
        />
        <div className="absolute inset-0 bg-slate-950/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <ContainerIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Docker Simulator</h2>
              <p className="text-[10px] text-sky-400 font-mono uppercase tracking-[0.2em]">Containerize sem dor de cabeça</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetLevel} className="text-slate-400 hover:text-white text-xs">Reset Nível</Button>
        </div>

        {/* Level selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {LEVELS.map((lv, i) => {
            const isUnlocked = unlocked.has(i);
            const isDone = completed.has(i);
            const isCurrent = i === levelIdx;
            return (
              <button
                key={lv.id}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && loadLevel(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                  isCurrent ? "bg-sky-500/20 border-sky-400 text-sky-300" :
                  isDone ? "bg-sky-500/5 border-sky-500/30 text-sky-400 hover:bg-sky-500/10" :
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

        {/* Briefing */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-sky-400 font-mono mb-1">Briefing do Nível {level.id}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{level.briefing}</p>
          </div>
        </div>

        {/* Mission bar */}
        <div className={`rounded-2xl p-4 border mb-4 ${levelDone ? "bg-emerald-500/10 border-emerald-500/40" : "bg-sky-500/10 border-sky-500/30"}`}>
          <div className="flex items-center gap-3">
            {levelDone ? <Trophy className="w-6 h-6 text-emerald-400 shrink-0" /> :
              <div className="w-6 h-6 rounded-full bg-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">{missionIdx + 1}</div>}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                {levelDone ? `Nível ${level.id} concluído` : `Nível ${level.id} • Missão ${missionIdx + 1} de ${level.missions.length}`}
              </p>
              <p className="text-sm font-bold text-white">{levelDone ? "Avance para o próximo nível!" : mission.title}</p>
              {!levelDone && <p className="text-xs text-slate-400 font-mono mt-0.5">Dica: <span className="text-sky-300">{mission.hint}</span></p>}
            </div>
            {levelDone && levelIdx + 1 < LEVELS.length && (
              <Button size="sm" onClick={() => loadLevel(levelIdx + 1)} className="bg-sky-400 text-slate-950 hover:bg-sky-300 font-bold text-xs">
                Próximo Nível →
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Top: registry + local images + containers */}
          <div className="grid lg:grid-cols-3 gap-4">

            {/* Registry */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-fuchsia-400">
                <Cloud className="w-4 h-4" />
                <h5 className="text-xs font-bold uppercase tracking-widest">Docker Hub (Registry)</h5>
              </div>
              <div className="space-y-1 max-h-44 overflow-auto">
                {state.registry.map((i) => {
                  const local = state.images.some((l) => l.name === i.name && l.tag === i.tag);
                  return (
                    <div key={i.name + i.tag} className={`flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded border ${local ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" : "bg-slate-950/50 border-white/5 text-slate-400"}`}>
                      <span>{i.name}:{i.tag}</span>
                      <span className="text-[10px] text-slate-500">{local ? "✓ baixada" : i.size}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Local images */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-sky-400">
                <Package className="w-4 h-4" />
                <h5 className="text-xs font-bold uppercase tracking-widest">Imagens Locais ({state.images.length})</h5>
              </div>
              <div className="space-y-1 max-h-44 overflow-auto">
                {state.images.length === 0 && <p className="text-[11px] text-slate-600 italic">(nenhuma imagem baixada)</p>}
                {state.images.map((i) => (
                  <div key={i.id} className="flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded bg-slate-950/50 border border-white/5">
                    <span className="text-sky-300">{i.name}:{i.tag}</span>
                    <span className="text-[10px] text-slate-500">{i.id.slice(0, 7)} · {i.size}{i.builtFromDockerfile ? " · 🔨" : ""}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Containers */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <ContainerIcon className="w-4 h-4" />
                <h5 className="text-xs font-bold uppercase tracking-widest">Containers</h5>
              </div>
              <div className="space-y-1 max-h-44 overflow-auto">
                {running.length === 0 && stopped.length === 0 && <p className="text-[11px] text-slate-600 italic">(nenhum container)</p>}
                {running.map((c) => (
                  <div key={c.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded p-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-500">{c.id.slice(0, 7)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{c.imageRef}</div>
                    {c.ports.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-300">
                        <Network className="w-3 h-3" />
                        {c.ports.map((p) => `${p.host}:${p.container}`).join(", ")}
                      </div>
                    )}
                    {c.volumes.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-violet-300">
                        <HardDrive className="w-3 h-3" />
                        {c.volumes.map((v) => `${v.host}→${v.container}`).join(", ")}
                      </div>
                    )}
                  </div>
                ))}
                {stopped.map((c) => (
                  <div key={c.id} className="bg-slate-950/50 border border-white/5 rounded p-2 text-xs font-mono opacity-60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-600">stopped</span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{c.imageRef}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Files (Dockerfile / compose) */}
          {(showDockerfile || showCompose) && (
            <div className="grid gap-4">
              <button
                onClick={() => openEditor(showDockerfile ? "dockerfile" : "compose")}
                className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-4 text-left hover:bg-slate-900/80 hover:border-amber-500/50 transition-all"
              >
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <FileCode className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{showDockerfile ? "Dockerfile" : "docker-compose.yml"}</span>
                  <span className="ml-auto text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> clique para editar
                  </span>
                </div>
                <pre className="text-[11px] text-slate-400 font-mono whitespace-pre-wrap line-clamp-6">
                  {showDockerfile ? state.dockerfile : state.composeFile}
                </pre>
              </button>
            </div>
          )}

          {/* Terminal */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="bg-slate-950 border border-sky-500/30 rounded-2xl overflow-hidden flex flex-col h-96 cursor-text shadow-[0_0_30px_-10px_rgba(56,189,248,0.4)] focus-within:border-sky-400 focus-within:shadow-[0_0_40px_-10px_rgba(56,189,248,0.7)] transition-all"
          >
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-slate-900/80">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-[11px] text-slate-500 font-mono flex-1">~/projeto $</span>
              <span className="text-[10px] text-sky-400 font-mono uppercase tracking-widest animate-pulse">● digite aqui</span>
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
                <span className="text-sky-400 font-bold">$</span>
                <input ref={inputRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck={false} autoComplete="off"
                  placeholder="docker pull nginx"
                  className="flex-1 bg-transparent outline-none text-white caret-sky-400 placeholder:text-slate-600 placeholder:italic" />
                <span className="w-2 h-4 bg-sky-400 animate-pulse" aria-hidden />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* File editor */}
      <AnimatePresence>
        {editingFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2 font-mono text-sm">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  {editingFile === "dockerfile" ? "Dockerfile" : "docker-compose.yml"}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingFile(null)} className="text-slate-400 rounded-full"><X className="w-4 h-4" /></Button>
              </div>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                spellCheck={false}
                className="w-full h-96 bg-slate-950 text-slate-100 font-mono text-sm p-4 outline-none resize-none"
              />
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-white/10 bg-slate-900">
                <Button variant="ghost" size="sm" onClick={() => setEditingFile(null)} className="text-slate-400">Cancelar</Button>
                <Button size="sm" onClick={saveEditor} className="bg-sky-400 text-slate-950 hover:bg-sky-300 font-bold">
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
