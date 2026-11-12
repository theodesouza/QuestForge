/**
 * Rastros (espaço novo, 25): a matéria em movimento em volta do Áster. O que muda de um para o
 * outro é o movimento. Desenhos em src/ui/vfx/trails.tsx (`visual.fx`).
 */
import { feat, level, piece, shop, type AsterItem } from './source';

const trail = (...a: Parameters<typeof piece> extends [unknown, ...infer R] ? R : never) => piece('trail', ...a);

export const ASTER_TRAILS: AsterItem[] = [
  // ——— comuns ———
  trail('trail-poeira', 'Poeira Estelar', 'comum', 'poeira', ['#DCE3FF'], 'Grãos parados que acendem e apagam devagar.', shop(40)),
  trail('trail-orbital', 'Rastro Orbital', 'comum', 'orbital', ['#F2B54A'], 'Três grãos em órbita, cada um com uma cauda curta.', shop(65)),
  trail('trail-brasas', 'Brasas Ascendentes', 'comum', 'brasas-rastro', ['#FF8A3C', '#FFE08A'], 'Sobem de baixo do corpo, ondulando.', level(6)),
  trail('trail-neve', 'Neve Cósmica', 'comum', 'neve-rastro', ['#BFE9FF'], 'Cai devagar, sem vento.', shop(70)),
  trail('trail-vento', 'Vento Solar', 'comum', 'vento', ['#FFD36B'], 'Partículas atravessam o céu de um lado ao outro, em linha reta.', shop(85)),
  trail('trail-bolhas', 'Bolhas', 'comum', 'bolhas', ['#7FB6FF'], 'Esferas grandes e quase transparentes, subindo.', feat('answers:50')),
  trail('trail-fagulhas', 'Fagulhas', 'comum', 'fagulhas', ['#FF6A55', '#FFE08A'], 'Saltam do corpo para fora, como de uma pedra de amolar.', shop(95)),

  // ——— incomuns ———
  trail('trail-cauda', 'Cauda de Cometa', 'incomum', 'cauda', ['#9BD8FF'], 'Duas pontas de luz com caudas longas, em órbitas cruzadas.', shop(155)),
  trail('trail-espiral', 'Espiral de Acreção', 'incomum', 'espiral', ['#FF9F43', '#B3243F'], 'Caem em espiral, cada vez mais rápido, até sumir no corpo.', level(14)),
  trail('trail-chuva', 'Chuva de Meteoros', 'incomum', 'chuva', ['#FFD36B'], 'Riscos diagonais, com cauda.', shop(175)),
  trail('trail-fonte', 'Fonte de Luz', 'incomum', 'fonte', ['#38D6B0', '#DCE3FF'], 'Jorra para cima e cai em arco dos dois lados.', feat('correct:100')),
  trail('trail-petalas', 'Pétalas ao Vento', 'incomum', 'petalas-rastro', ['#FF8FD1', '#FFD6EC'], 'Caem girando, levadas de lado.', shop(140)),
  trail('trail-pulso', 'Pulso', 'incomum', 'pulso', ['#9B87FF'], 'A cada batida, um anel de luz e uma leva de faíscas.', feat('answers:300')),
  trail('trail-enxame', 'Enxame Errante', 'incomum', 'enxame', ['#5FD38D', '#FFD36B'], 'Pontos que vagam cada um na sua órbita, sem ordem.', feat('echoes:25')),

  // ——— raros ———
  trail('trail-helice', 'Hélice Dupla', 'raro', 'helice', ['#38D6B0', '#FF8FD1'], 'Duas fitas enroladas, subindo de um polo e descendo do outro.', feat('stages:30')),
  trail('trail-atomo', 'Órbitas Cruzadas', 'raro', 'atomo', ['#7FB6FF'], 'Três planos, três elétrons: o desenho de um átomo.', level(22)),
  trail('trail-lemniscata', 'Trilha do Infinito', 'raro', 'lemniscata', ['#9B87FF', '#38D6B0'], 'Percorre um oito deitado, cruzando o corpo no meio.', feat('answers:750')),
  trail('trail-cascata', 'Cascata', 'raro', 'cascata', ['#7FB6FF'], 'Desce pelos dois lados do corpo e vira névoa embaixo.', feat('region:ilhas-medida')),
  trail('trail-mare-poeira', 'Maré de Poeira', 'raro', 'mare-poeira', ['#C9D1F0', '#F2B54A'], 'Dois cinturões de grãos girando em sentidos opostos.', feat('sessions:75')),
  trail('trail-raios-cosmicos', 'Raios Cósmicos', 'raro', 'raios-cosmicos', ['#FF8FD1'], 'Vêm de longe, em linha reta, e estalam ao bater no corpo.', level(32)),

  // ——— épicos ———
  trail('trail-vortice', 'Vórtice', 'epico', 'vortice', ['#9B87FF', '#FF8FD1'], 'Três braços de grãos caindo em espiral: uma galáxia em miniatura.', feat('stars3:20')),
  trail('trail-aurora', 'Fitas de Aurora', 'epico', 'aurora-rastro', ['#38D6B0', '#9B87FF'], 'Cortinas de luz presas aos polos, balançando.', level(43)),
  trail('trail-tempestade-ion', 'Tempestade de Íons', 'epico', 'tempestade-ion', ['#7FB6FF', '#9B87FF'], 'Faíscas em órbita rápida e descargas que saltam entre elas.', feat('echoes:75')),

  // ——— lendários ———
  trail('trail-via-lactea', 'Via Láctea', 'lendario', 'via-lactea', ['#9B87FF', '#FF8FD1'], 'Uma faixa densa de estrelas num plano inclinado, com braços que giram.', feat('time:48h')),
  trail('trail-big-bang', 'Eco do Big Bang', 'lendario', 'big-bang', ['#FFD36B', '#FF7AB8'], 'Tudo cai para um ponto, e do ponto tudo volta a sair. De novo, e de novo.', feat('correct:2000')),
];
