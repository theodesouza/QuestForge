/**
 * Cenários — o pano de fundo do herói. Cada um é uma paisagem de 300 × 300 unidades:
 *   Art  → SVG estático (céu, silhuetas, luzes). É o que aparece nas miniaturas.
 *   Live → camadas animadas por cima (estrelas cintilando, névoa à deriva, vaga-lumes…),
 *          todas movidas por transform/opacity no thread de UI e pelo relógio do motor
 *          (respeitam movimento reduzido, intensidade dos efeitos e pausa de tela).
 *
 * O astrolábio cobre o miolo, então a composição vive nas bordas: céu e astros no alto,
 * silhuetas embaixo e nos cantos.
 */
import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { useFx, useLoop } from './engine';
import { goldenSpiral } from './geometry';
import type { SceneFxId } from './rules';

const W = 300;
const TAU = Math.PI * 2;
const fill = StyleSheet.absoluteFill;

// ————————————————————————————————————————————————————— utilidades de desenho

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Box = readonly [number, number, number, number];

function scatter(seed: number, n: number, box: Box) {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({ x: box[0] + (box[2] - box[0]) * r(), y: box[1] + (box[3] - box[1]) * r(), s: r() }));
}

function Sky({ id, stops }: { id: string; stops: [number, string][] }) {
  return (
    <>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([o, c]) => (
            <Stop key={o} offset={o} stopColor={c} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={W} fill={`url(#${id})`} />
    </>
  );
}

function Glow({ id, x, y, r, color, opacity = 0.3 }: { id: string; x: number; y: number; r: number; color: string; opacity?: number }) {
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </>
  );
}

function Stars({ seed, n, box, color = '#FFFFFF', max = 1.3 }: { seed: number; n: number; box: Box; color?: string; max?: number }) {
  return (
    <G fill={color}>
      {scatter(seed, n, box).map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={0.5 + p.s * (max - 0.5)} fillOpacity={0.45 + 0.5 * p.s} />
      ))}
    </G>
  );
}

function crescentPath(cx: number, cy: number, r: number) {
  return `M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r * 0.78} ${r * 0.78} 0 1 1 ${cx} ${cy - r} Z`;
}

/** Pinheiro: três camadas de triângulos sobre um tronco. */
function Pine({ x, base, h, w, color }: { x: number; base: number; h: number; w: number; color: string }) {
  const tiers = [0, 1, 2].map((i) => {
    const top = base - h + (i * h) / 3.4;
    const bottom = base - h * (1 - (i + 1.4) / 3.4);
    const half = (w / 2) * (0.5 + i * 0.28);
    return `${x},${top} ${x + half},${bottom} ${x - half},${bottom}`;
  });
  return (
    <G fill={color}>
      <Rect x={x - w * 0.05} y={base - h * 0.16} width={w * 0.1} height={h * 0.16} />
      {tiers.map((p, i) => (
        <Polygon key={i} points={p} />
      ))}
    </G>
  );
}

// ————————————————————————————————————————————————————— camadas animadas

function useUnit() {
  return useFx().px / W;
}

interface Spot {
  x: number;
  y: number;
  d: number;
  phase: number;
  speed: number;
  color: string;
}

function useSpots(count: number, seed: number, box: Box, size: [number, number], colors: string[]): Spot[] {
  const { density } = useFx();
  const n = Math.max(2, Math.round(count * density));
  const key = [n, seed, box.join(), size.join(), colors.join()].join('|');
  return useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: n }, (_, i) => ({
      x: box[0] + (box[2] - box[0]) * r(),
      y: box[1] + (box[3] - box[1]) * r(),
      d: size[0] + (size[1] - size[0]) * r(),
      phase: (i + r() * 0.7) / n,
      speed: 0.8 + r() * 0.4,
      color: colors[i % colors.length],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Estrelas (ou brilhos) que acendem e apagam devagar, cada uma na sua fase. */
function Twinkles({ count, seed, box, colors, size = [2, 3.4], period = 3800 }: { count: number; seed: number; box: Box; colors: string[]; size?: [number, number]; period?: number }) {
  const spots = useSpots(count, seed, box, size, colors);
  const clock = useLoop(period, 0.3);
  const unit = useUnit();
  return (
    <View pointerEvents="none" style={fill}>
      {spots.map((s, i) => (
        <Twinkle key={i} s={s} clock={clock} unit={unit} />
      ))}
    </View>
  );
}

function Twinkle({ s, clock, unit }: { s: Spot; clock: ReturnType<typeof useLoop>; unit: number }) {
  const style = useAnimatedStyle(() => {
    const u = (clock.value * s.speed + s.phase) % 1;
    const w = Math.sin(u * TAU);
    const tw = w > 0 ? w * w : 0;
    return { opacity: 0.1 + 0.9 * tw, transform: [{ scale: 0.65 + 0.55 * tw }, { rotate: '45deg' }] };
  });
  const d = s.d * unit;
  return <Animated.View style={[{ position: 'absolute', left: s.x * unit - d / 2, top: s.y * unit - d / 2, width: d, height: d, borderRadius: d * 0.18, backgroundColor: s.color }, style]} />;
}

/** Partículas que sobem, caem ou vagam (vaga-lumes, neve, poeira, brasas). */
function Motes({
  count,
  seed,
  box,
  colors,
  size = [2, 3.2],
  period = 6000,
  mode = 'rise',
  travel = 40,
  sway = 8,
  glow = false,
}: {
  count: number;
  seed: number;
  box: Box;
  colors: string[];
  size?: [number, number];
  period?: number;
  mode?: 'rise' | 'fall';
  travel?: number;
  sway?: number;
  glow?: boolean;
}) {
  const spots = useSpots(count, seed, box, size, colors);
  const clock = useLoop(period, 0.3);
  const unit = useUnit();
  return (
    <View pointerEvents="none" style={fill}>
      {spots.map((s, i) => (
        <Mote key={i} s={s} clock={clock} unit={unit} mode={mode} travel={travel} sway={sway} glow={glow} />
      ))}
    </View>
  );
}

function Mote({ s, clock, unit, mode, travel, sway, glow }: { s: Spot; clock: ReturnType<typeof useLoop>; unit: number; mode: 'rise' | 'fall'; travel: number; sway: number; glow: boolean }) {
  const style = useAnimatedStyle(() => {
    const u = (clock.value * s.speed + s.phase) % 1;
    return {
      opacity: Math.sin(Math.PI * u),
      transform: [{ translateX: Math.sin((u + s.phase) * TAU) * sway * unit }, { translateY: (mode === 'rise' ? -u : u) * travel * unit }],
    };
  });
  const d = s.d * unit;
  const g = d * 2.8;
  return (
    <Animated.View style={[{ position: 'absolute', left: s.x * unit - g / 2, top: s.y * unit - g / 2, width: g, height: g, alignItems: 'center', justifyContent: 'center' }, style]}>
      {glow ? <View style={{ position: 'absolute', width: g, height: g, borderRadius: g / 2, backgroundColor: s.color, opacity: 0.25 }} /> : null}
      <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: s.color }} />
    </Animated.View>
  );
}

function SvgLayer({ children }: { children: ReactNode }) {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${W}`}>
      {children}
    </Svg>
  );
}

/** Desliza de um lado para o outro (nuvens, névoa, calor). */
function Drift({ period, amp, phase = 0, children }: { period: number; amp: number; phase?: number; children: ReactNode }) {
  const unit = useUnit();
  const t = useLoop(period, 0.25);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: Math.sin((t.value + phase) * TAU) * amp * unit }] }));
  return (
    <Animated.View pointerEvents="none" style={[fill, style]}>
      <SvgLayer>{children}</SvgLayer>
    </Animated.View>
  );
}

/** Respira em opacidade (luzes, auroras, runas). */
function Pulse({ period, opacity, phase = 0, children }: { period: number; opacity: [number, number]; phase?: number; children: ReactNode }) {
  const t = useLoop(period, 0.25);
  const style = useAnimatedStyle(() => {
    const k = 0.5 - 0.5 * Math.cos((t.value + phase) * TAU);
    return { opacity: opacity[0] + (opacity[1] - opacity[0]) * k };
  });
  return (
    <Animated.View pointerEvents="none" style={[fill, style]}>
      <SvgLayer>{children}</SvgLayer>
    </Animated.View>
  );
}

/** Gira em torno de um ponto da paisagem (céu girando em torno do polo). */
function Rotate({ period, cx, cy, reverse = false, children }: { period: number; cx: number; cy: number; reverse?: boolean; children: ReactNode }) {
  const unit = useUnit();
  const t = useLoop(period, 0);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${(reverse ? -1 : 1) * t.value * 360}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[fill, { transformOrigin: `${cx * unit}px ${cy * unit}px` }, style]}>
      <SvgLayer>{children}</SvgLayer>
    </Animated.View>
  );
}

// ————————————————————————————————————————————————————— cenários

interface SceneFx {
  Art: (p: { v: ItemVisual; uid: string }) => ReactNode;
  Live?: (p: { v: ItemVisual }) => ReactNode;
}

const Noite: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#0B1030'], [0.55, '#1B2352'], [1, '#3B3F86']]} />
      <Stars seed={11} n={52} box={[0, 0, 300, 235]} />
      <Glow id={`mg${uid}`} x={246} y={54} r={46} color="#9AA7FF" opacity={0.28} />
      <Path d={crescentPath(246, 54, 17)} fill="#F3F7FF" />
      <Path d="M0 300 L0 266 L36 246 L66 262 L108 238 L148 266 L196 244 L238 266 L272 250 L300 262 L300 300 Z" fill="#161B45" />
      <Path d="M0 300 L0 280 L44 266 L90 280 L140 270 L190 282 L240 268 L300 280 L300 300 Z" fill="#0C1030" />
    </>
  ),
  Live: () => (
    <>
      <Twinkles count={16} seed={21} box={[8, 8, 292, 225]} colors={['#FFFFFF', '#BFC8FF']} />
      <Motes count={2} seed={22} box={[30, 30, 250, 120]} colors={['#FFFFFF']} size={[2.4, 3]} period={9000} travel={60} sway={30} />
    </>
  ),
};

const Colinas: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#3C4A9E'], [0.35, '#C46FA0'], [0.62, '#FF9E6B'], [1, '#FFD38A']]} />
      <Glow id={`sg${uid}`} x={70} y={236} r={90} color="#FFB648" opacity={0.4} />
      <Circle cx={70} cy={238} r={36} fill="#FFE9A8" />
      <Path d="M0 300 L0 236 Q50 214 110 236 T220 226 T300 232 L300 300 Z" fill="#7B6AA8" />
      <Path d="M0 300 L0 252 Q60 230 130 250 T260 244 T300 250 L300 300 Z" fill="#3E9E6C" />
      <Path d="M0 300 L0 272 Q70 254 150 272 T300 268 L300 300 Z" fill="#2C7A55" />
    </>
  ),
  Live: () => (
    <>
      <Drift period={20000} amp={12}>
        <Ellipse cx={226} cy={58} rx={34} ry={9} fill="#FFD1E3" fillOpacity={0.5} />
        <Ellipse cx={206} cy={66} rx={22} ry={7} fill="#FFD1E3" fillOpacity={0.4} />
        <Ellipse cx={80} cy={92} rx={28} ry={7} fill="#E9D5FF" fillOpacity={0.4} />
      </Drift>
      <Pulse period={6400} opacity={[0.35, 0.8]}>
        <Glow id="cgl" x={70} y={238} r={64} color="#FFF3C4" opacity={0.5} />
      </Pulse>
      <Motes count={7} seed={31} box={[20, 220, 280, 285]} colors={['#FFF3C4', '#FFFFFF']} size={[1.8, 2.8]} period={7000} travel={44} sway={14} glow />
    </>
  ),
};

const Mar: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#071230'], [0.5, '#12306B'], [0.78, '#1F5E9A']]} />
      <Stars seed={41} n={36} box={[0, 0, 300, 200]} />
      <Glow id={`mg${uid}`} x={64} y={60} r={56} color="#CFE3FF" opacity={0.3} />
      <Circle cx={64} cy={60} r={22} fill="#F6F9FF" />
      <Circle cx={72} cy={54} r={22} fill="#12306B" fillOpacity={0.12} />
      <Rect x={0} y={232} width={300} height={68} fill="#0A2552" />
      <Path d="M0 232 L300 232" stroke="#6FA8E8" strokeOpacity={0.5} strokeWidth={1} />
      <G stroke="#CFE3FF" strokeLinecap="round">
        {[[238, 30], [246, 44], [256, 60], [268, 76], [282, 90]].map(([y, w], i) => (
          <Line key={i} x1={64 - w / 2} y1={y} x2={64 + w / 2} y2={y} strokeWidth={2} strokeOpacity={0.5 - i * 0.07} />
        ))}
      </G>
      <Polygon points="226,232 226,210 240,230" fill="#06142F" />
      <Polygon points="224,232 224,216 214,230" fill="#06142F" />
      <Rect x={212} y={230} width={30} height={3} fill="#06142F" />
    </>
  ),
  Live: () => (
    <>
      <Twinkles count={11} seed={42} box={[6, 6, 294, 190]} colors={['#FFFFFF', '#CFE3FF']} />
      <Drift period={9000} amp={7}>
        {[250, 262, 274, 286].map((y, i) => (
          <Path key={y} d={`M${i * 14 - 20} ${y} q18 -6 36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0`} stroke="#6FA8E8" strokeOpacity={0.4} strokeWidth={1.4} fill="none" />
        ))}
      </Drift>
      <Pulse period={5200} opacity={[0.15, 0.8]} phase={0.4}>
        <G stroke="#FFFFFF" strokeLinecap="round" strokeWidth={1.4}>
          {[[246, 14], [262, 22], [278, 16]].map(([y, w], i) => (
            <Line key={i} x1={64 - w} y1={y} x2={64 + w} y2={y} />
          ))}
        </G>
      </Pulse>
    </>
  ),
};

const Dunas: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#7A3B6E'], [0.3, '#E0644E'], [0.62, '#FFAF55'], [1, '#FFE0A0']]} />
      <Glow id={`sg${uid}`} x={234} y={78} r={100} color="#FFC060" opacity={0.4} />
      <Circle cx={234} cy={78} r={42} fill="#FFF0B8" />
      <Path d="M0 300 L0 244 Q80 214 150 246 T300 230 L300 300 Z" fill="#C97B3E" />
      <Path d="M0 300 L0 262 Q70 238 150 264 T300 254 L300 300 Z" fill="#E39D52" />
      <Path d="M0 300 L0 282 Q90 262 170 284 T300 276 L300 300 Z" fill="#F2B86A" />
      <Path d="M0 282 Q90 262 170 284 T300 276" stroke="#FFE3A8" strokeOpacity={0.8} strokeWidth={1.4} fill="none" />
    </>
  ),
  Live: () => (
    <>
      <Drift period={8000} amp={5}>
        {[236, 241, 246].map((y, i) => (
          <Path key={y} d={`M-10 ${y} q20 -5 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`} stroke="#FFE3A8" strokeOpacity={0.3 - i * 0.07} strokeWidth={1.2} fill="none" />
        ))}
      </Drift>
      <Pulse period={6000} opacity={[0.3, 0.85]}>
        <Glow id="dgl" x={234} y={78} r={70} color="#FFF0B8" opacity={0.5} />
      </Pulse>
      <Motes count={8} seed={51} box={[0, 215, 300, 292]} colors={['#FFE3A8', '#FFF6D6']} size={[1.4, 2.2]} period={5200} travel={20} sway={26} />
    </>
  ),
};

const Floresta: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#06160F'], [0.5, '#0F3B2C'], [1, '#1E5A3E']]} />
      <Stars seed={61} n={22} box={[60, 0, 240, 120]} color="#E8FFE0" max={1} />
      <Glow id={`mg${uid}`} x={214} y={46} r={62} color="#E8FFE0" opacity={0.22} />
      <Circle cx={214} cy={46} r={19} fill="#E8FFE0" fillOpacity={0.92} />
      <Pine x={84} base={300} h={96} w={34} color="#0F3B2C" />
      <Pine x={212} base={300} h={104} w={36} color="#0F3B2C" />
      <Pine x={150} base={300} h={84} w={30} color="#123F30" />
      <Pine x={22} base={300} h={170} w={56} color="#072019" />
      <Pine x={64} base={300} h={120} w={44} color="#0A2B20" />
      <Pine x={-8} base={300} h={140} w={50} color="#072019" />
      <Pine x={278} base={300} h={176} w={58} color="#072019" />
      <Pine x={238} base={300} h={124} w={46} color="#0A2B20" />
      <Pine x={308} base={300} h={146} w={52} color="#072019" />
    </>
  ),
  Live: () => (
    <>
      <Drift period={17000} amp={16}>
        <Ellipse cx={120} cy={268} rx={90} ry={11} fill="#DFFFEA" fillOpacity={0.14} />
        <Ellipse cx={210} cy={282} rx={80} ry={9} fill="#DFFFEA" fillOpacity={0.12} />
      </Drift>
      <Motes count={9} seed={62} box={[16, 150, 284, 280]} colors={['#D6FF6B', '#F4FFD0']} size={[2.4, 3.6]} period={8000} travel={26} sway={18} glow />
      <Twinkles count={4} seed={63} box={[70, 6, 230, 110]} colors={['#E8FFE0']} />
    </>
  ),
};

const Pedreira: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#2A3252'], [0.6, '#5A668F'], [1, '#8C93B8']]} />
      <Glow id={`sg${uid}`} x={150} y={52} r={80} color="#C9D1F0" opacity={0.3} />
      <Circle cx={150} cy={52} r={26} fill="#C9D1F0" fillOpacity={0.55} />
      <Path d="M0 300 L0 170 L40 150 L40 188 L90 188 L90 300 Z" fill="#363E63" />
      <Path d="M300 300 L300 160 L262 142 L262 184 L214 184 L214 300 Z" fill="#363E63" />
      <Path d="M0 300 L0 120 L28 120 L28 152 L56 152 L56 186 L84 186 L84 222 L112 222 L112 300 Z" fill="#47507A" />
      <Path d="M300 300 L300 112 L272 112 L272 146 L244 146 L244 182 L216 182 L216 220 L188 220 L188 300 Z" fill="#47507A" />
      <G stroke="#8C93B8" strokeOpacity={0.6} strokeWidth={1.2}>
        <Path d="M0 120 H28 V152 H56 V186 H84 V222 H112" fill="none" />
        <Path d="M300 112 H272 V146 H244 V182 H216 V220 H188" fill="none" />
      </G>
    </>
  ),
  Live: () => (
    <>
      <Pulse period={4400} opacity={[0.25, 1]}>
        <G stroke="#38D6B0" strokeWidth={1.6} strokeLinecap="round" fill="none">
          <Path d="M0 122 H28 V154 H56 V188 H84 V224 H112" />
          <Path d="M300 114 H272 V148 H244 V184 H216 V222 H188" />
          <Path d="M10 250 L10 270 M18 258 L26 262 M40 244 L52 244 M44 270 L44 288" />
          <Path d="M290 250 L290 270 M282 258 L274 262 M260 244 L248 244 M256 270 L256 288" />
        </G>
      </Pulse>
      <Motes count={9} seed={71} box={[0, 190, 300, 296]} colors={['#C9D1F0', '#FFFFFF']} size={[1.6, 2.6]} period={7200} travel={50} sway={10} />
    </>
  ),
};

const Mercado: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#140A24'], [0.55, '#3A1A3E'], [1, '#7A3A2E']]} />
      <Stars seed={81} n={18} box={[0, 0, 300, 70]} color="#FFE9C0" max={1} />
      <Path d="M-4 38 Q74 86 150 40 T304 38" stroke="#4A3040" strokeWidth={1.4} fill="none" />
      {[
        [34, 62],
        [92, 74],
        [150, 40],
        [208, 74],
        [266, 62],
      ].map(([x, y], i) => (
        <G key={i}>
          <Line x1={x} y1={y - 12} x2={x} y2={y - 4} stroke="#4A3040" strokeWidth={1} />
          <Ellipse cx={x} cy={y + 4} rx={6} ry={8} fill="#FFB648" />
          <Rect x={x - 3.5} y={y - 6} width={7} height={3} fill="#7A3A2E" />
        </G>
      ))}
      <Path d="M0 300 L0 250 L100 250 L100 300 Z" fill="#1B0E22" />
      <Path d="M300 300 L300 246 L196 246 L196 300 Z" fill="#1B0E22" />
      {Array.from({ length: 5 }, (_, i) => (
        <Polygon key={`l${i}`} points={`${i * 20},250 ${i * 20 + 20},250 ${i * 20 + 14},266 ${i * 20 + 6},266`} fill={i % 2 ? '#F4ECDC' : '#C2483E'} />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <Polygon key={`r${i}`} points={`${196 + i * 20.8},246 ${196 + i * 20.8 + 20.8},246 ${196 + i * 20.8 + 14},262 ${196 + i * 20.8 + 6},262`} fill={i % 2 ? '#F4ECDC' : '#C2483E'} />
      ))}
      <G fill="#FFD36B">
        {[[18, 292], [30, 294], [44, 291], [258, 292], [272, 294], [284, 291]].map(([x, y], i) => (
          <Ellipse key={i} cx={x} cy={y} rx={5} ry={2.2} />
        ))}
      </G>
    </>
  ),
  Live: () => (
    <>
      {[
        { phase: 0, lamps: [[34, 66], [208, 78]] },
        { phase: 0.33, lamps: [[92, 78], [266, 66]] },
        { phase: 0.66, lamps: [[150, 44]] },
      ].map(({ phase, lamps }, i) => (
        <Pulse key={i} period={3600} opacity={[0.25, 1]} phase={phase}>
          {lamps.map(([x, y]) => (
            <Glow key={`${x}`} id={`lg${x}`} x={x} y={y} r={24} color="#FFB648" opacity={0.55} />
          ))}
        </Pulse>
      ))}
      <Twinkles count={6} seed={82} box={[14, 280, 94, 296]} colors={['#FFF6D6', '#FFD36B']} size={[2, 3]} />
      <Twinkles count={6} seed={83} box={[256, 280, 290, 296]} colors={['#FFF6D6', '#FFD36B']} size={[2, 3]} />
      <Motes count={5} seed={84} box={[20, 70, 280, 110]} colors={['#FFB648']} size={[1.6, 2.4]} period={7000} travel={34} sway={10} glow />
    </>
  ),
};

/** Três arcos de 1/2, 1/3 e 1/6 da volta — Leão, Cabra e Serpente — fechando o céu da planície. */
function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const p = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  };
  return `M${p(from)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${p(to)}`;
}

const Planicie: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#17304D'], [0.5, '#3F7E8C'], [0.76, '#9BD6A0'], [1, '#F2D98A']]} />
      <Stars seed={91} n={20} box={[0, 0, 300, 90]} />
      <G fill="none" strokeLinecap="round" strokeWidth={6}>
        <Path d={arcPath(150, 252, 124, -90, 90)} stroke="#F2B54A" strokeOpacity={0.55} />
        <Path d={arcPath(150, 252, 106, -60, 60)} stroke="#C9D1F0" strokeOpacity={0.55} />
        <Path d={arcPath(150, 252, 88, -30, 30)} stroke="#5FD38D" strokeOpacity={0.6} />
      </G>
      <Path d="M0 300 L0 244 Q70 228 150 246 T300 240 L300 300 Z" fill="#6FBF73" />
      <Path d="M0 300 L0 262 Q80 246 160 264 T300 258 L300 300 Z" fill="#3E9E6C" />
      <Path d="M0 300 L0 280 Q90 266 180 282 T300 276 L300 300 Z" fill="#2C7A55" />
    </>
  ),
  Live: () => (
    <>
      {[
        ['#F2B54A', 124, -90, 90, 0],
        ['#C9D1F0', 106, -60, 60, 0.33],
        ['#5FD38D', 88, -30, 30, 0.66],
      ].map(([color, r, a, b, ph], i) => (
        <Pulse key={i} period={4200} opacity={[0.15, 0.9]} phase={ph as number}>
          <Path d={arcPath(150, 252, r as number, a as number, b as number)} stroke={color as string} strokeWidth={6} strokeLinecap="round" fill="none" />
        </Pulse>
      ))}
      <Drift period={22000} amp={10}>
        <Ellipse cx={72} cy={96} rx={30} ry={8} fill="#FFFFFF" fillOpacity={0.3} />
        <Ellipse cx={240} cy={74} rx={26} ry={7} fill="#FFFFFF" fillOpacity={0.25} />
      </Drift>
      <Motes count={7} seed={92} box={[14, 232, 286, 288]} colors={['#FFF3C4', '#FFFFFF']} size={[1.8, 2.8]} period={7600} travel={44} sway={14} />
    </>
  ),
};

/** Cortinas de aurora: faixas verticais com a base ondulada, mais fortes embaixo e se dissolvendo no alto. */
function Curtains({ id, color, base, amp, x0 = -10, n = 22, seed, opacity }: { id: string; color: string; base: number; amp: number; x0?: number; n?: number; seed: number; opacity: number }) {
  const r = rng(seed);
  return (
    <>
      <Defs>
        <LinearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity={0} />
          <Stop offset="0.18" stopColor={color} stopOpacity={opacity} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * ((W + 20) / n);
        const y = base + Math.sin(i * 0.55 + seed) * amp;
        const h = 60 + r() * 70;
        return <Rect key={i} x={x} y={y - h} width={(W + 20) / n + 0.6} height={h} fill={`url(#${id})`} />;
      })}
    </>
  );
}

const Polar: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#041A22'], [0.5, '#0B3B46'], [1, '#17556A']]} />
      <Stars seed={101} n={44} box={[0, 0, 300, 200]} />
      <Curtains id={`ca${uid}`} color="#38D6B0" base={130} amp={16} seed={3} opacity={0.5} />
      <Curtains id={`cb${uid}`} color="#9B87FF" base={104} amp={14} seed={7} opacity={0.4} />
      <Path d="M0 300 L0 262 L30 236 L52 258 L84 230 L112 262 L150 246 L190 266 L226 232 L258 258 L300 240 L300 300 Z" fill="#8FC8E8" />
      <Path d="M0 300 L0 278 L40 262 L74 280 L120 266 L170 284 L220 264 L264 280 L300 270 L300 300 Z" fill="#CFEFFF" />
      <Path d="M0 300 L0 292 Q150 280 300 292 L300 300 Z" fill="#EAF6FF" />
    </>
  ),
  Live: () => (
    <>
      <Drift period={14000} amp={14}>
        <Curtains id="lca" color="#38D6B0" base={126} amp={18} seed={11} opacity={0.45} />
      </Drift>
      <Pulse period={9000} opacity={[0.15, 0.9]} phase={0.3}>
        <Drift period={19000} amp={18} phase={0.4}>
          <Curtains id="lcb" color="#9B87FF" base={100} amp={16} seed={13} opacity={0.45} />
        </Drift>
      </Pulse>
      <Twinkles count={10} seed={102} box={[6, 6, 294, 190]} colors={['#FFFFFF', '#CFEFFF']} />
      <Motes count={8} seed={103} box={[10, 0, 290, 120]} colors={['#FFFFFF']} size={[1.6, 2.6]} period={9000} mode="fall" travel={170} sway={12} />
    </>
  ),
};

const Observatorio: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#0A0A24'], [0.6, '#1B1550'], [1, '#3A2A78']]} />
      <Glow id={`ng${uid}`} x={70} y={90} r={110} color="#9B87FF" opacity={0.25} />
      <Stars seed={111} n={40} box={[0, 0, 300, 220]} />
      <Path d="M0 300 L0 262 Q150 214 300 262 L300 300 Z" fill="#07061A" />
      <Path d="M30 300 L30 268 Q150 226 270 268 L270 300 Z" fill="#100C30" />
      <Line x1={196} y1={256} x2={252} y2={206} stroke="#0A0820" strokeWidth={9} strokeLinecap="round" />
      <Line x1={196} y1={256} x2={252} y2={206} stroke="#3A2A78" strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  Live: () => (
    <>
      <Rotate period={160000} cx={232} cy={40}>
        <G fill="none" stroke="#FFFFFF" strokeLinecap="round">
          {[
            [40, 10, 110, 0.4],
            [70, 120, 200, 0.32],
            [100, 200, 290, 0.3],
            [130, 30, 100, 0.25],
            [160, 160, 240, 0.22],
            [190, 250, 330, 0.2],
          ].map(([r, a, b, o], i) => (
            <Path key={i} d={arcPath(232, 40, r, a, b)} strokeOpacity={o} strokeWidth={1.2} />
          ))}
        </G>
        <G fill="#FFFFFF">
          {[
            [34, 40],
            [58, 200],
            [86, 120],
            [112, 280],
            [142, 70],
            [170, 220],
          ].map(([r, a], i) => {
            const t = ((a - 90) * Math.PI) / 180;
            return <Circle key={i} cx={232 + r * Math.cos(t)} cy={40 + r * Math.sin(t)} r={1.6} />;
          })}
        </G>
      </Rotate>
      <Pulse period={7000} opacity={[0.3, 0.9]}>
        <Glow id="obg" x={64} y={96} r={70} color="#B8A6FF" opacity={0.35} />
      </Pulse>
      <Twinkles count={12} seed={112} box={[6, 6, 294, 215]} colors={['#FFFFFF', '#FFE9A8', '#C9B8FF']} />
    </>
  ),
};

const Cosmos: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#0A0600'], [0.6, '#2A1A04'], [1, '#4A3008']]} />
      <Glow id={`cg${uid}`} x={150} y={150} r={160} color="#FFB648" opacity={0.3} />
      <Stars seed={121} n={70} box={[0, 0, 300, 300]} color="#FFD36B" max={1.5} />
      <G fill="none" stroke="#FFD36B">
        {[100, 122, 144].map((r, i) => (
          <Circle key={r} cx={150} cy={150} r={r} strokeOpacity={0.35 - i * 0.08} strokeWidth={1} strokeDasharray={i === 1 ? '2 6' : undefined} />
        ))}
      </G>
      <Path d={goldenSpiral(5.2)} transform="translate(30 30)" stroke="#FFE08A" strokeOpacity={0.5} strokeWidth={1.4} fill="none" />
    </>
  ),
  Live: () => (
    <>
      <Rotate period={110000} cx={150} cy={150}>
        <G fill="#FFF3C4">
          {Array.from({ length: 12 }, (_, i) => {
            const t = ((i * 30 - 90) * Math.PI) / 180;
            const r = i % 2 ? 128 : 144;
            return <Circle key={i} cx={150 + r * Math.cos(t)} cy={150 + r * Math.sin(t)} r={i % 2 ? 2 : 3} />;
          })}
        </G>
      </Rotate>
      <Rotate period={150000} cx={150} cy={150} reverse>
        <Circle cx={150} cy={150} r={110} stroke="#FFD36B" strokeOpacity={0.45} strokeWidth={1} strokeDasharray="1 7" strokeLinecap="round" fill="none" />
      </Rotate>
      <Pulse period={6200} opacity={[0.3, 0.9]}>
        <Glow id="cog" x={150} y={150} r={150} color="#FFD36B" opacity={0.28} />
      </Pulse>
      <Twinkles count={16} seed={122} box={[6, 6, 294, 294]} colors={['#FFF3C4', '#FFD36B', '#FFFFFF']} size={[2.4, 4]} />
      <Motes count={7} seed={123} box={[10, 200, 290, 296]} colors={['#FFD36B', '#FFF3C4']} size={[1.8, 3]} period={7800} travel={90} sway={14} glow />
    </>
  ),
};

/** Torre de pedra com telhado triangular; as janelas são desenhadas à parte (acendem na animação). */
function Tower({ x, w, top, base = 300, roof, body, trim }: { x: number; w: number; top: number; base?: number; roof: string; body: string; trim: string }) {
  return (
    <G>
      <Rect x={x} y={top} width={w} height={base - top} fill={body} />
      <Rect x={x - 3} y={top - 3} width={w + 6} height={6} fill={trim} />
      <Polygon points={`${x - 3},${top - 3} ${x + w / 2},${top - 3 - w * 0.9} ${x + w + 3},${top - 3}`} fill={roof} />
      <Path d={`M${x} ${top + 40} H${x + w} M${x} ${top + 84} H${x + w}`} stroke={trim} strokeOpacity={0.5} strokeWidth={1} />
    </G>
  );
}

const TOWER_WINDOWS = [
  [26, 190],
  [40, 232],
  [246, 150],
  [262, 196],
  [250, 244],
];

const Torres: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#141B46'], [0.5, '#34408F'], [0.82, '#8A6FA8'], [1, '#E0A070']]} />
      <Stars seed={131} n={30} box={[0, 0, 300, 140]} />
      <Glow id={`tg${uid}`} x={232} y={58} r={70} color="#F2B54A" opacity={0.28} />
      <Circle cx={232} cy={58} r={26} fill="#FFE9A8" fillOpacity={0.5} />
      <Polygon points="232,32 254.5,71 209.5,71" fill="none" stroke="#FFF3C4" strokeOpacity={0.7} strokeWidth={1.2} strokeLinejoin="round" />
      {/* Bissetriz com régua e compasso: dois círculos que se cortam e a reta pelos pontos de encontro. */}
      <G fill="none" stroke="#F2B54A" strokeOpacity={0.4} strokeWidth={1.1}>
        <Circle cx={62} cy={64} r={38} />
        <Circle cx={100} cy={64} r={38} />
        <Line x1={81} y1={31} x2={81} y2={97} />
        <Line x1={62} y1={64} x2={100} y2={64} strokeDasharray="3 3" />
      </G>
      <Tower x={104} w={26} top={190} roof="#46508F" body="#3A4278" trim="#6C77B8" />
      <Tower x={146} w={32} top={168} roof="#46508F" body="#3A4278" trim="#6C77B8" />
      <Tower x={14} w={44} top={128} roof="#2A3166" body="#232A58" trim="#4E5A9C" />
      <Tower x={236} w={50} top={96} roof="#2A3166" body="#232A58" trim="#4E5A9C" />
      <Path d="M0 300 L0 262 L300 262 L300 300 Z" fill="#161B3E" />
      <Path d="M0 262 H300 M0 280 H300" stroke="#4E5A9C" strokeOpacity={0.6} strokeWidth={1} />
      <Path d="M50 262 V300 M110 262 V300 M170 262 V300 M230 262 V300 M80 280 V300 M140 280 V300 M200 280 V300 M260 280 V300" stroke="#4E5A9C" strokeOpacity={0.4} strokeWidth={1} />
      <G fill="#F2B54A" fillOpacity={0.55}>
        {TOWER_WINDOWS.map(([wx, wy]) => (
          <Rect key={`${wx}-${wy}`} x={wx} y={wy} width={7} height={11} rx={3.5} />
        ))}
      </G>
    </>
  ),
  Live: () => (
    <>
      <Rotate period={90000} cx={232} cy={58}>
        <Circle cx={232} cy={58} r={36} stroke="#FFF3C4" strokeOpacity={0.55} strokeWidth={1} strokeDasharray="1.5 5" strokeLinecap="round" fill="none" />
        <Polygon points="232,22 263.2,76 200.8,76" fill="none" stroke="#FFF3C4" strokeOpacity={0.45} strokeWidth={1} strokeLinejoin="round" />
      </Rotate>
      <Pulse period={5200} opacity={[0.25, 1]}>
        <G fill="#FFD36B">
          {TOWER_WINDOWS.map(([wx, wy]) => (
            <Rect key={`${wx}-${wy}`} x={wx} y={wy} width={7} height={11} rx={3.5} />
          ))}
        </G>
      </Pulse>
      <Pulse period={7400} opacity={[0.15, 0.75]} phase={0.3}>
        <G fill="none" stroke="#F2B54A" strokeWidth={1.4}>
          <Circle cx={62} cy={64} r={38} />
          <Circle cx={100} cy={64} r={38} />
          <Line x1={81} y1={31} x2={81} y2={97} />
        </G>
      </Pulse>
      <Twinkles count={10} seed={132} box={[6, 6, 294, 140]} colors={['#FFFFFF', '#FFE9A8']} />
      <Motes count={6} seed={133} box={[0, 210, 300, 296]} colors={['#FFE9A8', '#C9D1F0']} size={[1.6, 2.6]} period={8200} travel={46} sway={12} />
    </>
  ),
};

/** Cristal prismático: corpo de duas faces e ponta facetada. */
function Crystal({ x, base, w, h, tilt = 0, left, right, tip }: { x: number; base: number; w: number; h: number; tilt?: number; left: string; right: string; tip: string }) {
  const hw = w / 2;
  const shoulder = base - h * 0.78;
  const top = base - h;
  return (
    <G transform={`rotate(${tilt} ${x} ${base})`} strokeLinejoin="round" stroke="#0B1020" strokeOpacity={0.5} strokeWidth={0.9}>
      <Polygon points={`${x - hw},${base} ${x - hw},${shoulder} ${x},${shoulder + 3} ${x},${base}`} fill={left} />
      <Polygon points={`${x},${base} ${x},${shoulder + 3} ${x + hw},${shoulder} ${x + hw},${base}`} fill={right} />
      <Polygon points={`${x - hw},${shoulder} ${x},${top} ${x + hw},${shoulder} ${x},${shoulder + 3}`} fill={tip} />
    </G>
  );
}

const STALACTITES: [number, number, number][] = [
  [0, 38, 52], [38, 32, 26], [70, 36, 64], [106, 30, 34], [136, 40, 48], [176, 34, 70], [210, 32, 30], [242, 34, 58], [276, 30, 44], [296, 8, 20],
];

const CRYSTALS = [
  { x: 36, base: 292, w: 22, h: 92, tilt: -8, left: '#2C9DB0', right: '#1A6C8C', tip: '#7FF3FF' },
  { x: 62, base: 296, w: 16, h: 58, tilt: 10, left: '#6C55C8', right: '#47359A', tip: '#B79CFF' },
  { x: 262, base: 292, w: 24, h: 104, tilt: 7, left: '#2C9DB0', right: '#1A6C8C', tip: '#7FF3FF' },
  { x: 236, base: 296, w: 16, h: 64, tilt: -11, left: '#6C55C8', right: '#47359A', tip: '#B79CFF' },
  { x: 122, base: 300, w: 14, h: 40, tilt: -6, left: '#2C9DB0', right: '#1A6C8C', tip: '#BFFBFF' },
  { x: 178, base: 300, w: 14, h: 46, tilt: 9, left: '#6C55C8', right: '#47359A', tip: '#D8C8FF' },
];

const CAVE_GLOWS = [
  { x: 36, y: 230, r: 62, c: '#7FF3FF', p: 5400, ph: 0 },
  { x: 262, y: 224, r: 66, c: '#7FF3FF', p: 6200, ph: 0.4 },
  { x: 62, y: 262, r: 40, c: '#B79CFF', p: 4800, ph: 0.7 },
  { x: 236, y: 266, r: 42, c: '#B79CFF', p: 5800, ph: 0.2 },
];

const Cavernas: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#070A1E'], [0.55, '#15153A'], [1, '#271E5E']]} />
      <Glow id={`cg${uid}`} x={150} y={250} r={150} color="#7FF3FF" opacity={0.16} />
      {CAVE_GLOWS.map((g, i) => (
        <Glow key={i} id={`cx${i}${uid}`} x={g.x} y={g.y} r={g.r} color={g.c} opacity={0.24} />
      ))}
      <G fill="#0C0F2C">
        {STALACTITES.map(([x, w, h]) => (
          <Polygon key={x} points={`${x},-4 ${x + w},-4 ${x + w * 0.5},${h}`} />
        ))}
      </G>
      <Path d="M0 0 L0 120 Q18 150 12 210 L0 240 Z" fill="#0F1334" />
      <Path d="M300 0 L300 110 Q282 150 290 214 L300 240 Z" fill="#0F1334" />
      <Path d="M0 300 L0 272 Q60 258 120 276 T240 270 T300 274 L300 300 Z" fill="#0A0D26" />
      {CRYSTALS.map((c, i) => (
        <Crystal key={i} {...c} />
      ))}
      {/* Cubo de geodo no chão: três faces à vista. */}
      <G strokeLinejoin="round" stroke="#0B1020" strokeOpacity={0.5} strokeWidth={0.9}>
        <Polygon points="150,262 168,272 150,282 132,272" fill="#E8FFFF" fillOpacity={0.55} />
        <Polygon points="132,272 150,282 150,298 132,288" fill="#2C9DB0" />
        <Polygon points="150,282 168,272 168,288 150,298" fill="#47359A" />
      </G>
    </>
  ),
  Live: () => (
    <>
      {CAVE_GLOWS.map((g, i) => (
        <Pulse key={i} period={g.p} opacity={[0.15, 1]} phase={g.ph}>
          <Glow id={`cvg${i}`} x={g.x} y={g.y} r={g.r} color={g.c} opacity={0.4} />
        </Pulse>
      ))}
      <Pulse period={4200} opacity={[0.2, 0.9]} phase={0.5}>
        <Polygon points="150,262 168,272 150,282 132,272" fill="#FFFFFF" fillOpacity={0.55} />
      </Pulse>
      <Twinkles count={9} seed={142} box={[16, 150, 284, 290]} colors={['#E8FFFF', '#D8C8FF']} />
      <Motes count={9} seed={143} box={[10, 170, 290, 296]} colors={['#7FF3FF', '#B79CFF']} size={[1.8, 3]} period={9200} travel={90} sway={16} glow />
    </>
  ),
};

export const SCENES: Record<SceneFxId, SceneFx> = {
  noite: Noite,
  colinas: Colinas,
  mar: Mar,
  dunas: Dunas,
  floresta: Floresta,
  pedreira: Pedreira,
  mercado: Mercado,
  planicie: Planicie,
  polar: Polar,
  observatorio: Observatorio,
  cosmos: Cosmos,
  torres: Torres,
  cavernas: Cavernas,
};

/** Arte estática do cenário (também usada nas miniaturas), em coordenadas 300 × 300. */
export function SceneArt({ v, uid }: { v: ItemVisual; uid: string }) {
  const fx = SCENES[v.fx as SceneFxId];
  return fx ? <>{fx.Art({ v, uid })}</> : null;
}

/** Camadas animadas do cenário. Precisa de um FxProvider com `px` = lado da tela do cenário. */
export function SceneLive({ v }: { v: ItemVisual }) {
  const fx = SCENES[v.fx as SceneFxId];
  const Live = fx?.Live;
  return Live ? <Live v={v} /> : null;
}
