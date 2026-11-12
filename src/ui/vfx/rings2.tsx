/**
 * Anéis em órbita (espaço `frame`, peças novas). Tudo é desenhado "de cima", num plano inclinado
 * (`Plane`): o que seria um círculo vira elipse em perspectiva e passa por trás e pela frente do
 * corpo. Cada peça tem uma estrutura própria — faixas, cinturões, máquinas, fitas impossíveis.
 *
 * Raios em unidades do palco: os anéis vivem entre 62 e 100 (o corpo vai até ~38).
 */
import { Fragment, type ReactNode } from 'react';
import { Circle, Ellipse, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { Breathe, C, Extra, FxExtent, Glimmer, Layer, Particles, Spin, Wave } from './engine';
import { arc, polar, wavyCircle } from './geometry';
import type { RingFxDef, RingProps } from './rings';
import { Orbiter, Plane } from './space';

const W = '#FFFFFF';
const TILT = -18;
const SQ = 0.3;

/** A mesma receita desenha as duas metades (a de trás e a da frente). */
const both = (render: (p: RingProps) => ReactNode): RingFxDef => ({ Back: render, Front: render });
/** Só numa das passadas (o que não cruza o corpo, ou brilhos que não devem dobrar). */
const once = (render: (p: RingProps) => ReactNode, at: 'back' | 'front' = 'back'): ((p: RingProps) => ReactNode) => (p) => (p.half === at ? render(p) : null);

/** Plano inclinado padrão dos anéis, já com o recorte da metade e o tamanho do bitmap. */
function T({ p, tilt = TILT, squash = SQ, ext = 104, children }: { p: RingProps; tilt?: number; squash?: number; ext?: number; children: ReactNode }) {
  return (
    <Plane tilt={tilt} squash={squash} half={p.half}>
      <FxExtent r={ext}>{children}</FxExtent>
    </Plane>
  );
}

/** Faixa: um traço largo e translúcido com bordas mais marcadas. */
function Band({ r, w, color, o = 0.5, dash, edge = true }: { r: number; w: number; color: string; o?: number; dash?: string; edge?: boolean }) {
  return (
    <G fill="none">
      <Circle cx={C} cy={C} r={r} stroke={color} strokeOpacity={o} strokeWidth={w} strokeDasharray={dash} />
      {edge ? (
        <>
          <Circle cx={C} cy={C} r={r - w / 2} stroke={color} strokeOpacity={Math.min(1, o + 0.3)} strokeWidth={0.7} />
          <Circle cx={C} cy={C} r={r + w / 2} stroke={W} strokeOpacity={o * 0.6} strokeWidth={0.6} />
        </>
      ) : null}
    </G>
  );
}

const orbitDust = (p: RingProps, o: { count: number; r: [number, number]; colors: string[]; period?: number; size?: [number, number]; sparkle?: boolean; trail?: number; seed?: number; tilt?: number; plane?: number }) => (
  <Particles mode="orbit" half={p.half} count={o.count} period={o.period ?? 22000} colors={o.colors} size={o.size ?? [1.6, 2.8]} radius={o.r} tilt={o.tilt ?? SQ} plane={o.plane ?? TILT} sparkle={o.sparkle} trail={o.trail} seed={o.seed ?? 3} />
);

// ————————————————————————————————————————————————————— comuns

/** Anel de Poeira — uma faixa larga e macia, girando devagar. */
const Faixa = both((p) => (
  <T p={p}>
    <Spin period={52000}>
      <Band r={80} w={15} color={p.v.color} o={0.34} dash="70 4 30 3 110 6" />
      <Band r={80} w={5} color={p.v.color2 ?? W} o={0.3} edge={false} />
    </Spin>
  </T>
));

/** Fio de Prata — um arame de luz, quase nada: uma conta corre por ele. */
const Fio = both((p) => (
  <>
    <T p={p}>
      <Layer>
        <Circle cx={C} cy={C} r={86} stroke={p.v.color} strokeWidth={1.3} fill="none" />
        <Circle cx={C} cy={C} r={86} stroke={W} strokeOpacity={0.5} strokeWidth={0.5} fill="none" />
      </Layer>
    </T>
    {orbitDust(p, { count: 1, r: [86, 86], colors: [W], size: [3.4, 3.4], period: 9000, trail: 4 })}
  </>
));

/** Anel de Gelo — faixa pálida, cheia de cristais que cintilam. */
const Gelo = both((p) => (
  <>
    <T p={p}>
      <Spin period={64000}>
        <Band r={78} w={11} color={p.v.color} o={0.3} />
        <Band r={90} w={4} color={W} o={0.26} dash="12 5 40 7" />
      </Spin>
    </T>
    {orbitDust(p, { count: 9, r: [72, 92], colors: [W, p.v.color], sparkle: true, size: [2, 3.4], period: 30000, seed: 9 })}
  </>
));

/** Órbita Tracejada — a linha de um diagrama: a trajetória, desenhada. */
const Tracejado = both((p) => (
  <>
    <T p={p}>
      <Spin period={38000} reverse>
        <Circle cx={C} cy={C} r={84} stroke={p.v.color} strokeWidth={1.6} fill="none" strokeDasharray="7 6" strokeLinecap="round" />
        {[0, 90, 180, 270].map((d) => {
          const a = polar(84, d);
          return <Circle key={d} cx={a.x} cy={a.y} r={2.6} fill={p.v.color2 ?? W} />;
        })}
      </Spin>
    </T>
  </>
));

/** Par de Anéis — dois aros finos, um dentro do outro, em contrarrotação. */
const Duplo = both((p) => (
  <T p={p}>
    <Spin period={30000}>
      <Circle cx={C} cy={C} r={74} stroke={p.v.color} strokeWidth={2.2} fill="none" strokeDasharray="120 8" />
    </Spin>
    <Spin period={44000} reverse>
      <Circle cx={C} cy={C} r={90} stroke={p.v.color2 ?? p.v.color} strokeWidth={2.2} fill="none" strokeDasharray="80 10 30 10" />
    </Spin>
  </T>
));

/** Cinturão de Pedras — nada de faixa: só rochas, cada uma na sua órbita. */
const Pedras = both((p) => (
  <>
    {orbitDust(p, { count: 26, r: [66, 98], colors: [p.v.color, p.v.color2 ?? '#6C7499', '#DCE3FF'], size: [2.6, 6], sparkle: true, period: 34000, seed: 21 })}
    {orbitDust(p, { count: 14, r: [72, 92], colors: ['#DCE3FF', p.v.color], size: [1.4, 2.4], period: 26000, seed: 22 })}
  </>
));

/** Anel de Brasas — uma faixa morna de onde sobem fagulhas. */
const BrasaAnel: RingFxDef = {
  Back: (p) => (
    <T p={p}>
      <Spin period={42000}>
        <Band r={82} w={9} color={p.v.color} o={0.4} dash="30 4 60 5" />
      </Spin>
    </T>
  ),
  Front: (p) => (
    <>
      <T p={p}>
        <Spin period={42000}>
          <Band r={82} w={9} color={p.v.color} o={0.4} dash="30 4 60 5" />
        </Spin>
      </T>
      <Particles mode="rise" count={6} period={3200} colors={[p.v.color, p.v.color2 ?? '#FFE08A']} size={[1.8, 3]} radius={[60, 86]} arc={[110, 250]} travel={16} seed={31} />
    </>
  ),
};

// ————————————————————————————————————————————————————— incomuns

/** Anéis de Saturno — três faixas de tons diferentes, com a divisão escura no meio. */
const Saturno = both((p) => (
  <T p={p}>
    <Spin period={58000}>
      <Band r={68} w={7} color={p.v.color2 ?? p.v.color} o={0.4} />
      <Band r={80} w={12} color={p.v.color} o={0.55} dash="150 3 60 2" />
      <Band r={95} w={8} color={W} o={0.28} dash="40 3 90 4" />
      <Circle cx={C} cy={C} r={88.5} stroke="#04060F" strokeOpacity={0.7} strokeWidth={2.4} fill="none" />
    </Spin>
  </T>
));

/** Anel Trançado — dois fios que se cruzam, como o anel F: um pastor passa por dentro. */
const Pastor = both((p) => (
  <>
    <T p={p}>
      <Spin period={26000}>
        <Path d={wavyCircle(82, 3.4, 14)} stroke={p.v.color} strokeWidth={1.6} fill="none" />
        <Path d={wavyCircle(82, 3.4, 14, 180)} stroke={p.v.color2 ?? W} strokeWidth={1.6} fill="none" />
        <Circle cx={C} cy={C} r={82} stroke={W} strokeOpacity={0.2} strokeWidth={8} fill="none" />
      </Spin>
    </T>
    {orbitDust(p, { count: 2, r: [74, 74], colors: [W], size: [3.4, 3.4], period: 12000 })}
  </>
));

/** Anel de Raias — uma faixa lisa cortada por sombras radiais que giram mais devagar que ela. */
const RaiasAnel = both((p) => (
  <T p={p}>
    <Spin period={40000}>
      <Band r={82} w={18} color={p.v.color} o={0.42} />
    </Spin>
    <Spin period={90000} reverse>
      <G stroke="#04060F" strokeOpacity={0.6} strokeLinecap="round">
        {Array.from({ length: 9 }, (_, i) => {
          const a = polar(74, i * 40);
          const b = polar(91, i * 40 + 6);
          return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={2.4} />;
        })}
      </G>
    </Spin>
  </T>
));

/** Anel-Estação — módulos ligados por corredores; as janelas acendem em sequência. */
const Estacao = both((p) => (
  <T p={p}>
    <Spin period={48000}>
      <Circle cx={C} cy={C} r={84} stroke={p.v.color} strokeOpacity={0.6} strokeWidth={1.4} fill="none" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = polar(84, i * 45);
        return (
          <G key={i} transform={`rotate(${i * 45} ${a.x} ${a.y})`}>
            <Rect x={a.x - 8} y={a.y - 4.5} width={16} height={9} rx={2} fill="#141B36" stroke={p.v.color} strokeWidth={1.2} />
            <Rect x={a.x - 5} y={a.y - 1.4} width={3} height={2.8} fill={p.v.color2 ?? W} />
            <Rect x={a.x + 2} y={a.y - 1.4} width={3} height={2.8} fill={p.v.color2 ?? W} fillOpacity={0.6} />
          </G>
        );
      })}
    </Spin>
    <Glimmer period={3600} window={0.4} peak={0.9}>
      <Circle cx={C} cy={C} r={84} stroke={p.v.color2 ?? W} strokeWidth={0.8} fill="none" strokeDasharray="2 31" />
    </Glimmer>
  </T>
));

/** Anel de Engrenagem — dentes de máquina; uma roda menor gira ao contrário por dentro. */
const Engrenagem = both((p) => {
  const teeth = (r: number, n: number, h: number, w: number) =>
    Array.from({ length: n }, (_, i) => {
      const a0 = (360 / n) * i - w / 2;
      const p0 = polar(r, a0);
      const p1 = polar(r + h, a0 + w * 0.2);
      const p2 = polar(r + h, a0 + w * 0.8);
      const p3 = polar(r, a0 + w);
      return `${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;
    });
  return (
    <T p={p}>
      <Spin period={36000}>
        <Circle cx={C} cy={C} r={84} stroke={p.v.color} strokeWidth={4} fill="none" />
        <G fill={p.v.color}>
          {teeth(85, 18, 7, 9).map((pts, i) => (
            <Polygon key={i} points={pts} />
          ))}
        </G>
      </Spin>
      <Spin period={21000} reverse>
        <Circle cx={C} cy={C} r={68} stroke={p.v.color2 ?? p.v.color} strokeWidth={2.4} fill="none" />
        <G fill={p.v.color2 ?? p.v.color}>
          {teeth(69, 12, 5, 9).map((pts, i) => (
            <Polygon key={i} points={pts} />
          ))}
        </G>
      </Spin>
    </T>
  );
});

/** Anel Polar — passa por cima dos polos, quase de pé. */
const Polar = both((p) => (
  <>
    <T p={p} tilt={72} squash={0.24}>
      <Spin period={34000}>
        <Band r={82} w={8} color={p.v.color} o={0.5} dash="90 5 30 4" />
        <Band r={92} w={2} color={p.v.color2 ?? W} o={0.5} edge={false} />
      </Spin>
    </T>
    {orbitDust(p, { count: 5, r: [78, 90], colors: [W, p.v.color], tilt: 0.24, plane: 72, period: 18000, seed: 41 })}
  </>
));

/** Corrente de Elos — elos fechados, um dentro do outro, dando a volta. */
const CorrenteOrbital = both((p) => (
  <T p={p}>
    <Spin period={44000}>
      {Array.from({ length: 20 }, (_, i) => {
        const a = polar(84, (360 / 20) * i);
        return <Ellipse key={i} cx={a.x} cy={a.y} rx={16} ry={i % 2 ? 3.4 : 7} stroke={i % 2 ? p.v.color2 ?? W : p.v.color} strokeWidth={2.4} fill="none" transform={`rotate(${(360 / 20) * i + 90} ${a.x} ${a.y})`} />;
      })}
    </Spin>
  </T>
));

/** Anel de Lanternas — doze luzes num fio; acendem uma depois da outra. */
const Luzes = both((p) => (
  <>
    <T p={p}>
      <Layer>
        <Circle cx={C} cy={C} r={86} stroke={p.v.color} strokeOpacity={0.4} strokeWidth={0.9} fill="none" />
      </Layer>
    </T>
    {orbitDust(p, { count: 12, r: [86, 86], colors: [p.v.color, p.v.color2 ?? W], size: [3, 4], period: 60000, seed: 5 })}
    <Particles mode="orbit" half={p.half} count={12} period={60000} colors={[W]} size={[6, 7]} radius={[86, 86]} tilt={SQ} plane={TILT} alpha={0.2} seed={5} />
  </>
));

// ————————————————————————————————————————————————————— raros

/** Disco de Acreção — matéria caindo em espiral: quente por dentro, fria por fora. */
const Acrecao = both((p) => (
  <>
    <T p={p}>
      <Spin period={16000}>
        <G fill="none">
          {[62, 68, 75, 83, 92].map((r, i) => (
            <Circle key={r} cx={C} cy={C} r={r} stroke={i < 2 ? W : i < 4 ? p.v.color : p.v.color2 ?? p.v.color} strokeOpacity={0.9 - i * 0.13} strokeWidth={5.4} strokeDasharray={['46 6 14 5', '24 4 70 8', '10 5 34 6', '80 10 16 6', '18 6 50 9'][i]} />
          ))}
        </G>
      </Spin>
    </T>
    <Particles mode="spiral" half={p.half} count={8} period={5600} colors={[W, p.v.color]} size={[1.6, 2.8]} radius={[58, 98]} tilt={SQ} plane={TILT} turns={1.6} trail={2} seed={51} />
  </>
));

/** Giroscópio — dois aros em planos cruzados; cada um gira no seu eixo. */
const Giroscopio = both((p) => (
  <>
    <T p={p} tilt={-34} squash={0.36}>
      <Spin period={14000}>
        <Circle cx={C} cy={C} r={86} stroke={p.v.color} strokeWidth={3} fill="none" />
        <Circle cx={C} cy={C} r={86} stroke={W} strokeOpacity={0.6} strokeWidth={0.8} fill="none" strokeDasharray="10 44" />
        {[0, 180].map((d) => {
          const a = polar(86, d);
          return <Circle key={d} cx={a.x} cy={a.y} r={5} fill={p.v.color} stroke={W} strokeWidth={1} />;
        })}
      </Spin>
    </T>
    <T p={p} tilt={38} squash={0.3}>
      <Spin period={19000} reverse>
        <Circle cx={C} cy={C} r={74} stroke={p.v.color2 ?? p.v.color} strokeWidth={3} fill="none" />
        <Circle cx={C} cy={C} r={74} stroke={W} strokeOpacity={0.6} strokeWidth={0.8} fill="none" strokeDasharray="8 38" />
        {[90, 270].map((d) => {
          const a = polar(74, d);
          return <Circle key={d} cx={a.x} cy={a.y} r={4.4} fill={p.v.color2 ?? p.v.color} stroke={W} strokeWidth={1} />;
        })}
      </Spin>
    </T>
  </>
));

/** Anel Partido — algo o quebrou: restam arcos, e os estilhaços ainda se espalham pela falha. */
const Partido = both((p) => (
  <>
    <T p={p}>
      <Spin period={50000}>
        <G fill="none" strokeLinecap="round">
          <Path d={arc(84, 10, 118)} stroke={p.v.color} strokeWidth={6} />
          <Path d={arc(84, 150, 232)} stroke={p.v.color} strokeWidth={6} />
          <Path d={arc(84, 262, 330)} stroke={p.v.color2 ?? p.v.color} strokeWidth={6} />
          <Path d={arc(84, 10, 118)} stroke={W} strokeOpacity={0.5} strokeWidth={1} />
          <Path d={arc(84, 150, 232)} stroke={W} strokeOpacity={0.5} strokeWidth={1} />
        </G>
      </Spin>
    </T>
    {orbitDust(p, { count: 9, r: [76, 94], colors: [p.v.color, W], sparkle: true, size: [1.8, 3.6], period: 20000, seed: 61 })}
  </>
));

/** Anel-Portal — nove travas em volta; elas acendem em ordem, como quem disca um endereço. */
const Portal = both((p) => (
  <T p={p}>
    <Layer>
      <Circle cx={C} cy={C} r={84} stroke="#141B36" strokeWidth={10} fill="none" />
      <Circle cx={C} cy={C} r={89} stroke={p.v.color} strokeWidth={1.2} fill="none" />
      <Circle cx={C} cy={C} r={79} stroke={p.v.color} strokeWidth={1.2} fill="none" />
    </Layer>
    <Spin period={70000}>
      <Circle cx={C} cy={C} r={84} stroke={p.v.color} strokeOpacity={0.5} strokeWidth={4} fill="none" strokeDasharray="3 8.7" />
    </Spin>
    {Array.from({ length: 9 }, (_, i) => {
      const a = polar(90, i * 40);
      return (
        <Glimmer key={i} period={5400} phase={1 - i / 9} window={0.34} peak={1}>
          <Polygon points={`${a.x},${a.y + 6} ${a.x - 5},${a.y - 4} ${a.x + 5},${a.y - 4}`} fill={p.v.color2 ?? W} transform={`rotate(${i * 40} ${a.x} ${a.y})`} />
        </Glimmer>
      );
    })}
  </T>
));

const PI_DIGITS = '3141592653589793238462643383'.split('');

/** Anel de π — as casas decimais gravadas em volta, sem nunca repetir. */
const Pi = both((p) => (
  <T p={p} squash={0.34}>
    <Spin period={80000}>
      <Circle cx={C} cy={C} r={94} stroke={p.v.color} strokeWidth={1} fill="none" />
      <Circle cx={C} cy={C} r={74} stroke={p.v.color} strokeWidth={1} fill="none" />
      {PI_DIGITS.map((d, i) => {
        const deg = (360 / PI_DIGITS.length) * i;
        const a = polar(84, deg);
        return (
          <SvgText key={i} x={a.x} y={a.y + 4.6} fontSize={13} fontWeight="700" fill={i === 0 ? W : p.v.color2 ?? p.v.color} textAnchor="middle" transform={`rotate(${deg} ${a.x} ${a.y})`}>
            {d}
          </SvgText>
        );
      })}
    </Spin>
  </T>
));

/** Anel de Fibonacci — arcos de comprimento 1, 1, 2, 3, 5, 8: cada um é a soma dos dois anteriores. */
const Fibonacci = both((p) => {
  const fib = [1, 1, 2, 3, 5, 8, 13];
  const total = fib.reduce((a, b) => a + b, 0);
  let at = 0;
  const arcs = fib.map((n, i) => {
    const from = (at / total) * 360 + 2;
    at += n;
    return { from, to: (at / total) * 360 - 2, i };
  });
  return (
    <T p={p}>
      <Spin period={46000}>
        <G fill="none" strokeLinecap="round">
          {arcs.map((a) => (
            <Path key={a.i} d={arc(84, a.from, a.to)} stroke={a.i % 2 ? p.v.color2 ?? W : p.v.color} strokeWidth={3 + a.i * 0.9} />
          ))}
          {arcs.map((a) => {
            const m = polar(84, a.from);
            return <Circle key={`d${a.i}`} cx={m.x} cy={m.y} r={2.4} fill={W} />;
          })}
        </G>
      </Spin>
    </T>
  );
});

/** Coroa de Cristais — oito cristais de pé, em órbita: giram sem deitar. */
const Cristais = both((p) => (
  <>
    <T p={p}>
      <Layer>
        <Circle cx={C} cy={C} r={84} stroke={p.v.color} strokeOpacity={0.35} strokeWidth={0.9} fill="none" strokeDasharray="2 5" />
      </Layer>
    </T>
    {Array.from({ length: 8 }, (_, i) => (
      <Orbiter key={i} r={84} squash={SQ} plane={TILT} period={26000} phase={i / 8} box={14} half={p.half} depth={[0.66, 1.2]}>
        <Polygon points="7,0.5 11,5 7,13.5 3,5" fill={i % 2 ? p.v.color2 ?? W : p.v.color} stroke={W} strokeOpacity={0.8} strokeWidth={0.7} strokeLinejoin="round" />
        <Polygon points="7,0.5 7,13.5 3,5" fill={W} fillOpacity={0.3} />
      </Orbiter>
    ))}
  </>
));

/** Velas Solares — seis velas espelhadas presas a um aro, viradas para a luz. */
const Velas = both((p) => (
  <>
    <T p={p}>
      <Layer>
        <Circle cx={C} cy={C} r={80} stroke={p.v.color} strokeOpacity={0.5} strokeWidth={1} fill="none" />
      </Layer>
    </T>
    {Array.from({ length: 6 }, (_, i) => (
      <Orbiter key={i} r={80} squash={SQ} plane={TILT} period={34000} phase={i / 6} box={20} half={p.half} depth={[0.6, 1.2]}>
        <Polygon points="10,1 18,10 10,19 2,10" fill={p.v.color} fillOpacity={0.5} stroke={p.v.color2 ?? W} strokeWidth={1} strokeLinejoin="round" />
        <Line x1={10} y1={1} x2={10} y2={19} stroke={W} strokeOpacity={0.7} strokeWidth={0.6} />
        <Line x1={2} y1={10} x2={18} y2={10} stroke={W} strokeOpacity={0.7} strokeWidth={0.6} />
        <Polygon points="10,1 18,10 10,10" fill={W} fillOpacity={0.35} />
      </Orbiter>
    ))}
  </>
));

// ————————————————————————————————————————————————————— épicos

/** Esfera Armilar Viva — três aros em três planos, com contas correndo em cada um. */
const Armilar3 = both((p) => (
  <>
    {(
      [
        [-52, 0.4, 92, 15000, p.v.color],
        [0, 0.26, 82, 21000, p.v.color2 ?? p.v.color],
        [52, 0.4, 72, 12000, p.v.color],
      ] as const
    ).map(([tilt, sq, r, period, color], i) => (
      <Fragment key={i}>
        <T p={p} tilt={tilt} squash={sq}>
          <Spin period={period} reverse={i === 1}>
            <Circle cx={C} cy={C} r={r} stroke={color} strokeWidth={2.4} fill="none" />
            <Circle cx={C} cy={C} r={r} stroke={W} strokeOpacity={0.7} strokeWidth={0.7} fill="none" strokeDasharray="6 30" />
          </Spin>
        </T>
        {orbitDust(p, { count: 2, r: [r, r], colors: [W], size: [3.2, 3.6], period: period / 2, tilt: sq, plane: tilt, trail: 3, seed: 70 + i })}
      </Fragment>
    ))}
  </>
));

/** Enxame de Dyson — milhares de painéis em formação; a luz do corpo vaza entre eles. */
const DysonAnel = both((p) => (
  <>
    <T p={p}>
      <Spin period={40000}>
        <Circle cx={C} cy={C} r={82} stroke="#0C1124" strokeOpacity={0.85} strokeWidth={20} fill="none" />
        {[72, 79, 86, 93].map((r, row) => (
          <Circle key={r} cx={C} cy={C} r={r} stroke={row % 2 ? p.v.color2 ?? W : p.v.color} strokeOpacity={0.9} strokeWidth={5.4} fill="none" strokeDasharray={`${7 + row} 2.6`} strokeDashoffset={row * 4} />
        ))}
      </Spin>
      <Glimmer period={4200} window={0.3} peak={0.8}>
        <Circle cx={C} cy={C} r={82} stroke={W} strokeWidth={20} strokeOpacity={0.3} fill="none" strokeDasharray="14 90" />
      </Glimmer>
    </T>
    {orbitDust(p, { count: 10, r: [98, 104], colors: [W, p.v.color], size: [1.4, 2.4], sparkle: true, period: 16000, seed: 81 })}
  </>
));

/** Fita de Möbius — uma fita com um lado só: a largura some e volta, e o claro vira escuro a cada meia volta. */
const Mobius = both((p) => {
  const n = 72;
  const ribbon = (phase: number, color: string, o: number) => {
    let d = '';
    const inner: string[] = [];
    for (let i = 0; i <= n; i++) {
      const deg = (360 / n) * i;
      const w = 9 * Math.cos(((deg / 2 + phase) * Math.PI) / 180);
      const a = polar(84 + w, deg);
      const b = polar(84 - w, deg);
      d += `${i === 0 ? 'M' : 'L'}${a.x.toFixed(1)} ${a.y.toFixed(1)} `;
      inner.push(`L${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
    }
    return <Path d={`${d}${inner.reverse().join(' ')} Z`} fill={color} fillOpacity={o} stroke={W} strokeOpacity={0.6} strokeWidth={0.7} strokeLinejoin="round" />;
  };
  return (
    <>
      <T p={p} squash={0.36}>
        <Spin period={24000}>
          {ribbon(0, p.v.color, 0.7)}
          {ribbon(90, p.v.color2 ?? W, 0.45)}
        </Spin>
      </T>
      {orbitDust(p, { count: 3, r: [84, 84], colors: [W], size: [2.6, 3.2], period: 12000, tilt: 0.36, trail: 4, seed: 91 })}
    </>
  );
});

/** Anel de Marés — ele não é rígido: estica, encolhe e solta ondas pelo plano. */
const MareAnel = both((p) => (
  <T p={p}>
    <Breathe period={5200} scale={[0.9, 1.06]} opacity={[0.7, 1]}>
      <Band r={82} w={10} color={p.v.color} o={0.5} />
      <Path d={wavyCircle(92, 2.6, 18)} stroke={p.v.color2 ?? W} strokeWidth={1.4} fill="none" />
    </Breathe>
    {[0, 0.33, 0.66].map((ph) => (
      <Wave key={ph} period={5200} phase={ph} from={64} to={104} drawnAt={84} peak={0.6}>
        <Circle cx={C} cy={C} r={84} stroke={W} strokeWidth={1.2} fill="none" />
      </Wave>
    ))}
    <Extra>
      <Spin period={30000} reverse>
        <Path d={wavyCircle(72, 2, 12)} stroke={p.v.color} strokeOpacity={0.7} strokeWidth={1.2} fill="none" />
      </Spin>
    </Extra>
  </T>
));

/** Anel do Relógio — doze marcas e dois ponteiros, um veloz e um lento: o tempo visto de lado. */
const Relogio = both((p) => (
  <T p={p} squash={0.34}>
    <Layer>
      <Circle cx={C} cy={C} r={92} stroke={p.v.color} strokeWidth={2} fill="none" />
      <Circle cx={C} cy={C} r={70} stroke={p.v.color} strokeOpacity={0.5} strokeWidth={0.8} fill="none" />
      <G stroke={p.v.color2 ?? W} strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => {
          const a = polar(i % 3 ? 86 : 80, i * 30);
          const b = polar(91, i * 30);
          return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={i % 3 ? 1.2 : 2.6} />;
        })}
      </G>
    </Layer>
    <Spin period={6000}>
      <Line x1={C} y1={C - 66} x2={C} y2={C - 90} stroke={W} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={C} cy={C - 90} r={2.6} fill={W} />
    </Spin>
    <Spin period={72000}>
      <Line x1={C} y1={C - 70} x2={C} y2={C - 82} stroke={p.v.color2 ?? W} strokeWidth={4} strokeLinecap="round" />
    </Spin>
    <Glimmer period={6000} window={0.12} peak={0.9}>
      <Circle cx={C} cy={C} r={92} stroke={W} strokeWidth={3} fill="none" />
    </Glimmer>
  </T>
));

// ————————————————————————————————————————————————————— lendários

/** Anel do Horizonte — um disco incandescente que solta ondas de choque; nada do que o cruza volta igual. */
const Horizonte: RingFxDef = {
  Back: (p) => (
    <>
      <T p={p} squash={0.26}>
        <Spin period={9000}>
          <G fill="none">
            {[60, 66, 73, 81, 90, 99].map((r, i) => (
              <Circle key={r} cx={C} cy={C} r={r} stroke={i < 2 ? W : i < 4 ? p.v.color : p.v.color2 ?? p.v.color} strokeOpacity={0.95 - i * 0.12} strokeWidth={6} strokeDasharray={['46 6 14 5', '24 4 70 8', '10 5 34 6', '80 10 16 6', '18 6 50 9', '90 12'][i]} />
            ))}
          </G>
        </Spin>
        {[0, 0.5].map((ph) => (
          <Wave key={ph} period={3800} phase={ph} from={58} to={108} drawnAt={84} peak={0.7}>
            <Circle cx={C} cy={C} r={84} stroke={W} strokeWidth={1.6} fill="none" />
          </Wave>
        ))}
      </T>
      <Particles mode="spiral" half="back" count={9} period={3600} colors={[W, p.v.color]} size={[1.6, 3]} radius={[56, 102]} tilt={0.26} plane={TILT} turns={2} trail={3} seed={101} />
      {/* A face de trás do disco, dobrada por cima do corpo. */}
      <FxExtent r={p.r + 22}>
        <Breathe period={3800} opacity={[0.6, 1]}>
          <Path d={arc(p.r + 9, -74, 74)} stroke={p.v.color} strokeOpacity={0.85} strokeWidth={7} fill="none" strokeLinecap="round" />
          <Path d={arc(p.r + 10, -58, 58)} stroke={W} strokeOpacity={0.8} strokeWidth={2} fill="none" strokeLinecap="round" />
        </Breathe>
      </FxExtent>
    </>
  ),
  Front: (p) => (
    <>
      <T p={p} squash={0.26}>
        <Spin period={9000}>
          <G fill="none">
            {[60, 66, 73, 81, 90, 99].map((r, i) => (
              <Circle key={r} cx={C} cy={C} r={r} stroke={i < 2 ? W : i < 4 ? p.v.color : p.v.color2 ?? p.v.color} strokeOpacity={0.95 - i * 0.12} strokeWidth={6} strokeDasharray={['46 6 14 5', '24 4 70 8', '10 5 34 6', '80 10 16 6', '18 6 50 9', '90 12'][i]} />
            ))}
          </G>
        </Spin>
        {[0, 0.5].map((ph) => (
          <Wave key={ph} period={3800} phase={ph} from={58} to={108} drawnAt={84} peak={0.7}>
            <Circle cx={C} cy={C} r={84} stroke={W} strokeWidth={1.6} fill="none" />
          </Wave>
        ))}
      </T>
      <Particles mode="spiral" half="front" count={9} period={3600} colors={[W, p.v.color]} size={[1.6, 3]} radius={[56, 102]} tilt={0.26} plane={TILT} turns={2} trail={3} seed={101} />
      <Extra min={0.8}>
        <Particles mode="twinkle" count={7} period={2800} colors={[W, p.v.color]} size={[2, 3.4]} radius={[70, 104]} arc={[60, 300]} sparkle seed={103} />
      </Extra>
    </>
  ),
};

/** Laço do Infinito — não é um anel: é um oito deitado, e a luz o percorre sem começo nem fim. */
const Infinito = both((p) => {
  const n = 80;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const q = 1 + Math.sin(a) * Math.sin(a);
    const x = (100 * Math.cos(a)) / q;
    const y = ((100 * Math.sin(a) * Math.cos(a)) / q) * 1.5;
    d += `${i === 0 ? 'M' : 'L'}${(C + x).toFixed(1)} ${(C + y).toFixed(1)} `;
  }
  return (
    <>
      <T p={p} tilt={-8} squash={0.5} ext={108}>
        <Breathe period={4600} opacity={[0.65, 1]}>
          <Path d={d} stroke={p.v.color} strokeOpacity={0.3} strokeWidth={9} fill="none" strokeLinejoin="round" />
          <Path d={d} stroke={p.v.color} strokeWidth={2.6} fill="none" strokeLinejoin="round" />
          <Path d={d} stroke={W} strokeOpacity={0.8} strokeWidth={0.8} fill="none" strokeLinejoin="round" />
        </Breathe>
        <Extra>
          <Glimmer period={4600} window={0.4} peak={0.8}>
            <Path d={d} stroke={p.v.color2 ?? W} strokeWidth={5} strokeOpacity={0.5} fill="none" strokeDasharray="30 200" />
          </Glimmer>
        </Extra>
      </T>
      <Particles mode="lemniscate" half={p.half} count={8} period={6200} colors={[W, p.v.color, p.v.color2 ?? W]} size={[2, 3.4]} radius={[100, 100]} tilt={0.5} plane={-8} trail={5} glow seed={111} />
    </>
  );
});

const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

/** Roda das Constelações — doze casas em volta; em cada uma, um punhado de estrelas ligadas por fios de luz. */
const Zodiaco = both((p) => (
  <>
    <T p={p} squash={0.36} ext={110}>
      <Spin period={110000}>
        <Circle cx={C} cy={C} r={100} stroke={p.v.color} strokeWidth={1.4} fill="none" />
        <Circle cx={C} cy={C} r={72} stroke={p.v.color} strokeWidth={1.4} fill="none" />
        <Circle cx={C} cy={C} r={86} stroke={p.v.color} strokeOpacity={0.14} strokeWidth={27} fill="none" />
        {ZODIAC.map((_, i) => {
          const a = polar(72, i * 30);
          const b = polar(100, i * 30);
          const s0 = polar(80, i * 30 + 8);
          const s1 = polar(92, i * 30 + 13);
          const s2 = polar(84, i * 30 + 21);
          const s3 = polar(94, i * 30 + 24);
          return (
            <G key={i}>
              <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={p.v.color} strokeOpacity={0.8} strokeWidth={1} />
              <Path d={`M${s0.x.toFixed(1)} ${s0.y.toFixed(1)} L${s1.x.toFixed(1)} ${s1.y.toFixed(1)} L${s2.x.toFixed(1)} ${s2.y.toFixed(1)} L${s3.x.toFixed(1)} ${s3.y.toFixed(1)}`} stroke={p.v.color2 ?? W} strokeOpacity={0.7} strokeWidth={0.8} fill="none" />
              {[s0, s1, s2, s3].map((s, j) => (
                <Circle key={j} cx={s.x} cy={s.y} r={j === (i % 4) ? 2.6 : 1.5} fill={W} />
              ))}
            </G>
          );
        })}
      </Spin>
      <Spin period={48000} reverse>
        <Circle cx={C} cy={C} r={66} stroke={p.v.color2 ?? W} strokeWidth={1.2} fill="none" strokeDasharray="1 7" />
        <Circle cx={C} cy={C} r={106} stroke={p.v.color2 ?? W} strokeWidth={1.2} fill="none" strokeDasharray="1 9" />
      </Spin>
    </T>
    <Particles mode="orbit" half={p.half} count={12} period={36000} colors={[W, p.v.color]} size={[2, 3.6]} radius={[86, 86]} tilt={0.36} plane={TILT} sparkle glow seed={121} />
    <Extra min={0.8}>
      <Particles mode="twinkle" count={8} period={3400} colors={[W]} size={[2, 3]} radius={[60, 108]} sparkle seed={123} />
    </Extra>
  </>
));

void once;

export const ORBITAL_RINGS: Record<string, RingFxDef> = {
  faixa: Faixa,
  fio: Fio,
  'gelo-anel': Gelo,
  tracejado: Tracejado,
  duplo: Duplo,
  pedras: Pedras,
  'brasa-anel': BrasaAnel,
  saturno: Saturno,
  pastor: Pastor,
  'raias-anel': RaiasAnel,
  estacao: Estacao,
  engrenagem: Engrenagem,
  'polar-anel': Polar,
  'corrente-orbital': CorrenteOrbital,
  luzes: Luzes,
  acrecao: Acrecao,
  giroscopio: Giroscopio,
  partido: Partido,
  portal: Portal,
  pi: Pi,
  fibonacci: Fibonacci,
  cristais: Cristais,
  velas: Velas,
  armilar3: Armilar3,
  'dyson-anel': DysonAnel,
  mobius: Mobius,
  'mare-anel': MareAnel,
  relogio: Relogio,
  horizonte: Horizonte,
  infinito: Infinito,
  zodiaco: Zodiaco,
};
