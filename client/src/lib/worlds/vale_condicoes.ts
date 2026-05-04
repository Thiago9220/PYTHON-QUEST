import { World } from "../types";

export const VALE_CONDICOES_WORLD: World = {
  id: "vale-condicoes",
  title: "Vale das Condições",
  subtitle: "A Bifurcação do Destino",
  icon: "git-branch",
  color: "#2196F3",
  lore: "No Vale das Condições, o caminho se divide. Aqui você aprenderá a ensinar a serpente a tomar decisões baseadas na verdade e na falsidade.",
  unlockRequirement: 300,
  challenges: [
    {
      id: "py-cond-01",
      worldId: "vale-condicoes",
      title: "O Portão da Verdade",
      description: "Crie uma condição 'if' que verifique se a variável 'idade' é maior ou igual a 18. Se for, imprima 'Acesso Permitido'.",
      narrative: "Um guarda de pedra bloqueia o caminho. 'Apenas os adultos podem passar', ele ruge. Use sua lógica para convencer o guardião.",
      difficulty: "iniciante",
      setupCode: "idade = 20",
      expectedOutput: "Acesso Permitido",
      testCode: "assert output.strip() == 'Acesso Permitido'",
      starterCode: "idade = 20\n# Escreva seu if aqui\n",
      hints: [
        { text: "A estrutura é: if condicao:", cost: 10 },
        { text: "Não esqueça da indentação (espaços) antes do print.", cost: 20 },
        { text: "if idade >= 18:\n    print('Acesso Permitido')", cost: 30 },
      ],
      xpReward: 200,
      concept: "Estrutura Condicional if",
      conceptExplanation: "O `if` permite que o código execute um bloco de instruções apenas se uma condição for verdadeira.",
      successNpc: "Guardião de Pedra",
      successAvatar: "/avatars/golem.webp",
      successStory: "O gigante se afasta com um estrondo. 'Pode passar, jovem mestre da lógica.'",
    },
    {
      id: "py-cond-02",
      worldId: "vale-condicoes",
      title: "O Caminho Alternativo",
      description: "Use 'if' e 'else'. Se 'energia' for maior que 50, imprima 'Correr'. Caso contrário, imprima 'Descansar'.",
      narrative: "O cansaço bate à porta. Guido aconselha: 'Escute seu corpo. Se tiver força, siga rápido; se não, recupere-se.'",
      difficulty: "iniciante",
      setupCode: "energia = 30",
      expectedOutput: "Descansar",
      testCode: "assert output.strip() == 'Descansar'",
      starterCode: "energia = 30\n# Use if e else\n",
      hints: [
        { text: "O else não precisa de condição própria.", cost: 10 },
        { text: "if energia > 50:\n    print('Correr')\nelse:\n    print('Descansar')", cost: 30 },
      ],
      xpReward: 250,
      concept: "Estrutura if/else",
      conceptExplanation: "O `else` define o que deve acontecer quando a condição do `if` é falsa.",
      successNpc: "Mestre Guido",
      successAvatar: "/avatars/guido.webp",
      successStory: "Saber quando parar é tão importante quanto saber quando avançar. Você domina o equilíbrio.",
    }
  ]
};
