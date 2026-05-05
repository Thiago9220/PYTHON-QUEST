import { World } from "../types";

export const FLORESTA_FUNCOES_WORLD: World = {
  id: "floresta-funcoes",
  title: "Arvoredo dos Arcanos",
  subtitle: "Onde o poder é encapsulado",
  icon: "package",
  color: "#8B5CF6",
  lore: "No Arvoredo dos Arcanos, os Scriptsweavers aprendem a destilar sequências de comandos em Runas Reutilizáveis. Aqui, você aprenderá a criar suas próprias palavras de poder, chamadas Funções.",
  unlockRequirement: 1500,
  challenges: [
    {
      id: "py-func-01",
      worldId: "floresta-funcoes",
      title: "O Ritual da Saudação",
      description: "Defina uma função chamada saudar que recebe um nome e projeta 'Ola, [nome]!'. Invoque o ritual com 'Mestre'.",
      narrative: "As árvores do arvoredo sussurram saudações a quem passa. Encapsule esse sussurro em uma Runa de Saudação para que possa ser invocado a qualquer momento.",
      difficulty: "intermediario",
      setupCode: "",
      expectedOutput: "Ola, Mestre!",
      testCode: "assert 'saudar' in locals() and callable(saudar) and output.strip() == 'Ola, Mestre!'",
      starterCode: "# Defina a Runa saudar e invoque-a\n",
      hints: [
        { text: "Rituais (funções) começam com def nome(parâmetro):", cost: 10 },
        { text: "Use uma f-string para fundir o nome ao encantamento: f'Ola, {nome}!'", cost: 20 },
        { text: "def saudar(nome):\n    print(f'Ola, {nome}!')\n\nsaudar('Mestre')", cost: 30 },
      ],
      xpReward: 400,
      concept: "Criação de Runas (def)",
      conceptExplanation: "Funções (def) agrupam um conjunto de instruções sob um único nome. Elas permitem que você reutilize lógica complexa sem precisar reescrevê-la.",
      successNpc: "Teca, Tecelã Sênior",
      successAvatar: "/avatars/galadriel.webp",
      successStory: "A Runa foi gravada com sucesso. Agora, o arvoredo reconhece sua voz em qualquer lugar.",
    },
  ],
};
