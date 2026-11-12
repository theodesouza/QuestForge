/**
 * Gravidade (espaço novo, 18): como o Áster dobra o espaço ao redor.
 * Desenhos em src/ui/vfx/lenses.tsx (`visual.fx`).
 */
import { feat, level, piece, shop, type AsterItem } from './source';

const lens = (...a: Parameters<typeof piece> extends [unknown, ...infer R] ? R : never) => piece('lens', ...a);

export const ASTER_LENSES: AsterItem[] = [
  // ——— comuns ———
  lens('lens-halo', 'Halo de Lente', 'comum', 'halo-lente', ['#7FB6FF'], 'A luz de trás, dobrada em dois arcos em volta do corpo.', shop(55)),
  lens('lens-ondas', 'Ondulações', 'comum', 'ondas', ['#38D6B0'], 'Anéis que saem do corpo e se desfazem, como numa água parada.', shop(75)),
  lens('lens-grade', 'Malha Plana', 'comum', 'grade', ['#9AA3C7'], 'Uma grade sob o corpo: o espaço, antes de ser dobrado.', level(4)),
  lens('lens-sombra', 'Penumbra', 'comum', 'sombra', ['#9B87FF'], 'Uma sombra larga em volta do corpo, com uma borda de luz.', shop(90)),

  // ——— incomuns ———
  lens('lens-poco', 'Poço Gravitacional', 'incomum', 'poco', ['#7FB6FF', '#DCE3FF'], 'A malha afunda perto do corpo: quanto mais perto, mais apertada.', level(12)),
  lens('lens-anel-einstein', 'Anel de Einstein', 'incomum', 'anel-einstein', ['#FFD36B', '#F4ECDC'], 'Alinhamento perfeito: a luz de trás vira um anel inteiro, com quatro imagens.', shop(195)),
  lens('lens-mare', 'Bojo de Maré', 'incomum', 'mare-lente', ['#38D6B0', '#7FB6FF'], 'O espaço se estica num eixo e se aperta no outro, alternando.', shop(160)),
  lens('lens-kepler', 'Órbitas de Kepler', 'incomum', 'orbitas-kepler', ['#F2B54A', '#FF8FD1'], 'Três elipses com o corpo num dos focos. Áreas iguais em tempos iguais.', feat('region:vale-proporcoes')),
  lens('lens-cisalhamento', 'Cisalhamento', 'incomum', 'cisalhamento', ['#9B87FF'], 'Pequenos arcos tangentes, todos alinhados: a marca de uma lente fraca.', feat('sessions:30')),

  // ——— raros ———
  lens('lens-ondas-g', 'Ondas Gravitacionais', 'raro', 'ondas-g', ['#FF8FD1', '#7FB6FF'], 'Braços em espiral que se abrem no plano: o espaço tremendo.', level(27)),
  lens('lens-lagrange', 'Pontos de Lagrange', 'raro', 'lagrange', ['#38D6B0', '#FFD36B'], 'Cinco lugares onde as forças se equilibram, e as curvas de nível em volta.', feat('region:mercado-ambar')),
  lens('lens-arrasto', 'Arrasto de Referenciais', 'raro', 'arrasto', ['#7FB6FF', '#F2B54A'], 'O corpo gira e arrasta a malha junto: os raios viram espirais.', feat('bosses:3')),
  lens('lens-cone-luz', 'Cone de Luz', 'raro', 'cone-luz', ['#FFD36B', '#9B87FF'], 'Passado embaixo, futuro em cima. Tudo o que pode tocar o corpo cabe nessa ampulheta.', feat('time:12h')),

  // ——— épicos ———
  lens('lens-dobra', 'Bolha de Dobra', 'epico', 'dobra', ['#7FB6FF', '#38D6B0'], 'O espaço se aperta na frente e se estica atrás. O corpo não se move: o espaço é que passa.', level(39)),
  lens('lens-caustica', 'Cáusticas', 'epico', 'caustica', ['#FFD36B', '#FF8FD1'], 'Onde a luz dobrada se junta: uma curva de quatro pontas que respira.', feat('accuracy:90')),
  lens('lens-tempo', 'Dilatação do Tempo', 'epico', 'tempo', ['#F2B54A', '#DCE3FF'], 'Três anéis de marcas. Quanto mais perto do corpo, mais devagar o relógio anda.', feat('daily:100')),

  // ——— lendários ———
  lens('lens-tecido', 'Tecido do Espaço-Tempo', 'lendario', 'tecido', ['#7FB6FF', '#FF8FD1'], 'A malha inteira, viva: afunda, gira, ondula e arrasta as estrelas com ela.', feat('seals:20')),
  lens('lens-multiverso', 'Lente do Multiverso', 'lendario', 'multiverso', ['#9B87FF', '#38D6B0'], 'Cada anel é o mesmo céu visto de outro lugar. Ecos girando uns contra os outros.', feat('answers:2500')),
];
