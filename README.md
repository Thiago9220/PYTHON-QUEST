# 🐍 PYTHON-QUEST: A Ascensão do Scriptweaver

**PYTHON-QUEST** é uma jornada épica de aprendizado inspirada no [SQL-QUEST](https://github.com/Thiago9220/SQL-QUEST). Transformamos o ensino de programação em uma aventura de RPG imersiva, onde você assume o papel de um **Tecedor de Scripts** (Scriptweaver) em uma missão para restaurar a consciência da Grande Serpente de Python e salvar o Arquipélago Aurora.

## 🌟 O Desafio do Arquipélago

Navegue pelas ilhas flutuantes, cada uma guardando um fragmento essencial da lógica universal:

1.  **Cais da Identidade**: Onde nomes e valores dão forma à realidade (Variáveis).
2.  **Encruzilhada do Destino**: Onde o fluxo da história é decidido pela lógica (Condições).
3.  **Pico da Eternidade**: Onde a repetição rítmica gera poder infinito (Loops).
4.  **Arvoredo dos Arcanos**: Onde rituais complexos são encapsulados em palavras mágicas (Funções).
5.  **Cripta das Coleções**: Onde tesouros e dados são organizados e protegidos (Listas).

## 🛠️ Estrutura do Projeto

O projeto segue a arquitetura robusta do SQL-QUEST:

-   **Frontend**: React + TypeScript + TailwindCSS.
-   **Motor de Execução**: Integração com Pyodide (Python via WebAssembly) para rodar código Python diretamente no navegador.
-   **Gamificação**: Sistema de XP, conquistas, diálogos com NPCs e trilha sonora imersiva.

## 🚀 Como começar

Este repositório foi inicializado com a estrutura base e o primeiro mundo: **A Vila das Variáveis**.

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

## 🤝 Créditos

Baseado no projeto original **SQL-QUEST** criado por [Thiago Ramos](https://github.com/Thiago9220).

---

*Que a serpente do conhecimento guie seu caminho!*
