import { World } from "../types";

export const MONTANHA_LOOPS_WORLD: World = {
  id: "montanha-loops",
  title: "Montanha dos Loops",
  subtitle: "O Ciclo Infinito",
  icon: "refresh-cw",
  color: "#FF9800",
  lore: "Escalar a Montanha dos Loops exige persistência. Aqui você aprenderá a repetir tarefas sem se cansar, usando o poder da iteração.",
  unlockRequirement: 800,
  challenges: [
    {
      id: "py-loop-01",
      worldId: "montanha-loops",
      title: "A Escada de Números",
      description: "Use um loop 'for' e a função 'range()' para imprimir os números de 0 a 4.",
      narrative: "Cada degrau é um número. 'Não suba um por um manualmente', diz o eremita da montanha. 'Deixe que o loop faça o trabalho pesado.'",
      difficulty: "intermediário",
      setupCode: "",
      expectedOutput: "0\n1\n2\n3\n4",
      testCode: "assert output.strip() == '0\\n1\\n2\\n3\\n4'",
      starterCode: "# Use for e range(5)\n",
      hints: [
        { text: "range(5) gera números de 0 a 4.", cost: 10 },
        { text: "for i in range(5):\n    print(i)", cost: 30 },
      ],
      xpReward: 300,
      concept: "Loop for e range()",
      conceptExplanation: "O loop `for` percorre uma sequência de elementos. A função `range(n)` cria uma sequência de 0 até n-1.",
      successNpc: "Eremita Digital",
      successAvatar: "/avatars/wizard.webp",
      successStory: "Você subiu os degraus com a agilidade de um veterano. A repetição agora é sua escrava.",
    }
  ]
};
