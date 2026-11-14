export type LocalizedChallengeFields = {
  title: string;
  description: string;
  narrative: string;
  concept: string;
  conceptExplanation: string;
  hints: string[];
  introStory?: string;
  successStory?: string;
};

export const WORLD_TAGS_EN: Record<string, string> = {
  "vila-variaveis": "print, variables, strings",
  "vale-condicoes": "if, else",
  "montanha-loops": "for, range",
  "floresta-funcoes": "def, parameters",
  "ninho-listas": "lists, matrices",
  "cripta-dicionarios": "dicts, key-value",
  "fortaleza-oop": "classes, objects, OOP",
  "bunker-excecoes": "try, except, modules",
  "refinaria-dados": "pandas, numpy",
  "sala-comando-visual": "matplotlib, seaborn",
  "laboratorio-neural": "scikit-learn, ml",
  "nucleo-sintetico": "tensorflow, pytorch",
  "camara-probabilidades": "scipy, statsmodels",
  "cronograma-temporal": "arima, prophet",
  "sintetizador-linguagem": "nltk, spacy, transformers",
  "oraculo-generativo": "openai, langchain, rag",
};

export const WORLDS_EN: Record<
  string,
  { title: string; subtitle: string; lore: string }
> = {
  "vila-variaveis": {
    title: "Terminal Alpha",
    subtitle: "Connection Established",
    lore: "The security system has isolated the city's core. Here at Terminal Alpha, you must initialize the Allocation Protocol: define variables and manipulate local memory to perform your first primary firewall bypass.",
  },
  "vale-condicoes": {
    title: "Routing Node",
    subtitle: "Data Branches & Forks",
    lore: "At the Routing Node, the Central System tests your logic. Code does not flow only in a straight line; it must decide which path to take based on predefined conditions.",
  },
  "ninho-listas": {
    title: "List Nest",
    subtitle: "Batch Processing",
    lore: "Data traffic in the Core does not travel alone; it flows in massive, structured streams. In the List Nest, you will learn to group packets, slice memory buffers, and manage data collections for large-scale operations.",
  },
  "montanha-loops": {
    title: "Iteration Sector",
    subtitle: "Infinite Processing Cycles",
    lore: "In the Iteration Sector, time is measured in CPU cycles. Here, you must master processing loops to execute repetitive tasks at massive scale with a single script.",
  },
  "floresta-funcoes": {
    title: "Function Repository",
    subtitle: "System Modularization",
    lore: "In the Central Repository, operators optimize scripts by encapsulating routines into reusable blocks called Functions.",
  },
  "cripta-dicionarios": {
    title: "Hash Vault",
    subtitle: "Key-Value Mapping",
    lore: "In the Hash Vault, information is not sequential. Here, data is mapped in key-value pairs for instant access. Master Dictionaries and Sets to optimize network lookup speed.",
  },
  "fortaleza-oop": {
    title: "Object Fortress",
    subtitle: "Object-Oriented Programming",
    lore: "The Object Fortress guards the central structure. Isolated code does not survive here; you must build Classes and Objects — self-sufficient entities with their own state and abilities — to breach the fortress.",
  },
  "bunker-excecoes": {
    title: "Exception Bunker",
    subtitle: "Error Handling & Modules",
    lore: "In CorpHQ's critical systems, a single unhandled error can crash the core and trigger alarms. In the Exception Bunker, you will learn to intercept failures with try/except and organize code into modules.",
  },
  "refinaria-dados": {
    title: "Data Refinery",
    subtitle: "Data Engineering & Pandas",
    lore: "Raw data flows in chaotic torrents through CorpHQ's pipelines. At the Data Refinery, use NumPy and Pandas to clean, filter, aggregate, and extract tactical intelligence.",
  },
  "sala-comando-visual": {
    title: "Visual Command Room",
    subtitle: "Data Visualization",
    lore: "Numbers in tables hide critical patterns. In the Visual Command Room, transform datasets into charts and heatmaps to expose anomalies across the network.",
  },
  "laboratorio-neural": {
    title: "Neural Lab",
    subtitle: "Machine Learning",
    lore: "Static rules are no longer enough. In the Neural Lab, train predictive models with Scikit-Learn to classify threats and forecast system behavior.",
  },
  "nucleo-sintetico": {
    title: "Synthetic Core",
    subtitle: "Deep Learning",
    lore: "Enter deep neural architectures. In the Synthetic Core, build multi-layer networks, tensors, and backpropagation pipelines to master Deep Learning.",
  },
  "camara-probabilidades": {
    title: "Probability Chamber",
    subtitle: "Statistics & Inference",
    lore: "Uncertainty rules the network. In the Probability Chamber, apply statistical distributions, hypothesis testing, and Bayesian inference to validate every signal.",
  },
  "cronograma-temporal": {
    title: "Temporal Chronograph",
    subtitle: "Time Series Analysis",
    lore: "Every breach leaves a footprint across time. In the Temporal Chronograph, analyze trends, seasonality, and moving windows to anticipate future spikes.",
  },
  "sintetizador-linguagem": {
    title: "Language Synthesizer",
    subtitle: "Natural Language Processing",
    lore: "Intercepted transmissions arrive as unstructured text. In the Language Synthesizer, tokenize, vectorize, and extract meaning using modern NLP.",
  },
  "oraculo-generativo": {
    title: "Generative Oracle",
    subtitle: "LLMs, RAG & AI Agents",
    lore: "At the pinnacle of the Archipelago, orchestrate prompts, embeddings, vector retrieval (RAG), and autonomous AI agents to rewrite the Mainframe itself.",
  },
};

export const BOSSES_EN: Record<
  string,
  {
    title: string;
    codename: string;
    intro: string;
    finalStory: string;
    acts: {
      title: string;
      narrative: string;
      objectives: string[];
      hints: string[];
    }[];
  }
> = {
  "boss-vila-variaveis": {
    title: "Operation BlackBox",
    codename: "Core Infiltration",
    intro:
      "AI-7 opens an encrypted transmission. // ALERT: Operation BlackBox AUTHORIZED. You have been selected to infiltrate CorpHQ's Core and extract the admin access token. Five acts. No second chance at recon. Every technique learned at Terminal Alpha is required — variables, casting, slicing, string methods, f-strings. Ready for the final handshake?",
    finalStory:
      "FULL ACCESS GRANTED. The firewall collapsed, the token was delivered, and your digital footprint has been wiped. CorpHQ doesn't even know it lost yet. You just proved you master the fundamentals. AI-7 out.",
    acts: [
      {
        title: "Signal Sanitization",
        narrative:
          "Capture the target server identification signal. The line arrived with transmission noise — leading and trailing spaces. Clean it (`sinal_limpo`) and slice the protocol version (`versao`) from index 5 to 9. Print: `>>> SIGNAL ACK: <sinal_limpo> | VERSION: <versao>`.",
        objectives: [
          "Variable sinal_limpo == 'CORE-V3.2-ADMIN'",
          "Variable versao == 'V3.2'",
          "Output contains '>>> SIGNAL ACK: CORE-V3.2-ADMIN | VERSION: V3.2'",
        ],
        hints: [
          "sinal_limpo = sinal.strip() removes leading and trailing spaces.",
          "versao = sinal_limpo[5:9] captures characters from index 5 through 8.",
          "print(f'>>> SIGNAL ACK: {sinal_limpo} | VERSION: {versao}')",
        ],
      },
      {
        title: "Credential Breach",
        narrative:
          "A credential was intercepted in `user:senha:role` format. Split it into three parts, normalize the username to lowercase (`user_lower`), and measure the password length (`tam_senha`). Print: `USER: <user_lower> | ROLE: <role> | SENHA_LEN: <tam_senha>`.",
        objectives: [
          "user_lower == 'neo_op'",
          "role == 'operator'",
          "tam_senha == 14",
          "Output contains 'USER: neo_op | ROLE: operator | SENHA_LEN: 14'",
        ],
        hints: [
          "user, senha, role = credencial.split(':') unpacks directly into 3 variables.",
          "Apply .lower() to user and len() to senha.",
          "print(f'USER: {user_lower} | ROLE: {role} | SENHA_LEN: {tam_senha}')",
        ],
      },
      {
        title: "Alpha Token Generation",
        narrative:
          "Compute the Alpha Token: take the second character of `versao` (index 1, `'3'`), convert to `int` (`ver_num`), multiply by `tam_user` (`len(user_lower)`) and `tam_senha` into `token_raw`. Apply `% 1024` to get `token`. Print: `TOKEN ALPHA: <token>`.",
        objectives: [
          "ver_num == 3",
          "tam_user == 6",
          "token_raw == 252",
          "token == 252 (modulo 1024)",
          "Output contains 'TOKEN ALPHA: 252'",
        ],
        hints: [
          "versao[1] returns '3'. Use int() to convert it to an integer.",
          "token_raw = ver_num * tam_user * tam_senha. Then apply % 1024.",
          "print(f'TOKEN ALPHA: {token}')",
        ],
      },
      {
        title: "Origin Obfuscation",
        narrative:
          "Before transmitting the token, obfuscate the origin address. Read `endereco = input()`, replace all dots with `[X]` (`endereco_ofuscado`), and convert to uppercase (`endereco_final`). Print: `ORIGIN: <endereco_final>`.",
        objectives: [
          "endereco == 'host42.corp.net'",
          "endereco_ofuscado == 'host42[X]corp[X]net'",
          "endereco_final == 'HOST42[X]CORP[X]NET'",
          "Output contains 'ORIGIN: HOST42[X]CORP[X]NET'",
        ],
        hints: [
          "Use endereco.replace('.', '[X]') to swap every dot.",
          "Chain: endereco_final = endereco_ofuscado.upper()",
          "print(f'ORIGIN: {endereco_final}')",
        ],
      },
      {
        title: "Core Transmission",
        narrative:
          "Assemble the final packet string `pacote_final` as `PKT[<versao>]>TKN=<token>>SRC=<endereco_final>` using all accumulated variables. Print `pacote_final` and then `>>> CORE BREACHED. EXTRACTION COMPLETE.`.",
        objectives: [
          "pacote_final == 'PKT[V3.2]>TKN=252>SRC=HOST42[X]CORP[X]NET'",
          "Output contains 'PKT[V3.2]>TKN=252>SRC=HOST42[X]CORP[X]NET'",
          "Output contains '>>> CORE BREACHED. EXTRACTION COMPLETE.'",
        ],
        hints: [
          "pacote_final = f'PKT[{versao}]>TKN={token}>SRC={endereco_final}'",
          "Use two print() calls — one for the packet, one for the confirmation.",
          "print(pacote_final)\\nprint('>>> CORE BREACHED. EXTRACTION COMPLETE.')",
        ],
      },
    ],
  },
  "boss-vale-condicoes": {
    title: "Cerberus Sentinel",
    codename: "Routing Node Bypass",
    intro:
      "AI-7 intercepts the routing mesh. // ALERT: Cerberus Sentinel detected blocking the central gateway. It operates in three logical layers: Risk Triage, Multi-Factor Boolean Validation, and Emergency Route Dispatch. Use if, elif, else, and logical operators (and/or) to outsmart the packet arbiter.",
    finalStory:
      "ROUTING REWRITTEN. Cerberus Sentinel unlocked every logic gate in the sector and redirected administrative traffic straight to your terminal. You master conditional flow.",
    acts: [
      {
        title: "Threat Triage",
        narrative:
          "The incoming packet has `score_risco = 78`. Classify `nivel`: if `score_risco >= 80` set `'CRITICO'`, elif `>= 50` set `'ALTO'`, else `'BAIXO'`. Print `NIVEL: <nivel>`.",
        objectives: ["Variable nivel == 'ALTO'", "Output contains 'NIVEL: ALTO'"],
        hints: [
          "Use if score_risco >= 80: ... elif score_risco >= 50: ... else: ...",
          "Since score_risco is 78, nivel must be 'ALTO'.",
          "print(f'NIVEL: {nivel}')",
        ],
      },
      {
        title: "Multi-Factor Authorization",
        narrative:
          "The firewall checks `chave_valida = True`, `ip_interno = False`, and `override_admin = True`. Set `acesso_liberado` to `True` if (`chave_valida` and `ip_interno`) OR `override_admin`. If granted, set `rota = 'TUNEL_SEGURO'`, else `'QUARENTENA'`. Print `ROTA: <rota>`.",
        objectives: [
          "acesso_liberado == True",
          "rota == 'TUNEL_SEGURO'",
          "Output contains 'ROTA: TUNEL_SEGURO'",
        ],
        hints: [
          "acesso_liberado = (chave_valida and ip_interno) or override_admin",
          "if acesso_liberado:\n    rota = 'TUNEL_SEGURO'\nelse:\n    rota = 'QUARENTENA'",
          "print(f'ROTA: {rota}')",
        ],
      },
      {
        title: "Gateway Signature",
        narrative:
          "Combine `nivel` and `rota`. If `nivel == 'ALTO'` and `rota == 'TUNEL_SEGURO'`, set `comando_final = 'BYPASS_CERBERUS_OK'`. Print `>>> <comando_final>`.",
        objectives: [
          "comando_final == 'BYPASS_CERBERUS_OK'",
          "Output contains '>>> BYPASS_CERBERUS_OK'",
        ],
        hints: [
          "if nivel == 'ALTO' and rota == 'TUNEL_SEGURO':\n    comando_final = 'BYPASS_CERBERUS_OK'",
          "print(f'>>> {comando_final}')",
        ],
      },
    ],
  },
  "boss-montanha-loops": {
    title: "Chronos Reactor",
    codename: "Cycle Overload",
    intro:
      "AI-7 warns of a thermal spike in the Iteration Sector. // ALERT: The Chronos Reactor blocks the path with three synchronized coils. You will need for-loops, modulo filtering, and iterative accumulators to stabilize the core without triggering an infinite loop.",
    finalStory:
      "CHRONOS CORE STABILIZED. CPU cycles now obey your command and the path to the Function Repository is open!",
    acts: [
      {
        title: "Harmonic Sweep",
        narrative:
          "Sum all multiples of 3 from `1` to `15` (inclusive) using a loop and store in `soma_harmonica`. Print `HARMONICA: <soma_harmonica>`.",
        objectives: ["soma_harmonica == 45", "Output contains 'HARMONICA: 45'"],
        hints: [
          "Use for n in range(1, 16): and check if n % 3 == 0:",
          "3 + 6 + 9 + 12 + 15 equals 45.",
          "print(f'HARMONICA: {soma_harmonica}')",
        ],
      },
      {
        title: "Pulse Filtering",
        narrative:
          "The list `pulsos = [12, -5, 20, 0, -3, 8]` holds coil readings. Loop over it and count how many pulses are strictly positive (`> 0`) in `pulsos_validos`. Print `VALIDOS: <pulsos_validos>`.",
        objectives: ["pulsos_validos == 3", "Output contains 'VALIDOS: 3'"],
        hints: [
          "Initialize pulsos_validos = 0 and loop for p in pulsos: if p > 0: pulsos_validos += 1",
          "print(f'VALIDOS: {pulsos_validos}')",
        ],
      },
      {
        title: "Frequency Fusion",
        narrative:
          "Compute `frequencia_final` by multiplying `soma_harmonica` by `pulsos_validos`. Print `>>> CHRONOS SYNC: <frequencia_final>Hz`.",
        objectives: [
          "frequencia_final == 135",
          "Output contains '>>> CHRONOS SYNC: 135Hz'",
        ],
        hints: [
          "frequencia_final = soma_harmonica * pulsos_validos (45 * 3 = 135)",
          "print(f'>>> CHRONOS SYNC: {frequencia_final}Hz')",
        ],
      },
    ],
  },
  "boss-ninho-listas": {
    title: "Buffer Hydra",
    codename: "Batch Purge",
    intro:
      "AI-7 detects multiple memory heads allocated in parallel. // ALERT: The Buffer Hydra corrupted the packet queue in the List Nest. Use slicing, list methods, and list comprehensions to sever every data head before the buffer overflows.",
    finalStory:
      "BUFFERS SYNCHRONIZED. All three Hydra heads have been reduced to clean, sorted vectors. The Core's batch stream is now yours.",
    acts: [
      {
        title: "Packet Slicing",
        narrative:
          "The buffer `pacotes = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5']` contains noise at both ends. Slice the 3 central elements (`'P2'`, `'P3'`, `'P4'`) into `nucleo_pacotes`. Print `NUCLEO: <nucleo_pacotes>`.",
        objectives: [
          "nucleo_pacotes == ['P2', 'P3', 'P4']",
          "Output contains \"NUCLEO: ['P2', 'P3', 'P4']\"",
        ],
        hints: [
          "nucleo_pacotes = pacotes[2:5] extracts indices 2, 3, and 4.",
          "print(f'NUCLEO: {nucleo_pacotes}')",
        ],
      },
      {
        title: "Queue Purification",
        narrative:
          "The list `latencias = [45, 12, 99, 8, 30]` must be sanitized. Create `latencias_boas` containing only values `< 50`, sorted ascending (`sorted`). Print `LATENCIAS: <latencias_boas>`.",
        objectives: [
          "latencias_boas == [8, 12, 30, 45]",
          "Output contains 'LATENCIAS: [8, 12, 30, 45]'",
        ],
        hints: [
          "latencias_boas = sorted([x for x in latencias if x < 50])",
          "print(f'LATENCIAS: {latencias_boas}')",
        ],
      },
      {
        title: "Vector Consolidation",
        narrative:
          "Compute the sum of `latencias_boas` into `soma_latencias` and the length of `nucleo_pacotes` into `qtd_nucleo`. Print `>>> HIDRA PURGED: <qtd_nucleo>|<soma_latencias>`.",
        objectives: [
          "soma_latencias == 95",
          "qtd_nucleo == 3",
          "Output contains '>>> HIDRA PURGED: 3|95'",
        ],
        hints: [
          "sum([8, 12, 30, 45]) == 95 and len(['P2', 'P3', 'P4']) == 3.",
          "print(f'>>> HIDRA PURGED: {qtd_nucleo}|{soma_latencias}')",
        ],
      },
    ],
  },
  "boss-floresta-funcoes": {
    title: "Modular Architect",
    codename: "Subroutine Compilation",
    intro:
      "AI-7 establishes a tunnel to the Central Repository. // ALERT: The Modular Architect only accepts code encapsulated in pure functions with explicit `return` values. Build a library of 3 interdependent functions to decode the sector signature.",
    finalStory:
      "SUBROUTINES VALIDATED. The Modular Architect merged your functions into Aurora's Kernel. You master procedural abstraction.",
    acts: [
      {
        title: "Signal Amplifier",
        narrative:
          "Define a function `amplificar(valor, fator=2)` that returns `valor * fator`. Call `amplificar(21)` and store in `sinal_amp`. Print `AMP: <sinal_amp>`.",
        objectives: [
          "amplificar is callable",
          "sinal_amp == 42",
          "amplificar(10, 3) == 30",
          "Output contains 'AMP: 42'",
        ],
        hints: [
          "def amplificar(valor, fator=2):\n    return valor * fator",
          "sinal_amp = amplificar(21)\nprint(f'AMP: {sinal_amp}')",
        ],
      },
      {
        title: "Checksum Validator",
        narrative:
          "Create `checksum_valido(numero)` returning `True` if `numero % 2 == 0` and `numero > 10`, else `False`. Save `checksum_valido(sinal_amp)` in `status_check`. Print `CHECK: <status_check>`.",
        objectives: [
          "checksum_valido(42) is True",
          "checksum_valido(8) is False",
          "status_check is True",
          "Output contains 'CHECK: True'",
        ],
        hints: [
          "def checksum_valido(numero):\n    return numero % 2 == 0 and numero > 10",
          "print(f'CHECK: {status_check}')",
        ],
      },
      {
        title: "Final Orchestration",
        narrative:
          "Define `gerar_assinatura(codigo)` calling `amplificar(codigo, 3)` and returning `f'SIG-{amplificar(codigo, 3)}'`. Store `gerar_assinatura(15)` in `assinatura_final` and print `>>> <assinatura_final>`.",
        objectives: [
          "assinatura_final == 'SIG-45'",
          "Output contains '>>> SIG-45'",
        ],
        hints: [
          "def gerar_assinatura(codigo):\n    return f'SIG-{amplificar(codigo, 3)}'",
          "assinatura_final = gerar_assinatura(15)\nprint(f'>>> {assinatura_final}')",
        ],
      },
    ],
  },
  "boss-cripta-dicionarios": {
    title: "Hash Guardian",
    codename: "Vault Indexing",
    intro:
      "AI-7 accesses the key-value records of the Hash Vault. // ALERT: The Hash Guardian protects server metadata. Mutate dictionaries, count frequencies dynamically, and perform safe lookups with `.get()` to extract the master key.",
    finalStory:
      "VAULT INDEXED. You traversed the Hash Vault in O(1) time and extracted the master key without triggering a single KeyError.",
    acts: [
      {
        title: "Credential Mapping",
        narrative:
          "Given `cofre = {'porta': 443, 'protocolo': 'HTTPS'}`, add key `'ativo': True` and update `'porta'` to `8443`. Print `PORTA: <cofre['porta']>`.",
        objectives: [
          "cofre['porta'] == 8443",
          "cofre['ativo'] is True",
          "Output contains 'PORTA: 8443'",
        ],
        hints: [
          "cofre['porta'] = 8443\ncofre['ativo'] = True",
          "print(f\"PORTA: {cofre['porta']}\")",
        ],
      },
      {
        title: "Access Frequency",
        narrative:
          "The list `logs = ['admin', 'guest', 'admin', 'root', 'admin']` records login attempts. Build a dictionary `contagem` counting each user's frequency. Print `ADMIN_HITS: <contagem['admin']>`.",
        objectives: [
          "contagem == {'admin': 3, 'guest': 1, 'root': 1}",
          "Output contains 'ADMIN_HITS: 3'",
        ],
        hints: [
          "contagem = {}\nfor u in logs:\n    contagem[u] = contagem.get(u, 0) + 1",
          "print(f\"ADMIN_HITS: {contagem['admin']}\")",
        ],
      },
      {
        title: "Safe Extraction",
        narrative:
          "Use `.get()` to look up `'token'` in `cofre` with default `'HASH-999'` and store in `chave_mestra`. Print `>>> VAULT KEY: <chave_mestra>`.",
        objectives: [
          "chave_mestra == 'HASH-999'",
          "Output contains '>>> VAULT KEY: HASH-999'",
        ],
        hints: [
          "chave_mestra = cofre.get('token', 'HASH-999')",
          "print(f'>>> VAULT KEY: {chave_mestra}')",
        ],
      },
    ],
  },
  "boss-fortaleza-oop": {
    title: "OOP Colossus",
    codename: "Class Architecture",
    intro:
      "AI-7 activates the object-oriented engineering protocol. // ALERT: The OOP Colossus can only be defeated by a well-structured class featuring a constructor (`__init__`), instance attributes, and custom methods.",
    finalStory:
      "FORTRESS CONQUERED. Your instantiated object overwhelmed the OOP Colossus's defenses and took control of the automaton factory!",
    acts: [
      {
        title: "Automaton Blueprint",
        narrative:
          "Create class `Sentinela` with `__init__(self, nome, energia=100)` storing `self.nome` and `self.energia`. Instantiate `robo = Sentinela('Atlas', 80)`. Print `BOT: <robo.nome>|<robo.energia>`.",
        objectives: [
          "robo is an instance of Sentinela",
          "robo.nome == 'Atlas' and robo.energia == 80",
          "Output contains 'BOT: Atlas|80'",
        ],
        hints: [
          "class Sentinela:\n    def __init__(self, nome, energia=100):\n        self.nome = nome\n        self.energia = energia",
          "robo = Sentinela('Atlas', 80)\nprint(f'BOT: {robo.nome}|{robo.energia}')",
        ],
      },
      {
        title: "Recharge Method",
        narrative:
          "Define a method `recarregar(self, carga)` on `Sentinela` that adds `carga` to `self.energia` and returns the new value. Call `robo.recarregar(40)` and print `ENERGIA: <robo.energia>`.",
        objectives: [
          "robo has callable method recarregar",
          "robo.energia == 120",
          "Output contains 'ENERGIA: 120'",
        ],
        hints: [
          "Add def recarregar(self, carga): self.energia += carga; return self.energia",
          "Or in Act 2: Sentinela.recarregar = lambda self, carga: setattr(self, 'energia', self.energia + carga) or self.energia",
        ],
      },
      {
        title: "Assault Protocol",
        narrative:
          "Create `relatorio_oop = f'{robo.nome}-PWR-{robo.energia}'` and print `>>> OOP BREACH: <relatorio_oop>`.",
        objectives: [
          "relatorio_oop == 'Atlas-PWR-120'",
          "Output contains '>>> OOP BREACH: Atlas-PWR-120'",
        ],
        hints: [
          "relatorio_oop = f'{robo.nome}-PWR-{robo.energia}'",
          "print(f'>>> OOP BREACH: {relatorio_oop}')",
        ],
      },
    ],
  },
};

export const ACHIEVEMENTS_EN: Record<
  string,
  { title: string; description: string; titleReward?: string }
> = {
  first_query: { title: "First Script", description: "Complete your first Python challenge", titleReward: "Aurora Apprentice" },
  xp_250_explorer: { title: "First Points", description: "Accumulate 250 XP", titleReward: "Harbor Visitor" },
  xp_500: { title: "Code in Motion", description: "Accumulate 500 XP", titleReward: "Python Explorer" },
  xp_1000: { title: "Study Routine", description: "Accumulate 1,000 XP", titleReward: "Python Practitioner" },
  xp_1500_dedicated: { title: "Active Workshop", description: "Accumulate 1,500 XP", titleReward: "Script Builder" },
  "world_vila-variaveis_complete": { title: "Alpha Cleared", description: "Complete all challenges in Terminal Alpha", titleReward: "Alpha Technician" },
  "world_vale-condicoes_complete": { title: "Node Mapped", description: "Complete all challenges in Routing Node", titleReward: "Decision Guide" },
  "world_ninho-listas_complete": { title: "Nest Organized", description: "Complete all challenges in List Nest", titleReward: "List Collector" },
  "world_montanha-loops_complete": { title: "Cycles Synced", description: "Complete all challenges in Iteration Sector", titleReward: "Cycle Operator" },
  "world_floresta-funcoes_complete": { title: "Repository Complete", description: "Complete all challenges in Function Repository", titleReward: "Function Artisan" },
  no_hints: { title: "No Training Wheels", description: "Complete 3 challenges without using hints", titleReward: "Autonomous" },
  hints_used_5: { title: "Active Study", description: "Use hints in 5 different challenges", titleReward: "Investigator" },
  first_try_1: { title: "First Execution", description: "Complete 3 challenges on the first attempt", titleReward: "Initial Precision" },
  perfect_world: { title: "Total Mastery", description: "Complete an entire sector without using hints", titleReward: "Pure Code" },
  two_worlds_complete: { title: "Double Explorer", description: "Complete 2 entire sectors", titleReward: "Aurora Navigator" },
  all_worlds_started: { title: "Stamped Passport", description: "Complete at least 1 challenge in every sector", titleReward: "Python Traveler" },
  all_complete: { title: "Protocol Master", description: "Complete every challenge in the game", titleReward: "Protocol Master" },
  streak_3: { title: "Persistent Hacker", description: "Maintain a 3-day active streak", titleReward: "Infiltrator" },
  streak_7: { title: "System Ghost", description: "Maintain a 7-day active streak", titleReward: "Core Shadow" },
  streak_14: { title: "Living Legend", description: "Maintain a 14-day active streak", titleReward: "Living Legend" },
  streak_30: { title: "Operator of the Month", description: "Maintain a 30-day active streak", titleReward: "Core Addict" },
  xp_3000: { title: "Transcendent", description: "Accumulate 3,000 XP", titleReward: "Transcendent" },
  xp_5000: { title: "Deus Ex Machina", description: "Accumulate 5,000 XP", titleReward: "Machine God" },
  first_try_10: { title: "Clean Code", description: "Complete 10 challenges on the first attempt", titleReward: "Sniper" },
  first_try_20: { title: "Relentless Machine", description: "Complete 20 challenges on the first attempt", titleReward: "Cyborg" },
  hints_used_1: { title: "Curious", description: "Use your first hint", titleReward: "Seeker" },
  no_hints_10: { title: "Pure Processing", description: "Complete 10 challenges without hints", titleReward: "Focused Mind" },
  four_worlds_complete: { title: "Main Vector", description: "Complete 4 entire sectors", titleReward: "Sector Commander" },
  perfect_3_worlds: { title: "Code Trinity", description: "Complete 3 sectors without using hints", titleReward: "Neo Architect" },
  all_perfect_worlds: { title: "Digital Nirvana", description: "Complete all available sectors without using hints", titleReward: "The Enlightened" },
};

export const LEVEL_TITLES_EN: Record<string, string> = {
  Curioso: "Curious",
  Aprendiz: "Apprentice",
  Estudante: "Student",
  Praticante: "Practitioner",
  Construtor: "Builder",
  Automatizador: "Automator",
  "Especialista Python": "Python Specialist",
  "Navegador Aurora": "Aurora Navigator",
  "Arquiteto de Scripts": "Script Architect",
  "Mestre Python": "Python Master",
};
