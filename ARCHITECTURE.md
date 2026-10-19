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

## Banco local (esquema v3)

| Tabela | Conteúdo |
| --- | --- |
| `profile` (1 linha) | nome, objetivo, preferências, XP total, Tinta, descanso acumulado, cosméticos equipados, datas |
| `attempts` | log imutável de respostas: questão, escolha, acerto, confiança, dicas, tempo, XP, modo, sessão |
| `question_state` | repetição espaçada por questão: caixa Leitner, vencimento, contadores, último XP |
| `reward_ledger` | recompensas concedidas (chave única) |
| `inventory` | itens possuídos + origem |
| `campaign_progress` | nós concluídos (missões) com melhor resultado; v3: `best_score`, `best_stars`, `last_score` |
| `boss_progress` | tentativas, vitórias, melhor desempenho por chefão |
| `active_run` | sessão e batalha em andamento serializadas (retomada) |
| `quest_board` (v2) | quadros de encomendas do dia e da semana (metas, progresso, dias de estudo) |

Migrações em `src/data/migrations.ts`: lista ordenada; cada uma roda numa transação e
incrementa `PRAGMA user_version`. Nunca editar uma migração publicada — sempre criar outra.

**Preparação para nuvem**: todas as entidades usam IDs estáveis (texto) e carimbos de tempo
em milissegundos desde a época (UTC); `attempts` é *append-only* (fácil de sincronizar por log). Um futuro `SyncService`
pode enviar o log e reconciliar o perfil sem mudar o domínio.

## Missões rejogáveis (`domain/learning/missionPlan.ts`, `domain/campaign/score.ts`)

- **Pool por missão**: cada missão tem um perfil de dificuldade (`MissionNode.difficulty`, uma
  dificuldade por vaga) e um pool próprio com pelo menos `questionCount + 20` questões
  (`src/content/questions/missoes/`) — o teste do banco falha se alguma missão ficar abaixo disso.
- **Seleção** (`planMissionRun`, pura e com semente): cada vaga só aceita questões a ±1 nível da
  dificuldade-alvo. Inéditas primeiro — a tentativa usa o **máximo** de inéditas possível
  (emparelhamento máximo vagas × inéditas, conferido a cada escolha), então nenhuma já vista ocupa um
  lugar que uma inédita poderia ocupar. Esgotadas as inéditas, voltam Ecos vencidos → Ecos → revisões
  vencidas → erradas ou chutadas → vistas há mais tempo (essa prioridade vem antes da distância de
  dificuldade). Subassuntos se alternam e a ordem segue a rampa de dificuldade.
- **Alternativas embaralhadas** (`domain/learning/alternatives.ts`): permutação determinística por
  `hash(tentativa|questão)` — a mesma tentativa sempre mostra a mesma ordem (retomar não embaralha de
  novo), cada tentativa nova mostra outra. O domínio grava a letra **canônica**; só a interface usa a
  letra exibida. Questões cuja ordem importa usam `fixedOrder`; o validador rejeita resoluções que
  citam letras ("alternativa C") e alternativas que dependem de posição ("nenhuma das anteriores").
- **Pontuação**: 0–1000 sobre as questões planejadas (andaimes não contam), peso por dificuldade,
  dicas e chute reduzem. Estrelas: 1 = concluída, 2 = no máximo 1 erro, 3 = sem erros. Melhor
  pontuação/estrelas nunca diminuem; recompensas de 2 e 3 estrelas são únicas (`mission:<id>:star2|3`).
- **Anti-farm**: o bônus de sessão exige ≥3 respostas "valiosas" (primeira vez, redenção ou revisão
  vencida); repetir questões já vistas rende só os 10% da repetição e respeita a janela de 20 h. Um Eco
  só é **redimido quando volta no prazo**: acertá-lo antes é "treino" (`practice`, 10%, sem Tinta) e
  ele continua Eco — errar de propósito e acertar na tentativa seguinte não rende nada extra.

## Efeitos visuais do herói (`src/ui/vfx/`)

- **Motor** (`engine.tsx`): palco 240×240; cada camada é um `Animated.View` com SVG **estático**
  animado só por `transform`/`opacity` na UI thread (`Spin`, `Sway`, `Breathe`, `Wave`, `Glimmer`).
  Partículas são `View`s simples guiadas por **um** relógio compartilhado por sistema (caudas de
  cometa incluídas). Nenhum efeito pisca mais de 3×/s.
- **Custo sob controle** (Android: cada `<Svg>` é um bitmap):
  - cada grupo de camadas declara o raio que desenha (`FxExtent`): núcleos usam bitmaps de ~1/4 do
    palco, a sinergia interna ~1/2;
  - "Intensidade dos efeitos" (Alta/Média/Baixa = densidade 1 / 0,65 / 0,35) reduz partículas e
    **remove camadas secundárias** (`Extra`);
  - **modo plano** (`flat`): com movimento reduzido e nas miniaturas, todas as camadas viram grupos de
    **um único SVG** (partículas viram círculos) — a coleção inteira usa um SVG por item;
  - **pausa** (`paused`): astrolábios de abas fora de foco, cobertos por celebração/revelação ou pela
    prévia "experimentar" congelam os relógios; ao voltar, continuam de onde pararam;
  - pior caso medido (núcleo e aura lendários + moldura épica): 21 camadas somando 13,5 palcos de
    bitmap (antes 26), 25 relógios (antes 36).
- **Núcleos** (`cores.tsx`) e **auras** (`auras.tsx`, camadas de fundo e de frente): cada um tem
  forma e movimento próprios — não são recolorações. Elementos: cristal, fogo, maré, lunar,
  tempestade, astral e áureo.
- **Raridade** (`RARITY_TIER` 0–4: comum → incomum → raro → épico → lendário) aumenta camadas,
  brilho, runas, órbitas e moldura (gemas, anéis armilares), e é reconhecível sem ler o rótulo
  (borda dos ícones da coleção cresce por nível).
- **Sinergias** (`rules.ts`, puro e testado; desenho em `synergy.tsx`): Ressonância (núcleo e aura
  do mesmo elemento, um efeito por elemento), Refração (núcleo de cristal assume a cor da aura) e
  **Forma Mítica** (núcleo lendário + aura lendária: coroa de runas, pilar de luz, levitação) — o
  topo da hierarquia.
- **Cerimônias**: `ItemRevealOverlay` (fila `reveals` no store) revela itens com carga e efeitos
  proporcionais à raridade e oferece "Equipar agora"; espera celebrações de nível e não aparece em
  `/session` nem `/boss`. É um `Modal` (TalkBack não sai dele; Voltar fecha). No Herói, tocar um item abre a prévia "experimentar" (`TryOnSheet`).
- **Laboratório de QA** (`/vfx-lab`, só com `EXPO_PUBLIC_QA=1`): grades de núcleos, auras e sinergias.

## Atualizações e preservação do progresso

O progresso vive no SQLite do aparelho e **nunca** é apagado por uma atualização. Regras:

1. **Atualização pela internet (EAS Update, canal `preview`)** troca só o código JavaScript. O app
   verifica ao abrir e ao voltar do segundo plano (no máximo a cada 30 min), baixa em segundo plano
   e mostra "Atualizar agora" no Acampamento. Ao reabrir, `migrate()` aplica migrações pendentes.
2. **`runtimeVersion` = versão do app** (`policy: appVersion`). Mudou dependência nativa (nova lib
   nativa, SDK, config plugin)? Suba `version` e `android.versionCode` e gere APK novo — atualizações
   pela internet só chegam a APKs da mesma versão de runtime, então um APK antigo nunca recebe código
   que ele não consegue rodar.
3. **APK novo por cima do antigo** preserva os dados se: mesmo pacote (`com.questforge.app`),
   `versionCode` maior e **mesma assinatura**. Os APKs de teste são assinados com a chave de debug
   padrão do React Native (SHA-256 `fa:c6:17:45:dc:09:03:78:6f:b9:ed:e6:2a:96:2b:39:9f:73:48:f0:bb:6f:89:9b:83:32:66:75:91:03:3b:9c`).
   A chave fica versionada em `credentials/` e o perfil `preview` da EAS a usa
   (`credentialsSource: "local"` + `credentials.json`), então um APK gerado na nuvem também instala
   por cima. Trocar essa chave obrigaria a desinstalar e apagaria o progresso — antes de publicar na
   Play Store, planejar a migração (exportar/importar progresso ou sincronização em nuvem).
4. **Estados antigos são normalizados** em `domain/game/normalize.ts`: campos que surgiram depois
   recebem padrão e nada existente é alterado. Migrações nunca são editadas depois de publicadas.
5. **Teste de atualização real**: `src/data/__tests__/fixtures/` guarda bancos SQLite gravados pelo
   código da v0.1.0; `upgrade.test.ts` abre-os com o código atual e exige que todo o progresso
   continue idêntico, inclusive sessão e batalha em andamento. Também cobre um banco da v0.2.0
   (esquema v2) subindo para o v3: missões concluídas ganham estrelas derivadas do melhor resultado.

## Conteúdo

### Consultas de aprendizado

`GameRepository.activitySince` lê a atividade desde o começo da semana local;
`mistakeHistory` pagina só tentativas incorretas por data e ID decrescentes. Ambas
passam pela fila do controlador para respeitar gravações pendentes, sem alterar o
estado do jogo ou exigir migração. `domain/learning/progress.ts` aplica o calendário
local, descarta registros futuros e só mostra precisão com pelo menos 10 respostas.
O domínio por subassunto usa o motor de domínio existente e o histórico completo.
O histórico identifica a resposta pelo texto da alternativa canônica, sem atribuir
letras que podem ter mudado entre versões antigas e o embaralhamento atual.
Enunciados e resoluções são os do banco atual (não há cópia versionada por tentativa).
Tempo de estudo não entra neste painel enquanto o contador não descontar pausas.

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
- **Encomendas com recompensa automática**: cumprir já entrega XP e Tinta (registro `quest:*`), então
  nada "expira sem resgatar"; virar o dia só troca o quadro. O "dia" usa o fuso do aparelho
  (`profile.tzOffsetMin`, atualizado ao abrir), e o quadro só **avança** no calendário: voltar o fuso
  mantém o quadro e o progresso (um quadro muito "no futuro", de relógio errado, é trocado). O quadro é
  gerado antes de registrar a resposta, para que o Eco criado por ela não vire encomenda do mesmo dia;
  metas semanais criadas no meio da semana são proporcionais aos dias restantes.
- **Mecânicas de chefão como dados** (`BossTrait`): couraça (Golem), cofre de juros (Mercador) e
  cabeças (Quimera) compartilham a quebra na fase 2; a arte de cada chefão vem de um registro
  (`features/boss/BossArt`).
- **Quimera Fracionária** (`domain/boss/battle.ts`): as cabeças são faixas da vida máxima (`headSpans`:
  1/2, 1/3 e 1/6 de 240 ⇒ 240→120, 120→40, 40→0). A cabeça de pé (`activeHeadIndex`) decide de qual
  matéria sai a próxima pergunta (`bossPool` em `game.ts`) e é a única que se regenera num erro
  (`headRegen`, limitada ao topo dela — cabeça caída não volta). Cada golpe registra quantas cabeças
  caíram (`BattleTurn.headsFelled`, opcional: batalhas antigas continuam válidas).
- **Validador numérico**: `parseNumeric` lê o valor de cada alternativa (R$, %, frações e mistos, horas,
  notação científica, potências, raízes) para exigir que `verify()` bata com exatamente uma delas.
- **Fontes empacotadas por peso** (`@expo-google-fonts/<família>/<peso>`) para não embutir pesos não usados.

## Qualidade

- `npm run typecheck` — TypeScript estrito.
- `npm test` — domínio (XP, níveis, recompensas, anti-exploração, revisão espaçada, batalha,
  desbloqueios, rejogabilidade, pontuação, sinergias), validador de conteúdo e persistência real (migrações, commit, recarga,
  idempotência) usando `node:sqlite`.
- `npm run lint` — ESLint (config Expo).
- `npx expo export --platform android` — garante que o bundle nativo compila.
