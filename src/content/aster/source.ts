/**
 * De onde vem cada peça nova do Áster. A ficha da peça diz a origem (`get`) e o texto "como
 * conseguir" sai daqui — assim catálogo, tabela de níveis, feitos e Oficina nunca se contradizem.
 *
 *  shop(preço)   Oficina (só comuns e incomuns)
 *  level(n)      ao alcançar o nível n (quem já passou do nível recebe na hora)
 *  feat(id)      um feito de `FEAT_TEXT` (vale para trás: quem já cumpriu, recebe)
 */
import type { FxElement, ItemDef, ItemSlot, ItemVisual, Rarity } from '../items';

export type Get = { by: 'shop'; price: number } | { by: 'level'; level: number } | { by: 'feat'; feat: FeatId };

export const shop = (price: number): Get => ({ by: 'shop', price });
export const level = (n: number): Get => ({ by: 'level', level: n });
export const feat = (id: FeatId): Get => ({ by: 'feat', feat: id });

/** Feitos novos: `label` aparece na revelação da peça; `how` é o "como conseguir". */
export const FEAT_TEXT = {
  'answers:50': { label: 'Feito: 50 questões respondidas', how: 'Responda 50 questões.' },
  'answers:150': { label: 'Feito: 150 questões respondidas', how: 'Responda 150 questões.' },
  'answers:300': { label: 'Feito: 300 questões respondidas', how: 'Responda 300 questões.' },
  'answers:500': { label: 'Feito: 500 questões respondidas', how: 'Responda 500 questões.' },
  'answers:750': { label: 'Feito: 750 questões respondidas', how: 'Responda 750 questões.' },
  'answers:1500': { label: 'Feito: 1500 questões respondidas', how: 'Responda 1500 questões.' },
  'answers:2500': { label: 'Feito: 2500 questões respondidas', how: 'Responda 2500 questões.' },
  'answers:4000': { label: 'Feito: 4000 questões respondidas', how: 'Responda 4000 questões.' },
  'correct:100': { label: 'Feito: 100 acertos', how: 'Acerte 100 questões.' },
  'correct:400': { label: 'Feito: 400 acertos', how: 'Acerte 400 questões.' },
  'correct:1000': { label: 'Feito: 1000 acertos', how: 'Acerte 1000 questões.' },
  'correct:2000': { label: 'Feito: 2000 acertos', how: 'Acerte 2000 questões.' },
  'time:1h': { label: 'Feito: 1 hora de estudo', how: 'Estude por 1 hora no total.' },
  'time:5h': { label: 'Feito: 5 horas de estudo', how: 'Estude por 5 horas no total.' },
  'time:12h': { label: 'Feito: 12 horas de estudo', how: 'Estude por 12 horas no total.' },
  'time:24h': { label: 'Feito: um dia inteiro de estudo', how: 'Estude por 24 horas no total.' },
  'time:48h': { label: 'Feito: dois dias inteiros de estudo', how: 'Estude por 48 horas no total.' },
  'sessions:10': { label: 'Feito: 10 sessões concluídas', how: 'Conclua 10 sessões de estudo.' },
  'sessions:30': { label: 'Feito: 30 sessões concluídas', how: 'Conclua 30 sessões de estudo.' },
  'sessions:75': { label: 'Feito: 75 sessões concluídas', how: 'Conclua 75 sessões de estudo.' },
  'sessions:150': { label: 'Feito: 150 sessões concluídas', how: 'Conclua 150 sessões de estudo.' },
  'missions:3': { label: 'Feito: 3 missões do Atlas', how: 'Conclua 3 missões diferentes do Atlas.' },
  'missions:9': { label: 'Feito: 9 missões do Atlas', how: 'Conclua 9 missões diferentes do Atlas.' },
  'missions:18': { label: 'Feito: 18 missões do Atlas', how: 'Conclua 18 missões diferentes do Atlas.' },
  'missions:27': { label: 'Feito: todas as missões do Atlas', how: 'Conclua todas as 27 missões do Atlas.' },
  'starsum:15': { label: 'Feito: 15 estrelas no Atlas', how: 'Some 15 estrelas nas missões do Atlas.' },
  'starsum:30': { label: 'Feito: 30 estrelas no Atlas', how: 'Some 30 estrelas nas missões do Atlas.' },
  'starsum:54': { label: 'Feito: 54 estrelas no Atlas', how: 'Some 54 estrelas nas missões do Atlas.' },
  'starsum:81': { label: 'Feito lendário: todas as estrelas do Atlas', how: 'Consiga as 81 estrelas do Atlas (3 em cada missão).' },
  'stars3:12': { label: 'Feito: 3 estrelas em 12 missões', how: 'Consiga 3 estrelas em 12 missões.' },
  'stars3:20': { label: 'Feito: 3 estrelas em 20 missões', how: 'Consiga 3 estrelas em 20 missões.' },
  'region:vale-proporcoes': { label: 'Feito: Vale das Proporções com todas as estrelas', how: 'Consiga 3 estrelas em todas as missões do Vale das Proporções.' },
  'region:mercado-ambar': { label: 'Feito: Mercado de Âmbar com todas as estrelas', how: 'Consiga 3 estrelas em todas as missões do Mercado de Âmbar.' },
  'region:planicies-numericas': { label: 'Feito: Planícies Numéricas com todas as estrelas', how: 'Consiga 3 estrelas em todas as missões das Planícies Numéricas.' },
  'region:torres-euclidianas': { label: 'Feito: Torres Euclidianas com todas as estrelas', how: 'Consiga 3 estrelas em todas as missões das Torres Euclidianas.' },
  'region:cavernas-volumetricas': { label: 'Feito: Cavernas Volumétricas com todas as estrelas', how: 'Consiga 3 estrelas em todas as missões das Cavernas Volumétricas.' },
  'region:observatorio-dados': { label: 'Feito: Observatório dos Dados com todas as estrelas', how: 'Consiga 3 estrelas em todas as missões do Observatório dos Dados.' },
  'region:labirinto-acaso': { label: 'Feito: Labirinto do Acaso com todas as estrelas', how: 'Consiga 3 estrelas em todas as missões do Labirinto do Acaso.' },
  'region:cordilheira-funcoes': { label: 'Feito: Cordilheira das Funções com todas as estrelas', how: 'Consiga 3 estrelas em todas as missões da Cordilheira das Funções.' },
  'region:ilhas-medida': { label: 'Feito: Ilhas da Medida com todas as estrelas', how: 'Consiga 3 estrelas em todas as missões das Ilhas da Medida.' },
  'bosses:3': { label: 'Feito: 3 chefões derrotados', how: 'Derrote 3 chefões diferentes.' },
  'bosses:6': { label: 'Feito: 6 chefões derrotados', how: 'Derrote 6 chefões diferentes.' },
  'bosses:9': { label: 'Feito: os nove chefões derrotados', how: 'Derrote os 9 chefões do Atlas.' },
  'flawless:1': { label: 'Feito: um chefão sem erros', how: 'Derrote um chefão sem erros e sem dicas.' },
  'flawless:3': { label: 'Feito: 3 chefões sem erros', how: 'Derrote 3 chefões sem erros e sem dicas.' },
  'flawless:5': { label: 'Feito: 5 chefões sem erros', how: 'Derrote 5 chefões sem erros e sem dicas.' },
  'bosswins:5': { label: 'Feito: 5 vitórias contra chefões', how: 'Vença 5 batalhas de chefão (revanches contam).' },
  'bosswins:15': { label: 'Feito: 15 vitórias contra chefões', how: 'Vença 15 batalhas de chefão (revanches contam).' },
  'bosswins:30': { label: 'Feito: 30 vitórias contra chefões', how: 'Vença 30 batalhas de chefão (revanches contam).' },
  swift: { label: 'Feito: chefão derrotado em 6 golpes', how: 'Derrote um chefão em até 6 golpes.' },
  'echoes:25': { label: 'Feito: 25 Ecos superados', how: 'Supere 25 Ecos (acerte o que tinha errado).' },
  'echoes:75': { label: 'Feito: 75 Ecos superados', how: 'Supere 75 Ecos (acerte o que tinha errado).' },
  'echoes:150': { label: 'Feito: 150 Ecos superados', how: 'Supere 150 Ecos (acerte o que tinha errado).' },
  'stages:5': { label: 'Feito: 5 etapas dominadas na Academia', how: 'Domine 5 etapas na Academia.' },
  'stages:30': { label: 'Feito: 30 etapas dominadas na Academia', how: 'Domine 30 etapas na Academia.' },
  'stages:60': { label: 'Feito: 60 etapas dominadas na Academia', how: 'Domine 60 etapas na Academia.' },
  'stages:120': { label: 'Feito: 120 etapas dominadas na Academia', how: 'Domine 120 etapas na Academia.' },
  'seals:1': { label: 'Feito: a primeira insígnia de aula', how: 'Conquiste a insígnia de uma aula da Academia.' },
  'seals:3': { label: 'Feito: 3 insígnias de aula', how: 'Conquiste a insígnia de 3 aulas da Academia.' },
  'seals:10': { label: 'Feito: 10 insígnias de aula', how: 'Conquiste a insígnia de 10 aulas da Academia.' },
  'seals:20': { label: 'Feito: 20 insígnias de aula', how: 'Conquiste a insígnia de 20 aulas da Academia.' },
  'collect:25': { label: 'Feito: 25 peças na coleção', how: 'Tenha 25 peças na coleção.' },
  'collect:50': { label: 'Feito: 50 peças na coleção', how: 'Tenha 50 peças na coleção.' },
  'collect:100': { label: 'Feito: 100 peças na coleção', how: 'Tenha 100 peças na coleção.' },
  'collect:150': { label: 'Feito: 150 peças na coleção', how: 'Tenha 150 peças na coleção.' },
  'collect:200': { label: 'Feito: 200 peças na coleção', how: 'Tenha 200 peças na coleção.' },
  'collect:275': { label: 'Feito lendário: 275 peças na coleção', how: 'Tenha 275 peças na coleção.' },
  'collect:cores10': { label: 'Feito: 10 núcleos na coleção', how: 'Tenha 10 núcleos.' },
  'collect:skies8': { label: 'Feito: 8 ambientes na coleção', how: 'Tenha 8 ambientes.' },
  'daily:7': { label: 'Feito: 7 baús do dia', how: 'Abra 7 baús do dia nas Encomendas.' },
  'daily:30': { label: 'Feito: 30 baús do dia', how: 'Abra 30 baús do dia nas Encomendas.' },
  'daily:100': { label: 'Feito: 100 baús do dia', how: 'Abra 100 baús do dia nas Encomendas.' },
  'weekly:4': { label: 'Feito: 4 baús da semana', how: 'Abra 4 baús da semana nas Encomendas.' },
  'weekly:12': { label: 'Feito: 12 baús da semana', how: 'Abra 12 baús da semana nas Encomendas.' },
  'accuracy:80': { label: 'Feito: 80% de acerto', how: 'Tenha 80% de acerto com pelo menos 200 respostas.' },
  'accuracy:90': { label: 'Feito: 90% de acerto', how: 'Tenha 90% de acerto com pelo menos 500 respostas.' },
  'shop:5': { label: 'Feito: 5 peças forjadas', how: 'Forje 5 peças na Oficina.' },
  'shop:15': { label: 'Feito: 15 peças forjadas', how: 'Forje 15 peças na Oficina.' },
  'shop:30': { label: 'Feito: 30 peças forjadas', how: 'Forje 30 peças na Oficina.' },
} as const satisfies Record<string, { label: string; how: string }>;

export type FeatId = keyof typeof FEAT_TEXT;

export function howToGet(get: Get): string {
  if (get.by === 'shop') return `Oficina: ${get.price} de Tinta.`;
  if (get.by === 'level') return `Alcance o nível ${get.level}.`;
  return FEAT_TEXT[get.feat].how;
}

/** Ficha de uma peça nova: como um `ItemDef`, mais a origem. */
export interface AsterItem extends ItemDef {
  get: Get;
}

type Colors = [string, string?];

/** Monta a ficha: `howToGet` e `price` saem da origem. */
export function piece(
  slot: ItemSlot,
  id: string,
  name: string,
  rarity: Rarity,
  fx: string,
  colors: Colors,
  description: string,
  get: Get,
  extra: Partial<ItemVisual> & { element?: FxElement } = {},
): AsterItem {
  return {
    id,
    slot,
    name,
    rarity,
    description,
    howToGet: howToGet(get),
    visual: { color: colors[0], ...(colors[1] ? { color2: colors[1] } : {}), ...(slot === 'title' ? {} : { fx }), ...extra },
    ...(get.by === 'shop' ? { price: get.price } : {}),
    get,
  };
}
