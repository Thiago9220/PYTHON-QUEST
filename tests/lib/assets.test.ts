/**
 * Todo caminho de asset citado no código (avatares, imagens, ícones de
 * conquista) precisa existir em client/public. Evita imagens quebradas como o
 * antigo avatar padrão "/avatars/hacker.webp", que nunca existiu.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const clientDir = path.resolve(import.meta.dirname, "../../client");
const publicDir = path.join(clientDir, "public");

// Faixas opcionais (sem o arquivo, o jogo toca o ambiente procedural) e
// caminhos citados só para migrar saves antigos.
const ALLOWED_MISSING = [/^\/music\/[a-z0-9]+\.mp3$/, /^\/avatars\/hacker\.webp$/];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|mjs|cjs|html)$/.test(name) ? [full] : [];
  });
}

const refs = new Map<string, string>();
for (const file of [...sourceFiles(path.join(clientDir, "src")), ...sourceFiles(path.join(clientDir, "electron"))]) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/["'`](\/(?:avatars|assets|achievements|music)\/[^"'`$\s)]+)["'`]/g)) {
    if (!refs.has(match[1])) refs.set(match[1], path.relative(clientDir, file));
  }
}

describe("assets referenciados no código", () => {
  it("encontra referências para checar", () => {
    expect(refs.size).toBeGreaterThan(50);
  });

  it.each([...refs.entries()])("%s (citado em %s) existe", (assetPath) => {
    if (ALLOWED_MISSING.some((pattern) => pattern.test(assetPath))) return;
    expect(existsSync(path.join(publicDir, assetPath))).toBe(true);
  });
});
