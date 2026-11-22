/**
 * Conquistas: toda conquista tem condição, ícone e tradução; as conquistas da
 * campanha dependem dos chefes; títulos renomeados migram ao carregar o save.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { gameReducer, INITIAL_STATE } from "../../client/src/contexts/gameReducer";
import {
  ACHIEVEMENTS_ROOT,
  LEGACY_TITLE_REWARDS,
  getAchievementConditions,
} from "../../client/src/lib/achievements";
import { ACHIEVEMENTS_EN } from "../../client/src/lib/i18n/worlds_en";

const publicDir = path.resolve(import.meta.dirname, "../../client/public");
const emptyState = { ...INITIAL_STATE, challengeProgress: {}, bossProgress: {} };

describe("catálogo de conquistas", () => {
  const conditions = getAchievementConditions(emptyState);

  it.each(ACHIEVEMENTS_ROOT.map((a) => [a.id, a] as const))("%s", (id, achievement) => {
    expect(conditions, "sem condição").toHaveProperty(id);
    expect(existsSync(path.join(publicDir, achievement.icon)), `ícone ${achievement.icon}`).toBe(true);
    expect(ACHIEVEMENTS_EN[id], "sem tradução EN").toBeDefined();
  });
});

describe("conquistas da campanha", () => {
  it("dependem dos chefes Kernel Panic e AURORA", () => {
    expect(getAchievementConditions(emptyState).boss_kernel_panic).toBe(false);
    expect(getAchievementConditions(emptyState).boss_aurora).toBe(false);

    const won = {
      ...emptyState,
      bossProgress: {
        "boss-bunker-excecoes": { defeated: true, totalHintsUsed: 0 },
        "boss-oraculo-generativo": { defeated: true, totalHintsUsed: 0 },
      },
    };
    expect(getAchievementConditions(won).boss_kernel_panic).toBe(true);
    expect(getAchievementConditions(won).boss_aurora).toBe(true);
  });
});

describe("títulos renomeados", () => {
  it.each(Object.entries(LEGACY_TITLE_REWARDS))("%s → %s ao carregar o save", (oldTitle, newTitle) => {
    const loaded = gameReducer(INITIAL_STATE, {
      type: "LOAD_STATE",
      state: { ...INITIAL_STATE, equippedTitle: oldTitle },
    });
    expect(loaded.equippedTitle).toBe(newTitle);
    expect(ACHIEVEMENTS_ROOT.some((a) => a.titleReward === newTitle)).toBe(true);
  });
});
