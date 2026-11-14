/**
 * PYTHON-QUEST — Motor Python (Web Worker + Fallback)
 * Executa Python real no navegador via Pyodide em um Web Worker dedicado,
 * protegendo contra loops infinitos (timeout de 6s) e isolando variáveis globais
 * entre execuções.
 */

export type PythonResult = {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
};

export type BossObjectiveResult = {
  index: number;
  label: string;
  passed: boolean;
  error?: string;
};

export type BossExecutionResult = {
  success: boolean;
  output: string;
  error?: string;
  results: BossObjectiveResult[];
};

const EXECUTION_TIMEOUT_MS = 6000;

const WORKER_SCRIPT = `
let pyodide = null;
let initPromise = null;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  if (!initPromise) {
    initPromise = (async () => {
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");
      pyodide = await self.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      });
      // Snapshot initial globals to clean between runs
      await pyodide.runPythonAsync(\`
import sys, io
_INITIAL_GLOBALS = set(globals().keys()) | {"_INITIAL_GLOBALS"}
def _reset_globals():
    for k in list(globals().keys()):
        if k not in _INITIAL_GLOBALS and not k.startswith("__"):
            del globals()[k]
    sys.stdout = io.StringIO()
\`);
      return pyodide;
    })();
  }
  return initPromise;
}

function formatPythonError(err) {
  if (!err || !err.message) return "Erro desconhecido durante a execução.";
  const lines = String(err.message).trim().split("\\n");
  // Extract the last meaningful lines of the Python traceback
  const lastLine = lines[lines.length - 1] || err.message;
  const lineMatch = String(err.message).match(/File "<exec>", line (\\d+)/g);
  if (lineMatch && lineMatch.length > 0) {
    const lastLoc = lineMatch[lineMatch.length - 1].replace('File "<exec>", line ', 'Linha ');
    return \`\${lastLoc}: \${lastLine}\`;
  }
  return lastLine;
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data;

  try {
    const py = await ensurePyodide();

    if (type === "INIT") {
      self.postMessage({ id, result: { ready: true } });
      return;
    }

    if (type === "RUN_CODE") {
      const start = performance.now();
      const { code, setupCode = "" } = payload;
      try {
        await py.runPythonAsync("_reset_globals()");
        const fullCode = setupCode ? \`\${setupCode}\\n\${code}\` : code;
        await py.loadPackagesFromImports(fullCode);
        if (setupCode) {
          await py.runPythonAsync(setupCode);
        }
        await py.runPythonAsync(code);
        const output = await py.runPythonAsync("sys.stdout.getvalue()");
        self.postMessage({
          id,
          result: {
            success: true,
            output,
            executionTime: performance.now() - start,
          },
        });
      } catch (err) {
        self.postMessage({
          id,
          result: {
            success: false,
            output: "",
            error: formatPythonError(err),
            executionTime: performance.now() - start,
          },
        });
      }
      return;
    }

    if (type === "VALIDATE_CHALLENGE") {
      const { userCode, challenge } = payload;
      const setupCode = challenge.setupCode || "";
      let userOutput = "";

      try {
        await py.runPythonAsync("_reset_globals()");
        const fullCode = setupCode ? \`\${setupCode}\\n\${userCode}\` : userCode;
        await py.loadPackagesFromImports(fullCode);
        if (setupCode) {
          await py.runPythonAsync(setupCode);
        }
        await py.runPythonAsync(userCode);
        userOutput = await py.runPythonAsync("sys.stdout.getvalue()");
      } catch (err) {
        self.postMessage({
          id,
          result: {
            correct: false,
            feedback: \`Erro de sintaxe ou execução (\${formatPythonError(err)})\`,
            output: "",
          },
        });
        return;
      }

      try {
        py.globals.set("output", userOutput);
        py.globals.set("code", userCode);
        await py.runPythonAsync(challenge.testCode);
        self.postMessage({
          id,
          result: {
            correct: true,
            feedback: "Incrível! Seu código funcionou perfeitamente.",
            output: userOutput,
          },
        });
      } catch (err) {
        const msg = formatPythonError(err);
        const customDetail =
          msg.includes("AssertionError:") && msg.split("AssertionError:")[1]?.trim()
            ? msg.split("AssertionError:")[1].trim()
            : null;
        self.postMessage({
          id,
          result: {
            correct: false,
            feedback: customDetail
              ? \`Quase lá: \${customDetail}\`
              : "O código rodou, mas o resultado não é o esperado. Verifique a saída e os requisitos da missão!",
            output: userOutput,
          },
        });
      }
      return;
    }

    if (type === "RUN_BOSS") {
      const { accumulatedSetup, userCode, objectives } = payload;
      try {
        await py.runPythonAsync("_reset_globals()");
        const fullCode = \`\${accumulatedSetup}\\n\${userCode}\`;
        await py.loadPackagesFromImports(fullCode);
        await py.runPythonAsync(fullCode);
        const output = await py.runPythonAsync("sys.stdout.getvalue()");

        py.globals.set("output", output);
        py.globals.set("code", userCode);

        const results = [];
        for (let i = 0; i < objectives.length; i++) {
          const obj = objectives[i];
          try {
            const passed = await py.runPythonAsync(\`bool(\${obj.check})\`);
            results.push({
              index: i,
              label: obj.label,
              passed: !!passed,
            });
          } catch (e) {
            results.push({
              index: i,
              label: obj.label,
              passed: false,
              error: formatPythonError(e),
            });
          }
        }

        self.postMessage({
          id,
          result: { success: true, output, results },
        });
      } catch (err) {
        self.postMessage({
          id,
          result: {
            success: false,
            output: "",
            error: formatPythonError(err),
            results: objectives.map((o, i) => ({
              index: i,
              label: o.label,
              passed: false,
            })),
          },
        });
      }
      return;
    }
  } catch (fatalErr) {
    self.postMessage({
      id,
      error: fatalErr?.message || "Falha ao inicializar Pyodide no Worker",
    });
  }
};
`;

let worker: Worker | null = null;
let messageIdCounter = 0;
const pendingCallbacks = new Map<
  number,
  { resolve: (val: any) => void; reject: (err: any) => void; timer?: ReturnType<typeof setTimeout> }
>();

function getOrCreateWorker(): Worker {
  if (worker) return worker;

  const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  worker = new Worker(url);

  worker.onmessage = (event) => {
    const { id, result, error } = event.data;
    const entry = pendingCallbacks.get(id);
    if (!entry) return;
    pendingCallbacks.delete(id);
    if (entry.timer) clearTimeout(entry.timer);

    if (error) {
      entry.reject(new Error(error));
    } else {
      entry.resolve(result);
    }
  };

  worker.onerror = (err) => {
    console.error("Python Worker Error:", err);
  };

  return worker;
}

function terminateAndResetWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  for (const [, entry] of pendingCallbacks.entries()) {
    if (entry.timer) clearTimeout(entry.timer);
  }
  pendingCallbacks.clear();
  // Pré-aquece novo worker em background
  initPython().catch(() => {});
}

function callWorker<T>(
  type: string,
  payload: any = {},
  timeoutMs: number | null = EXECUTION_TIMEOUT_MS
): Promise<T> {
  return new Promise((resolve, reject) => {
    const w = getOrCreateWorker();
    const id = ++messageIdCounter;

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs !== null) {
      timer = setTimeout(() => {
        pendingCallbacks.delete(id);
        terminateAndResetWorker();
        reject(
          new Error(
            "Tempo limite de execução excedido (6s). Verifique se há um loop infinito (ex: while True sem break)."
          )
        );
      }, timeoutMs);
    }

    pendingCallbacks.set(id, { resolve, reject, timer });
    w.postMessage({ id, type, payload });
  });
}

export async function initPython(): Promise<boolean> {
  // Inicialização pode baixar o runtime Pyodide da CDN na 1ª vez, então sem timeout curto
  await callWorker("INIT", {}, null);
  return true;
}

export async function runPythonCode(
  code: string,
  setupCode: string = ""
): Promise<PythonResult> {
  try {
    return await callWorker<PythonResult>("RUN_CODE", { code, setupCode });
  } catch (err: any) {
    return {
      success: false,
      output: "",
      error: err.message,
    };
  }
}

export async function validatePythonChallenge(
  userCode: string,
  challenge: { setupCode: string; testCode: string; expectedOutput: string }
): Promise<{ correct: boolean; feedback: string; output: string }> {
  try {
    return await callWorker<{ correct: boolean; feedback: string; output: string }>(
      "VALIDATE_CHALLENGE",
      {
        userCode,
        challenge: {
          setupCode: challenge.setupCode,
          testCode: challenge.testCode,
          expectedOutput: challenge.expectedOutput,
        },
      }
    );
  } catch (err: any) {
    return {
      correct: false,
      feedback: `Erro de execução: ${err.message}`,
      output: "",
    };
  }
}

export async function runBossExecution(
  accumulatedSetup: string,
  userCode: string,
  objectives: { label: string; check: string }[]
): Promise<BossExecutionResult> {
  try {
    return await callWorker<BossExecutionResult>("RUN_BOSS", {
      accumulatedSetup,
      userCode,
      objectives,
    });
  } catch (err: any) {
    return {
      success: false,
      output: "",
      error: err.message,
      results: objectives.map((o, i) => ({
        index: i,
        label: o.label,
        passed: false,
      })),
    };
  }
}
