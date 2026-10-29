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
 * Uma face do Colosso: cobra uma matéria e racha depois de alguns acertos nela.
 */
export interface BossFacet {
  id: string;
  name: string;
  /** Subassuntos das perguntas feitas enquanto esta face está intacta. */
  subtopics: string[];
  color: string;
  /** Fala quando esta face racha. */
  crack: string;
}

/**
 * Mecânica própria de cada chefão. As de vida (couraça, cofre, concreto) "quebram" quando a
 * vida cai abaixo de `breaksAtHpRatio` (fase 2), recompensando quem mantém a pressão.
 * - armor: enquanto inteira, questões fáceis causam dano reduzido.
 * - interest: enquanto o cofre estiver cheio, cada erro devolve vida ao chefão
 *   ("cobra juros"), e a cobrança cresce a cada erro seguido.
 * - heads: a vida é a soma de cabeças, cada uma com a sua matéria. Um erro faz a
 *   cabeça que está de pé se regenerar um pouco — nunca além do topo dela: uma cabeça
 *   derrubada não volta.
 * - facets: o Colosso tem faces (uma matéria cada), que as perguntas percorrem em rodízio.
 *   Enquanto a face da pergunta está intacta, o dano é reduzido; `hitsToCrack` acertos nela a
 *   racham (para sempre) e um erro a "reajusta" (perde um acerto, se ainda não rachou). Com
 *   todas as faces rachadas o Colosso fica exposto: fase 2 e dano ampliado.
 * - scales: o Leviatã é coberto de escamas (`maxScales`). Enquanto há escama, o dano é reduzido
 *   (`scaledMultiplier`); cada acerto arranca uma escama (a Técnica arranca duas) e cada erro faz
 *   `regrow` escamas crescerem de volta. Sem escamas o Leviatã fica exposto (`exposedMultiplier`);
 *   a primeira vez que isso acontece é a fase 2.
 * - riddle: a cada `every` golpes a Esfinge propõe um Enigma — uma questão um nível mais difícil.
 *   Acertar o Enigma multiplica o dano por `damageMultiplier`; errar custa `missResolve` pontos de
 *   Determinação em vez de um. Com a vida abaixo de `breaksAtHpRatio` (fase 2), o Enigma passa a vir
 *   a cada `phase2Every` golpes.
 * - hydra: cada erro faz nascer uma cabeça nova (até `maxHeads`). A cada golpe dado, cada cabeça
 *   nova regenera `regenPerHead` de vida da Hidra; a Técnica (acertos seguidos) cauteriza uma cabeça.
 *   Com a vida abaixo de `breaksAtHpRatio` (fase 2), os pescoços secam: as cabeças somem e a
 *   regeneração acaba.
 * - concrete: cada erro faz o Arquiteto despejar uma camada de concreto (até `maxLayers`),
 *   e cada camada reduz o dano dos golpes seguintes. Uma Técnica (acertos seguidos) ignora
 *   as camadas e quebra todas. Com a vida abaixo de `breaksAtHpRatio`, o concreto racha e para
 *   de se formar.
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
    }
  | {
      kind: 'facets';
      name: string;
      description: string;
      /** Não usado: a fase 2 vem de todas as faces rachadas, não da vida. */
      breaksAtHpRatio: number;
      /** Acertos numa face para rachá-la. */
      hitsToCrack: number;
      /** Multiplicador de dano enquanto a face da pergunta está intacta. */
      intactMultiplier: number;
      /** Multiplicador de dano com todas as faces rachadas (Colosso exposto). */
      exposedMultiplier: number;
      facets: BossFacet[];
    }
  | {
      kind: 'scales';
      name: string;
      description: string;
      /** Não usado: a fase 2 vem de arrancar todas as escamas pela primeira vez. */
      breaksAtHpRatio: number;
      maxScales: number;
      /** Escamas que crescem de volta a cada erro. */
      regrow: number;
      /** Multiplicador de dano enquanto houver escamas. */
      scaledMultiplier: number;
      /** Multiplicador de dano sem nenhuma escama (Leviatã exposto). */
      exposedMultiplier: number;
    }
  | {
      kind: 'riddle';
      name: string;
      description: string;
      breaksAtHpRatio: number;
      /** De quantos em quantos golpes vem o Enigma (golpes 4, 8, 12…). */
      every: number;
      /** Na fase 2 o Enigma vem mais depressa. */
      phase2Every: number;
      /** Multiplicador de dano ao decifrar o Enigma. */
      damageMultiplier: number;
      /** Determinação perdida ao errar o Enigma. */
      missResolve: number;
      solvedLine: string;
      failedLine: string;
    }
  | {
      kind: 'hydra';
      name: string;
      description: string;
      breaksAtHpRatio: number;
      /** Máximo de cabeças novas ao mesmo tempo. */
      maxHeads: number;
      /** Vida que cada cabeça nova regenera por golpe. */
      regenPerHead: number;
    }
  | {
      kind: 'concrete';
      name: string;
      description: string;
      breaksAtHpRatio: number;
      /** Máximo de camadas de concreto acumuladas. */
      maxLayers: number;
      /** Fração do dano perdida por camada. */
      layerPenalty: number;
    };

/** Arte vetorial registrada na UI (src/features/boss/art). */
export type BossArt = 'golem' | 'mercador' | 'quimera' | 'colosso' | 'arquiteto' | 'leviata' | 'esfinge' | 'hidra';

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
  {
    id: 'colosso-euclidiano',
    name: 'Colosso Euclidiano',
    epithet: 'Guardião das Torres Euclidianas',
    regionId: 'torres-euclidianas',
    art: 'colosso',
    accent: '#7FB6FF',
    topics: ['geo-plana'],
    subtopics: [],
    maxHp: 300,
    resolve: 3,
    damage: { 1: 20, 2: 28, 3: 38, 4: 50 },
    startTarget: 2,
    targetStep: 0.25,
    trait: {
      kind: 'facets',
      name: 'Três Vértices',
      description:
        'O Colosso tem três vértices — Áreas, Triângulos e Círculos — e as perguntas percorrem um de cada vez. Enquanto o vértice da pergunta está intacto, seus golpes causam 40% menos dano. Dois acertos num vértice o racham para sempre; um erro o reajusta (tira um acerto, se ainda não rachou). Com os três rachados, o Colosso fica exposto: +40% de dano.',
      breaksAtHpRatio: 0,
      hitsToCrack: 2,
      intactMultiplier: 0.6,
      exposedMultiplier: 1.4,
      facets: [
        { id: 'areas', name: 'Áreas', subtopics: ['areas', 'areas-compostas'], color: '#F2B54A', crack: 'O vértice das Áreas racha: a pedra perde a medida.' },
        { id: 'triangulos', name: 'Triângulos', subtopics: ['pitagoras', 'semelhanca'], color: '#7FB6FF', crack: 'O vértice dos Triângulos se parte: a hipotenusa desaba sobre os catetos.' },
        { id: 'circulos', name: 'Círculos', subtopics: ['circulo', 'angulos'], color: '#FF8FD1', crack: 'O vértice dos Círculos estala: a roda perde o centro.' },
      ],
    },
    technique: {
      name: 'Teorema Demonstrado',
      every: 3,
      bonus: 26,
      line: 'Três acertos seguidos! O Teorema está demonstrado — e o Colosso estremece.',
    },
    lines: {
      intro: [
        'Régua, compasso e paciência: foi assim que me ergueram.',
        'Tenho três vértices, e nenhum cede sem demonstração.',
        'Rache os três — Áreas, Triângulos e Círculos — e eu ficarei sem esquadro.',
      ],
      phase2: 'Os três vértices racharam?! Sem eles, a minha geometria não se sustenta.',
      playerHit: [
        'A demonstração fecha — e a pedra estala.',
        'Uma reta no ponto certo: o Colosso recua.',
        'Lascas de pedra clara voam das torres.',
        'Q.E.D.: o golpe acerta em cheio.',
      ],
      bossHit: [
        'O Colosso reajusta o vértice: a rachadura se fecha um pouco.',
        'Um ângulo mal medido — e a pedra se realinha.',
        'Ele traça uma perpendicular no chão. Revise a resolução e siga.',
      ],
      defeat: 'Q.E.D. As Torres são suas, Cartógrafo — com demonstração e tudo.',
      retreat: 'Volte quando seus ângulos estiverem em ordem. Eu não me movo.',
    },
    rewards: {
      firstXp: 300,
      firstInk: 120,
      firstItems: ['frame-torres', 'title-geometra'],
      flawlessItem: 'core-euclides',
      repeatXp: 60,
    },
  },
  {
    id: 'arquiteto-dos-solidos',
    name: 'Arquiteto dos Sólidos',
    epithet: 'Guardião das Cavernas Volumétricas',
    regionId: 'cavernas-volumetricas',
    art: 'arquiteto',
    accent: '#9B87FF',
    topics: ['geo-espacial'],
    subtopics: [],
    maxHp: 320,
    resolve: 3,
    damage: { 1: 20, 2: 28, 3: 38, 4: 50 },
    startTarget: 2,
    targetStep: 0.25,
    trait: {
      kind: 'concrete',
      name: 'Concreto Fresco',
      description:
        'Cada erro faz o Arquiteto despejar uma camada de concreto (até 3). Cada camada tira 20% do dano dos seus golpes. Os acertos sozinhos não a removem: é preciso a Técnica — três acertos seguidos — para quebrar todo o concreto de uma vez, com golpe cheio. Com a vida abaixo de 50%, o concreto racha e para de se formar.',
      breaksAtHpRatio: 0.5,
      maxLayers: 3,
      layerPenalty: 0.2,
    },
    technique: {
      name: 'Prumo e Esquadro',
      every: 3,
      bonus: 28,
      line: 'Três acertos seguidos! Prumo e Esquadro partem o concreto de cima a baixo.',
    },
    lines: {
      intro: [
        'Todo espaço tem um volume, e todo volume tem um dono.',
        'Cada erro seu é mais uma camada de concreto na minha obra.',
        'Acerte três seguidos e eu desabo — ou fique soterrado em planta baixa.',
      ],
      phase2: 'O concreto rachou?! Que obra mal calculada… a minha.',
      playerHit: [
        'O golpe entra pelo prumo: o concreto estala.',
        'Pó de pedra enche a galeria.',
        'Uma coluna do Arquiteto cede.',
        'Volume exato, dano exato.',
      ],
      bossHit: [
        'O Arquiteto despeja mais uma camada de concreto.',
        'Massa fresca escorre pela parede: seus golpes pesam menos.',
        'Mais concreto, menos dano. Três acertos seguidos quebram tudo.',
      ],
      defeat: 'A obra desabou — e o espaço, enfim, está livre. As Cavernas são suas.',
      retreat: 'Volte com as fórmulas na ponta do lápis. A obra espera.',
    },
    rewards: {
      firstXp: 350,
      firstInk: 140,
      firstItems: ['frame-geodo', 'title-volumetra'],
      flawlessItem: 'core-poliedro',
      repeatXp: 70,
    },
  },
  {
    id: 'leviata-dos-graficos',
    name: 'Leviatã dos Gráficos',
    epithet: 'Guardião do Observatório dos Dados',
    regionId: 'observatorio-dados',
    art: 'leviata',
    accent: '#38D6B0',
    topics: ['graficos', 'estatistica'],
    subtopics: [],
    maxHp: 380,
    resolve: 3,
    damage: { 1: 20, 2: 28, 3: 38, 4: 50 },
    startTarget: 2,
    targetStep: 0.25,
    trait: {
      kind: 'scales',
      name: 'Escamas de Dados',
      description:
        'Quatro escamas cobrem o Leviatã. Enquanto houver escama, seus golpes causam 30% menos dano. Cada acerto arranca uma escama (a Técnica arranca duas), e cada erro faz duas crescerem de volta. Sem nenhuma escama, o Leviatã fica exposto: +50% de dano.',
      breaksAtHpRatio: 0,
      maxScales: 4,
      regrow: 2,
      scaledMultiplier: 0.7,
      exposedMultiplier: 1.5,
    },
    technique: {
      name: 'Gráfico Desenhado',
      every: 3,
      bonus: 30,
      line: 'Três acertos seguidos! O Gráfico Desenhado arranca duas escamas de uma só vez.',
    },
    lines: {
      intro: [
        'Gráficos mentem quando ninguém os lê com cuidado.',
        'Cubro-me de escamas de dados: cada eixo é um escudo.',
        'Arranque todas — lendo bem cada número — e eu ficarei sem esconderijo.',
      ],
      phase2: 'Sem escamas?! Nenhum eixo me protege de quem sabe ler os números.',
      playerHit: [
        'A leitura fecha — e uma escama salta da pele do Leviatã.',
        'Barras desabam, linhas se partem: o golpe acerta.',
        'O Leviatã ruge, e um setor do seu corpo se desfaz.',
        'Dados limpos, golpe limpo.',
      ],
      bossHit: [
        'As escamas crescem de volta: o Leviatã se recompõe.',
        'Um eixo mal lido — e duas escamas voltam ao lugar.',
        'O Leviatã sorri entre as marés de dados. Revise a resolução e siga.',
      ],
      defeat: 'Os números falaram, Cartógrafo. O Observatório é seu — leitura correta e tudo.',
      retreat: 'Volte quando souber ler as escalas. Os dados esperam.',
    },
    rewards: {
      firstXp: 400,
      firstInk: 160,
      firstItems: ['frame-observatorio', 'title-analista'],
      flawlessItem: 'core-histograma',
      repeatXp: 80,
    },
  },
  {
    id: 'esfinge-do-acaso',
    name: 'Esfinge do Acaso',
    epithet: 'Guardiã do Labirinto do Acaso',
    regionId: 'labirinto-acaso',
    art: 'esfinge',
    accent: '#FF8FD1',
    topics: ['combinatoria', 'probabilidade'],
    subtopics: [],
    maxHp: 440,
    resolve: 3,
    damage: { 1: 20, 2: 28, 3: 38, 4: 50 },
    startTarget: 2,
    targetStep: 0.25,
    trait: {
      kind: 'riddle',
      name: 'Enigma da Esfinge',
      description:
        'A cada 4 golpes a Esfinge propõe um Enigma: uma questão um nível mais difícil. Decifrá-lo vale 50% a mais de dano — mas um erro nele custa 2 pontos de Determinação, em vez de 1. Com a vida abaixo de 50%, ela perde a paciência e os Enigmas passam a vir a cada 3 golpes.',
      breaksAtHpRatio: 0.5,
      every: 4,
      phase2Every: 3,
      damageMultiplier: 1.5,
      missResolve: 2,
      solvedLine: 'Enigma decifrado! A Esfinge recua um passo, e o golpe vale mais.',
      failedLine: 'O Enigma não perdoa: dois pontos de Determinação se foram.',
    },
    technique: {
      name: 'Sorte Calculada',
      every: 3,
      bonus: 32,
      line: 'Três acertos seguidos! A Sorte Calculada vira o jogo — e não foi sorte.',
    },
    lines: {
      intro: [
        'Tudo o que pode acontecer, acontece. Quantas vezes? Conte.',
        'A cada quatro passos eu faço uma pergunta: acerte e eu tremo; erre e você paga caro.',
        'Mostre que sabe contar as possibilidades — e medir as chances.',
      ],
      phase2: 'Perdi a paciência! Agora os Enigmas virão mais depressa.',
      playerHit: [
        'O caminho se abre: a conta fechou.',
        'A areia do labirinto estremece.',
        'Casos favoráveis, casos possíveis: o golpe acerta.',
        'Uma possibilidade a menos para a Esfinge.',
      ],
      bossHit: [
        'A Esfinge sorri: o acaso favorece quem não o calcula.',
        'Um caso esquecido — e o labirinto se fecha um pouco.',
        'Ela baralha as possibilidades. Revise a resolução e siga.',
      ],
      defeat: 'Você contou todos os caminhos, Cartógrafo. O Labirinto é seu — e nada foi por acaso.',
      retreat: 'Volte quando souber contar. O acaso espera.',
    },
    rewards: {
      firstXp: 450,
      firstInk: 180,
      firstItems: ['frame-labirinto', 'title-mestre-acaso'],
      flawlessItem: 'core-dado',
      repeatXp: 90,
    },
  },
  {
    id: 'hidra-das-funcoes',
    name: 'Hidra das Funções',
    epithet: 'Guardiã da Cordilheira das Funções',
    regionId: 'cordilheira-funcoes',
    art: 'hidra',
    accent: '#FF8A55',
    topics: ['funcoes', 'equacoes'],
    subtopics: [],
    maxHp: 460,
    resolve: 3,
    damage: { 1: 20, 2: 28, 3: 38, 4: 50 },
    startTarget: 2,
    targetStep: 0.25,
    trait: {
      kind: 'hydra',
      name: 'Cabeças que Renascem',
      description:
        'Cada erro faz nascer uma cabeça nova (até 3). A cada golpe, cada cabeça nova faz a Hidra regenerar 12 de vida. A Técnica — três acertos seguidos — cauteriza uma cabeça. Com a vida abaixo de 40%, os pescoços secam: as cabeças somem e a regeneração acaba.',
      breaksAtHpRatio: 0.4,
      maxHeads: 3,
      regenPerHead: 12,
    },
    technique: {
      name: 'Derivada Certeira',
      every: 3,
      bonus: 34,
      line: 'Três acertos seguidos! A Derivada Certeira corta um pescoço e cauteriza a ferida.',
    },
    lines: {
      intro: [
        'Corte uma cabeça, e duas voltam. Já aprendeu a fazer esse gráfico?',
        'Cada erro seu faz nascer uma cabeça nova — e cada cabeça me cura.',
        'Acerte três seguidos para cauterizar o pescoço. Do contrário, eu me refaço.',
      ],
      phase2: 'Meus pescoços secaram?! Nenhuma curva me sustenta mais.',
      playerHit: [
        'A função fecha — e um pescoço da Hidra tomba.',
        'O gráfico acerta o ponto: a Hidra rosna.',
        'A rocha treme sob o peso da Hidra.',
        'Raiz encontrada, golpe certeiro.',
      ],
      bossHit: [
        'Uma cabeça nova brota do pescoço ferido.',
        'A Hidra sorri com todas as cabeças — e se cura.',
        'O erro alimenta a Hidra. Revise a resolução e siga.',
      ],
      defeat: 'A última cabeça tombou, Cartógrafo. A Cordilheira é sua — função por função.',
      retreat: 'Volte quando souber traçar cada curva. A Hidra espera.',
    },
    rewards: {
      firstXp: 500,
      firstInk: 200,
      firstItems: ['frame-cordilheira', 'title-domador-curvas'],
      flawlessItem: 'core-curvas',
      repeatXp: 100,
    },
  },
];

const BY_ID = new Map(BOSSES.map((b) => [b.id, b]));

export function getBoss(id: string): BossDef {
  const b = BY_ID.get(id);
  if (!b) throw new Error(`Chefão desconhecido: ${id}`);
  return b;
}
