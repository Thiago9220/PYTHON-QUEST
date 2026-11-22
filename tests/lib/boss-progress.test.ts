/**
 * mergeBossProgress junta o progresso de chefes do banco (jsonb livre) e do
 * cache local: vencido em qualquer fonte continua vencido.
 */
import { describe, expect, it } from "vitest";
import { mergeBossProgress } from "../../client/src/lib/gameLogic";

describe("mergeBossProgress", () => {
  it("une chefes vencidos das duas fontes", () => {
    const db = { "boss-a": { defeated: true, totalHintsUsed: 2, durationSec: 300, defeatedAt: 200 } };
    const cache = { "boss-b": { defeated: true, totalHintsUsed: 0 } };
    expect(Object.keys(mergeBossProgress(db, cache)).sort()).toEqual(["boss-a", "boss-b"]);
  });

  it("mantém o melhor resultado quando o chefe aparece nas duas", () => {
    const merged = mergeBossProgress(
      { "boss-a": { defeated: true, totalHintsUsed: 3, durationSec: 500, defeatedAt: 900 } },
      { "boss-a": { defeated: true, totalHintsUsed: 1, durationSec: 800, defeatedAt: 100 } },
    );
    expect(merged["boss-a"]).toEqual({ defeated: true, totalHintsUsed: 1, durationSec: 500, defeatedAt: 100 });
  });

  it("ignora entradas não vencidas ou malformadas", () => {
    const merged = mergeBossProgress(
      { "boss-a": { defeated: false, totalHintsUsed: 0 }, "boss-b": null, "boss-c": "sim" } as Record<string, unknown>,
      null,
      undefined,
    );
    expect(merged).toEqual({});
  });
});
