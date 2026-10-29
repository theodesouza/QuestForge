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
  {
    id: 'planicies-numericas',
    index: 3,
    name: 'Planícies Numéricas',
    tagline: 'Frações, múltiplos e potências',
    lore:
      'Em campos que se estendem até o horizonte, cada número tem o seu lugar. A Névoa soltou os algarismos, e uma Quimera de três cabeças faz as contas fugirem — junte-as de novo.',
    color: '#5FD38D',
    nodes: [
      {
        kind: 'mission',
        id: 'r3-m1',
        title: 'O Campo das Frações',
        subtitle: 'Frações e operações',
        description: 'Reparta o campo em partes iguais: compare, some e multiplique frações sem perder o todo de vista.',
        topics: ['basica'],
        subtopics: ['fracoes', 'operacoes'],
        questionCount: 5,
        difficulty: [1, 1, 2, 2, 3],
        passCorrect: 3,
        requires: ['r2-boss'],
      },
      {
        kind: 'mission',
        id: 'r3-m2',
        title: 'A Torre dos Múltiplos',
        subtitle: 'MMC e MDC',
        description: 'Suba a torre: descubra quando os ciclos voltam a se encontrar e como repartir tudo sem sobra.',
        topics: ['basica'],
        subtopics: ['mmc-mdc'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r3-m1'],
      },
      {
        kind: 'mission',
        id: 'r3-m3',
        title: 'A Forja das Potências',
        subtitle: 'Potências e notação científica',
        description: 'Na forja, números enormes e minúsculos cabem numa linha só: domine os expoentes.',
        topics: ['basica'],
        subtopics: ['potencias', 'notacao-cientifica'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r3-m2'],
      },
      {
        kind: 'boss',
        id: 'r3-boss',
        bossId: 'quimera-fracionaria',
        title: 'Quimera Fracionária',
        subtitle: 'Guardiã das Planícies',
        requires: ['r3-m3'],
      },
    ],
  },
  {
    id: 'torres-euclidianas',
    index: 4,
    name: 'Torres Euclidianas',
    tagline: 'Áreas, triângulos e círculos',
    lore:
      'No planalto, torres de pedra clara medem o céu com régua e compasso. A Névoa borrou os ângulos e entortou as linhas — e um Colosso de três vértices só deixa passar quem demonstra o que afirma.',
    color: '#7FB6FF',
    nodes: [
      {
        kind: 'mission',
        id: 'r4-m1',
        title: 'O Pátio dos Polígonos',
        subtitle: 'Perímetros e áreas',
        description: 'Calcule quanto piso, tinta e cerca cada canteiro do pátio pede: retângulos, triângulos, trapézios e figuras compostas.',
        topics: ['geo-plana'],
        subtopics: ['areas', 'areas-compostas'],
        questionCount: 5,
        difficulty: [1, 1, 2, 2, 3],
        passCorrect: 3,
        requires: ['r3-boss'],
      },
      {
        kind: 'mission',
        id: 'r4-m2',
        title: 'A Ponte dos Triângulos',
        subtitle: 'Pitágoras e semelhança',
        description: 'Atravesse a ponte medindo o que não dá para alcançar: diagonais, rampas, sombras e triângulos parecidos.',
        topics: ['geo-plana'],
        subtopics: ['pitagoras', 'semelhanca'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r4-m1'],
      },
      {
        kind: 'mission',
        id: 'r4-m3',
        title: 'O Salão dos Círculos',
        subtitle: 'Círculo, circunferência e ângulos',
        description: 'Sob a cúpula do Salão tudo gira: comprimentos de volta, áreas de roda e ângulos de polígonos regulares.',
        topics: ['geo-plana'],
        subtopics: ['circulo', 'angulos'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r4-m2'],
      },
      {
        kind: 'boss',
        id: 'r4-boss',
        bossId: 'colosso-euclidiano',
        title: 'Colosso Euclidiano',
        subtitle: 'Guardião das Torres',
        requires: ['r4-m3'],
      },
    ],
  },
  {
    id: 'cavernas-volumetricas',
    index: 5,
    name: 'Cavernas Volumétricas',
    tagline: 'Volumes, capacidade e superfície',
    lore:
      'Sob as Torres, galerias ocas guardam cristais em forma de prismas, cones e esferas. A Névoa encheu as cavernas de concreto sem medida — e o Arquiteto só abre passagem a quem sabe quanto cabe em cada espaço.',
    color: '#9B87FF',
    nodes: [
      {
        kind: 'mission',
        id: 'r5-m1',
        title: 'A Caverna dos Prismas',
        subtitle: 'Volumes e capacidade',
        description: 'Descubra quanta água, areia e concreto cabem em caixas, tanques e galerias de base retangular.',
        topics: ['geo-espacial'],
        subtopics: ['volumes', 'capacidade'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r4-boss'],
      },
      {
        kind: 'mission',
        id: 'r5-m2',
        title: 'O Silo dos Cilindros',
        subtitle: 'Cilindros, cones, pirâmides e esferas',
        description: 'Calcule o que cabe em silos, funis, tendas de pedra e cúpulas — e por que o cone enche um terço do cilindro.',
        topics: ['geo-espacial'],
        subtopics: ['cilindro', 'cone-esfera'],
        questionCount: 5,
        difficulty: [1, 2, 3, 3, 3],
        passCorrect: 3,
        requires: ['r5-m1'],
      },
      {
        kind: 'mission',
        id: 'r5-m3',
        title: 'A Oficina das Planificações',
        subtitle: 'Superfície, planificações e sólidos compostos',
        description: 'Abra as caixas sobre a bancada: quanta tinta, chapa e papel cada sólido pede — e o que muda quando a escala muda.',
        topics: ['geo-espacial'],
        subtopics: ['superficie', 'solidos-compostos'],
        questionCount: 5,
        difficulty: [1, 2, 3, 3, 3],
        passCorrect: 3,
        requires: ['r5-m2'],
      },
      {
        kind: 'boss',
        id: 'r5-boss',
        bossId: 'arquiteto-dos-solidos',
        title: 'Arquiteto dos Sólidos',
        subtitle: 'Guardião das Cavernas',
        requires: ['r5-m3'],
      },
    ],
  },
  {
    id: 'observatorio-dados',
    index: 6,
    name: 'Observatório dos Dados',
    tagline: 'Gráficos, tabelas e estatística',
    lore:
      'No alto da colina, um observatório guarda séculos de medições. A Névoa embaralhou eixos, legendas e escalas — e um Leviatã feito de gráficos só deixa passar quem sabe ler o que os números realmente dizem.',
    color: '#38D6B0',
    nodes: [
      {
        kind: 'mission',
        id: 'r6-m1',
        title: 'O Mirante dos Gráficos',
        subtitle: 'Barras, linhas e setores',
        description: 'Suba ao mirante e leia o que barras, linhas e fatias mostram — sem se deixar enganar pela escala dos eixos.',
        topics: ['graficos'],
        subtopics: ['leitura-graficos', 'graficos-setores'],
        questionCount: 5,
        difficulty: [1, 1, 2, 2, 3],
        passCorrect: 3,
        requires: ['r5-boss'],
      },
      {
        kind: 'mission',
        id: 'r6-m2',
        title: 'A Sala das Tabelas',
        subtitle: 'Tabelas e frequências',
        description: 'Cruze linhas e colunas nos registros do Observatório: totais, porcentagens e frequências relativas.',
        topics: ['graficos', 'estatistica'],
        subtopics: ['tabelas', 'frequencias'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r6-m1'],
      },
      {
        kind: 'mission',
        id: 'r6-m3',
        title: 'O Relógio das Médias',
        subtitle: 'Média, mediana e moda',
        description: 'Os ponteiros do relógio medem o centro dos dados: médias simples e ponderadas, medianas e modas.',
        topics: ['estatistica'],
        subtopics: ['media', 'mediana-moda'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r6-m2'],
      },
      {
        kind: 'boss',
        id: 'r6-boss',
        bossId: 'leviata-dos-graficos',
        title: 'Leviatã dos Gráficos',
        subtitle: 'Guardião do Observatório',
        requires: ['r6-m3'],
      },
    ],
  },
  {
    id: 'labirinto-acaso',
    index: 7,
    name: 'Labirinto do Acaso',
    tagline: 'Contagem e probabilidade',
    lore:
      'Sob o Observatório, um labirinto troca de corredor a cada passo. A Névoa embaralhou as escolhas — e uma Esfinge só deixa passar quem sabe contar o que pode acontecer e medir o quanto é provável.',
    color: '#FF8FD1',
    nodes: [
      {
        kind: 'mission',
        id: 'r7-m1',
        title: 'O Corredor das Possibilidades',
        subtitle: 'Princípio multiplicativo e permutações',
        description: 'Monte senhas, cardápios, filas e anagramas: cada escolha abre novos caminhos, e o corredor só termina quando você os conta todos.',
        topics: ['combinatoria'],
        subtopics: ['principio-multiplicativo', 'permutacao'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r6-boss'],
      },
      {
        kind: 'mission',
        id: 'r7-m2',
        title: 'O Salão dos Grupos',
        subtitle: 'Combinações e restrições',
        description: 'Forme comissões, times e rodadas em que a ordem não importa — e conte também o que a regra proíbe.',
        topics: ['combinatoria'],
        subtopics: ['combinacao', 'contagem-restricoes'],
        questionCount: 5,
        difficulty: [1, 2, 3, 3, 3],
        passCorrect: 3,
        requires: ['r7-m1'],
      },
      {
        kind: 'mission',
        id: 'r7-m3',
        title: 'A Câmara da Sorte',
        subtitle: 'Probabilidade simples e composta',
        description: 'Dados, urnas e roletas: calcule as chances de um evento — e de eventos que se sucedem.',
        topics: ['probabilidade'],
        subtopics: ['probabilidade-simples', 'probabilidade-composta'],
        questionCount: 5,
        difficulty: [1, 2, 2, 3, 3],
        passCorrect: 3,
        requires: ['r7-m2'],
      },
      {
        kind: 'boss',
        id: 'r7-boss',
        bossId: 'esfinge-do-acaso',
        title: 'Esfinge do Acaso',
        subtitle: 'Guardiã do Labirinto',
        requires: ['r7-m3'],
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
