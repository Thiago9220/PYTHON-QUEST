import { BossChallenge } from "../types";

export const CHRONOS_LOOPS_BOSS: BossChallenge = {
  id: "boss-montanha-loops",
  worldId: "montanha-loops",
  title: "Reator Chronos",
  codename: "Sobrecarga de Ciclos",
  intro:
    "AI-7 alerta sobre pico térmico no Setor de Iteração. // ALERTA: O Reator Chronos bloqueia a passagem com três bobinas sincronizadas. Você precisará de loops for, filtragem modular e acumuladores iterativos para estabilizar o núcleo sem causar loop infinito.",
  finalStory:
    "NÚCLEO CHRONOS ESTABILIZADO. Os ciclos de CPU agora respondem ao seu comando e o caminho para o Repositório de Funções está aberto!",
  unlockThreshold: 0.7,
  xpReward: 11000,
  acts: [
    {
      id: "act-1",
      title: "Varredura Harmônica",
      narrative:
        "Some todos os múltiplos de 3 no intervalo de `1` até `15` (inclusive) usando um loop e armazene na variável `soma_harmonica`. Imprima `HARMONICA: <soma_harmonica>`.",
      setupCode: "",
      starterHint:
        "# Ato 1\n# 1. Inicialize soma_harmonica = 0\n# 2. Percorra range(1, 16) e some os números divisíveis por 3 (n % 3 == 0)\n# 3. Imprima: HARMONICA: <soma_harmonica>\n",
      objectives: [
        {
          label: "soma_harmonica == 45",
          check: "soma_harmonica == 45",
        },
        {
          label: "Output contém 'HARMONICA: 45'",
          check: "'HARMONICA: 45' in output",
        },
      ],
      hints: [
        {
          text: "Use for n in range(1, 16): e verifique if n % 3 == 0:",
          cost: 50,
        },
        {
          text: "3 + 6 + 9 + 12 + 15 resulta em 45.",
          cost: 75,
        },
        {
          text: "print(f'HARMONICA: {soma_harmonica}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-2",
      title: "Filtragem de Pulsos",
      narrative:
        "A lista `pulsos = [12, -5, 20, 0, -3, 8]` contém leituras da bobina. Percorra a lista e conte quantos pulsos são estritamente positivos (`> 0`) na variável `pulsos_validos`. Imprima `VALIDOS: <pulsos_validos>`.",
      setupCode: "pulsos = [12, -5, 20, 0, -3, 8]\n",
      starterHint:
        "# Ato 2\n# 1. Conte quantos números em pulsos são > 0 na variável pulsos_validos\n# 2. Imprima: VALIDOS: <pulsos_validos>\n",
      objectives: [
        {
          label: "pulsos_validos == 3",
          check: "pulsos_validos == 3",
        },
        {
          label: "Output contém 'VALIDOS: 3'",
          check: "'VALIDOS: 3' in output",
        },
      ],
      hints: [
        {
          text: "Inicialize pulsos_validos = 0 e faça for p in pulsos: if p > 0: pulsos_validos += 1",
          cost: 50,
        },
        {
          text: "print(f'VALIDOS: {pulsos_validos}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-3",
      title: "Fusão de Frequência",
      narrative:
        "Calcule a `frequencia_final` multiplicando `soma_harmonica` por `pulsos_validos`. Imprima `>>> CHRONOS SYNC: <frequencia_final>Hz`.",
      setupCode: "",
      starterHint:
        "# Ato 3 — FINAL\n# 1. frequencia_final = soma_harmonica * pulsos_validos\n# 2. Imprima: >>> CHRONOS SYNC: <frequencia_final>Hz\n",
      objectives: [
        {
          label: "frequencia_final == 135",
          check: "frequencia_final == 135",
        },
        {
          label: "Output contém '>>> CHRONOS SYNC: 135Hz'",
          check: "'>>> CHRONOS SYNC: 135Hz' in output",
        },
      ],
      hints: [
        {
          text: "frequencia_final = soma_harmonica * pulsos_validos (45 * 3 = 135)",
          cost: 50,
        },
        {
          text: "print(f'>>> CHRONOS SYNC: {frequencia_final}Hz')",
          cost: 100,
        },
      ],
    },
  ],
};

