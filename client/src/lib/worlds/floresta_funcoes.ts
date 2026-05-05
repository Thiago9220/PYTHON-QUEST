import { World } from "../types";

export const FLORESTA_FUNCOES_WORLD: World = {
  id: "floresta-funcoes",
  title: "Repositório de Funções",
  subtitle: "Modularização do Sistema",
  icon: "package",
  color: "#8B5CF6",
  lore: "No Repositório Central, os Hackers aprendem a otimizar scripts encapsulando rotinas em blocos reutilizáveis chamados Funções.",
  unlockRequirement: 1500,
  challenges: [
    {
      id: "py-func-01",
      worldId: "floresta-funcoes",
      title: "Sub-rotina de Handshake",
      description: "Defina uma função chamada saudar que recebe um nome e imprime 'Ola, [nome]!'. Chame a sub-rotina passando o nome 'Admin'.",
      narrative: "O servidor principal precisa responder aos pacotes de entrada de forma dinâmica. Encapsule o comando de boas-vindas em uma função reutilizável.",
      difficulty: "intermediario",
      setupCode: "",
      expectedOutput: "Ola, Admin!",
      testCode: "assert 'saudar' in locals() and callable(saudar) and output.strip() == 'Ola, Admin!'",
      starterCode: "# Defina a sub-rotina saudar e invoque-a\n",
      hints: [
        { text: "Funções começam com def nome(parâmetro):", cost: 10 },
        { text: "Use uma f-string para formatar a string de saída: f'Ola, {nome}!'", cost: 20 },
        { text: "def saudar(nome):\n    print(f'Ola, {nome}!')\n\nsaudar('Admin')", cost: 30 },
      ],
      xpReward: 400,
      concept: "Criação de Funções (def)",
      conceptExplanation: "Funções (def) agrupam um conjunto de instruções sob um único nome. Elas permitem que você reutilize lógica complexa sem precisar reescrevê-la.",
      successNpc: "SysAdmin, Monitoração de Rede",
      successAvatar: "/avatars/galadriel.webp",
      successStory: "Módulo gravado com sucesso. O sistema agora pode escalar chamadas para a sub-rotina automaticamente.",
    },
  ],
};
