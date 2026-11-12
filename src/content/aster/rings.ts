/**
 * Anéis novos do Áster (31): discos e estruturas num plano inclinado, que passam por trás e pela
 * frente do corpo. O desenho de cada um está em src/ui/vfx/rings2.tsx (`visual.fx`).
 */
import { feat, level, piece, shop, type AsterItem } from './source';

const ring = (...a: Parameters<typeof piece> extends [unknown, ...infer R] ? R : never) => piece('frame', ...a);

export const ASTER_RINGS: AsterItem[] = [
  // ——— comuns ———
  ring('frame-faixa', 'Anel de Poeira', 'comum', 'faixa', ['#C9D1F0', '#9AA3C7'], 'Uma faixa larga e macia, girando devagar. Todo sistema começa assim.', shop(50)),
  ring('frame-fio', 'Fio de Prata', 'comum', 'fio', ['#DCE3FF'], 'Um arame de luz, quase nada. Uma conta corre por ele.', shop(40)),
  ring('frame-gelo-anel', 'Anel de Gelo', 'comum', 'gelo-anel', ['#BFE9FF', '#7FB6FF'], 'Faixa pálida, cheia de cristais que cintilam ao girar.', shop(80)),
  ring('frame-tracejado', 'Órbita Tracejada', 'comum', 'tracejado', ['#F2B54A', '#F4ECDC'], 'A linha de um diagrama: a trajetória, desenhada antes de ser percorrida.', feat('answers:150')),
  ring('frame-duplo', 'Par de Anéis', 'comum', 'duplo', ['#38D6B0', '#7FB6FF'], 'Dois aros finos, um dentro do outro, girando em sentidos opostos.', shop(95)),
  ring('frame-pedras', 'Cinturão de Pedras', 'comum', 'pedras', ['#C98A5B', '#6C7499'], 'Nada de faixa: só rochas, cada uma na sua órbita.', feat('time:1h')),
  ring('frame-brasa-anel', 'Anel de Brasas', 'comum', 'brasa-anel', ['#FF8A3C', '#FFE08A'], 'Uma faixa morna de onde sobem fagulhas.', shop(105)),

  // ——— incomuns ———
  ring('frame-saturno', 'Anéis de Saturno', 'incomum', 'saturno', ['#E8C98A', '#C98A5B'], 'Três faixas de tons diferentes, com a divisão escura no meio.', level(17)),
  ring('frame-pastor', 'Anel Trançado', 'incomum', 'pastor', ['#9B87FF', '#DCE3FF'], 'Dois fios que se cruzam sem se tocar, guiados por uma lua pastora.', shop(165)),
  ring('frame-raias-anel', 'Anel de Raias', 'incomum', 'raias-anel', ['#7FB6FF'], 'Uma faixa lisa cortada por sombras radiais, que giram mais devagar que ela.', shop(140)),
  ring('frame-estacao', 'Anel-Estação', 'incomum', 'estacao', ['#9AA3C7', '#FFD36B'], 'Módulos ligados por corredores. As janelas acendem em sequência.', feat('sessions:30')),
  ring('frame-engrenagem', 'Anel de Engrenagem', 'incomum', 'engrenagem', ['#C98A5B', '#F2B54A'], 'Dentes de máquina. Uma roda menor gira ao contrário por dentro.', feat('shop:5')),
  ring('frame-polar-anel', 'Anel Polar', 'incomum', 'polar-anel', ['#38D6B0', '#DCE3FF'], 'Passa por cima dos polos, quase de pé.', shop(190)),
  ring('frame-corrente-orbital', 'Corrente de Elos', 'incomum', 'corrente-orbital', ['#9AA3C7', '#F2B54A'], 'Elos fechados, um dentro do outro, dando a volta inteira.', feat('daily:7')),
  ring('frame-luzes', 'Anel de Lanternas', 'incomum', 'luzes', ['#FFD36B', '#FF8FD1'], 'Doze luzes presas a um fio, como lanternas numa festa.', shop(220)),

  // ——— raros ———
  ring('frame-acrecao', 'Disco de Acreção', 'raro', 'acrecao', ['#FF9F43', '#B3243F'], 'Matéria caindo em espiral: branca por dentro, vermelha por fora.', level(23)),
  ring('frame-giroscopio', 'Giroscópio', 'raro', 'giroscopio', ['#F2B54A', '#38D6B0'], 'Dois aros em planos cruzados; cada um gira no próprio eixo.', feat('missions:9')),
  ring('frame-partido', 'Anel Partido', 'raro', 'partido', ['#FF6A55', '#DCE3FF'], 'Algo o quebrou. Restam arcos, e os estilhaços ainda se espalham pela falha.', feat('bosswins:5')),
  ring('frame-portal', 'Anel-Portal', 'raro', 'portal', ['#7FB6FF', '#FFD36B'], 'Nove travas em volta. Acendem em ordem, como quem disca um endereço.', feat('region:labirinto-acaso')),
  ring('frame-pi', 'Anel de π', 'raro', 'pi', ['#38D6B0', '#F4ECDC'], 'As casas decimais gravadas em volta, sem nunca repetir.', feat('region:torres-euclidianas')),
  ring('frame-fibonacci', 'Anel de Fibonacci', 'raro', 'fibonacci', ['#F2B54A', '#5FD38D'], 'Arcos de comprimento 1, 1, 2, 3, 5, 8, 13: cada um é a soma dos dois anteriores.', feat('region:cordilheira-funcoes')),
  ring('frame-cristais', 'Coroa de Cristais', 'raro', 'cristais', ['#9B87FF', '#BFE9FF'], 'Oito cristais de pé, em órbita. Giram sem deitar.', level(26)),
  ring('frame-velas', 'Velas Solares', 'raro', 'velas', ['#FFD36B', '#F4ECDC'], 'Seis velas espelhadas presas a um aro, viradas para a luz.', feat('correct:400')),

  // ——— épicos ———
  ring('frame-armilar3', 'Esfera Armilar Viva', 'epico', 'armilar3', ['#F2B54A', '#9B87FF'], 'Três aros em três planos, com contas de luz correndo em cada um.', feat('stars3:12')),
  ring('frame-dyson-anel', 'Enxame de Dyson', 'epico', 'dyson-anel', ['#FFD36B', '#38D6B0'], 'Milhares de painéis em formação. A luz do corpo vaza entre eles.', feat('stages:60')),
  ring('frame-mobius', 'Fita de Möbius', 'epico', 'mobius', ['#FF8FD1', '#7FB6FF'], 'Uma fita com um lado só: dê a volta e você estará do outro lado sem ter cruzado nada.', level(36)),
  ring('frame-mare-anel', 'Anel de Marés', 'epico', 'mare-anel', ['#38D6B0', '#7FB6FF'], 'Não é rígido: estica, encolhe e solta ondas pelo plano.', feat('region:ilhas-medida')),
  ring('frame-relogio', 'Anel do Relógio', 'epico', 'relogio', ['#F2B54A', '#F4ECDC'], 'Doze marcas e dois ponteiros, um veloz e um lento. O tempo, visto de lado.', feat('time:24h')),

  // ——— lendários ———
  ring('frame-horizonte', 'Anel do Horizonte', 'lendario', 'horizonte', ['#FF9F43', '#FF5C7A'], 'Um disco incandescente que solta ondas de choque. Nada do que o cruza volta igual.', feat('flawless:5')),
  ring('frame-infinito', 'Laço do Infinito', 'lendario', 'infinito', ['#9B87FF', '#38D6B0'], 'Não é um anel: é um oito deitado, e a luz o percorre sem começo nem fim.', feat('answers:4000')),
  ring('frame-zodiaco', 'Roda das Constelações', 'lendario', 'zodiaco', ['#F2B54A', '#DCE3FF'], 'Doze casas em volta. Em cada uma, um punhado de estrelas ligadas por fios de luz.', level(50)),
];
