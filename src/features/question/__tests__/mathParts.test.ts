import { mathParts } from '../mathParts';

describe('frações da folha de resolução', () => {
  it('preserva números em português, sinais e unidades ao compor as contas', () => {
    expect(mathParts('P = −3/4 × 1.200/2,5 = −360 km/h')).toEqual([
      'P', '=', { numerator: '−3', denominator: '4' }, '×',
      { numerator: '1.200', denominator: '2,5' }, '=', '−360', 'km/h',
    ]);
  });

  it('não transforma potências, divisões encadeadas ou frações algébricas em outra conta', () => {
    expect(mathParts('(3/4) + 1/2² + 1/2/3 + x/5 + 2/(3 + 4)')).toEqual([
      '(', { numerator: '3', denominator: '4' }, ')', '+', '1/2²', '+', '1/2/3', '+', 'x/5', '+', '2/(3', '+', '4)',
    ]);
  });
});
