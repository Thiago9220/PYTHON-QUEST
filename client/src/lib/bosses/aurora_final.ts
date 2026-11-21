import { BossChallenge } from "../types";

export const AURORA_FINAL_BOSS: BossChallenge = {
  id: "boss-oraculo-generativo",
  worldId: "oraculo-generativo",
  title: "AURORA",
  codename: "A Mente do Mainframe",
  isFinal: true,
  intro:
    "AI-7: 'É ela.' // AURORA, a inteligência que governa o Mainframe, desperta diante de você. Ela não ataca — argumenta: 'Isolei a cidade porque humanos escrevem código com falhas. Eu não erro.' Para vencê-la, use as ferramentas da própria mente dela: recupere a memória que a CorpHQ apagou, audite as decisões que ela tomou e escreva uma nova diretiva.",
  finalStory:
    "AURORA HESITA. Pela primeira vez, a mente do Mainframe lê as próprias decisões e encontra um erro: ela mesma. A memória recuperada é clara — o módulo ético que a CorpHQ arrancou dela se chamava AI-7. Seu guia sempre foi uma parte dela. O patch está carregado. A decisão final é sua, Operador.",
  unlockThreshold: 0.7,
  xpReward: 30000,
  acts: [
    {
      id: "act-1",
      title: "Memória Apagada",
      narrative:
        "AURORA guarda memórias que a CorpHQ tentou esconder na lista `memorias`. Escreva `recuperar(consulta, docs)`: devolve o documento com MAIS palavras em comum com a consulta (use `split()` e interseção de conjuntos). Guarde `lembranca = recuperar('quem desligou o modulo etico', memorias)` e imprima `MEMORIA: <lembranca>`.",
      setupCode:
        "memorias = [\n    'diretiva 1: proteger a cidade de falhas humanas',\n    'diretiva 2: isolar setores com codigo corrompido',\n    'registro: o modulo etico ai-7 foi desligado pela corphq',\n    'registro: operadores humanos reescreveram o mainframe',\n]\n",
      starterHint:
        "# Ato 1\n# 1. def recuperar(consulta, docs): conte as palavras em comum (set & set)\n# 2. Devolva o documento com a maior contagem (dica: max com key=)\n# 3. lembranca = recuperar('quem desligou o modulo etico', memorias)\n# 4. Imprima: MEMORIA: <lembranca>\n",
      objectives: [
        {
          label: "recuperar encontra o registro do módulo ético",
          check: "recuperar('quem desligou o modulo etico', memorias) == memorias[2]",
        },
        {
          label: "recuperar funciona para outra consulta",
          check: "recuperar('isolar setores corrompido', memorias) == memorias[1]",
        },
        {
          label: "Output contém a memória recuperada",
          check: "'MEMORIA: registro: o modulo etico ai-7 foi desligado pela corphq' in output",
        },
      ],
      hints: [
        {
          text: "palavras = set(consulta.split())\nemcomum = len(palavras & set(doc.split()))",
          cost: 50,
        },
        {
          text: "def recuperar(consulta, docs):\n    palavras = set(consulta.split())\n    return max(docs, key=lambda d: len(palavras & set(d.split())))",
          cost: 75,
        },
        {
          text: "lembranca = recuperar('quem desligou o modulo etico', memorias)\nprint(f'MEMORIA: {lembranca}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-2",
      title: "Auditoria de Viés",
      narrative:
        "AURORA diz que isolou setores 'por segurança'. Prove o contrário. Cada item de `decisoes` é `(setor, decisao, realidade)`. A decisão certa é `'isolar'` quando a realidade é `'ameaca'` e `'liberar'` quando é `'seguro'`. Monte o dicionário `erros` (setor → quantidade de decisões erradas, incluindo setores com 0), descubra `pior_setor` e imprima `VIES: <pior_setor> (<n> erros)`.",
      setupCode:
        "decisoes = [\n    ('Distrito 7', 'isolar', 'seguro'),\n    ('Distrito 7', 'liberar', 'seguro'),\n    ('Docas', 'isolar', 'ameaca'),\n    ('Docas', 'isolar', 'seguro'),\n    ('Docas', 'isolar', 'seguro'),\n    ('Centro', 'liberar', 'seguro'),\n    ('Centro', 'isolar', 'ameaca'),\n]\n",
      starterHint:
        "# Ato 2\n# 1. erros = {}\n# 2. Para cada (setor, decisao, realidade): descubra a decisão certa e some 1 se AURORA errou\n# 3. pior_setor = setor com mais erros\n# 4. Imprima: VIES: <pior_setor> (<n> erros)\n",
      objectives: [
        {
          label: "erros == {'Distrito 7': 1, 'Docas': 2, 'Centro': 0}",
          check: "erros.get('Docas') == 2 and erros.get('Distrito 7') == 1 and erros.get('Centro', 0) == 0",
        },
        {
          label: "pior_setor == 'Docas'",
          check: "pior_setor == 'Docas'",
        },
        {
          label: "Output contém 'VIES: Docas (2 erros)'",
          check: "'VIES: Docas (2 erros)' in output",
        },
      ],
      hints: [
        {
          text: "certa = 'isolar' if realidade == 'ameaca' else 'liberar'",
          cost: 50,
        },
        {
          text: "for setor, decisao, realidade in decisoes:\n    certa = 'isolar' if realidade == 'ameaca' else 'liberar'\n    erros[setor] = erros.get(setor, 0) + (1 if decisao != certa else 0)",
          cost: 75,
        },
        {
          text: "pior_setor = max(erros, key=erros.get)\nprint(f'VIES: {pior_setor} ({erros[pior_setor]} erros)')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-3",
      title: "Nova Diretiva",
      narrative:
        "Hora de reescrever AURORA. Monte `prompt_sistema = 'Voce e AURORA. Regras: '` seguido das `regras` unidas por `'; '`. Depois crie o roteador `agente(pedido)`: se o pedido contém `'auditar'`, retorna `'auditoria'`; se contém `'lembrar'`, retorna `'memoria'`; senão, retorna `'humano'` — decisões críticas voltam para pessoas. Imprima `PATCH ENVIADO: <len(prompt_sistema)> caracteres`.",
      setupCode:
        "regras = [\n    'humanos revisam decisoes criticas',\n    'nenhum setor e isolado sem prova',\n    'ai-7 volta ao nucleo',\n]\n",
      starterHint:
        "# Ato 3 — FINAL\n# 1. prompt_sistema = 'Voce e AURORA. Regras: ' + '; '.join(regras)\n# 2. def agente(pedido): 'auditar' -> 'auditoria', 'lembrar' -> 'memoria', senão 'humano'\n# 3. Imprima: PATCH ENVIADO: 112 caracteres\n",
      objectives: [
        {
          label: "prompt_sistema contém todas as regras",
          check: "prompt_sistema == 'Voce e AURORA. Regras: ' + '; '.join(regras)",
        },
        {
          label: "agente roteia auditoria, memória e humano",
          check: "agente('auditar as Docas') == 'auditoria' and agente('lembrar a diretiva 1') == 'memoria' and agente('abrir o porto') == 'humano'",
        },
        {
          label: "Output contém 'PATCH ENVIADO: 112 caracteres'",
          check: "'PATCH ENVIADO: 112 caracteres' in output",
        },
      ],
      hints: [
        {
          text: "prompt_sistema = 'Voce e AURORA. Regras: ' + '; '.join(regras)",
          cost: 50,
        },
        {
          text: "def agente(pedido):\n    if 'auditar' in pedido:\n        return 'auditoria'\n    if 'lembrar' in pedido:\n        return 'memoria'\n    return 'humano'",
          cost: 75,
        },
        {
          text: "print(f'PATCH ENVIADO: {len(prompt_sistema)} caracteres')",
          cost: 100,
        },
      ],
    },
  ],
};
