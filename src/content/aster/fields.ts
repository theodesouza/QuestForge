/**
 * Campos novos (espaço `aura`, 26): a energia em volta do corpo do Áster.
 * Desenhos em src/ui/vfx/fields.tsx (`visual.fx`).
 */
import { feat, level, piece, shop, type AsterItem } from './source';

const field = (...a: Parameters<typeof piece> extends [unknown, ...infer R] ? R : never) => piece('aura', ...a);

export const ASTER_FIELDS: AsterItem[] = [
  // ——— comuns ———
  field('aura-coroa-solar', 'Coroa Solar', 'comum', 'coroa-solar', ['#FFB23E'], 'Uma franja de luz irregular em volta do corpo, respirando.', shop(60)),
  field('aura-halo-frio', 'Halo de Gelo', 'comum', 'halo-frio', ['#BFE6FF'], 'O anel das noites geladas, com um falso sol de cada lado.', shop(70)),
  field('aura-vento-estelar', 'Vento Estelar', 'comum', 'vento-estelar', ['#F4D58D'], 'Poeira que o corpo sopra para fora, sem pressa, em todas as direções.', shop(45)),
  field('aura-fumaca', 'Véu de Fumaça', 'comum', 'fumaca', ['#8A7FB8'], 'Fiapos escuros girando devagar: mais sombra do que luz.', shop(55)),
  field('aura-estatica', 'Estática', 'comum', 'estatica', ['#7FE0FF'], 'Faíscas miúdas que estalam rente ao corpo.', level(8)),
  field('aura-bolha', 'Bolha de Sabão', 'comum', 'bolha', ['#9FE8D8', '#B9A6FF'], 'Uma casca fina e furta-cor, com dois reflexos.', shop(85)),
  field('aura-raios-suaves', 'Raios Suaves', 'comum', 'raios-suaves', ['#FFE7A8'], 'Cinco feixes largos girando sem pressa.', feat('seals:1')),

  // ——— incomuns ———
  field('aura-magnetosfera', 'Magnetosfera', 'incomum', 'magnetosfera', ['#5FD4FF', '#DCE3FF'], 'Laços de campo saindo de um polo e voltando pelo outro.', shop(180)),
  field('aura-escudo-hex', 'Escudo Hexagonal', 'incomum', 'escudo-hex', ['#38D6B0', '#B6FFE9'], 'Uma casca de células: algumas acendem quando algo encosta.', shop(205)),
  field('aura-cinturao-radiacao', 'Cinturões de Radiação', 'incomum', 'cinturao-radiacao', ['#FF8FD1', '#FFD36B'], 'Dois lóbulos de partículas presas pelo campo, um de cada lado.', level(16)),
  field('aura-aurora-polar', 'Auroras Polares', 'incomum', 'aurora-polar', ['#38D6B0', '#9B87FF'], 'Um oval de luz em cada polo do corpo.', shop(165)),
  field('aura-chamas-frias', 'Chamas Frias', 'incomum', 'chamas-frias', ['#4F8BFF', '#BFE6FF'], 'Línguas de fogo azul: queimam sem esquentar.', feat('weekly:4')),
  field('aura-lotus', 'Lótus de Luz', 'incomum', 'lotus', ['#FF8FD1', '#FFE7A8'], 'Oito pétalas que se abrem e se fecham em volta do corpo.', feat('collect:25')),
  field('aura-espinhos', 'Coroa de Espinhos', 'incomum', 'espinhos', ['#E8ECF7', '#9B87FF'], 'Pontas finas e longas, girando. Bonita de longe.', shop(150)),

  // ——— raros ———
  field('aura-plasma', 'Arcos de Plasma', 'raro', 'plasma', ['#B48CFF', '#7FE0FF'], 'Descargas que saltam do corpo para o vazio e voltam.', level(18)),
  field('aura-teia', 'Teia de Luz', 'raro', 'teia', ['#7FB6FF'], 'Nove nós, todos ligados a todos. Conte as cordas: são 27.', feat('region:planicies-numericas')),
  field('aura-musica', 'Música das Esferas', 'raro', 'musica', ['#F2B54A', '#FF8FD1'], 'Quatro órbitas nas razões 1 : 2 : 3 : 4. Quando se alinham, é um acorde.', feat('daily:30')),
  field('aura-dobra', 'Campo de Dobra', 'raro', 'dobra-campo', ['#5FD4FF', '#38D6B0'], 'Duas bolhas que se alternam: uma aperta enquanto a outra estica.', feat('seals:3')),
  field('aura-geada', 'Campo de Geada', 'raro', 'gelo-campo', ['#BFE6FF'], 'Seis braços de cristal crescendo do corpo, cada um se ramificando.', feat('region:cavernas-volumetricas')),
  field('aura-enxame-fotons', 'Enxame de Fótons', 'raro', 'enxame-fotons', ['#FFD36B', '#7FE0FF'], 'Dezenas de pontos velozes, em três planos, rente ao corpo.', feat('correct:400')),

  // ——— épicos ———
  field('aura-coroa-eclipse', 'Coroa do Eclipse', 'epico', 'coroa-eclipse', ['#F4ECDC', '#FFD36B'], 'Serpentinas longas, proeminências rosadas e, por um instante, o anel de diamante.', level(33)),
  field('aura-tempestade-mag', 'Tempestade Magnética', 'epico', 'tempestade-mag', ['#5FD4FF', '#FF8FD1'], 'Os laços de campo se torcem, estalam e acendem.', feat('bosses:6')),
  field('aura-cimatica', 'Cimática', 'epico', 'cimatica', ['#38D6B0', '#F2B54A'], 'Figuras de vibração: as rosáceas r = cos 4θ e r = cos 3θ, uma contra a outra.', feat('region:cordilheira-funcoes')),
  field('aura-escamas', 'Escamas de Luz', 'epico', 'escamas', ['#FF9A5C', '#FFD36B'], 'Quatro fileiras de escamas; uma onda de brilho as percorre.', feat('collect:100')),

  // ——— lendários ———
  field('aura-aureola', 'Auréola Primordial', 'lendario', 'aureola', ['#FFD36B', '#F4ECDC'], 'Anéis de luz, uma faixa de sinais girando, raios e pulsos: a primeira luz.', feat('starsum:54')),
  field('aura-fractal', 'Coroa Fractal', 'lendario', 'fractal', ['#7FE0FF', '#B48CFF'], 'Flocos de Koch aninhados: perímetro infinito numa área finita.', feat('collect:150')),
];
