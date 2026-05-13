/**
 * PYTHON-QUEST — Motor Python
 * Usa Pyodide para executar Python real no navegador via WebAssembly.
 */

declare global {
  interface Window {
    loadPyodide: any;
  }
}

let pyodide: any = null;

async function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.loadPyodide) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar Pyodide"));
    document.head.appendChild(script);
  });
}

export async function initPython(): Promise<any> {
  if (pyodide) return pyodide;
  await loadPyodideScript();
  pyodide = await window.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
  });
  return pyodide;
}

export type PythonResult = {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
};

export async function runPythonCode(code: string, setupCode: string = ""): Promise<PythonResult> {
  const start = performance.now();
  if (!pyodide) await initPython();

  try {
    // Redirecionar stdout para capturar prints
    await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
`);

    const fullCode = `${setupCode}\n${code}`;
    await pyodide.loadPackagesFromImports(fullCode);

    if (setupCode) {
      await pyodide.runPythonAsync(setupCode);
    }

    await pyodide.runPythonAsync(code);
    
    const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");
    const elapsed = performance.now() - start;

    return {
      success: true,
      output: output,
      executionTime: elapsed,
    };
  } catch (err: any) {
    const elapsed = performance.now() - start;
    return {
      success: false,
      output: "",
      error: err.message,
      executionTime: elapsed,
    };
  }
}

export async function validatePythonChallenge(
  userCode: string,
  challenge: { setupCode: string; testCode: string; expectedOutput: string }
): Promise<{ correct: boolean; feedback: string; output: string }> {
  const result = await runPythonCode(userCode, challenge.setupCode);

  if (!result.success) {
    return {
      correct: false,
      feedback: `Erro de sintaxe ou execução: ${result.error}`,
      output: "",
    };
  }

  try {
    // Injetar o output e o código original no ambiente Python para o testCode poder validar
    pyodide.globals.set("output", result.output);
    pyodide.globals.set("code", userCode);

    // Executar o código de teste
    await pyodide.runPythonAsync(challenge.testCode);

    return {
      correct: true,
      feedback: "Incrível! Seu código funcionou perfeitamente.",
      output: result.output,
    };
  } catch (err: any) {
    return {
      correct: false,
      feedback: "O código rodou, mas o resultado não é o esperado. Tente novamente!",
      output: result.output,
    };
  }
}

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

/**
 * Executa o código acumulado do boss e avalia cada objetivo
 * de cada ato em sequência. Retorna o status individual de cada objetivo.
 */
export async function runBossExecution(
  accumulatedSetup: string,
  userCode: string,
  objectives: { label: string; check: string }[]
): Promise<BossExecutionResult> {
  if (!pyodide) await initPython();

  try {
    // Reset stdout e namespace
    await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
`);

    const fullCode = `${accumulatedSetup}\n${userCode}`;
    await pyodide.loadPackagesFromImports(fullCode);

    // Roda setup + código do aluno
    await pyodide.runPythonAsync(fullCode);

    const output: string = await pyodide.runPythonAsync(
      "sys.stdout.getvalue()"
    );

    // Injeta output no namespace para os checks usarem
    pyodide.globals.set("output", output);
    pyodide.globals.set("code", userCode);

    // Avalia cada objetivo
    const results: BossObjectiveResult[] = [];
    for (let i = 0; i < objectives.length; i++) {
      const obj = objectives[i];
      try {
        const passed = await pyodide.runPythonAsync(`bool(${obj.check})`);
        results.push({
          index: i,
          label: obj.label,
          passed: !!passed,
        });
      } catch (e: any) {
        results.push({
          index: i,
          label: obj.label,
          passed: false,
          error: e.message,
        });
      }
    }

    return { success: true, output, results };
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
