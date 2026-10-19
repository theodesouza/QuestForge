import type { Difficulty, TopicId } from './types';

/**
 * Uma cabeça da Quimera: ocupa uma fração da vida máxima e cobra uma matéria. A soma das
 * frações é sempre 1 (1/2 + 1/3 + 1/6). As cabeças caem de cima para baixo.
 */
export interface BossHead {
  id: string;
  name: string;
  /** Fração da vida máxima: [numerador, denominador]. */
  share: [number, number];
  /** Subassuntos das perguntas feitas enquanto esta cabeça está de pé. */
  subtopics: string[];
  color: string;
  /** Fala quando esta cabeça cai. */
  fall: string;
}

/**
 * Mecânica própria de cada chefão. Todas "quebram" quando a vida cai abaixo de
 * `breaksAtHpRatio` (fase 2), recompensando quem mantém a pressão.
 * - armor: enquanto inteira, questões fáceis causam dano reduzido.
 * - interest: enquanto o cofre estiver cheio, cada erro devolve vida ao chefão
 *   ("cobra juros"), e a cobrança cresce a cada erro seguido.
 * - heads: a vida é a soma de cabeças, cada uma com a sua matéria. Um erro faz a
 *   cabeça que está de pé se regenerar um pouco — nunca além do topo dela: uma cabeça
 *   derrubada não volta.
 */
export type BossTrait =
  | {
      kind: 'armor';
      name: string;
      description: string;
      breaksAtHpRatio: number;
      easyMultiplier: number;
    }
  | {
      kind: 'interest';
      name: string;
      description: string;
      breaksAtHpRatio: number;
      /** Fração da vida máxima recuperada por erro (multiplicada pelos erros seguidos). */
      healRatio: number;
    }
  | {
      kind: 'heads';
      name: string;
      description: string;
      breaksAtHpRatio: number;
      /** Fração da vida máxima que a cabeça de pé recupera por erro (limitada ao topo dela). */
      healRatio: number;
      heads: BossHead[];
    };

/** Arte vetorial registrada na UI (src/features/boss/art). */
export type BossArt = 'golem' | 'mercador' | 'quimera';

export interface BossDef {
  id: string;
  name: string;
  epithet: string;
  regionId: string;
  art: BossArt;
  /** Cor de destaque do chefão (brilho de fundo, HUD). */
  accent: string;
  topics: TopicId[];
  /** Restringe a subassuntos específicos (vazio = todos dos assuntos). */
  subtopics: string[];
  maxHp: number;
  /** Determinação do jogador: erros permitidos antes da retirada. */
  resolve: number;
  damage: Record<Difficulty, number>;
  /** Dificuldade-alvo inicial e escalada por turno. */
  startTarget: number;
  targetStep: number;
  trait: BossTrait;
  technique: { name: string; every: number; bonus: number; line: string };
  lines: {
    intro: string[];
    phase2: string;
    playerHit: string[];
    bossHit: string[];
    defeat: string;
    retreat: string;
  };
  rewards: {
    firstXp: number;
    firstInk: number;
    firstItems: string[];
    flawlessItem: string;
    repeatXp: number;
  };
}

export const BOSSES: BossDef[] = [
  {
    id: 'golem-proporcional',
    name: 'Golem Proporcional',
    epithet: 'Guardião do Vale das Proporções',
    regionId: 'vale-proporcoes',
    art: 'golem',
    accent: '#FF6A55',
    topics: ['razao-proporcao', 'porcentagem'],
    subtopics: [],
    maxHp: 220,
    resolve: 3,
    damage: { 1: 18, 2: 26, 3: 36, 4: 48 },
    startTarget: 1.8,
    targetStep: 0.25,
    trait: {
      kind: 'armor',
      name: 'Couraça de Basalto',
      description:
        'Enquanto a couraça estiver inteira (vida acima de 50%), questões fáceis causam metade do dano. Questões mais difíceis a racham mais rápido.',
      breaksAtHpRatio: 0.5,
      easyMultiplier: 0.5,
    },
    technique: {
      name: 'Régua Áurea',
      every: 3,
      bonus: 22,
      line: 'Três acertos seguidos! A Régua Áurea corta a pedra na medida exata.',
    },
    lines: {
      intro: [
        'Pedra sobre pedra, razão sobre razão.',
        'Ninguém atravessa o Vale sem medir o que carrega.',
        'Mostre que sabe manter as proporções… ou volte por onde veio.',
      ],
      phase2: 'Minha couraça… rachou?! Nenhuma pedra resiste a uma conta bem armada.',
      playerHit: [
        'O golpe acerta em cheio — a conta fechou.',
        'Fragmentos de basalto voam pelo vale.',
        'O Golem cambaleia. Proporção certeira.',
        'Mais uma rachadura se abre no peito de pedra.',
      ],
      bossHit: [
        'O Golem aproveita o deslize e avança.',
        'Um punho de pedra desce sobre você.',
        'O chão treme. Respire, revise a resolução e siga.',
      ],
      defeat: 'Hm… as medidas estavam certas. O Vale é seu, Cartógrafo.',
      retreat: 'Volte quando suas razões estiverem afiadas. Eu não saio daqui.',
    },
    rewards: {
      firstXp: 150,
      firstInk: 60,
      firstItems: ['frame-basalto', 'title-quebra-golem'],
      flawlessItem: 'aura-aurea',
      repeatXp: 30,
    },
  },
  {
    id: 'mercador-composto',
    name: 'Mercador Composto',
    epithet: 'Guardião do Mercado de Âmbar',
    regionId: 'mercado-ambar',
    art: 'mercador',
    accent: '#FF9F43',
    topics: ['financeira'],
    subtopics: [],
    maxHp: 260,
    resolve: 3,
    damage: { 1: 20, 2: 28, 3: 38, 4: 50 },
    startTarget: 2,
    targetStep: 0.25,
    trait: {
      kind: 'interest',
      name: 'Cofre de Juros',
      description:
        'Enquanto o cofre estiver cheio (vida acima de 50%), cada erro faz o Mercador cobrar juros: ele recupera 8% da vida máxima — e a cobrança cresce a cada erro seguido. Quebre o cofre e a cobrança acaba.',
      breaksAtHpRatio: 0.5,
      healRatio: 0.08,
    },
    technique: {
      name: 'Amortização',
      every: 3,
      bonus: 25,
      line: 'Três acertos seguidos! A Amortização derruba a dívida de uma vez.',
    },
    lines: {
      intro: [
        'Tudo tem um preço, viajante. Inclusive a passagem.',
        'Aqui, cada erro rende juros — para mim.',
        'Mostre que sabe fazer as contas… ou pague em prestações.',
      ],
      phase2: 'Meu cofre… vazio?! Quem te ensinou a pagar à vista?',
      playerHit: [
        'A conta fecha — e o Mercador perde o sorriso.',
        'Moedas de âmbar rolam pelo chão do mercado.',
        'Pagamento à vista, direto no caixa dele.',
        'Mais uma parcela quitada.',
      ],
      bossHit: [
        'O Mercador anota mais uma parcela na sua conta.',
        'Juros sobre juros: o caixa dele engorda.',
        'Ele sorri e cobra a taxa. Revise a resolução e siga.',
      ],
      defeat: 'Negócio fechado. O Mercado é seu — sem juros.',
      retreat: 'Volte quando souber o preço das coisas. A dívida espera.',
    },
    rewards: {
      firstXp: 200,
      firstInk: 80,
      firstItems: ['frame-ambar-cunhado', 'title-amortizador'],
      flawlessItem: 'core-tesouro',
      repeatXp: 40,
    },
  },
  {
    id: 'quimera-fracionaria',
    name: 'Quimera Fracionária',
    epithet: 'Guardiã das Planícies Numéricas',
    regionId: 'planicies-numericas',
    art: 'quimera',
    accent: '#5FD38D',
    topics: ['basica'],
    subtopics: [],
    maxHp: 240,
    resolve: 3,
    damage: { 1: 20, 2: 28, 3: 38, 4: 50 },
    startTarget: 2,
    targetStep: 0.25,
    trait: {
      kind: 'heads',
      name: 'Três Cabeças',
      description:
        'A vida da Quimera é a soma de três cabeças: Leão (1/2 da vida, frações e contas), Cabra (1/3, MMC e MDC) e Serpente (1/6, potências e notação científica) — 1/2 + 1/3 + 1/6 = 1. Cada cabeça faz as perguntas da sua matéria. Um erro faz a cabeça de pé se regenerar um pouco, mas uma cabeça derrubada nunca volta.',
      breaksAtHpRatio: 0.5,
      healRatio: 0.06,
      heads: [
        { id: 'leao', name: 'Leão', share: [1, 2], subtopics: ['fracoes', 'operacoes'], color: '#F2B54A', fall: 'O Leão caiu?! Mas a Cabra e a Serpente ainda têm fome… e dentes.' },
        { id: 'cabra', name: 'Cabra', share: [1, 3], subtopics: ['mmc-mdc'], color: '#C9D1F0', fall: 'A Cabra tomba e o balido vira silêncio. Só resta a Serpente.' },
        { id: 'serpente', name: 'Serpente', share: [1, 6], subtopics: ['potencias', 'notacao-cientifica'], color: '#5FD38D', fall: 'A Serpente se desenrola, sem forças. As três cabeças caíram.' },
      ],
    },
    technique: {
      name: 'Denominador Comum',
      every: 3,
      bonus: 24,
      line: 'Três acertos seguidos! O Denominador Comum une as três cabeças num só golpe.',
    },
    lines: {
      intro: [
        'Três cabeças, uma só fome: a de contas que não fecham.',
        'O Leão rói as frações, a Cabra mastiga os múltiplos e a Serpente enrola as potências.',
        'Derrube as três — e que a soma dê exatamente 1.',
      ],
      phase2: 'O Leão caiu?! Mas a Cabra e a Serpente ainda têm fome… e dentes.',
      playerHit: [
        'O golpe acerta em cheio — a conta fechou.',
        'A cabeça recua, cuspindo números soltos.',
        'Mais uma fração do monstro se vai.',
        'Os expoentes da Quimera tremem.',
      ],
      bossHit: [
        'A cabeça de pé se regenera, mordendo o ar.',
        'A Quimera ruge: um pedaço da vida volta a crescer.',
        'Um erro de conta alimenta a fera. Revise a resolução e siga.',
      ],
      defeat: 'A soma fechou: 1/2 + 1/3 + 1/6 = 1. As Planícies são suas, Cartógrafo.',
      retreat: 'Volte quando seus denominadores estiverem em ordem. Eu espero.',
    },
    rewards: {
      firstXp: 250,
      firstInk: 100,
      firstItems: ['frame-tres-arcos', 'title-soma-inteira'],
      flawlessItem: 'core-trindade',
      repeatXp: 50,
    },
  },
];

const BY_ID = new Map(BOSSES.map((b) => [b.id, b]));

export function getBoss(id: string): BossDef {
  const b = BY_ID.get(id);
  if (!b) throw new Error(`Chefão desconhecido: ${id}`);
  return b;
}
