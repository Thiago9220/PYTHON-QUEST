import { getSavedLanguage, type AppLanguage } from "@/contexts/LanguageContext";

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

async function ensurePyodide(localBaseUrl) {
  if (pyodide) return pyodide;
  if (!initPromise) {
    initPromise = (async () => {
      const cdnBaseUrl = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/";
      let activeBaseUrl = cdnBaseUrl;

      if (localBaseUrl) {
        try {
          importScripts(localBaseUrl + "pyodide.js");
          activeBaseUrl = localBaseUrl;
        } catch (_localErr) {
          importScripts(cdnBaseUrl + "pyodide.js");
          activeBaseUrl = cdnBaseUrl;
        }
      } else {
        importScripts(cdnBaseUrl + "pyodide.js");
      }

      pyodide = await self.loadPyodide({
        indexURL: activeBaseUrl,
      });
      // Snapshot initial globals and install mock module bridge for offline DS/ML challenges
      await pyodide.runPythonAsync(\`
import sys, io, types, importlib.abc, importlib.machinery

_MOCKED_ROOTS = {
    "scipy", "matplotlib", "sklearn", "statsmodels", "seaborn",
    "tensorflow", "torch", "transformers", "nltk", "spacy",
    "sentence_transformers", "prophet", "openai", "anthropic",
    "langchain", "tiktoken",
}
_ALIAS_TARGET = {
    "matplotlib.pyplot": "plt",
    "seaborn": "sns",
    "statsmodels.api": "sm",
    "scipy.stats": "stats",
    "torch.nn": "nn",
    "torch.optim": "optim",
    "nltk": "nltk",
    "spacy": "spacy",
    "tiktoken": "tiktoken",
    "torch": "torch",
}
_MOCK_GLOBALS = {}
_MOCK_ACTIVE = False
_INITIAL_SYS_MODULES = set(sys.modules.keys())

class _MockModule(types.ModuleType):
    def __init__(self, fullname):
        super().__init__(fullname)
        self.__path__ = []
        self.__package__ = fullname
    def __getattr__(self, name):
        if name.startswith("__") and name.endswith("__"):
            raise AttributeError(name)
        alias = _ALIAS_TARGET.get(self.__name__)
        if alias and alias in _MOCK_GLOBALS:
            target = _MOCK_GLOBALS[alias]
            if hasattr(target, name):
                return getattr(target, name)
        if name in _MOCK_GLOBALS:
            return _MOCK_GLOBALS[name]
        if self.__name__ == "spacy" and name == "load" and "nlp" in _MOCK_GLOBALS:
            return lambda *args, **kwargs: _MOCK_GLOBALS["nlp"]
        if self.__name__ == "sentence_transformers" and name == "SentenceTransformer" and "model" in _MOCK_GLOBALS:
            return lambda *args, **kwargs: _MOCK_GLOBALS["model"]
        child_name = f"{self.__name__}.{name}"
        if child_name in sys.modules:
            return sys.modules[child_name]
        if any(k == child_name or k.startswith(child_name + ".") for k in _ALIAS_TARGET):
            mod = _MockModule(child_name)
            sys.modules[child_name] = mod
            return mod
        raise AttributeError(f"module '{self.__name__}' has no attribute '{name}'")

class _MockLoader(importlib.abc.Loader):
    def create_module(self, spec):
        return _MockModule(spec.name)
    def exec_module(self, module):
        pass

class _MockFinder(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path, target=None):
        if not _MOCK_ACTIVE:
            return None
        root = fullname.split(".")[0]
        if root not in _MOCKED_ROOTS:
            return None
        return importlib.machinery.ModuleSpec(fullname, _MockLoader(), is_package=True)

sys.meta_path.insert(0, _MockFinder())

def _activate_mock_bridge():
    global _MOCK_GLOBALS, _MOCK_ACTIVE
    _MOCK_GLOBALS = {
        k: v for k, v in globals().items()
        if k not in _INITIAL_GLOBALS and not k.startswith("__")
    }
    _MOCK_ACTIVE = bool(_MOCK_GLOBALS)

def _reset_globals():
    global _MOCK_GLOBALS, _MOCK_ACTIVE
    _MOCK_GLOBALS = {}
    _MOCK_ACTIVE = False
    for mod_name in list(sys.modules.keys()):
        if mod_name.split(".")[0] in _MOCKED_ROOTS and mod_name not in _INITIAL_SYS_MODULES:
            del sys.modules[mod_name]
    for k in list(globals().keys()):
        if k not in _INITIAL_GLOBALS and not k.startswith("__"):
            del globals()[k]
    sys.stdout = io.StringIO()

_INITIAL_GLOBALS = set(globals().keys()) | {"_INITIAL_GLOBALS"}
\`);
      return pyodide;
    })();
  }
  return initPromise;
}

const _MOCKED_IMPORT_PREFIXES = [
  "scipy", "matplotlib", "sklearn", "statsmodels", "seaborn",
  "tensorflow", "torch", "transformers", "nltk", "spacy",
  "sentence_transformers", "prophet", "openai", "anthropic",
  "langchain", "tiktoken",
];

function stripMockedImportsForLoader(code, hasSetupMocks) {
  if (!hasSetupMocks || !code) return code;
  const mockedPattern = new RegExp(
    "^\\\\s*(?:import|from)\\\\s+(?:" + _MOCKED_IMPORT_PREFIXES.join("|") + ")(?:\\\\b|\\\\.)",
    "i"
  );
  return String(code)
    .split(new RegExp("\\\\r?\\\\n"))
    .filter((line) => !mockedPattern.test(line))
    .join("\\n");
}

function formatPythonError(err, lang = "pt") {
  if (!err || !err.message) {
    return lang === "en"
      ? "Unknown error during execution."
      : "Erro desconhecido durante a execução.";
  }
  const lines = String(err.message).trim().split("\\n");
  // Extract the last meaningful lines of the Python traceback
  const lastLine = lines[lines.length - 1] || err.message;
  const lineMatch = String(err.message).match(/File "<exec>", line (\\d+)/g);
  if (lineMatch && lineMatch.length > 0) {
    const linePrefix = lang === "en" ? "Line " : "Linha ";
    const lastLoc = lineMatch[lineMatch.length - 1].replace('File "<exec>", line ', linePrefix);
    return \`\${lastLoc}: \${lastLine}\`;
  }
  return lastLine;
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data;
  const lang = payload?.lang === "en" ? "en" : "pt";

  try {
    const py = await ensurePyodide(payload?.localBaseUrl);

    if (type === "INIT") {
      self.postMessage({ id, result: { ready: true } });
      return;
    }

    if (type === "RUN_CODE") {
      const start = performance.now();
      const { code, setupCode = "" } = payload;
      try {
        await py.runPythonAsync("_reset_globals()");
        const hasSetup = Boolean(setupCode && setupCode.trim());
        const fullCode = setupCode ? \`\${setupCode}\\n\${code}\` : code;
        await py.loadPackagesFromImports(stripMockedImportsForLoader(fullCode, hasSetup));
        if (setupCode) {
          await py.runPythonAsync(setupCode);
          await py.runPythonAsync("_activate_mock_bridge()");
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
            error: formatPythonError(err, lang),
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
        const hasSetup = Boolean(setupCode && setupCode.trim());
        const fullCode = setupCode ? \`\${setupCode}\\n\${userCode}\` : userCode;
        await py.loadPackagesFromImports(stripMockedImportsForLoader(fullCode, hasSetup));
        if (setupCode) {
          await py.runPythonAsync(setupCode);
          await py.runPythonAsync("_activate_mock_bridge()");
        }
        await py.runPythonAsync(userCode);
        userOutput = await py.runPythonAsync("sys.stdout.getvalue()");
      } catch (err) {
        const formattedErr = formatPythonError(err, lang);
        self.postMessage({
          id,
          result: {
            correct: false,
            feedback: lang === "en"
              ? \`Syntax or runtime error (\${formattedErr})\`
              : \`Erro de sintaxe ou execução (\${formattedErr})\`,
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
            feedback: lang === "en"
              ? "Awesome! Your code worked perfectly."
              : "Incrível! Seu código funcionou perfeitamente.",
            output: userOutput,
          },
        });
      } catch (err) {
        const msg = formatPythonError(err, lang);
        const customDetail =
          msg.includes("AssertionError:") && msg.split("AssertionError:")[1]?.trim()
            ? msg.split("AssertionError:")[1].trim()
            : null;
        self.postMessage({
          id,
          result: {
            correct: false,
            feedback: customDetail
              ? (lang === "en" ? \`Almost there: \${customDetail}\` : \`Quase lá: \${customDetail}\`)
              : (lang === "en"
                  ? "Code ran, but the output did not match expectations. Check your output and mission requirements!"
                  : "O código rodou, mas o resultado não é o esperado. Verifique a saída e os requisitos da missão!"),
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
              error: formatPythonError(e, lang),
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
            error: formatPythonError(err, lang),
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
      error: fatalErr?.message || (lang === "en" ? "Failed to initialize Pyodide in Worker" : "Falha ao inicializar Pyodide no Worker"),
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
  initPython().catch(() => { });
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
      const lang: AppLanguage = payload?.lang || getSavedLanguage();
      timer = setTimeout(() => {
        pendingCallbacks.delete(id);
        terminateAndResetWorker();
        reject(
          new Error(
            lang === "en"
              ? "Execution timeout exceeded (6s). Check for an infinite loop (e.g. while True without break)."
              : "Tempo limite de execução excedido (6s). Verifique se há um loop infinito (ex: while True sem break)."
          )
        );
      }, timeoutMs);
    }

    pendingCallbacks.set(id, { resolve, reject, timer });
    w.postMessage({ id, type, payload });
  });
}

export async function initPython(): Promise<boolean> {
  const localBaseUrl =
    typeof window !== "undefined" && window.location.origin.startsWith("http")
      ? `${window.location.origin}/pyodide/`
      : undefined;
  // Inicialização pode baixar o runtime Pyodide da CDN na 1ª vez, então sem timeout curto
  await callWorker("INIT", { localBaseUrl }, null);
  return true;
}

export async function runPythonCode(
  code: string,
  setupCode: string = "",
  lang: AppLanguage = getSavedLanguage()
): Promise<PythonResult> {
  try {
    return await callWorker<PythonResult>("RUN_CODE", { code, setupCode, lang });
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
  challenge: { setupCode: string; testCode: string; expectedOutput: string },
  lang: AppLanguage = getSavedLanguage()
): Promise<{ correct: boolean; feedback: string; output: string }> {
  try {
    return await callWorker<{ correct: boolean; feedback: string; output: string }>(
      "VALIDATE_CHALLENGE",
      {
        userCode,
        lang,
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
      feedback: lang === "en" ? `Execution error: ${err.message}` : `Erro de execução: ${err.message}`,
      output: "",
    };
  }
}

export async function runBossExecution(
  accumulatedSetup: string,
  userCode: string,
  objectives: { label: string; check: string }[],
  lang: AppLanguage = getSavedLanguage()
): Promise<BossExecutionResult> {
  try {
    return await callWorker<BossExecutionResult>("RUN_BOSS", {
      accumulatedSetup,
      userCode,
      objectives,
      lang,
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
