import { defineConfig } from "vitest/config";

// Config própria do Vitest: o vite.config.ts da raiz aponta `root` para client/.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    pool: "forks",
    testTimeout: 120_000,
    hookTimeout: 600_000,
  },
});
