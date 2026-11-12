/**
 * Satélites (espaço novo, 30): corpos, máquinas e criaturas em órbita do Áster.
 * O desenho de cada um está em src/ui/vfx/orbiters.tsx (`visual.fx`).
 */
import { feat, level, piece, shop, type AsterItem } from './source';

const sat = (...a: Parameters<typeof piece> extends [unknown, ...infer R] ? R : never) => piece('orbiter', ...a);

export const ASTER_ORBITERS: AsterItem[] = [
  // ——— comuns ———
  sat('orbiter-lua', 'Lua Companheira', 'comum', 'lua', ['#C9D1F0'], 'Uma lua só, cheia de crateras, sempre por perto.', shop(45)),
  sat('orbiter-luas-gemeas', 'Luas Gêmeas', 'comum', 'luas-gemeas', ['#DCE3FF', '#F2B54A'], 'Duas, sempre em lados opostos: quando uma some, a outra aparece.', shop(75)),
  sat('orbiter-sonda', 'Sonda', 'comum', 'sonda', ['#F2B54A', '#DCE3FF'], 'Uma caixinha com antena e prato, mandando notícias para casa.', level(3)),
  sat('orbiter-asteroide', 'Asteroide Capturado', 'comum', 'asteroide', ['#9AA3C7'], 'Uma rocha irregular, dando cambalhotas desde que foi pega.', shop(60)),
  sat('orbiter-lanterna', 'Lanterna de Papel', 'comum', 'lanterna', ['#FF8A3C', '#FFE08A'], 'Sobe devagar, acesa por dentro.', shop(90)),
  sat('orbiter-cubo', 'Cubo Mensageiro', 'comum', 'cubo', ['#38D6B0'], 'Um cubo de arestas acesas, girando sobre si mesmo.', feat('missions:3')),
  sat('orbiter-pipa', 'Pipa Estelar', 'comum', 'pipa', ['#FF6A55', '#FFE08A'], 'Um losango com rabiola, voando de frente para o vento solar.', shop(100)),
  sat('orbiter-semente', 'Sementes ao Vento', 'comum', 'semente', ['#F4ECDC', '#5FD38D'], 'Três tufos leves, levados para onde o vento for.', feat('stages:5')),

  // ——— incomuns ———
  sat('orbiter-cometa-orb', 'Cometa de Bolso', 'incomum', 'cometa-orb', ['#9BD8FF'], 'Pequeno e apressado, com a cauda sempre para trás.', shop(150)),
  sat('orbiter-satelite', 'Satélite de Painéis', 'incomum', 'satelite', ['#F2B54A', '#5C8DFF'], 'Corpo dourado e dois painéis azuis, girando devagar.', level(9)),
  sat('orbiter-trio', 'Três Luas', 'incomum', 'trio', ['#F2B54A', '#9B87FF'], 'Três tamanhos, três planos. Nunca se alinham.', shop(185)),
  sat('orbiter-origami', 'Garça de Papel', 'incomum', 'origami', ['#F4ECDC', '#FF8FD1'], 'Uma dobradura que aprendeu a voar.', feat('sessions:10')),
  sat('orbiter-bussola', 'Bússola Errante', 'incomum', 'bussola', ['#F2B54A', '#DCE3FF'], 'A agulha gira sem parar: aqui, todo lado é norte.', feat('missions:9')),
  sat('orbiter-dado-orb', 'Dado Orbital', 'incomum', 'dado-orb', ['#F4ECDC'], 'Rola sem nunca parar numa face.', feat('region:labirinto-acaso')),
  sat('orbiter-chave', 'Chave Antiga', 'incomum', 'chave', ['#F2B54A', '#FF6A55'], 'De alguma porta que ainda não foi encontrada.', feat('daily:7')),
  sat('orbiter-balao', 'Balão Explorador', 'incomum', 'balao', ['#FF6A55', '#F4ECDC'], 'Um cesto, um envelope listrado e nenhuma pressa.', shop(200)),

  // ——— raros ———
  sat('orbiter-estacao-orb', 'Estação Orbital', 'raro', 'estacao-orb', ['#C9D1F0', '#FFD36B'], 'Uma roda com raios, girando para fazer gravidade.', level(23)),
  sat('orbiter-peixes', 'Carpas de Luz', 'raro', 'peixes', ['#FF8A3C', '#F4ECDC'], 'Duas, perseguindo a cauda uma da outra.', feat('echoes:25')),
  sat('orbiter-solidos', 'Sólidos de Platão', 'raro', 'solidos', ['#38D6B0', '#F2B54A'], 'Os cinco, e só cinco: não existe um sexto.', feat('region:cavernas-volumetricas')),
  sat('orbiter-constantes', 'Constantes', 'raro', 'constantes', ['#9B87FF', '#F2B54A'], 'π, e, φ, ∞ e i: os números que aparecem em todo lugar.', feat('correct:1000')),
  sat('orbiter-colar-luas', 'Colar de Luas', 'raro', 'colar-luas', ['#DCE3FF', '#9B87FF'], 'Sete contas na mesma órbita, como num colar.', feat('starsum:30')),
  sat('orbiter-drones', 'Enxame de Drones', 'raro', 'drones', ['#38D6B0', '#FF6A55'], 'Cinco setas em formação de cunha.', feat('bosswins:15')),
  sat('orbiter-mariposas', 'Mariposas Solares', 'raro', 'mariposas', ['#FF8FD1', '#FFD36B'], 'Atraídas pela luz, dão voltas sem pousar.', level(31)),

  // ——— épicos ———
  sat('orbiter-baleia', 'Baleia Estelar', 'epico', 'baleia', ['#5C8DFF', '#BFE9FF'], 'Enorme e sem pressa. Nada pelo vazio como se fosse mar.', feat('time:12h')),
  sat('orbiter-serpente', 'Serpente de Constelação', 'epico', 'serpente', ['#38D6B0', '#FFD36B'], 'A cabeça puxa; cada estrela do corpo segue a da frente.', feat('region:planicies-numericas')),
  sat('orbiter-frota', 'Frota Exploradora', 'epico', 'frota', ['#F2B54A', '#FF9F43'], 'Três naves em fila, com os motores acesos.', feat('missions:27')),
  sat('orbiter-engrenagens', 'Engrenagens do Tempo', 'epico', 'engrenagens', ['#F2B54A', '#C98A5B'], 'Três rodas, três velocidades: quanto menor, mais depressa.', level(38)),
  sat('orbiter-fases', 'Fases da Lua', 'epico', 'fases', ['#F4ECDC'], 'Oito luas, cada uma num ponto do mês.', feat('weekly:12')),

  // ——— lendários ———
  sat('orbiter-fenix', 'Fênix Solar', 'lendario', 'fenix', ['#FF6A3C', '#FFE08A'], 'Uma ave de fogo. A cauda é uma fileira de chamas que a segue.', feat('bosswins:30')),
  sat('orbiter-sistema', 'Sistema em Miniatura', 'lendario', 'sistema', ['#E8A86A', '#E8C98A'], 'Cinco mundos, cada um com seu ano. O seu Áster tem um céu só dele.', feat('collect:200')),
];
