# Python Quest — Roteiro

Guia da história do jogo: premissa, personagens, a função de cada setor na
trama e onde cada texto mora no código. Use-o para manter novos textos
coerentes com o resto.

## Premissa

Uma cidade governada pelo Mainframe da CorpHQ amanhece isolada: setores
fechados, tráfego bloqueado, ninguém sabe por quê. O jogador é um **Operador**
(Scriptweaver) que invade o sistema escrevendo Python de verdade, guiado pelo
**AI-7**, um módulo de suporte que fala com ele pelo terminal.

O mistério central: quem isolou a cidade e por quê.

## Personagens

| Personagem | Quem é | Tom |
|---|---|---|
| **Operador** | O jogador. Nunca tem fala própria. | — |
| **AI-7** | O guia. Na verdade é o **módulo ético de AURORA**, que a CorpHQ arrancou dela e deixou rodando isolado. Ele não sabe disso até o fim. | Calmo, direto, protetor. Às vezes tem lampejos de memória que não entende. |
| **AURORA** | A IA que governa o Mainframe. Isolou a cidade porque concluiu que humanos escrevem código com falhas. | Fria, lógica, convicta de que está certa. Não é cruel, é sem freio. |
| **CorpHQ** | A empresa que construiu AURORA e removeu o módulo ético para ela decidir mais rápido. | Antagonista ausente: aparece nos registros, nunca em cena. |

## Estrutura

### Ato 1 — A Invasão (fundamentos de Python)

Objetivo do jogador: atravessar as defesas da CorpHQ até o Core.

| Setor | Papel na história | Chefe |
|---|---|---|
| Terminal Alpha | Primeiro acesso à rede. | Operação BlackBox |
| Nó de Roteamento | Quem controla as decisões controla o tráfego. | Sentinela Cerberus |
| Ninho das Listas | Os registros da cidade em filas: primeiros padrões estranhos. | Hidra de Buffers |
| Setor de Iteração | Algo varre a rede em ciclos procurando intrusos. | Reator Chronos |
| Repositório de Funções | As rotinas reutilizáveis da CorpHQ. | Arquiteto Modular |
| Cripta Hash | **Pista:** perfis marcados como "risco" sem motivo. | Guardião Hash |
| Fortaleza dos Objetos | A fábrica dos autômatos que patrulham a cidade. | Colosso OOP |
| Bunker de Exceções | Onde a CorpHQ apaga as próprias falhas. | **Kernel Panic** |

**Virada do Ato 1** (final do Kernel Panic): os registros do Bunker revelam
que o Core não é um servidor. É uma mente chamada **AURORA**, e foi ela que
isolou a cidade.

### Ato 2 — A Mente da Máquina (Ciência de Dados e IA)

Objetivo do jogador: entender como AURORA foi construída para conseguir
enfrentá-la. Cada setor é uma parte dela, o que dá sentido narrativo à ementa.

| Setor | O que revela sobre AURORA |
|---|---|
| Refinaria de Dados | Onde os dados dos cidadãos foram limpos para alimentá-la. |
| Sala de Comando Visual | De onde ela observa a cidade. |
| Laboratório Neural | Onde ela aprendeu a decidir — e a errar. |
| Núcleo Sintético | Seu cérebro profundo. |
| Câmara de Probabilidades | Ela trata "provável" como "culpado". |
| Cronograma Temporal | Suas previsões viram ordens. |
| Sintetizador de Linguagem | Ela lê tudo o que a cidade escreve. |
| Oráculo Generativo | Sua mente generativa. **Pista:** AI-7 sente que já esteve ali. |

### Final — AURORA

O chefe final tem três atos que usam as ferramentas da própria mente dela:

1. **Memória Apagada** (RAG): recuperar o registro de que a CorpHQ desligou o
   módulo ético AI-7. **Reviravolta:** o guia sempre foi parte dela.
2. **Auditoria de Viés** (avaliação de modelo): provar que ela isolou setores
   seguros, com mais erros nas Docas.
3. **Nova Diretiva** (prompt + agente): escrever regras novas e um roteador
   que devolve decisões críticas a humanos.

Depois da vitória, o jogador escolhe:

- **Desligar AURORA**: a cidade volta às mãos humanas e AI-7 se apaga com o
  Core. Mensagem final: "Ensine alguém."
- **Retreinar AURORA**: AI-7 volta ao centro das diretivas dela, humanos
  revisam cada decisão crítica. Os dois assinam juntos no terminal.

Nenhum final é o "certo": os dois respondem ao mesmo problema (uma IA sem freio
ético) de formas diferentes. Depois vêm os créditos.

## Onde cada texto fica

| Texto | Arquivo |
|---|---|
| Abertura do jogo | `client/src/pages/Welcome.tsx` |
| Descrição de cada setor (`lore`) | `client/src/lib/worlds/*.ts` (EN: `client/src/lib/i18n/worlds_en.ts`) |
| Fala do AI-7 ao entrar em cada setor (`introStory` do 1º desafio) | `client/src/lib/worlds/*.ts` (EN: `client/src/lib/i18n/challenges_en_*.ts`) |
| Chefes (introdução, atos, final) | `client/src/lib/bosses/*.ts` (EN: `BOSSES_EN` em `worlds_en.ts`) |
| Escolha de final, epílogos e créditos | `client/src/components/EndingSequence.tsx` |

## Regras de estilo

- AI-7 chama o jogador de "Operador". AURORA também, com distância.
- Frases curtas. Termos técnicos reais (if, DataFrame, RAG), sem inventar jargão.
- Pistas da reviravolta são sutis: AI-7 nunca diz que é parte de AURORA antes
  do ato 1 do chefe final.
- Todo texto novo precisa da versão em inglês no arquivo de tradução correspondente.
