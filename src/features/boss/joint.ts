/** Matriz SVG em torno da articulação, sem mover o ponto de apoio. */
export function jointMatrix(progress: number, degrees: number, x: number, y: number): [number, number, number, number, number, number] {
  'worklet';
  const angle = progress * degrees * Math.PI / 180;
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c, s, -s, c, x - c * x + s * y, y - s * x - c * y];
}
