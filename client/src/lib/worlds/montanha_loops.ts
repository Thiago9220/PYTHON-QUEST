import { World } from "../types";

export const MONTANHA_LOOPS_WORLD: World = {
  id: "montanha-loops",
  title: "Pico da Eternidade",
  subtitle: "Onde o tempo se dobra",
  icon: "refresh-cw",
  color: "#F97316",
  lore: "No Pico da Eternidade, o ar é rarefeito e o tempo flui em ciclos. Aqui, você deve aprender a controlar as Espirais da Repetição para realizar tarefas monumentais com um único comando.",
  unlockRequirement: 800,
  challenges: [
    {
      id: "py-loop-01",
      worldId: "montanha-loops",
      title: "As Cinco Orações",
      description: "Use o comando for e a função range() para projetar os números de 0 a 4.",
      narrative: "Para acalmar os ventos do pico, você deve entoar cinco orações numéricas. Não as escreva uma a uma; use a Espiral do 'for' para automatizar o cântico.",
      difficulty: "intermediario",
      setupCode: "",
      expectedOutput: "0\n1\n2\n3\n4",
      testCode: "assert output.strip() == '0\\n1\\n2\\n3\\n4'",
      starterCode: "# Inicie a Espiral com for e range(5)\n",
      hints: [
        { text: "A função range(5) cria uma sequência sagrada de 0 até 4.", cost: 10 },
        { text: "O ritual print() deve ser executado para cada iteração da espiral.", cost: 20 },
        { text: "for i in range(5):\n    print(i)", cost: 30 },
      ],
      xpReward: 300,
      concept: "A Espiral 'for' e o 'range'",
      conceptExplanation: "O loop 'for' permite que você execute o mesmo bloco de código várias vezes. O 'range()' define quantas vezes ou sobre qual intervalo essa repetição ocorrerá.",
      successNpc: "Rafa, Eremita do Pico",
      successAvatar: "/avatars/wizard.webp",
      successStory: "Os ventos se acalmaram. As cinco orações ecoaram pela montanha, e a espiral do tempo agora trabalha a seu favor.",
    },
  ],
};
