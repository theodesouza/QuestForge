/**
 * Auras — cada uma com movimento e padrão próprios (não é o mesmo halo com outra cor):
 *   Brasa      (comum)    anel de chamas vivas + brasas subindo
 *   Névoa      (comum)    nuvens que derivam devagar ao redor
 *   Maré       (incomum)  anéis ondulados girando + ondulações + gotas
 *   Lunar      (incomum)  halo prateado, lua crescente em órbita, estrelas
 *   Boreal     (raro)     cortinas de aurora balançando + faíscas
 *   Nebulosa   (épico)    galáxia em espiral, nuvens, poeira estelar em órbita
 *   Áurea      (lendário) explosão solar, espiral e pentagrama áureos, motas φ, clarão
 *   Zênite     (lendário) coroa celeste, raios, órbitas com cometas, chuva de luz
 * `Back` fica atrás do disco do astrolábio; `Front`, na frente.
 */
import { useId, type ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Path, Polygon, Polyline, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { Breathe, C, Extra, Glimmer, Layer, Particles, Spin, Sway, Wave } from './engine';
import { crescent, curtain, flame, goldenSpiral, lightning, ngon, polar, ray, spiral, star, wavyCircle } from './geometry';
import type { AuraFxId } from './rules';

export interface AuraProps {
  v: ItemVisual;
}

interface AuraFx {
  Back: (p: AuraProps) => ReactNode;
  Front?: (p: AuraProps) => ReactNode;
}

function useGid(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

/** Anel de brilho radial entre r0 e r1. */
function HaloRing({ id, color, color2, r0, r1, opacity }: { id: string; color: string; color2?: string; r0: number; r1: number; opacity: number }) {
  const k = r0 / r1;
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset={k * 0.92} stopColor={color} stopOpacity={0} />
          <Stop offset={k + (1 - k) * 0.25} stopColor={color} stopOpacity={opacity} />
          <Stop offset={k + (1 - k) * 0.6} stopColor={color2 ?? color} stopOpacity={opacity * 0.45} />
          <Stop offset="1" stopColor={color2 ?? color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={C} cy={C} r={r1} fill={`url(#${id})`} />
    </>
  );
}

// ——————————————————————————————————————————————— comum

const Brasa: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('bh');
    return (
      <>
        <Breathe period={3000} scale={[0.98, 1.02]} opacity={[0.55, 0.9]}>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={80} r1={110} opacity={0.32} />
        </Breathe>
        <Breathe period={1300} scale={[0.99, 1.02]} opacity={[0.45, 0.75]}>
          <G fill={v.color} fillOpacity={0.6}>
            {Array.from({ length: 18 }, (_, i) => (
              <Path key={i} d={flame(i * 20, 83, 9 + (i % 3) * 3.5, 8, i % 2 ? 4 : -4)} />
            ))}
          </G>
        </Breathe>
        <Extra>
          <Breathe period={1300} phase={0.5} scale={[0.99, 1.02]} opacity={[0.4, 0.7]}>
            <G fill={v.color2 ?? v.color} fillOpacity={0.7}>
              {Array.from({ length: 18 }, (_, i) => (
                <Path key={i} d={flame(i * 20 + 10, 83, 6 + (i % 2) * 3, 6, i % 2 ? -3 : 3)} />
              ))}
            </G>
          </Breathe>
        </Extra>
      </>
    );
  },
  Front: ({ v }) => (
    <Particles mode="rise" count={4} period={3200} colors={[v.color2 ?? v.color, v.color]} size={[2.4, 3.6]} radius={[86, 96]} arc={[110, 250]} travel={60} seed={41} />
  ),
};

const Nevoa: AuraFx = {
  Back: ({ v }) => {
    const ids = [useGid('n1'), useGid('n2'), useGid('n3')];
    const h = useGid('nh');
    const blob = (id: string, deg: number, rx: number, ry: number, color: string) => {
      const p = polar(97, deg);
      return (
        <>
          <Defs>
            <RadialGradient id={id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={color} stopOpacity={0.55} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={p.x} cy={p.y} rx={rx} ry={ry} fill={`url(#${id})`} transform={`rotate(${deg} ${p.x} ${p.y})`} />
        </>
      );
    };
    return (
      <>
        <Layer>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={82} r1={112} opacity={0.28} />
        </Layer>
        <Spin period={46000}>{blob(ids[0], 20, 42, 20, v.color2 ?? v.color)}</Spin>
        <Spin period={62000} reverse>
          {blob(ids[1], 150, 46, 18, v.color)}
        </Spin>
        <Extra>
          <Spin period={80000}>{blob(ids[2], 260, 38, 16, v.color2 ?? v.color)}</Spin>
        </Extra>
      </>
    );
  },
};

// ——————————————————————————————————————————————— incomum

const Mare: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('mh');
    return (
      <>
        <Layer>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={80} r1={116} opacity={0.32} />
        </Layer>
        <Wave period={3600} from={84} to={118} drawnAt={100} peak={0.55}>
          <Circle cx={C} cy={C} r={100} stroke={v.color} strokeWidth={1.4} fill="none" />
        </Wave>
        <Extra>
          <Wave period={3600} phase={0.5} from={84} to={118} drawnAt={100} peak={0.45}>
            <Circle cx={C} cy={C} r={100} stroke={v.color2 ?? v.color} strokeWidth={1.1} fill="none" />
          </Wave>
        </Extra>
        <Spin period={18000}>
          <Path d={wavyCircle(95, 3, 9)} stroke={v.color} strokeOpacity={0.85} strokeWidth={1.8} fill="none" />
        </Spin>
        <Extra min={0.8}>
          <Spin period={26000} reverse>
            <Path d={wavyCircle(104, 2.2, 13, 40)} stroke={v.color2 ?? v.color} strokeOpacity={0.55} strokeWidth={1.2} fill="none" />
          </Spin>
        </Extra>
      </>
    );
  },
  Front: ({ v }) => (
    <Particles mode="orbit" count={6} period={9000} colors={['#BFFFF0', v.color]} size={[2.6, 3.6]} radius={[96, 108]} tilt={0.92} seed={52} />
  ),
};

const Lunar: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('lh');
    const top = polar(104, 0);
    return (
      <>
        <Breathe period={4200} opacity={[0.7, 1]}>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={82} r1={114} opacity={0.4} />
          <Circle cx={C} cy={C} r={97} stroke={v.color} strokeOpacity={0.7} strokeWidth={1.1} fill="none" />
        </Breathe>
        <Extra>
          <Spin period={40000} reverse>
            <Circle cx={C} cy={C} r={110} stroke={v.color2 ?? v.color} strokeOpacity={0.5} strokeWidth={0.8} strokeDasharray="1 6" strokeLinecap="round" fill="none" />
          </Spin>
        </Extra>
        <Spin period={16000}>
          <Path d={crescent(top.x, top.y, 7.5)} fill="#F3F7FF" />
          <Circle cx={top.x} cy={top.y} r={11} fill={v.color} fillOpacity={0.14} />
        </Spin>
      </>
    );
  },
  Front: ({ v }) => (
    <Particles mode="twinkle" count={8} period={3600} colors={['#FFFFFF', v.color2 ?? v.color]} size={[3, 4.6]} radius={[90, 116]} sparkle seed={63} />
  ),
};

// ——————————————————————————————————————————————— raro

const Boreal: AuraFx = {
  Back: ({ v }) => {
    const g1 = useGid('ba');
    const g2 = useGid('bb');
    const h = useGid('bc');
    // Gradiente no espaço do palco (não no de cada cortina): base forte no disco, topo se dissolvendo.
    const grad = (id: string, c: string) => (
      <Defs>
        <RadialGradient id={id} gradientUnits="userSpaceOnUse" cx={C} cy={C} r={122}>
          <Stop offset="0.64" stopColor={c} stopOpacity={0.95} />
          <Stop offset="0.8" stopColor={c} stopOpacity={0.55} />
          <Stop offset="1" stopColor={c} stopOpacity={0} />
        </RadialGradient>
      </Defs>
    );
    const set = (id: string, c: string, offset: number) => (
      <>
        {grad(id, c)}
        <G fill={`url(#${id})`}>
          {Array.from({ length: 11 }, (_, i) => (
            <Path key={i} d={curtain(-110 + i * 22 + offset, 78, 121, 12)} />
          ))}
        </G>
      </>
    );
    return (
      <>
        <Layer>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={80} r1={118} opacity={0.3} />
        </Layer>
        <Sway period={6200} degrees={5} glow={{ period: 3400, opacity: [0.35, 1] }}>
          {set(g1, v.color, 0)}
        </Sway>
        <Extra>
          <Sway period={7400} degrees={6} phase={0.4} glow={{ period: 3400, opacity: [0.3, 0.95], phase: 0.5 }}>
            {set(g2, v.color2 ?? v.color, 12)}
          </Sway>
        </Extra>
        <Extra min={0.8}>
          <Spin period={22000}>
            <Circle cx={C} cy={C} r={90} stroke={v.color} strokeOpacity={0.5} strokeWidth={0.9} strokeDasharray="6 5" fill="none" />
          </Spin>
        </Extra>
      </>
    );
  },
  Front: ({ v }) => (
    <>
      {[0, 0.5].map((ph, i) => (
        <Extra key={i} min={i ? 0.5 : 0}>
          <Glimmer period={3200} phase={ph} window={0.28}>
            <Polyline points={lightning(i ? 200 : 140, 86, 112, 5, 6, 77 + i)} stroke="#E8FFFA" strokeWidth={1} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          </Glimmer>
        </Extra>
      ))}
      <Particles mode="radial" count={6} period={2800} colors={['#BFFFF0', v.color2 ?? v.color]} size={[2.2, 3.2]} radius={[86, 114]} arc={[-110, 110]} seed={74} />
    </>
  ),
};

// ——————————————————————————————————————————————— épico

const Nebulosa: AuraFx = {
  Back: ({ v }) => {
    const ids = [useGid('e1'), useGid('e2'), useGid('e3')];
    const h = useGid('eh');
    const cloud = (id: string, deg: number, r: number, size: number, color: string) => {
      const p = polar(r, deg);
      return (
        <>
          <Defs>
            <RadialGradient id={id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={color} stopOpacity={0.6} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={p.x} cy={p.y} r={size} fill={`url(#${id})`} />
        </>
      );
    };
    const c2 = v.color2 ?? v.color;
    return (
      <>
        <Layer>
          <HaloRing id={h} color={c2} color2={v.color} r0={76} r1={120} opacity={0.35} />
        </Layer>
        <Breathe period={5200} opacity={[0.55, 1]}>
          {cloud(ids[0], 40, 100, 32, v.color)}
          {cloud(ids[1], 200, 102, 36, c2)}
        </Breathe>
        <Extra>
          <Breathe period={5200} phase={0.5} opacity={[0.5, 1]}>
            {cloud(ids[2], 300, 98, 30, '#6FA8FF')}
          </Breathe>
        </Extra>
        <Spin period={34000}>
          <G stroke={v.color} strokeOpacity={0.55} strokeWidth={5} fill="none" strokeLinecap="round">
            <Path d={spiral(70, 118, 0.62, 0)} />
            <Path d={spiral(70, 118, 0.62, 180)} />
          </G>
          <G stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={1} fill="none" strokeDasharray="1 4" strokeLinecap="round">
            <Path d={spiral(72, 116, 0.6, 20)} />
            <Path d={spiral(72, 116, 0.6, 200)} />
          </G>
        </Spin>
        <Extra>
          <Spin period={24000} reverse opacity={0.7}>
            <G stroke={c2} strokeOpacity={0.5} strokeWidth={2.5} fill="none" strokeLinecap="round">
              <Path d={spiral(80, 117, 0.45, 90)} />
              <Path d={spiral(80, 117, 0.45, 270)} />
            </G>
          </Spin>
        </Extra>
      </>
    );
  },
  Front: ({ v }) => (
    <>
      <Particles mode="orbit" count={10} period={15000} colors={['#FFFFFF', v.color, v.color2 ?? v.color]} size={[2, 3.4]} radius={[92, 116]} tilt={0.78} plane={-12} seed={85} />
      <Particles mode="twinkle" count={5} period={3000} colors={['#FFFFFF']} size={[3.4, 5]} radius={[88, 118]} sparkle seed={86} />
      <Extra>
        <Particles mode="twinkle" count={1} period={6400} colors={['#FFE3F6']} size={[7, 7]} radius={[106, 106]} arc={[60, 70]} sparkle glow seed={87} />
      </Extra>
    </>
  ),
};

// ——————————————————————————————————————————————— lendário

const Aurea: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('ah');
    const c2 = v.color2 ?? v.color;
    return (
      <>
        <Breathe period={4000} scale={[0.98, 1.03]} opacity={[0.7, 1]}>
          <HaloRing id={h} color={v.color} color2={c2} r0={78} r1={120} opacity={0.5} />
        </Breathe>
        <Extra>
          <Spin period={64000}>
            <G fill={v.color} fillOpacity={0.55}>
              {Array.from({ length: 24 }, (_, i) => (
                <Polygon key={i} points={ray(i * 15, 84, i % 2 ? 108 : 120, 1.6)} />
              ))}
            </G>
          </Spin>
        </Extra>
        <Spin period={52000} reverse opacity={0.55}>
          <G stroke={v.color} strokeWidth={0.7} fill="none">
            <Polygon points={ngon(5, 113)} />
            <Polygon points={star(5, 113, 43.2)} strokeOpacity={0.45} />
          </G>
          {Array.from({ length: 5 }, (_, i) => {
            const p = polar(113, i * 72);
            return (
              <SvgText key={i} x={p.x} y={p.y + 3.5} fontSize={10} fontWeight="700" fill={c2} textAnchor="middle">
                φ
              </SvgText>
            );
          })}
        </Spin>
        <Spin period={40000}>
          <Path d={goldenSpiral(5.2)} stroke={c2} strokeOpacity={0.7} strokeWidth={1.3} fill="none" />
        </Spin>
        <Wave period={6400} from={84} to={120} drawnAt={100} peak={0.85} hold={0.45}>
          <Circle cx={C} cy={C} r={100} stroke="#FFF3C4" strokeWidth={2.4} fill="none" />
        </Wave>
      </>
    );
  },
  Front: ({ v }) => (
    <>
      <Particles mode="orbit" count={8} period={13000} colors={['#FFF3C4', v.color]} size={[2.8, 4]} radius={[96, 114]} tilt={1} glow seed={93} />
      <Particles mode="rise" count={7} period={3400} colors={['#FFF3C4', '#FFFFFF']} size={[2.2, 3.4]} radius={[84, 104]} arc={[100, 260]} travel={70} sparkle seed={94} />
    </>
  ),
};

const Zenite: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('zh');
    const crown = Array.from({ length: 7 }, (_, i) => {
      const deg = -36 + i * 12;
      const tall = i % 2 === 0;
      return ray(deg, 104, tall ? 122 : 115, tall ? 3.4 : 2.6);
    });
    const c2 = v.color2 ?? v.color;
    return (
      <>
        <Breathe period={4600} scale={[0.98, 1.03]} opacity={[0.7, 1]}>
          <HaloRing id={h} color="#FFFFFF" color2={c2} r0={78} r1={120} opacity={0.45} />
        </Breathe>
        <Spin period={80000}>
          <G fill="#FFFFFF" fillOpacity={0.5}>
            {Array.from({ length: 16 }, (_, i) => (
              <Polygon key={i} points={ray(i * 22.5, 84, i % 2 ? 106 : 121, 1.3)} />
            ))}
          </G>
        </Spin>
        <Extra>
          <Spin period={50000} reverse opacity={0.6}>
            <G fill={c2}>
              {Array.from({ length: 16 }, (_, i) => (
                <Polygon key={i} points={ray(i * 22.5 + 11.25, 86, 110, 0.9)} />
              ))}
            </G>
          </Spin>
        </Extra>
        <Breathe period={3200} opacity={[0.65, 1]}>
          <G fill={c2} stroke="#FFFFFF" strokeWidth={0.6}>
            {crown.map((pts, i) => (
              <Polygon key={i} points={pts} />
            ))}
          </G>
          <Circle cx={polar(124, 0).x} cy={polar(117, 0).y} r={2.6} fill="#FFFFFF" />
        </Breathe>
        <Layer opacity={0.45}>
          <G stroke="#FFFFFF" strokeWidth={0.7} fill="none">
            <Ellipse cx={C} cy={C} rx={112} ry={34} transform={`rotate(-24 ${C} ${C})`} />
            <Ellipse cx={C} cy={C} rx={112} ry={34} transform={`rotate(24 ${C} ${C})`} />
          </G>
        </Layer>
        <Wave period={5400} from={84} to={120} drawnAt={100} peak={0.7} hold={0.35}>
          <Circle cx={C} cy={C} r={100} stroke="#FFFFFF" strokeWidth={1.8} fill="none" />
        </Wave>
      </>
    );
  },
  Front: ({ v }) => (
    <>
      <Comet plane={-24} period={7000} color="#FFFFFF" />
      <Extra>
        <Comet plane={24} period={9000} color={v.color2 ?? v.color} reverse />
      </Extra>
      <Particles mode="fall" count={8} period={3800} colors={['#FFFFFF', v.color2 ?? v.color]} size={[2, 3.2]} radius={[60, 110]} arc={[-70, 70]} travel={110} sparkle seed={105} />
    </>
  ),
};

/** Cometa: cabeça brilhante com cauda de 4 elos atrasados, numa órbita inclinada — um sistema só. */
function Comet({ plane, period, color, reverse }: { plane: number; period: number; color: string; reverse?: boolean }) {
  return <Particles mode="orbit" count={1} period={period} colors={[color]} size={[5, 5]} radius={[112, 112]} tilt={0.3} plane={plane} reverse={reverse} glow seed={1} trail={4} />;
}

export const AURAS: Record<AuraFxId, AuraFx> = {
  brasa: Brasa,
  nevoa: Nevoa,
  mare: Mare,
  lunar: Lunar,
  boreal: Boreal,
  nebulosa: Nebulosa,
  aurea: Aurea,
  zenite: Zenite,
};

export function AuraBack({ v }: AuraProps) {
  const fx = AURAS[v.fx as AuraFxId];
  return fx ? <fx.Back v={v} /> : null;
}

export function AuraFront({ v }: AuraProps) {
  const fx = AURAS[v.fx as AuraFxId];
  return fx?.Front ? <fx.Front v={v} /> : null;
}
