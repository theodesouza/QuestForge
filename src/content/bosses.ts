import type { Difficulty, TopicId } from './types';

/**
 * Mecânica própria de cada chefão. Ambas "quebram" quando a vida cai abaixo de
 * `breaksAtHpRatio` (fase 2), recompensando quem mantém a pressão.
 * - armor: enquanto inteira, questões fáceis causam dano reduzido.
 * - interest: enquanto o cofre estiver cheio, cada erro devolve vida ao chefão
 *   ("cobra juros"), e a cobrança cresce a cada erro seguido.
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
    };

/** Arte vetorial registrada na UI (src/features/boss/art). */
export type BossArt = 'golem' | 'mercador';

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
];

const BY_ID = new Map(BOSSES.map((b) => [b.id, b]));

export function getBoss(id: string): BossDef {
  const b = BY_ID.get(id);
  if (!b) throw new Error(`Chefão desconhecido: ${id}`);
  return b;
}
