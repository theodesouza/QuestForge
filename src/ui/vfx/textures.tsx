/**
 * Texturas de superfície para a esfera (`Orb`). Cada uma é desenhada num ladrilho de 100 × 100 que
 * se repete na horizontal: o que encosta numa borda lateral é redesenhado do outro lado, então a
 * emenda não aparece quando a faixa desliza. As posições vêm de uma semente (sempre iguais).
 */
import type { ReactNode } from 'react';
import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import { rand } from './engine';

/** Põe o ladrilho de 100 unidades na escala do corpo (lado 2r). */
export function Tile({ r, children }: { r: number; children: ReactNode }) {
  return <G transform={`scale(${((2 * r) / 100).toFixed(4)})`}>{children}</G>;
}

/** Repete o que cruza a borda: chama `draw` em x e, se preciso, em x ± 100. */
function wrap(x: number, reach: number, draw: (x: number, key: string) => ReactNode, key: string): ReactNode[] {
  const out: ReactNode[] = [draw(x, key)];
  if (x + reach > 100) out.push(draw(x - 100, `${key}a`));
  if (x - reach < 0) out.push(draw(x + 100, `${key}b`));
  return out;
}

/** Faixas horizontais onduladas (gigantes gasosos). As ondas têm período inteiro: emendam sozinhas. */
export function Bands({ colors, seed = 3, wobble = 2.2 }: { colors: string[]; seed?: number; wobble?: number }) {
  const rnd = rand(seed);
  const n = colors.length;
  const edges = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? -4 : i === n ? 104 : (100 / n) * i + (rnd() - 0.5) * (60 / n)));
  return (
    <G>
      {colors.map((c, i) => {
        const y0 = edges[i];
        const y1 = edges[i + 1];
        const k = 2 + (i % 3);
        const ph = rnd() * 6.28;
        let top = `M0 ${y0.toFixed(1)}`;
        let bottom = '';
        for (let x = 0; x <= 100; x += 5) top += ` L${x} ${(y0 + Math.sin((x / 100) * 6.283 * k + ph) * wobble).toFixed(2)}`;
        for (let x = 100; x >= 0; x -= 5) bottom += ` L${x} ${(y1 + Math.sin((x / 100) * 6.283 * (k + 1) + ph) * wobble).toFixed(2)}`;
        return <Path key={i} d={`${top}${bottom} Z`} fill={c} />;
      })}
    </G>
  );
}

/** Manchas elípticas (granulação de estrela, crateras, nuvens, continentes arredondados). */
export function Blotches({ n, color, seed = 5, size = [4, 10], opacity = 0.5, flat = 0.6, band = [8, 92] }: { n: number; color: string; seed?: number; size?: [number, number]; opacity?: number; flat?: number; band?: [number, number] }) {
  const rnd = rand(seed);
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = rnd() * 100;
    const y = band[0] + rnd() * (band[1] - band[0]);
    const rx = size[0] + rnd() * (size[1] - size[0]);
    const ry = rx * (flat + rnd() * 0.3);
    const o = opacity * (0.6 + rnd() * 0.4);
    out.push(...wrap(x, rx, (px, k) => <Ellipse key={k} cx={px} cy={y} rx={rx} ry={ry} fill={color} fillOpacity={o} />, `b${i}`));
  }
  return <G>{out}</G>;
}

/** Crateras: aro claro e fundo escuro, deslocados (relevo). */
export function Craters({ n, seed = 9, light = '#FFFFFF', dark = '#000000' }: { n: number; seed?: number; light?: string; dark?: string }) {
  const rnd = rand(seed);
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = rnd() * 100;
    const y = 12 + rnd() * 76;
    const r = 2.5 + rnd() * 6;
    out.push(
      ...wrap(
        x,
        r + 1,
        (px, k) => (
          <G key={k}>
            <Circle cx={px + r * 0.12} cy={y + r * 0.12} r={r} fill={dark} fillOpacity={0.4} />
            <Circle cx={px} cy={y} r={r} fill="none" stroke={light} strokeOpacity={0.28} strokeWidth={0.9} />
            <Circle cx={px - r * 0.2} cy={y - r * 0.2} r={r * 0.55} fill={dark} fillOpacity={0.22} />
          </G>
        ),
        `c${i}`,
      ),
    );
  }
  return <G>{out}</G>;
}

/** Continentes: polígonos irregulares. */
export function Lands({ n, color, seed = 12, size = [9, 17], edge }: { n: number; color: string; seed?: number; size?: [number, number]; edge?: string }) {
  const rnd = rand(seed);
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = rnd() * 100;
    const y = 16 + rnd() * 68;
    const r = size[0] + rnd() * (size[1] - size[0]);
    const pts = Array.from({ length: 9 }, (_, j) => {
      const a = (j / 9) * 6.283;
      const rr = r * (0.55 + rnd() * 0.6);
      return [Math.cos(a) * rr, Math.sin(a) * rr * 0.72] as const;
    });
    out.push(
      ...wrap(
        x,
        r * 1.2,
        (px, k) => <Polygon key={k} points={pts.map(([dx, dy]) => `${(px + dx).toFixed(1)},${(y + dy).toFixed(1)}`).join(' ')} fill={color} stroke={edge} strokeOpacity={0.5} strokeWidth={edge ? 0.8 : 0} strokeLinejoin="round" />,
        `l${i}`,
      ),
    );
  }
  return <G>{out}</G>;
}

/** Fissuras: linhas quebradas que brilham (lava, gelo rachado, casca de ovo). */
export function Cracks({ n, color, seed = 21, width = 1.1, opacity = 0.9, glow }: { n: number; color: string; seed?: number; width?: number; opacity?: number; glow?: string }) {
  const rnd = rand(seed);
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = rnd() * 100;
    const y = 10 + rnd() * 80;
    const steps = 4 + Math.floor(rnd() * 3);
    let dx = 0;
    let dy = 0;
    const seg: [number, number][] = [[0, 0]];
    for (let j = 0; j < steps; j++) {
      dx += (rnd() - 0.35) * 9;
      dy += (rnd() - 0.5) * 12;
      seg.push([dx, dy]);
    }
    const reach = Math.max(...seg.map(([sx]) => Math.abs(sx))) + 2;
    out.push(
      ...wrap(
        x,
        reach,
        (px, k) => {
          const d = seg.map(([sx, sy], j) => `${j ? 'L' : 'M'}${(px + sx).toFixed(1)} ${(y + sy).toFixed(1)}`).join(' ');
          return (
            <G key={k}>
              {glow ? <Path d={d} stroke={glow} strokeOpacity={0.35} strokeWidth={width * 3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
              <Path d={d} stroke={color} strokeOpacity={opacity} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </G>
          );
        },
        `k${i}`,
      ),
    );
  }
  return <G>{out}</G>;
}

/** Calotas polares (faixas no alto e embaixo): emendam sozinhas. */
export function Caps({ color = '#FFFFFF', size = 14, opacity = 0.9 }: { color?: string; size?: number; opacity?: number }) {
  let top = 'M0 -4';
  let bot = 'M0 104';
  for (let x = 0; x <= 100; x += 5) {
    top += ` L${x} ${(size + Math.sin((x / 100) * 6.283 * 3) * 2.4).toFixed(2)}`;
    bot += ` L${x} ${(100 - size * 0.8 + Math.sin((x / 100) * 6.283 * 4 + 1) * 2).toFixed(2)}`;
  }
  return (
    <G fill={color} fillOpacity={opacity}>
      <Path d={`${top} L100 -4 Z`} />
      <Path d={`${bot} L100 104 Z`} />
    </G>
  );
}

/** Pontos de luz (cidades à noite, estrelas presas numa nebulosa). */
export function Lights({ n, color, seed = 31, size = [0.5, 1.3], clusters = 0 }: { n: number; color: string; seed?: number; size?: [number, number]; clusters?: number }) {
  const rnd = rand(seed);
  const hubs = Array.from({ length: clusters }, () => [rnd() * 100, 20 + rnd() * 60] as const);
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const hub = clusters ? hubs[i % clusters] : null;
    const x = hub ? (hub[0] + (rnd() - 0.5) * 22 + 100) % 100 : rnd() * 100;
    const y = hub ? hub[1] + (rnd() - 0.5) * 16 : 10 + rnd() * 80;
    const r = size[0] + rnd() * (size[1] - size[0]);
    out.push(<Circle key={i} cx={x} cy={y} r={r} fill={color} fillOpacity={0.55 + rnd() * 0.45} />);
  }
  return <G>{out}</G>;
}

/** Meridianos e paralelos (cascas, esferas de Dyson, redes): linhas verticais que "giram" com a faixa. */
export function Lattice({ color, cols = 6, rows = 4, width = 1, opacity = 0.8, hex = false }: { color: string; cols?: number; rows?: number; width?: number; opacity?: number; hex?: boolean }) {
  const out: ReactNode[] = [];
  const step = 100 / cols;
  if (hex) {
    const h = 100 / (rows * 1.5);
    for (let row = -1; row <= rows * 1.5 + 1; row++) {
      for (let col = -1; col <= cols; col++) {
        const x = col * step + (row % 2 ? step / 2 : 0);
        const y = row * h * 1.0;
        out.push(<Polygon key={`${row}-${col}`} points={`${x},${y - h * 0.62} ${x + step * 0.46},${y - h * 0.3} ${x + step * 0.46},${y + h * 0.3} ${x},${y + h * 0.62} ${x - step * 0.46},${y + h * 0.3} ${x - step * 0.46},${y - h * 0.3}`} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth={width} />);
      }
    }
    return <G>{out}</G>;
  }
  for (let i = 0; i < cols; i++) out.push(<Line key={`v${i}`} x1={i * step} y1={0} x2={i * step} y2={100} stroke={color} strokeOpacity={opacity} strokeWidth={width} />);
  for (let j = 1; j < rows; j++) out.push(<Line key={`h${j}`} x1={0} y1={(100 / rows) * j} x2={100} y2={(100 / rows) * j} stroke={color} strokeOpacity={opacity * 0.7} strokeWidth={width * 0.8} />);
  return <G>{out}</G>;
}

/** Fundo liso do ladrilho (quando a textura precisa cobrir a cor do corpo). */
export function Wash({ color, opacity = 1 }: { color: string; opacity?: number }) {
  return <Rect x={-2} y={-2} width={104} height={104} fill={color} fillOpacity={opacity} />;
}

/** Dois hemisférios (metade clara, metade escura) — estrelas estranhas, mundos travados pela maré. */
export function Halves({ a, b }: { a: string; b: string }) {
  return (
    <G>
      <Rect x={0} y={-2} width={50} height={104} fill={a} />
      <Rect x={50} y={-2} width={50} height={104} fill={b} />
    </G>
  );
}
