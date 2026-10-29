/**
 * Catálogo de cosméticos do Astrolábio. Itens são puramente visuais e nunca
 * vendidos por dinheiro real. Raros e lendários vêm de feitos, nunca de sorte.
 */

import { MORE_ITEMS } from './cosmetics';

export type ItemSlot = 'frame' | 'core' | 'aura' | 'scene' | 'title';
export type Rarity = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario';
/** Hierarquia visual: quanto maior, mais camadas, movimento e presença o efeito tem. */
export const RARITY_TIER: Record<Rarity, 0 | 1 | 2 | 3 | 4> = { comum: 0, incomum: 1, raro: 2, epico: 3, lendario: 4 };

export const RARITY_LABEL: Record<Rarity, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
};

/**
 * Elemento de núcleos e auras. Núcleo e aura do mesmo elemento entram em
 * Ressonância (efeito combinado); dois lendários juntos despertam a Forma Mítica.
 */
export type FxElement = 'cristal' | 'fogo' | 'mare' | 'lunar' | 'tempestade' | 'astral' | 'aureo' | 'natureza';
export const ELEMENT_LABEL: Record<FxElement, string> = {
  cristal: 'Cristal',
  fogo: 'Fogo',
  mare: 'Maré',
  lunar: 'Lunar',
  tempestade: 'Tempestade',
  astral: 'Astral',
  aureo: 'Áureo',
  natureza: 'Natureza',
};

export const SLOT_LABEL: Record<ItemSlot, string> = {
  frame: 'Moldura',
  core: 'Núcleo',
  aura: 'Aura',
  scene: 'Cenário',
  title: 'Título',
};

/** Ordem em que os espaços aparecem nas telas (Herói e Oficina). */
export const SLOT_ORDER: readonly ItemSlot[] = ['frame', 'core', 'aura', 'scene', 'title'];
/** Espaços que podem ficar vazios (moldura e núcleo são obrigatórios). */
export const OPTIONAL_SLOTS = ['aura', 'scene', 'title'] as const;
export type OptionalSlot = (typeof OPTIONAL_SLOTS)[number];

/** Estilos de moldura — cada um desenha o anel do astrolábio de um jeito (src/ui/vfx/frames.tsx). */
export const LEGACY_FRAME_STYLES = ['plain', 'double', 'notched', 'armillary', 'segmented'] as const;
export const CUSTOM_FRAME_STYLES = ['beaded', 'chain', 'scalloped', 'rays', 'laurel', 'runic', 'shards', 'polygon', 'cubes', 'axes', 'maze', 'peaks', 'ruler'] as const;
export const FRAME_STYLES = [...LEGACY_FRAME_STYLES, ...CUSTOM_FRAME_STYLES] as const;
export type FrameStyle = (typeof FRAME_STYLES)[number];
export type CustomFrameStyle = (typeof CUSTOM_FRAME_STYLES)[number];

/** Parâmetros visuais interpretados pelo componente Astrolabe. */
export interface ItemVisual {
  /** Cor principal (moldura/núcleo) ou primeira cor da aura. */
  color: string;
  /** Segunda cor (aura em gradiente, brilho do núcleo). */
  color2?: string;
  /** Estilo da moldura. */
  frameStyle?: FrameStyle;
  /** Núcleos e auras: elemento (sinergias). */
  element?: FxElement;
  /** Núcleos, auras e cenários: qual efeito desenha o item (src/ui/vfx). */
  fx?: string;
}

export interface ItemDef {
  id: string;
  slot: ItemSlot;
  name: string;
  rarity: Rarity;
  description: string;
  /** Como se obtém — mostrado na coleção para itens ainda não conquistados. */
  howToGet: string;
  visual: ItemVisual;
  /** Preço em Tinta na Oficina. Só itens comuns e incomuns são vendidos — raros vêm de feitos. */
  price?: number;
}

const BASE_ITEMS: ItemDef[] = [
  // ——— Molduras ———
  {
    id: 'frame-cobre',
    slot: 'frame',
    name: 'Moldura de Cobre',
    rarity: 'comum',
    description: 'O primeiro anel de todo cartógrafo. Simples, firme, confiável.',
    howToGet: 'Equipamento inicial.',
    visual: { color: '#C98A5B', frameStyle: 'plain' },
  },
  {
    id: 'frame-bronze',
    slot: 'frame',
    name: 'Moldura de Bronze',
    rarity: 'comum',
    description: 'Gravada com as primeiras marcas de escala. Prova de que você começou de verdade.',
    howToGet: 'Alcance o nível 2.',
    visual: { color: '#E0A35C', frameStyle: 'double' },
  },
  {
    id: 'frame-latao',
    slot: 'frame',
    name: 'Moldura de Latão Gravado',
    rarity: 'incomum',
    description: 'Cada entalhe marca um conceito que você já conseguiu medir.',
    howToGet: 'Alcance o nível 8.',
    visual: { color: '#F2B54A', frameStyle: 'notched' },
  },
  {
    id: 'frame-basalto',
    slot: 'frame',
    name: 'Moldura de Basalto',
    rarity: 'raro',
    description: 'Talhada da couraça do Golem Proporcional. Pesa como uma regra de três bem montada.',
    howToGet: 'Derrote o Golem Proporcional.',
    visual: { color: '#8C93B8', color2: '#38D6B0', frameStyle: 'notched' },
  },
  {
    id: 'frame-celeste',
    slot: 'frame',
    name: 'Moldura Celeste',
    rarity: 'incomum',
    description: 'Reflete o céu noturno sobre o qual todos os mapas são traçados.',
    howToGet: 'Alcance o nível 16.',
    visual: { color: '#7FB6FF', frameStyle: 'double' },
  },
  {
    id: 'frame-meridiana',
    slot: 'frame',
    name: 'Moldura Meridiana',
    rarity: 'raro',
    description: 'Os meridianos se cruzam aqui. Marca de quem já traçou metade do Atlas.',
    howToGet: 'Alcance o nível 25.',
    visual: { color: '#38D6B0', frameStyle: 'armillary' },
  },
  {
    id: 'frame-armilar',
    slot: 'frame',
    name: 'Esfera Armilar',
    rarity: 'epico',
    description: 'Anéis dentro de anéis: o modelo completo do céu.',
    howToGet: 'Alcance o nível 40.',
    visual: { color: '#9B87FF', color2: '#F2B54A', frameStyle: 'armillary' },
  },
  // ——— Núcleos ———
  {
    id: 'core-quartzo',
    slot: 'core',
    name: 'Núcleo de Quartzo',
    rarity: 'comum',
    description: 'Transparente, à espera de ser preenchido.',
    howToGet: 'Equipamento inicial.',
    visual: { color: '#DCE3FF', color2: '#9AA3C7', element: 'cristal', fx: 'prisma' },
  },
  {
    id: 'core-ambar',
    slot: 'core',
    name: 'Núcleo de Âmbar',
    rarity: 'comum',
    description: 'Guarda o calor das primeiras sessões de estudo.',
    howToGet: 'Alcance o nível 4.',
    visual: { color: '#FFB648', color2: '#FF6A55', element: 'fogo', fx: 'ambar' },
  },
  {
    id: 'core-verdete',
    slot: 'core',
    name: 'Núcleo de Verdete',
    rarity: 'incomum',
    description: 'O verde do bronze antigo: o tempo trabalhando a seu favor.',
    howToGet: 'Alcance o nível 10.',
    visual: { color: '#38D6B0', color2: '#1E8C7A', element: 'mare', fx: 'verdete' },
  },
  {
    id: 'core-iris',
    slot: 'core',
    name: 'Núcleo de Íris',
    rarity: 'incomum',
    description: 'Muda de tom conforme o ângulo, como um problema visto de outro jeito.',
    howToGet: 'Alcance o nível 18.',
    visual: { color: '#9B87FF', color2: '#FF8FD1', element: 'astral', fx: 'iris' },
  },
  {
    id: 'core-solar',
    slot: 'core',
    name: 'Núcleo Solar',
    rarity: 'raro',
    description: 'Brilha com a constância de quem estuda dia após dia.',
    howToGet: 'Alcance o nível 30.',
    visual: { color: '#FFE08A', color2: '#FF9F43', element: 'fogo', fx: 'solar' },
  },
  {
    id: 'core-pulsar',
    slot: 'core',
    name: 'Núcleo Pulsar',
    rarity: 'epico',
    description: 'Pulsa em intervalos exatos, como a repetição espaçada.',
    howToGet: 'Alcance o nível 45.',
    visual: { color: '#7FF3FF', color2: '#9B87FF', element: 'tempestade', fx: 'pulsar' },
  },
  // ——— Auras ———
  {
    id: 'aura-brasa',
    slot: 'aura',
    name: 'Aura de Brasa',
    rarity: 'comum',
    description: 'Uma chama baixa e persistente.',
    howToGet: 'Alcance o nível 6.',
    visual: { color: '#FF6A55', color2: '#F2B54A', element: 'fogo', fx: 'brasa' },
  },
  {
    id: 'aura-mare',
    slot: 'aura',
    name: 'Aura de Maré',
    rarity: 'incomum',
    description: 'Vai e volta, como as revisões que fixam o que você aprendeu.',
    howToGet: 'Alcance o nível 14.',
    visual: { color: '#38D6B0', color2: '#3D7BFF', element: 'mare', fx: 'mare' },
  },
  {
    id: 'aura-aurora',
    slot: 'aura',
    name: 'Aura Boreal',
    rarity: 'raro',
    description: 'Cortinas de luz que só aparecem para quem vai longe.',
    howToGet: 'Alcance o nível 20.',
    visual: { color: '#38D6B0', color2: '#9B87FF', element: 'tempestade', fx: 'boreal' },
  },
  {
    id: 'aura-nebulosa',
    slot: 'aura',
    name: 'Aura Nebulosa',
    rarity: 'epico',
    description: 'Poeira de estrelas em formação.',
    howToGet: 'Alcance o nível 35.',
    visual: { color: '#FF8FD1', color2: '#9B87FF', element: 'astral', fx: 'nebulosa' },
  },
  {
    id: 'aura-aurea',
    slot: 'aura',
    name: 'Proporção Áurea',
    rarity: 'lendario',
    description: 'Concedida a quem derrota o Golem sem errar e sem dicas. Perfeição medida em φ.',
    howToGet: 'Derrote o Golem Proporcional sem erros e sem usar dicas.',
    visual: { color: '#FFD36B', color2: '#FFF3C4', element: 'aureo', fx: 'aurea' },
  },
  {
    id: 'aura-zenite',
    slot: 'aura',
    name: 'Aura do Zênite',
    rarity: 'lendario',
    description: 'O ponto mais alto do céu. Não há mapa acima deste.',
    howToGet: 'Alcance o nível 50.',
    visual: { color: '#FFFFFF', color2: '#F2B54A', element: 'aureo', fx: 'zenite' },
  },
  // ——— Títulos ———
  {
    id: 'title-tracador',
    slot: 'title',
    name: 'Traçador de Rotas',
    rarity: 'comum',
    description: 'Você já sabe por onde começar.',
    howToGet: 'Alcance o nível 3.',
    visual: { color: '#F4ECDC' },
  },
  {
    id: 'title-quebra-golem',
    slot: 'title',
    name: 'Quebra-Golem',
    rarity: 'raro',
    description: 'Proporções não assustam mais você.',
    howToGet: 'Derrote o Golem Proporcional.',
    visual: { color: '#38D6B0' },
  },
  {
    id: 'title-incansavel',
    slot: 'title',
    name: 'Incansável',
    rarity: 'incomum',
    description: 'Doze níveis de dedicação.',
    howToGet: 'Alcance o nível 12.',
    visual: { color: '#F2B54A' },
  },
  {
    id: 'title-mestre',
    slot: 'title',
    name: 'Mestre Cartógrafo',
    rarity: 'raro',
    description: 'Metade do caminho até o Zênite.',
    howToGet: 'Alcance o nível 25.',
    visual: { color: '#9B87FF' },
  },
  {
    id: 'title-arquiteto',
    slot: 'title',
    name: 'Arquiteto do Atlas',
    rarity: 'lendario',
    description: 'Você redesenhou o mundo inteiro.',
    howToGet: 'Alcance o nível 50.',
    visual: { color: '#FFD36B' },
  },
  // ——— Região 2: Mercado de Âmbar ———
  {
    id: 'frame-ambar-cunhado',
    slot: 'frame',
    name: 'Moldura de Âmbar Cunhado',
    rarity: 'raro',
    description: 'Fundida com as moedas do cofre do Mercador. Brilha como conta paga em dia.',
    howToGet: 'Derrote o Mercador Composto.',
    visual: { color: '#FF9F43', color2: '#FFD36B', frameStyle: 'notched' },
  },
  {
    id: 'title-amortizador',
    slot: 'title',
    name: 'Amortizador',
    rarity: 'raro',
    description: 'Juros não assustam quem sabe fazer a conta.',
    howToGet: 'Derrote o Mercador Composto.',
    visual: { color: '#FF9F43' },
  },
  {
    id: 'core-tesouro',
    slot: 'core',
    name: 'Núcleo do Tesouro',
    rarity: 'lendario',
    description: 'O coração do cofre do Mercador, entregue a quem não pagou um centavo de juros.',
    howToGet: 'Derrote o Mercador Composto sem erros e sem usar dicas.',
    visual: { color: '#FFD36B', color2: '#FF9F43', element: 'aureo', fx: 'tesouro' },
  },
  // ——— Região 3: Planícies Numéricas ———
  {
    id: 'frame-tres-arcos',
    slot: 'frame',
    name: 'Moldura dos Três Arcos',
    rarity: 'raro',
    description: 'Um anel em três arcos — 1/2, 1/3 e 1/6 — que juntos fecham o círculo inteiro.',
    howToGet: 'Derrote a Quimera Fracionária.',
    visual: { color: '#5FD38D', color2: '#F2B54A', frameStyle: 'segmented' },
  },
  {
    id: 'title-soma-inteira',
    slot: 'title',
    name: 'Soma Inteira',
    rarity: 'raro',
    description: '1/2 + 1/3 + 1/6 = 1. Nenhuma cabeça sobrou.',
    howToGet: 'Derrote a Quimera Fracionária.',
    visual: { color: '#5FD38D' },
  },
  {
    id: 'core-trindade',
    slot: 'core',
    name: 'Núcleo da Trindade',
    rarity: 'lendario',
    description: 'O coração da Quimera: três gemas — leão, cabra e serpente — que só brilham juntas, em frações exatas.',
    howToGet: 'Derrote a Quimera Fracionária sem erros e sem usar dicas.',
    visual: { color: '#5FD38D', color2: '#F2B54A', element: 'astral', fx: 'trindade' },
  },
  // ——— Região 4: Torres Euclidianas ———
  {
    id: 'frame-torres',
    slot: 'frame',
    name: 'Moldura das Torres',
    rarity: 'raro',
    description: 'Um polígono regular inscrito no círculo, com régua e compasso: cada vértice, uma demonstração.',
    howToGet: 'Derrote o Colosso Euclidiano.',
    visual: { color: '#7FB6FF', color2: '#F2B54A', frameStyle: 'polygon' },
  },
  {
    id: 'title-geometra',
    slot: 'title',
    name: 'Geômetra',
    rarity: 'raro',
    description: 'Mede a torre pela sombra, o triângulo pelo lado e o círculo pelo raio.',
    howToGet: 'Derrote o Colosso Euclidiano.',
    visual: { color: '#7FB6FF' },
  },
  {
    id: 'core-euclides',
    slot: 'core',
    name: 'Núcleo de Euclides',
    rarity: 'lendario',
    description: 'O coração do Colosso: um triângulo 3-4-5 com seus três quadrados, 9 + 16 = 25, ainda sob o compasso.',
    howToGet: 'Derrote o Colosso Euclidiano sem erros e sem usar dicas.',
    visual: { color: '#F2B54A', color2: '#7FB6FF', element: 'astral', fx: 'euclides' },
  },
  // ——— Região 5: Cavernas Volumétricas ———
  {
    id: 'frame-geodo',
    slot: 'frame',
    name: 'Moldura de Geodo',
    rarity: 'raro',
    description: 'Cubos de cristal empilhados em volta do anel, cada um com três faces à vista.',
    howToGet: 'Derrote o Arquiteto dos Sólidos.',
    visual: { color: '#7FF3FF', color2: '#9B87FF', frameStyle: 'cubes' },
  },
  {
    id: 'title-volumetra',
    slot: 'title',
    name: 'Volumetra',
    rarity: 'raro',
    description: 'Enche qualquer sólido de contas — e sabe quanto cabe dentro.',
    howToGet: 'Derrote o Arquiteto dos Sólidos.',
    visual: { color: '#7FF3FF' },
  },
  {
    id: 'core-poliedro',
    slot: 'core',
    name: 'Núcleo do Poliedro',
    rarity: 'lendario',
    description: 'O coração do Arquiteto: sólidos de Platão encaixados uns nos outros, girando sem nunca se tocar.',
    howToGet: 'Derrote o Arquiteto dos Sólidos sem erros e sem usar dicas.',
    visual: { color: '#7FF3FF', color2: '#B79CFF', element: 'lunar', fx: 'poliedro' },
  },
  // ——— Região 6: Observatório dos Dados ———
  {
    id: 'frame-observatorio',
    slot: 'frame',
    name: 'Moldura do Observatório',
    rarity: 'raro',
    description: 'Barras de um histograma em volta do anel e um ponteiro de radar que varre o contorno.',
    howToGet: 'Derrote o Leviatã dos Gráficos.',
    visual: { color: '#38D6B0', color2: '#7FF3FF', frameStyle: 'axes' },
  },
  {
    id: 'title-analista',
    slot: 'title',
    name: 'Analista de Dados',
    rarity: 'raro',
    description: 'Lê o que os números dizem — e o que eles escondem.',
    howToGet: 'Derrote o Leviatã dos Gráficos.',
    visual: { color: '#38D6B0' },
  },
  {
    id: 'core-histograma',
    slot: 'core',
    name: 'Núcleo do Histograma',
    rarity: 'lendario',
    description: 'O coração do Leviatã: barras que sobem e descem, uma linha que as une e uma rosca de setores que gira sem nunca errar a escala.',
    howToGet: 'Derrote o Leviatã dos Gráficos sem erros e sem usar dicas.',
    visual: { color: '#38D6B0', color2: '#7FF3FF', element: 'mare', fx: 'histograma' },
  },
  // ——— Região 7: Labirinto do Acaso ———
  {
    id: 'frame-labirinto',
    slot: 'frame',
    name: 'Moldura do Labirinto',
    rarity: 'raro',
    description: 'Muralhas em greca em volta do anel, com um ponto de luz que percorre o labirinto sem nunca se perder.',
    howToGet: 'Derrote a Esfinge do Acaso.',
    visual: { color: '#FF8FD1', color2: '#FFD36B', frameStyle: 'maze' },
  },
  {
    id: 'title-mestre-acaso',
    slot: 'title',
    name: 'Mestre do Acaso',
    rarity: 'raro',
    description: 'Conta todos os caminhos antes de dar o primeiro passo.',
    howToGet: 'Derrote a Esfinge do Acaso.',
    visual: { color: '#FF8FD1' },
  },
  {
    id: 'core-dado',
    slot: 'core',
    name: 'Núcleo do Dado Perfeito',
    rarity: 'lendario',
    description: 'O coração da Esfinge: um dado de vinte faces que sempre cai onde a conta mandou — e dados menores orbitando em volta, contando as chances.',
    howToGet: 'Derrote a Esfinge do Acaso sem erros e sem usar dicas.',
    visual: { color: '#FFD36B', color2: '#FF8FD1', element: 'tempestade', fx: 'dado' },
  },
  // ——— Região 8: Cordilheira das Funções ———
  {
    id: 'frame-cordilheira',
    slot: 'frame',
    name: 'Moldura da Cordilheira',
    rarity: 'raro',
    description: 'Picos nevados em volta do anel e uma onda de função que corre por dentro, sem nunca cruzar a rocha.',
    howToGet: 'Derrote a Hidra das Funções.',
    visual: { color: '#FF8A55', color2: '#FFF3E0', frameStyle: 'peaks' },
  },
  {
    id: 'title-domador-curvas',
    slot: 'title',
    name: 'Domador de Curvas',
    rarity: 'raro',
    description: 'Retas, parábolas e exponenciais: todas obedecem a quem sabe onde fica o vértice.',
    howToGet: 'Derrote a Hidra das Funções.',
    visual: { color: '#FF8A55' },
  },
  {
    id: 'core-curvas',
    slot: 'core',
    name: 'Núcleo das Curvas',
    rarity: 'lendario',
    description: 'O coração da Hidra: um plano cartesiano em brasa, com uma reta, uma parábola e uma exponencial traçando-se sem parar.',
    howToGet: 'Derrote a Hidra das Funções sem erros e sem usar dicas.',
    visual: { color: '#FF8A55', color2: '#FFD36B', element: 'fogo', fx: 'curvas' },
  },
  // ——— Região 9: Ilhas da Medida ———
  {
    id: 'frame-ilhas',
    slot: 'frame',
    name: 'Moldura das Ilhas',
    rarity: 'raro',
    description: 'Um anel graduado como régua e transferidor, com um marco de navegação que gira na borda.',
    howToGet: 'Derrote o Leviatã das Escalas.',
    visual: { color: '#4C8DFF', color2: '#FFD36B', frameStyle: 'ruler' },
  },
  {
    id: 'title-navegador-escalas',
    slot: 'title',
    name: 'Navegador das Escalas',
    rarity: 'raro',
    description: 'Atravessa quilômetros, minutos e graus sem trocar uma unidade.',
    howToGet: 'Derrote o Leviatã das Escalas.',
    visual: { color: '#4C8DFF' },
  },
  {
    id: 'core-rosa-medidas',
    slot: 'core',
    name: 'Núcleo da Rosa das Medidas',
    rarity: 'lendario',
    description: 'O coração do Leviatã: uma rosa dos ventos de oito pontas, cercada de graduações e de um arco de transferidor que nunca perde o norte.',
    howToGet: 'Derrote o Leviatã das Escalas sem erros e sem usar dicas.',
    visual: { color: '#4C8DFF', color2: '#FFD36B', element: 'lunar', fx: 'rosa' },
  },
  // ——— Encomendas ———
  {
    id: 'title-constante',
    slot: 'title',
    name: 'Constante',
    rarity: 'incomum',
    description: 'Uma semana inteira de encomendas cumpridas. Constância vale mais que pressa.',
    howToGet: 'Cumpra todas as encomendas de uma semana.',
    visual: { color: '#38D6B0' },
  },
  // ——— Oficina (compráveis com Tinta) ———
  {
    id: 'frame-ferro',
    slot: 'frame',
    name: 'Moldura de Ferro Forjado',
    rarity: 'comum',
    description: 'Sólida e sem enfeites, feita na bigorna da Oficina.',
    howToGet: 'Oficina: 60 de Tinta.',
    visual: { color: '#8C93B8', frameStyle: 'plain' },
    price: 60,
  },
  {
    id: 'frame-prata',
    slot: 'frame',
    name: 'Moldura de Prata Lunar',
    rarity: 'incomum',
    description: 'Dois anéis de prata que refletem a lua sobre o mapa.',
    howToGet: 'Oficina: 150 de Tinta.',
    visual: { color: '#DCE3FF', frameStyle: 'double' },
    price: 150,
  },
  {
    id: 'core-rubi',
    slot: 'core',
    name: 'Núcleo de Rubi',
    rarity: 'comum',
    description: 'Vermelho intenso, como a primeira resposta certa depois de um erro.',
    howToGet: 'Oficina: 60 de Tinta.',
    visual: { color: '#FF5C7A', color2: '#B3243F', element: 'fogo', fx: 'rubi' },
    price: 60,
  },
  {
    id: 'core-safira',
    slot: 'core',
    name: 'Núcleo de Safira',
    rarity: 'incomum',
    description: 'Azul profundo, calmo como uma prova bem preparada.',
    howToGet: 'Oficina: 140 de Tinta.',
    visual: { color: '#5C8DFF', color2: '#2A3F9E', element: 'lunar', fx: 'safira' },
    price: 140,
  },
  {
    id: 'aura-nevoa',
    slot: 'aura',
    name: 'Aura de Névoa Domada',
    rarity: 'comum',
    description: 'Um pouco da Névoa, agora a seu serviço.',
    howToGet: 'Oficina: 80 de Tinta.',
    visual: { color: '#9AA3C7', color2: '#DCE3FF', element: 'lunar', fx: 'nevoa' },
    price: 80,
  },
  {
    id: 'aura-lunar',
    slot: 'aura',
    name: 'Aura Lunar',
    rarity: 'incomum',
    description: 'Um halo frio e prateado para as sessões noturnas.',
    howToGet: 'Oficina: 180 de Tinta.',
    visual: { color: '#DCE3FF', color2: '#7FB6FF', element: 'lunar', fx: 'lunar' },
    price: 180,
  },
  {
    id: 'title-viajante',
    slot: 'title',
    name: 'Viajante Noturno',
    rarity: 'comum',
    description: 'Para quem estuda sob as estrelas.',
    howToGet: 'Oficina: 50 de Tinta.',
    visual: { color: '#9AA3C7' },
    price: 50,
  },
  {
    id: 'title-contador',
    slot: 'title',
    name: 'Contador de Estrelas',
    rarity: 'incomum',
    description: 'Nenhum número escapa da sua conta.',
    howToGet: 'Oficina: 120 de Tinta.',
    visual: { color: '#F2B54A' },
    price: 120,
  },
];

/** Catálogo completo: o conjunto original mais as peças de personalização (cosmetics.ts). */
export const ITEMS: ItemDef[] = [...BASE_ITEMS, ...MORE_ITEMS];

const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): ItemDef {
  const item = BY_ID.get(id);
  if (!item) throw new Error(`Item desconhecido: ${id}`);
  return item;
}

/** Itens à venda na Oficina, do mais barato ao mais caro. */
export const SHOP_ITEMS: ItemDef[] = ITEMS.filter((i) => i.price !== undefined).sort(
  (a, b) => (a.price ?? 0) - (b.price ?? 0),
);

export function hasItem(id: string): boolean {
  return BY_ID.has(id);
}

/** Itens com que todo jogador começa (equipados por padrão). */
export const STARTER_ITEMS = ['frame-cobre', 'core-quartzo'] as const;
