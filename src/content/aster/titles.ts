/**
 * Títulos novos (26): como o Áster é chamado. Só texto e cor — a raridade aparece no nome.
 */
import { feat, level, piece, shop, type AsterItem, type Get } from './source';
import type { Rarity } from '../items';

const title = (id: string, name: string, rarity: Rarity, color: string, description: string, get: Get) => piece('title', id, name, rarity, '', [color], description, get);

export const ASTER_TITLES: AsterItem[] = [
  // ——— comuns ———
  title('title-poeira-estrelas', 'Poeira de Estrelas', 'comum', '#C9CEE0', 'Todo mundo começa assim: é do que as estrelas são feitas.', shop(40)),
  title('title-observador', 'Observador do Céu', 'comum', '#9FC2FF', 'Antes de calcular, olhar.', shop(50)),
  title('title-aprendiz-orbita', 'Aprendiz de Órbita', 'comum', '#B6FFE9', 'A primeira volta completa em torno do problema.', level(2)),
  title('title-curioso', 'Curioso do Cosmos', 'comum', '#FFD9A8', 'Pergunta primeiro, responde depois.', shop(45)),
  title('title-cacador-cometas', 'Caçador de Cometas', 'comum', '#DFF2FF', 'Chega cedo e fica até tarde só para ver um risco no céu.', shop(65)),
  title('title-vigia-noturno', 'Vigia Noturno', 'comum', '#B48CFF', 'Enquanto a cidade dorme, uma lanterna e um caderno.', shop(55)),
  title('title-primeira-aula', 'Calouro da Academia', 'comum', '#7FE0D0', 'A primeira insígnia ainda brilha de nova.', feat('seals:1')),

  // ——— incomuns ———
  title('title-navegador-estelar', 'Navegador Estelar', 'incomum', '#7FB6FF', 'Acha o caminho contando estrelas.', shop(150)),
  title('title-cartografo-ceu', 'Cartógrafo do Céu', 'incomum', '#F2B54A', 'Já mapeou a terra. Agora, o resto.', shop(170)),
  title('title-guardiao-anel', 'Guardião do Anel', 'incomum', '#E8D2A8', 'Trinta níveis mantendo cada pedra na sua órbita.', level(30)),
  title('title-domador-mares', 'Domador de Marés', 'incomum', '#38D6B0', 'Sabe quando puxar e quando soltar.', shop(160)),
  title('title-colecionador-luas', 'Colecionador de Luas', 'incomum', '#DCE3FF', 'Dez núcleos na estante, e ainda cabe mais um.', feat('collect:cores10')),
  title('title-ferreiro-estrelas', 'Ferreiro de Estrelas', 'incomum', '#FF9A5C', 'A Oficina já conhece o seu martelo.', feat('shop:5')),
  title('title-piloto-dobra', 'Piloto de Dobra', 'incomum', '#5FD4FF', 'Não corre: encurta o caminho.', shop(185)),

  // ——— raros ———
  title('title-arquiteto-orbitas', 'Arquiteto de Órbitas', 'raro', '#FFD36B', 'Cada coisa no lugar, cada lugar com seu período.', level(37)),
  title('title-tecelao', 'Tecelão de Constelações', 'raro', '#9B87FF', 'Trinta estrelas ligadas, uma a uma.', feat('starsum:30')),
  title('title-voz-mares', 'Voz das Marés', 'raro', '#38D6B0', 'Doze semanas sem perder o compasso.', feat('weekly:12')),
  title('title-alquimista', 'Alquimista de Nebulosas', 'raro', '#FF8FD1', 'Mil acertos: gás virando estrela.', feat('correct:1000')),
  title('title-mestre-forja', 'Mestre da Forja Estelar', 'raro', '#FF7A3C', 'Trinta peças saídas da própria bigorna.', feat('shop:30')),
  title('title-relojoeiro', 'Relojoeiro do Cosmos', 'raro', '#F4ECDC', 'Trinta dias, trinta baús: pontual como um pulsar.', feat('daily:30')),

  // ——— épicos ———
  title('title-coracao-estrela', 'Coração de Estrela', 'epico', '#FFB23E', 'O que queima lá dentro não é combustível: é vontade.', level(42)),
  title('title-domador-singularidades', 'Domador de Singularidades', 'epico', '#B48CFF', 'Três chefões sem um arranhão.', feat('flawless:3')),
  title('title-memoria', 'Memória do Universo', 'epico', '#7FE0FF', 'Cento e cinquenta erros que viraram acerto.', feat('echoes:150')),
  title('title-oraculo', 'Oráculo dos Números', 'epico', '#FFD36B', 'Nove em cada dez. Às vezes, dez.', feat('accuracy:90')),

  // ——— lendários ———
  title('title-aster-desperto', 'Áster Desperto', 'lendario', '#FFE7B0', 'A um passo do topo, com tudo aceso.', level(49)),
  title('title-alem-infinito', 'Além do Infinito', 'lendario', '#DFF6FF', 'Quatro mil questões depois, ainda querendo a próxima.', feat('answers:4000')),
];
