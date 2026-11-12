/**
 * Satélites (espaço `orbiter`): corpos, máquinas e criaturas que giram em torno do Áster.
 * Cada um é um desenho pequeno numa órbita elíptica; passa por trás do corpo (menor e apagado) e
 * volta pela frente (maior). O desenho fica de pé: quem "deita" é a órbita, não o satélite.
 *
 * A caixa do desenho vai de 0 a `box`; o centro é box/2.
 */
import type { ReactNode } from 'react';
import { Circle, Ellipse, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { Particles } from './engine';
import { Orbiter, type OrbiterProps } from './space';

export interface DepthProps {
  v: ItemVisual;
  half: 'back' | 'front';
  r: number;
  tier: number;
}
export type DepthRender = (p: DepthProps) => ReactNode;

const W = '#FFFFFF';
const INK = '#0B1020';
const PLANE = -18;
const SQ = 0.34;

type Orbit = Omit<OrbiterProps, 'half' | 'children'>;
/** Um satélite na órbita padrão (o que não for dito, vale o plano dos anéis). */
function Sat({ p, o, children }: { p: DepthProps; o: Orbit; children: ReactNode }) {
  return (
    <Orbiter half={p.half} plane={PLANE} squash={SQ} depth={[0.9, 1.45]} {...o}>
      {children}
    </Orbiter>
  );
}

/** Esfera pequena com sombra e brilho (luas, planetinhas). */
function Ball({ c, r, color, dark = INK, craters = false }: { c: number; r: number; color: string; dark?: string; craters?: boolean }) {
  return (
    <G>
      <Circle cx={c} cy={c} r={r * 1.5} fill={color} fillOpacity={0.14} />
      <Circle cx={c} cy={c} r={r} fill={color} />
      <Circle cx={c + r * 0.3} cy={c + r * 0.3} r={r * 0.86} fill={dark} fillOpacity={0.42} />
      {craters ? (
        <>
          <Circle cx={c - r * 0.3} cy={c - r * 0.1} r={r * 0.22} fill={dark} fillOpacity={0.3} />
          <Circle cx={c + r * 0.1} cy={c - r * 0.45} r={r * 0.14} fill={dark} fillOpacity={0.3} />
          <Circle cx={c - r * 0.05} cy={c + r * 0.4} r={r * 0.17} fill={dark} fillOpacity={0.25} />
        </>
      ) : null}
      <Circle cx={c - r * 0.36} cy={c - r * 0.4} r={r * 0.26} fill={W} fillOpacity={0.85} />
    </G>
  );
}

const dust = (p: DepthProps, o: { count: number; r: number; period: number; colors: string[]; size?: [number, number]; trail?: number; plane?: number; squash?: number; seed?: number; phase?: number; reverse?: boolean; sparkle?: boolean; glow?: boolean }) => (
  <Particles mode="orbit" half={p.half} count={o.count} period={o.period} colors={o.colors} size={o.size ?? [1.4, 2.4]} radius={[o.r, o.r]} tilt={o.squash ?? SQ} plane={o.plane ?? PLANE} trail={o.trail} seed={o.seed ?? 3} phaseShift={o.phase} reverse={o.reverse} sparkle={o.sparkle} glow={o.glow} />
);

// ————————————————————————————————————————————————————— comuns

/** Lua Companheira — uma lua só, cheia de crateras, sempre por perto. */
const Lua: DepthRender = (p) => (
  <Sat p={p} o={{ r: 76, period: 16000, box: 18 }}>
    <Ball c={9} r={5.6} color={p.v.color} craters />
  </Sat>
);

/** Luas Gêmeas — duas, sempre em lados opostos. */
const LuasGemeas: DepthRender = (p) => (
  <>
    {[0, 0.5].map((ph, i) => (
      <Sat key={ph} p={p} o={{ r: 80, period: 19000, phase: ph, box: 14 }}>
        <Ball c={7} r={4.2} color={i ? p.v.color2 ?? p.v.color : p.v.color} craters />
      </Sat>
    ))}
  </>
);

/** Sonda — uma caixinha com antena e prato, olhando para a frente. */
const Sonda: DepthRender = (p) => (
  <Sat p={p} o={{ r: 82, period: 13000, box: 20, face: true }}>
    <Rect x={7} y={7.5} width={7} height={5} rx={1} fill={p.v.color} stroke={W} strokeWidth={0.6} />
    <Path d="M14 6 Q18.5 10 14 14 Z" fill={p.v.color2 ?? W} />
    <Line x1={7} y1={10} x2={2.5} y2={10} stroke={W} strokeWidth={0.8} />
    <Circle cx={2.5} cy={10} r={1} fill="#FF6A55" />
    <Line x1={10} y1={7.5} x2={10} y2={4} stroke={W} strokeWidth={0.6} />
  </Sat>
);

/** Asteroide Capturado — uma rocha irregular, dando cambalhotas. */
const Asteroide: DepthRender = (p) => (
  <Sat p={p} o={{ r: 78, period: 15000, box: 18, roll: 3 }}>
    <Polygon points="9,2 14,4.5 16,10 13,15.5 7,16 3,12 2.5,6" fill={p.v.color} stroke={INK} strokeOpacity={0.5} strokeWidth={0.8} strokeLinejoin="round" />
    <Polygon points="9,2 14,4.5 11,8 6,6" fill={W} fillOpacity={0.28} />
    <Circle cx={10.5} cy={11.5} r={1.7} fill={INK} fillOpacity={0.4} />
    <Circle cx={6.5} cy={9.5} r={1} fill={INK} fillOpacity={0.4} />
  </Sat>
);

/** Lanterna de Papel — sobe devagar, acesa por dentro. */
const Lanterna: DepthRender = (p) => (
  <Sat p={p} o={{ r: 80, period: 21000, box: 20, squash: 0.44 }}>
    <Circle cx={10} cy={10} r={9} fill={p.v.color} fillOpacity={0.16} />
    <Path d="M6 5 L14 5 L15.5 13 Q10 16.5 4.5 13 Z" fill={p.v.color} stroke={p.v.color2 ?? W} strokeWidth={0.7} strokeLinejoin="round" />
    <Ellipse cx={10} cy={10} rx={2.6} ry={3.4} fill={W} fillOpacity={0.75} />
    <Line x1={6} y1={5} x2={14} y2={5} stroke={INK} strokeWidth={1} />
  </Sat>
);

/** Cubo Mensageiro — um cubo de arestas acesas, girando sobre si. */
const Cubo: DepthRender = (p) => (
  <Sat p={p} o={{ r: 78, period: 14000, box: 18, roll: 1 }}>
    <Polygon points="9,2 15.5,5.5 15.5,12.5 9,16 2.5,12.5 2.5,5.5" fill={p.v.color} fillOpacity={0.22} stroke={p.v.color} strokeWidth={1} strokeLinejoin="round" />
    <Path d="M9 9 L9 16 M9 9 L2.5 5.5 M9 9 L15.5 5.5" stroke={W} strokeOpacity={0.9} strokeWidth={0.8} />
    <Circle cx={9} cy={9} r={1.3} fill={W} />
  </Sat>
);

/** Pipa Estelar — um losango com rabiola, voando de frente para o vento. */
const Pipa: DepthRender = (p) => (
  <Sat p={p} o={{ r: 84, period: 17000, box: 26, face: true }}>
    <Path d="M11 13 Q7 11 5 14 Q3 16 1 13.5" stroke={p.v.color2 ?? W} strokeWidth={0.9} fill="none" strokeLinecap="round" />
    <Polygon points="18,6 25,13 18,20 11,13" fill={p.v.color} stroke={W} strokeWidth={0.7} strokeLinejoin="round" />
    <Path d="M18 6 L18 20 M11 13 L25 13" stroke={W} strokeOpacity={0.7} strokeWidth={0.6} />
    <Polygon points="18,6 25,13 18,13" fill={W} fillOpacity={0.3} />
  </Sat>
);

/** Semente ao Vento — um tufo leve, levado para onde for. */
const Semente: DepthRender = (p) => (
  <>
    {[0, 0.37, 0.71].map((ph, i) => (
      <Sat key={ph} p={p} o={{ r: 70 + i * 11, period: 18000 + i * 4000, phase: ph, box: 16, squash: 0.4, plane: PLANE + i * 14 }}>
        <G stroke={p.v.color} strokeWidth={0.7} strokeLinecap="round">
          {[-60, -30, 0, 30, 60].map((d) => (
            <Line key={d} x1={8} y1={9} x2={8 + Math.sin((d * Math.PI) / 180) * 6} y2={9 - Math.cos((d * Math.PI) / 180) * 6} />
          ))}
        </G>
        <Line x1={8} y1={9} x2={8} y2={14} stroke={p.v.color2 ?? W} strokeWidth={0.8} />
        <Ellipse cx={8} cy={14.2} rx={1} ry={1.6} fill={p.v.color2 ?? W} />
      </Sat>
    ))}
  </>
);

// ————————————————————————————————————————————————————— incomuns

/** Cometa de Bolso — pequeno, apressado, com a cauda sempre para trás. */
const CometaOrb: DepthRender = (p) => (
  <>
    {dust(p, { count: 1, r: 86, period: 9000, colors: [p.v.color], size: [3, 3], trail: 7 })}
    <Sat p={p} o={{ r: 86, period: 9000, box: 26, face: true, phase: 0.012 }}>
      <Polygon points="20,13 2,9.5 6,13 2,16.5" fill={p.v.color} fillOpacity={0.4} />
      <Polygon points="20,13 8,11.5 8,14.5" fill={W} fillOpacity={0.7} />
      <Circle cx={20} cy={13} r={4.6} fill={p.v.color} fillOpacity={0.4} />
      <Circle cx={20} cy={13} r={2.6} fill={W} />
    </Sat>
  </>
);

/** Satélite de Painéis — corpo dourado e dois painéis azuis, girando devagar. */
const Satelite: DepthRender = (p) => (
  <Sat p={p} o={{ r: 82, period: 15000, box: 26, roll: 0.5 }}>
    <Rect x={1.5} y={10} width={8} height={6} fill={p.v.color2 ?? '#5C8DFF'} stroke={W} strokeWidth={0.5} />
    <Rect x={16.5} y={10} width={8} height={6} fill={p.v.color2 ?? '#5C8DFF'} stroke={W} strokeWidth={0.5} />
    <Path d="M5.5 10 V16 M20.5 10 V16" stroke={W} strokeOpacity={0.7} strokeWidth={0.5} />
    <Rect x={10} y={9} width={6} height={8} rx={1.2} fill={p.v.color} stroke={W} strokeWidth={0.6} />
    <Line x1={13} y1={9} x2={13} y2={5} stroke={W} strokeWidth={0.6} />
    <Circle cx={13} cy={4.6} r={1.1} fill="#FF6A55" />
  </Sat>
);

/** Três Luas — três tamanhos, três planos: nunca se alinham. */
const Trio: DepthRender = (p) => (
  <>
    <Sat p={p} o={{ r: 68, period: 11000, box: 12, plane: -44, squash: 0.42 }}>
      <Ball c={6} r={3.4} color={p.v.color} />
    </Sat>
    <Sat p={p} o={{ r: 82, period: 17000, phase: 0.4, box: 18 }}>
      <Ball c={9} r={5.4} color={p.v.color2 ?? p.v.color} craters />
    </Sat>
    <Sat p={p} o={{ r: 95, period: 26000, phase: 0.75, box: 14, plane: 14, squash: 0.24, reverse: true }}>
      <Ball c={7} r={4.2} color="#DCE3FF" craters />
    </Sat>
  </>
);

/** Garça de Papel — uma dobradura que aprendeu a voar. */
const Origami: DepthRender = (p) => (
  <Sat p={p} o={{ r: 84, period: 15000, box: 28, face: true, squash: 0.4 }}>
    <Polygon points="26,13 16,11 12,3 13,13" fill={p.v.color} stroke={W} strokeWidth={0.5} strokeLinejoin="round" />
    <Polygon points="16,11 13,13 9,24 18,15" fill={p.v.color2 ?? p.v.color} stroke={W} strokeWidth={0.5} strokeLinejoin="round" />
    <Polygon points="13,13 2,11 9,15" fill={p.v.color} fillOpacity={0.8} stroke={W} strokeWidth={0.5} strokeLinejoin="round" />
    <Polygon points="26,13 16,11 18,15" fill={W} fillOpacity={0.5} />
  </Sat>
);

/** Bússola Errante — a agulha gira sem parar: aqui, todo lado é norte. */
const Bussola: DepthRender = (p) => (
  <Sat p={p} o={{ r: 80, period: 18000, box: 22, roll: 6 }}>
    <Circle cx={11} cy={11} r={9} fill="#141B36" stroke={p.v.color} strokeWidth={1.4} />
    <Circle cx={11} cy={11} r={6.6} stroke={p.v.color} strokeOpacity={0.5} strokeWidth={0.5} fill="none" />
    <Polygon points="11,3.5 13,11 11,12.5 9,11" fill="#FF6A55" />
    <Polygon points="11,18.5 13,11 11,9.5 9,11" fill={p.v.color2 ?? W} />
    <Circle cx={11} cy={11} r={1.2} fill={W} />
  </Sat>
);

/** Dado Orbital — rola sem nunca parar numa face. */
const DadoOrb: DepthRender = (p) => (
  <Sat p={p} o={{ r: 78, period: 13000, box: 20, roll: 4 }}>
    <Rect x={3} y={3} width={14} height={14} rx={3} fill={p.v.color} stroke={W} strokeWidth={0.8} />
    {[
      [6.5, 6.5],
      [13.5, 6.5],
      [10, 10],
      [6.5, 13.5],
      [13.5, 13.5],
    ].map(([x, y]) => (
      <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} fill={INK} />
    ))}
  </Sat>
);

/** Chave Antiga — de alguma porta que ainda não foi encontrada. */
const Chave: DepthRender = (p) => (
  <Sat p={p} o={{ r: 82, period: 16000, box: 24, roll: 1 }}>
    <Circle cx={7} cy={12} r={4.6} stroke={p.v.color} strokeWidth={2} fill="none" />
    <Path d="M11.5 12 H22 M18 12 V16 M21.5 12 V15" stroke={p.v.color} strokeWidth={2} strokeLinecap="round" fill="none" />
    <Circle cx={7} cy={12} r={1.4} fill={p.v.color2 ?? W} />
    <Path d="M4.5 9 Q7 7 9.5 9" stroke={W} strokeOpacity={0.8} strokeWidth={0.7} fill="none" />
  </Sat>
);

/** Balão Explorador — um cesto, um envelope listrado e nenhuma pressa. */
const Balao: DepthRender = (p) => (
  <Sat p={p} o={{ r: 84, period: 24000, box: 24, squash: 0.44 }}>
    <Path d="M12 2 C19.5 2 20.5 11 14 16 H10 C3.5 11 4.5 2 12 2 Z" fill={p.v.color} stroke={W} strokeWidth={0.6} />
    <Path d="M12 2 C9 6 9 12 10.6 16 M12 2 C15 6 15 12 13.4 16" stroke={p.v.color2 ?? W} strokeWidth={1.6} fill="none" />
    <Path d="M10 16 L10.8 19.5 M14 16 L13.2 19.5" stroke={W} strokeWidth={0.5} />
    <Rect x={10.2} y={19.5} width={3.6} height={2.8} rx={0.6} fill="#C98A5B" />
    <Ellipse cx={8.6} cy={6.5} rx={1.6} ry={2.6} fill={W} fillOpacity={0.4} />
  </Sat>
);

// ————————————————————————————————————————————————————— raros

/** Estação Orbital — uma roda com raios, girando para fazer gravidade. */
const EstacaoOrb: DepthRender = (p) => (
  <>
    <Sat p={p} o={{ r: 84, period: 22000, box: 34, roll: 5 }}>
      <Circle cx={17} cy={17} r={13} stroke={p.v.color} strokeWidth={3} fill="none" />
      <Circle cx={17} cy={17} r={13} stroke={W} strokeOpacity={0.8} strokeWidth={0.6} fill="none" strokeDasharray="2 4.8" />
      <Path d="M17 4 V30 M4 17 H30 M7.8 7.8 L26.2 26.2 M26.2 7.8 L7.8 26.2" stroke={p.v.color} strokeWidth={1} />
      <Circle cx={17} cy={17} r={4} fill="#141B36" stroke={p.v.color2 ?? W} strokeWidth={1.2} />
      <Circle cx={17} cy={17} r={1.4} fill={p.v.color2 ?? W} />
    </Sat>
    {dust(p, { count: 2, r: 84, period: 22000, colors: [W, p.v.color2 ?? W], size: [1.6, 2], phase: 0.06, seed: 9 })}
  </>
);

function Koi({ color, color2 }: { color: string; color2: string }) {
  return (
    <G>
      <Path d="M27 14 C22 8 12 8 7 14 C12 20 22 20 27 14 Z" fill={color} stroke={W} strokeWidth={0.5} />
      <Path d="M7 14 L1 9 Q3.5 14 1 19 Z" fill={color2} stroke={W} strokeWidth={0.5} strokeLinejoin="round" />
      <Path d="M16 9.5 Q18 5 21 7.5 M16 18.5 Q18 23 21 20.5" stroke={color2} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <Ellipse cx={15} cy={13} rx={4} ry={2.4} fill={color2} fillOpacity={0.8} />
      <Circle cx={23.4} cy={13} r={0.9} fill={INK} />
    </G>
  );
}

/** Carpas de Luz — duas, perseguindo a cauda uma da outra. */
const Peixes: DepthRender = (p) => (
  <>
    {[0, 0.5].map((ph, i) => (
      <Sat key={ph} p={p} o={{ r: 82, period: 12000, phase: ph, box: 28, face: true, squash: 0.4 }}>
        <Koi color={i ? p.v.color2 ?? W : p.v.color} color2={i ? p.v.color : p.v.color2 ?? W} />
      </Sat>
    ))}
    {dust(p, { count: 2, r: 82, period: 12000, colors: [W], size: [1.4, 1.8], trail: 5, squash: 0.4, phase: -0.035 })}
  </>
);

const SOLIDS: string[] = [
  '9,2 16,15 2,15', // tetraedro
  '4,4 14,4 14,14 4,14', // cubo
  '9,1.5 15.5,9 9,16.5 2.5,9', // octaedro
  '9,1.5 15.6,6.3 13.1,14.5 4.9,14.5 2.4,6.3', // dodecaedro (face)
  '9,1.5 15.5,5.2 15.5,12.8 9,16.5 2.5,12.8 2.5,5.2', // icosaedro (contorno)
];

/** Sólidos de Platão — os cinco, e só cinco: não existe um sexto. */
const Solidos: DepthRender = (p) => (
  <>
    {SOLIDS.map((pts, i) => (
      <Sat key={i} p={p} o={{ r: 84, period: 30000, phase: i / 5, box: 18, roll: 2 + i }}>
        <Polygon points={pts} fill={i % 2 ? p.v.color2 ?? W : p.v.color} fillOpacity={0.24} stroke={i % 2 ? p.v.color2 ?? W : p.v.color} strokeWidth={1.1} strokeLinejoin="round" />
        <Path d={i === 0 ? 'M9 2 L9 15' : i === 1 ? 'M4 4 L14 14 M14 4 L4 14' : i === 2 ? 'M2.5 9 H15.5 M9 1.5 V16.5' : i === 3 ? 'M9 1.5 L9 9 L4.9 14.5 M9 9 L13.1 14.5' : 'M9 1.5 L9 9 L2.5 12.8 M9 9 L15.5 12.8'} stroke={W} strokeOpacity={0.75} strokeWidth={0.6} fill="none" />
      </Sat>
    ))}
  </>
);

/** Constantes — π, e, φ, ∞ e i: os números que aparecem em todo lugar. */
const Constantes: DepthRender = (p) => (
  <>
    {['π', 'e', 'φ', '∞', 'i'].map((ch, i) => (
      <Sat key={ch} p={p} o={{ r: 84, period: 26000, phase: i / 5, box: 22, squash: 0.38 }}>
        <Circle cx={11} cy={11} r={9.5} fill={p.v.color} fillOpacity={0.14} />
        <Circle cx={11} cy={11} r={9.5} stroke={p.v.color} strokeOpacity={0.6} strokeWidth={0.7} fill="none" />
        <SvgText x={11} y={16} fontSize={15} fontWeight="700" fill={i % 2 ? p.v.color2 ?? W : W} textAnchor="middle">
          {ch}
        </SvgText>
      </Sat>
    ))}
  </>
);

/** Colar de Luas — sete contas na mesma órbita, como num colar. */
const ColarLuas: DepthRender = (p) => (
  <>
    {Array.from({ length: 7 }, (_, i) => (
      <Sat key={i} p={p} o={{ r: 86, period: 28000, phase: i / 7, box: 14 }}>
        <Ball c={7} r={i === 3 ? 5 : 3.6} color={i % 2 ? p.v.color2 ?? p.v.color : p.v.color} craters={i === 3} />
      </Sat>
    ))}
  </>
);

/** Enxame de Drones — cinco setas em formação de cunha. */
const Drones: DepthRender = (p) => (
  <>
    {[0, 0.022, -0.022, 0.044, -0.044].map((ph, i) => (
      <Sat key={ph} p={p} o={{ r: 84 + (i === 0 ? 0 : i < 3 ? (i === 1 ? 4 : -4) : i === 3 ? 8 : -8), period: 10000, phase: -Math.abs(ph), box: 12, face: true }}>
        <Polygon points="11,6 2,2.5 4,6 2,9.5" fill={i === 0 ? W : p.v.color} stroke={p.v.color2 ?? W} strokeWidth={0.5} strokeLinejoin="round" />
        <Circle cx={2.4} cy={6} r={1} fill={p.v.color2 ?? '#FF6A55'} />
      </Sat>
    ))}
  </>
);

/** Mariposas Solares — atraídas pela luz, dão voltas sem pousar. */
const Mariposas: DepthRender = (p) => (
  <>
    {[0, 0.31, 0.64].map((ph, i) => (
      <Sat key={ph} p={p} o={{ r: 72 + i * 10, period: 9000 + i * 2600, phase: ph, box: 20, face: true, plane: PLANE + (i - 1) * 26, squash: 0.44 }}>
        <Circle cx={10} cy={10} r={9} fill={p.v.color} fillOpacity={0.12} />
        <Path d="M10 10 C5 2 1 5 3 9.5 C1 13 4 17 10 10 Z" fill={p.v.color} stroke={W} strokeWidth={0.4} />
        <Path d="M10 10 C13 3 18 3 16 9 C19 12 15 17 10 10 Z" fill={p.v.color2 ?? p.v.color} stroke={W} strokeWidth={0.4} />
        <Line x1={5} y1={10} x2={15} y2={10} stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
        <Circle cx={6} cy={7.5} r={0.9} fill={W} />
      </Sat>
    ))}
  </>
);

// ————————————————————————————————————————————————————— épicos

/** Baleia Estelar — enorme e sem pressa; nada pelo vazio como se fosse mar. */
const Baleia: DepthRender = (p) => (
  <>
    <Sat p={p} o={{ r: 86, period: 32000, box: 56, face: true, squash: 0.38, depth: [0.6, 1.1] }}>
      <Path d="M52 26 C46 15 26 12 14 20 C10 23 8 26 4 22 C5 28 3 32 1 34 C7 34 10 31 14 31 C26 38 46 37 52 26 Z" fill={p.v.color} stroke={W} strokeWidth={0.6} strokeLinejoin="round" />
      <Path d="M50 28 C42 34 28 35 18 31" stroke={p.v.color2 ?? W} strokeWidth={2.6} strokeOpacity={0.6} fill="none" strokeLinecap="round" />
      <Path d="M34 30 C32 36 28 39 24 38 C27 35 28 32 29 30 Z" fill={p.v.color} stroke={W} strokeWidth={0.5} />
      <Circle cx={45} cy={24} r={1.1} fill={W} />
      {[
        [22, 20],
        [30, 17],
        [38, 19],
        [27, 25],
        [35, 24],
        [17, 25],
      ].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={i % 2 ? 0.9 : 1.3} fill={W} fillOpacity={0.9} />
      ))}
      <Path d="M22 20 L30 17 L38 19 L35 24 L27 25" stroke={W} strokeOpacity={0.4} strokeWidth={0.4} fill="none" />
    </Sat>
    {dust(p, { count: 3, r: 86, period: 32000, colors: [W, p.v.color2 ?? W], size: [1.6, 2.6], trail: 4, squash: 0.38, phase: -0.05, seed: 13 })}
  </>
);

/** Serpente de Constelação — a cabeça puxa; cada estrela do corpo segue a da frente. */
const Serpente: DepthRender = (p) => (
  <>
    {Array.from({ length: 12 }, (_, i) => (
      <Sat key={i} p={p} o={{ r: 86, period: 15000, phase: -i * 0.017, box: 18, face: i === 0, squash: 0.4, depth: [0.6, 1.15] }}>
        {i === 0 ? (
          <>
            <Polygon points="17,9 9,3 4,9 9,15" fill={p.v.color} stroke={W} strokeWidth={0.7} strokeLinejoin="round" />
            <Circle cx={11.5} cy={7} r={1.1} fill={W} />
            <Path d="M9 3 L6 0.5 M9 15 L6 17.5" stroke={p.v.color2 ?? W} strokeWidth={1} strokeLinecap="round" />
          </>
        ) : (
          <>
            <Circle cx={9} cy={9} r={Math.max(1.6, 5.4 - i * 0.34)} fill={i % 2 ? p.v.color2 ?? p.v.color : p.v.color} fillOpacity={0.9} />
            <Circle cx={9} cy={9} r={Math.max(0.6, 2 - i * 0.12)} fill={W} />
          </>
        )}
      </Sat>
    ))}
  </>
);

function Ship({ color, color2 }: { color: string; color2: string }) {
  return (
    <G>
      <Polygon points="22,11 9,5 12,11 9,17" fill={color} stroke={W} strokeWidth={0.6} strokeLinejoin="round" />
      <Polygon points="12,11 5,7.5 7,11 5,14.5" fill={color2} />
      <Polygon points="22,11 12,11 13,8" fill={W} fillOpacity={0.4} />
      <Circle cx={16} cy={11} r={1.3} fill="#141B36" />
    </G>
  );
}

/** Frota Exploradora — três naves em fila, motores acesos. */
const Frota: DepthRender = (p) => (
  <>
    {[0, -0.05, -0.1].map((ph, i) => (
      <Sat key={ph} p={p} o={{ r: 84 + (i === 1 ? 6 : 0), period: 11000, phase: ph, box: 24, face: true }}>
        <Ship color={i === 0 ? p.v.color : '#DCE3FF'} color2={p.v.color2 ?? p.v.color} />
      </Sat>
    ))}
    {dust(p, { count: 3, r: 84, period: 11000, colors: [p.v.color2 ?? '#FF9F43', W], size: [1.6, 2.2], trail: 6, phase: -0.14, seed: 17 })}
  </>
);

function Gear({ c, r, n, color }: { c: number; r: number; n: number; color: string }) {
  return (
    <G>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return <Rect key={i} x={c - 1.5} y={c - r - 2.4} width={3} height={4} fill={color} transform={`rotate(${(a * 180) / Math.PI} ${c} ${c})`} />;
      })}
      <Circle cx={c} cy={c} r={r} fill="#141B36" stroke={color} strokeWidth={2} />
      <Circle cx={c} cy={c} r={r * 0.36} fill={color} />
      <Path d={`M${c} ${c - r} V${c + r} M${c - r} ${c} H${c + r}`} stroke={color} strokeWidth={0.8} />
    </G>
  );
}

/** Engrenagens do Tempo — três rodas, três velocidades: quanto menor, mais depressa. */
const Engrenagens: DepthRender = (p) => (
  <>
    <Sat p={p} o={{ r: 86, period: 30000, box: 36, roll: 3 }}>
      <Gear c={18} r={12} n={12} color={p.v.color} />
    </Sat>
    <Sat p={p} o={{ r: 86, period: 30000, phase: 0.36, box: 26, roll: -6 }}>
      <Gear c={13} r={8} n={9} color={p.v.color2 ?? p.v.color} />
    </Sat>
    <Sat p={p} o={{ r: 86, period: 30000, phase: 0.68, box: 18, roll: 12 }}>
      <Gear c={9} r={5} n={7} color={W} />
    </Sat>
  </>
);

/** Fases da Lua — oito luas, cada uma num ponto do mês. */
const Fases: DepthRender = (p) => (
  <>
    {Array.from({ length: 8 }, (_, i) => {
      const k = i / 8; // 0 = nova, 0.5 = cheia
      const lit = 1 - Math.abs(1 - 2 * k); // 0..1
      const waxing = k <= 0.5;
      const rx = Math.abs(1 - 2 * lit) * 5;
      return (
        <Sat key={i} p={p} o={{ r: 88, period: 40000, phase: k, box: 14 }}>
          <Circle cx={7} cy={7} r={5} fill="#1A2346" stroke={p.v.color} strokeOpacity={0.5} strokeWidth={0.5} />
          {lit > 0.02 ? (
            <Path
              d={`M7 2 A5 5 0 0 ${waxing ? 1 : 0} 7 12 A${rx.toFixed(2)} 5 0 0 ${(lit > 0.5) === waxing ? 1 : 0} 7 2 Z`}
              fill={p.v.color}
            />
          ) : null}
        </Sat>
      );
    })}
  </>
);

// ————————————————————————————————————————————————————— lendários

/** Fênix Solar — uma ave de fogo; a cauda é uma fileira de chamas que a segue. */
const Fenix: DepthRender = (p) => (
  <>
    {dust(p, { count: 4, r: 88, period: 10000, colors: [p.v.color2 ?? '#FFE08A', W], size: [2, 3.4], trail: 8, squash: 0.42, phase: -0.1, glow: true, seed: 19 })}
    {Array.from({ length: 7 }, (_, i) => (
      <Sat key={i} p={p} o={{ r: 88, period: 10000, phase: -0.025 - i * 0.018, box: 20, face: true, squash: 0.42, depth: [0.6, 1.2] }}>
        <Path d={`M18 10 C12 ${4 - i * 0.3} 6 6 2 10 C6 14 12 ${16 + i * 0.3} 18 10 Z`} fill={i % 2 ? p.v.color2 ?? '#FFE08A' : p.v.color} fillOpacity={0.9 - i * 0.1} />
      </Sat>
    ))}
    <Sat p={p} o={{ r: 88, period: 10000, box: 46, face: true, squash: 0.42, depth: [0.6, 1.2] }}>
      <Path d="M42 23 C36 18 30 18 24 23 C30 28 36 28 42 23 Z" fill={p.v.color} stroke={W} strokeWidth={0.6} />
      <Path d="M30 21 C26 8 14 4 6 8 C14 10 18 14 22 22 Z" fill={p.v.color} stroke={W} strokeWidth={0.6} strokeLinejoin="round" />
      <Path d="M30 25 C26 38 14 42 6 38 C14 36 18 32 22 24 Z" fill={p.v.color2 ?? '#FFE08A'} stroke={W} strokeWidth={0.6} strokeLinejoin="round" />
      <Path d="M28 21 C24 12 18 9 12 9 M28 25 C24 34 18 37 12 37" stroke={W} strokeOpacity={0.7} strokeWidth={0.6} fill="none" />
      <Polygon points="42,23 46,21.5 42,21" fill="#FFE08A" />
      <Circle cx={39} cy={22} r={0.9} fill={INK} />
      <Path d="M36 19 Q38 14 41 15" stroke={p.v.color2 ?? '#FFE08A'} strokeWidth={1} fill="none" strokeLinecap="round" />
    </Sat>
    {p.half === 'front' ? <Particles mode="rise" count={7} period={2600} colors={[p.v.color, p.v.color2 ?? '#FFE08A']} size={[1.6, 3]} radius={[70, 96]} arc={[100, 260]} travel={20} glow seed={23} /> : null}
  </>
);

/** Sistema em Miniatura — cinco mundos, cada um com seu ano: o seu Áster tem um céu só dele. */
const Sistema: DepthRender = (p) => (
  <>
    <Sat p={p} o={{ r: 58, period: 6000, box: 10, squash: 0.3 }}>
      <Ball c={5} r={2.6} color="#C98A5B" />
    </Sat>
    <Sat p={p} o={{ r: 68, period: 10000, phase: 0.3, box: 14, squash: 0.3 }}>
      <Ball c={7} r={3.8} color="#5C8DFF" />
      <Path d="M4.6 6 Q7 4.4 9.4 6.4" stroke="#5FD38D" strokeWidth={1.2} fill="none" />
    </Sat>
    <Sat p={p} o={{ r: 80, period: 17000, phase: 0.62, box: 26, squash: 0.3 }}>
      <Ellipse cx={13} cy={13} rx={11.5} ry={3.4} stroke={p.v.color2 ?? '#E8C98A'} strokeWidth={1.6} fill="none" transform="rotate(-18 13 13)" />
      <Ball c={13} r={6} color={p.v.color} />
      <Path d="M2.2 16.5 A11.5 3.4 -18 0 0 23.8 9.5" stroke={p.v.color2 ?? '#E8C98A'} strokeWidth={1.6} fill="none" />
    </Sat>
    <Sat p={p} o={{ r: 92, period: 27000, phase: 0.15, box: 18, squash: 0.3 }}>
      <Ball c={9} r={5} color="#FF8FD1" />
      <Circle cx={15.5} cy={5} r={1.3} fill="#DCE3FF" />
    </Sat>
    <Sat p={p} o={{ r: 103, period: 41000, phase: 0.8, box: 12, squash: 0.3, reverse: true }}>
      <Ball c={6} r={3.2} color="#9BD8FF" />
    </Sat>
    {dust(p, { count: 14, r: 74, period: 21000, colors: ['#C9D1F0', '#6C7499'], size: [1, 1.8], squash: 0.3, seed: 29 })}
    {p.half === 'front' ? <Particles mode="twinkle" count={5} period={3600} colors={[W]} size={[1.6, 2.6]} radius={[60, 108]} sparkle seed={31} /> : null}
  </>
);

export const ORBITERS: Record<string, DepthRender> = {
  lua: Lua,
  'luas-gemeas': LuasGemeas,
  sonda: Sonda,
  asteroide: Asteroide,
  lanterna: Lanterna,
  cubo: Cubo,
  pipa: Pipa,
  semente: Semente,
  'cometa-orb': CometaOrb,
  satelite: Satelite,
  trio: Trio,
  origami: Origami,
  bussola: Bussola,
  'dado-orb': DadoOrb,
  chave: Chave,
  balao: Balao,
  'estacao-orb': EstacaoOrb,
  peixes: Peixes,
  solidos: Solidos,
  constantes: Constantes,
  'colar-luas': ColarLuas,
  drones: Drones,
  mariposas: Mariposas,
  baleia: Baleia,
  serpente: Serpente,
  frota: Frota,
  engrenagens: Engrenagens,
  fases: Fases,
  fenix: Fenix,
  sistema: Sistema,
};

export function OrbiterFx(p: DepthProps) {
  const Render = p.v.fx ? ORBITERS[p.v.fx] : undefined;
  return Render ? <Render {...p} /> : null;
}
