/**
 * Garante que a validação dos desafios funciona no Pyodide real do jogo:
 * - toda solução oficial passa no próprio teste (senão o desafio é impossível
 *   ou o Modo Estudo entrega uma resposta que não passa);
 * - respostas erradas conhecidas falham e alternativas corretas passam;
 * - nos mundos de dados, a saída é conferida de forma exata.
 *
 * Rode com: npm run test:challenges
 */
import { beforeAll, describe, expect, it } from "vitest";
import { WORLDS } from "../../client/src/lib/challenges";
import attempts from "./attempts.json";
import { createPythonWorker, type PythonWorker } from "./pyodide-worker";

type Attempt = { id: string; label: string; expect: "pass" | "fail"; code: string };

// Mundos cujos testes comparam a saída inteira (não aceitam saída a mais).
const STRICT_OUTPUT_WORLDS = new Set([
  "refinaria-dados",
  "sala-comando-visual",
  "laboratorio-neural",
  "nucleo-sintetico",
  "camara-probabilidades",
  "cronograma-temporal",
  "sintetizador-linguagem",
  "oraculo-generativo",
]);

const challenges = WORLDS.flatMap((world) => world.challenges);
const byId = new Map(challenges.map((challenge) => [challenge.id, challenge]));
const withSolution = challenges.filter((challenge) => challenge.solution);

let validate: PythonWorker["validate"];

beforeAll(async () => {
  ({ validate } = await createPythonWorker());
});

describe("soluções oficiais passam no próprio teste", () => {
  it.each(withSolution.map((c) => [c.id, c] as const))("%s", async (_id, challenge) => {
    const result = await validate(challenge.solution!, challenge);
    expect(result.correct, `${result.feedback}\nsaída: ${result.output}`).toBe(true);
  });
});

describe("tentativas conhecidas (certas e erradas)", () => {
  it.each((attempts as Attempt[]).map((a) => [`${a.id} — ${a.label}`, a] as const))(
    "%s",
    async (_name, attempt) => {
      const challenge = byId.get(attempt.id);
      expect(challenge, `desafio ${attempt.id} não existe`).toBeDefined();
      const result = await validate(attempt.code, challenge!);
      expect(result.correct ? "pass" : "fail", result.feedback).toBe(attempt.expect);
    },
  );
});

describe("mundos de dados rejeitam saída a mais", () => {
  const strict = withSolution.filter((c) => STRICT_OUTPUT_WORLDS.has(c.worldId));
  it.each(strict.map((c) => [c.id, c] as const))("%s", async (_id, challenge) => {
    const result = await validate(`${challenge.solution}\nprint('saida extra')`, challenge);
    expect(result.correct).toBe(false);
  });
});
