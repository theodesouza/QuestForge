/** Geometria do palco (240 × 240, centro em 120,120). Ângulo 0 = topo, sentido horário. */
import { C } from './engine';

export function polar(r: number, deg: number, cx = C, cy = C) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

const f = (n: number) => n.toFixed(2);

/** Pontos de um polígono regular. */
export function ngon(n: number, r: number, rotate = 0): string {
  return Array.from({ length: n }, (_, i) => {
    const p = polar(r, rotate + (360 / n) * i);
    return `${f(p.x)},${f(p.y)}`;
  }).join(' ');
}

/** Estrela de n pontas. */
export function star(n: number, outer: number, inner: number, rotate = 0): string {
  return Array.from({ length: n * 2 }, (_, i) => {
    const p = polar(i % 2 === 0 ? outer : inner, rotate + (180 / n) * i);
    return `${f(p.x)},${f(p.y)}`;
  }).join(' ');
}

/** Círculo ondulado (maré, bordas vivas). */
export function wavyCircle(r: number, amp: number, waves: number, phase = 0, steps = 120): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const deg = (360 / steps) * i;
    const rr = r + amp * Math.sin(((deg * waves + phase) * Math.PI) / 180);
    const p = polar(rr, deg);
    d += `${i === 0 ? 'M' : 'L'}${f(p.x)} ${f(p.y)} `;
  }
  return `${d}Z`;
}

/** Língua de fogo apontando para fora do centro, com base no raio `r`. */
export function flame(deg: number, r: number, length: number, width: number, curl = 0): string {
  const base1 = polar(r, deg - width / 2);
  const base2 = polar(r, deg + width / 2);
  const tip = polar(r + length, deg + curl);
  const c1 = polar(r + length * 0.55, deg - width * 0.55 + curl * 0.3);
  const c2 = polar(r + length * 0.55, deg + width * 0.55 + curl * 0.3);
  return `M${f(base1.x)} ${f(base1.y)} Q${f(c1.x)} ${f(c1.y)} ${f(tip.x)} ${f(tip.y)} Q${f(c2.x)} ${f(c2.y)} ${f(base2.x)} ${f(base2.y)} Z`;
}

/** Raio fino (triângulo alongado) do raio r0 ao r1. */
export function ray(deg: number, r0: number, r1: number, halfWidthDeg: number): string {
  const a = polar(r0, deg - halfWidthDeg);
  const b = polar(r1, deg);
  const c = polar(r0, deg + halfWidthDeg);
  return `${f(a.x)},${f(a.y)} ${f(b.x)},${f(b.y)} ${f(c.x)},${f(c.y)}`;
}

/** Arco elétrico entre dois raios, com zigue-zague determinístico. */
export function lightning(deg: number, r0: number, r1: number, segments: number, jitter: number, seed: number): string {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const pts: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const off = i === 0 || i === segments ? 0 : (rnd() - 0.5) * 2 * jitter;
    const p = polar(r0 + (r1 - r0) * t, deg + off);
    pts.push(`${f(p.x)},${f(p.y)}`);
  }
  return pts.join(' ');
}

/** Espiral logarítmica de `turns` voltas entre r0 e r1. */
export function spiral(r0: number, r1: number, turns: number, rotate = 0, steps = 90): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = r0 * Math.pow(r1 / r0, t);
    const p = polar(r, rotate + t * turns * 360);
    d += `${i === 0 ? 'M' : 'L'}${f(p.x)} ${f(p.y)} `;
  }
  return d;
}

/** Espiral áurea aproximada por quartos de círculo com raios de Fibonacci. */
export function goldenSpiral(scale: number): string {
  const fib = [1, 1, 2, 3, 5, 8, 13, 21];
  let x = C;
  let y = C;
  let d = `M${f(x)} ${f(y)} `;
  // direções: direita, cima, esquerda, baixo (quartos de volta anti-horários)
  const dirs = [
    [1, -1],
    [-1, -1],
    [-1, 1],
    [1, 1],
  ];
  for (let i = 0; i < fib.length; i++) {
    const r = fib[i] * scale;
    const [dx, dy] = dirs[i % 4];
    const nx = x + dx * r;
    const ny = y + dy * r;
    d += `A${f(r)} ${f(r)} 0 0 1 ${f(nx)} ${f(ny)} `;
    x = nx;
    y = ny;
  }
  return d;
}

/** Lua crescente centrada em (cx, cy). */
export function crescent(cx: number, cy: number, r: number): string {
  return `M${f(cx)} ${f(cy - r)} A${f(r)} ${f(r)} 0 1 0 ${f(cx)} ${f(cy + r)} A${f(r * 0.78)} ${f(r * 0.78)} 0 1 1 ${f(cx)} ${f(cy - r)} Z`;
}

/** Cortina de aurora: faixa vertical ondulada, da base (r0) ao topo (r1), num ângulo. */
export function curtain(deg: number, r0: number, r1: number, widthDeg: number): string {
  const a = polar(r0, deg - widthDeg / 2);
  const b = polar(r0, deg + widthDeg / 2);
  const t1 = polar(r1, deg + widthDeg * 0.9);
  const t2 = polar(r1, deg - widthDeg * 0.3);
  const m1 = polar((r0 + r1) / 2, deg + widthDeg * 1.1);
  const m2 = polar((r0 + r1) / 2, deg - widthDeg * 0.9);
  return `M${f(a.x)} ${f(a.y)} L${f(b.x)} ${f(b.y)} Q${f(m1.x)} ${f(m1.y)} ${f(t1.x)} ${f(t1.y)} L${f(t2.x)} ${f(t2.y)} Q${f(m2.x)} ${f(m2.y)} ${f(a.x)} ${f(a.y)} Z`;
}
