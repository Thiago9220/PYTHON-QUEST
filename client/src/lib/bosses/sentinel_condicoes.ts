import { BossChallenge } from "../types";

export const SENTINEL_CONDICOES_BOSS: BossChallenge = {
  id: "boss-vale-condicoes",
  worldId: "vale-condicoes",
  title: "Sentinela Cerberus",
  codename: "Bypass do Nó de Roteamento",
  intro:
    "AI-7 intercepta a malha de roteamento. // ALERTA: Sentinela Cerberus detectado bloqueando o gateway central. Ele opera em três camadas de decisão lógica: Triagem de Nível, Validação Booleana Composta e Despacho de Rota de Emergência. Use if, elif, else e operadores lógicos (and/or) para enganar o árbitro de pacotes.",
  finalStory:
    "ROTEAMENTO REESCRITO. O Sentinela Cerberus abriu todas as comportas lógicas do setor e redirecionou o tráfego administrativo para o seu terminal. Você domina o fluxo condicional.",
  unlockThreshold: 0.7,
  xpReward: 9500,
  acts: [
    {
      id: "act-1",
      title: "Triagem de Ameaça",
      narrative:
        "O pacote recebido traz um `score_risco = 78`. Classifique a variável `nivel`: se `score_risco >= 80` é `'CRITICO'`, se `>= 50` é `'ALTO'`, caso contrário `'BAIXO'`. Imprima `NIVEL: <nivel>`.",
      setupCode: "score_risco = 78\n",
      starterHint:
        "# Ato 1\n# 1. Avalie score_risco com if / elif / else e defina a variável nivel\n# 2. Imprima: NIVEL: <nivel>\n",
      objectives: [
        {
          label: "Variável nivel == 'ALTO'",
          check: "nivel == 'ALTO'",
        },
        {
          label: "Output contém 'NIVEL: ALTO'",
          check: "'NIVEL: ALTO' in output",
        },
      ],
      hints: [
        {
          text: "Use if score_risco >= 80: ... elif score_risco >= 50: ... else: ...",
          cost: 50,
        },
        {
          text: "Como score_risco é 78, nivel deve receber 'ALTO'.",
          cost: 75,
        },
        {
          text: "print(f'NIVEL: {nivel}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-2",
      title: "Autorização Multi-Fator",
      narrative:
        "O firewall verifica duas flags: `chave_valida = True` e `ip_interno = False`, além de `override_admin = True`. Defina `acesso_liberado` como `True` se (`chave_valida` e `ip_interno`) OU `override_admin` for verdadeiro. Se liberado, defina `rota = 'TUNEL_SEGURO'`, senão `'QUARENTENA'`. Imprima `ROTA: <rota>`.",
      setupCode: "chave_valida = True\nip_interno = False\noverride_admin = True\n",
      starterHint:
        "# Ato 2\n# 1. Calcule acesso_liberado usando (chave_valida and ip_interno) or override_admin\n# 2. Defina rota = 'TUNEL_SEGURO' se acesso_liberado senão 'QUARENTENA'\n# 3. Imprima: ROTA: <rota>\n",
      objectives: [
        {
          label: "acesso_liberado == True",
          check: "acesso_liberado is True",
        },
        {
          label: "rota == 'TUNEL_SEGURO'",
          check: "rota == 'TUNEL_SEGURO'",
        },
        {
          label: "Output contém 'ROTA: TUNEL_SEGURO'",
          check: "'ROTA: TUNEL_SEGURO' in output",
        },
      ],
      hints: [
        {
          text: "acesso_liberado = (chave_valida and ip_interno) or override_admin",
          cost: 50,
        },
        {
          text: "if acesso_liberado:\n    rota = 'TUNEL_SEGURO'\nelse:\n    rota = 'QUARENTENA'",
          cost: 75,
        },
        {
          text: "print(f'ROTA: {rota}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-3",
      title: "Assinatura do Gateway",
      narrative:
        "Combine `nivel` e `rota` do pacote. Se `nivel == 'ALTO'` e `rota == 'TUNEL_SEGURO'`, defina `comando_final = 'BYPASS_CERBERUS_OK'`. Imprima `>>> <comando_final>`.",
      setupCode: "",
      starterHint:
        "# Ato 3 — FINAL\n# 1. Verifique se nivel == 'ALTO' and rota == 'TUNEL_SEGURO'\n# 2. Defina comando_final = 'BYPASS_CERBERUS_OK'\n# 3. Imprima: >>> BYPASS_CERBERUS_OK\n",
      objectives: [
        {
          label: "comando_final == 'BYPASS_CERBERUS_OK'",
          check: "comando_final == 'BYPASS_CERBERUS_OK'",
        },
        {
          label: "Output contém '>>> BYPASS_CERBERUS_OK'",
          check: "'>>> BYPASS_CERBERUS_OK' in output",
        },
      ],
      hints: [
        {
          text: "if nivel == 'ALTO' and rota == 'TUNEL_SEGURO':\n    comando_final = 'BYPASS_CERBERUS_OK'",
          cost: 50,
        },
        {
          text: "print(f'>>> {comando_final}')",
          cost: 100,
        },
      ],
    },
  ],
};

