import path from "node:path";
import { defineConfig } from "vitest/config";

// Config própria do Vitest: o vite.config.ts da raiz aponta `root` para client/.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "client", "src") },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    pool: "forks",
    testTimeout: 120_000,
    hookTimeout: 600_000,
  },
});
