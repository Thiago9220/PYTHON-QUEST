import { BossChallenge } from "../types";

export const ORACULO_FUNCOES_BOSS: BossChallenge = {
  id: "boss-floresta-funcoes",
  worldId: "floresta-funcoes",
  title: "Arquiteto Modular",
  codename: "Compilação de Sub-rotinas",
  intro:
    "AI-7 estabelece túnel com o Repositório Central. // ALERTA: O Arquiteto Modular só aceita código encapsulado em funções puras com retorno explícito (`return`). Construa uma biblioteca de 3 funções interdependentes para decifrar a assinatura do setor.",
  finalStory:
    "SUB-ROTINAS VALIDADAS. O Arquiteto Modular incorporou suas funções ao Kernel do Mainframe. Você domina a abstração procedural.",
  unlockThreshold: 0.7,
  xpReward: 12000,
  acts: [
    {
      id: "act-1",
      title: "Amplificador de Sinal",
      narrative:
        "Defina uma função `amplificar(valor, fator=2)` que retorna `valor * fator`. Chame `amplificar(21)` e armazene em `sinal_amp`. Imprima `AMP: <sinal_amp>`.",
      setupCode: "",
      starterHint:
        "# Ato 1\n# 1. def amplificar(valor, fator=2): return valor * fator\n# 2. sinal_amp = amplificar(21)\n# 3. Imprima: AMP: <sinal_amp>\n",
      objectives: [
        {
          label: "amplificar é chamável (callable)",
          check: "callable(amplificar)",
        },
        {
          label: "sinal_amp == 42",
          check: "sinal_amp == 42",
        },
        {
          label: "amplificar(10, 3) == 30",
          check: "amplificar(10, 3) == 30",
        },
        {
          label: "Output contém 'AMP: 42'",
          check: "'AMP: 42' in output",
        },
      ],
      hints: [
        {
          text: "def amplificar(valor, fator=2):\n    return valor * fator",
          cost: 50,
        },
        {
          text: "sinal_amp = amplificar(21)\nprint(f'AMP: {sinal_amp}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-2",
      title: "Validador de Checksum",
      narrative:
        "Crie a função `checksum_valido(numero)` que retorna `True` se `numero % 2 == 0` e `numero > 10`, senão `False`. Guarde `checksum_valido(sinal_amp)` em `status_check`. Imprima `CHECK: <status_check>`.",
      setupCode: "",
      starterHint:
        "# Ato 2\n# 1. def checksum_valido(numero): ...\n# 2. status_check = checksum_valido(sinal_amp)\n# 3. Imprima: CHECK: <status_check>\n",
      objectives: [
        {
          label: "checksum_valido(42) is True",
          check: "checksum_valido(42) is True",
        },
        {
          label: "checksum_valido(8) is False",
          check: "checksum_valido(8) is False",
        },
        {
          label: "status_check is True",
          check: "status_check is True",
        },
        {
          label: "Output contém 'CHECK: True'",
          check: "'CHECK: True' in output",
        },
      ],
      hints: [
        {
          text: "def checksum_valido(numero):\n    return numero % 2 == 0 and numero > 10",
          cost: 50,
        },
        {
          text: "print(f'CHECK: {status_check}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-3",
      title: "Orquestração Final",
      narrative:
        "Defina `gerar_assinatura(codigo)` que usa `amplificar(codigo, 3)` e retorna a string `f'SIG-{amplificar(codigo, 3)}'`. Salve `gerar_assinatura(15)` em `assinatura_final` e imprima `>>> <assinatura_final>`.",
      setupCode: "",
      starterHint:
        "# Ato 3 — FINAL\n# 1. def gerar_assinatura(codigo): ...\n# 2. assinatura_final = gerar_assinatura(15)\n# 3. Imprima: >>> SIG-45\n",
      objectives: [
        {
          label: "assinatura_final == 'SIG-45'",
          check: "assinatura_final == 'SIG-45'",
        },
        {
          label: "Output contém '>>> SIG-45'",
          check: "'>>> SIG-45' in output",
        },
      ],
      hints: [
        {
          text: "def gerar_assinatura(codigo):\n    return f'SIG-{amplificar(codigo, 3)}'",
          cost: 50,
        },
        {
          text: "assinatura_final = gerar_assinatura(15)\nprint(f'>>> {assinatura_final}')",
          cost: 100,
        },
      ],
    },
  ],
};

