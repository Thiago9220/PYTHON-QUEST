import { BossChallenge } from "../types";

export const VAULT_DICIONARIOS_BOSS: BossChallenge = {
  id: "boss-cripta-dicionarios",
  worldId: "cripta-dicionarios",
  title: "Guardião Hash",
  codename: "Indexação do Cofre",
  intro:
    "AI-7 acessa os registros chave-valor da Cripta Hash. // ALERTA: O Guardião Hash protege os metadados dos servidores. Manipule dicionários aninhados, atualize chaves dinamicamente e faça busca segura com `.get()` para extrair a chave mestra.",
  finalStory:
    "COFRE INDEXADO. Você atravessou a Cripta Hash em tempo O(1) e extraiu a chave mestra sem disparar KeyError.",
  unlockThreshold: 0.7,
  xpReward: 13500,
  acts: [
    {
      id: "act-1",
      title: "Mapeamento de Credenciais",
      narrative:
        "Dado o dicionário `cofre = {'porta': 443, 'protocolo': 'HTTPS'}`, adicione a chave `'ativo': True` e altere `'porta'` para `8443`. Imprima `PORTA: <cofre['porta']>`.",
      setupCode: "cofre = {'porta': 443, 'protocolo': 'HTTPS'}\n",
      starterHint:
        "# Ato 1\n# 1. Atualize cofre['porta'] = 8443 e crie cofre['ativo'] = True\n# 2. Imprima: PORTA: 8443\n",
      objectives: [
        {
          label: "cofre['porta'] == 8443",
          check: "cofre.get('porta') == 8443",
        },
        {
          label: "cofre['ativo'] is True",
          check: "cofre.get('ativo') is True",
        },
        {
          label: "Output contém 'PORTA: 8443'",
          check: "'PORTA: 8443' in output",
        },
      ],
      hints: [
        {
          text: "cofre['porta'] = 8443\ncofre['ativo'] = True",
          cost: 50,
        },
        {
          text: "print(f\"PORTA: {cofre['porta']}\")",
          cost: 100,
        },
      ],
    },
    {
      id: "act-2",
      title: "Contagem de Acessos",
      narrative:
        "A lista `logs = ['admin', 'guest', 'admin', 'root', 'admin']` registra tentativas. Crie um dicionário `contagem` com a frequência de cada usuário. Imprima `ADMIN_HITS: <contagem['admin']>`.",
      setupCode: "logs = ['admin', 'guest', 'admin', 'root', 'admin']\n",
      starterHint:
        "# Ato 2\n# 1. Conte a frequência de cada item de logs no dicionário contagem\n# 2. Imprima: ADMIN_HITS: <contagem['admin']>\n",
      objectives: [
        {
          label: "contagem == {'admin': 3, 'guest': 1, 'root': 1}",
          check: "contagem == {'admin': 3, 'guest': 1, 'root': 1}",
        },
        {
          label: "Output contém 'ADMIN_HITS: 3'",
          check: "'ADMIN_HITS: 3' in output",
        },
      ],
      hints: [
        {
          text: "contagem = {}\nfor u in logs:\n    contagem[u] = contagem.get(u, 0) + 1",
          cost: 50,
        },
        {
          text: "print(f\"ADMIN_HITS: {contagem['admin']}\")",
          cost: 100,
        },
      ],
    },
    {
      id: "act-3",
      title: "Extração Segura",
      narrative:
        "Use `.get()` para buscar `'token'` em `cofre` com valor padrão `'HASH-999'` e salve em `chave_mestra`. Imprima `>>> VAULT KEY: <chave_mestra>`.",
      setupCode: "",
      starterHint:
        "# Ato 3 — FINAL\n# 1. chave_mestra = cofre.get('token', 'HASH-999')\n# 2. Imprima: >>> VAULT KEY: HASH-999\n",
      objectives: [
        {
          label: "chave_mestra == 'HASH-999'",
          check: "chave_mestra == 'HASH-999'",
        },
        {
          label: "Output contém '>>> VAULT KEY: HASH-999'",
          check: "'>>> VAULT KEY: HASH-999' in output",
        },
      ],
      hints: [
        {
          text: "chave_mestra = cofre.get('token', 'HASH-999')",
          cost: 50,
        },
        {
          text: "print(f'>>> VAULT KEY: {chave_mestra}')",
          cost: 100,
        },
      ],
    },
  ],
};

