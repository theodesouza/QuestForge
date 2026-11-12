/**
 * Ignições (espaço novo, 14): como o Áster se acende ao trocar de peça, ao toque e ao ganhar XP.
 * Desenhos em src/ui/vfx/ignitions.tsx (`visual.fx`).
 */
import { feat, level, piece, shop, type AsterItem } from './source';

const ign = (...a: Parameters<typeof piece> extends [unknown, ...infer R] ? R : never) => piece('ignition', ...a);

export const ASTER_IGNITIONS: AsterItem[] = [
  // ——— comuns ———
  ign('ignition-faisca', 'Faísca', 'comum', 'faisca', ['#F2B54A'], 'Um clarão e um anel: o gesto mais simples de acender.', shop(50)),
  ign('ignition-ondas', 'Onda Tripla', 'comum', 'ondas-ign', ['#38D6B0'], 'Três anéis, um atrás do outro.', shop(80)),
  ign('ignition-piscar', 'Piscar', 'comum', 'piscar', ['#7FB6FF'], 'A luz cresce por dentro e volta, sem estardalhaço.', level(5)),

  // ——— incomuns ———
  ign('ignition-colapso', 'Colapso', 'incomum', 'colapso', ['#9B87FF'], 'Um anel largo se fecha sobre o corpo. No instante em que toca, o clarão.', shop(180)),
  ign('ignition-raios', 'Raiar', 'incomum', 'raios-ign', ['#FFD36B'], 'Raios saem do corpo girando, como o sol atrás de uma nuvem.', level(15)),
  ign('ignition-estilhacos', 'Estilhaços', 'incomum', 'estilhacos', ['#FF6A55', '#FFE08A'], 'O brilho se parte em lascas que voam para todos os lados.', feat('bosswins:5')),
  ign('ignition-espiral', 'Redemoinho', 'incomum', 'espiral-ign', ['#38D6B0', '#7FB6FF'], 'Dois braços em espiral se enrolam para dentro e se soltam.', shop(215)),

  // ——— raros ———
  ign('ignition-portal', 'Abertura de Portal', 'raro', 'portal-ign', ['#7FB6FF', '#FFD36B'], 'Um aro de travas gira, as travas se soltam e o vão se abre num clarão.', feat('missions:18')),
  ign('ignition-cristalizar', 'Cristalização', 'raro', 'cristalizar', ['#BFE9FF', '#9B87FF'], 'Hexágonos se fecham em volta do corpo, um dentro do outro, até encaixar.', level(28)),
  ign('ignition-constelar', 'Constelar', 'raro', 'constelar', ['#F2B54A', '#DCE3FF'], 'Sete estrelas acendem em volta e um fio de luz as liga, uma a uma.', feat('starsum:15')),

  // ——— épicos ———
  ign('ignition-supernova', 'Supernova', 'epico', 'supernova-ign', ['#FF8FD1', '#FFD36B'], 'O clarão, duas cascas que se afastam e os destroços.', feat('flawless:1')),
  ign('ignition-dobra', 'Salto de Dobra', 'epico', 'dobra-ign', ['#7FB6FF', '#38D6B0'], 'As estrelas viram riscos, tudo converge e o corpo "chega" num estalo.', level(44)),

  // ——— lendários ———
  ign('ignition-big-bang', 'Big Bang', 'lendario', 'big-bang-ign', ['#FFD36B', '#FF7AB8'], 'Tudo cai num ponto. Silêncio. E então o ponto vira tudo.', feat('sessions:150')),
  ign('ignition-eclipse', 'Eclipse Total', 'lendario', 'eclipse-ign', ['#F4ECDC', '#FFD36B'], 'Uma sombra passa na frente. Por um instante só a coroa aparece — e então o anel de diamante.', feat('stages:120')),
];
