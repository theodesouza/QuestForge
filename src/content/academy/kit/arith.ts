/**
 * Aritmética dos naturais para geradores e laboratórios: fatoração, divisores, MMC e MDC
 * de vários números.
 */
import { gcd, lcm, sup } from './format';

/** Fatoração em primos: 360 → [[2, 3], [3, 2], [5, 1]]. */
export function factorize(n: number): [number, number][] {
  const out: [number, number][] = [];
  let m = Math.round(Math.abs(n));
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (m > 1) out.push([m, 1]);
  return out;
}

/** Potências de primos por extenso: [[2, 3], [5, 1]] → "2³ × 5". */
export function powersText(parts: [number, number][]): string {
  return parts.map(([p, e]) => (e === 1 ? `${p}` : `${p}${sup(e)}`)).join(' × ');
}

/** Fatoração por extenso: 360 → "2³ × 3² × 5". */
export function factorText(n: number): string {
  return n === 1 ? '1' : powersText(factorize(n));
}

export function divisors(n: number): number[] {
  const small: number[] = [];
  const large: number[] = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d) continue;
    small.push(d);
    if (d * d !== n) large.unshift(n / d);
  }
  return [...small, ...large];
}

export function divisorCount(n: number): number {
  return factorize(n).reduce((total, [, e]) => total * (e + 1), 1);
}

export function isPrime(n: number): boolean {
  const f = factorize(n);
  return n > 1 && f.length === 1 && f[0][1] === 1;
}

export function gcdAll(ns: number[]): number {
  return ns.reduce((g, x) => gcd(g, x));
}

export function lcmAll(ns: number[]): number {
  return ns.reduce((m, x) => lcm(m, x));
}
