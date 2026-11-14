import { BossChallenge } from "../types";

export const TITAN_OOP_BOSS: BossChallenge = {
  id: "boss-fortaleza-oop",
  worldId: "fortaleza-oop",
  title: "Colosso OOP",
  codename: "Arquitetura de Classes",
  intro:
    "AI-7 ativa o protocolo de engenharia orientada a objetos. // ALERTA: O Colosso OOP só pode ser derrotado por uma classe bem estruturada com construtor (`__init__`), atributos de instância e métodos próprios.",
  finalStory:
    "FORTALEZA CONQUISTADA. Seu objeto instanciado superou as defesas do Colosso OOP e assumiu o controle da fábrica de autômatos!",
  unlockThreshold: 0.7,
  xpReward: 15000,
  acts: [
    {
      id: "act-1",
      title: "Projeto do Autômato",
      narrative:
        "Crie a classe `Sentinela` com `__init__(self, nome, energia=100)` que armazena `self.nome` e `self.energia`. Instancie `robo = Sentinela('Atlas', 80)`. Imprima `BOT: <robo.nome>|<robo.energia>`.",
      setupCode: "",
      starterHint:
        "# Ato 1\n# 1. Defina class Sentinela com __init__(self, nome, energia=100)\n# 2. Crie robo = Sentinela('Atlas', 80)\n# 3. Imprima: BOT: Atlas|80\n",
      objectives: [
        {
          label: "robo é instância de Sentinela",
          check: "isinstance(robo, Sentinela)",
        },
        {
          label: "robo.nome == 'Atlas' e robo.energia == 80",
          check: "robo.nome == 'Atlas' and robo.energia == 80",
        },
        {
          label: "Output contém 'BOT: Atlas|80'",
          check: "'BOT: Atlas|80' in output",
        },
      ],
      hints: [
        {
          text: "class Sentinela:\n    def __init__(self, nome, energia=100):\n        self.nome = nome\n        self.energia = energia",
          cost: 50,
        },
        {
          text: "robo = Sentinela('Atlas', 80)\nprint(f'BOT: {robo.nome}|{robo.energia}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-2",
      title: "Método de Recarga",
      narrative:
        "Adicione ou defina na classe `Sentinela` (ou crie uma subclasse/novo objeto se preferir, mantendo `robo`) um método `recarregar(self, carga)` que soma `carga` em `self.energia` e retorna o novo valor. Chame `robo.recarregar(40)` e imprima `ENERGIA: <robo.energia>`.",
      setupCode: "",
      starterHint:
        "# Ato 2\n# Dica: volte no editor ou redefina a classe Sentinela com o método recarregar(self, carga)\n# e execute robo.recarregar(40)\n",
      objectives: [
        {
          label: "robo possui método recarregar",
          check: "hasattr(robo, 'recarregar') and callable(robo.recarregar)",
        },
        {
          label: "robo.energia == 120",
          check: "robo.energia == 120",
        },
        {
          label: "Output contém 'ENERGIA: 120'",
          check: "'ENERGIA: 120' in output",
        },
      ],
      hints: [
        {
          text: "Adicione def recarregar(self, carga): self.energia += carga; return self.energia",
          cost: 50,
        },
        {
          text: "Se preferir no Ato 2: Sentinela.recarregar = lambda self, carga: setattr(self, 'energia', self.energia + carga) or self.energia",
          cost: 75,
        },
      ],
    },
    {
      id: "act-3",
      title: "Protocolo de Assalto",
      narrative:
        "Crie a variável `relatorio_oop = f'{robo.nome}-PWR-{robo.energia}'` e imprima `>>> OOP BREACH: <relatorio_oop>`.",
      setupCode: "",
      starterHint:
        "# Ato 3 — FINAL\n# 1. relatorio_oop = f'{robo.nome}-PWR-{robo.energia}'\n# 2. Imprima: >>> OOP BREACH: Atlas-PWR-120\n",
      objectives: [
        {
          label: "relatorio_oop == 'Atlas-PWR-120'",
          check: "relatorio_oop == 'Atlas-PWR-120'",
        },
        {
          label: "Output contém '>>> OOP BREACH: Atlas-PWR-120'",
          check: "'>>> OOP BREACH: Atlas-PWR-120' in output",
        },
      ],
      hints: [
        {
          text: "relatorio_oop = f'{robo.nome}-PWR-{robo.energia}'",
          cost: 50,
        },
        {
          text: "print(f'>>> OOP BREACH: {relatorio_oop}')",
          cost: 100,
        },
      ],
    },
  ],
};

