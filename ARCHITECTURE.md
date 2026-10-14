# QuestForge — Arquitetura

## Stack e justificativas

| Escolha | Por quê |
| --- | --- |
| **Expo SDK 57 + React Native 0.86 + TypeScript (strict)** | App nativo real (Android/iOS) com build gerenciado (EAS) e sem manter pastas nativas à mão (CNG). |
| **Expo Router** (`src/app/`) | Rotas por arquivo, deep links e tipagem. Barra de abas customizada para identidade visual própria. |
| **expo-sqlite** | Persistência local transacional, offline, com migrações versionadas (`PRAGMA user_version`). |
| **Zustand** | Store mínima e tipada para o *snapshot* do jogo; sem boilerplate, seletores evitam re-render. |
| **Reanimated 4 + react-native-svg** | Animações na UI thread (fluidas em aparelhos intermediários) e arte vetorial (astrolábio, chefões, ícones, gráficos) sem imagens pesadas. |
| **expo-haptics** | Feedback tátil, desativável. |
| **Bricolage Grotesque + Inter** (`@expo-google-fonts`) | Fontes empacotadas no app (offline). |
| **Jest (jest-expo)** | Testes do domínio puro, do validador de conteúdo e da persistência real em SQLite (via `node:sqlite` nos testes). |

Sem conta, sem backend e sem telemetria na v1.

## Camadas

```
src/
├── app/            Rotas (telas finas). Só compõem features; nenhuma regra de jogo aqui.
├── ui/             Design system: tokens, tipografia, ícones SVG, componentes base, Astrolábio.
├── features/       Composição de telas por funcionalidade (session, boss, home, hero, atlas…).
├── state/          Store Zustand + "actions" que orquestram domínio → persistência → store.
├── domain/         TypeScript PURO (sem React/RN). Regras do jogo e do aprendizado.
│   ├── progression/  XP, níveis, patentes, recompensas por nível, descanso do viajante
│   ├── learning/     repetição espaçada, domínio, seleção adaptativa de questões
│   ├── boss/         motor de batalha determinístico
│   ├── campaign/     regiões, nós, desbloqueios
│   ├── session/      planejamento e estado de sessões (expedições)
│   └── game/         GameState + reducer `applyAnswer`/`completeSession`/... → (estado, eventos, delta)
├── content/        Conteúdo educacional versionado (questões, assuntos, regiões, chefões, itens)
│   └── validation/   validador estrutural + matemático (roda nos testes e em `npm run validate:content`)
└── data/           Persistência
    ├── sql/          driver SQL mínimo (interface) + implementação expo-sqlite
    ├── migrations.ts migrações versionadas
    └── repository/   GameRepository: SqlGameRepository e MemoryGameRepository (web/preview/testes)
```

Regra de dependência: `app → features → (ui, state) → domain ← data`; `domain` não importa nada
de fora de `domain` e `content`. Isso permite testar todas as regras em Node puro.

## Fluxo de uma resposta (núcleo do app)

```
UI (toque "Confirmar")
  → state/actions.answerQuestion(input)
      → domain/game.applyAnswer(snapshot, input, now)   // puro, determinístico
          ← { state', events[], delta }                  // events: xp, levelUp, reward, eco, redenção…
      → repository.commit(delta)                          // UMA transação SQLite
      → store.set(state')                                 // só depois do commit
  → UI anima os events (XP voando, level up, recompensa)
```

- **Atomicidade**: tentativa, estado da questão, XP/moedas, recompensas e progresso de
  sessão são gravados na mesma transação. Falha ⇒ rollback e nada muda na tela.
- **Serialização**: as actions passam por uma fila (`serialQueue`) — toques duplos não
  geram duas tentativas; o reducer também rejeita IDs de tentativa repetidos.
- **Idempotência de recompensas**: tabela `reward_ledger` com chave primária
  (`level:7`, `boss:golem:first`, `mission:r1-m1:first`). `INSERT OR IGNORE` + checagem no reducer.
- **Sessões retomáveis**: o estado da sessão ativa é gravado a cada resposta
  (`active_session`). Fechar o app no meio não perde nada; o Acampamento oferece "Retomar".

## Banco local (v1)

| Tabela | Conteúdo |
| --- | --- |
| `profile` (1 linha) | nome, objetivo, preferências, XP total, Tinta, descanso acumulado, cosméticos equipados, datas |
| `attempts` | log imutável de respostas: questão, escolha, acerto, confiança, dicas, tempo, XP, modo, sessão |
| `question_state` | repetição espaçada por questão: caixa Leitner, vencimento, contadores, último XP |
| `reward_ledger` | recompensas concedidas (chave única) |
| `inventory` | itens possuídos + origem |
| `campaign_progress` | nós concluídos (missões) com melhor resultado |
| `boss_progress` | tentativas, vitórias, melhor desempenho por chefão |
| `active_session` | sessão em andamento serializada (retomada) |

Migrações em `src/data/migrations.ts`: lista ordenada; cada uma roda numa transação e
incrementa `PRAGMA user_version`. Nunca editar uma migração publicada — sempre criar outra.

**Preparação para nuvem**: todas as entidades usam IDs estáveis (texto) e carimbos de tempo
em milissegundos desde a época (UTC); `attempts` é *append-only* (fácil de sincronizar por log). Um futuro `SyncService`
pode enviar o log e reconciliar o perfil sem mudar o domínio.

## Conteúdo

- Questões em TypeScript tipado (`src/content/questions/<assunto>.ts`), uma constante por
  lote. IDs estáveis no formato `<ASSUNTO>-<NNN>` (ex.: `PCT-004`). Nunca reutilizar IDs.
- Cada questão traz: enunciado em blocos (parágrafo, tabela, gráfico de barras, fórmula,
  figura SVG), 5 alternativas, gabarito, dicas graduais, resolução passo a passo, conceito,
  assunto/subassunto, dificuldade 1–4, habilidades da Matriz de Referência do ENEM (H1–H30),
  tempo estimado, fonte (`autoral` ou `enem` com ano) e — quando numérica — uma função
  `verify()` que **recalcula a resposta** a partir dos dados do enunciado.
- O validador (`src/content/validation`) garante: IDs únicos e bem formados, 5 alternativas
  distintas, gabarito válido, campos obrigatórios, habilidades válidas, e que o valor de
  `verify()` coincide com a alternativa correta **e com nenhuma outra**.
- Questões oficiais só entram com fonte/ano e verificação de direitos; as da v1 são
  **autorais**, inspiradas nas competências do ENEM, e assim identificadas na interface.

## Web

A build web existe só para pré-visualização e capturas de tela de design. Nela, o
repositório é o `MemoryGameRepository` (arquivo `.web.ts`), porque o foco do produto é nativo.
Com `EXPO_PUBLIC_QA=1`, o app expõe `globalThis.__qf` (somente leitura do estado) para o teste
ponta a ponta `scripts/e2e-web.js`; builds normais não incluem esse gancho ativo.

## Decisões registradas

- **Reducer puro + Delta**: cada operação devolve o estado novo, os eventos para a interface e as
  chaves alteradas. Testável sem React, sem banco, e gravável numa transação só.
- **Sem `Date.now()` durante a renderização**: o "agora" das telas vem do store (`now`), atualizado
  a cada publicação de estado — compatível com as regras de pureza do React Compiler.
- **Reanimated com `.set()`** em valores compartilhados fora de worklets (compatível com o compilador).
- **Fontes empacotadas por peso** (`@expo-google-fonts/<família>/<peso>`) para não embutir pesos não usados.

## Qualidade

- `npm run typecheck` — TypeScript estrito.
- `npm test` — domínio (XP, níveis, recompensas, anti-exploração, revisão espaçada, batalha,
  desbloqueios), validador de conteúdo e persistência real (migrações, commit, recarga,
  idempotência) usando `node:sqlite`.
- `npm run lint` — ESLint (config Expo).
- `npx expo export --platform android` — garante que o bundle nativo compila.
