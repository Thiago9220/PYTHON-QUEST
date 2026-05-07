import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, X, Save, Edit3, Lock, Trophy, ChevronDown, BookOpen, Lightbulb,
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
  defaultEnv?: Record<string, string>;
  exposedPort?: number;
}

interface Container {
  id: string;
  imageRef: string;
  name: string;
  command: string;
  status: "running" | "stopped";
  ports: { host: number; container: number }[];
  volumes: { host: string; container: string }[];
  env: Record<string, string>;
  network: string;
  workdir?: string;
  autoRemove?: boolean;
  restartPolicy?: "no" | "always" | "on-failure" | "unless-stopped";
  createdAt: number;
  logs: string[];
}

interface Volume {
  name: string;
  driver: string;
  mountpoint: string;
  createdAt: number;
}

interface Network {
  id: string;
  name: string;
  driver: string;
  scope: string;
  createdAt: number;
}

interface State {
  registry: Image[];
  images: Image[];
  containers: Container[];
  volumes: Volume[];
  networks: Network[];
  dockerfile: string;
  composeFile: string;
  composeUp: boolean;
  composeProject: string;
  loggedIn?: string;
  buildAnimation?: { steps: string[]; isMultiStage: boolean; finalSize: string; ts: number };
}

interface LevelDef {
  id: number;
  title: string;
  briefing: string;
  starter: () => State;
  missions: { id: string; title: string; hint: string; check: (s: State) => boolean }[];
}

const randId = () => Math.random().toString(16).slice(2, 14);

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

// Completions contextuais — o que sugerir depende do que já está digitado e do estado real.
const computeCompletions = (input: string, s: any): string[] => {
  const trimmed = input;
  const ends = trimmed.endsWith(" ");
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const last = ends ? "" : (tokens[tokens.length - 1] ?? "");
  const head = ends ? tokens.join(" ") : tokens.slice(0, -1).join(" ");

  const containerNames = (s.containers as Container[]).map((c) => c.name);
  const runningNames = (s.containers as Container[]).filter((c) => c.status === "running").map((c) => c.name);
  const stoppedNames = (s.containers as Container[]).filter((c) => c.status === "stopped").map((c) => c.name);
  const localImages = (s.images as Image[]).map((i) => `${i.name}:${i.tag}`);
  const registryImages = (s.registry as Image[]).map((i) => `${i.name}:${i.tag}`);
  const volumeNames = (s.volumes as Volume[]).map((v) => v.name);
  const networkNames = (s.networks as Network[]).map((n) => n.name);

  const suggestFor = (pool: string[], prefix: string) =>
    pool.filter((x) => x.startsWith(prefix)).map((x) => `${head} ${x}`.trim());

  // Casos contextuais: head === comando que espera um alvo
  if (head === "docker stop" || head === "docker restart" || head === "docker pause") return suggestFor(runningNames, last);
  if (head === "docker start") return suggestFor(stoppedNames, last);
  if (head === "docker rm" || head === "docker rm -f") return suggestFor(containerNames, last);
  if (head === "docker logs" || head === "docker logs -f" || head === "docker logs --follow") return suggestFor(runningNames.concat(stoppedNames), last);
  if (head === "docker inspect") return suggestFor([...containerNames, ...localImages], last);
  if (head === "docker exec" || head === "docker exec -it" || head === "docker exec -i" || head === "docker exec -t") return suggestFor(runningNames, last);
  if (head === "docker rmi") return suggestFor(localImages, last);
  if (head === "docker pull") return suggestFor(registryImages, last);
  if (head === "docker push" || head === "docker history" || head === "docker tag") return suggestFor(localImages, last);
  if (/^docker tag \S+$/.test(head)) return suggestFor(localImages, last);

  // volume / network subcommands
  if (head === "docker volume rm" || head === "docker volume inspect") return suggestFor(volumeNames, last);
  if (head === "docker network rm" || head === "docker network inspect") return suggestFor(networkNames.filter((n) => !["bridge", "host", "none"].includes(n)), last);
  if (head === "docker network connect" || head === "docker network disconnect") return suggestFor(networkNames, last);
  if (/^docker network (connect|disconnect) \S+$/.test(head)) return suggestFor(containerNames, last);
  if (head === "docker volume") return suggestFor(["ls", "create", "rm", "inspect", "prune"], last);
  if (head === "docker network") return suggestFor(["ls", "create", "rm", "inspect", "connect", "disconnect", "prune"], last);

  if (head === "docker run" || /^docker run(\s+-[^\s]+)*$/.test(head)) return suggestFor(localImages.concat(registryImages), last);
  if (/--network$/.test(head)) return suggestFor(networkNames, last);

  // Caso geral: completar comando
  const baseCompletions = [
    "docker pull ", "docker images", "docker ps", "docker ps -a",
    "docker run -d ", "docker run -d -p 8080:80 ", "docker run -d --name ",
    "docker run -d -e ", "docker run -d --network ", "docker run -d --rm ",
    "docker stop ", "docker start ", "docker restart ", "docker rm ", "docker rm -f ", "docker rmi ",
    "docker logs ", "docker logs -f ", "docker inspect ", "docker exec -it ",
    "docker build -t meuapp .",
    "docker volume ls", "docker volume create ", "docker volume rm ", "docker volume inspect ", "docker volume prune",
    "docker network ls", "docker network create ", "docker network rm ", "docker network inspect ",
    "docker network connect ", "docker network disconnect ",
    "docker tag ", "docker push ", "docker history ", "docker login ",
    "docker stats", "docker system prune", "docker system prune -a", "docker system df",
    "docker-compose up -d", "docker-compose down", "docker-compose ps",
    "curl localhost:8080",
    "help", "clear", "reset",
  ];
  return baseCompletions.filter((c) => c.startsWith(trimmed));
};
const randName = () => {
  const a = ["happy", "brave", "clever", "eager", "fierce", "gentle", "jolly", "kind", "lucky", "merry"];
  const b = ["einstein", "tesla", "curie", "darwin", "newton", "lovelace", "turing", "hopper", "knuth", "ritchie"];
  return `${a[Math.floor(Math.random() * a.length)]}_${b[Math.floor(Math.random() * b.length)]}`;
};

const REGISTRY_BASE: Image[] = [
  { name: "nginx", tag: "latest", id: randId(), size: "142MB" },
  { name: "nginx", tag: "alpine", id: randId(), size: "23MB" },
  { name: "node", tag: "20", id: randId(), size: "996MB" },
  { name: "node", tag: "20-alpine", id: randId(), size: "150MB" },
  { name: "node", tag: "20-slim", id: randId(), size: "240MB" },
  { name: "python", tag: "3.12", id: randId(), size: "1.02GB" },
  { name: "python", tag: "3.12-alpine", id: randId(), size: "55MB" },
  { name: "postgres", tag: "16", id: randId(), size: "425MB" },
  { name: "redis", tag: "7", id: randId(), size: "117MB" },
  { name: "redis", tag: "7-alpine", id: randId(), size: "32MB" },
  { name: "alpine", tag: "latest", id: randId(), size: "7MB" },
];

const DEFAULT_NETWORKS: Network[] = [
  { id: "br0bridge001", name: "bridge", driver: "bridge", scope: "local", createdAt: Date.now() },
  { id: "ho0host00001", name: "host", driver: "host", scope: "local", createdAt: Date.now() },
  { id: "no0none00001", name: "none", driver: "null", scope: "local", createdAt: Date.now() },
];

const baseState = (): State => ({
  registry: [...REGISTRY_BASE],
  images: [],
  containers: [],
  volumes: [],
  networks: [...DEFAULT_NETWORKS],
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
  {
    id: 5,
    title: "Container Quebrado: Debug Real",
    briefing: "Subiu pra produção e o site não responde. Você não tem acesso ao código — só ao Docker. Use 'docker ps -a', 'docker logs' e 'docker inspect' pra descobrir o que deu errado, mate o container quebrado e suba a versão correta.",
    starter: () => {
      const s = baseState();
      // pré-popular nginx (já foi pulled em algum momento)
      const nginxImg = REGISTRY_BASE.find((i) => i.name === "nginx" && i.tag === "latest")!;
      s.images.push({ ...nginxImg });
      // container "site_quebrado": deveria estar em 8080:80, mas o pipeline deployou em 8081:81
      const brokenId = "9b4d2a771e3c";
      s.containers.push({
        id: brokenId,
        name: "site_quebrado",
        imageRef: "nginx:latest",
        command: "(default)",
        status: "running",
        ports: [{ host: 8081, container: 81 }],
        volumes: [],
        env: { EXPECTED_PORT: "8080", DEPLOYED_BY: "ci-pipeline", APP_VERSION: "v1.2.3" },
        network: "bridge",
        createdAt: Date.now() - 1000 * 60 * 8,
        logs: [
          "[INFO] starting nginx 1.25",
          "[INFO] using configuration from /etc/nginx/nginx.conf",
          "[WARN] EXPECTED_PORT=8080 mas mapeamento foi sobrescrito para 81",
          "[ERROR] nginx: [emerg] bind() to 0.0.0.0:81 failed — porta destino divergente do esperado pelo serviço (80)",
          "[INFO] worker process started — sem clientes conectados nos últimos 8min",
        ],
      });
      return s;
    },
    missions: [
      {
        id: "ps_a",
        title: "Liste TODOS os containers (rodando ou não): docker ps -a",
        hint: "docker ps -a",
        check: (s) => (s as any)._listed === true,
      },
      {
        id: "logs",
        title: "Veja os logs do container 'site_quebrado'",
        hint: "docker logs site_quebrado",
        check: (s) => (s as any)._inspectedSiteQuebrado || (s as any)._loggedSiteQuebrado === true,
      },
      {
        id: "inspect",
        title: "Inspecione o container — confirme a porta mapeada",
        hint: "docker inspect site_quebrado",
        check: (s) => (s as any)._inspectedSiteQuebrado === true,
      },
      {
        id: "stop_broken",
        title: "Pare o container quebrado",
        hint: "docker stop site_quebrado",
        check: (s) => s.containers.some((c) => c.name === "site_quebrado" && c.status === "stopped"),
      },
      {
        id: "rm_broken",
        title: "Remova o container parado",
        hint: "docker rm site_quebrado",
        check: (s) => !s.containers.some((c) => c.name === "site_quebrado"),
      },
      {
        id: "run_correct",
        title: "Suba um nginx novo na porta correta (8080:80)",
        hint: "docker run -d -p 8080:80 --name site nginx",
        check: (s) => s.containers.some((c) => c.name !== "site_quebrado" && c.imageRef.startsWith("nginx") && c.status === "running" && c.ports.some((p) => p.host === 8080 && p.container === 80)),
      },
      {
        id: "verify",
        title: "Confirme que o site responde",
        hint: "curl localhost:8080",
        check: (s) => (s as any)._curled === true,
      },
    ],
  },
  {
    id: 6,
    title: "Variáveis & Configuração",
    briefing: "Containers são imutáveis — então toda config (senha do banco, URL de API, modo dev/prod) entra via variáveis de ambiente. Aprenda a injetar com -e, ler com 'docker inspect' e definir defaults via ENV no Dockerfile.",
    starter: () => baseState(),
    missions: [
      {
        id: "pull_pg",
        title: "Baixe a imagem do postgres:16",
        hint: "docker pull postgres:16",
        check: (s) => s.images.some((i) => i.name === "postgres" && i.tag === "16"),
      },
      {
        id: "run_with_env",
        title: "Rode postgres passando POSTGRES_PASSWORD=secret e POSTGRES_DB=app",
        hint: "docker run -d --name db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app postgres:16",
        check: (s) => s.containers.some((c) =>
          c.imageRef.startsWith("postgres") && c.status === "running" &&
          c.env.POSTGRES_PASSWORD === "secret" && c.env.POSTGRES_DB === "app"),
      },
      {
        id: "inspect_env",
        title: "Inspecione e confirme as variáveis de ambiente",
        hint: "docker inspect db",
        check: (s) => (s as any)._inspectedEnvDb === true,
      },
      {
        id: "exec_env",
        title: "Entre no container e leia as variáveis: docker exec db env",
        hint: "docker exec db env",
        check: (s) => (s as any)._execEnvSeen === true,
      },
    ],
  },
  {
    id: 7,
    title: "Volumes Nomeados: Persistência",
    briefing: "Containers são descartáveis: tudo que você grava dentro some quando ele é removido. Volumes nomeados são pastas gerenciadas pelo Docker que sobrevivem ao ciclo de vida do container — é assim que bancos de dados não perdem dados.",
    starter: () => {
      const s = baseState();
      const pgImg = REGISTRY_BASE.find((i) => i.name === "postgres" && i.tag === "16")!;
      s.images.push({ ...pgImg });
      return s;
    },
    missions: [
      {
        id: "create_vol",
        title: "Crie um volume nomeado chamado 'pgdata'",
        hint: "docker volume create pgdata",
        check: (s) => s.volumes.some((v) => v.name === "pgdata"),
      },
      {
        id: "list_vol",
        title: "Liste os volumes para confirmar",
        hint: "docker volume ls",
        check: (s) => (s as any)._listedVolumes === true,
      },
      {
        id: "run_with_vol",
        title: "Rode postgres montando 'pgdata' em /var/lib/postgresql/data e com senha",
        hint: "docker run -d --name db -e POSTGRES_PASSWORD=x -v pgdata:/var/lib/postgresql/data postgres:16",
        check: (s) => s.containers.some((c) =>
          c.imageRef.startsWith("postgres") && c.status === "running" &&
          c.volumes.some((v) => v.host === "pgdata" && v.container === "/var/lib/postgresql/data")),
      },
      {
        id: "destroy_ctr",
        title: "Pare e remova o container — os dados devem sobreviver",
        hint: "docker stop db   (depois)   docker rm db",
        check: (s) => !s.containers.some((c) => c.name === "db") && s.volumes.some((v) => v.name === "pgdata"),
      },
      {
        id: "recreate",
        title: "Recrie o container montando o MESMO volume — prova a persistência",
        hint: "docker run -d --name db2 -e POSTGRES_PASSWORD=x -v pgdata:/var/lib/postgresql/data postgres:16",
        check: (s) => s.containers.some((c) =>
          c.name === "db2" && c.volumes.some((v) => v.host === "pgdata")),
      },
    ],
  },
  {
    id: 8,
    title: "Redes Customizadas: Containers se Conversando",
    briefing: "Por padrão, containers ficam isolados na rede 'bridge' e só falam por IP cru. Quando você cria uma network customizada, o Docker liga um DNS interno: containers passam a se chamar pelo NOME. É assim que web → db funciona em produção.",
    starter: () => {
      const s = baseState();
      s.images.push({ ...REGISTRY_BASE.find((i) => i.name === "postgres" && i.tag === "16")! });
      s.images.push({ ...REGISTRY_BASE.find((i) => i.name === "alpine" && i.tag === "latest")! });
      return s;
    },
    missions: [
      {
        id: "create_net",
        title: "Crie uma network customizada chamada 'app-net'",
        hint: "docker network create app-net",
        check: (s) => s.networks.some((n) => n.name === "app-net"),
      },
      {
        id: "run_db",
        title: "Rode postgres na rede 'app-net' com nome 'db'",
        hint: "docker run -d --name db --network app-net -e POSTGRES_PASSWORD=x postgres:16",
        check: (s) => s.containers.some((c) => c.name === "db" && c.network === "app-net" && c.status === "running"),
      },
      {
        id: "run_app",
        title: "Rode um container alpine na MESMA rede com nome 'app'",
        hint: "docker run -d --name app --network app-net alpine sleep 3600",
        check: (s) => s.containers.some((c) => c.name === "app" && c.network === "app-net" && c.status === "running"),
      },
      {
        id: "ping",
        title: "Do container 'app', faça ping em 'db' (DNS interno do Docker)",
        hint: "docker exec app ping -c 2 db",
        check: (s) => (s as any)._pingedDb === true,
      },
      {
        id: "inspect_net",
        title: "Inspecione a network e veja os 2 containers conectados",
        hint: "docker network inspect app-net",
        check: (s) => (s as any)._inspectedAppNet === true,
      },
    ],
  },
  {
    id: 9,
    title: "Multi-stage Build: Imagem Enxuta",
    briefing: "Imagens grandes são lentas pra deployar e custam armazenamento. Multi-stage build resolve isso: você usa uma imagem 'gorda' para compilar e descarta TUDO, copiando só o artefato final pra uma imagem mínima. Edite o Dockerfile, faça o build e veja o tamanho despencar.",
    starter: () => {
      const s = baseState();
      s.dockerfile = `# STAGE 1: builder — compila o app
FROM node:20 AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: runtime — só o que precisa
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
`;
      return s;
    },
    missions: [
      {
        id: "view",
        title: "Abra o Dockerfile e estude as 2 stages",
        hint: "Clique no arquivo Dockerfile",
        check: (s) => (s as any)._dockerfileViewed === true,
      },
      {
        id: "build",
        title: "Construa a imagem 'app:slim' a partir do Dockerfile multi-stage",
        hint: "docker build -t app:slim .",
        check: (s) => s.images.some((i) => i.name === "app" && i.tag === "slim" && i.builtFromDockerfile),
      },
      {
        id: "history",
        title: "Veja as layers da imagem com docker history",
        hint: "docker history app:slim",
        check: (s) => (s as any)._historiedAppSlim === true,
      },
      {
        id: "size",
        title: "Confirme que o tamanho ficou abaixo de 200MB (multi-stage funcionou)",
        hint: "docker images   (verifique o SIZE de app:slim)",
        check: (s) => {
          const img = s.images.find((i) => i.name === "app" && i.tag === "slim");
          if (!img) return false;
          const m = img.size.match(/^(\d+)MB/);
          return !!m && Number(m[1]) <= 200;
        },
      },
    ],
  },
  {
    id: 10,
    title: "Push & Versionamento",
    briefing: "Você buildou uma imagem incrível — agora precisa publicar pra o time. Aprenda o ciclo completo: tagear com versão semântica, autenticar no registry, fazer push e validar que ela chegou no Docker Hub.",
    starter: () => {
      const s = baseState();
      s.dockerfile = `FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json .
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
`;
      return s;
    },
    missions: [
      {
        id: "build",
        title: "Construa a imagem inicial 'meuapp:v1.0.0'",
        hint: "docker build -t meuapp:v1.0.0 .",
        check: (s) => s.images.some((i) => i.name === "meuapp" && i.tag === "v1.0.0"),
      },
      {
        id: "tag_latest",
        title: "Crie um alias 'meuapp:latest' apontando para a v1.0.0 (docker tag)",
        hint: "docker tag meuapp:v1.0.0 meuapp:latest",
        check: (s) => {
          const v1 = s.images.find((i) => i.name === "meuapp" && i.tag === "v1.0.0");
          const latest = s.images.find((i) => i.name === "meuapp" && i.tag === "latest");
          return !!v1 && !!latest && v1.id === latest.id;
        },
      },
      {
        id: "login",
        title: "Autentique no registry: docker login (use qualquer usuário)",
        hint: "docker login operador",
        check: (s) => !!s.loggedIn,
      },
      {
        id: "push_v1",
        title: "Faça push da v1.0.0 pro registry",
        hint: "docker push meuapp:v1.0.0",
        check: (s) => s.registry.some((i) => i.name === "meuapp" && i.tag === "v1.0.0"),
      },
      {
        id: "push_latest",
        title: "Faça push também da latest",
        hint: "docker push meuapp:latest",
        check: (s) => s.registry.some((i) => i.name === "meuapp" && i.tag === "latest"),
      },
    ],
  },
  {
    id: 11,
    title: "Boas Práticas & System Prune",
    briefing: "Última missão: você herdou um ambiente sujo cheio de containers parados, imagens dangling e volumes órfãos comendo disco. Limpe a casa com system prune e termine entendendo por que escolher 'alpine' ao invés de 'latest' importa em produção.",
    starter: () => {
      const s = baseState();
      // Pré-popular sujeira: imagens grandes + containers parados + volumes órfãos
      s.images.push({ ...REGISTRY_BASE.find((i) => i.name === "node" && i.tag === "20")! });
      s.images.push({ name: "legado", tag: "old", id: randId(), size: "780MB", builtFromDockerfile: true });
      s.containers.push({
        id: "deadc0de1234", name: "ctr_morto", imageRef: "legado:old", command: "(default)",
        status: "stopped", ports: [], volumes: [], env: {}, network: "bridge",
        createdAt: Date.now() - 1000 * 60 * 60 * 24, logs: ["[INFO] saiu com código 1"],
      });
      s.containers.push({
        id: "ghostc0de999", name: "ctr_zumbi", imageRef: "legado:old", command: "(default)",
        status: "stopped", ports: [], volumes: [], env: {}, network: "bridge",
        createdAt: Date.now() - 1000 * 60 * 60 * 12, logs: ["[INFO] saiu com código 0"],
      });
      s.volumes.push({ name: "vol_orfao", driver: "local", mountpoint: "/var/lib/docker/volumes/vol_orfao/_data", createdAt: Date.now() - 1000 * 60 * 60 * 48 });
      return s;
    },
    missions: [
      {
        id: "df",
        title: "Veja quanto disco está sendo usado",
        hint: "docker system df",
        check: (s) => (s as any)._dfSeen === true,
      },
      {
        id: "prune_basic",
        title: "Limpe containers parados, networks e volumes órfãos",
        hint: "docker system prune",
        check: (s) => !s.containers.some((c) => c.status === "stopped") && !s.volumes.some((v) => v.name === "vol_orfao"),
      },
      {
        id: "prune_all",
        title: "Use prune com -a para remover também imagens não usadas",
        hint: "docker system prune -a",
        check: (s) => !s.images.some((i) => i.name === "legado" && i.tag === "old"),
      },
      {
        id: "pull_alpine",
        title: "Baixe uma versão alpine do node (muito menor que :20)",
        hint: "docker pull node:20-alpine",
        check: (s) => s.images.some((i) => i.name === "node" && i.tag === "20-alpine"),
      },
      {
        id: "compare",
        title: "Compare os tamanhos com docker images — alpine é ~6x menor",
        hint: "docker images",
        check: (s) => (s as any)._comparedSizes === true,
      },
    ],
  },
];

export function DockerSimulator({ onBack }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing">(() => {
    return localStorage.getItem("docker_sim_intro_seen") ? "playing" : "intro";
  });
  const [introStep, setIntroStep] = useState(0);
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
  const [buildViz, setBuildViz] = useState<{ steps: string[]; isMultiStage: boolean; finalSize: string; revealed: number } | null>(null);
  const lastBuildTs = useRef<number>(0);
  const [editorContent, setEditorContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const level = LEVELS[levelIdx];
  const mission = level.missions[missionIdx];
  const levelDone = missionIdx >= level.missions.length;

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [lines]);
  useEffect(() => { if (phase === "playing") inputRef.current?.focus({ preventScroll: true }); }, [levelIdx, phase]);

  // Animação de layers ao buildar — empilha cada step com delay
  useEffect(() => {
    const ba = state.buildAnimation;
    if (!ba || ba.ts === lastBuildTs.current) return;
    lastBuildTs.current = ba.ts;
    setBuildViz({ steps: ba.steps, isMultiStage: ba.isMultiStage, finalSize: ba.finalSize, revealed: 0 });
    let i = 0;
    const tick = () => {
      i++;
      if (i > ba.steps.length) {
        // mantém visível por 4s após completar e desaparece
        setTimeout(() => setBuildViz(null), 4500);
        return;
      }
      setBuildViz((prev) => prev ? { ...prev, revealed: i } : prev);
      setTimeout(tick, 220);
    };
    setTimeout(tick, 100);
  }, [state.buildAnimation?.ts]);

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

  const parseRunArgs = (args: string): {
    detach: boolean; name?: string;
    ports: { host: number; container: number }[];
    volumes: { host: string; container: string }[];
    env: Record<string, string>;
    network?: string;
    workdir?: string;
    autoRemove: boolean;
    restartPolicy?: Container["restartPolicy"];
    image: string; command: string;
  } | null => {
    const tokens = args.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
    let detach = false;
    let name: string | undefined;
    let network: string | undefined;
    let workdir: string | undefined;
    let autoRemove = false;
    let restartPolicy: Container["restartPolicy"] | undefined;
    const env: Record<string, string> = {};
    const ports: { host: number; container: number }[] = [];
    const volumes: { host: string; container: string }[] = [];
    let image = "";
    let cmd: string[] = [];
    const stripQuotes = (s: string) => s.replace(/^"(.*)"$/, "$1");
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t === "-d" || t === "--detach") detach = true;
      else if (t === "--rm") autoRemove = true;
      else if (t === "-it" || t === "-ti" || t === "-i" || t === "-t") { /* ignorar — modo interativo */ }
      else if (t === "--name") name = tokens[++i];
      else if (t === "--network" || t === "--net") network = tokens[++i];
      else if (t === "-w" || t === "--workdir") workdir = tokens[++i];
      else if (t.startsWith("--restart=")) restartPolicy = t.slice(10) as any;
      else if (t === "--restart") restartPolicy = tokens[++i] as any;
      else if (t === "-e" || t === "--env") {
        const kv = stripQuotes(tokens[++i] ?? "");
        const eq = kv.indexOf("=");
        if (eq > 0) env[kv.slice(0, eq)] = kv.slice(eq + 1);
      } else if (t.startsWith("-e=") || t.startsWith("--env=")) {
        const kv = stripQuotes(t.slice(t.indexOf("=") + 1));
        const eq = kv.indexOf("=");
        if (eq > 0) env[kv.slice(0, eq)] = kv.slice(eq + 1);
      } else if (t === "--env-file") {
        i++; // path ignorado — em sim, fingimos que carregou
      } else if (t === "-p" || t === "--publish") {
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
    return { detach, name, ports, volumes, env, network, workdir, autoRemove, restartPolicy, image, command: cmd.join(" ") || "(default)" };
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { type: "in", text: `$ ${cmd}` }]);
    if (!cmd) return;
    if (cmd !== history[history.length - 1]) setHistory((h) => [...h, cmd]);
    setHistoryIdx(-1);

    if (cmd === "help") {
      out("Comandos suportados:");
      out("  docker pull <image>[:tag]            baixa imagem do registry");
      out("  docker images                        lista imagens locais");
      out("  docker run [flags] <image>           cria e inicia um container");
      out("    -d/--detach   --rm    --name X    -p H:C    -v H:C ou volname:/path");
      out("    -e KEY=VAL    --env-file <path>   --network X   -w /path   --restart=always");
      out("  docker ps [-a]                       lista containers (-a inclui parados)");
      out("  docker stop|start|restart <id|name>  controla ciclo de vida");
      out("  docker rm <id|name>                  remove container parado");
      out("  docker rmi <image>                   remove imagem local");
      out("  docker logs [-f] <id|name>           mostra logs (-f = follow)");
      out("  docker inspect <id|name|imagem>      JSON detalhado (debug)");
      out("  docker exec [-it] <id|name> <cmd>    executa comando no container");
      out("                                       comandos úteis: ls, env, ps, cat <file>, ping <ctr>, sh");
      out("  docker build -t <nome> .             constrói imagem do Dockerfile (ENV/EXPOSE/multi-stage)");
      out("  docker history <image>               mostra layers e tamanho de cada uma");
      out("  docker tag <src> <dst>               cria alias para uma imagem");
      out("  docker login [user]                  autentica no registry simulado");
      out("  docker push <image>                  publica imagem (exige login)");
      out("  docker stats                         CPU/memória/rede dos containers rodando");
      out("  docker system prune [-a] | system df cleanup e relatório de uso");
      out("");
      out("  docker volume ls | create X | rm X | inspect X | prune");
      out("  docker network ls | create [--driver bridge] X | rm X | inspect X");
      out("  docker network connect <net> <ctr> | disconnect <net> <ctr> | prune");
      out("");
      out("  docker-compose up [-d] | down | ps");
      out("  curl localhost:<porta>               testa porta mapeada");
      out("  clear | reset | help");
      out("Atalhos: ↑/↓ histórico • Tab autocomplete contextual • clique no Dockerfile/compose para editar");
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
      const hasFat = s.images.some((i) => i.name === "node" && i.tag === "20");
      const hasAlpine = s.images.some((i) => i.name === "node" && /alpine/.test(i.tag));
      if (hasFat && hasAlpine) (next as any)._comparedSizes = true;
      return next;
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
      // Validar network: deve existir
      const targetNet = parsed.network ?? "bridge";
      if (!s.networks.some((n) => n.name === targetNet)) {
        io.err(`Error response from daemon: network ${targetNet} not found`);
        return null;
      }
      // Auto-criar volume nomeado se -v <nome>:<path> e nome não existe ainda (comportamento real do Docker)
      parsed.volumes.forEach((vol) => {
        const isNamed = !vol.host.startsWith("/") && !vol.host.startsWith(".") && !vol.host.includes("\\");
        if (isNamed && !next.volumes.some((v) => v.name === vol.host)) {
          next.volumes.push({
            name: vol.host, driver: "local",
            mountpoint: `/var/lib/docker/volumes/${vol.host}/_data`,
            createdAt: Date.now(),
          });
        }
      });
      // Mesclar env: ENV do Dockerfile (defaults da imagem) + -e (override)
      const mergedEnv = { ...(img.defaultEnv ?? {}), ...parsed.env };
      const container: Container = {
        id, name, imageRef: `${imgName}:${imgTag}`, command: parsed.command,
        status: "running", ports: parsed.ports, volumes: parsed.volumes,
        env: mergedEnv, network: targetNet,
        workdir: parsed.workdir, autoRemove: parsed.autoRemove, restartPolicy: parsed.restartPolicy,
        createdAt: Date.now(),
        logs: [`[${new Date().toISOString()}] Started container from ${imgName}:${imgTag}${parsed.network ? ` on network ${parsed.network}` : ""}`],
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
      if (c.autoRemove) {
        next.containers = next.containers.filter((x) => x.id !== c.id);
        io.out(c.name);
        io.info(`(--rm: container '${c.name}' removido automaticamente)`);
        return next;
      }
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

    // restart
    const restartMatch = args.match(/^restart\s+(\S+)$/);
    if (restartMatch) {
      const c = findContainer(s, restartMatch[1]);
      if (!c) { io.err(`No such container: ${restartMatch[1]}`); return null; }
      const idx = next.containers.findIndex((x) => x.id === c.id);
      next.containers[idx] = { ...c, status: "running", logs: [...c.logs, `[${new Date().toISOString()}] Restarted`] };
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

    // logs (com -f / --follow)
    const logsMatch = args.match(/^logs\s+(?:(-f|--follow|--tail\s+\d+)\s+)?(\S+)$/);
    if (logsMatch) {
      const flag = logsMatch[1];
      const c = findContainer(s, logsMatch[2]);
      if (!c) { io.err(`No such container: ${logsMatch[2]}`); return null; }
      c.logs.forEach((l) => io.out(l));
      if (flag === "-f" || flag === "--follow") {
        io.info("[seguindo logs em tempo real — Ctrl+C para sair (simulado)]");
      }
      if (c.name === "site_quebrado") (next as any)._loggedSiteQuebrado = true;
      return next;
    }

    // inspect (container ou imagem)
    const inspectMatch = args.match(/^inspect\s+(\S+)$/);
    if (inspectMatch) {
      const ref = inspectMatch[1];
      const c = findContainer(s, ref);
      if (c) {
        const portsObj: any = {};
        c.ports.forEach((p) => { portsObj[`${p.container}/tcp`] = [{ HostIp: "0.0.0.0", HostPort: String(p.host) }]; });
        const mounts = c.volumes.map((v) => ({
          Type: v.host.includes("/") ? "bind" : "volume",
          Source: v.host, Destination: v.container, Mode: "rw", RW: true,
        }));
        const data = [{
          Id: c.id,
          Name: `/${c.name}`,
          Image: c.imageRef,
          State: { Status: c.status, Running: c.status === "running", StartedAt: new Date(c.createdAt).toISOString() },
          Config: {
            Image: c.imageRef,
            Cmd: c.command === "(default)" ? null : c.command.split(" "),
            WorkingDir: c.workdir ?? "",
            Env: Object.entries(c.env).map(([k, v]) => `${k}=${v}`),
          },
          NetworkSettings: {
            Networks: { [c.network]: { IPAddress: `172.17.0.${(parseInt(c.id.slice(0, 4), 16) % 250) + 2}` } },
            Ports: portsObj,
          },
          Mounts: mounts,
        }];
        JSON.stringify(data, null, 2).split("\n").forEach((line) => io.out(line));
        if (c.name === "site_quebrado") (next as any)._inspectedSiteQuebrado = true;
        if (c.name === "db" && Object.keys(c.env).length > 0) (next as any)._inspectedEnvDb = true;
        return next;
      }
      const [n, t = "latest"] = ref.split(":");
      const img = s.images.find((i) => i.name === n && i.tag === t);
      if (img) {
        const data = [{
          Id: `sha256:${img.id}`,
          RepoTags: [`${img.name}:${img.tag}`],
          Size: img.size,
          BuiltFromDockerfile: !!img.builtFromDockerfile,
        }];
        JSON.stringify(data, null, 2).split("\n").forEach((line) => io.out(line));
        return null;
      }
      io.err(`Error: No such object: ${ref}`);
      return null;
    }

    // exec
    const execShellMatch = args.match(/^exec\s+(?:-it\s+|-i\s+|-t\s+)?(\S+)\s+(sh|bash|\/bin\/sh|\/bin\/bash)$/);
    if (execShellMatch) {
      const c = findContainer(s, execShellMatch[1]);
      if (!c) { io.err(`No such container: ${execShellMatch[1]}`); return null; }
      if (c.status !== "running") { io.err(`Error response from daemon: container ${c.name} is not running`); return null; }
      io.info(`[abrindo shell em '${c.name}' — sessão simulada]`);
      io.out(`/ # _`);
      io.info(`(dica: 'docker exec ${c.name} <cmd>' executa um único comando — ex: 'docker exec ${c.name} env')`);
      return null;
    }
    const execMatch = args.match(/^exec\s+(?:-it\s+|-i\s+|-t\s+)?(\S+)\s+(.+)$/);
    if (execMatch) {
      const c = findContainer(s, execMatch[1]);
      if (!c) { io.err(`No such container: ${execMatch[1]}`); return null; }
      if (c.status !== "running") { io.err(`Error response from daemon: container ${c.name} is not running`); return null; }
      const command = execMatch[2].trim();
      if (command === "ls" || command === "ls /") io.out("bin  dev  etc  home  lib  opt  proc  root  sbin  tmp  usr  var");
      else if (command === "ls /app") io.out("package.json  node_modules  server.js");
      else if (command.startsWith("echo ")) io.out(command.slice(5).replace(/["']/g, ""));
      else if (command === "whoami") io.out("root");
      else if (command === "pwd") io.out(c.workdir || "/");
      else if (command === "uname -a") io.out("Linux container 5.15.0 #1 SMP x86_64 GNU/Linux");
      else if (command === "env") {
        const entries = Object.entries(c.env);
        if (!entries.length) io.out("PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOSTNAME=" + c.id.slice(0, 12));
        else entries.forEach(([k, v]) => io.out(`${k}=${v}`));
        if (c.name === "db" && entries.length > 0) (next as any)._execEnvSeen = true;
      }
      else if (command === "ps" || command === "ps aux") {
        io.out("  PID USER       TIME  COMMAND");
        io.out("    1 root       0:00  " + (c.command === "(default)" ? "/docker-entrypoint.sh" : c.command));
        io.out("   42 root       0:00  ps");
      }
      else if (command.startsWith("cat ")) {
        const file = command.slice(4).trim();
        if (file === "/etc/hostname") io.out(c.id.slice(0, 12));
        else if (file === "/etc/os-release") io.out('PRETTY_NAME="Alpine Linux v3.19"\nID=alpine\nVERSION_ID=3.19.1');
        else io.err(`cat: can't open '${file}': No such file or directory`);
      }
      else if (command.startsWith("ping ") || command.startsWith("ping -c")) {
        // ping <host> — resolução por DNS interna do Docker funciona apenas em networks customizadas
        const targetName = command.replace(/^ping\s+(?:-c\s+\d+\s+)?/, "").trim();
        const target = s.containers.find((x) => x.name === targetName && x.status === "running");
        const isCustomNet = c.network !== "bridge" && c.network !== "host" && c.network !== "none";
        if (!target) {
          io.err(`ping: bad address '${targetName}'`);
        } else if (target.network !== c.network) {
          io.err(`ping: bad address '${targetName}' — não está na mesma network ('${c.network}' vs '${target.network}')`);
        } else if (!isCustomNet) {
          io.err(`ping: bad address '${targetName}' — DNS interno só funciona em networks customizadas (você está em 'bridge')`);
        } else {
          const ip = `172.18.0.${(parseInt(target.id.slice(0, 4), 16) % 250) + 2}`;
          io.out(`PING ${targetName} (${ip}): 56 data bytes`);
          io.out(`64 bytes from ${ip}: seq=0 ttl=64 time=0.123 ms`);
          io.out(`64 bytes from ${ip}: seq=1 ttl=64 time=0.098 ms`);
          io.out(`--- ${targetName} ping statistics ---`);
          io.out(`2 packets transmitted, 2 packets received, 0% packet loss`);
          if (targetName === "db") (next as any)._pingedDb = true;
        }
      }
      else io.out(`(simulado) ${command}`);
      return next;
    }

    // build
    const buildMatch = args.match(/^build\s+-t\s+(\S+)\s+\.$/);
    if (buildMatch) {
      if (!s.dockerfile.trim()) { io.err("Erro: nenhum Dockerfile encontrado. Edite o arquivo primeiro."); return null; }
      const ref = buildMatch[1];
      const [n, t = "latest"] = ref.split(":");
      const lines = s.dockerfile.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
      io.out(`Sending build context to Docker daemon ...`);
      // Detectar multi-stage (FROM ... AS ...)
      const fromLines = lines.filter((l) => /^FROM\s/i.test(l.trim()));
      const stageNames = lines.filter((l) => /^FROM\s+\S+\s+AS\s+\S+/i.test(l.trim()))
        .map((l) => l.trim().match(/^FROM\s+\S+\s+AS\s+(\S+)/i)?.[1] ?? "");
      const isMultiStage = stageNames.length > 0 && fromLines.length > 1;
      // Última stage define a imagem de base (e portanto o tamanho)
      const lastFrom = fromLines[fromLines.length - 1] ?? "FROM node:20";
      const baseImageRef = lastFrom.trim().match(/^FROM\s+(\S+)/i)?.[1] ?? "node:20";
      const isAlpineBase = /alpine/i.test(baseImageRef);
      const isSlimBase = /slim/i.test(baseImageRef);
      // Parsear ENV e EXPOSE
      const defaultEnv: Record<string, string> = {};
      let exposedPort: number | undefined;
      let copyFromCount = 0;
      lines.forEach((l, i) => {
        const trimmed = l.trim();
        io.out(`Step ${i + 1}/${lines.length} : ${trimmed}`);
        const envMatch = trimmed.match(/^ENV\s+(.+)$/i);
        if (envMatch) {
          const rest = envMatch[1];
          if (rest.includes("=")) {
            const pairs = rest.match(/(\w+)=("[^"]*"|\S+)/g) ?? [];
            pairs.forEach((p) => {
              const eq = p.indexOf("=");
              const k = p.slice(0, eq);
              const v = p.slice(eq + 1).replace(/^"|"$/g, "");
              defaultEnv[k] = v;
            });
          } else {
            const [k, ...vparts] = rest.split(/\s+/);
            defaultEnv[k] = vparts.join(" ").replace(/^"|"$/g, "");
          }
        }
        const exposeMatch = trimmed.match(/^EXPOSE\s+(\d+)/i);
        if (exposeMatch) exposedPort = Number(exposeMatch[1]);
        // COPY --from=<stage> indica multi-stage real (pega artefatos da stage anterior)
        if (/^COPY\s+--from=/i.test(trimmed)) copyFromCount++;
      });
      const id = randId();
      // Tamanho final calculado a partir da base + impacto multi-stage
      // Multi-stage com COPY --from corta TUDO que não for usado na última stage
      let baseSize = 287; // padrão para node:20
      if (isAlpineBase) baseSize = isMultiStage ? 50 : 150;
      else if (isSlimBase) baseSize = isMultiStage ? 130 : 240;
      else baseSize = isMultiStage && copyFromCount > 0 ? 200 : 287;
      const size = `${baseSize}MB`;
      next.images = next.images.filter((i) => !(i.name === n && i.tag === t));
      next.images.push({
        name: n, tag: t, id, size,
        builtFromDockerfile: true,
        defaultEnv: Object.keys(defaultEnv).length > 0 ? defaultEnv : undefined,
        exposedPort,
      });
      if (isMultiStage) {
        io.out(`(multi-stage detectado: ${fromLines.length} stages, ${copyFromCount} COPY --from — imagem final enxuta)`);
      }
      if (isAlpineBase) io.out(`(base alpine: imagem ultra-leve — ótimo para produção)`);
      io.out(`Successfully built ${id.slice(0, 12)}`);
      io.out(`Successfully tagged ${n}:${t}`);
      // dispara animação visual de layers
      next.buildAnimation = {
        steps: lines.map((l) => l.trim()),
        isMultiStage,
        finalSize: size,
        ts: Date.now(),
      };
      return next;
    }

    // ===== docker volume * =====
    if (args === "volume ls" || args === "volume list") {
      io.out("DRIVER    VOLUME NAME");
      if (!s.volumes.length) io.out("(nenhum volume)");
      s.volumes.forEach((v) => io.out(`${v.driver.padEnd(10)}${v.name}`));
      (next as any)._listedVolumes = true;
      return next;
    }
    const volCreateMatch = args.match(/^volume\s+create\s+(\S+)$/);
    if (volCreateMatch) {
      const vname = volCreateMatch[1];
      if (s.volumes.some((v) => v.name === vname)) { io.err(`Error: volume '${vname}' already exists`); return null; }
      next.volumes.push({ name: vname, driver: "local", mountpoint: `/var/lib/docker/volumes/${vname}/_data`, createdAt: Date.now() });
      io.out(vname);
      return next;
    }
    const volRmMatch = args.match(/^volume\s+rm\s+(\S+)$/);
    if (volRmMatch) {
      const vname = volRmMatch[1];
      const v = s.volumes.find((x) => x.name === vname);
      if (!v) { io.err(`Error: no such volume: ${vname}`); return null; }
      const inUse = s.containers.find((c) => c.volumes.some((vol) => vol.host === vname));
      if (inUse) { io.err(`Error response from daemon: remove ${vname}: volume is in use - [${inUse.id.slice(0, 12)}]`); return null; }
      next.volumes = next.volumes.filter((x) => x.name !== vname);
      io.out(vname);
      return next;
    }
    const volInspectMatch = args.match(/^volume\s+inspect\s+(\S+)$/);
    if (volInspectMatch) {
      const v = s.volumes.find((x) => x.name === volInspectMatch[1]);
      if (!v) { io.err(`Error: no such volume: ${volInspectMatch[1]}`); return null; }
      JSON.stringify([{ Name: v.name, Driver: v.driver, Mountpoint: v.mountpoint, CreatedAt: new Date(v.createdAt).toISOString(), Scope: "local" }], null, 2)
        .split("\n").forEach((line) => io.out(line));
      return null;
    }
    if (args === "volume prune" || args === "volume prune -f") {
      const used = new Set(s.containers.flatMap((c) => c.volumes.map((v) => v.host)));
      const removed = s.volumes.filter((v) => !used.has(v.name));
      next.volumes = s.volumes.filter((v) => used.has(v.name));
      io.out("Deleted Volumes:");
      removed.forEach((v) => io.out(v.name));
      io.out(`Total reclaimed space: ${removed.length * 50}MB`);
      return next;
    }

    // ===== docker network * =====
    if (args === "network ls" || args === "network list") {
      io.out("NETWORK ID     NAME              DRIVER    SCOPE");
      s.networks.forEach((n) => io.out(`${n.id.slice(0, 12).padEnd(15)}${n.name.padEnd(18)}${n.driver.padEnd(10)}${n.scope}`));
      return null;
    }
    const netCreateMatch = args.match(/^network\s+create\s+(?:--driver\s+(\S+)\s+)?(\S+)$/);
    if (netCreateMatch) {
      const driver = netCreateMatch[1] ?? "bridge";
      const nname = netCreateMatch[2];
      if (s.networks.some((n) => n.name === nname)) { io.err(`Error response from daemon: network with name ${nname} already exists`); return null; }
      const id = randId();
      next.networks.push({ id, name: nname, driver, scope: "local", createdAt: Date.now() });
      io.out(id);
      return next;
    }
    const netRmMatch = args.match(/^network\s+rm\s+(\S+)$/);
    if (netRmMatch) {
      const nname = netRmMatch[1];
      if (["bridge", "host", "none"].includes(nname)) { io.err(`Error response from daemon: ${nname} is a pre-defined network and cannot be removed`); return null; }
      const n = s.networks.find((x) => x.name === nname);
      if (!n) { io.err(`Error: No such network: ${nname}`); return null; }
      const attached = s.containers.some((c) => c.network === nname);
      if (attached) { io.err(`Error response from daemon: error while removing network: network ${nname} has active endpoints`); return null; }
      next.networks = next.networks.filter((x) => x.name !== nname);
      io.out(nname);
      return next;
    }
    const netInspectMatch = args.match(/^network\s+inspect\s+(\S+)$/);
    if (netInspectMatch) {
      const n = s.networks.find((x) => x.name === netInspectMatch[1]);
      if (!n) { io.err(`Error: No such network: ${netInspectMatch[1]}`); return null; }
      const containers: any = {};
      s.containers.filter((c) => c.network === n.name).forEach((c) => {
        containers[c.id] = { Name: c.name, IPv4Address: `172.18.0.${(parseInt(c.id.slice(0, 4), 16) % 250) + 2}/16` };
      });
      JSON.stringify([{ Id: n.id, Name: n.name, Driver: n.driver, Scope: n.scope, Containers: containers, Created: new Date(n.createdAt).toISOString() }], null, 2)
        .split("\n").forEach((line) => io.out(line));
      if (n.name === "app-net") (next as any)._inspectedAppNet = true;
      return next;
    }
    const netConnectMatch = args.match(/^network\s+connect\s+(\S+)\s+(\S+)$/);
    if (netConnectMatch) {
      const n = s.networks.find((x) => x.name === netConnectMatch[1]);
      const c = findContainer(s, netConnectMatch[2]);
      if (!n) { io.err(`Error: No such network: ${netConnectMatch[1]}`); return null; }
      if (!c) { io.err(`No such container: ${netConnectMatch[2]}`); return null; }
      const idx = next.containers.findIndex((x) => x.id === c.id);
      next.containers[idx] = { ...c, network: n.name };
      io.out("");
      return next;
    }
    const netDisconnectMatch = args.match(/^network\s+disconnect\s+(\S+)\s+(\S+)$/);
    if (netDisconnectMatch) {
      const c = findContainer(s, netDisconnectMatch[2]);
      if (!c) { io.err(`No such container: ${netDisconnectMatch[2]}`); return null; }
      const idx = next.containers.findIndex((x) => x.id === c.id);
      next.containers[idx] = { ...c, network: "bridge" };
      io.out("");
      return next;
    }
    if (args === "network prune" || args === "network prune -f") {
      const used = new Set(s.containers.map((c) => c.network).concat(["bridge", "host", "none"]));
      const removed = s.networks.filter((n) => !used.has(n.name));
      next.networks = s.networks.filter((n) => used.has(n.name));
      io.out("Deleted Networks:");
      removed.forEach((n) => io.out(n.name));
      return next;
    }

    // ===== docker tag <src>[:tag] <dst>[:tag] =====
    const tagMatch = args.match(/^tag\s+(\S+)\s+(\S+)$/);
    if (tagMatch) {
      const [srcN, srcT = "latest"] = tagMatch[1].split(":");
      const [dstN, dstT = "latest"] = tagMatch[2].split(":");
      const src = s.images.find((i) => i.name === srcN && i.tag === srcT);
      if (!src) { io.err(`Error response from daemon: No such image: ${tagMatch[1]}`); return null; }
      // remove qualquer destino prévio com mesmo nome:tag (re-tag substitui)
      next.images = next.images.filter((i) => !(i.name === dstN && i.tag === dstT));
      next.images.push({ ...src, name: dstN, tag: dstT }); // mesmo id — alias
      return next;
    }

    // ===== docker login =====
    if (args === "login" || args.startsWith("login ")) {
      const userMatch = args.match(/^login(?:\s+(?:-u\s+)?(\S+))?/);
      const user = userMatch?.[1] ?? "operador";
      io.out(`Login Succeeded`);
      io.info(`Logged in as: ${user}`);
      next.loggedIn = user;
      return next;
    }

    if (args === "logout") {
      io.out("Removing login credentials for https://index.docker.io/v1/");
      next.loggedIn = undefined;
      return next;
    }

    // ===== docker push <name>[:tag] =====
    const pushMatch = args.match(/^push\s+(\S+)$/);
    if (pushMatch) {
      const ref = pushMatch[1];
      const [n, t = "latest"] = ref.split(":");
      if (!s.loggedIn) { io.err(`denied: requested access to the resource is denied — use 'docker login' primeiro`); return null; }
      const img = s.images.find((i) => i.name === n && i.tag === t);
      if (!img) { io.err(`An image does not exist locally with the tag: ${ref}`); return null; }
      io.out(`The push refers to repository [docker.io/${s.loggedIn}/${n}]`);
      io.out(`${img.id.slice(0, 12)}: Pushing image layer...`);
      io.out(`${img.id.slice(0, 12)}: Pushed`);
      io.out(`${t}: digest: sha256:${img.id}${"a".repeat(40)} size: ${img.size}`);
      // adiciona ao registry simulado (substitui se já existe)
      next.registry = next.registry.filter((i) => !(i.name === n && i.tag === t));
      next.registry.push({ ...img, size: img.size });
      return next;
    }

    // ===== docker history <image> =====
    const historyMatch = args.match(/^history\s+(\S+)$/);
    if (historyMatch) {
      const ref = historyMatch[1];
      const [n, t = "latest"] = ref.split(":");
      const img = s.images.find((i) => i.name === n && i.tag === t);
      if (!img) { io.err(`Error: No such image: ${ref}`); return null; }
      io.out("IMAGE          CREATED        CREATED BY                                          SIZE");
      if (img.builtFromDockerfile && s.dockerfile.trim()) {
        const lines = s.dockerfile.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
        const fromIdxs = lines.map((l, i) => /^FROM\s/i.test(l.trim()) ? i : -1).filter((i) => i >= 0);
        const lastStageStart = fromIdxs[fromIdxs.length - 1] ?? 0;
        const stageLines = lines.slice(lastStageStart);
        stageLines.forEach((l, i) => {
          const cmd = l.trim();
          const layerSize = cmd.startsWith("RUN") ? "120MB" : cmd.startsWith("COPY") || cmd.startsWith("ADD") ? "8MB" : "0B";
          io.out(`${i === 0 ? img.id.slice(0, 12) : "<missing>".padEnd(13)}  3 minutes ago  /bin/sh -c #(nop) ${cmd.length > 45 ? cmd.slice(0, 44) + "…" : cmd.padEnd(45)} ${layerSize}`);
        });
      } else {
        io.out(`${img.id.slice(0, 12)}  2 weeks ago    /bin/sh -c #(nop) CMD ["/${n}"]                ${img.size}`);
      }
      if (n === "app" && t === "slim") (next as any)._historiedAppSlim = true;
      return next;
    }

    // ===== docker stats (snapshot, simulado) =====
    if (args === "stats" || args === "stats --no-stream") {
      io.out("CONTAINER ID   NAME              CPU %     MEM USAGE / LIMIT     MEM %     NET I/O");
      const running = s.containers.filter((c) => c.status === "running");
      if (!running.length) io.out("(nenhum container rodando)");
      running.forEach((c) => {
        const seed = parseInt(c.id.slice(0, 4), 16);
        const cpu = ((seed % 50) + 5).toFixed(1);
        const memUsed = (seed % 380) + 20;
        const memMax = c.imageRef.includes("postgres") ? 512 : 256;
        const memPct = ((memUsed / memMax) * 100).toFixed(1);
        const net = `${(seed % 50) / 10}MB / ${(seed % 30) / 10}MB`;
        io.out(`${c.id.slice(0, 12).padEnd(15)}${c.name.padEnd(18)}${cpu}%      ${memUsed}MiB / ${memMax}MiB        ${memPct}%      ${net}`);
      });
      return null;
    }

    // ===== docker system prune [-a] [-f] / df / info =====
    if (args.startsWith("system prune") || args === "system prune") {
      const all = /(?:^|\s)(-a|--all)(?:\s|$)/.test(args);
      // remove containers parados
      const stoppedIds = s.containers.filter((c) => c.status === "stopped").map((c) => c.id);
      next.containers = s.containers.filter((c) => c.status === "running");
      // remove networks não usadas
      const usedNets = new Set(next.containers.map((c) => c.network).concat(["bridge", "host", "none"]));
      next.networks = s.networks.filter((nw) => usedNets.has(nw.name));
      // remove volumes dangling
      const usedVols = new Set(next.containers.flatMap((c) => c.volumes.map((v) => v.host)));
      const removedVols = s.volumes.filter((v) => !usedVols.has(v.name));
      next.volumes = s.volumes.filter((v) => usedVols.has(v.name));
      // remove imagens dangling (com -a, remove todas que não estão em uso)
      let removedImgs: Image[] = [];
      if (all) {
        const usedImgs = new Set(next.containers.map((c) => c.imageRef));
        removedImgs = s.images.filter((i) => !usedImgs.has(`${i.name}:${i.tag}`));
        next.images = s.images.filter((i) => usedImgs.has(`${i.name}:${i.tag}`));
      }
      io.out("Deleted Containers:");
      stoppedIds.forEach((id) => io.out(id));
      if (removedImgs.length) {
        io.out("Deleted Images:");
        removedImgs.forEach((i) => io.out(`untagged: ${i.name}:${i.tag}`));
      }
      if (removedVols.length) {
        io.out("Deleted Volumes:");
        removedVols.forEach((v) => io.out(v.name));
      }
      const reclaim = removedImgs.length * 200 + removedVols.length * 50 + stoppedIds.length * 5;
      io.out(`Total reclaimed space: ${reclaim}MB`);
      return next;
    }

    if (args === "system df") {
      io.out("TYPE            TOTAL     ACTIVE     SIZE      RECLAIMABLE");
      io.out(`Images          ${String(s.images.length).padEnd(10)}${String(s.containers.length).padEnd(11)}${s.images.length * 200}MB     ${(s.images.length - s.containers.length) * 200}MB`);
      io.out(`Containers      ${String(s.containers.length).padEnd(10)}${String(s.containers.filter((c) => c.status === "running").length).padEnd(11)}${s.containers.length * 5}MB       ${s.containers.filter((c) => c.status === "stopped").length * 5}MB`);
      io.out(`Local Volumes   ${String(s.volumes.length).padEnd(10)}${String(s.volumes.length).padEnd(11)}${s.volumes.length * 50}MB      0MB`);
      (next as any)._dfSeen = true;
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
          command: "(default)", status: "running",
          ports: svc === "web" ? [{ host: 8080, container: 80 }] : [],
          volumes: svc === "db" ? [{ host: "dbdata", container: "/var/lib/postgresql/data" }] : [],
          env: svc === "db" ? { POSTGRES_PASSWORD: "secret" } : {},
          network: "proj_default",
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
      const matches = computeCompletions(input, state);
      if (matches.length === 1) setInput(matches[0]);
      else if (matches.length > 1) {
        const common = longestCommonPrefix(matches);
        if (common.length > input.length) setInput(common);
        info("Sugestões: " + matches.slice(0, 12).join(" | ") + (matches.length > 12 ? ` …(+${matches.length - 12})` : ""));
      }
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
      { border: "border-rose-500/20", bg: "bg-rose-500/10", borderInner: "border-rose-500/30", text: "text-rose-400" },
      { border: "border-violet-500/20", bg: "bg-violet-500/10", borderInner: "border-violet-500/30", text: "text-violet-400" },
      { border: "border-teal-500/20", bg: "bg-teal-500/10", borderInner: "border-teal-500/30", text: "text-teal-400" },
      { border: "border-cyan-500/20", bg: "bg-cyan-500/10", borderInner: "border-cyan-500/30", text: "text-cyan-400" },
      { border: "border-indigo-500/20", bg: "bg-indigo-500/10", borderInner: "border-indigo-500/30", text: "text-indigo-400" },
      { border: "border-pink-500/20", bg: "bg-pink-500/10", borderInner: "border-pink-500/30", text: "text-pink-400" },
      { border: "border-lime-500/20", bg: "bg-lime-500/10", borderInner: "border-lime-500/30", text: "text-lime-400" },
    ];
    const steps: { title: string; content: React.ReactNode }[] = [
      {
        title: "Boas-vindas",
        content: (
          <div className="text-center pt-6">
            <div className="inline-flex p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-5">
              <ContainerIcon className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">Docker Simulator</h1>
            <p className="text-sky-400 font-mono text-sm uppercase tracking-[0.3em] mb-6">Containerize sem dor de cabeça</p>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Aprenda Docker digitando comandos reais. Sem instalar Docker, sem WSL — tudo simulado no navegador. Veja imagens sendo baixadas, containers ligando, portas mapeadas e volumes persistindo.
            </p>
          </div>
        ),
      },
      {
        title: "Por que Docker?",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-6 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Por que Docker?
            </h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <Boxes className="w-6 h-6 text-sky-400 mb-3" />
                <p className="text-base font-bold text-white mb-2">"Funciona na minha máquina"</p>
                <p className="text-sm text-slate-400 leading-relaxed">Empacota seu app + dependências numa caixa portátil que roda igual em qualquer lugar.</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <Server className="w-6 h-6 text-emerald-400 mb-3" />
                <p className="text-base font-bold text-white mb-2">Deploy descomplicado</p>
                <p className="text-sm text-slate-400 leading-relaxed">"Build once, run anywhere". A mesma imagem vai do laptop pro servidor sem surpresas.</p>
              </div>
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <Layers className="w-6 h-6 text-fuchsia-400 mb-3" />
                <p className="text-base font-bold text-white mb-2">Isolamento</p>
                <p className="text-sm text-slate-400 leading-relaxed">Rode 5 versões diferentes de Node ou Postgres na mesma máquina sem conflitos.</p>
              </div>
            </div>
          </section>
        ),
      },
      {
        title: "Imagem vs Container",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Imagem vs Container
            </h2>
            <div className="grid md:grid-cols-2 gap-3 mb-6">
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
            
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden mb-4">
              <img 
                src="/assets/images/docker_edu.png" 
                alt="Infográfico Educativo: Imagem vs Container" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
            
            <p className="text-sm text-slate-500 text-center italic">Analogia: Imagem é a classe, Container é a instância. Ou: Imagem é a receita, Container é o bolo assado.</p>
          </section>
        ),
      },
      {
        title: "Como tudo se conecta",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-6 flex items-center gap-2">
              <Network className="w-4 h-4" /> Como tudo se conecta
            </h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
              <div className="grid md:grid-cols-4 gap-3 items-center text-center">
                <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl p-4">
                  <Cloud className="w-7 h-7 text-fuchsia-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Docker Hub</p>
                  <p className="text-xs text-slate-500 mt-1">Registry público</p>
                </div>
                <div className="text-slate-600 font-mono text-xs hidden md:block">docker pull →</div>
                <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4">
                  <Package className="w-7 h-7 text-sky-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Imagens Locais</p>
                  <p className="text-xs text-slate-500 mt-1">No seu disco</p>
                </div>
                <div className="text-slate-600 font-mono text-xs hidden md:block">docker run →</div>
              </div>
              <div className="grid md:grid-cols-4 gap-3 items-center text-center mt-4">
                <div></div>
                <div></div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                  <ContainerIcon className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Containers</p>
                  <p className="text-xs text-slate-500 mt-1">Rodando ou parados</p>
                </div>
                <div></div>
              </div>
            </div>
          </section>
        ),
      },
      {
        title: "Glossário",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-6 flex items-center gap-2">
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
        ),
      },
      {
        title: "Os níveis",
        content: (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-6 flex items-center gap-2">
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
            <div className="bg-gradient-to-br from-sky-900/10 via-slate-900/40 to-emerald-900/10 border border-sky-500/20 rounded-2xl p-6 mb-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-sky-400 mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Dicas do simulador
              </h2>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Digite <code className="text-sky-300 font-mono">help</code> a qualquer momento para ver todos os comandos</li>
                <li>• Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">↑</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">↓</kbd> para histórico e <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono">Tab</kbd> para autocompletar</li>
                <li>• Clique no <code className="text-amber-300 font-mono">Dockerfile</code> ou <code className="text-amber-300 font-mono">docker-compose.yml</code> para abrir o editor (níveis 2 e 4)</li>
                <li>• <code className="text-sky-300 font-mono">curl localhost:&lt;porta&gt;</code> testa portas mapeadas</li>
                <li>• <code className="text-sky-300 font-mono">reset</code> reinicia o nível, <code className="text-sky-300 font-mono">clear</code> limpa o terminal</li>
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
        localStorage.setItem("docker_sim_intro_seen", "true");
        setPhase("playing");
      } else {
        setIntroStep((s) => s + 1);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]">
          <img src="/assets/images/docker_bg.png" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex items-center justify-between px-6 py-4">
            <Button variant="ghost" size="icon" onClick={() => localStorage.getItem("docker_sim_intro_seen") ? setPhase("playing") : onBack()} className="text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <button onClick={() => {
              localStorage.setItem("docker_sim_intro_seen", "true");
              setPhase("playing");
            }} className="text-xs text-slate-500 hover:text-sky-400 font-mono uppercase tracking-widest transition-colors">
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
                        i === introStep ? "w-8 bg-sky-400" :
                        i < introStep ? "w-1.5 bg-sky-400/60" : "w-1.5 bg-slate-700"
                      }`} aria-label={`Ir para passo ${i + 1}`} />
                  ))}
                </div>
              </div>
              <Button onClick={goNext} className={isLast ? "bg-sky-400 text-slate-950 hover:bg-sky-300 font-bold" : "bg-slate-800 text-white hover:bg-slate-700"}>
                {isLast ? "Iniciar Treinamento" : "Próximo"} <ChevronDown className="w-4 h-4 ml-1 -rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Simulator ----------
  const running = state.containers.filter((c) => c.status === "running");
  const stopped = state.containers.filter((c) => c.status === "stopped");
  const showDockerfile = !!state.dockerfile.trim();
  const showCompose = level.id === 4;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06]">
        <img 
          src="/assets/images/docker_bg.png" 
          alt="Docker Background" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 min-h-screen flex flex-col">

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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPhase("intro")} className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 text-xs">
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
                    {Object.keys(c.env).length > 0 && (
                      <div className="flex items-start gap-1 mt-0.5 text-[10px] text-emerald-300/80">
                        <span className="font-bold mt-0.5">ENV</span>
                        <span className="truncate" title={Object.entries(c.env).map(([k, v]) => `${k}=${v}`).join("\n")}>
                          {Object.keys(c.env).slice(0, 2).join(", ")}{Object.keys(c.env).length > 2 ? ` +${Object.keys(c.env).length - 2}` : ""}
                        </span>
                      </div>
                    )}
                    {c.network !== "bridge" && (
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-cyan-300/80">
                        <Network className="w-3 h-3" /> {c.network}
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

          {/* Row: Volumes + Networks */}
          <div className="grid lg:grid-cols-2 gap-4">

            {/* Volumes */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-violet-400">
                <HardDrive className="w-4 h-4" />
                <h5 className="text-xs font-bold uppercase tracking-widest">Volumes ({state.volumes.length})</h5>
                <span className="ml-auto text-[10px] text-slate-600 font-mono">storage persistente</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-auto">
                {state.volumes.length === 0 && (
                  <p className="text-[11px] text-slate-600 italic">(nenhum volume nomeado — use bind mount com -v ou crie em níveis avançados)</p>
                )}
                {state.volumes.map((v) => (
                  <div key={v.name} className="flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded bg-slate-950/50 border border-violet-500/10">
                    <span className="text-violet-300">{v.name}</span>
                    <span className="text-[10px] text-slate-500">{v.driver}</span>
                  </div>
                ))}
                {/* bind mounts in-line para visibilidade */}
                {state.containers.flatMap((c) => c.volumes.filter((vol) => vol.host.startsWith("/") || vol.host.startsWith(".")).map((vol) => ({ c, vol }))).map(({ c, vol }, i) => (
                  <div key={`bm-${i}`} className="flex items-center justify-between text-[11px] font-mono px-2 py-1 rounded bg-slate-950/30 border border-white/5">
                    <span className="text-slate-400 truncate max-w-[60%]" title={vol.host}>{vol.host}</span>
                    <span className="text-[10px] text-slate-600">→ {c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Networks */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-cyan-400">
                <Network className="w-4 h-4" />
                <h5 className="text-xs font-bold uppercase tracking-widest">Networks ({state.networks.length})</h5>
                <span className="ml-auto text-[10px] text-slate-600 font-mono">isolamento de tráfego</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-auto">
                {state.networks.map((n) => {
                  const attached = state.containers.filter((c) => c.network === n.name);
                  const isCustom = !["bridge", "host", "none"].includes(n.name);
                  return (
                    <div key={n.id} className={`text-xs font-mono px-2 py-1.5 rounded border ${isCustom ? "bg-cyan-500/5 border-cyan-500/20" : "bg-slate-950/50 border-cyan-500/10"}`}>
                      <div className="flex items-center justify-between">
                        <span className={isCustom ? "text-cyan-200 font-bold" : "text-cyan-300"}>{n.name}{isCustom && <span className="text-[9px] text-cyan-500 ml-1">★ custom</span>}</span>
                        <span className="text-[10px] text-slate-500">{n.driver} · {attached.length} ctr</span>
                      </div>
                      {attached.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {attached.map((c) => c.name).join(", ")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Topologia visual (renderiza só se houver network custom com 1+ containers) */}
          {state.networks.some((n) => !["bridge", "host", "none"].includes(n.name) && state.containers.some((c) => c.network === n.name)) && (
            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 text-cyan-400">
                <Network className="w-4 h-4" />
                <h5 className="text-xs font-bold uppercase tracking-widest">Topologia da Rede</h5>
                <span className="ml-auto text-[10px] text-slate-600 font-mono">DNS interno ativo em redes custom</span>
              </div>
              <div className="space-y-3">
                {state.networks
                  .filter((n) => !["bridge", "host", "none"].includes(n.name) && state.containers.some((c) => c.network === n.name))
                  .map((n) => {
                    const attached = state.containers.filter((c) => c.network === n.name);
                    const W = 700, H = 130, cx = W / 2, cy = H / 2;
                    return (
                      <div key={n.id} className="border border-cyan-500/30 rounded-xl bg-cyan-500/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-cyan-300 font-bold">{n.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{n.driver} · 172.18.0.0/16 · DNS: ✓</span>
                        </div>
                        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
                          {/* hub central representando o DNS/bridge interno */}
                          <circle cx={cx} cy={cy} r="22" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" />
                          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#67e8f9" fontFamily="monospace">DNS</text>
                          {/* containers em arco */}
                          {attached.map((c, i) => {
                            const angle = (i / Math.max(attached.length, 1)) * 2 * Math.PI - Math.PI / 2;
                            const r = 50;
                            const x = cx + Math.cos(angle) * (W * 0.32);
                            const y = cy + Math.sin(angle) * 35;
                            const running = c.status === "running";
                            return (
                              <g key={c.id}>
                                <line x1={cx} y1={cy} x2={x} y2={y} stroke={running ? "rgba(34,197,94,0.4)" : "rgba(100,116,139,0.3)"} strokeWidth="1.5" strokeDasharray={running ? "" : "4 3"} />
                                <rect x={x - r} y={y - 14} width={r * 2} height={28} rx="6"
                                  fill={running ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.15)"}
                                  stroke={running ? "rgba(34,197,94,0.5)" : "rgba(100,116,139,0.3)"} strokeWidth="1" />
                                <circle cx={x - r + 8} cy={y} r="3" fill={running ? "#22c55e" : "#64748b"}>
                                  {running && <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite" />}
                                </circle>
                                <text x={x - r + 16} y={y + 4} fontSize="11" fill={running ? "#86efac" : "#94a3b8"} fontFamily="monospace">{c.name.length > 12 ? c.name.slice(0, 11) + "…" : c.name}</text>
                              </g>
                            );
                          })}
                        </svg>
                        {attached.length >= 2 && (
                          <p className="text-[10px] text-slate-500 italic mt-1">
                            Containers nesta rede falam entre si pelo nome — ex: <code className="text-cyan-300">{attached[0].name}</code> alcança <code className="text-cyan-300">{attached[1].name}</code> via <code className="text-cyan-300">ping {attached[1].name}</code>
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

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

      {/* Build layer animation overlay */}
      <AnimatePresence>
        {buildViz && (
          <motion.div
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="fixed top-24 right-6 z-40 w-80 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-[0_0_50px_-10px_rgba(245,158,11,0.5)] overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/30">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Construindo Imagem</span>
              {buildViz.isMultiStage && <span className="ml-auto text-[9px] font-mono text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/30 px-1.5 py-0.5 rounded">multi-stage</span>}
            </div>
            <div className="p-3 space-y-1.5">
              {buildViz.steps.map((step, i) => {
                const visible = i < buildViz.revealed;
                const isFROM = /^FROM\s/i.test(step);
                const isCOPYfrom = /^COPY\s+--from=/i.test(step);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -8, scaleX: 0.7 }}
                    animate={visible ? { opacity: 1, y: 0, scaleX: 1 } : { opacity: 0, y: -8, scaleX: 0.7 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`text-[10px] font-mono px-2 py-1 rounded border origin-left ${
                      isCOPYfrom ? "bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-200" :
                      isFROM ? "bg-sky-500/10 border-sky-500/40 text-sky-200" :
                      "bg-slate-800/60 border-white/10 text-slate-300"
                    }`}
                  >
                    <span className="text-slate-500 mr-1">{i + 1}</span>
                    {step.length > 36 ? step.slice(0, 35) + "…" : step}
                  </motion.div>
                );
              })}
              {buildViz.revealed > buildViz.steps.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 14 }}
                  className="mt-2 p-3 rounded-xl bg-gradient-to-br from-emerald-500/15 to-amber-500/10 border border-emerald-500/40 text-center"
                >
                  <p className="text-[9px] uppercase tracking-widest text-emerald-300 font-mono mb-1">imagem final</p>
                  <p className="text-2xl font-black text-white tabular-nums">{buildViz.finalSize}</p>
                  {buildViz.isMultiStage && (
                    <p className="text-[10px] text-emerald-400 font-mono mt-1">↓ stages descartados</p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
