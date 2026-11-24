/**
 * Conquistas ganhas sem a Steam conectada (jogo aberto fora dela, progresso da
 * demo) precisam chegar à Steam na próxima sessão: o jogo reenvia todas as
 * desbloqueadas do save ao abrir.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { resyncSteamAchievements } from "../../client/src/lib/platform";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("reenvio de conquistas à Steam", () => {
  it("envia só as desbloqueadas", async () => {
    const unlockAchievement = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("window", { steamBridge: { unlockAchievement } });

    await resyncSteamAchievements([
      { id: "first_challenge", unlocked: true },
      { id: "xp_500", unlocked: false },
      { id: "world_vila-variaveis_complete", unlocked: true },
    ]);

    expect(unlockAchievement).toHaveBeenCalledTimes(2);
    expect(unlockAchievement).toHaveBeenCalledWith("first_challenge");
    expect(unlockAchievement).toHaveBeenCalledWith("world_vila-variaveis_complete");
  });

  it("não quebra fora do desktop (versão web)", async () => {
    vi.stubGlobal("window", {});
    await expect(
      resyncSteamAchievements([{ id: "first_challenge", unlocked: true }])
    ).resolves.toBeUndefined();
  });

  it("uma falha da Steam não interrompe as outras", async () => {
    const unlockAchievement = vi
      .fn()
      .mockRejectedValueOnce(new Error("Steam offline"))
      .mockResolvedValue(true);
    vi.stubGlobal("window", { steamBridge: { unlockAchievement } });

    await resyncSteamAchievements([
      { id: "first_challenge", unlocked: true },
      { id: "xp_500", unlocked: true },
    ]);

    expect(unlockAchievement).toHaveBeenCalledTimes(2);
  });
});
