/**
 * Formatação numérica em português (vírgula decimal, ponto de milhar), sem depender de
 * Intl — o resultado é idêntico no aparelho, na web e nos testes.
 */

/** Arredonda para `d` casas decimais (meio para cima, sem ruído de ponto flutuante). */
export function round(n: number, d = 2): number {
  const f = Math.pow(10, d);
  return Math.round((n + Math.sign(n) * Number.EPSILON) * f) / f;
}

function group(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Exatamente `d` casas decimais: fixed(2.5, 2) → "2,50"; fixed(1234, 0) → "1.234". */
export function fixed(n: number, d: number): string {
  const r = round(Math.abs(n), d).toFixed(d);
  const [i, dec] = r.split('.');
  const sign = n < 0 && Number(r) !== 0 ? '−' : '';
  return sign + group(i) + (dec ? `,${dec}` : '');
}

/** Até `max` casas decimais, sem zeros à direita: num(2.50) → "2,5"; num(1/3, 3) → "0,333". */
export function num(n: number, max = 2): string {
  const s = fixed(n, max);
  return s.includes(',') ? s.replace(/,?0+$/, '') : s;
}

/** Valor em reais: brl(1234.5) → "R$ 1.234,50". */
export function brl(n: number): string {
  return `R$ ${fixed(n, 2)}`;
}

/** Porcentagem: pct(12.5) → "12,5%". O valor já vem em pontos percentuais. */
export function pct(n: number, max = 2): string {
  return `${num(n, max)}%`;
}

/** Fração irredutível a partir de numerador e denominador inteiros. */
export function frac(a: number, b: number): string {
  const g = gcd(Math.abs(a), Math.abs(b)) || 1;
  const sign = a * b < 0 ? '−' : '';
  return `${sign}${Math.abs(a) / g}/${Math.abs(b) / g}`;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) [x, y] = [y, x % y];
  return x;
}

export function lcm(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b);
}

/** Horas decimais em "h min": hm(3.5) → "3 h 30 min"; hm(2) → "2 h". */
export function hm(hours: number): string {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

/** Expoente em sobrescrito: sup(-3) → "⁻³". */
export function sup(n: number): string {
  return String(n).split('').map((c) => SUP[c] ?? c).join('');
}

/** Notação científica com mantissa entre 1 e 10: sci(45000) → "4,5 × 10⁴". */
export function sci(n: number, max = 3): string {
  if (n === 0) return '0';
  let e = Math.floor(Math.log10(Math.abs(n)));
  let m = round(n / Math.pow(10, e), max);
  if (Math.abs(m) >= 10) {
    m = round(m / 10, max);
    e += 1;
  }
  return `${num(m, max)} × 10${sup(e)}`;
}
