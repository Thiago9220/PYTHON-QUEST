import { BossChallenge } from "../types";

export const HYDRA_LISTAS_BOSS: BossChallenge = {
  id: "boss-ninho-listas",
  worldId: "ninho-listas",
  title: "Hidra de Buffers",
  codename: "Expurgo em Lote",
  intro:
    "AI-7 detecta múltiplas cabeças de memória alocadas em paralelo. // ALERTA: A Hidra de Buffers corrompeu a fila de pacotes do Ninho das Listas. Use slicing, métodos de lista (.append, .remove, sorted) e list comprehension para cortar cada cabeça de dados antes que o buffer transborde.",
  finalStory:
    "BUFFERS SINCRONIZADOS. As três cabeças da Hidra foram reduzidas a vetores ordenados e limpos. O fluxo em lote do Core agora pertence a você.",
  unlockThreshold: 0.7,
  xpReward: 10500,
  acts: [
    {
      id: "act-1",
      title: "Fatiamento de Pacotes",
      narrative:
        "O buffer `pacotes = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5']` contém lixo nas extremidades. Extraia os 3 elementos centrais (`'P2'`, `'P3'`, `'P4'`) usando slicing para `nucleo_pacotes`. Imprima `NUCLEO: <nucleo_pacotes>`.",
      setupCode: "pacotes = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5']\n",
      starterHint:
        "# Ato 1\n# 1. Crie nucleo_pacotes usando slicing [2:5] de pacotes\n# 2. Imprima: NUCLEO: <nucleo_pacotes>\n",
      objectives: [
        {
          label: "nucleo_pacotes == ['P2', 'P3', 'P4']",
          check: "nucleo_pacotes == ['P2', 'P3', 'P4']",
        },
        {
          label: "Output contém \"NUCLEO: ['P2', 'P3', 'P4']\"",
          check: "\"NUCLEO: ['P2', 'P3', 'P4']\" in output",
        },
      ],
      hints: [
        {
          text: "nucleo_pacotes = pacotes[2:5] pega os índices 2, 3 e 4.",
          cost: 50,
        },
        {
          text: "print(f'NUCLEO: {nucleo_pacotes}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-2",
      title: "Purificação da Fila",
      narrative:
        "A lista `latencias = [45, 12, 99, 8, 30]` precisa ser saneada. Crie `latencias_boas` contendo apenas os valores `< 50`, ordenados do menor para o maior (`sorted`). Imprima `LATENCIAS: <latencias_boas>`.",
      setupCode: "latencias = [45, 12, 99, 8, 30]\n",
      starterHint:
        "# Ato 2\n# 1. Filtre latencias < 50 e ordene em latencias_boas\n# 2. Imprima: LATENCIAS: <latencias_boas>\n",
      objectives: [
        {
          label: "latencias_boas == [8, 12, 30, 45]",
          check: "latencias_boas == [8, 12, 30, 45]",
        },
        {
          label: "Output contém 'LATENCIAS: [8, 12, 30, 45]'",
          check: "'LATENCIAS: [8, 12, 30, 45]' in output",
        },
      ],
      hints: [
        {
          text: "latencias_boas = sorted([x for x in latencias if x < 50])",
          cost: 50,
        },
        {
          text: "print(f'LATENCIAS: {latencias_boas}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-3",
      title: "Consolidação do Vetor",
      narrative:
        "Calcule a soma total de `latencias_boas` na variável `soma_latencias` e o tamanho de `nucleo_pacotes` em `qtd_nucleo`. Imprima `>>> HIDRA PURGED: <qtd_nucleo>|<soma_latencias>`.",
      setupCode: "",
      starterHint:
        "# Ato 3 — FINAL\n# 1. soma_latencias = sum(latencias_boas)\n# 2. qtd_nucleo = len(nucleo_pacotes)\n# 3. Imprima: >>> HIDRA PURGED: <qtd_nucleo>|<soma_latencias>\n",
      objectives: [
        {
          label: "soma_latencias == 95",
          check: "soma_latencias == 95",
        },
        {
          label: "qtd_nucleo == 3",
          check: "qtd_nucleo == 3",
        },
        {
          label: "Output contém '>>> HIDRA PURGED: 3|95'",
          check: "'>>> HIDRA PURGED: 3|95' in output",
        },
      ],
      hints: [
        {
          text: "sum([8, 12, 30, 45]) == 95 e len(['P2', 'P3', 'P4']) == 3.",
          cost: 50,
        },
        {
          text: "print(f'>>> HIDRA PURGED: {qtd_nucleo}|{soma_latencias}')",
          cost: 100,
        },
      ],
    },
  ],
};

