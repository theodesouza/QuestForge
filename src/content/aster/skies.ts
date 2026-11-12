/**
 * Ambientes novos (espaço `scene`, 26): céus do espaço profundo, para trás do Áster.
 * Desenhos em src/ui/vfx/skies.tsx (`visual.fx`).
 */
import { feat, level, piece, shop, type AsterItem } from './source';

const sky = (...a: Parameters<typeof piece> extends [unknown, ...infer R] ? R : never) => piece('scene', ...a);

export const ASTER_SKIES: AsterItem[] = [
  // ——— comuns ———
  sky('scene-campo-estelar', 'Campo Estelar', 'comum', 'campo-estelar', ['#BFD6FF'], 'Só estrelas, de três cores, e meia dúzia das brilhantes.', shop(60)),
  sky('scene-crepusculo-orbital', 'Crepúsculo Orbital', 'comum', 'crepusculo-orbital', ['#58B4FF', '#FFE7B0'], 'A curva de um planeta, a linha azul do ar e o sol nascendo na borda.', shop(80)),
  sky('scene-solo-lunar', 'Mar da Tranquilidade', 'comum', 'solo-lunar', ['#8E93A6', '#6FB4FF'], 'Chão cinza de crateras e, no céu preto, um mundo azul.', level(10)),
  sky('scene-nevoa-violeta', 'Névoa Violeta', 'comum', 'nevoa-violeta', ['#B06CFF', '#FF6FB5'], 'Véus de gás lilás e rosa, sem contorno nenhum.', shop(70)),
  sky('scene-chuva-meteoros', 'Chuva de Meteoros', 'comum', 'chuva-meteoros', ['#22306A', '#FFFFFF'], 'Todos os riscos parecem sair do mesmo ponto do céu. É perspectiva.', feat('time:1h')),
  sky('scene-poente-duplo', 'Poente Duplo', 'comum', 'poente-duplo', ['#F0865A', '#FFE9A8'], 'Dois sóis descendo juntos sobre um planalto.', shop(95)),

  // ——— incomuns ———
  sky('scene-via-lactea', 'Via Láctea', 'incomum', 'via-lactea', ['#C9B8FF', '#FFE2C0'], 'A faixa da nossa galáxia cruzando o céu, com as veias escuras de poeira.', shop(190)),
  sky('scene-sob-aneis', 'Sob os Anéis', 'incomum', 'sob-aneis', ['#E8D2A8', '#6E3F4E'], 'O céu de quem mora num planeta de anéis: arcos de horizonte a horizonte.', shop(220)),
  sky('scene-nebulosa-emissao', 'Nebulosa de Emissão', 'incomum', 'nebulosa-emissao', ['#FF4D6D', '#7FE0FF'], 'Hidrogênio aceso em vermelho, com dedos escuros de poeira.', level(20)),
  sky('scene-gigante', 'Gigante no Horizonte', 'incomum', 'gigante-proximo', ['#E8C08A', '#B5703F'], 'Um planeta de faixas ocupando um canto inteiro do céu, com duas luas.', shop(175)),
  sky('scene-estacao', 'Janela da Estação', 'incomum', 'estacao-janela', ['#5A6A94', '#3D8BFF'], 'A moldura de metal de uma escotilha e, do lado de fora, a curva azul.', feat('shop:15')),
  sky('scene-cometa', 'O Grande Cometa', 'incomum', 'cometa-ceu', ['#DFF2FF', '#7FB6FF'], 'Cabeça brilhante, cauda de poeira curva e cauda de íons reta e azul.', feat('answers:300')),
  sky('scene-aurora-planetaria', 'Aurora de Outro Mundo', 'incomum', 'aurora-planetaria', ['#38D6B0', '#7A5CFF'], 'Cortinas verdes e roxas sobre a curva de um planeta, vistas de cima.', shop(205)),

  // ——— raros ———
  sky('scene-galaxia', 'Galáxia Espiral', 'raro', 'galaxia-espiral', ['#9FB8FF', '#FFE7B0'], 'Dois braços, um miolo dourado e uma vizinha vista de perfil.', level(25)),
  sky('scene-aglomerado', 'Aglomerado Globular', 'raro', 'aglomerado', ['#FFE2B8', '#BFD6FF'], 'Cem mil estrelas velhas apertadas numa bola.', feat('collect:50')),
  sky('scene-pilares', 'Pilares da Criação', 'raro', 'pilares', ['#7FE0D0', '#FFB86B'], 'Três colunas de poeira fria, com as pontas acesas pelas estrelas novas.', feat('region:torres-euclidianas')),
  sky('scene-eclipse-total', 'Eclipse Total', 'raro', 'eclipse-total', ['#FFFFFF', '#F08A5A'], 'O disco preto, a coroa aberta e o pôr do sol em toda a volta do horizonte.', feat('flawless:1')),
  sky('scene-mar-de-nuvens', 'Mar de Nuvens', 'raro', 'mar-de-nuvens', ['#E09A84', '#6E3F5A'], 'O topo das nuvens de um gigante gasoso, camada atrás de camada.', feat('time:5h')),
  sky('scene-cidade-anel', 'Cidade em Anel', 'raro', 'cidade-orbital', ['#2F7A6E', '#FFE2A8'], 'Um mundo construído em arco: o chão sobe pelos lados e passa por cima do céu.', feat('missions:18')),
  sky('scene-danca-binaria', 'Dois Sóis em Dança', 'raro', 'danca-binaria', ['#FF8A3C', '#7FE0FF'], 'Uma estrela puxando o gás da outra, e a ponte de fogo entre as duas.', feat('bosswins:15')),

  // ——— épicos ———
  sky('scene-tunel', 'Garganta do Túnel', 'epico', 'tunel', ['#38D6B0', '#B48CFF'], 'Um atalho pelo espaço: anéis que encolhem até uma saída de luz.', level(35)),
  sky('scene-remanescente', 'Resto de Supernova', 'epico', 'remanescente', ['#FF5C7A', '#7FE0FF'], 'A casca de uma estrela que explodiu, em filamentos de várias cores.', feat('swift')),
  sky('scene-quadro-cosmico', 'Quadro-Negro Cósmico', 'epico', 'quadro-cosmico', ['#7FE0D0', '#DFF6F0'], 'As constelações deste céu são figuras: Pitágoras, uma parábola, um hexágono, a soma.', feat('seals:10')),
  sky('scene-berco', 'Berçário Estelar', 'epico', 'berco-estelar', ['#FF8A5C', '#5FD4FF'], 'Gás de todas as cores, glóbulos escuros e estrelas recém-acesas.', feat('collect:skies8')),

  // ——— lendários ———
  sky('scene-horizonte', 'À Beira do Horizonte', 'lendario', 'horizonte-eventos', ['#FFB86B', '#FFF3D0'], 'Um buraco negro de verdade: o disco, a sombra e a luz de trás dobrada por cima.', feat('bosses:9')),
  sky('scene-primeira-luz', 'Primeira Luz', 'lendario', 'primeira-luz', ['#B48CFF', '#FFE7B0'], 'O universo jovem: as manchas do fundo cósmico, a teia de filamentos e as primeiras estrelas.', feat('missions:27')),
];
