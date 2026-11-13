# O Áster — remake visual e do sistema de personalização

Documento de desenho e de acompanhamento do remake. Vale como guia para continuar o trabalho e como
registro do que mudou.

## Conceito

O Astrolábio (disco de latão com régua e estrela) dá lugar ao **Áster**: um corpo celeste que nasce do
que o jogador aprende. O cartógrafo não carrega mais um instrumento — ele cultiva um astro.

- **Núcleo** é o corpo: uma esfera com volume (luz no alto à esquerda, borda escura, atmosfera) cuja
  superfície gira. Pode ser estrela, mundo, singularidade, nebulosa ou um cristal suspenso numa redoma
  (é assim que os núcleos antigos aparecem).
- Em volta dele há **profundidade de verdade**: discos e órbitas inclinados passam por trás e pela
  frente do núcleo.
- A estrutura **cresce com o jogador**, sem depender de peças:
  - nível → o corpo ganha massa (raio 30 → 38) e o cinturão de poeira fica mais denso;
  - patente (a cada 5 níveis) → um traço novo: halo de lente, cinturão, luas de patente, arcos de
    maré, jatos polares, coroa de estrelas, anel do zênite;
  - chefões vencidos → estrelas acesas na coroa (uma por chefão).
- O Áster **reage**: toque dispara a ignição; XP ganho faz o corpo pulsar.

## Espaços de equipamento

| id (dados) | nome na tela | antes | o que é |
|---|---|---|---|
| `core` | Núcleo | Núcleo | o corpo |
| `frame` | Anel | Moldura | anéis de contenção (de frente) e discos em órbita (inclinados) |
| `aura` | Campo | Aura | energia ao redor |
| `scene` | Ambiente | Cenário | o céu atrás |
| `title` | Título | Título | texto |
| `orbiter` | Satélite | — | corpos que giram em torno (luas, sondas, criaturas) |
| `trail` | Rastro | — | matéria em movimento (poeira, jatos, espirais) |
| `lens` | Gravidade | — | como ele dobra o espaço (lentes, malhas, ondas) |
| `ignition` | Ignição | — | como ele se acende ao aparecer e ao trocar de peça |

Os ids dos espaços antigos **não mudam** (os dados gravados continuam valendo); só o rótulo muda.

## Preservação da progressão (regra dura)

- Nenhuma peça antiga muda de id, espaço, raridade ou origem. Prova: `src/content/__tests__/fixtures/catalog-v1.json`
  (fotografia das 116 peças) + `src/domain/__tests__/aster-preservation.test.ts`.
- `Equipped` só ganha chaves (nulas por padrão). `normalizeProfile` preenche e saneia.
- Nada é migrado no SQLite: perfil (JSON), `inventory`, `reward_ledger` ficam como estão.
- Primeira abertura grava `sync_kv['backup:pre-aster']` com o estado inteiro (`src/state/backup.ts`).
- Nuvem: `SNAPSHOT_SCHEMA = 3`. App antigo recusa sincronizar (pede atualização) em vez de ler peça desconhecida.
- **Reversão segura**: publicar o commit `d243889` (app antigo + tolerância a peça desconhecida + schema 3),
  NUNCA republicar um grupo anterior a ele — o app antigo fecharia ao encontrar uma peça nova equipada.
- Peças de nível acrescentadas a níveis já alcançados são entregues retroativamente (o registro `level:N`
  não paga de novo sozinho). Feitos novos também valem para trás.

## Motor (src/ui/vfx)

- `engine.tsx`: camadas (Layer/Spin/Breathe/Wave/Glimmer/Sway) e partículas. Novos modos: `spiral`,
  `helix`, `lemniscate`, `fountain`, `streak`; `half` (metade de trás/da frente da órbita); `clock`
  (uma passada, para ignições).
- `space.tsx`: `Orb` (esfera com superfície deslizando), `Plane` (plano inclinado com recorte de metade),
  `Orbiter` (desenho em órbita com profundidade), `ActLayer` (camada movida por relógio de uma passada).
- Regra de worklet: só números e funções com `'worklet'`. O teste de auditoria barra o resto.
- Passadas de desenho do Áster: gravidade → campo (trás) → [anel, satélites, rastro: metade de trás] →
  núcleo → [metade da frente] → campo (frente) → sinergia → coroa → ignição.
- Peças com profundidade exportam `Back` e `Front` (como as auras antigas).

## Catálogo (350 peças: o triplo das 116 de antes, e mais duas)

| espaço | antes | novas | hoje | onde está o desenho |
|---|---|---|---|---|
| Núcleo | 23 | 38 | 61 | `bodies2.tsx` (as antigas: `cores*.tsx`, dentro do corpo de cristal) |
| Anel | 25 | 31 | 56 | `rings2.tsx` (as antigas: `frames.tsx`, como anel de contenção) |
| Campo | 14 | 26 | 40 | `fields.tsx` (as antigas: `auras*.tsx`) |
| Ambiente | 17 | 26 | 43 | `skies.tsx` (os antigos: `scenes.tsx`; peças comuns em `scenekit.tsx`) |
| Satélite | 0 | 30 | 30 | `orbiters.tsx` |
| Rastro | 0 | 25 | 25 | `trails.tsx` |
| Gravidade | 0 | 18 | 18 | `lenses.tsx` |
| Ignição | 0 | 14 | 14 | `ignitions.tsx` |
| Título | 37 | 26 | 63 | só texto e cor |

Raridade = estrutura, não cor: comum (1–2 camadas, quase parado), incomum (+ um movimento), raro
(+ silhueta própria e partículas), épico (+ sistema secundário), lendário (+ comportamento único).
`src/content/__tests__/aster-catalog.test.ts` cobra: tamanho ≥ 3 × 116, toda ficha com desenho,
nenhum desenho órfão ou repetido, nomes e descrições únicos, todas as raridades em todo espaço.

### Ficha de uma peça nova

`src/content/aster/<espaço>.ts`, uma linha por peça:
`piece(espaço, id, nome, raridade, fx, [cor, cor2], descrição, origem)`. A origem é um dado:
`shop(preço)` (só comuns e incomuns), `level(n)` ou `feat(id)`. O texto "como conseguir", o preço,
a tabela de níveis e os feitos saem dela — não há segunda lista para manter em dia.
Elemento dos núcleos e campos (Ressonância): `src/content/aster/elements.ts`.
As molduras antigas passaram a se chamar "Anel …" (mesmos ids).

## Origem e entrega das peças

- **Níveis**: `LEVEL_ITEM_TABLE` (`domain/progression/rewards.ts`) junta a tabela antiga com as fichas
  `level(n)`. Hoje todo nível de 2 a 50 dá ao menos uma peça.
- **Feitos**: 80 feitos novos (`FEAT_TEXT` em `content/aster/source.ts`). A regra de cada um é lida do
  id (`answers:500`, `region:<id>`, `collect:150`…) em `domain/game/feats.ts`; um id sem regra
  quebra na carga. Conferidos ao fim de sessão, vitória de chefão, compra na Oficina e domínio de
  etapa na Academia. `grantFeats` repete até não sobrar nada (feito de coleção pode se cumprir com
  as peças que outro acabou de dar).
- **Remessa retroativa** (`domain/game/catalog.ts → deliverCatalog`, chamada em `touch`, ao abrir o
  app): toda peça de nível já alcançado e de feito já cumprido entra na coleção de uma vez. Não
  equipa nada (quem já joga escolheu o que veste, inclusive deixar um espaço vazio) e emite um
  único evento `shipment` em vez de um `item` por peça. Idempotente.
  Prova: `src/domain/__tests__/aster-delivery.test.ts`.
- **Daqui para a frente**: peça ganha jogando tem cerimônia própria e veste sozinha o espaço se ele
  estiver vazio (regra de sempre). Mais de três numa mesma ação viram remessa (`state/store.ts`).

## Telas

- **Estúdio** (`src/app/studio.tsx`, rota `/studio?slot=`): Áster vivo no topo, trilho dos nove
  espaços, grade por raridade (lista virtualizada), filtros (tudo, minhas, à venda, a conquistar).
  Tocar numa peça a veste como prévia — inclusive bloqueada; nada muda até "Equipar". A barra de
  baixo mostra raridade, elemento, descrição, como conseguir e a ação (equipar, remover, forjar).
- **Aba Áster** (`(tabs)/hero.tsx`): o Áster, o que a patente já deu e o que vem a seguir, coroa de
  chefões, as nove peças em uso (cada uma abre o Estúdio no seu espaço), coleção por raridade.
- **Miniaturas** (`ui/ItemGlyph.tsx`): o desenho real de cada peça nova, parado, em volta de um
  corpo neutro. Ignições usam um quadro fixo (`FxConfig.poster`).
- **Remessa / renascimento** (`features/celebration/ShipmentOverlay.tsx`): na primeira abertura
  depois do remake (novidade `news:aster`), a tela "O Astrolábio despertou" apresenta o Áster, lista
  o que continua igual e mostra as peças entregues. Quem instala agora não a vê. Uma tela de cada
  vez: subida de nível → boas-vindas → revelações de peça → remessa.
- **Fundo** (`ui/MapBackdrop.tsx`): espaço profundo em todas as telas.

## Validação

- `npx jest` — inclui preservação (`aster-preservation`), entrega (`aster-delivery`), catálogo
  (`aster-catalog`), interface da remessa (`state/__tests__/shipments`) e a auditoria de worklets
  (`src/__tests__/worklets.test.ts`: compila cada arquivo como o Metro e reprova função comum
  chamada dentro de worklet — o erro que fechava o app em laço em 30/10).
- Laboratório visual (build com `EXPO_PUBLIC_QA=1`): `/vfx-lab?grid=evo`, `grid=slot:<espaço>`
  (`&from=&to=&size=&level=`), `grid=scenes`, `grid=synergy`.
- `node scripts/e2e-web.js <pasta>`: o jogo inteiro no navegador, incluindo o Estúdio.

## Andamento

Ver a seção "Remake do Áster" no TASKS.md.
