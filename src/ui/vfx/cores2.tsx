/**
 * Núcleos da segunda leva — mesma escada de complexidade dos primeiros:
 *   comum   → forma lapidada + respiração sutil           (Jade, Coral)
 *   incomum → + elemento girando e poucas partículas      (Ametista, Obsidiana)
 *   raro    → + silhueta marcante, pulsos e órbitas       (Esmeralda, Gelo)
 *   épico   → + feixes, ondas de energia, campo orbital   (Eclipse)
 */
import { Circle, Defs, Ellipse, G, Line, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { Breathe, C, Extra, Glimmer, Layer, Particles, Spin, Sway, Wave } from './engine';
import { arc, ngon, polar, ray, wavyCircle } from './geometry';
import { GemGradient, Glow, useGid, type CoreProps } from './kit';

const pts = (list: { x: number; y: number }[]) => list.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

// ——————————————————————————————————————————————— comum

/** Jade: disco "bi" de jade polido, com anel gravado e um reflexo que passeia pela borda. */
export function Jade({ v }: CoreProps) {
  const g = useGid('jg');
  const h = useGid('jh');
  const ring = (r: number) => `M${C - r} ${C} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  return (
    <>
      <Breathe period={4400} scale={[0.96, 1.05]} opacity={[0.4, 0.8]}>
        <Glow id={h} color={v.color} r={28} />
      </Breathe>
      <Layer>
        <Defs>
          <GemGradient id={g} c1={v.color} c2={v.color2 ?? v.color} hi={0.55} />
        </Defs>
        <Path d={`${ring(17)} ${ring(5.5)}`} fillRule="evenodd" fill={`url(#${g})`} stroke="#0B3B26" strokeOpacity={0.7} strokeWidth={1.2} />
        <Circle cx={C} cy={C} r={11.5} stroke="#0B3B26" strokeOpacity={0.4} strokeWidth={0.8} fill="none" />
        <G stroke="#E8FFF1" strokeOpacity={0.5} strokeWidth={0.9} strokeLinecap="round">
          {[0, 90, 180, 270].map((d) => {
            const a = polar(8.4, d);
            const b = polar(10.4, d);
            return <Line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </G>
      </Layer>
      <Spin period={16000}>
        <Path d={arc(14.4, -40, 22)} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      </Spin>
      <Particles mode="twinkle" count={1} period={5000} colors={['#E8FFF1']} size={[3, 3]} radius={[15, 15]} arc={[30, 50]} sparkle seed={7} />
    </>
  );
}

/** Coral: ramos que balançam devagar, pontas que acendem e bolhas subindo. */
export function Coral({ v }: CoreProps) {
  const h = useGid('ch');
  const c2 = v.color2 ?? v.color;
  const branches = [
    'M120 138 Q119 126 112 116 Q106 108 107 98',
    'M112 116 Q104 112 99 104',
    'M120 138 Q122 124 124 112 Q126 100 122 90',
    'M124 112 Q132 108 135 100',
    'M122 136 Q131 128 137 120 Q142 114 141 106',
    'M137 120 Q144 120 148 114',
  ];
  const tips = [
    [107, 98],
    [99, 104],
    [122, 90],
    [135, 100],
    [141, 106],
    [148, 114],
  ];
  return (
    <>
      <Breathe period={3800} scale={[0.95, 1.06]} opacity={[0.4, 0.8]}>
        <Glow id={h} color={v.color} r={28} />
      </Breathe>
      <Sway period={7000} degrees={2.2}>
        <G transform="translate(-4 -1)">
          <Ellipse cx={124} cy={141} rx={14} ry={4.4} fill="#3A1F33" stroke="#1F0F1C" strokeWidth={0.8} />
          <G stroke={c2} strokeWidth={6} strokeLinecap="round" fill="none">
            {branches.map((d, i) => (
              <Path key={i} d={d} />
            ))}
          </G>
          <G stroke={v.color} strokeWidth={3.8} strokeLinecap="round" fill="none">
            {branches.map((d, i) => (
              <Path key={i} d={d} />
            ))}
          </G>
          <G stroke="#FFD9D0" strokeOpacity={0.6} strokeWidth={1.1} strokeLinecap="round" fill="none">
            {branches.map((d, i) => (
              <Path key={i} d={d} transform="translate(-0.8 -0.8)" />
            ))}
          </G>
          {tips.map(([x, y], i) => (
            <G key={i}>
              <Circle cx={x} cy={y} r={3.4} fill={v.color} />
              <Circle cx={x - 0.6} cy={y - 0.8} r={1.3} fill="#FFFFFF" fillOpacity={0.8} />
            </G>
          ))}
        </G>
      </Sway>
      <Particles mode="rise" count={3} period={4200} colors={['#FFFFFF', '#FFD9D0']} size={[2, 3.4]} radius={[10, 18]} arc={[150, 210]} travel={40} seed={17} />
    </>
  );
}

// ——————————————————————————————————————————————— incomum

/** Ametista: geodo aberto — cristais em leque brotando da pedra, brilhos nas pontas e poeira em órbita. */
export function Ametista({ v }: CoreProps) {
  const h = useGid('mh');
  const k = useGid('mk');
  const c2 = v.color2 ?? v.color;
  const base = { x: C, y: C + 11 };
  const crystals = [
    { deg: -64, len: 17, w: 6 },
    { deg: -36, len: 22, w: 7 },
    { deg: -8, len: 27, w: 8 },
    { deg: 20, len: 22, w: 7 },
    { deg: 48, len: 17, w: 6 },
  ];
  return (
    <>
      <Breathe period={4000} scale={[0.96, 1.06]} opacity={[0.4, 0.85]}>
        <Glow id={h} color={v.color} r={32} />
      </Breathe>
      <Layer>
        <Defs>
          <RadialGradient id={k} cx="50%" cy="60%" r="60%">
            <Stop offset="0" stopColor={c2} />
            <Stop offset="1" stopColor="#1B1440" />
          </RadialGradient>
        </Defs>
        <Path d={wavyCircle(21, 1.8, 7)} fill="#2A2250" stroke="#120C2E" strokeWidth={1.2} />
        <Circle cx={C} cy={C + 1} r={16} fill={`url(#${k})`} />
        {crystals.map((c, i) => {
          const d = { x: Math.sin((c.deg * Math.PI) / 180), y: -Math.cos((c.deg * Math.PI) / 180) };
          const p = { x: Math.cos((c.deg * Math.PI) / 180), y: Math.sin((c.deg * Math.PI) / 180) };
          const at = (along: number, side: number) => ({ x: base.x + d.x * along + p.x * side, y: base.y + d.y * along + p.y * side });
          const tip = at(c.len, 0);
          const half = c.w / 2;
          return (
            <G key={i}>
              <Polygon points={pts([at(0, -half), at(c.len * 0.72, -half), tip, at(0, 0)])} fill={c2} stroke="#E9DEFF" strokeOpacity={0.45} strokeWidth={0.6} strokeLinejoin="round" />
              <Polygon points={pts([at(0, 0), tip, at(c.len * 0.72, half), at(0, half)])} fill={v.color} stroke="#E9DEFF" strokeOpacity={0.45} strokeWidth={0.6} strokeLinejoin="round" />
            </G>
          );
        })}
      </Layer>
      <Spin period={30000}>
        <G fill="#E9DEFF" fillOpacity={0.85}>
          {[20, 140, 260].map((deg) => {
            const p = polar(26, deg);
            return <Polygon key={deg} points={`${p.x},${p.y - 3} ${p.x + 1.8},${p.y} ${p.x},${p.y + 3} ${p.x - 1.8},${p.y}`} />;
          })}
        </G>
      </Spin>
      <Particles mode="twinkle" count={3} period={3600} colors={['#FFFFFF', v.color]} size={[3, 4.4]} radius={[12, 22]} arc={[-70, 60]} sparkle seed={29} />
    </>
  );
}

/** Obsidiana: caco de vidro vulcânico — escuro, com borda acesa e um reflexo que cruza de tempos em tempos. */
export function Obsidiana({ v }: CoreProps) {
  const g = useGid('og');
  const h = useGid('oh');
  const shard = [18, 13, 19, 15, 18, 14].map((r, i) => polar(r, 15 + i * 60));
  return (
    <>
      <Breathe period={4800} scale={[0.96, 1.05]} opacity={[0.3, 0.7]}>
        <Glow id={h} color={v.color} r={30} opacity={0.6} />
      </Breathe>
      <Layer>
        <Defs>
          <RadialGradient id={g} cx="32%" cy="28%" r="80%">
            <Stop offset="0" stopColor="#8F7FE8" />
            <Stop offset="0.5" stopColor="#2E2670" />
            <Stop offset="1" stopColor="#0A0820" />
          </RadialGradient>
        </Defs>
        <Polygon points={pts(shard)} fill={`url(#${g})`} stroke={v.color} strokeWidth={1.9} strokeLinejoin="round" />
        <G stroke="#FFFFFF" strokeOpacity={0.2} strokeWidth={0.7}>
          {shard.map((p, i) => (
            <Line key={i} x1={C} y1={C} x2={p.x} y2={p.y} />
          ))}
        </G>
      </Layer>
      <Glimmer period={5200} window={0.3} peak={0.8}>
        <Polygon points="107,105 112,105 132,135 127,135" fill="#FFFFFF" fillOpacity={0.55} />
      </Glimmer>
      <Extra>
        <Glimmer period={5200} phase={0.5} window={0.25} peak={0.5}>
          <Polygon points="114,104 116,104 130,126 128,126" fill="#D8CEFF" fillOpacity={0.5} />
        </Glimmer>
      </Extra>
      <Spin period={14000}>
        <Path d={arc(19, 300, 352)} stroke="#C9B8FF" strokeOpacity={0.8} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      </Spin>
      <Particles mode="orbit" count={2} period={6400} colors={[v.color, '#C9B8FF']} size={[2.4, 3.4]} radius={[25, 27]} tilt={0.5} plane={30} seed={13} />
    </>
  );
}

// ——————————————————————————————————————————————— raro

/** Esmeralda: lapidação em degraus, coroa de hera girando, pulsos verdes e vaga-lumes em órbita. */
export function Esmeralda({ v }: CoreProps) {
  const g = useGid('eg');
  const h = useGid('eh');
  const c2 = v.color2 ?? v.color;
  const cut = (k: number) =>
    pts(
      [
        [-8, -16],
        [8, -16],
        [12, -10],
        [12, 10],
        [8, 16],
        [-8, 16],
        [-12, 10],
        [-12, -10],
      ].map(([x, y]) => ({ x: C + x * k, y: C + y * k })),
    );
  const leaves = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <>
      <Breathe period={3600} scale={[0.94, 1.08]} opacity={[0.45, 0.9]}>
        <Glow id={h} color={v.color} r={40} opacity={0.5} />
      </Breathe>
      <Wave period={3200} from={14} to={46} drawnAt={30} peak={0.5} hold={0.2}>
        <Circle cx={C} cy={C} r={30} stroke={v.color} strokeWidth={1.4} fill="none" />
      </Wave>
      <Spin period={26000}>
        <Circle cx={C} cy={C} r={28} stroke="#7FF3A0" strokeOpacity={0.4} strokeWidth={0.9} strokeDasharray="2 3" fill="none" />
        <G fill={v.color} fillOpacity={0.9} stroke={c2} strokeWidth={0.6}>
          {leaves.map((deg) => {
            const p = polar(28, deg);
            return <Ellipse key={deg} cx={p.x} cy={p.y} rx={5.2} ry={2.2} transform={`rotate(${deg} ${p.x} ${p.y})`} />;
          })}
        </G>
      </Spin>
      <Layer>
        <Defs>
          <GemGradient id={g} c1={v.color} c2={c2} hi={0.85} />
        </Defs>
        <Polygon points={cut(1)} fill={`url(#${g})`} stroke="#D8FFE9" strokeOpacity={0.6} strokeWidth={1.1} strokeLinejoin="round" />
        <Polygon points={cut(0.66)} fill="#FFFFFF" fillOpacity={0.1} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={0.7} strokeLinejoin="round" />
        <Polygon points={cut(0.32)} fill="#FFFFFF" fillOpacity={0.2} stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={0.6} strokeLinejoin="round" />
        <G stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={0.6}>
          {[
            [-8, -16, -5.3, -10.6],
            [8, -16, 5.3, -10.6],
            [12, 10, 8, 6.6],
            [-12, 10, -8, 6.6],
          ].map(([x1, y1, x2, y2], i) => (
            <Line key={i} x1={C + x1} y1={C + y1} x2={C + x2} y2={C + y2} />
          ))}
        </G>
      </Layer>
      <Glimmer period={4600} window={0.3} peak={0.7}>
        <Polygon points="111,103 116,103 128,137 123,137" fill="#FFFFFF" fillOpacity={0.5} />
      </Glimmer>
      <Particles mode="orbit" count={4} period={7200} colors={['#D6FF6B', '#7FF3A0']} size={[2.4, 3.6]} radius={[33, 37]} tilt={0.55} plane={-25} glow seed={37} />
    </>
  );
}

/** Gelo Eterno: floco de neve girando dentro de um cristal hexagonal, anel de geada e neve miúda caindo. */
export function Gelo({ v }: CoreProps) {
  const g = useGid('gg');
  const h = useGid('gh');
  const arm = (deg: number) => {
    const tip = polar(15, deg);
    const b1 = polar(8, deg);
    const b2 = polar(12, deg);
    const l1 = polar(4.2, deg - 45, b1.x, b1.y);
    const r1 = polar(4.2, deg + 45, b1.x, b1.y);
    const l2 = polar(3.2, deg - 45, b2.x, b2.y);
    const r2 = polar(3.2, deg + 45, b2.x, b2.y);
    return `M${C} ${C} L${tip.x.toFixed(1)} ${tip.y.toFixed(1)} M${l1.x.toFixed(1)} ${l1.y.toFixed(1)} L${b1.x.toFixed(1)} ${b1.y.toFixed(1)} L${r1.x.toFixed(1)} ${r1.y.toFixed(1)} M${l2.x.toFixed(1)} ${l2.y.toFixed(1)} L${b2.x.toFixed(1)} ${b2.y.toFixed(1)} L${r2.x.toFixed(1)} ${r2.y.toFixed(1)}`;
  };
  return (
    <>
      <Breathe period={4200} scale={[0.95, 1.07]} opacity={[0.4, 0.85]}>
        <Glow id={h} color={v.color} r={38} opacity={0.5} />
      </Breathe>
      <Wave period={4400} from={16} to={44} drawnAt={30} peak={0.45} hold={0.25}>
        <Circle cx={C} cy={C} r={30} stroke="#DFF3FF" strokeWidth={1.3} fill="none" />
      </Wave>
      <Layer>
        <Defs>
          <GemGradient id={g} c1={v.color} c2={v.color2 ?? v.color} hi={0.9} />
        </Defs>
        <Polygon points={ngon(6, 19, 0)} fill={`url(#${g})`} fillOpacity={0.85} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={1.2} strokeLinejoin="round" />
        <Polygon points={ngon(6, 12, 0)} fill="#FFFFFF" fillOpacity={0.1} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={0.6} />
      </Layer>
      <Spin period={36000}>
        <Path d={[0, 60, 120, 180, 240, 300].map(arm).join(' ')} stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Circle cx={C} cy={C} r={2.2} fill="#FFFFFF" />
      </Spin>
      <Spin period={24000} reverse>
        <Circle cx={C} cy={C} r={27} stroke="#CFE9FF" strokeOpacity={0.5} strokeWidth={0.9} strokeDasharray="0.5 4.5" strokeLinecap="round" fill="none" />
        <G fill="#EAF6FF">
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const p = polar(27, deg);
            return <Polygon key={deg} points={`${p.x},${p.y - 3} ${p.x + 1.6},${p.y} ${p.x},${p.y + 3} ${p.x - 1.6},${p.y}`} />;
          })}
        </G>
      </Spin>
      <Particles mode="fall" count={5} period={4600} colors={['#FFFFFF', '#CFE9FF']} size={[1.8, 2.8]} radius={[18, 32]} arc={[-55, 55]} travel={46} seed={43} />
      <Particles mode="twinkle" count={2} period={3400} colors={['#FFFFFF']} size={[3.4, 4.4]} radius={[10, 17]} sparkle seed={44} />
    </>
  );
}

// ——————————————————————————————————————————————— épico

/** Eclipse: disco escuro diante da coroa dourada; o "anel de diamante" volta devagar, com pulsos e centelhas. */
export function Eclipse({ v }: CoreProps) {
  const g = useGid('xg');
  const h = useGid('xh');
  const d = useGid('xd');
  const c2 = v.color2 ?? v.color;
  const spot = polar(14, 40);
  return (
    <>
      <Breathe period={3400} scale={[0.92, 1.1]} opacity={[0.5, 1]}>
        <Glow id={h} color={v.color} r={46} opacity={0.55} />
      </Breathe>
      {[0, 0.5].map((ph, i) => (
        <Extra key={i} min={i ? 0.5 : 0}>
          <Wave period={3600} phase={ph} from={14} to={50} drawnAt={30} peak={0.5} hold={0.25}>
            <Circle cx={C} cy={C} r={30} stroke={i ? c2 : v.color} strokeWidth={1.4} fill="none" />
          </Wave>
        </Extra>
      ))}
      <Spin period={34000}>
        <G fill={v.color} fillOpacity={0.85}>
          {Array.from({ length: 8 }, (_, i) => (
            <Polygon key={i} points={ray(i * 45, 13, 38, 5)} />
          ))}
        </G>
        <G fill={c2} fillOpacity={0.7}>
          {Array.from({ length: 8 }, (_, i) => (
            <Polygon key={i} points={ray(i * 45 + 22.5, 13, 28, 3.5)} />
          ))}
        </G>
      </Spin>
      <Extra>
        <Spin period={52000} reverse opacity={0.55}>
          <Circle cx={C} cy={C} r={32} stroke={c2} strokeWidth={0.9} strokeDasharray="1 5" strokeLinecap="round" fill="none" />
        </Spin>
      </Extra>
      <Breathe period={3400} opacity={[0.35, 0.9]}>
        <Circle cx={C} cy={C} r={17.5} stroke="#FFF6D6" strokeOpacity={0.55} strokeWidth={3} fill="none" />
      </Breathe>
      <Layer>
        <Defs>
          <RadialGradient id={g} cx="42%" cy="38%" r="70%">
            <Stop offset="0" stopColor="#2A2250" />
            <Stop offset="1" stopColor="#05040F" />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C} r={14.5} fill={`url(#${g})`} stroke="#2A2250" strokeWidth={0.8} />
      </Layer>
      <Spin period={20000}>
        <Defs>
          <RadialGradient id={d} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
            <Stop offset="1" stopColor={v.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={spot.x} cy={spot.y} r={8} fill={`url(#${d})`} />
        <Circle cx={spot.x} cy={spot.y} r={2.6} fill="#FFFFFF" />
      </Spin>
      <Particles mode="radial" count={6} period={3200} colors={[v.color, c2, '#FFFFFF']} size={[2, 3.2]} radius={[18, 46]} glow seed={47} />
      <Particles mode="orbit" count={3} period={8200} colors={['#FFF6D6', c2]} size={[2.6, 3.8]} radius={[40, 44]} tilt={0.45} plane={20} sparkle seed={48} />
    </>
  );
}
