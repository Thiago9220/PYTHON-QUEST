import { World } from "../types";

export const MONTANHA_LOOPS_WORLD: World = {
  id: "montanha-loops",
  title: "Setor de Iteração",
  subtitle: "Ciclos de Processamento Infinito",
  icon: "refresh-cw",
  color: "#F97316",
  bgImage: "/assets/images/worlds/iteration_sector.png",
  lore: "No Setor de Iteração, o tempo é medido em ciclos de CPU. Aqui, você deve aprender a dominar os Loops de Processamento para executar tarefas repetitivas em escala massiva com um único script.",
  unlockRequirement: 800,
  challenges: [
    {
      id: "py-loop-01",
      worldId: "montanha-loops",
      title: "Varredura de Sequência",
      description: "Use o comando for e a função range() para imprimir os números de 0 a 4.",
      narrative: "O scanner de rede precisa realizar uma varredura em cinco portas consecutivas. Automatize a verificação usando um loop 'for' para não precisar digitar cada comando manualmente.",
      difficulty: "intermediario",
      setupCode: "",
      expectedOutput: "0\n1\n2\n3\n4",
      testCode: "assert output.strip() == '0\\n1\\n2\\n3\\n4'",
      starterCode: "# Inicie o loop com for e range(5)\n",
      hints: [
        { text: "A função range(5) cria uma sequência que vai de 0 até 4.", cost: 10 },
        { text: "O comando print(i) deve estar indentado dentro do loop for.", cost: 20 },
        { text: "for i in range(5):\n    print(i)", cost: 30 },
      ],
      xpReward: 300,
      concept: "Loop de Repetição 'for'",
      conceptExplanation: "O loop 'for' permite que você execute o mesmo bloco de código várias vezes. É como dar uma ordem repetitiva para o computador: 'Para cada item nesta lista, faça isso'.\n\nExemplo:\nfor i in range(3):\n    print('Repetindo...')\n\nIsso mostrará a frase 3 vezes.",
      successNpc: "Iter-8, Autômato de Ciclos",
      successAvatar: "/avatars/wizard.webp",
      successStory: "Varredura concluída. O loop de processamento estabilizou as portas de entrada do setor.",
    },
  ],
};
