/**
 * Rastros (espaço `trail`): a matéria em movimento em volta do Áster. O que distingue um do outro
 * é o MOVIMENTO (orbitar, cair em espiral, subir em hélice, atravessar, jorrar), não a cor.
 *
 * Cada rastro é chamado duas vezes (metade de trás e da frente). Os que não cruzam o corpo desenham
 * tudo numa passada só (`F`: só na frente; `B`: só atrás).
 */
import type { ReactNode } from 'react';
import { Circle, G, Path, Polyline } from 'react-native-svg';
import { Breathe, C, Extra, FxExtent, Glimmer, Layer, Particles, Spin, Sway, Wave } from './engine';
import { lightning, spiral } from './geometry';
import type { DepthProps, DepthRender } from './orbiters';
import { Plane } from './space';

const W = '#FFFFFF';
const PLANE = -18;
const SQ = 0.34;

const F = (p: DepthProps, node: ReactNode) => (p.half === 'front' ? node : null);
const B = (p: DepthProps, node: ReactNode) => (p.half === 'back' ? node : null);
const c2 = (p: DepthProps) => p.v.color2 ?? W;

// ————————————————————————————————————————————————————— comuns

/** Poeira Estelar — grãos parados que acendem e apagam devagar. */
const Poeira: DepthRender = (p) => F(p, <Particles mode="twinkle" count={24} period={5200} colors={[W, p.v.color]} size={[2.1, 4.1]} radius={[p.r + 10, 108]} sparkle seed={3} />);

/** Rastro Orbital — três grãos em órbita, cada um com uma cauda curta. */
const Orbital: DepthRender = (p) => (
  <>
    <Plane tilt={PLANE} squash={SQ} half={p.half}>
      <FxExtent r={82}>
        <Layer>
          <Circle cx={C} cy={C} r={78} stroke={p.v.color} strokeOpacity={0.28} strokeWidth={0.9} fill="none" strokeDasharray="2 5" />
        </Layer>
      </FxExtent>
    </Plane>
    <Particles mode="orbit" half={p.half} count={4} period={9000} colors={[W, p.v.color]} size={[3.1, 4.3]} radius={[78, 78]} tilt={SQ} plane={PLANE} trail={5} seed={5} />
  </>
);

/** Brasas Ascendentes — sobem de baixo do corpo, ondulando. */
const Brasas: DepthRender = (p) => F(p, <Particles mode="rise" count={15} period={3600} colors={[p.v.color, c2(p)]} size={[2.3, 4.3]} radius={[p.r * 0.6, p.r + 34]} arc={[110, 250]} travel={46} glow seed={7} />);

/** Neve Cósmica — cai devagar, sem vento. */
const Neve: DepthRender = (p) => F(p, <Particles mode="fall" count={21} period={7200} colors={[W, p.v.color]} size={[2.1, 4.1]} radius={[30, 104]} arc={[-80, 80]} travel={150} seed={9} />);

/** Vento Solar — partículas atravessam o palco de um lado ao outro, em linha reta. */
const Vento: DepthRender = (p) => F(p, <Particles mode="streak" count={18} period={3000} colors={[W, p.v.color]} size={[1.8, 3.2]} radius={[p.r + 6, 104]} travel={118} plane={-8} trail={3} seed={11} />);

/** Bolhas — esferas grandes e quase transparentes, subindo. */
const Bolhas: DepthRender = (p) => F(p, <Particles mode="rise" count={14} period={6400} colors={[p.v.color, W]} size={[5.2, 12.2]} radius={[20, 96]} arc={[100, 260]} travel={120} alpha={0.34} seed={13} />);

/** Fagulhas — saltam do corpo para fora, como de uma pedra de amolar. */
const Fagulhas: DepthRender = (p) => F(p, <Particles mode="radial" count={18} period={2200} colors={[W, p.v.color, c2(p)]} size={[1.8, 3.8]} radius={[p.r, 100]} sparkle seed={15} />);

// ————————————————————————————————————————————————————— incomuns

/** Cauda de Cometa — duas pontas de luz com caudas longas, em órbitas cruzadas. */
const Cauda: DepthRender = (p) => (
  <>
    <Particles mode="orbit" half={p.half} count={1} period={6200} colors={[W]} size={[4.2, 4.3]} radius={[84, 84]} tilt={SQ} plane={PLANE} trail={10} glow seed={17} />
    <Particles mode="orbit" half={p.half} count={1} period={8400} colors={[p.v.color]} size={[3.6, 3.8]} radius={[70, 70]} tilt={0.4} plane={34} trail={10} reverse seed={19} />
  </>
);

/** Espiral de Acreção — caem em espiral, cada vez mais rápido, até sumir no corpo. */
const Espiral: DepthRender = (p) => <Particles mode="spiral" half={p.half} count={21} period={5200} colors={[W, p.v.color, c2(p)]} size={[2.1, 4.1]} radius={[p.r * 0.7, 102]} tilt={SQ} plane={PLANE} turns={2} trail={2} seed={21} />;

/** Chuva de Meteoros — riscos diagonais, com cauda. */
const Chuva: DepthRender = (p) => F(p, <Particles mode="streak" count={14} period={1900} colors={[W, p.v.color]} size={[2.3, 3.8]} radius={[10, 104]} travel={124} plane={38} trail={6} seed={23} />);

/** Fonte de Luz — jorra para cima e cai em arco dos dois lados. */
const Fonte: DepthRender = (p) => F(p, <Particles mode="fountain" count={24} period={2800} colors={[W, p.v.color, c2(p)]} size={[2.1, 4.1]} radius={[p.r, 70]} travel={38} glow seed={25} />);

/** Pétalas ao Vento — caem girando, levadas de lado. */
const Petalas: DepthRender = (p) => F(p, <Particles mode="fall" count={18} period={6000} colors={[p.v.color, c2(p), W]} size={[3.9, 6.8]} radius={[34, 104]} arc={[-70, 70]} travel={140} sparkle seed={27} />);

/** Pulso — a cada batida, um anel de luz e uma leva de faíscas. */
const Pulso: DepthRender = (p) =>
  F(
    p,
    <>
      <FxExtent r={108}>
        {[0, 0.5].map((ph) => (
          <Wave key={ph} period={3200} phase={ph} from={p.r} to={106} drawnAt={70} peak={0.6} hold={0.2}>
            <Circle cx={C} cy={C} r={70} stroke={p.v.color} strokeWidth={1.6} fill="none" />
            <Circle cx={C} cy={C} r={66} stroke={W} strokeOpacity={0.5} strokeWidth={0.6} fill="none" />
          </Wave>
        ))}
      </FxExtent>
      <Particles mode="radial" count={12} period={3200} colors={[W, p.v.color]} size={[2.1, 3.5]} radius={[p.r, 104]} seed={29} />
    </>,
  );

/** Enxame Errante — pontos que vagam cada um na sua órbita, sem ordem. */
const Enxame: DepthRender = (p) => (
  <>
    <Particles mode="orbit" half={p.half} count={8} period={11000} colors={[p.v.color, W]} size={[2.6, 4.3]} radius={[60, 96]} tilt={0.5} plane={-40} glow seed={31} />
    <Particles mode="orbit" half={p.half} count={8} period={15000} colors={[c2(p), W]} size={[2.6, 4.3]} radius={[64, 100]} tilt={0.3} plane={30} reverse glow seed={33} />
    {F(p, <Particles mode="twinkle" count={9} period={3000} colors={[p.v.color]} size={[2.6, 4.1]} radius={[50, 106]} seed={35} />)}
  </>
);

// ————————————————————————————————————————————————————— raros

/** Hélice Dupla — duas fitas enroladas subindo de um polo e descendo do outro. */
const Helice: DepthRender = (p) => F(p, <Particles mode="helix" count={33} period={3600} colors={[p.v.color, c2(p)]} size={[2.6, 4.3]} radius={[p.r * 0.7, p.r * 0.7]} travel={74} plane={PLANE} turns={2.5} glow seed={37} />);

/** Órbitas Cruzadas — três planos, três elétrons: o desenho de um átomo. */
const Atomo: DepthRender = (p) => (
  <>
    {[-60, 0, 60].map((plane, i) => (
      <Particles key={plane} mode="orbit" half={p.half} count={1} period={4200 + i * 900} colors={[i === 1 ? W : p.v.color]} size={[4.2, 4.3]} radius={[88, 88]} tilt={0.32} plane={plane} trail={9} glow seed={39 + i} />
    ))}
  </>
);

/** Trilha do Infinito — percorre um oito deitado, cruzando o corpo no meio. */
const Lemniscata: DepthRender = (p) => <Particles mode="lemniscate" half={p.half} count={8} period={7000} colors={[W, p.v.color, c2(p)]} size={[3.1, 4.6]} radius={[102, 102]} tilt={0.5} plane={-6} trail={8} glow seed={43} />;

/** Cascata — desce pelos dois lados do corpo e vira névoa embaixo. */
const Cascata: DepthRender = (p) =>
  F(
    p,
    <>
      <Particles mode="fall" count={18} period={2600} colors={[W, p.v.color]} size={[2.1, 3.5]} radius={[p.r + 4, p.r + 22]} arc={[-140, -40]} travel={96} trail={3} seed={45} />
      <Particles mode="fall" count={18} period={2600} colors={[W, p.v.color]} size={[2.1, 3.5]} radius={[p.r + 4, p.r + 22]} arc={[40, 140]} travel={96} trail={3} seed={47} />
      <Particles mode="twinkle" count={12} period={2200} colors={[W, p.v.color]} size={[3.9, 8.1]} radius={[70, 104]} arc={[140, 220]} alpha={0.4} seed={49} />
    </>,
  );

/** Maré de Poeira — dois cinturões de grãos girando em sentidos opostos. */
const MarePoeira: DepthRender = (p) => (
  <>
    <Particles mode="orbit" half={p.half} count={24} period={18000} colors={[p.v.color, W]} size={[1.8, 3.5]} radius={[66, 76]} tilt={SQ} plane={PLANE} seed={51} />
    <Particles mode="orbit" half={p.half} count={30} period={26000} colors={[c2(p), W]} size={[1.8, 3.5]} radius={[90, 102]} tilt={SQ} plane={PLANE} reverse seed={53} />
  </>
);

/** Raios Cósmicos — vêm de longe, em linha reta, e estalam ao bater no corpo. */
const RaiosCosmicos: DepthRender = (p) =>
  F(
    p,
    <>
      <Particles mode="converge" count={15} period={1800} colors={[W, p.v.color]} size={[2.1, 3.5]} radius={[p.r * 2, 112]} trail={5} seed={55} />
      <FxExtent r={p.r + 12}>
        {[0, 0.34, 0.67].map((ph, i) => (
          <Glimmer key={ph} period={1800} phase={ph} window={0.16} peak={0.9}>
            <Circle cx={C + Math.cos(i * 2.1) * p.r} cy={C + Math.sin(i * 2.1) * p.r} r={4} fill={W} />
            <Circle cx={C + Math.cos(i * 2.1) * p.r} cy={C + Math.sin(i * 2.1) * p.r} r={9} fill={p.v.color} fillOpacity={0.3} />
          </Glimmer>
        ))}
      </FxExtent>
    </>,
  );

// ————————————————————————————————————————————————————— épicos

/** Vórtice — três braços de grãos caindo em espiral: uma galáxia em miniatura. */
const Vortice: DepthRender = (p) => (
  <>
    {B(
      p,
      <Plane tilt={PLANE} squash={SQ}>
        <FxExtent r={106}>
          <Spin period={24000}>
            <G fill="none" strokeLinecap="round">
              {[0, 120, 240].map((d) => (
                <Path key={d} d={spiral(p.r + 6, 102, 0.8, d, 50)} stroke={p.v.color} strokeOpacity={0.3} strokeWidth={9} />
              ))}
            </G>
          </Spin>
        </FxExtent>
      </Plane>,
    )}
    {[0, 0.33, 0.66].map((ph, i) => (
      <Particles key={ph} mode="spiral" half={p.half} count={14} period={8000} colors={[W, i === 1 ? c2(p) : p.v.color]} size={[2.1, 4.1]} radius={[p.r * 0.8, 104]} tilt={SQ} plane={PLANE} turns={1.2} phaseShift={ph} trail={2} seed={57} />
    ))}
    <Extra>{F(p, <Particles mode="twinkle" count={10} period={3200} colors={[W]} size={[2.3, 4.1]} radius={[60, 108]} sparkle seed={59} />)}</Extra>
  </>
);

/** Fitas de Aurora — fitas de luz presas aos polos, ondulando devagar. */
const AuroraRastro: DepthRender = (p) => {
  const ribbon = (y: number, amp: number, waves: number, phase: number) => {
    let d = '';
    for (let x = -96; x <= 96; x += 6) {
      const k = 1 - Math.pow(x / 100, 2);
      d += `${x === -96 ? 'M' : 'L'}${(C + x).toFixed(1)} ${(C + y - k * 20 * Math.sign(y) * -1 + Math.sin((x / 96) * Math.PI * waves + phase) * amp * k).toFixed(1)} `;
    }
    return d;
  };
  return B(
    p,
    <>
      <FxExtent r={112}>
        {[-1, 1].map((side) => (
          <Sway key={side} period={6200 + side * 800} degrees={3} phase={side * 0.2} glow={{ period: 3800, opacity: [0.5, 1] }}>
            <G fill="none" strokeLinecap="round">
              {[0, 1, 2].map((i) => (
                <Path key={i} d={ribbon(side * (p.r + 14 + i * 13), 7 - i, 2 + i, i * 1.4)} stroke={i === 1 ? c2(p) : p.v.color} strokeOpacity={0.5 - i * 0.12} strokeWidth={9 - i * 2} />
              ))}
              <Path d={ribbon(side * (p.r + 14), 7, 2, 0)} stroke={W} strokeOpacity={0.6} strokeWidth={1} />
            </G>
          </Sway>
        ))}
      </FxExtent>
      <Particles mode="rise" count={14} period={4200} colors={[W, p.v.color]} size={[2, 3.4]} radius={[p.r, p.r + 40]} arc={[-50, 50]} travel={50} seed={61} />
      <Extra>
        <Particles mode="fall" count={12} period={4200} colors={[W, c2(p)]} size={[2, 3.4]} radius={[p.r, p.r + 40]} arc={[130, 230]} travel={50} seed={63} />
      </Extra>
    </>,
  );
};

/** Tempestade de Íons — faíscas em órbita rápida e descargas que saltam entre elas. */
const TempestadeIon: DepthRender = (p) => (
  <>
    <Particles mode="orbit" half={p.half} count={10} period={3400} colors={[W, p.v.color]} size={[2.6, 4.1]} radius={[80, 92]} tilt={0.4} plane={PLANE} trail={4} glow seed={65} />
    <Particles mode="orbit" half={p.half} count={8} period={4600} colors={[c2(p), W]} size={[2.6, 4.1]} radius={[62, 70]} tilt={0.5} plane={40} reverse trail={4} seed={67} />
    {F(
      p,
      <FxExtent r={112}>
        {[0, 0.2, 0.45, 0.7].map((ph, i) => (
          <Glimmer key={ph} period={2600} phase={ph} window={0.14} peak={1}>
            <Polyline points={lightning(30 + i * 85, p.r + 4, 100, 6, 9, 70 + i)} stroke={i % 2 ? W : p.v.color} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
          </Glimmer>
        ))}
      </FxExtent>,
    )}
  </>
);

// ————————————————————————————————————————————————————— lendários

/** Via Láctea — uma faixa densa de estrelas num plano inclinado, com braços que giram. */
const ViaLactea: DepthRender = (p) => (
  <>
    <Plane tilt={PLANE} squash={0.3} half={p.half}>
      <FxExtent r={112}>
        <Spin period={64000}>
          <G fill="none" strokeLinecap="round">
            {[0, 90, 180, 270].map((d, i) => (
              <Path key={d} d={spiral(p.r + 8, 108, 0.9, d, 60)} stroke={i % 2 ? c2(p) : p.v.color} strokeOpacity={0.3} strokeWidth={11} />
            ))}
            {[0, 90, 180, 270].map((d) => (
              <Path key={`l${d}`} d={spiral(p.r + 8, 108, 0.9, d, 60)} stroke={W} strokeOpacity={0.4} strokeWidth={0.9} strokeDasharray="1 5" />
            ))}
          </G>
        </Spin>
      </FxExtent>
    </Plane>
    <Particles mode="orbit" half={p.half} count={45} period={44000} colors={[W, p.v.color, c2(p), '#FFE7A3']} size={[1.6, 4.1]} radius={[p.r + 12, 108]} tilt={0.3} plane={PLANE} seed={71} />
    <Particles mode="orbit" half={p.half} count={12} period={30000} colors={[W]} size={[3.1, 4.9]} radius={[p.r + 20, 100]} tilt={0.3} plane={PLANE} sparkle glow seed={73} />
    {F(
      p,
      <Extra min={0.8}>
        <Particles mode="twinkle" count={15} period={3600} colors={[W, '#FFE7A3']} size={[2.1, 3.8]} radius={[40, 112]} sparkle seed={75} />
      </Extra>,
    )}
  </>
);

/** Eco do Big Bang — tudo cai para um ponto, e do ponto tudo volta a sair: de novo, e de novo. */
const BigBang: DepthRender = (p) =>
  F(
    p,
    <>
      <Particles mode="converge" count={24} period={5200} colors={[W, p.v.color]} size={[2.1, 4.1]} radius={[p.r * 1.4, 112]} trail={3} seed={77} />
      <Particles mode="radial" count={27} period={5200} colors={[W, c2(p), p.v.color]} size={[2.3, 4.6]} radius={[p.r * 0.6, 112]} phaseShift={0.5} sparkle glow trail={2} seed={79} />
      <FxExtent r={112}>
        {[0.5, 0.62].map((ph) => (
          <Wave key={ph} period={5200} phase={ph} from={p.r * 0.5} to={110} drawnAt={70} peak={0.75} hold={0.55}>
            <Circle cx={C} cy={C} r={70} stroke={W} strokeWidth={2} fill="none" />
            <Circle cx={C} cy={C} r={66} stroke={p.v.color} strokeWidth={4} strokeOpacity={0.5} fill="none" />
          </Wave>
        ))}
        <Breathe period={5200} phase={0.5} scale={[0.4, 1.3]} opacity={[0, 0.8]}>
          <Circle cx={C} cy={C} r={p.r * 0.9} fill={W} fillOpacity={0.3} />
        </Breathe>
      </FxExtent>
      <Extra min={0.8}>
        <Particles mode="twinkle" count={12} period={5200} colors={[W]} size={[2.6, 4.6]} radius={[50, 110]} sparkle seed={81} />
      </Extra>
    </>,
  );

export const TRAILS: Record<string, DepthRender> = {
  poeira: Poeira,
  orbital: Orbital,
  'brasas-rastro': Brasas,
  'neve-rastro': Neve,
  vento: Vento,
  bolhas: Bolhas,
  fagulhas: Fagulhas,
  cauda: Cauda,
  espiral: Espiral,
  chuva: Chuva,
  fonte: Fonte,
  'petalas-rastro': Petalas,
  pulso: Pulso,
  enxame: Enxame,
  helice: Helice,
  atomo: Atomo,
  lemniscata: Lemniscata,
  cascata: Cascata,
  'mare-poeira': MarePoeira,
  'raios-cosmicos': RaiosCosmicos,
  vortice: Vortice,
  'aurora-rastro': AuroraRastro,
  'tempestade-ion': TempestadeIon,
  'via-lactea': ViaLactea,
  'big-bang': BigBang,
};

export function TrailFx(p: DepthProps) {
  const Render = p.v.fx ? TRAILS[p.v.fx] : undefined;
  return Render ? <Render {...p} /> : null;
}
