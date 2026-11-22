/**
 * Modo demo (VITE_DEMO=true): só os setores de DEMO_WORLD_IDS abrem, mesmo em
 * modo dev; o jogo completo continua igual quando a flag está desligada.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { getWorldUnlockStatus } from "../../client/src/lib/gameLogic";
import { DEMO_WORLD_IDS, getStoreUrl, isDemoLocked } from "../../client/src/lib/platform";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("build de demo", () => {
  it("abre só os setores da demo", () => {
    vi.stubEnv("VITE_DEMO", "true");
    for (const id of DEMO_WORLD_IDS) {
      expect(getWorldUnlockStatus(id, 999_999, false)).toBe(true);
    }
    expect(getWorldUnlockStatus("ninho-listas", 999_999, false)).toBe(false);
    expect(getWorldUnlockStatus("oraculo-generativo", 999_999, false)).toBe(false);
  });

  it("modo dev não fura a demo", () => {
    vi.stubEnv("VITE_DEMO", "true");
    expect(getWorldUnlockStatus("refinaria-dados", 0, true)).toBe(false);
    expect(isDemoLocked("refinaria-dados")).toBe(true);
  });
});

describe("jogo completo", () => {
  it("não tem trava de demo", () => {
    vi.stubEnv("VITE_DEMO", "");
    expect(isDemoLocked("refinaria-dados")).toBe(false);
    expect(getWorldUnlockStatus("ninho-listas", 999_999, false)).toBe(true);
    expect(getWorldUnlockStatus("refinaria-dados", 0, true)).toBe(true);
  });
});

describe("link da loja", () => {
  it("só existe com o app id configurado", () => {
    vi.stubEnv("VITE_STEAM_STORE_APPID", "");
    expect(getStoreUrl()).toBeNull();
    vi.stubEnv("VITE_STEAM_STORE_APPID", "123456");
    expect(getStoreUrl()).toBe("https://store.steampowered.com/app/123456/");
  });
});
