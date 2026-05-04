import { World } from "../types";

export const FLORESTA_FUNCOES_WORLD: World = {
  id: "floresta-funcoes",
  title: "Floresta das Funções",
  subtitle: "O Poder do Reuso",
  icon: "package",
  color: "#9C27B0",
  lore: "Na Floresta das Funções, os mestres aprendem a encapsular feitiços em nomes poderosos, permitindo que sejam invocados a qualquer momento.",
  unlockRequirement: 1500,
  challenges: [
    {
      id: "py-func-01",
      worldId: "floresta-funcoes",
      title: "O Feitiço de Saudação",
      description: "Defina uma função chamada 'saudar' que recebe um 'nome' e imprime 'Olá, [nome]!'. Depois, chame a função com o valor 'Mestre'.",
      narrative: "As árvores sussurram nomes. 'Crie um padrão para suas saudações', orienta a Elfa das Funções. 'Assim, você não precisará repetir as mesmas palavras para cada viajante.'",
      difficulty: "intermediário",
      setupCode: "",
      expectedOutput: "Olá, Mestre!",
      testCode: "assert 'saudar' in locals() and callable(saudar) and output.strip() == 'Olá, Mestre!'",
      starterCode: "# Defina a função saudar e chame-a\n",
      hints: [
        { text: "Use 'def nome_da_funcao(parametro):' para começar.", cost: 10 },
        { text: "Use f-strings ou concatenação: print(f'Olá, {nome}!')", cost: 20 },
        { text: "def saudar(nome):\n    print(f'Olá, {nome}!')\n\nsaudar('Mestre')", cost: 30 },
      ],
      xpReward: 400,
      concept: "Definição de Funções",
      conceptExplanation: "Funções são blocos de código que só rodam quando chamados. Elas ajudam a organizar e reutilizar lógica.",
      successNpc: "Elfa das Funções",
      successAvatar: "/avatars/galadriel.webp",
      successStory: "Seu feitiço foi registrado no grande livro da floresta. Agora, qualquer um pode ser saudado com sua magia.",
    }
  ]
};
