import { BossChallenge } from "../types";

export const BLACKBOX_ALPHA_BOSS: BossChallenge = {
  id: "boss-vila-variaveis",
  worldId: "vila-variaveis",
  title: "Operação BlackBox",
  codename: "Infiltração no Core",
  intro:
    "AI-7 entra em transmissão criptografada. // ALERTA: Operação BlackBox AUTORIZADA. Você foi selecionado para infiltrar o Core da CorpHQ e extrair o token de acesso administrativo. Cinco atos. Sem segunda chance de reconhecimento. Cada técnica que você aprendeu no Terminal Alpha será necessária — variáveis, casting, slicing, métodos de string, f-strings. Confirme: pronto para o handshake final?",
  finalStory:
    "ACESSO TOTAL CONCEDIDO. O firewall caiu, o token foi entregue, e seu rastro digital foi apagado. A CorpHQ ainda não sabe que perdeu. Você acaba de provar que domina os fundamentos. AI-7 fora.",
  unlockThreshold: 0.7,
  xpReward: 8000,
  acts: [
    {
      id: "act-1",
      title: "Sanitização do Sinal",
      narrative:
        "Capture o sinal de identificação do servidor-alvo. A linha chegou com ruído de transmissão — espaços laterais. Limpe e isole a versão do protocolo no quinto até o nono caractere.",
      setupCode: "sinal = '  CORE-V3.2-ADMIN  '\n",
      starterHint:
        "# Ato 1\n# 1. Crie sinal_limpo aplicando .strip() em sinal\n# 2. Crie versao com slicing [5:9] de sinal_limpo\n# 3. Imprima: >>> SIGNAL ACK: <sinal_limpo> | VERSION: <versao>\n",
      objectives: [
        {
          label: "Variável sinal_limpo == 'CORE-V3.2-ADMIN'",
          check: "sinal_limpo == 'CORE-V3.2-ADMIN'",
        },
        {
          label: "Variável versao == 'V3.2'",
          check: "versao == 'V3.2'",
        },
        {
          label: "Output contém '>>> SIGNAL ACK: CORE-V3.2-ADMIN | VERSION: V3.2'",
          check: "'>>> SIGNAL ACK: CORE-V3.2-ADMIN | VERSION: V3.2' in output",
        },
      ],
      hints: [
        {
          text: "sinal_limpo = sinal.strip() remove os espaços laterais.",
          cost: 50,
        },
        {
          text: "versao = sinal_limpo[5:9] captura os caracteres do índice 5 ao 8 inclusive.",
          cost: 75,
        },
        {
          text: "print(f'>>> SIGNAL ACK: {sinal_limpo} | VERSION: {versao}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-2",
      title: "Quebra da Credencial",
      narrative:
        "Uma credencial foi interceptada no formato user:senha:role. Quebre em três partes, normalize o usuário e meça o comprimento da senha.",
      setupCode: "credencial = 'neo_op:k3yp@ss_admin:operator'\n",
      starterHint:
        "# Ato 2\n# 1. Use split(':') para obter user, senha, role\n# 2. user_lower = user.lower()\n# 3. tam_senha = len(senha)\n# 4. Imprima: USER: <user_lower> | ROLE: <role> | SENHA_LEN: <tam_senha>\n",
      objectives: [
        {
          label: "user_lower == 'neo_op'",
          check: "user_lower == 'neo_op'",
        },
        {
          label: "role == 'operator'",
          check: "role == 'operator'",
        },
        {
          label: "tam_senha == 14",
          check: "tam_senha == 14",
        },
        {
          label:
            "Output contém 'USER: neo_op | ROLE: operator | SENHA_LEN: 14'",
          check:
            "'USER: neo_op | ROLE: operator | SENHA_LEN: 14' in output",
        },
      ],
      hints: [
        {
          text: "user, senha, role = credencial.split(':') desempacota direto em 3 variáveis.",
          cost: 50,
        },
        {
          text: "Aplique .lower() em user e len() em senha.",
          cost: 75,
        },
        {
          text: "print(f'USER: {user_lower} | ROLE: {role} | SENHA_LEN: {tam_senha}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-3",
      title: "Geração do Token Alpha",
      narrative:
        "Calcule o Token Alpha. Fórmula: pegue o segundo caractere de versao (índice 1, que é '3'), converta para int, multiplique pelo tamanho do user e pelo tamanho da senha. Aplique módulo 1024. O resultado é o token.",
      setupCode: "",
      starterHint:
        "# Ato 3\n# 1. ver_num = int(versao[1])\n# 2. tam_user = len(user_lower)\n# 3. token_raw = ver_num * tam_user * tam_senha\n# 4. token = token_raw % 1024\n# 5. Imprima: TOKEN ALPHA: <token>\n",
      objectives: [
        {
          label: "ver_num == 3",
          check: "ver_num == 3",
        },
        {
          label: "tam_user == 6",
          check: "tam_user == 6",
        },
        {
          label: "token_raw == 252",
          check: "token_raw == 252",
        },
        {
          label: "token == 252 (módulo 1024)",
          check: "token == 252",
        },
        {
          label: "Output contém 'TOKEN ALPHA: 252'",
          check: "'TOKEN ALPHA: 252' in output",
        },
      ],
      hints: [
        {
          text: "versao[1] retorna o caractere '3'. Use int() para converter em número.",
          cost: 50,
        },
        {
          text: "token_raw = ver_num * tam_user * tam_senha. Depois aplique % 1024.",
          cost: 75,
        },
        {
          text: "print(f'TOKEN ALPHA: {token}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-4",
      title: "Ofuscação da Origem",
      narrative:
        "Antes de transmitir o token, ofusque o endereço de origem. Receba o host via input(), substitua todos os pontos por [X] e converta para maiúsculas. O rastreador da CorpHQ depende de regex em domínios — quebre esse padrão.",
      setupCode:
        "import sys, io\nsys.stdin = io.StringIO('host42.corp.net\\n')\n",
      starterHint:
        "# Ato 4\n# 1. endereco = input()\n# 2. endereco_ofuscado = endereco.replace('.', '[X]')\n# 3. endereco_final = endereco_ofuscado.upper()\n# 4. Imprima: ORIGIN: <endereco_final>\n",
      objectives: [
        {
          label: "endereco == 'host42.corp.net'",
          check: "endereco == 'host42.corp.net'",
        },
        {
          label: "endereco_ofuscado == 'host42[X]corp[X]net'",
          check: "endereco_ofuscado == 'host42[X]corp[X]net'",
        },
        {
          label: "endereco_final == 'HOST42[X]CORP[X]NET'",
          check: "endereco_final == 'HOST42[X]CORP[X]NET'",
        },
        {
          label: "Output contém 'ORIGIN: HOST42[X]CORP[X]NET'",
          check: "'ORIGIN: HOST42[X]CORP[X]NET' in output",
        },
      ],
      hints: [
        {
          text: "Use endereco.replace('.', '[X]') para trocar todos os pontos.",
          cost: 50,
        },
        {
          text: "Encadeie: endereco_final = endereco_ofuscado.upper()",
          cost: 75,
        },
        {
          text: "print(f'ORIGIN: {endereco_final}')",
          cost: 100,
        },
      ],
    },
    {
      id: "act-5",
      title: "Transmissão ao Core",
      narrative:
        "Acerte o pacote final. Monte a string PKT[<versao>]>TKN=<token>>SRC=<endereco_final> usando todas as variáveis acumuladas. Imprima o pacote e a confirmação de extração.",
      setupCode: "",
      starterHint:
        "# Ato 5 — FINAL\n# 1. Monte pacote_final usando f-string com versao, token, endereco_final\n# 2. Imprima pacote_final\n# 3. Imprima: >>> CORE BREACHED. EXTRACTION COMPLETE.\n",
      objectives: [
        {
          label:
            "pacote_final == 'PKT[V3.2]>TKN=252>SRC=HOST42[X]CORP[X]NET'",
          check:
            "pacote_final == 'PKT[V3.2]>TKN=252>SRC=HOST42[X]CORP[X]NET'",
        },
        {
          label:
            "Output contém 'PKT[V3.2]>TKN=252>SRC=HOST42[X]CORP[X]NET'",
          check:
            "'PKT[V3.2]>TKN=252>SRC=HOST42[X]CORP[X]NET' in output",
        },
        {
          label: "Output contém '>>> CORE BREACHED. EXTRACTION COMPLETE.'",
          check: "'>>> CORE BREACHED. EXTRACTION COMPLETE.' in output",
        },
      ],
      hints: [
        {
          text: "pacote_final = f'PKT[{versao}]>TKN={token}>SRC={endereco_final}'",
          cost: 50,
        },
        {
          text: "Use dois print() — um para o pacote, outro para a confirmação.",
          cost: 75,
        },
        {
          text: "print(pacote_final)\\nprint('>>> CORE BREACHED. EXTRACTION COMPLETE.')",
          cost: 100,
        },
      ],
    },
  ],
};
