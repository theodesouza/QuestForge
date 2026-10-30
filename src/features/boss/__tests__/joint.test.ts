import { jointMatrix } from '../joint';

it('respiração neutra não desloca nem deforma a arte', () => {
  const matrix = jointMatrix(0, 5, 120, 85);
  expect(matrix[0]).toBe(1);
  expect(matrix[3]).toBe(1);
  expect(matrix[4]).toBe(0);
  expect(matrix[5]).toBe(0);
});

it('a articulação permanece fixa e o membro preserva tamanho ao girar', () => {
  const [a, b, c, d, tx, ty] = jointMatrix(1, 12, 120, 85);
  expect(a * 120 + c * 85 + tx).toBeCloseTo(120);
  expect(b * 120 + d * 85 + ty).toBeCloseTo(85);
  expect(a * a + b * b).toBeCloseTo(1);
  expect(a * d - b * c).toBeCloseTo(1);
});
