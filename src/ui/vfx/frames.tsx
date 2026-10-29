/**
 * Molduras com estilos próprios do astrolábio. Cada estilo devolve duas partes:
 *   fixed   — desenhado no mesmo SVG do disco (anel + enfeites parados);
 *   moving  — o que se mexe (raios girando, runas acendendo, reflexo nos cristais),
 *             que o Astrolabe embrulha numa camada animada e a miniatura desenha parado.
 * As medidas seguem `w` (a espessura do anel), então o mesmo desenho serve no astrolábio
 * (raio 84) e na miniatura (raio 14) — só muda a quantidade de peças (`compact`).
 */
import type { ReactNode } from 'react';
import { Circle, Ellipse, G, Line, Path, Polygon } from 'react-native-svg';
import { CUSTOM_FRAME_STYLES, type CustomFrameStyle, type FrameStyle } from '../../content/items';
import { C } from './engine';
import { arc, polar, ray, wavyCircle } from './geometry';

export interface FrameOpts {
  color: string;
  color2: string;
  r: number;
  w: number;
  cx?: number;
  cy?: number;
  /** Miniatura: menos peças, traço proporcionalmente mais grosso. */
  compact?: boolean;
}

export type FrameMotion = { kind: 'spin'; period: number; reverse?: boolean } | { kind: 'breathe'; period: number; opacity: [number, number] };

export interface FrameParts {
  fixed: ReactNode;
  moving?: ReactNode;
  motion?: FrameMotion;
}

const f = (n: number) => n.toFixed(2);

/** Um desenho por estilo próprio — o compilador garante que nenhum fica sem (os estilos antigos seguem no Astrolabe). */
const BUILDERS: Record<CustomFrameStyle, (o: FrameOpts) => FrameParts> = {
  beaded,
  chain,
  scalloped,
  rays,
  laurel,
  runic,
  shards,
  polygon,
  cubes,
};

export const isCustomFrame = (s: FrameStyle | undefined): s is CustomFrameStyle => !!s && (CUSTOM_FRAME_STYLES as readonly string[]).includes(s);

export function frameParts(style: CustomFrameStyle, o: FrameOpts): FrameParts {
  return BUILDERS[style](o);
}

function ring(o: FrameOpts, width = o.w) {
  return <Circle cx={o.cx ?? C} cy={o.cy ?? C} r={o.r} stroke={o.color} strokeWidth={width} fill="none" />;
}

/** Pérolas: fio fino e contas marfim; algumas "brilham" de tempos em tempos. */
function beaded(o: FrameOpts): FrameParts {
  const { r, w, color, color2 } = o;
  const cx = o.cx ?? C;
  const cy = o.cy ?? C;
  const n = o.compact ? 10 : 28;
  const br = o.compact ? w * 0.75 : w * 1.2;
  const at = (i: number) => polar(r, (360 / n) * i + 360 / n / 2, cx, cy);
  return {
    fixed: (
      <>
        {ring(o, w * 0.5)}
        {Array.from({ length: n }, (_, i) => {
          const p = at(i);
          return (
            <G key={i}>
              <Circle cx={p.x} cy={p.y} r={br} fill={color2} stroke={color} strokeOpacity={0.7} strokeWidth={Math.max(0.4, w * 0.2)} />
              <Circle cx={p.x - br * 0.32} cy={p.y - br * 0.34} r={br * 0.32} fill="#FFFFFF" fillOpacity={0.85} />
            </G>
          );
        })}
      </>
    ),
    moving: (
      <G fill="#FFFFFF">
        {Array.from({ length: n }, (_, i) => i)
          .filter((i) => i % 4 === 1)
          .map((i) => {
            const p = at(i);
            return <Circle key={i} cx={p.x} cy={p.y} r={br * 1.35} fillOpacity={0.5} />;
          })}
      </G>
    ),
    motion: { kind: 'breathe', period: 3200, opacity: [0.1, 0.9] },
  };
}

/** Corrente: elos de frente (ovais vazados) alternando com elos de perfil (barras). */
function chain(o: FrameOpts): FrameParts {
  const { r, w, color, color2 } = o;
  const cx = o.cx ?? C;
  const cy = o.cy ?? C;
  const n = o.compact ? 10 : 22;
  const span = (2 * Math.PI * r) / n;
  return {
    fixed: (
      <>
        {Array.from({ length: n }, (_, i) => {
          const a = (360 / n) * i;
          const p = polar(r, a, cx, cy);
          if (i % 2 === 0) {
            return <Ellipse key={i} cx={p.x} cy={p.y} rx={span * 0.68} ry={w * 1.15} stroke={color} strokeWidth={w * 0.8} fill="none" transform={`rotate(${f(a)} ${f(p.x)} ${f(p.y)})`} />;
          }
          const t = (a * Math.PI) / 180;
          const dx = Math.cos(t) * span * 0.42;
          const dy = Math.sin(t) * span * 0.42;
          return <Line key={i} x1={p.x - dx} y1={p.y - dy} x2={p.x + dx} y2={p.y + dy} stroke={color2} strokeWidth={w * 1.1} strokeLinecap="round" />;
        })}
      </>
    ),
  };
}

/** Ondas: anel de festões voltados para fora, com fio interno e pontas nas junções. */
function scalloped(o: FrameOpts): FrameParts {
  const { r, w, color, color2 } = o;
  const cx = o.cx ?? C;
  const cy = o.cy ?? C;
  const n = o.compact ? 8 : 24;
  const chord = 2 * r * Math.sin(Math.PI / n);
  const rr = chord * 0.56;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = polar(r, (360 / n) * i, cx, cy);
    const b = polar(r, (360 / n) * (i + 1), cx, cy);
    d += `${i === 0 ? `M${f(a.x)} ${f(a.y)} ` : ''}A${f(rr)} ${f(rr)} 0 0 1 ${f(b.x)} ${f(b.y)} `;
  }
  return {
    fixed: (
      <>
        <Path d={`${d}Z`} stroke={color} strokeWidth={w * 0.9} strokeLinejoin="round" fill="none" />
        <Circle cx={cx} cy={cy} r={r - w * 2.2} stroke={color2} strokeOpacity={0.7} strokeWidth={w * 0.35} fill="none" />
        <G fill={color2}>
          {Array.from({ length: n }, (_, i) => {
            const p = polar(r, (360 / n) * i, cx, cy);
            return <Circle key={i} cx={p.x} cy={p.y} r={w * 0.5} />;
          })}
        </G>
      </>
    ),
    moving: o.compact ? undefined : <Path d={wavyCircle(r - w * 4.2, 1.5, 18)} stroke={color2} strokeOpacity={0.6} strokeWidth={w * 0.3} fill="none" />,
    motion: { kind: 'spin', period: 42000, reverse: true },
  };
}

/** Sol nascente: anel firme e uma coroa de raios que gira muito devagar. */
function rays(o: FrameOpts): FrameParts {
  const { r, w, color, color2 } = o;
  const cx = o.cx ?? C;
  const cy = o.cy ?? C;
  const n = o.compact ? 8 : 20;
  const long = o.compact ? w * 1.7 : 11;
  const short = o.compact ? w * 1.0 : 6.5;
  const crown = (
    <>
      <G fill={color}>
        {Array.from({ length: n }, (_, i) => (
          <Polygon key={i} points={rayAt(i * (360 / n), r + w * 0.6, r + w * 0.6 + long, 360 / n / 4.2, cx, cy)} />
        ))}
      </G>
      <G fill={color2} fillOpacity={0.9}>
        {Array.from({ length: n }, (_, i) => (
          <Polygon key={i} points={rayAt(i * (360 / n) + 180 / n, r + w * 0.6, r + w * 0.6 + short, 360 / n / 5.5, cx, cy)} />
        ))}
      </G>
    </>
  );
  return {
    fixed: (
      <>
        {ring(o, w * 1.1)}
        <Circle cx={cx} cy={cy} r={r - w * 2.6} stroke={color2} strokeOpacity={0.6} strokeWidth={w * 0.35} fill="none" />
        {o.compact ? crown : null}
      </>
    ),
    moving: o.compact ? undefined : crown,
    motion: { kind: 'spin', period: 80000 },
  };
}

/** `ray` com centro configurável (a miniatura não está centrada no palco). */
function rayAt(deg: number, r0: number, r1: number, half: number, cx: number, cy: number): string {
  if (cx === C && cy === C) return ray(deg, r0, r1, half);
  const a = polar(r0, deg - half, cx, cy);
  const b = polar(r1, deg, cx, cy);
  const c = polar(r0, deg + half, cx, cy);
  return `${f(a.x)},${f(a.y)} ${f(b.x)},${f(b.y)} ${f(c.x)},${f(c.y)}`;
}

/** Louros: dois ramos que sobem do pé do anel; folhas por fora (cor) e por dentro (cor 2). */
function laurel(o: FrameOpts): FrameParts {
  const { r, w, color, color2 } = o;
  const cx = o.cx ?? C;
  const cy = o.cy ?? C;
  const perBranch = o.compact ? 5 : 9;
  const sweep = o.compact ? 118 : 132;
  const leaves: ReactNode[] = [];
  for (const dir of [-1, 1]) {
    for (let k = 0; k < perBranch; k++) {
      const a = dir === -1 ? 172 - (sweep * k) / (perBranch - 1) : 188 + (sweep * k) / (perBranch - 1);
      const t = (a * Math.PI) / 180;
      // Sentido de subida do ramo: o da direita (dir -1) tem o ângulo diminuindo; o da esquerda, aumentando.
      const tr = { x: dir === 1 ? Math.cos(t) : -Math.cos(t), y: dir === 1 ? Math.sin(t) : -Math.sin(t) };
      const out = { x: Math.sin(t), y: -Math.cos(t) };
      const base = (Math.atan2(tr.y, tr.x) * 180) / Math.PI;
      const rotate = (deg: number) => {
        const q = ((base + deg) * Math.PI) / 180;
        return Math.cos(q) * out.x + Math.sin(q) * out.y;
      };
      const tilt = rotate(32) > rotate(-32) ? 32 : -32; // inclina a folha de fora para fora
      const p = polar(r, a, cx, cy);
      const len = w * (o.compact ? 2.2 : 4.4) * (1 - 0.3 * (k / perBranch));
      const wid = w * (o.compact ? 0.8 : 1.25) * (1 - 0.25 * (k / perBranch));
      const place = (deg: number, off: number) => {
        const q = ((base + deg) * Math.PI) / 180;
        const mx = p.x + Math.cos(q) * len * 0.5 + out.x * off;
        const my = p.y + Math.sin(q) * len * 0.5 + out.y * off;
        return { mx, my, rot: base + deg };
      };
      const outer = place(tilt, w * 0.2);
      const inner = place(-tilt, -w * 0.2);
      leaves.push(
        <G key={`${dir}-${k}`}>
          <Ellipse cx={outer.mx} cy={outer.my} rx={len / 2} ry={wid} fill={color} stroke={color2} strokeOpacity={0.5} strokeWidth={Math.max(0.3, w * 0.15)} transform={`rotate(${f(outer.rot)} ${f(outer.mx)} ${f(outer.my)})`} />
          <Ellipse cx={inner.mx} cy={inner.my} rx={len / 2} ry={wid * 0.85} fill={color2} fillOpacity={0.9} transform={`rotate(${f(inner.rot)} ${f(inner.mx)} ${f(inner.my)})`} />
        </G>,
      );
    }
  }
  const bow = polar(r + w * 0.4, 180, cx, cy);
  return {
    fixed: (
      <>
        {ring(o, w * 0.8)}
        {leaves}
        <Circle cx={bow.x} cy={bow.y} r={w * 0.95} fill={color2} stroke={color} strokeWidth={Math.max(0.3, w * 0.2)} />
      </>
    ),
  };
}

/** Runas: seis sinais (repetidos) em volta do anel; no astrolábio, acendem e apagam devagar. */
const RUNES = [
  'M0 -1.4 L0 1.4 M0 -0.6 L0.9 0.2',
  'M-0.7 -1.4 L-0.7 1.4 M-0.7 -1.4 L0.7 -0.2 L-0.7 0.9',
  'M0 -1.4 L0 1.4 M0 -0.9 L0.8 -0.2 M0 -0.1 L0.8 0.6',
  'M-0.8 -1.4 L0.8 1.4 M0.8 -1.4 L-0.8 1.4',
  'M0 -1.4 L0.8 0 L0 1.4 L-0.8 0 Z',
  'M-0.7 1.4 L-0.7 -1.4 L0.7 -0.4 L-0.7 0.6',
];

function runic(o: FrameOpts): FrameParts {
  const { r, w, color, color2 } = o;
  const cx = o.cx ?? C;
  const cy = o.cy ?? C;
  const n = o.compact ? 6 : 12;
  const s = o.compact ? w * 0.5 : w * 1.5;
  const glyphs = (
    <G stroke={color2} strokeWidth={o.compact ? 0.7 : 0.9} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {Array.from({ length: n }, (_, i) => {
        const a = (360 / n) * i;
        const p = polar(r + w * 2.4 + s * 1.4, a, cx, cy);
        return <Path key={i} d={RUNES[i % RUNES.length]} transform={`translate(${f(p.x)} ${f(p.y)}) rotate(${f(a)}) scale(${f(s)})`} />;
      })}
    </G>
  );
  return {
    fixed: (
      <>
        {ring(o, w)}
        <Circle cx={cx} cy={cy} r={r + w * 1.7} stroke={color} strokeOpacity={0.5} strokeWidth={w * 0.3} fill="none" />
        {o.compact ? glyphs : null}
      </>
    ),
    moving: o.compact ? undefined : glyphs,
    motion: { kind: 'breathe', period: 3800, opacity: [0.55, 1] },
  };
}

/** Cristais: espinhos facetados para fora; um reflexo percorre o anel. */
function shards(o: FrameOpts): FrameParts {
  const { r, w, color, color2 } = o;
  const cx = o.cx ?? C;
  const cy = o.cy ?? C;
  const n = o.compact ? 8 : 16;
  const half = 360 / n / 2.3;
  return {
    fixed: (
      <>
        {ring(o, w * 0.8)}
        {Array.from({ length: n }, (_, i) => {
          const a = (360 / n) * i;
          const len = (i % 2 === 0 ? 1 : 0.55) * (o.compact ? w * 2.2 : 15);
          const tip = polar(r + len, a, cx, cy);
          const l = polar(r, a - half, cx, cy);
          const rgt = polar(r, a + half, cx, cy);
          const mid = polar(r + len * 0.45, a, cx, cy);
          return (
            <G key={i}>
              <Polygon points={`${f(l.x)},${f(l.y)} ${f(tip.x)},${f(tip.y)} ${f(mid.x)},${f(mid.y)}`} fill={color} fillOpacity={0.55} stroke={color} strokeWidth={Math.max(0.3, w * 0.25)} strokeLinejoin="round" />
              <Polygon points={`${f(rgt.x)},${f(rgt.y)} ${f(tip.x)},${f(tip.y)} ${f(mid.x)},${f(mid.y)}`} fill={color2} fillOpacity={0.5} stroke={color} strokeWidth={Math.max(0.3, w * 0.25)} strokeLinejoin="round" />
            </G>
          );
        })}
      </>
    ),
    moving: (
      <>
        <Path d={arc(r + w * 0.4, -16, 16, cx, cy)} stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={w * 0.9} strokeLinecap="round" fill="none" />
        <Polygon points={sparkle(polar(r + w * (o.compact ? 3 : 4.5), 0, cx, cy), w * (o.compact ? 1.2 : 1.6))} fill="#FFFFFF" />
      </>
    ),
    motion: { kind: 'spin', period: 12000 },
  };
}

/** Pontos de um polígono regular de n lados inscrito no raio r, com um vértice voltado para cima. */
function regular(n: number, r: number, cx: number, cy: number): string {
  return Array.from({ length: n }, (_, i) => {
    const p = polar(r, (360 / n) * i, cx, cy);
    return `${f(p.x)},${f(p.y)}`;
  }).join(' ');
}

/**
 * Torres: anel firme com um octógono por fora (um rebite em cada vértice) e, no astrolábio,
 * um triângulo e um quadrado inscritos numa circunferência pontilhada, girando devagar —
 * régua e compasso do Colosso Euclidiano.
 */
function polygon(o: FrameOpts): FrameParts {
  const { r, w, color, color2 } = o;
  const cx = o.cx ?? C;
  const cy = o.cy ?? C;
  const n = o.compact ? 6 : 8;
  const R = r + w * 1.3;
  const rivet = o.compact ? w * 0.5 : w * 0.62;
  const rr = r + w * 3.6;
  return {
    fixed: (
      <>
        {ring(o, w * 0.75)}
        <Polygon points={regular(n, R, cx, cy)} stroke={color} strokeWidth={w * 0.55} strokeLinejoin="round" fill="none" />
        <G fill={color2}>
          {Array.from({ length: n }, (_, i) => {
            const p = polar(R, (360 / n) * i, cx, cy);
            return <Circle key={i} cx={p.x} cy={p.y} r={rivet} />;
          })}
        </G>
      </>
    ),
    moving: o.compact ? undefined : (
      <G stroke={color2} strokeOpacity={0.75} strokeWidth={w * 0.3} strokeLinejoin="round" fill="none">
        <Circle cx={cx} cy={cy} r={rr} strokeDasharray="1.5 4" strokeLinecap="round" />
        <Polygon points={regular(3, rr, cx, cy)} />
        <Polygon points={regular(4, rr, cx, cy)} />
      </G>
    ),
    motion: { kind: 'spin', period: 70000 },
  };
}

/** Geodo: uma coroa de cubos isométricos (três faces à vista) em volta do anel; os topos brilham em ondas. */
function cubes(o: FrameOpts): FrameParts {
  const { r, w, color, color2 } = o;
  const cx = o.cx ?? C;
  const cy = o.cy ?? C;
  const n = o.compact ? 6 : 12;
  const s = o.compact ? w * 1.1 : w * 2.1;
  const k = 0.866;
  const at = (i: number) => polar(r + w * 0.9, (360 / n) * i + 360 / n / 2, cx, cy);
  const hex = (p: { x: number; y: number }, pts: [number, number][]) => pts.map(([dx, dy]) => `${f(p.x + dx * s)},${f(p.y + dy * s)}`).join(' ');
  const top: [number, number][] = [[0, -1], [k, -0.5], [0, 0], [-k, -0.5]];
  const left: [number, number][] = [[-k, -0.5], [0, 0], [0, 1], [-k, 0.5]];
  const right: [number, number][] = [[0, 0], [k, -0.5], [k, 0.5], [0, 1]];
  const edge = Math.max(0.3, w * 0.18);
  return {
    fixed: (
      <>
        {ring(o, w * 0.7)}
        {Array.from({ length: n }, (_, i) => {
          const p = at(i);
          return (
            <G key={i}>
              <Polygon points={hex(p, left)} fill={color} fillOpacity={0.9} stroke="#0B1020" strokeOpacity={0.55} strokeWidth={edge} strokeLinejoin="round" />
              <Polygon points={hex(p, right)} fill={color2} fillOpacity={0.75} stroke="#0B1020" strokeOpacity={0.55} strokeWidth={edge} strokeLinejoin="round" />
              <Polygon points={hex(p, right)} fill="#0B1020" fillOpacity={0.3} />
              <Polygon points={hex(p, top)} fill="#FFFFFF" fillOpacity={0.55} stroke="#0B1020" strokeOpacity={0.55} strokeWidth={edge} strokeLinejoin="round" />
            </G>
          );
        })}
      </>
    ),
    moving: o.compact ? undefined : (
      <G fill="#FFFFFF">
        {Array.from({ length: n }, (_, i) => i)
          .filter((i) => i % 3 === 0)
          .map((i) => (
            <Polygon key={i} points={hex(at(i), top)} fillOpacity={0.85} />
          ))}
      </G>
    ),
    motion: { kind: 'breathe', period: 3600, opacity: [0.05, 0.9] },
  };
}

function sparkle(p: { x: number; y: number }, d: number): string {
  return `${f(p.x)},${f(p.y - d)} ${f(p.x + d * 0.34)},${f(p.y)} ${f(p.x)},${f(p.y + d)} ${f(p.x - d * 0.34)},${f(p.y)}`;
}
