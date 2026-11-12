/**
 * Núcleos novos do Áster (38). O desenho de cada um está em src/ui/vfx/bodies2.tsx (`visual.fx`).
 * Cinco famílias: estrelas, mundos, singularidades, nebulosas e máquinas.
 */
import { feat, level, piece, shop, type AsterItem } from './source';

const core = (...a: Parameters<typeof piece> extends [unknown, ...infer R] ? R : never) => piece('core', ...a);

export const ASTER_CORES: AsterItem[] = [
  // ——— comuns ———
  core('core-ana-vermelha', 'Anã Vermelha', 'comum', 'ana-vermelha', ['#FF7A5C', '#8C1F2B'], 'Pequena, fria e paciente: vai brilhar por trilhões de anos.', shop(55), { element: 'fogo' }),
  core('core-lua-rochosa', 'Lua de Basalto', 'comum', 'lua-rochosa', ['#9AA3C7', '#2A2C38'], 'Rocha nua, coberta de crateras. Cada marca é uma lição que ficou.', shop(45), { element: 'lunar' }),
  core('core-mundo-oceano', 'Mundo Oceânico', 'comum', 'mundo-oceano', ['#2C8FD8', '#0A2A5C'], 'Um mar sem margens, com nuvens que correm mais rápido que a água.', shop(70), { element: 'mare' }),
  core('core-mundo-deserto', 'Mundo de Areia', 'comum', 'mundo-deserto', ['#E0A35C', '#5A2E14'], 'Dunas de um polo ao outro e uma tempestade que nunca termina de passar.', shop(65), { element: 'aureo' }),
  core('core-cometa', 'Coração de Cometa', 'comum', 'cometa', ['#9BD8FF', '#3C6EA8'], 'Gelo antigo, mais velho que os planetas. Solta uma cabeleira de gás ao esquentar.', feat('answers:50'), { element: 'mare' }),
  core('core-protoestrela', 'Protoestrela', 'comum', 'protoestrela', ['#FFB46B', '#B3243F'], 'Um casulo de gás morno. No meio, algo começa a acender.', level(7), { element: 'fogo' }),
  core('core-gota-nebular', 'Gota Nebular', 'comum', 'gota-nebular', ['#38D6B0', '#1E5A8C'], 'Uma gota de gás frio à deriva, atravessada por um fio de poeira.', shop(60), { element: 'natureza' }),
  core('core-ana-marrom', 'Anã Marrom', 'comum', 'ana-marrom', ['#C2674A', '#5A2430'], 'Quase estrela, quase planeta. Não acendeu — e brilha mesmo assim.', feat('sessions:10'), { element: 'fogo' }),
  core('core-brasa-estelar', 'Brasa Estelar', 'comum', 'brasa-estelar', ['#FF8A3C', '#FFD36B'], 'A casca esfriou; as fissuras ainda mostram o fogo de dentro.', shop(85), { element: 'fogo' }),

  // ——— incomuns ———
  core('core-estrela-dourada', 'Estrela Dourada', 'incomum', 'estrela-dourada', ['#FFD36B', '#FF8A3C'], 'Um sol calmo, com arcos de plasma dançando na borda.', level(11), { element: 'aureo' }),
  core('core-ana-branca', 'Anã Branca', 'incomum', 'ana-branca', ['#CFE6FF', '#7FB6FF'], 'Do tamanho de um mundo, com o peso de um sol. Ofusca.', shop(170), { element: 'lunar' }),
  core('core-gigante-gasoso', 'Gigante Gasoso', 'incomum', 'gigante-gasoso', ['#E8A86A', '#7A4520'], 'Faixas turbulentas e uma tempestade maior que planetas inteiros.', shop(150), { element: 'tempestade' }),
  core('core-mundo-gelado', 'Mundo de Gelo', 'incomum', 'mundo-gelado', ['#BFE9FF', '#1E3A6A'], 'Uma crosta rachada que reflete a luz como vidro.', shop(160), { element: 'mare' }),
  core('core-mundo-lava', 'Mundo de Lava', 'incomum', 'mundo-lava', ['#FF6A3C', '#B3243F'], 'Placas negras boiando num mar que brilha. Brasas sobem da crosta.', feat('correct:100'), { element: 'fogo' }),
  core('core-mundo-selva', 'Mundo Selvagem', 'incomum', 'mundo-selva', ['#5FD38D', '#1E7A4A'], 'Continentes verdes, mares rasos e nuvens carregadas de chuva.', feat('missions:3'), { element: 'natureza' }),
  core('core-geodo', 'Geodo Estelar', 'incomum', 'geodo', ['#9B87FF', '#38D6B0'], 'Por fora, pedra. Pela fenda, um cristal aceso por dentro.', feat('stages:5'), { element: 'cristal' }),
  core('core-bercario', 'Berçário Estelar', 'incomum', 'bercario', ['#FF8FD1', '#7FB6FF'], 'Nuvens girando em sentidos opostos; estrelas recém-nascidas piscam dentro.', level(13), { element: 'astral' }),
  core('core-reator', 'Reator Orbital', 'incomum', 'reator', ['#38D6B0', '#7FB6FF'], 'Três anéis de plasma em planos cruzados, em torno de um ponto de fusão.', shop(210), { element: 'tempestade' }),

  // ——— raros ———
  core('core-gigante-azul', 'Gigante Azul', 'raro', 'gigante-azul', ['#7FB6FF', '#2A3F9E'], 'Enorme, apressada e brilhante: queima tudo o que tem de uma vez.', level(19), { element: 'tempestade' }),
  core('core-gigante-vermelha', 'Gigante Vermelha', 'raro', 'gigante-vermelha', ['#FF6A55', '#7A1A24'], 'Células de convecção do tamanho de mundos e um pulso lento, como uma respiração.', feat('time:5h'), { element: 'fogo' }),
  core('core-binaria', 'Estrela Binária', 'raro', 'binaria', ['#FFD36B', '#7FB6FF'], 'Duas estrelas girando uma em torno da outra, trocando matéria.', feat('bosses:3'), { element: 'aureo' }),
  core('core-estrela-neutrons', 'Estrela de Nêutrons', 'raro', 'estrela-neutrons', ['#9BD8FF', '#5C8DFF'], 'Uma colher dela pesa uma montanha. Gira dezenas de vezes por segundo.', level(24), { element: 'tempestade' }),
  core('core-mundo-cidade', 'Ecumenópole', 'raro', 'mundo-cidade', ['#FFD36B', '#FF8FD1'], 'Um mundo inteiro urbanizado: a noite é uma malha de luzes e há tráfego em órbita.', feat('answers:500'), { element: 'aureo' }),
  core('core-mundo-tempestade', 'Mundo-Tempestade', 'raro', 'mundo-tempestade', ['#9B87FF', '#2A3458'], 'Um céu fechado que nunca abre. Relâmpagos correm por dentro das nuvens.', feat('echoes:25'), { element: 'tempestade' }),
  core('core-singularidade', 'Singularidade', 'raro', 'singularidade', ['#FF9F43', '#9B87FF'], 'A sombra, o anel de fótons e um disco fino que a contorna.', level(29), { element: 'astral' }),
  core('core-olho-de-gato', 'Nebulosa Olho de Gato', 'raro', 'olho-de-gato', ['#38D6B0', '#FF8FD1'], 'Cascas concêntricas sopradas por uma estrela que se despede.', feat('region:observatorio-dados'), { element: 'astral' }),
  core('core-hemisferio', 'Estrela de Duas Faces', 'raro', 'hemisferio', ['#FFE7A3', '#1A2346'], 'Metade luz, metade sombra, girando rápido demais para escolher um lado.', feat('accuracy:80'), { element: 'lunar' }),

  // ——— épicos ———
  core('core-cefeida', 'Cefeida', 'epico', 'cefeida', ['#FFD36B', '#FF6A55'], 'Pulsa num período exato. A cada batida, um anel de luz mede a distância até ela.', level(34), { element: 'aureo' }),
  core('core-magnetar', 'Magnetar', 'epico', 'magnetar', ['#9B87FF', '#5C8DFF'], 'Linhas de campo cerradas e tremores que percorrem a crosta.', feat('bosses:6'), { element: 'tempestade' }),
  core('core-buraco-kerr', 'Buraco Negro de Kerr', 'epico', 'buraco-kerr', ['#FF9F43', '#FF5C7A'], 'Gira. O disco se dobra por cima da sombra e um lado brilha mais que o outro.', level(41), { element: 'astral' }),
  core('core-buraco-branco', 'Buraco Branco', 'epico', 'buraco-branco', ['#BFE9FF', '#9B87FF'], 'O avesso: nada entra, tudo sai. Jorra luz em todas as direções.', feat('flawless:3'), { element: 'lunar' }),
  core('core-esfera-dyson', 'Esfera de Dyson', 'epico', 'esfera-dyson', ['#FFD36B', '#38D6B0'], 'Uma estrela cercada por uma casca de painéis. A luz escapa pelas frestas.', feat('seals:10'), { element: 'aureo' }),
  core('core-supernova', 'Remanescente de Supernova', 'epico', 'supernova', ['#FF8FD1', '#7FB6FF'], 'Filamentos em casca que ainda se expandem. No centro, o que sobrou pulsa.', feat('answers:1500'), { element: 'astral' }),

  // ——— lendários ———
  core('core-quasar', 'Quasar', 'lendario', 'quasar', ['#7FB6FF', '#9B87FF'], 'O objeto mais brilhante do universo: um disco furioso e dois jatos que atravessam o céu.', level(48), { element: 'tempestade' }),
  core('core-colisao', 'Dança de Singularidades', 'lendario', 'colisao', ['#FF9F43', '#9B87FF'], 'Dois buracos negros em espiral, a um passo de se fundir. O espaço inteiro ondula.', feat('bosses:9'), { element: 'astral' }),
  core('core-tesseracto', 'Tesseracto', 'lendario', 'tesseracto', ['#38D6B0', '#DCE3FF'], 'Um cubo de quatro dimensões virando do avesso em torno de uma estrela presa.', feat('starsum:81'), { element: 'cristal' }),
  core('core-materia-escura', 'Coração de Matéria Escura', 'lendario', 'materia-escura', ['#9B87FF', '#38D6B0'], 'Não se vê. Só se sabe que está lá pelo que ele faz com a luz em volta.', feat('echoes:150'), { element: 'lunar' }),
  core('core-ovo-cosmico', 'Ovo Cósmico', 'lendario', 'ovo-cosmico', ['#FFD36B', '#FF7AB8'], 'A semente de um universo. A casca racha e a luz de dentro escapa em pulsos.', feat('collect:275'), { element: 'aureo' }),
];
