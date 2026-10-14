import type { Difficulty, TopicId } from './types';

export interface BossDef {
  id: string;
  name: string;
  epithet: string;
  regionId: string;
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
  trait: {
    name: string;
    description: string;
    /** Enquanto a vida estiver acima deste percentual, questões fáceis causam dano reduzido. */
    breaksAtHpRatio: number;
    easyMultiplier: number;
  };
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
    topics: ['razao-proporcao', 'porcentagem'],
    subtopics: [],
    maxHp: 220,
    resolve: 3,
    damage: { 1: 18, 2: 26, 3: 36, 4: 48 },
    startTarget: 1.8,
    targetStep: 0.25,
    trait: {
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
];

const BY_ID = new Map(BOSSES.map((b) => [b.id, b]));

export function getBoss(id: string): BossDef {
  const b = BY_ID.get(id);
  if (!b) throw new Error(`Chefão desconhecido: ${id}`);
  return b;
}
