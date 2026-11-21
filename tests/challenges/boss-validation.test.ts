/**
 * Garante que todo ato de chefe pode ser vencido no Pyodide real e que
 * respostas erradas conhecidas não passam. Reproduz useBossEngine.ts:
 * o editor começa com starterHint e o código/setup dos atos se acumulam.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { WORLDS } from "../../client/src/lib/challenges";
import type { BossChallenge } from "../../client/src/lib/types";
import { BOSS_SOLUTIONS, BOSS_WRONG_ATTEMPTS } from "./boss-solutions";
import { createPythonWorker, type PythonWorker } from "./pyodide-worker";

const bosses = WORLDS.flatMap((world) => (world.boss ? [world.boss] : []));
const bossById = new Map(bosses.map((boss) => [boss.id, boss]));

let runBoss: PythonWorker["runBoss"];

beforeAll(async () => {
  ({ runBoss } = await createPythonWorker());
});

/** Código do jogador por ato: o starterHint (comentários) + a solução. */
function actCodes(boss: BossChallenge, solutions: string[]): string[] {
  return boss.acts.map((act, i) => `${act.starterHint ?? ""}${solutions[i] ?? ""}`);
}

function runAct(boss: BossChallenge, codes: string[], actIndex: number) {
  const setup = boss.acts
    .slice(0, actIndex + 1)
    .map((act) => act.setupCode)
    .join("\n");
  const userCode = codes.slice(0, actIndex + 1).join("\n");
  return runBoss(setup, userCode, boss.acts[actIndex].objectives);
}

describe("todo chefe tem solução de referência para cada ato", () => {
  it.each(bosses.map((b) => [b.id, b] as const))("%s", (_id, boss) => {
    expect(BOSS_SOLUTIONS[boss.id]?.length).toBe(boss.acts.length);
  });
});

describe("atos dos chefes podem ser vencidos", () => {
  const cases = bosses.flatMap((boss) =>
    boss.acts.map((act, i) => [`${boss.id} — ato ${i + 1}: ${act.title}`, boss, i] as const),
  );
  it.each(cases)("%s", async (_name, boss, actIndex) => {
    const result = await runAct(boss, actCodes(boss, BOSS_SOLUTIONS[boss.id] ?? []), actIndex);
    const failed = result.results.filter((r) => !r.passed).map((r) => r.label);
    expect(result.error ?? "", `saída: ${result.output}`).toBe("");
    expect(failed, `saída: ${result.output}`).toEqual([]);
  });
});

describe("respostas erradas não vencem o ato", () => {
  it.each(BOSS_WRONG_ATTEMPTS.map((a) => [`${a.bossId} — ato ${a.act + 1}: ${a.label}`, a] as const))(
    "%s",
    async (_name, attempt) => {
      const boss = bossById.get(attempt.bossId)!;
      const solutions = [...BOSS_SOLUTIONS[boss.id]];
      solutions[attempt.act] = attempt.code;
      const result = await runAct(boss, actCodes(boss, solutions), attempt.act);
      const allPassed = result.success && result.results.every((r) => r.passed);
      expect(allPassed).toBe(false);
    },
  );
});
