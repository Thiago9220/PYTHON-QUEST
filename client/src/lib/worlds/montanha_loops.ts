import { World } from "../types";

export const MONTANHA_LOOPS_WORLD: World = {
  id: "montanha-loops",
  title: "Trilhos da Repeticao",
  subtitle: "Automacao em movimento",
  icon: "refresh-cw",
  color: "#F97316",
  lore: "Nos Trilhos da Repeticao, pequenos vagoes executam a mesma tarefa varias vezes. Loops economizam trabalho e reduzem erros.",
  unlockRequirement: 800,
  challenges: [
    {
      id: "py-loop-01",
      worldId: "montanha-loops",
      title: "Cinco Paradas",
      description: "Use for e range() para imprimir os numeros de 0 a 4.",
      narrative: "O trem de teste precisa parar em cinco pontos numerados. Programe o painel para listar cada parada automaticamente.",
      difficulty: "intermediario",
      setupCode: "",
      expectedOutput: "0\n1\n2\n3\n4",
      testCode: "assert output.strip() == '0\\n1\\n2\\n3\\n4'",
      starterCode: "# Use for e range(5)\n",
      hints: [
        { text: "range(5) gera 0, 1, 2, 3 e 4.", cost: 10 },
        { text: "Use print() dentro do for.", cost: 20 },
        { text: "for i in range(5):\n    print(i)", cost: 30 },
      ],
      xpReward: 300,
      concept: "for e range()",
      conceptExplanation: "for percorre uma sequencia. range(n) cria uma sequencia numerica de 0 ate n - 1.",
      successNpc: "Rafa, operador dos trilhos",
      successAvatar: "/avatars/wizard.webp",
      successStory: "As cinco paradas apareceram no painel. O trem ja pode repetir tarefas sem comando manual.",
    },
  ],
};
