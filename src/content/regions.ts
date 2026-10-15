import type { Difficulty, TopicId } from './types';

export interface MissionNode {
  kind: 'mission';
  id: string;
  title: string;
  subtitle: string;
  description: string;
  topics: TopicId[];
  subtopics: string[];
  questionCount: number;
  /**
   * Dificuldade-alvo de cada questão da tentativa (tamanho = questionCount), em ordem
   * crescente: a missão começa acessível e termina no seu nível mais alto.
   */
  difficulty: Difficulty[];
  /** Acertos necessários para concluir a missão. */
  passCorrect: number;
  requires: string[];
}

export interface BossNode {
  kind: 'boss';
  id: string;
  bossId: string;
  title: string;
  subtitle: string;
  requires: string[];
}

export type CampaignNode = MissionNode | BossNode;

export interface Region {
  id: string;
  index: number;
  name: string;
  tagline: string;
  lore: string;
  color: string;
  nodes: CampaignNode[];
}

export const REGIONS: Region[] = [
  {
    id: 'vale-proporcoes',
    index: 1,
    name: 'Vale das Proporções',
    tagline: 'Razões, regra de três e porcentagem',
    lore:
      'No Vale, tudo cresce na medida certa: rios, pontes e mercados obedecem a razões precisas. A Névoa embaralhou as medidas — redesenhe-as.',
    color: '#F2B54A',
    nodes: [
      {
        kind: 'mission',
        id: 'r1-m1',
        title: 'A Ponte das Razões',
        subtitle: 'Razão, proporção e escala',
        description: 'Reconstrua a ponte comparando grandezas e lendo escalas do mapa.',
        topics: ['razao-proporcao'],
        subtopics: ['razao', 'proporcao', 'escala'],
        questionCount: 5,
        difficulty: [1, 1, 2, 2, 3],
        passCorrect: 3,
        requires: [],
      },
      {
        kind: 'mission',
        id: 'r1-m2',
        title: 'O Moinho da Regra de Três',
        subtitle: 'Grandezas diretas e inversas',
        description: 'Faça o moinho girar de novo: descubra o que cresce junto e o que cresce ao contrário.',
        topics: ['razao-proporcao'],
        subtopics: ['regra-de-tres', 'regra-de-tres-inversa', 'regra-de-tres-composta'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r1-m1'],
      },
      {
        kind: 'mission',
        id: 'r1-m3',
        title: 'O Mercado dos Percentuais',
        subtitle: 'Porcentagens, aumentos e descontos',
        description: 'Os mercadores confundiram os preços. Recalcule aumentos, descontos e variações.',
        topics: ['porcentagem'],
        subtopics: ['porcentagem-basica', 'variacao-percentual', 'aumentos-sucessivos'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 4],
        passCorrect: 3,
        requires: ['r1-m2'],
      },
      {
        kind: 'boss',
        id: 'r1-boss',
        bossId: 'golem-proporcional',
        title: 'Golem Proporcional',
        subtitle: 'Guardião do Vale',
        requires: ['r1-m3'],
      },
    ],
  },
  {
    id: 'mercado-ambar',
    index: 2,
    name: 'Mercado de Âmbar',
    tagline: 'Juros, prestações e custo-benefício',
    lore:
      'Sob toldos cor de âmbar, tudo se compra e tudo se cobra. A Névoa apagou o valor das coisas — e o Mercador lucra com cada conta errada.',
    color: '#FF9F43',
    nodes: [
      {
        kind: 'mission',
        id: 'r2-m1',
        title: 'A Balança dos Juros Simples',
        subtitle: 'Juros simples e montante',
        description: 'Reequilibre a balança do cambista: capital, taxa e tempo na medida certa.',
        topics: ['financeira'],
        subtopics: ['juros-simples'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r1-boss'],
      },
      {
        kind: 'mission',
        id: 'r2-m2',
        title: 'O Cofre que Cresce',
        subtitle: 'Juros compostos',
        description: 'Descubra por que o cofre do Mercador cresce cada vez mais rápido.',
        topics: ['financeira'],
        subtopics: ['juros-compostos'],
        questionCount: 5,
        difficulty: [1, 2, 3, 3, 4],
        passCorrect: 3,
        requires: ['r2-m1'],
      },
      {
        kind: 'mission',
        id: 'r2-m3',
        title: 'A Feira das Prestações',
        subtitle: 'À vista, a prazo e custo-benefício',
        description: 'Desmascare os parcelamentos "sem juros" e encontre a oferta que vale mais.',
        topics: ['financeira'],
        subtopics: ['compras-a-prazo', 'custo-beneficio'],
        questionCount: 5,
        difficulty: [2, 2, 3, 3, 4],
        passCorrect: 3,
        requires: ['r2-m2'],
      },
      {
        kind: 'boss',
        id: 'r2-boss',
        bossId: 'mercador-composto',
        title: 'Mercador Composto',
        subtitle: 'Guardião do Mercado',
        requires: ['r2-m3'],
      },
    ],
  },
];

export function getRegion(id: string): Region {
  const r = REGIONS.find((x) => x.id === id);
  if (!r) throw new Error(`Região desconhecida: ${id}`);
  return r;
}

export function findNode(nodeId: string): { region: Region; node: CampaignNode } | null {
  for (const region of REGIONS) {
    const node = region.nodes.find((n) => n.id === nodeId);
    if (node) return { region, node };
  }
  return null;
}
