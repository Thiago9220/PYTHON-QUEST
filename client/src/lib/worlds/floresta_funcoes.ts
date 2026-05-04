import { World } from "../types";

export const FLORESTA_FUNCOES_WORLD: World = {
  id: "floresta-funcoes",
  title: "Oficina das Funcoes",
  subtitle: "Pecas reutilizaveis para programas maiores",
  icon: "package",
  color: "#8B5CF6",
  lore: "Na Oficina das Funcoes, cada bancada transforma uma sequencia de comandos em uma ferramenta reutilizavel.",
  unlockRequirement: 1500,
  challenges: [
    {
      id: "py-func-01",
      worldId: "floresta-funcoes",
      title: "Saudacao Reutilizavel",
      description: "Defina uma funcao chamada saudar que recebe nome e imprime 'Ola, [nome]!'. Depois chame a funcao com 'Mestre'.",
      narrative: "A recepcao da oficina cumprimenta visitantes o dia todo. Crie uma funcao para reaproveitar essa tarefa.",
      difficulty: "intermediario",
      setupCode: "",
      expectedOutput: "Ola, Mestre!",
      testCode: "assert 'saudar' in locals() and callable(saudar) and output.strip() == 'Ola, Mestre!'",
      starterCode: "# Defina a funcao saudar e chame-a\n",
      hints: [
        { text: "Funcoes comecam com def nome(parametro):", cost: 10 },
        { text: "Uma f-string pode montar a mensagem: f'Ola, {nome}!'", cost: 20 },
        { text: "def saudar(nome):\n    print(f'Ola, {nome}!')\n\nsaudar('Mestre')", cost: 30 },
      ],
      xpReward: 400,
      concept: "def",
      conceptExplanation: "Funcoes agrupam codigo sob um nome. Elas rodam quando chamadas e podem receber parametros.",
      successNpc: "Teca, coordenadora da oficina",
      successAvatar: "/avatars/galadriel.webp",
      successStory: "A recepcao ganhou uma rotina limpa e reutilizavel. Seu codigo ficou mais organizado.",
    },
  ],
};
