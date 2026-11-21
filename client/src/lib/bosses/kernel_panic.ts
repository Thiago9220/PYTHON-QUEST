import { BossChallenge } from "../types";

export const KERNEL_PANIC_BOSS: BossChallenge = {
  id: "boss-bunker-excecoes",
  worldId: "bunker-excecoes",
  title: "Kernel Panic",
  codename: "Protocolo de Contenção",
  intro:
    "AI-7 abre o canal de emergência. // ALERTA: KERNEL PANIC desperto no fundo do Bunker. É a última barreira antes do Core — uma rotina de contenção que derruba qualquer script que falhe. Pacotes corrompidos, violações de quarentena e divisões por zero: sobreviva a tudo com try/except, raise, finally e módulos.",
  finalStory:
    "KERNEL PANIC CONTIDO. O Bunker se abre e, pela primeira vez, você lê os registros que a CorpHQ apagava. AI-7 fica em silêncio por um longo segundo. Depois escreve: 'Operador... o Core não é um servidor. É uma mente. O nome dela é AURORA — e foi ela quem isolou a cidade.' Para alcançá-la, você vai precisar entender como ela foi construída. FIM DO ATO 1.",
  unlockThreshold: 0.7,
  xpReward: 16000,
  acts: [
    {
      id: "act-1",
      title: "Triagem de Pacotes Corrompidos",
      narrative:
        "A lista `pacotes` chegou com lixo misturado: `['42', 'x9', '17', '', '8']`. Converta cada item com `int()`. Os que funcionarem vão para a lista `validos`; os que derem `ValueError` aumentam o contador `corrompidos`. Imprima `VALIDOS: <validos> | CORROMPIDOS: <corrompidos>`.",
      setupCode: "pacotes = ['42', 'x9', '17', '', '8']\n",
      starterHint:
        "# Ato 1\n# 1. Crie validos = [] e corrompidos = 0\n# 2. Para cada pacote, tente int(pacote) dentro de try/except ValueError\n# 3. Imprima: VALIDOS: [42, 17, 8] | CORROMPIDOS: 2\n",
      objectives: [
        {
          label: "validos == [42, 17, 8]",
          check: "validos == [42, 17, 8]",
        },
        {
          label: "corrompidos == 2",
          check: "corrompidos == 2",
        },
        {
          label: "Usa except ValueError",
          check: "'except ValueError' in code",
        },
        {
          label: "Output contém 'VALIDOS: [42, 17, 8] | CORROMPIDOS: 2'",
          check: "'VALIDOS: [42, 17, 8] | CORROMPIDOS: 2' in output",
        },
      ],
      hints: [
        {
          text: "for pacote in pacotes:\n    try:\n        validos.append(int(pacote))\n    except ValueError:\n        corrompidos += 1",
          cost: 50,
        },
        {
          text: "int('') também gera ValueError — por isso são 2 corrompidos: 'x9' e ''.",
          cost: 75,
        },
        {
          text: "print(f'VALIDOS: {validos} | CORROMPIDOS: {corrompidos}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-2",
      title: "Violação de Quarentena",
      narrative:
        "Crie a exceção `ViolacaoDeQuarentena` (herdando de `Exception`). Escreva `liberar_setor(nivel)`: se `nivel < 5`, faça `raise ViolacaoDeQuarentena('nivel insuficiente')`; senão, retorne `'LIBERADO'`. Chame `liberar_setor(3)` dentro de um `try`. No `except ViolacaoDeQuarentena as e`, imprima `BLOQUEADO: <e>`. No `finally`, imprima `LOG FECHADO`.",
      setupCode: "",
      starterHint:
        "# Ato 2\n# 1. class ViolacaoDeQuarentena(Exception): pass\n# 2. def liberar_setor(nivel): ... raise se nivel < 5, senão return 'LIBERADO'\n# 3. try / except ViolacaoDeQuarentena as e / finally\n",
      objectives: [
        {
          label: "ViolacaoDeQuarentena herda de Exception",
          check: "isinstance(ViolacaoDeQuarentena, type) and issubclass(ViolacaoDeQuarentena, Exception)",
        },
        {
          label: "liberar_setor(7) retorna 'LIBERADO'",
          check: "liberar_setor(7) == 'LIBERADO'",
        },
        {
          label: "Output contém 'BLOQUEADO: nivel insuficiente'",
          check: "'BLOQUEADO: nivel insuficiente' in output",
        },
        {
          label: "Usa finally e imprime 'LOG FECHADO'",
          check: "'finally' in code and 'LOG FECHADO' in output",
        },
      ],
      hints: [
        {
          text: "class ViolacaoDeQuarentena(Exception):\n    pass\n\ndef liberar_setor(nivel):\n    if nivel < 5:\n        raise ViolacaoDeQuarentena('nivel insuficiente')\n    return 'LIBERADO'",
          cost: 50,
        },
        {
          text: "print(f'BLOQUEADO: {e}') mostra só a mensagem da exceção.",
          cost: 75,
        },
        {
          text: "try:\n    liberar_setor(3)\nexcept ViolacaoDeQuarentena as e:\n    print(f'BLOQUEADO: {e}')\nfinally:\n    print('LOG FECHADO')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-3",
      title: "Contenção Total",
      narrative:
        "Importe `math`. Escreva `checar_integridade(validos, total)` que retorna `math.floor(validos / total * 100)`, mas captura `ZeroDivisionError` e retorna `0` quando `total` for zero. Calcule `integridade = checar_integridade(len(validos), len(pacotes))` e imprima `>>> CONTENCAO: <integridade>% INTEGRO`.",
      setupCode: "",
      starterHint:
        "# Ato 3 — FINAL\n# 1. import math\n# 2. def checar_integridade(validos, total): try / except ZeroDivisionError\n# 3. Imprima: >>> CONTENCAO: 60% INTEGRO\n",
      objectives: [
        {
          label: "checar_integridade(3, 5) == 60",
          check: "checar_integridade(3, 5) == 60",
        },
        {
          label: "checar_integridade(1, 0) == 0 (sem quebrar)",
          check: "checar_integridade(1, 0) == 0",
        },
        {
          label: "Usa math.floor",
          check: "'math.floor' in code",
        },
        {
          label: "Output contém '>>> CONTENCAO: 60% INTEGRO'",
          check: "'>>> CONTENCAO: 60% INTEGRO' in output",
        },
      ],
      hints: [
        {
          text: "import math\n\ndef checar_integridade(validos, total):\n    try:\n        return math.floor(validos / total * 100)\n    except ZeroDivisionError:\n        return 0",
          cost: 50,
        },
        {
          text: "integridade = checar_integridade(len(validos), len(pacotes))",
          cost: 75,
        },
        {
          text: "print(f'>>> CONTENCAO: {integridade}% INTEGRO')",
          cost: 100,
        },
      ],
    },
  ],
};
