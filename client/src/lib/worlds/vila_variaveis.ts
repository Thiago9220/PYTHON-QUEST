import { World } from "../types";

export const VILA_VARIAVEIS_WORLD: World = {
  id: "vila-variaveis",
  title: "Vila das Variáveis",
  subtitle: "Onde tudo começa",
  icon: "village",
  color: "#4CAF50",
  lore: "Bem-vindo à Vila das Variáveis. Aqui, os aprendizes de Python descobrem como dar nome às coisas e armazenar a essência do mundo em pequenos recipientes chamados variáveis.",
  unlockRequirement: 0,
  challenges: [
    {
      id: "py-01",
      worldId: "vila-variaveis",
      title: "O Primeiro Eco",
      description: "Use a função print() para exibir a mensagem 'Olá, Python!'.",
      narrative: "O Ancião Guido observa você. 'Para dominar a serpente, você deve primeiro fazê-la falar. Diga olá ao mundo!'",
      difficulty: "iniciante",
      setupCode: "",
      expectedOutput: "Olá, Python!",
      testCode: "assert output.strip() == 'Olá, Python!'",
      starterCode: "# Use a função print para exibir a mensagem\n",
      hints: [
        { text: "A função print() exibe textos na tela.", cost: 10 },
        { text: "Textos devem estar entre aspas: 'Texto'.", cost: 20 },
        { text: "print('Olá, Python!')", cost: 30 },
      ],
      xpReward: 100,
      concept: "Função print()",
      conceptExplanation: "A função `print()` é a forma mais básica de saída em Python. Ela envia informações para o console.",
      successNpc: "Mestre Guido",
      successAvatar: "/avatars/guido.webp",
      successStory: "A serpente despertou! Suas primeiras palavras ecoam pela vila. Você deu o primeiro passo na jornada.",
    },
    {
      id: "py-02",
      worldId: "vila-variaveis",
      title: "Guardando Nomes",
      description: "Crie uma variável chamada 'nome' e atribua a ela o valor 'Python'. Depois, imprima essa variável.",
      narrative: "'Nomes têm poder', diz Guido. 'Guarde o nome da nossa arte em um pergaminho mágico e depois revele-o.'",
      difficulty: "iniciante",
      setupCode: "",
      expectedOutput: "Python",
      testCode: "assert 'nome' in locals() and nome == 'Python' and output.strip() == 'Python'",
      starterCode: "# Crie a variável nome e imprima-a\n",
      hints: [
        { text: "Crie uma variável assim: nome_da_variavel = valor", cost: 10 },
        { text: "Para imprimir a variável, não use aspas no print: print(nome)", cost: 20 },
        { text: "nome = 'Python'\nprint(nome)", cost: 30 },
      ],
      xpReward: 120,
      concept: "Variáveis",
      conceptExplanation: "Variáveis são como caixas onde guardamos dados. Usamos o sinal de `=` para atribuir um valor a um nome.",
      successNpc: "Mestre Guido",
      successAvatar: "/avatars/guido.webp",
      successStory: "Excelente. Você aprendeu a rotular o conhecimento. Agora você pode carregar informações consigo.",
    }
  ]
};
