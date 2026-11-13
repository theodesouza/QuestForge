/**
 * Da regra do jogo para a interface: remessa, boas-vindas do renascimento e fila de cerimônias.
 */
import { createInitialState } from '../../domain/game/game';
import type { GameEvent } from '../../domain/game/types';
import { publish, useGameStore } from '../store';

const T0 = Date.UTC(2026, 10, 12, 12);
const state = createInitialState(T0);
const item = (itemId: string, source: string): GameEvent => ({ type: 'item', itemId, source, autoEquipped: false, slot: 'core' });
const reset = () => useGameStore.setState({ toasts: [], reveals: [], shipments: [], celebrations: [] });

describe('remessas na interface', () => {
  beforeEach(reset);

  it('a novidade do Áster abre as boas-vindas com a remessa junto — e não vira aviso', () => {
    publish(state, [
      { type: 'news', id: 'aster', title: 'O Astrolábio despertou', detail: '…' },
      { type: 'shipment', items: [{ itemId: 'core-protoestrela', source: 'level:7' }, { itemId: 'orbiter-sonda', source: 'level:3' }] },
    ]);
    const s = useGameStore.getState();
    expect(s.shipments).toHaveLength(1);
    expect(s.shipments[0]).toMatchObject({ rebirth: true, items: [{ itemId: 'core-protoestrela' }, { itemId: 'orbiter-sonda' }] });
    expect(s.toasts).toEqual([]);
    expect(s.reveals).toEqual([]);
  });

  it('sem nada a entregar, as boas-vindas aparecem sozinhas', () => {
    publish(state, [{ type: 'news', id: 'aster', title: 'O Astrolábio despertou', detail: '…' }]);
    expect(useGameStore.getState().shipments).toEqual([expect.objectContaining({ rebirth: true, items: [] })]);
  });

  it('remessa comum não é renascimento, e as outras novidades continuam virando aviso', () => {
    publish(state, [
      { type: 'news', id: 'atlas-r6-r9', title: 'Quatro novas regiões no Atlas', detail: '…' },
      { type: 'shipment', items: [{ itemId: 'core-protoestrela', source: 'level:7' }] },
    ]);
    const s = useGameStore.getState();
    expect(s.shipments).toEqual([expect.objectContaining({ rebirth: false })]);
    expect(s.toasts).toHaveLength(1);
  });

  it('até três peças ganham cerimônia própria; mais do que isso vira uma remessa', () => {
    publish(state, [item('core-ambar', 'level:4'), item('aura-brasa', 'level:6'), item('title-tracador', 'level:3')]);
    expect(useGameStore.getState().reveals).toHaveLength(3);
    expect(useGameStore.getState().shipments).toEqual([]);
    reset();
    publish(state, [item('core-ambar', 'feat:a'), item('aura-brasa', 'feat:b'), item('title-tracador', 'feat:c'), item('core-verdete', 'feat:d'), item('scene-pedreira', 'boss:golem-proporcional:first')]);
    const s = useGameStore.getState();
    expect(s.shipments).toEqual([expect.objectContaining({ rebirth: false, items: expect.arrayContaining([expect.objectContaining({ itemId: 'core-verdete' })]) })]);
    expect(s.shipments[0].items).toHaveLength(4);
    // O espólio do chefão continua com a sua cerimônia.
    expect(s.reveals.map((r) => r.itemId)).toEqual(['scene-pedreira']);
  });
});
