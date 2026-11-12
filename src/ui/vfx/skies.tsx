/**
 * Ambientes novos do Áster (espaço `scene`): vinte e quatro céus do espaço profundo.
 * Mesmo contrato dos cenários antigos (scenes.tsx): `Art` é a paisagem parada de 300 × 300
 * unidades e `Live` são as camadas animadas por cima.
 *
 * O palco corta a arte em cima e embaixo (sobra a faixa de ~y 40 a 260) e o Áster cobre o miolo:
 * a composição vive nos flancos e nos cantos, ou em formas grandes que vazam por trás do corpo.
 */
import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, Polyline, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useLoop } from './engine';
import { Drift, Glow, Motes, Pulse, Rotate, Sky, Stars, Twinkles, fill, rng, useSpots, useUnit, type Box, type SceneFx, type Spot } from './scenekit';

const TAU = Math.PI * 2;
const WH = '#FFFFFF';

// ————————————————————————————————————————————————————— peças

/** Nuvem de gás: uma elipse que some nas bordas. */
function Blob({ id, x, y, rx, ry = rx, color, o = 0.4, rot = 0 }: { id: string; x: number; y: number; rx: number; ry?: number; color: string; o?: number; rot?: number }) {
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={o} />
          <Stop offset="0.6" stopColor={color} stopOpacity={o * 0.4} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} />
    </>
  );
}

/** Astro com volume: luz de cima à esquerda, sombra do outro lado. */
function Ball({ id, x, y, r, c1, c2, shade = '#04060F' }: { id: string; x: number; y: number; r: number; c1: string; c2: string; shade?: string }) {
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="34%" cy="30%" r="80%">
          <Stop offset="0" stopColor={c1} />
          <Stop offset="0.55" stopColor={c2} />
          <Stop offset="1" stopColor={shade} />
        </RadialGradient>
      </Defs>
      <Circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </>
  );
}

/** Estrela brilhante, com as quatro pontas de difração. */
function Spark({ x, y, r, color = WH }: { x: number; y: number; r: number; color?: string }) {
  return (
    <G>
      <Path d={`M${x - r} ${y} H${x + r} M${x} ${y - r} V${y + r}`} stroke={color} strokeWidth={0.8} strokeLinecap="round" strokeOpacity={0.85} />
      <Circle cx={x} cy={y} r={r * 0.24} fill={color} />
    </G>
  );
}

/** Braço em espiral em torno de (cx, cy). */
function arm(cx: number, cy: number, r0: number, r1: number, turns: number, rot: number, steps = 44): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = r0 + (r1 - r0) * t;
    const a = rot + turns * TAU * t;
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)} `;
  }
  return d;
}

/** Laço fechado e ondulado em torno de (cx, cy). */
function wavy(cx: number, cy: number, r: number, amp: number, waves: number, phase = 0, steps = 96): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * TAU;
    const rr = r + amp * Math.sin(waves * a + phase) + amp * 0.5 * Math.sin((waves * 2 + 1) * a + phase * 2);
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)} `;
  }
  return `${d}Z`;
}

/** Fileira de nuvens: uma linha de arcos de `y` para baixo. */
function scallop(y: number, w: number, h: number, off = 0): string {
  let d = `M0 300 V${y}`;
  for (let x = -off; x < 300; x += w) d += ` Q${x + w / 2} ${y - h} ${x + w} ${y}`;
  return `${d} V300 Z`;
}

/** Triângulo fino saindo de um ponto (serpentina, feixe). */
function beam(x: number, y: number, deg: number, len: number, half: number): string {
  const a = (deg * Math.PI) / 180;
  const p = (d: number, l: number) => `${(x + l * Math.cos(a + (d * Math.PI) / 180)).toFixed(1)},${(y + l * Math.sin(a + (d * Math.PI) / 180)).toFixed(1)}`;
  return `${x},${y} ${p(-half, len)} ${p(half, len)}`;
}

/** Riscos de luz que cruzam o céu de vez em quando (meteoros, estrelas esticadas). */
function Shoots({ count, seed, box, angle, length = 44, period = 5200, colors = [WH] }: { count: number; seed: number; box: Box; angle: number; length?: number; period?: number; colors?: string[] }) {
  const spots = useSpots(count, seed, box, [1, 1.8], colors);
  const clock = useLoop(period, 0);
  const unit = useUnit();
  return (
    <View pointerEvents="none" style={fill}>
      {spots.map((s, i) => (
        <Shoot key={i} s={s} clock={clock} unit={unit} angle={angle} length={length} />
      ))}
    </View>
  );
}

function Shoot({ s, clock, unit, angle, length }: { s: Spot; clock: SharedValue<number>; unit: number; angle: number; length: number }) {
  const rad = (angle * Math.PI) / 180;
  const run = length * unit * 2.6;
  const dx = Math.cos(rad) * run;
  const dy = Math.sin(rad) * run;
  const speed = s.speed;
  const phase = s.phase;
  const style = useAnimatedStyle(() => {
    const u = (clock.value * speed + phase) % 1;
    // Cada risco só existe num quinto do ciclo; no resto, o céu fica quieto.
    const k = u < 0.2 ? u / 0.2 : 1;
    return { opacity: u < 0.2 ? Math.sin(Math.PI * k) : 0, transform: [{ translateX: dx * k }, { translateY: dy * k }, { rotate: `${angle}deg` }] };
  });
  const len = length * unit;
  return <Animated.View style={[{ position: 'absolute', left: s.x * unit - len / 2, top: s.y * unit, width: len, height: Math.max(1, s.d * unit), borderRadius: 2, backgroundColor: s.color }, style]} />;
}

// ————————————————————————————————————————————————————— comuns

/** Campo Estelar — só estrelas, de três cores, e meia dúzia das brilhantes. */
const CampoEstelar: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#03040C'], [0.6, '#080B1E'], [1, '#0E1230']]} />
      <Stars seed={301} n={64} box={[0, 0, 300, 300]} />
      <Stars seed={302} n={22} box={[0, 0, 300, 300]} color="#9FC2FF" max={1.6} />
      <Stars seed={303} n={14} box={[0, 0, 300, 300]} color="#FFD9A8" max={1.7} />
      <Spark x={36} y={72} r={8} />
      <Spark x={266} y={96} r={6} color="#BFD6FF" />
      <Spark x={248} y={226} r={7} color="#FFE2B8" />
      <Spark x={52} y={214} r={5} />
      <Spark x={150} y={52} r={4} color="#BFD6FF" />
    </>
  ),
  Live: () => <Twinkles count={18} seed={304} box={[6, 40, 294, 260]} colors={[WH, '#BFD6FF', '#FFE2B8']} />,
};

/** Crepúsculo Orbital — a curva de um planeta, a linha azul do ar e o sol nascendo na borda. */
const CrepusculoOrbital: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#02030A'], [0.7, '#060A1C'], [1, '#0A1230']]} />
      <Stars seed={311} n={44} box={[0, 0, 300, 200]} />
      <Circle cx={150} cy={540} r={332} fill="#2F7BFF" fillOpacity={0.14} />
      <Circle cx={150} cy={540} r={325} fill="#58B4FF" fillOpacity={0.32} />
      <Circle cx={150} cy={540} r={320} fill="#061226" />
      <Glow id={`sg${uid}`} x={248} y={236} r={46} color="#FFE7B0" opacity={0.75} />
      <Circle cx={248} cy={235} r={4} fill={WH} />
      <Path d="M210 226 L286 244" stroke="#FFE7B0" strokeOpacity={0.5} strokeWidth={1} strokeLinecap="round" />
      <G fill="#FFD98A" fillOpacity={0.8}>
        {[[30, 262], [38, 258], [44, 264], [72, 246], [80, 250], [118, 236], [124, 240], [60, 256]].map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={0.9} />
        ))}
      </G>
    </>
  ),
  Live: () => (
    <>
      <Pulse period={5200} opacity={[0.35, 0.9]}>
        <Glow id="crl" x={248} y={236} r={30} color={WH} opacity={0.8} />
      </Pulse>
      <Twinkles count={12} seed={312} box={[6, 40, 294, 190]} colors={[WH, '#BFD6FF']} />
    </>
  ),
};

/** Mar da Tranquilidade — chão cinza de crateras e, no céu preto, um mundo azul. */
const SoloLunar: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#02030A'], [1, '#0A0E22']]} />
      <Stars seed={321} n={46} box={[0, 0, 300, 214]} />
      <Glow id={`eg${uid}`} x={250} y={84} r={44} color="#6FB4FF" opacity={0.28} />
      <Ball id={`eb${uid}`} x={250} y={84} r={21} c1="#BFE6FF" c2="#2F6FD0" shade="#06102A" />
      <Path d="M238 76 q6 -6 12 -2 q-2 8 -8 8 Z M252 90 q8 -2 10 4 q-6 6 -12 2 Z" fill="#4FB07A" fillOpacity={0.8} />
      <Path d="M234 86 q10 -4 20 0 M244 98 q8 -3 16 -1" stroke={WH} strokeOpacity={0.7} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <Path d="M0 300 V222 Q40 210 86 220 T170 214 T250 222 T300 216 V300 Z" fill="#8E93A6" />
      <Path d="M0 300 V238 Q60 226 120 236 T230 234 T300 240 V300 Z" fill="#6C7186" />
      <Path d="M0 300 V256 Q80 246 160 256 T300 252 V300 Z" fill="#4A4F66" />
      {[[34, 232, 13, 3.4], [100, 226, 9, 2.4], [200, 232, 16, 4], [270, 228, 8, 2.2], [150, 250, 20, 4.4], [56, 254, 10, 2.6]].map(([x, y, rx, ry], i) => (
        <G key={i}>
          <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#2E3246" />
          <Path d={`M${x - rx} ${y} A${rx} ${ry} 0 0 0 ${x + rx} ${y}`} stroke="#C9CEE0" strokeOpacity={0.7} strokeWidth={0.8} fill="none" />
        </G>
      ))}
    </>
  ),
  Live: () => <Twinkles count={10} seed={322} box={[6, 40, 220, 200]} colors={[WH]} />,
};

/** Névoa Violeta — véus de gás lilás e rosa, sem contorno. */
const NevoaVioleta: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#0A0620'], [0.5, '#1A0E3E'], [1, '#2A1552']]} />
      <Blob id={`a${uid}`} x={50} y={90} rx={120} ry={70} color="#B06CFF" o={0.5} rot={-20} />
      <Blob id={`b${uid}`} x={256} y={206} rx={120} ry={80} color="#FF6FB5" o={0.34} rot={25} />
      <Blob id={`c${uid}`} x={250} y={60} rx={76} ry={50} color="#5F8BFF" o={0.34} />
      <Blob id={`d${uid}`} x={40} y={236} rx={84} ry={50} color="#7A5CFF" o={0.4} />
      <Stars seed={331} n={40} box={[0, 0, 300, 300]} />
      <Spark x={272} y={130} r={5} color="#FFD6F0" />
    </>
  ),
  Live: () => (
    <>
      <Drift period={26000} amp={14}>
        <Blob id="nvl1" x={70} y={150} rx={70} ry={30} color="#D9B8FF" o={0.24} />
        <Blob id="nvl2" x={236} y={120} rx={60} ry={26} color="#FF9FD0" o={0.2} />
      </Drift>
      <Twinkles count={12} seed={332} box={[6, 40, 294, 260]} colors={[WH, '#E3D0FF']} />
    </>
  ),
};

/** Chuva de Meteoros — todos os riscos parecem sair do mesmo ponto do céu. */
const ChuvaMeteoros: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#050818'], [0.6, '#0E1840'], [1, '#22306A']]} />
      <Stars seed={341} n={50} box={[0, 0, 300, 230]} />
      <G stroke={WH} strokeLinecap="round">
        {[[214, 82, 176, 118, 0.5], [150, 62, 96, 84, 0.35], [262, 116, 250, 168, 0.4], [96, 124, 44, 160, 0.3], [226, 150, 200, 196, 0.25]].map(([x1, y1, x2, y2, o], i) => (
          <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1} strokeOpacity={o} />
        ))}
      </G>
      <Path d="M0 300 V244 L40 232 L70 246 L112 226 L150 248 L206 236 L244 250 L300 238 V300 Z" fill="#0A0F2A" />
      <Path d="M52 246 V228 M46 234 L52 228 L58 234 M48 240 L52 235 L56 240" stroke="#0A0F2A" strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  ),
  Live: () => (
    <>
      <Shoots count={6} seed={342} box={[90, 40, 290, 150]} angle={146} length={40} period={6400} />
      <Twinkles count={10} seed={343} box={[6, 40, 294, 210]} colors={[WH, '#BFD6FF']} />
    </>
  ),
};

/** Poente Duplo — dois sóis descendo juntos sobre um planalto. */
const PoenteDuplo: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#1B1440'], [0.4, '#7A3F7E'], [0.68, '#F0865A'], [1, '#FFD08A']]} />
      <Glow id={`a${uid}`} x={50} y={208} r={80} color="#FFE9A8" opacity={0.6} />
      <Circle cx={50} cy={210} r={24} fill="#FFF3C8" />
      <Glow id={`b${uid}`} x={252} y={186} r={46} color="#FF7A6B" opacity={0.55} />
      <Circle cx={252} cy={188} r={12} fill="#FFB199" />
      <Path d="M0 300 V236 H26 V224 H70 V236 H118 L150 244 H204 V230 H240 V242 H300 V300 Z" fill="#6A3358" />
      <Path d="M0 300 V254 Q70 244 150 254 T300 250 V300 Z" fill="#3B1C3E" />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={6000} opacity={[0.3, 0.8]}>
        <Glow id="pdl" x={50} y={210} r={56} color="#FFF3C4" opacity={0.6} />
      </Pulse>
      <Motes count={7} seed={351} box={[10, 214, 290, 258]} colors={['#FFE2B8', WH]} size={[1.6, 2.6]} period={8200} travel={34} sway={16} />
    </>
  ),
};

// ————————————————————————————————————————————————————— incomuns

/** Via Láctea — a faixa da nossa galáxia cruzando o céu, com as veias escuras de poeira. */
const ViaLactea: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#03050F'], [1, '#0A1028']]} />
      <Stars seed={361} n={36} box={[0, 0, 300, 300]} />
      <G transform="rotate(-36 150 150)">
        <Blob id={`a${uid}`} x={150} y={150} rx={240} ry={50} color="#C9B8FF" o={0.36} />
        <Blob id={`b${uid}`} x={176} y={146} rx={130} ry={28} color="#FFE2C0" o={0.42} />
        <Path d="M-50 152 Q60 138 150 152 T350 146" stroke="#03050F" strokeOpacity={0.75} strokeWidth={8} fill="none" strokeLinecap="round" />
        <Path d="M30 164 Q120 172 210 158" stroke="#03050F" strokeOpacity={0.5} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Stars seed={362} n={70} box={[-70, 116, 370, 184]} max={1.1} />
      </G>
      <Path d="M0 300 V250 L18 240 L30 250 L46 236 L60 250 L300 256 V300 Z" fill="#05070F" />
    </>
  ),
  Live: () => <Twinkles count={16} seed={363} box={[6, 40, 294, 250]} colors={[WH, '#FFE2C0', '#C9B8FF']} />,
};

/** Sob os Anéis — o céu de quem mora num planeta de anéis: arcos enormes de horizonte a horizonte. */
const SobAneis: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#0B0A1E'], [0.6, '#2A1B3E'], [1, '#6E3F4E']]} />
      <Stars seed={371} n={30} box={[0, 0, 300, 170]} />
      <G fill="none">
        {[
          [396, 9, '#E8D2A8', 0.55],
          [410, 4, '#C9A878', 0.4],
          [420, 12, '#F0DDB8', 0.6],
          [438, 3, '#B8946A', 0.35],
          [448, 8, '#E0C498', 0.5],
          [462, 2, '#FFF0D0', 0.5],
        ].map(([r, w, c, o], i) => (
          <Circle key={i} cx={-30} cy={500} r={r as number} stroke={c as string} strokeOpacity={o as number} strokeWidth={w as number} />
        ))}
      </G>
      <Polygon points="206,40 236,40 300,160 300,206" fill="#0B0A1E" fillOpacity={0.5} />
      <Glow id={`s${uid}`} x={40} y={76} r={26} color="#FFF0D0" opacity={0.7} />
      <Circle cx={40} cy={76} r={3.4} fill={WH} />
      <Path d="M0 300 V244 Q80 232 150 240 T300 234 V300 Z" fill="#8A5A4A" />
      <Path d="M0 300 V256 Q90 246 170 254 T300 250 V300 Z" fill="#5E3A3E" />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={7000} opacity={[0.2, 0.7]}>
        <Circle cx={-30} cy={500} r={420} stroke="#FFF6E0" strokeWidth={5} fill="none" />
      </Pulse>
      <Twinkles count={8} seed={372} box={[6, 40, 200, 150]} colors={[WH]} />
    </>
  ),
};

/** Nebulosa de Emissão — hidrogênio aceso em vermelho, com dedos escuros de poeira. */
const NebulosaEmissao: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#12040C'], [0.5, '#3A0C1E'], [1, '#1A0612']]} />
      <Blob id={`a${uid}`} x={60} y={100} rx={120} ry={90} color="#FF4D6D" o={0.55} />
      <Blob id={`b${uid}`} x={246} y={140} rx={110} ry={120} color="#FF8A5C" o={0.4} />
      <Blob id={`c${uid}`} x={150} y={250} rx={170} ry={60} color="#C23B6E" o={0.5} />
      <Blob id={`d${uid}`} x={256} y={62} rx={60} ry={40} color="#7FE0FF" o={0.34} />
      <Path d="M14 300 Q18 232 40 210 Q52 232 50 300 Z M246 300 Q244 236 268 206 Q284 236 278 300 Z M70 300 Q74 258 86 246 Q94 262 92 300 Z" fill="#0A0208" />
      <Stars seed={381} n={34} box={[0, 0, 300, 300]} />
      <Spark x={40} y={206} r={5} color="#FFD0D8" />
      <Spark x={268} y={202} r={6} color="#FFE2C8" />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={7600} opacity={[0.2, 0.7]}>
        <Blob id="nel" x={60} y={110} rx={80} ry={60} color="#FF8FA8" o={0.5} />
      </Pulse>
      <Twinkles count={12} seed={382} box={[6, 40, 294, 250]} colors={[WH, '#FFD0D8']} />
    </>
  ),
};

/** Gigante no Horizonte — um planeta de faixas ocupando um canto inteiro do céu, com duas luas. */
const GiganteProximo: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#04060F'], [1, '#0B1026']]} />
      <Stars seed={391} n={40} box={[0, 0, 300, 300]} />
      <Defs>
        <ClipPath id={`gc${uid}`}>
          <Circle cx={20} cy={60} r={128} />
        </ClipPath>
        <RadialGradient id={`gs${uid}`} cx="30%" cy="30%" r="80%">
          <Stop offset="0" stopColor="#000000" stopOpacity={0} />
          <Stop offset="0.6" stopColor="#000000" stopOpacity={0.15} />
          <Stop offset="1" stopColor="#02030A" stopOpacity={0.9} />
        </RadialGradient>
      </Defs>
      <G clipPath={`url(#gc${uid})`}>
        <G transform="rotate(16 20 60)">
          {['#E8C08A', '#C98850', '#F0D2A0', '#B5703F', '#E0B078', '#A85F3A', '#EBCB98', '#C07E4A', '#F2DAB0', '#B06A40'].map((c, i) => (
            <Rect key={i} x={-120} y={-70 + i * 26} width={300} height={27} fill={c} />
          ))}
          <Ellipse cx={92} cy={112} rx={20} ry={9} fill="#B24A2E" />
          <Ellipse cx={92} cy={112} rx={12} ry={5} fill="#D9704A" />
        </G>
      </G>
      <Circle cx={20} cy={60} r={128} fill={`url(#gs${uid})`} />
      <Circle cx={20} cy={60} r={128} stroke="#FFD9A8" strokeOpacity={0.35} strokeWidth={1.2} fill="none" />
      <Ball id={`m1${uid}`} x={252} y={86} r={10} c1="#F4ECDC" c2="#9A93A8" />
      <Ball id={`m2${uid}`} x={270} y={214} r={5} c1="#FFD0B0" c2="#A8604A" />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={8000} opacity={[0.15, 0.6]}>
        <Circle cx={20} cy={60} r={130} stroke="#FFE7C4" strokeWidth={3} fill="none" />
      </Pulse>
      <Twinkles count={10} seed={392} box={[160, 40, 294, 260]} colors={[WH, '#BFD6FF']} />
    </>
  ),
};

/** Janela da Estação — a moldura de metal de uma escotilha e, do lado de fora, a curva azul. */
const EstacaoJanela: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#02030A'], [1, '#081022']]} />
      <Stars seed={401} n={44} box={[0, 0, 300, 300]} />
      <Circle cx={340} cy={430} r={270} fill="#3D8BFF" fillOpacity={0.22} />
      <Circle cx={340} cy={430} r={263} fill="#0E3A7A" />
      <Path d="M150 250 q30 -14 60 -8 M190 236 q34 -18 70 -14 M236 252 q24 -8 50 -4" stroke={WH} strokeOpacity={0.6} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path fillRule="evenodd" d="M0 0 H300 V300 H0 Z M40 46 H260 Q286 46 286 72 V228 Q286 254 260 254 H40 Q14 254 14 228 V72 Q14 46 40 46 Z" fill="#161B2C" />
      <Path d="M40 46 H260 Q286 46 286 72 V228 Q286 254 260 254 H40 Q14 254 14 228 V72 Q14 46 40 46 Z" stroke="#5A6A94" strokeWidth={2} fill="none" />
      <Path d="M40 52 H260 Q280 52 280 72 V228 Q280 248 260 248 H40 Q20 248 20 228 V72 Q20 52 40 52 Z" stroke="#2A3352" strokeWidth={1} fill="none" />
      <G fill="#5A6A94">
        {[[8, 60], [8, 150], [8, 240], [292, 60], [292, 150], [292, 240]].map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={2} />
        ))}
      </G>
      <G>
        <Rect x={40} y={258} width={10} height={3} rx={1} fill="#38D6B0" />
        <Rect x={54} y={258} width={10} height={3} rx={1} fill="#F2B54A" />
        <Rect x={68} y={258} width={10} height={3} rx={1} fill="#38D6B0" />
        <Rect x={236} y={258} width={24} height={3} rx={1} fill="#7FB6FF" />
      </G>
    </>
  ),
  Live: () => (
    <>
      <Pulse period={2400} opacity={[0.2, 1]}>
        <Rect x={54} y={258} width={10} height={3} rx={1} fill="#FFE08A" />
      </Pulse>
      <Twinkles count={10} seed={402} box={[24, 56, 276, 200]} colors={[WH]} />
    </>
  ),
};

/** O Grande Cometa — cabeça brilhante, cauda de poeira curva e cauda de íons reta e azul. */
const CometaCeu: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#060A1E'], [0.6, '#10204A'], [1, '#2B3F78']]} />
      <Stars seed={411} n={44} box={[0, 0, 300, 220]} />
      <Defs>
        <LinearGradient id={`ct${uid}`} x1="1" y1="0" x2="0" y2="0">
          <Stop offset="0" stopColor="#FFF6E0" stopOpacity={0.8} />
          <Stop offset="1" stopColor="#FFF6E0" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id={`ci${uid}`} x1="1" y1="0" x2="0" y2="0">
          <Stop offset="0" stopColor="#7FB6FF" stopOpacity={0.8} />
          <Stop offset="1" stopColor="#7FB6FF" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d="M262 92 Q170 50 20 56 Q150 86 262 100 Z" fill={`url(#ct${uid})`} />
      <Path d="M262 94 L30 118 L262 99 Z" fill={`url(#ci${uid})`} />
      <Glow id={`ch${uid}`} x={262} y={96} r={24} color="#DFF2FF" opacity={0.85} />
      <Circle cx={262} cy={96} r={4} fill={WH} />
      <Path d="M0 300 V236 L34 214 L58 232 L92 206 L128 240 L176 222 L214 244 L262 220 L300 240 V300 Z" fill="#0C1434" />
      <Path d="M92 206 L84 216 L92 214 L100 218 Z M262 220 L254 230 L262 228 L270 232 Z" fill="#DCE6FF" fillOpacity={0.8} />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={4200} opacity={[0.3, 0.9]}>
        <Glow id="cml" x={262} y={96} r={34} color={WH} opacity={0.6} />
      </Pulse>
      <Twinkles count={10} seed={412} box={[6, 120, 294, 210]} colors={[WH, '#BFD6FF']} />
    </>
  ),
};

// ————————————————————————————————————————————————————— raros

/** Galáxia Espiral — dois braços, um miolo dourado e uma vizinha vista de perfil. */
const GalaxiaEspiral: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#02030A'], [1, '#070B1C']]} />
      <Stars seed={421} n={50} box={[0, 0, 300, 300]} />
      <G transform="translate(232 92) rotate(-24) scale(1 0.5)">
        <Blob id={`a${uid}`} x={0} y={0} rx={84} color="#9FB8FF" o={0.3} />
        {[0, Math.PI].map((rot) => (
          <G key={rot} fill="none" strokeLinecap="round">
            <Path d={arm(0, 0, 6, 76, 1.15, rot)} stroke="#9FB8FF" strokeOpacity={0.3} strokeWidth={12} />
            <Path d={arm(0, 0, 6, 76, 1.15, rot)} stroke="#DCE6FF" strokeOpacity={0.8} strokeWidth={2.4} />
            <Path d={arm(0, 0, 10, 60, 1.0, rot + 0.5)} stroke="#FF9FC8" strokeOpacity={0.5} strokeWidth={1.2} strokeDasharray="2 5" />
          </G>
        ))}
        <Blob id={`b${uid}`} x={0} y={0} rx={22} color="#FFE7B0" o={0.95} />
      </G>
      <G transform="rotate(28 44 208)">
        <Blob id={`c${uid}`} x={44} y={208} rx={40} ry={7} color="#DCE6FF" o={0.7} />
        <Line x1={10} y1={208} x2={78} y2={208} stroke="#02030A" strokeOpacity={0.8} strokeWidth={1.4} />
        <Blob id={`d${uid}`} x={44} y={208} rx={8} ry={6} color="#FFE7B0" o={0.8} />
      </G>
    </>
  ),
  Live: () => (
    <>
      <Pulse period={6400} opacity={[0.2, 0.8]}>
        <Blob id="gel" x={232} y={92} rx={26} ry={16} color="#FFF3D0" o={0.8} />
      </Pulse>
      <Twinkles count={14} seed={422} box={[6, 40, 294, 260]} colors={[WH, '#DCE6FF']} />
    </>
  ),
};

/** Aglomerado Globular — cem mil estrelas velhas apertadas numa bola. */
const Aglomerado: SceneFx = {
  Art: ({ uid }) => {
    const r = rng(431);
    const ball = (cx: number, cy: number, R: number, n: number) =>
      Array.from({ length: n }, () => {
        const d = R * Math.pow(r(), 2.1);
        const a = r() * TAU;
        return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a), s: r() };
      });
    const hues = [WH, '#FFE2B8', '#FFC890', '#BFD6FF'];
    return (
      <>
        <Sky id={`sk${uid}`} stops={[[0, '#03040C'], [1, '#0A0C20']]} />
        <Stars seed={432} n={30} box={[0, 0, 300, 300]} />
        <Blob id={`a${uid}`} x={56} y={104} rx={74} color="#FFE2B8" o={0.5} />
        {ball(56, 104, 78, 96).map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={0.5 + p.s * 1.1} fill={hues[i % 4]} fillOpacity={0.55 + 0.45 * p.s} />
        ))}
        <Blob id={`b${uid}`} x={258} y={212} rx={32} color="#BFD6FF" o={0.45} />
        {ball(258, 212, 34, 34).map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={0.5 + p.s * 0.8} fill={hues[(i + 1) % 4]} fillOpacity={0.6 + 0.4 * p.s} />
        ))}
      </>
    );
  },
  Live: () => (
    <>
      <Twinkles count={14} seed={433} box={[10, 56, 104, 152]} colors={[WH, '#FFE2B8']} size={[1.6, 2.8]} />
      <Twinkles count={6} seed={434} box={[236, 190, 282, 236]} colors={[WH, '#BFD6FF']} size={[1.4, 2.4]} />
    </>
  ),
};

/** Pilares da Criação — três colunas de poeira fria, com as pontas acesas pelas estrelas novas. */
const Pilares: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#06202A'], [0.5, '#1E5A5A'], [1, '#C98A4A']]} />
      <Blob id={`a${uid}`} x={236} y={70} rx={120} ry={90} color="#7FE0D0" o={0.4} />
      <Blob id={`b${uid}`} x={50} y={226} rx={130} ry={100} color="#FFB86B" o={0.45} />
      <Stars seed={441} n={30} box={[0, 0, 300, 200]} />
      <Path d="M8 300 C12 240 2 180 22 122 C30 100 46 98 50 118 C54 146 66 160 62 196 C58 244 66 280 68 300 Z" fill="#241510" />
      <Path d="M22 122 C30 100 46 98 50 118" stroke="#FFD9A0" strokeOpacity={0.9} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Path d="M226 300 C230 250 220 214 236 166 C244 146 258 150 258 172 C260 204 270 232 266 300 Z" fill="#2A1810" />
      <Path d="M236 166 C244 146 258 150 258 172" stroke="#FFD9A0" strokeOpacity={0.9} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Path d="M268 300 C272 262 266 236 278 208 C286 194 296 198 296 216 C298 248 300 276 300 300 Z" fill="#33201A" />
      <Path d="M278 208 C286 194 296 198 296 216" stroke="#FFD9A0" strokeOpacity={0.8} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <Spark x={34} y={98} r={6} color="#FFF3D0" />
      <Spark x={248} y={146} r={5} color="#FFF3D0" />
      <Spark x={288} y={192} r={4} color="#DFFFF6" />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={5600} opacity={[0.2, 0.8]}>
        <Glow id="pil1" x={34} y={102} r={22} color="#FFF3D0" opacity={0.8} />
        <Glow id="pil2" x={248} y={150} r={18} color="#FFF3D0" opacity={0.8} />
      </Pulse>
      <Motes count={8} seed={442} box={[10, 120, 290, 250]} colors={['#FFE2B8', '#BFF6EA']} size={[1.4, 2.4]} period={9000} travel={30} sway={12} glow />
    </>
  ),
};

/** Eclipse Total — o disco preto, a coroa aberta e o pôr do sol em toda a volta do horizonte. */
const EclipseTotal: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#04050E'], [0.6, '#0E1430'], [0.8, '#5A3A5E'], [0.9, '#F08A5A']]} />
      <Stars seed={451} n={20} box={[0, 0, 300, 170]} />
      <Glow id={`c${uid}`} x={246} y={90} r={72} color={WH} opacity={0.55} />
      <G fill={WH} fillOpacity={0.2}>
        {[10, 60, 120, 170, 200, 250, 300, 340].map((d, i) => (
          <Polygon key={d} points={beam(246, 90, d, i % 2 ? 40 : 66, i % 2 ? 6 : 3)} />
        ))}
      </G>
      <Circle cx={246} cy={90} r={18} fill="#02030A" />
      <Circle cx={246} cy={90} r={18.6} stroke={WH} strokeOpacity={0.85} strokeWidth={0.9} fill="none" />
      <Path d="M260 78 q5 -5 3 -9 M232 100 q-6 2 -8 7" stroke="#FF5C7A" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Circle cx={196} cy={112} r={1.6} fill="#FFE2B8" />
      <Circle cx={282} cy={64} r={1.2} fill={WH} />
      <Path d="M0 300 V252 Q70 244 150 250 T300 246 V300 Z" fill="#0A0C1C" />
      <Path d="M36 252 V232 M30 240 Q36 226 42 240 M28 246 Q36 232 44 246" stroke="#0A0C1C" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={4800} opacity={[0.25, 0.8]}>
        <Glow id="ecl" x={246} y={90} r={50} color={WH} opacity={0.7} />
      </Pulse>
      <Rotate period={120000} cx={246} cy={90}>
        <G fill={WH} fillOpacity={0.16}>
          {[35, 95, 145, 225, 275, 320].map((d) => (
            <Polygon key={d} points={beam(246, 90, d, 58, 4)} />
          ))}
        </G>
      </Rotate>
    </>
  ),
};

/** Mar de Nuvens — o topo das nuvens de um gigante gasoso, camada atrás de camada. */
const MarDeNuvens: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#1A2A5A'], [0.45, '#C87A6A'], [0.8, '#FFD9A0']]} />
      <Stars seed={461} n={16} box={[0, 0, 300, 90]} />
      <Ball id={`m${uid}`} x={44} y={84} r={15} c1="#FFF3E0" c2="#C9A8A0" shade="#5A3A5E" />
      <Circle cx={262} cy={66} r={5} fill="#FFE7D0" fillOpacity={0.9} />
      <Path d={scallop(176, 64, 16, 20)} fill="#F0B89A" fillOpacity={0.7} />
      <Path d={scallop(198, 52, 14, 8)} fill="#E09A84" />
      <Path d={scallop(218, 70, 18, 40)} fill="#C87A72" />
      <Path d={scallop(238, 48, 13, 16)} fill="#9E5A68" />
      <Path d={scallop(256, 76, 16, 30)} fill="#6E3F5A" />
    </>
  ),
  Live: () => (
    <>
      <Drift period={24000} amp={16}>
        <Ellipse cx={70} cy={150} rx={40} ry={7} fill="#FFE7D0" fillOpacity={0.4} />
        <Ellipse cx={240} cy={128} rx={34} ry={6} fill="#FFE7D0" fillOpacity={0.35} />
      </Drift>
      <Drift period={17000} amp={10} phase={0.4}>
        <Ellipse cx={220} cy={170} rx={46} ry={6} fill={WH} fillOpacity={0.25} />
        <Ellipse cx={40} cy={186} rx={30} ry={5} fill={WH} fillOpacity={0.22} />
      </Drift>
      <Motes count={5} seed={462} box={[10, 170, 290, 250]} colors={['#FFF3E0']} size={[1.6, 2.4]} period={9400} travel={26} sway={20} />
    </>
  ),
};

/** Cidade em Anel — um mundo construído em arco: o chão sobe pelos lados e passa por cima do céu. */
const CidadeOrbital: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#030612'], [1, '#0A1430']]} />
      <Stars seed={471} n={36} box={[0, 0, 300, 300]} />
      <Glow id={`s${uid}`} x={150} y={150} r={150} color="#5F8BFF" opacity={0.12} />
      <G fill="none">
        <Path d="M2 300 A148 246 0 0 1 298 300" stroke="#16304E" strokeWidth={30} />
        <Path d="M2 300 A148 246 0 0 1 298 300" stroke="#2F7A6E" strokeWidth={20} strokeDasharray="34 12 56 20 18 30 44 16" />
        <Path d="M2 300 A148 246 0 0 1 298 300" stroke="#3D8BFF" strokeOpacity={0.6} strokeWidth={20} strokeDasharray="12 34 20 56 30 18 16 44" strokeDashoffset={-34} />
        <Path d="M2 300 A148 246 0 0 1 298 300" stroke="#FFE2A8" strokeWidth={1.6} strokeDasharray="1 6" />
        <Path d="M-14 300 A164 262 0 0 1 314 300" stroke="#7FB6FF" strokeOpacity={0.6} strokeWidth={1.2} />
        <Path d="M18 300 A132 230 0 0 1 282 300" stroke="#7FB6FF" strokeOpacity={0.35} strokeWidth={0.8} />
      </G>
      <Path d="M0 300 V258 H12 V248 H18 V258 H30 V244 H34 V258 H52 L70 262 H230 L248 258 H262 V246 H268 V258 H280 V250 H286 V258 H300 V300 Z" fill="#081022" />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={3600} opacity={[0.25, 1]}>
        <Path d="M2 300 A148 246 0 0 1 298 300" stroke="#FFF3C4" strokeWidth={1.8} strokeDasharray="1 13" fill="none" />
      </Pulse>
      <Twinkles count={8} seed={472} box={[60, 60, 240, 240]} colors={[WH]} />
    </>
  ),
};

// ————————————————————————————————————————————————————— épicos

/** Garganta do Túnel — um atalho pelo espaço: anéis que encolhem até uma saída de luz. */
const Tunel: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#03040E'], [1, '#0A0A24']]} />
      <G stroke="#9FB8FF" strokeOpacity={0.14} strokeWidth={0.8}>
        {Array.from({ length: 20 }, (_, i) => {
          const a = (i / 20) * TAU;
          return <Line key={i} x1={176} y1={132} x2={176 + 320 * Math.cos(a)} y2={132 + 320 * Math.sin(a)} />;
        })}
      </G>
      <G fill="none">
        {Array.from({ length: 9 }, (_, i) => {
          const k = i / 8;
          const r = 216 * Math.pow(1 - k, 1.5) + 10;
          return <Circle key={i} cx={150 + 26 * k} cy={150 - 18 * k} r={r} stroke={i % 2 ? '#B48CFF' : '#38D6B0'} strokeOpacity={0.25 + 0.6 * k} strokeWidth={2.4 - 1.4 * k} />;
        })}
      </G>
      <G stroke={WH} strokeLinecap="round" strokeOpacity={0.7} strokeWidth={1}>
        {[[20, 60, 34, 68], [280, 70, 262, 80], [30, 240, 48, 226], [276, 232, 260, 220], [14, 150, 30, 148], [290, 150, 274, 148]].map(([x1, y1, x2, y2], i) => (
          <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </G>
      <Glow id={`g${uid}`} x={176} y={132} r={60} color="#DFFFF6" opacity={0.8} />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={2800} opacity={[0.1, 0.7]}>
        <Circle cx={156} cy={146} r={150} stroke="#38D6B0" strokeWidth={3} fill="none" />
        <Circle cx={166} cy={139} r={84} stroke="#38D6B0" strokeWidth={2} fill="none" />
      </Pulse>
      <Pulse period={2800} phase={0.5} opacity={[0.1, 0.7]}>
        <Circle cx={152} cy={148} r={186} stroke="#B48CFF" strokeWidth={3} fill="none" />
        <Circle cx={160} cy={143} r={116} stroke="#B48CFF" strokeWidth={2} fill="none" />
      </Pulse>
      <Shoots count={7} seed={481} box={[10, 40, 110, 250]} angle={184} length={22} period={2600} colors={[WH, '#B6FFE9']} />
      <Shoots count={7} seed={482} box={[210, 40, 290, 250]} angle={-6} length={22} period={2600} colors={[WH, '#E3D0FF']} />
    </>
  ),
};

/** Resto de Supernova — a casca de uma estrela que explodiu, em filamentos de várias cores. */
const Remanescente: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#04040C'], [1, '#0A0818']]} />
      <Stars seed={491} n={46} box={[0, 0, 300, 300]} />
      <Blob id={`a${uid}`} x={150} y={150} rx={160} color="#FF5C7A" o={0.14} />
      <G fill="none" strokeLinejoin="round">
        {[
          [128, 9, 7, 0, '#FF5C7A'],
          [116, 7, 11, 0.7, '#7FE0FF'],
          [138, 6, 9, 1.4, '#FFD36B'],
          [106, 8, 5, 0.3, '#B48CFF'],
          [146, 5, 13, 0.2, '#FF8FD1'],
        ].map(([r, amp, w, ph, c], i) => (
          <G key={i}>
            <Path d={wavy(150, 150, r as number, amp as number, w as number, ph as number)} stroke={c as string} strokeOpacity={0.14} strokeWidth={7} />
            <Path d={wavy(150, 150, r as number, amp as number, w as number, ph as number)} stroke={c as string} strokeOpacity={0.8} strokeWidth={1.1} />
          </G>
        ))}
      </G>
      <G fill={WH}>
        {[20, 75, 130, 200, 250, 310].map((d) => (
          <Circle key={d} cx={150 + 132 * Math.cos((d * Math.PI) / 180)} cy={150 + 132 * Math.sin((d * Math.PI) / 180)} r={1.8} />
        ))}
      </G>
    </>
  ),
  Live: () => (
    <>
      <Pulse period={5200} opacity={[0.1, 0.8]}>
        <Path d={wavy(150, 150, 128, 9, 7, 0)} stroke="#FFB0C0" strokeWidth={2.4} fill="none" />
        <Path d={wavy(150, 150, 138, 6, 9, 1.4)} stroke="#FFE9B0" strokeWidth={2} fill="none" />
      </Pulse>
      <Pulse period={5200} phase={0.5} opacity={[0.1, 0.8]}>
        <Path d={wavy(150, 150, 116, 7, 11, 0.7)} stroke="#C8F2FF" strokeWidth={2.2} fill="none" />
        <Path d={wavy(150, 150, 146, 5, 13, 0.2)} stroke="#FFC8E8" strokeWidth={2} fill="none" />
      </Pulse>
      <Twinkles count={12} seed={492} box={[6, 40, 294, 260]} colors={[WH, '#FFD0D8', '#C8F2FF']} />
    </>
  ),
};

/** Quadro-Negro Cósmico — as constelações deste céu são figuras: Pitágoras, uma parábola, um hexágono, a soma. */
const QuadroCosmico: SceneFx = {
  Art: ({ uid }) => {
    const parab = Array.from({ length: 7 }, (_, i) => {
      const x = 226 + i * 10;
      return [x, 60 + 0.045 * (x - 256) * (x - 256)] as const;
    });
    const hex = Array.from({ length: 6 }, (_, i) => [42 + 26 * Math.cos((i * Math.PI) / 3), 206 + 26 * Math.sin((i * Math.PI) / 3)] as const);
    const sigma = [[286, 190], [250, 190], [270, 212], [250, 234], [286, 234]] as const;
    const tri = [[18, 110], [18, 62], [82, 110]] as const;
    const dots = [...parab, ...hex, ...sigma, ...tri, [42, 206] as const];
    return (
      <>
        <Sky id={`sk${uid}`} stops={[[0, '#06101E'], [1, '#0C2030']]} />
        <G stroke="#7FE0D0" strokeOpacity={0.07} strokeWidth={0.6}>
          {Array.from({ length: 9 }, (_, i) => (
            <G key={i}>
              <Line x1={30 + i * 30} y1={0} x2={30 + i * 30} y2={300} />
              <Line x1={0} y1={30 + i * 30} x2={300} y2={30 + i * 30} />
            </G>
          ))}
        </G>
        <Stars seed={501} n={30} box={[0, 0, 300, 300]} max={1} />
        <G stroke="#DFF6F0" strokeOpacity={0.55} strokeWidth={0.8} fill="none" strokeLinejoin="round">
          <Polygon points={tri.map((p) => p.join(',')).join(' ')} />
          <Path d="M18 102 H26 V110" />
          <Polyline points={parab.map((p) => `${p[0]},${p[1].toFixed(1)}`).join(' ')} />
          <Path d="M220 104 H292 M256 52 V108" strokeOpacity={0.3} strokeDasharray="2 3" />
          <Polygon points={hex.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} />
          <Path d={`M42 206 L${hex[0][0].toFixed(1)} ${hex[0][1].toFixed(1)}`} strokeDasharray="2 3" />
          <Circle cx={42} cy={206} r={26} strokeOpacity={0.25} />
          <Polyline points={sigma.map((p) => p.join(',')).join(' ')} />
        </G>
        <G fill={WH}>
          {dots.map((p, i) => (
            <Circle key={i} cx={p[0]} cy={p[1]} r={1.7} />
          ))}
        </G>
        <Spark x={82} y={110} r={5} color="#DFF6F0" />
        <Spark x={256} y={60} r={5} color="#FFE7B0" />
        <Spark x={250} y={190} r={4} color="#DFF6F0" />
      </>
    );
  },
  Live: () => (
    <>
      <Twinkles count={8} seed={502} box={[10, 54, 90, 236]} colors={[WH, '#B6FFE9']} />
      <Twinkles count={8} seed={503} box={[220, 54, 292, 240]} colors={[WH, '#FFE7B0']} />
      <Motes count={6} seed={504} box={[10, 60, 290, 200]} colors={['#DFF6F0']} size={[1.2, 2]} period={10000} mode="fall" travel={40} sway={8} />
    </>
  ),
};

/** Berçário Estelar — gás de todas as cores, glóbulos escuros e estrelas recém-acesas. */
const BercoEstelar: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#0A0618'], [0.5, '#241040'], [1, '#3E1A3A']]} />
      <Blob id={`a${uid}`} x={56} y={84} rx={110} ry={80} color="#FF8A5C" o={0.5} />
      <Blob id={`b${uid}`} x={250} y={104} rx={100} ry={110} color="#5FD4FF" o={0.4} />
      <Blob id={`c${uid}`} x={70} y={230} rx={120} ry={80} color="#B06CFF" o={0.5} />
      <Blob id={`d${uid}`} x={246} y={236} rx={90} ry={70} color="#FF6FA8" o={0.45} />
      <G fill="#08040F" fillOpacity={0.85}>
        <Ellipse cx={30} cy={160} rx={14} ry={9} transform="rotate(-20 30 160)" />
        <Ellipse cx={274} cy={176} rx={11} ry={16} transform="rotate(14 274 176)" />
        <Ellipse cx={96} cy={248} rx={9} ry={6} />
      </G>
      <Stars seed={511} n={30} box={[0, 0, 300, 300]} />
      <Line x1={236} y1={56} x2={276} y2={96} stroke="#BFF2FF" strokeOpacity={0.6} strokeWidth={1.2} strokeLinecap="round" />
      {[[44, 76, 8, '#FFF0D8'], [256, 76, 7, '#DFF6FF'], [60, 216, 7, '#F0E0FF'], [236, 226, 6, '#FFE0EC'], [20, 120, 4, WH]].map(([x, y, r, c], i) => (
        <G key={i}>
          <Circle cx={x as number} cy={y as number} r={(r as number) * 1.6} fill={c as string} fillOpacity={0.2} />
          <Spark x={x as number} y={y as number} r={r as number} color={c as string} />
        </G>
      ))}
    </>
  ),
  Live: () => (
    <>
      <Pulse period={4400} opacity={[0.15, 0.85]}>
        <Glow id="bel1" x={44} y={76} r={22} color="#FFF0D8" opacity={0.8} />
        <Glow id="bel2" x={236} y={226} r={18} color="#FFE0EC" opacity={0.8} />
      </Pulse>
      <Pulse period={4400} phase={0.5} opacity={[0.15, 0.85]}>
        <Glow id="bel3" x={256} y={76} r={20} color="#DFF6FF" opacity={0.8} />
        <Glow id="bel4" x={60} y={216} r={20} color="#F0E0FF" opacity={0.8} />
      </Pulse>
      <Drift period={30000} amp={10}>
        <Blob id="bel5" x={150} y={60} rx={80} ry={24} color="#FFD0E8" o={0.18} />
      </Drift>
      <Motes count={8} seed={512} box={[10, 60, 290, 250]} colors={[WH, '#FFE0EC', '#DFF6FF']} size={[1.4, 2.4]} period={9000} travel={30} sway={14} glow />
    </>
  ),
};

// ————————————————————————————————————————————————————— lendários

/** À Beira do Horizonte — um buraco negro de verdade: o disco, a sombra e a luz de trás dobrada por cima. */
const HorizonteEventos: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#020208'], [1, '#080612']]} />
      <Stars seed={521} n={50} box={[0, 0, 300, 300]} />
      <Defs>
        <LinearGradient id={`hd${uid}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FF7A3C" stopOpacity={0} />
          <Stop offset="0.25" stopColor="#FFB86B" stopOpacity={0.9} />
          <Stop offset="0.5" stopColor="#FFF3D0" stopOpacity={1} />
          <Stop offset="0.75" stopColor="#FF9A4C" stopOpacity={0.8} />
          <Stop offset="1" stopColor="#C2410C" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <G transform="rotate(-10 150 150)">
        <Blob id={`a${uid}`} x={150} y={150} rx={190} ry={60} color="#FF8A3C" o={0.3} />
        {/* a parte de trás do disco, dobrada por cima e por baixo da sombra */}
        <Circle cx={150} cy={150} r={116} stroke="#FFB86B" strokeOpacity={0.5} strokeWidth={10} fill="none" />
        <Circle cx={150} cy={150} r={108} stroke="#FFF3D0" strokeOpacity={0.85} strokeWidth={2} fill="none" />
        <Circle cx={150} cy={150} r={104} fill="#000000" />
        {/* o disco passando na frente */}
        <Ellipse cx={150} cy={150} rx={176} ry={15} fill={`url(#hd${uid})`} />
        <Ellipse cx={150} cy={148} rx={150} ry={5} fill="#FFF8E8" fillOpacity={0.7} />
        <Path d="M-30 150 H24 M276 150 H330" stroke="#FFD9A0" strokeOpacity={0.5} strokeWidth={1} />
      </G>
      <G stroke="#FFD9A0" strokeOpacity={0.4} strokeWidth={0.8} fill="none">
        <Path d="M10 70 Q40 60 60 44" />
        <Path d="M290 230 Q262 242 240 258" />
        <Path d="M14 240 Q30 250 40 262" />
      </G>
    </>
  ),
  Live: () => (
    <>
      <Pulse period={3800} opacity={[0.2, 0.85]}>
        <Circle cx={150} cy={150} r={110} stroke="#FFF8E8" strokeWidth={3} fill="none" />
      </Pulse>
      <Rotate period={46000} cx={150} cy={150}>
        <G fill="none" stroke="#FFB86B" strokeOpacity={0.5} strokeLinecap="round">
          <Path d={arm(150, 150, 112, 140, 0.4, 0)} strokeWidth={2} />
          <Path d={arm(150, 150, 112, 140, 0.4, Math.PI)} strokeWidth={2} />
          <Path d={arm(150, 150, 118, 148, 0.3, Math.PI / 2)} strokeWidth={1.2} />
          <Path d={arm(150, 150, 118, 148, 0.3, -Math.PI / 2)} strokeWidth={1.2} />
        </G>
      </Rotate>
      <Shoots count={6} seed={522} box={[6, 120, 70, 160]} angle={-10} length={26} period={3400} colors={['#FFF3D0', '#FFB86B']} />
      <Shoots count={6} seed={523} box={[230, 124, 294, 164]} angle={170} length={26} period={3400} colors={['#FFF3D0', '#FFB86B']} />
      <Twinkles count={10} seed={524} box={[6, 40, 294, 260]} colors={[WH, '#FFE2B8']} />
    </>
  ),
};

/** Primeira Luz — o universo jovem: manchas do fundo cósmico, a teia de filamentos e as primeiras estrelas. */
const PrimeiraLuz: SceneFx = {
  Art: ({ uid }) => {
    const r = rng(531);
    const nodes = Array.from({ length: 24 }, () => ({ x: 10 + r() * 280, y: 30 + r() * 240 }));
    const links: [number, number][] = [];
    nodes.forEach((a, i) => {
      // Cada nó se liga aos dois vizinhos mais próximos: é assim que a teia cósmica se arma.
      const near = nodes
        .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2);
      for (const n of near) if (!links.some(([p, q]) => (p === i && q === n.j) || (p === n.j && q === i))) links.push([i, n.j]);
    });
    const spots = Array.from({ length: 22 }, () => ({ x: r() * 300, y: r() * 300, s: 22 + r() * 34, warm: r() > 0.5 }));
    return (
      <>
        <Sky id={`sk${uid}`} stops={[[0, '#0A0616'], [0.5, '#16102E'], [1, '#0C1830']]} />
        <Defs>
          <RadialGradient id={`w${uid}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FF9A5C" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#FF9A5C" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`c${uid}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#5F8BFF" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#5F8BFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {spots.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={p.s} fill={`url(#${p.warm ? 'w' : 'c'}${uid})`} />
        ))}
        <G stroke="#B48CFF" strokeLinecap="round">
          {links.map(([a, b], i) => (
            <G key={i}>
              <Line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} strokeOpacity={0.14} strokeWidth={5} />
              <Line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} strokeOpacity={0.6} strokeWidth={0.7} />
            </G>
          ))}
        </G>
        {nodes.map((n, i) => (
          <G key={i}>
            <Circle cx={n.x} cy={n.y} r={5} fill="#FFE7B0" fillOpacity={0.3} />
            <Circle cx={n.x} cy={n.y} r={1.6} fill={WH} />
          </G>
        ))}
        <Spark x={nodes[0].x} y={nodes[0].y} r={7} color="#FFF3D0" />
        <Spark x={nodes[5].x} y={nodes[5].y} r={6} color="#DFF6FF" />
        <Spark x={nodes[11].x} y={nodes[11].y} r={6} color="#FFE0EC" />
      </>
    );
  },
  Live: () => (
    <>
      <Pulse period={6000} opacity={[0.1, 0.6]}>
        <Blob id="pll1" x={60} y={90} rx={90} ry={70} color="#FFB86B" o={0.4} />
        <Blob id="pll2" x={240} y={220} rx={90} ry={70} color="#B48CFF" o={0.4} />
      </Pulse>
      <Pulse period={6000} phase={0.5} opacity={[0.1, 0.6]}>
        <Blob id="pll3" x={240} y={80} rx={90} ry={70} color="#5FD4FF" o={0.36} />
        <Blob id="pll4" x={60} y={230} rx={90} ry={70} color="#FF8FD1" o={0.36} />
      </Pulse>
      <Twinkles count={20} seed={532} box={[6, 40, 294, 260]} colors={[WH, '#FFF3D0', '#DFF6FF']} size={[2, 3.6]} period={3000} />
      <Motes count={8} seed={533} box={[10, 60, 290, 250]} colors={['#FFF3D0', '#E3D0FF']} size={[1.4, 2.4]} period={8000} travel={34} sway={16} glow />
    </>
  ),
};

/** Aurora de Outro Mundo — cortinas verdes e roxas sobre a curva de um planeta, vistas de cima. */
const AuroraPlanetaria: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#02040C'], [0.7, '#061224'], [1, '#0A2030']]} />
      <Stars seed={541} n={40} box={[0, 0, 300, 190]} />
      <Circle cx={150} cy={560} r={336} fill="#38D6B0" fillOpacity={0.16} />
      <Circle cx={150} cy={560} r={326} fill="#04121C" />
      <Defs>
        <LinearGradient id={`au${uid}`} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#38D6B0" stopOpacity={0.85} />
          <Stop offset="0.6" stopColor="#7A5CFF" stopOpacity={0.4} />
          <Stop offset="1" stopColor="#FF6FB5" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d="M-10 262 Q40 236 90 240 T190 232 T310 244 V180 Q250 150 190 168 T90 176 T-10 190 Z" fill={`url(#au${uid})`} />
      <Path d="M-10 262 Q40 236 90 240 T190 232 T310 244" stroke="#B6FFE9" strokeWidth={1.4} fill="none" />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={5200} opacity={[0.1, 0.45]}>
        <Path d="M20 244 V190 M60 240 V176 M110 238 V182 M160 234 V170 M210 234 V166 M260 240 V176" stroke="#B6FFE9" strokeWidth={2.6} strokeLinecap="round" />
      </Pulse>
      <Pulse period={5200} phase={0.5} opacity={[0.1, 0.45]}>
        <Path d="M40 242 V184 M86 240 V180 M136 236 V174 M186 232 V168 M236 238 V170 M284 242 V182" stroke="#C9B8FF" strokeWidth={2.6} strokeLinecap="round" />
      </Pulse>
      <Twinkles count={10} seed={542} box={[6, 40, 294, 160]} colors={[WH, '#B6FFE9']} />
    </>
  ),
};

/** Dois Sóis em Dança — uma estrela puxando o gás da outra, e a ponte de fogo entre as duas. */
const DancaBinaria: SceneFx = {
  Art: ({ uid }) => (
    <>
      <Sky id={`sk${uid}`} stops={[[0, '#06040E'], [1, '#140A1E']]} />
      <Stars seed={551} n={44} box={[0, 0, 300, 300]} />
      <Glow id={`a${uid}`} x={40} y={150} r={90} color="#FF8A3C" opacity={0.5} />
      <Ball id={`b${uid}`} x={36} y={150} r={40} c1="#FFE7B0" c2="#FF8A3C" shade="#8A2A0C" />
      <Path d="M70 132 Q160 96 250 140 Q160 126 72 168 Z" fill="#FFB86B" fillOpacity={0.4} />
      <Path d="M72 150 Q160 108 252 144" stroke="#FFF3D0" strokeOpacity={0.7} strokeWidth={1.4} fill="none" />
      <Glow id={`c${uid}`} x={262} y={146} r={46} color="#7FE0FF" opacity={0.6} />
      <Ellipse cx={262} cy={146} rx={34} ry={8} stroke="#BFF2FF" strokeOpacity={0.7} strokeWidth={1.6} fill="none" transform="rotate(-14 262 146)" />
      <Circle cx={262} cy={146} r={7} fill={WH} />
    </>
  ),
  Live: () => (
    <>
      <Pulse period={3000} opacity={[0.2, 0.9]}>
        <Glow id="dbl1" x={262} y={146} r={26} color={WH} opacity={0.8} />
      </Pulse>
      <Pulse period={5000} opacity={[0.2, 0.7]}>
        <Glow id="dbl2" x={36} y={150} r={64} color="#FFE7B0" opacity={0.5} />
      </Pulse>
      <Shoots count={8} seed={552} box={[70, 120, 130, 160]} angle={-4} length={24} period={3600} colors={['#FFF3D0', '#FFB86B']} />
      <Twinkles count={10} seed={553} box={[6, 40, 294, 260]} colors={[WH]} />
    </>
  ),
};

export const SKIES: Record<string, SceneFx> = {
  'campo-estelar': CampoEstelar,
  'crepusculo-orbital': CrepusculoOrbital,
  'solo-lunar': SoloLunar,
  'nevoa-violeta': NevoaVioleta,
  'chuva-meteoros': ChuvaMeteoros,
  'poente-duplo': PoenteDuplo,
  'via-lactea': ViaLactea,
  'sob-aneis': SobAneis,
  'nebulosa-emissao': NebulosaEmissao,
  'gigante-proximo': GiganteProximo,
  'estacao-janela': EstacaoJanela,
  'cometa-ceu': CometaCeu,
  'aurora-planetaria': AuroraPlanetaria,
  'galaxia-espiral': GalaxiaEspiral,
  aglomerado: Aglomerado,
  pilares: Pilares,
  'eclipse-total': EclipseTotal,
  'mar-de-nuvens': MarDeNuvens,
  'cidade-orbital': CidadeOrbital,
  'danca-binaria': DancaBinaria,
  tunel: Tunel,
  remanescente: Remanescente,
  'quadro-cosmico': QuadroCosmico,
  'berco-estelar': BercoEstelar,
  'horizonte-eventos': HorizonteEventos,
  'primeira-luz': PrimeiraLuz,
};
