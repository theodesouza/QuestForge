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

## Catálogo (meta: ~348 peças, o triplo de 116)

| espaço | antes | meta |
|---|---|---|
| Núcleo | 23 | 60 |
| Anel | 25 | 55 |
| Campo | 14 | 40 |
| Ambiente | 17 | 41 |
| Satélite | 0 | 30 |
| Rastro | 0 | 25 |
| Gravidade | 0 | 18 |
| Ignição | 0 | 14 |
| Título | 37 | 62 |

Raridade = estrutura, não cor: comum (1–2 camadas, quase parado), incomum (+ um movimento), raro
(+ silhueta própria e partículas), épico (+ sistema secundário), lendário (+ comportamento único).

## Andamento

Ver as tarefas "Remake 1–9" no TASKS.md.
