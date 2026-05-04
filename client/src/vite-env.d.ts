/// <reference types="vite/client" />

declare module "canvas-confetti" {
  type Options = {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
  };

  export default function confetti(options?: Options): void;
}
