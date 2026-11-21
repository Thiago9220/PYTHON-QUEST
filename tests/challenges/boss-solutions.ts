/**
 * Soluções de referência dos chefes, uma por ato. Cada ato roda acumulando o
 * setupCode e o código dos atos anteriores, exatamente como useBossEngine.ts.
 */
export const BOSS_SOLUTIONS: Record<string, string[]> = {
  "boss-vila-variaveis": [
    "sinal_limpo = sinal.strip()\nversao = sinal_limpo[5:9]\nprint(f'>>> SIGNAL ACK: {sinal_limpo} | VERSION: {versao}')",
    "user, senha, role = credencial.split(':')\nuser_lower = user.lower()\ntam_senha = len(senha)\nprint(f'USER: {user_lower} | ROLE: {role} | SENHA_LEN: {tam_senha}')",
    "ver_num = int(versao[1])\ntam_user = len(user_lower)\ntoken_raw = ver_num * tam_user * tam_senha\ntoken = token_raw % 1024\nprint(f'TOKEN ALPHA: {token}')",
    "endereco = input()\nendereco_ofuscado = endereco.replace('.', '[X]')\nendereco_final = endereco_ofuscado.upper()\nprint(f'ORIGIN: {endereco_final}')",
    "pacote_final = f'PKT[{versao}]>TKN={token}>SRC={endereco_final}'\nprint(pacote_final)\nprint('>>> CORE BREACHED. EXTRACTION COMPLETE.')",
  ],
  "boss-vale-condicoes": [
    "if score_risco >= 80:\n    nivel = 'CRITICO'\nelif score_risco >= 50:\n    nivel = 'ALTO'\nelse:\n    nivel = 'BAIXO'\nprint(f'NIVEL: {nivel}')",
    "acesso_liberado = (chave_valida and ip_interno) or override_admin\nrota = 'TUNEL_SEGURO' if acesso_liberado else 'QUARENTENA'\nprint(f'ROTA: {rota}')",
    "if nivel == 'ALTO' and rota == 'TUNEL_SEGURO':\n    comando_final = 'BYPASS_CERBERUS_OK'\nprint(f'>>> {comando_final}')",
  ],
  "boss-ninho-listas": [
    "nucleo_pacotes = pacotes[2:5]\nprint(f'NUCLEO: {nucleo_pacotes}')",
    "latencias_boas = sorted([x for x in latencias if x < 50])\nprint(f'LATENCIAS: {latencias_boas}')",
    "soma_latencias = sum(latencias_boas)\nqtd_nucleo = len(nucleo_pacotes)\nprint(f'>>> HIDRA PURGED: {qtd_nucleo}|{soma_latencias}')",
  ],
  "boss-montanha-loops": [
    "soma_harmonica = 0\nfor n in range(1, 16):\n    if n % 3 == 0:\n        soma_harmonica += n\nprint(f'HARMONICA: {soma_harmonica}')",
    "pulsos_validos = 0\nfor p in pulsos:\n    if p > 0:\n        pulsos_validos += 1\nprint(f'VALIDOS: {pulsos_validos}')",
    "frequencia_final = soma_harmonica * pulsos_validos\nprint(f'>>> CHRONOS SYNC: {frequencia_final}Hz')",
  ],
  "boss-floresta-funcoes": [
    "def amplificar(valor, fator=2):\n    return valor * fator\n\nsinal_amp = amplificar(21)\nprint(f'AMP: {sinal_amp}')",
    "def checksum_valido(numero):\n    return numero % 2 == 0 and numero > 10\n\nstatus_check = checksum_valido(sinal_amp)\nprint(f'CHECK: {status_check}')",
    "def gerar_assinatura(codigo):\n    return f'SIG-{amplificar(codigo, 3)}'\n\nassinatura_final = gerar_assinatura(15)\nprint(f'>>> {assinatura_final}')",
  ],
  "boss-cripta-dicionarios": [
    "cofre['porta'] = 8443\ncofre['ativo'] = True\nprint(f\"PORTA: {cofre['porta']}\")",
    "contagem = {}\nfor u in logs:\n    contagem[u] = contagem.get(u, 0) + 1\nprint(f\"ADMIN_HITS: {contagem['admin']}\")",
    "chave_mestra = cofre.get('token', 'HASH-999')\nprint(f'>>> VAULT KEY: {chave_mestra}')",
  ],
  "boss-fortaleza-oop": [
    "class Sentinela:\n    def __init__(self, nome, energia=100):\n        self.nome = nome\n        self.energia = energia\n\nrobo = Sentinela('Atlas', 80)\nprint(f'BOT: {robo.nome}|{robo.energia}')",
    "def recarregar(self, carga):\n    self.energia += carga\n    return self.energia\n\nSentinela.recarregar = recarregar\nrobo.recarregar(40)\nprint(f'ENERGIA: {robo.energia}')",
    "relatorio_oop = f'{robo.nome}-PWR-{robo.energia}'\nprint(f'>>> OOP BREACH: {relatorio_oop}')",
  ],
  "boss-bunker-excecoes": [
    "validos = []\ncorrompidos = 0\nfor pacote in pacotes:\n    try:\n        validos.append(int(pacote))\n    except ValueError:\n        corrompidos += 1\nprint(f'VALIDOS: {validos} | CORROMPIDOS: {corrompidos}')",
    "class ViolacaoDeQuarentena(Exception):\n    pass\n\ndef liberar_setor(nivel):\n    if nivel < 5:\n        raise ViolacaoDeQuarentena('nivel insuficiente')\n    return 'LIBERADO'\n\ntry:\n    liberar_setor(3)\nexcept ViolacaoDeQuarentena as e:\n    print(f'BLOQUEADO: {e}')\nfinally:\n    print('LOG FECHADO')",
    "import math\n\ndef checar_integridade(validos, total):\n    try:\n        return math.floor(validos / total * 100)\n    except ZeroDivisionError:\n        return 0\n\nintegridade = checar_integridade(len(validos), len(pacotes))\nprint(f'>>> CONTENCAO: {integridade}% INTEGRO')",
  ],
  "boss-oraculo-generativo": [
    "def recuperar(consulta, docs):\n    palavras = set(consulta.split())\n    return max(docs, key=lambda d: len(palavras & set(d.split())))\n\nlembranca = recuperar('quem desligou o modulo etico', memorias)\nprint(f'MEMORIA: {lembranca}')",
    "erros = {}\nfor setor, decisao, realidade in decisoes:\n    certa = 'isolar' if realidade == 'ameaca' else 'liberar'\n    erros[setor] = erros.get(setor, 0) + (1 if decisao != certa else 0)\npior_setor = max(erros, key=erros.get)\nprint(f'VIES: {pior_setor} ({erros[pior_setor]} erros)')",
    "prompt_sistema = 'Voce e AURORA. Regras: ' + '; '.join(regras)\n\ndef agente(pedido):\n    if 'auditar' in pedido:\n        return 'auditoria'\n    if 'lembrar' in pedido:\n        return 'memoria'\n    return 'humano'\n\nprint(f'PATCH ENVIADO: {len(prompt_sistema)} caracteres')",
  ],
};

/** Respostas erradas conhecidas: o ato indicado NÃO pode ser concluído com elas. */
export const BOSS_WRONG_ATTEMPTS: { bossId: string; act: number; label: string; code: string }[] = [
  {
    bossId: "boss-bunker-excecoes",
    act: 0,
    label: "valores fixos com except só em comentário",
    code: "validos = [42, 17, 8]\ncorrompidos = 2\n# except ValueError\nprint('VALIDOS: [42, 17, 8] | CORROMPIDOS: 2')",
  },
  {
    bossId: "boss-bunker-excecoes",
    act: 2,
    label: "divisão sem tratar ZeroDivisionError",
    code: "import math\n\ndef checar_integridade(validos, total):\n    return math.floor(validos / total * 100)\n\nintegridade = checar_integridade(len(validos), len(pacotes))\nprint(f'>>> CONTENCAO: {integridade}% INTEGRO')",
  },
  {
    bossId: "boss-oraculo-generativo",
    act: 0,
    label: "recuperar devolve sempre o mesmo documento",
    code: "def recuperar(consulta, docs):\n    return docs[2]\n\nlembranca = recuperar('quem desligou o modulo etico', memorias)\nprint(f'MEMORIA: {lembranca}')",
  },
  {
    bossId: "boss-oraculo-generativo",
    act: 1,
    label: "esquece setores sem erro e conta acertos",
    code: "erros = {}\nfor setor, decisao, realidade in decisoes:\n    if decisao == 'isolar':\n        erros[setor] = erros.get(setor, 0) + 1\npior_setor = max(erros, key=erros.get)\nprint(f'VIES: {pior_setor} ({erros[pior_setor]} erros)')",
  },
  {
    bossId: "boss-oraculo-generativo",
    act: 2,
    label: "agente manda tudo para a auditoria",
    code: "prompt_sistema = 'Voce e AURORA. Regras: ' + '; '.join(regras)\n\ndef agente(pedido):\n    return 'auditoria'\n\nprint(f'PATCH ENVIADO: {len(prompt_sistema)} caracteres')",
  },
];
