/**
 * Roda o WORKER_SCRIPT real de client/src/lib/pythonEngine.ts no Node, com o
 * Pyodide offline de client/public/pyodide — o mesmo runtime que o jogo usa.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(here, "../../client");
const pyodideDir = path.join(clientDir, "public", "pyodide") + path.sep;

export type ChallengeUnderTest = {
  setupCode: string;
  testCode: string;
  expectedOutput: string;
};

export type Validation = { correct: boolean; feedback: string; output: string };

export type BossRun = {
  success: boolean;
  output: string;
  error?: string;
  results: { index: number; label: string; passed: boolean; error?: string }[];
};

export type PythonWorker = {
  validate: (userCode: string, challenge: ChallengeUnderTest) => Promise<Validation>;
  runBoss: (
    accumulatedSetup: string,
    userCode: string,
    objectives: { label: string; check: string }[],
  ) => Promise<BossRun>;
};

/** Extrai o WORKER_SCRIPT exatamente como o TypeScript o produz (resolve \` e \\). */
function loadWorkerScript(): string {
  const source = readFileSync(path.join(clientDir, "src/lib/pythonEngine.ts"), "utf8");
  const marker = "const WORKER_SCRIPT = `";
  const start = source.indexOf(marker);
  const end = start < 0 ? -1 : source.slice(start).search(/\r?\n`;\r?\n/);
  if (start < 0 || end < 0) {
    throw new Error("WORKER_SCRIPT não encontrado em pythonEngine.ts");
  }
  const body = source.slice(start + marker.length, start + end);
  return new Function("return `" + body + "\n`;")() as string;
}

export async function createPythonWorker(): Promise<PythonWorker> {
  const require = createRequire(import.meta.url);
  const g = globalThis as Record<string, unknown>;
  // pyodide.asm.js é carregado via vm no Node e espera estes globais.
  g.require = require;
  g.__dirname = pyodideDir;

  const self: Record<string, any> = {};
  const importScripts = () => {
    require(path.join(pyodideDir, "pyodide.js"));
    self.loadPyodide = g.loadPyodide;
  };
  new Function("self", "importScripts", loadWorkerScript())(self, importScripts);

  let nextId = 0;
  const call = <T>(type: string, payload: object) =>
    new Promise<T>((resolve, reject) => {
      self.postMessage = (msg: { result?: T; error?: string }) =>
        msg.error ? reject(new Error(msg.error)) : resolve(msg.result as T);
      self.onmessage({
        data: { id: ++nextId, type, payload: { ...payload, localBaseUrl: pyodideDir, lang: "pt" } },
      });
    });

  await call("INIT", {});
  return {
    validate: (userCode, challenge) =>
      call<Validation>("VALIDATE_CHALLENGE", { userCode, challenge }),
    runBoss: (accumulatedSetup, userCode, objectives) =>
      call<BossRun>("RUN_BOSS", { accumulatedSetup, userCode, objectives }),
  };
}
