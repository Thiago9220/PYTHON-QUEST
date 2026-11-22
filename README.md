# 🐍 PYTHON-QUEST: A Ascensão do Scriptweaver

**PYTHON-QUEST** é um RPG cyberpunk de programação inspirado no [SQL-QUEST](https://github.com/Thiago9220/SQL-QUEST). Você é um **Operador** (Scriptweaver) e escreve Python de verdade para invadir o Mainframe de uma cidade isolada pela própria inteligência artificial.

## 🌆 A história

- **Ato 1 — A Invasão** (8 setores de fundamentos de Python): guiado pelo módulo AI-7, você atravessa as defesas da CorpHQ até o Bunker de Exceções e descobre que o Core não é um servidor, e sim **AURORA**, a IA que governa a cidade.
- **Ato 2 — A Mente da Máquina** (8 setores de Ciência de Dados e IA): cada setor revela como AURORA foi construída, dos dados dos cidadãos até a mente generativa.
- **Final**: AURORA é o chefe do Oráculo Generativo. Ao vencê-la, o jogador escolhe entre **desligá-la** ou **retreiná-la**, e cada escolha tem epílogo próprio, seguido dos créditos.

O roteiro completo, com personagens, pistas e onde cada texto fica no código, está em [`docs/historia.md`](docs/historia.md).

## 🛠️ Estrutura do Projeto

O projeto segue a arquitetura robusta do SQL-QUEST:

-   **Frontend**: React + TypeScript + TailwindCSS.
-   **Motor de Execução**: Integração com Pyodide (Python via WebAssembly) para rodar código Python diretamente no navegador.
-   **Gamificação**: Sistema de XP, conquistas, diálogos com NPCs e trilha sonora imersiva.

## 🚀 Como começar

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Thiago9220/PYTHON-QUEST.git

# Entre na pasta do cliente
cd PYTHON-QUEST/client

# Instale as dependências
pnpm install

# Inicie o modo de desenvolvimento
pnpm dev
```

## 🔐 Login e Banco de Dados (Supabase)

O jogo usa **Supabase** para autenticação e persistência do progresso na nuvem.
Enquanto não houver credenciais o app roda em "modo offline" e exibe a tela de
login sem permitir entrar.

### 1. Crie um projeto Supabase

1. Acesse https://supabase.com e crie um projeto novo (free tier serve).
2. Anote a **Project URL** e a **anon public key** em *Project Settings → API*.

### 2. Rode o schema SQL

1. No painel do Supabase, vá em **SQL Editor**.
2. Abra o arquivo [`supabase/schema.sql`](supabase/schema.sql) deste repositório.
3. Cole todo o conteúdo no editor e clique em **Run**.

Isso cria as tabelas `profiles`, `challenge_progress`, `user_achievements` e
`user_purchases`, ativa Row Level Security em todas e instala um trigger que
gera o perfil automaticamente quando um usuário se registra.

Se o banco ja existia antes das correcoes de seguranca, rode tambem
[`supabase/security_hardening.sql`](supabase/security_hardening.sql). Esse
patch remove escrita direta de compras pelo cliente e adiciona restricoes de
sanidade para progresso.

### 3. (Opcional) Habilite provedores de autenticação

- Em **Authentication → Providers**, mantenha **Email** ligado.
- Para login com Google, habilite o provedor **Google** e configure o OAuth.

### 4. Configure o `.env`

```bash
cd client
cp .env.example .env
# Edite .env e preencha com sua URL e anon key do Supabase
```

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_TURNSTILE_SITE_KEY=
```

`VITE_TURNSTILE_SITE_KEY` e opcional. Quando preenchida, login, cadastro e
recuperacao de senha exigem Cloudflare Turnstile; quando vazia, o CAPTCHA fica
desabilitado para ambiente local/offline.

Reinicie o `pnpm dev` para que o Vite recarregue as variáveis.

### 5. Pronto

- Novos usuários se registram em `/` (tela inicial).
- O progresso é persistido nas tabelas do Supabase em tempo real.
- Tutoriais, tours e cutscenes já vistos não se repetem entre dispositivos.

## ✅ Validação dos desafios

Antes de gerar um build para a Steam, rode:

```bash
npm run test:challenges
```

O teste carrega o motor real do jogo ([`pythonEngine.ts`](client/src/lib/pythonEngine.ts))
com o Pyodide offline de `client/public/pyodide` e confere que:

- toda solução oficial passa no próprio `testCode` (nenhum desafio impossível e
  nenhuma resposta errada no Modo Estudo);
- as tentativas de [`tests/challenges/attempts.json`](tests/challenges/attempts.json)
  dão o resultado esperado (respostas erradas falham, alternativas corretas passam);
- nos mundos de Ciência de Dados, saída a mais é rejeitada;
- todo ato de todo chefe pode ser vencido com a solução de referência de
  [`tests/challenges/boss-solutions.ts`](tests/challenges/boss-solutions.ts). Ao criar
  ou mudar um chefe, atualize esse arquivo.

`npm test` roda essa suíte e os testes rápidos (como o do modo demo).

Ao escrever um `testCode`:

- Confira a **saída** (`output`), não só palavras no código. A variável `code` chega
  ao teste **sem comentários**, então `'while' in code` exige um `while` de verdade.
- Para exigir um recurso específico, prefira `ast` (`import ast as _ast`) a buscar texto.
- Calcule o valor esperado no próprio teste quando ele depender de pandas/numpy:
  o Pyodide é wasm32 (ex.: `astype(int)` vira `int32`).
- Adicione ao `attempts.json` pelo menos uma resposta errada que deve falhar.

## 🎵 Trilha sonora

Cada tela escolhe um clima de música (`menu`, `ato1`, `ato2`, `chefe`, `final`) em
[`App.tsx`](client/src/App.tsx). O jogo procura os arquivos abaixo e, se algum não
existir, toca um ambiente sintetizado do mesmo clima:

| Arquivo | Onde toca |
|---|---|
| `client/public/music/menu.mp3` | Menu principal, boas-vindas, mapa e perfil |
| `client/public/music/ato1.mp3` | Setores de Python (Ato 1) e simuladores |
| `client/public/music/ato2.mp3` | Setores de Ciência de Dados e IA (Ato 2) |
| `client/public/music/chefe.mp3` | Batalhas de chefe |
| `client/public/music/final.mp3` | Chefe final (AURORA) e créditos |

Use faixas instrumentais que fechem em loop e confira a licença de uso comercial.

## 🎮 Demo (Steam Next Fest)

```bash
npm run steam:demo
```

Gera a demo em `client/release/steam-demo/win-unpacked`, com os dois primeiros setores
(Terminal Alpha e Nó de Roteamento) e seus chefes. O restante aparece trancado como
"Jogo completo", e vencer o Sentinela Cerberus abre a tela de fim da demo. O save é o
mesmo do jogo completo, então o progresso continua após a compra.

Antes de enviar, preencha `VITE_STEAM_STORE_APPID` em
[`client/.env.demo`](client/.env.demo) com o App ID do jogo completo. É ele que faz o
botão "Adicionar à lista de desejos" abrir a página da loja. A demo é um app separado
no Steamworks, com App ID próprio.

## 🤝 Créditos

Baseado no projeto original **SQL-QUEST** criado por [Thiago Ramos](https://github.com/Thiago9220).

---

*Que a serpente do conhecimento guie seu caminho!*
