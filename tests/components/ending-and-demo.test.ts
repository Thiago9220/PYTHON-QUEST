/**
 * Renderiza a sequência de final e a tela de fim da demo com o React do client
 * (renderização em string, sem DOM): montam sem erro, nas duas línguas, e
 * mostram o conteúdo esperado de cada fase inicial.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const lang = vi.hoisted(() => ({ current: "pt" as "pt" | "en" }));

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({ lang: lang.current, t: (key: string) => key }),
}));
vi.mock("@/contexts/GameContext", () => ({
  useGame: () => ({
    state: { challengeProgress: { "py-01": { completed: true } }, totalXP: 30000 },
  }),
}));

async function render(componentPath: string, exportName: string, props: Record<string, unknown>) {
  const React = await import("../../client/node_modules/react");
  const { renderToStaticMarkup } = await import("../../client/node_modules/react-dom/server");
  const mod = await import(componentPath);
  return renderToStaticMarkup(React.createElement(mod[exportName], props));
}

afterEach(() => {
  lang.current = "pt";
  vi.unstubAllEnvs();
});

describe("EndingSequence", () => {
  const props = { themeColor: "#c084fc", onFinish: () => {} };

  it("abre na escolha final com as duas opções (PT)", async () => {
    const html = await render("../../client/src/components/EndingSequence", "EndingSequence", props);
    expect(html).toContain("A DECISÃO FINAL");
    expect(html).toContain("Desligar AURORA");
    expect(html).toContain("Retreinar AURORA");
  });

  it("abre na escolha final com as duas opções (EN)", async () => {
    lang.current = "en";
    const html = await render("../../client/src/components/EndingSequence", "EndingSequence", props);
    expect(html).toContain("THE FINAL DECISION");
    expect(html).toContain("Shut down AURORA");
    expect(html).toContain("Retrain AURORA");
  });
});

describe("DemoUpsellModal", () => {
  const path = "../../client/src/components/DemoUpsellModal";

  it("fim da demo sem App ID mostra o texto para procurar na Steam", async () => {
    vi.stubEnv("VITE_STEAM_STORE_APPID", "");
    const html = await render(path, "DemoUpsellModal", { completed: true, onClose: () => {} });
    expect(html).toContain("FIM DA DEMO");
    expect(html).toContain("Procure por Python Quest na Steam");
    expect(html).not.toContain("Adicionar à lista de desejos");
  });

  it("com App ID mostra o botão da lista de desejos", async () => {
    vi.stubEnv("VITE_STEAM_STORE_APPID", "123456");
    const html = await render(path, "DemoUpsellModal", { completed: false, onClose: () => {} });
    expect(html).toContain("DISPONÍVEL NO JOGO COMPLETO");
    expect(html).toContain("Adicionar à lista de desejos");
  });

  it("versão em inglês", async () => {
    lang.current = "en";
    const html = await render(path, "DemoUpsellModal", { completed: true, onClose: () => {} });
    expect(html).toContain("END OF DEMO");
    expect(html).toContain("Your demo progress carries over to the full game.");
  });
});
