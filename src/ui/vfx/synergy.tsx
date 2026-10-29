/**
 * Sinergias entre núcleo e aura — um sistema, não combinações feitas à mão:
 * - Ressonância: núcleo e aura do mesmo elemento ganham um efeito que liga os dois
 *   (um por elemento), mais forte quanto maior a raridade somada.
 * - Refração: o núcleo de Cristal (Quartzo) assume a cor de qualquer aura e lança
 *   feixes coloridos.
 * - Forma Mítica: núcleo lendário + aura lendária — coroa de runas, pilar de luz e
 *   levitação. É o topo da hierarquia visual.
 */
import { useId } from 'react';
import { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Polyline, Rect, Stop } from 'react-native-svg';
import { RuneRing } from './cores';
import { Breathe, C, Extra, FxExtent, Glimmer, Particles, Spin, Wave } from './engine';
import { flame, lightning, polar, ray, star } from './geometry';
import type { Synergy } from './rules';

export { resolveSynergy, type Synergy } from './rules';

/** Camada da sinergia que fica entre o disco e o núcleo. */
export function SynergyFx({ s }: { s: Synergy }) {
  // Tudo da camada interna fica dentro do disco (raio ≤ 84; a onda mítica chega a 84).
  return (
    <FxExtent r={90}>
      {s.kind === 'mythic' ? <MythicInner s={s} /> : s.kind === 'refraction' ? <Refraction s={s} /> : <Resonance s={s} />}
    </FxExtent>
  );
}

function Resonance({ s }: { s: Extract<Synergy, { kind: 'resonance' }> }) {
  const k = s.strength;
  switch (s.element) {
    case 'fogo':
      return (
        <>
          <Breathe period={1300} scale={[0.97, 1.05]} opacity={[0.45 * k, 0.9 * k]}>
            <G fill={s.color} fillOpacity={0.75}>
              {Array.from({ length: 12 }, (_, i) => (
                <Path key={i} d={flame(i * 30, 25, 6 + (i % 2) * 3, 12, i % 2 ? 4 : -4)} />
              ))}
            </G>
          </Breathe>
          <Particles mode="radial" count={Math.round(4 + 6 * k)} period={2600} colors={[s.color, s.color2, '#FFE08A']} size={[2.2, 3.4]} radius={[34, 82]} glow seed={201} />
        </>
      );
    case 'mare':
      return (
        <>
          <Wave period={3600} from={22} to={84} drawnAt={50} peak={0.5 * k}>
            <Circle cx={C} cy={C} r={50} stroke={s.color} strokeWidth={1.4} fill="none" />
          </Wave>
          <Extra>
            <Wave period={3600} phase={0.5} from={22} to={84} drawnAt={50} peak={0.4 * k}>
              <Circle cx={C} cy={C} r={50} stroke={s.color2} strokeWidth={1.1} fill="none" />
            </Wave>
          </Extra>
        </>
      );
    case 'lunar':
      return (
        <Spin period={12000} opacity={k}>
          <G fill="#E9F4FF">
            {Array.from({ length: 6 }, (_, i) => {
              const p = polar(58, i * 60 + 30);
              return <Polygon key={i} points={`${p.x},${p.y - 4} ${p.x + 2},${p.y} ${p.x},${p.y + 4} ${p.x - 2},${p.y}`} />;
            })}
          </G>
          <Circle cx={C} cy={C} r={58} stroke="#CFE6FF" strokeOpacity={0.35} strokeWidth={0.8} strokeDasharray="1 5" fill="none" />
        </Spin>
      );
    case 'tempestade':
      return (
        <>
          {[0, 0.25, 0.5, 0.75].map((ph, i) => (
            <Extra key={i} min={i % 2 ? 0.5 : 0}>
              <Glimmer period={3200} phase={ph} window={0.22} peak={0.95 * k}>
                <Polyline points={lightning(30 + i * 90, 20, 82, 7, 7, 300 + i * 13)} stroke={s.color} strokeOpacity={0.6} strokeWidth={3.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                <Polyline points={lightning(30 + i * 90, 20, 82, 7, 7, 300 + i * 13)} stroke="#E8FDFF" strokeWidth={1.3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
              </Glimmer>
            </Extra>
          ))}
        </>
      );
    case 'astral':
      return <Constellation s={s} />;
    case 'natureza':
      return (
        <>
          <Spin period={50000} opacity={0.55 + 0.45 * k}>
            <G fill={s.color} fillOpacity={0.75} stroke={s.color2} strokeOpacity={0.6} strokeWidth={0.6}>
              {Array.from({ length: 8 }, (_, i) => {
                const deg = i * 45;
                const p = polar(60, deg);
                return <Ellipse key={i} cx={p.x} cy={p.y} rx={8} ry={3.2} transform={`rotate(${deg - 90} ${p.x} ${p.y})`} />;
              })}
            </G>
            <Circle cx={C} cy={C} r={60} stroke={s.color2} strokeOpacity={0.3} strokeWidth={0.8} fill="none" />
          </Spin>
          <Particles mode="rise" count={Math.round(3 + 4 * k)} period={4200} colors={[s.color, s.color2, '#F4FFD0']} size={[2.2, 3.2]} radius={[34, 78]} travel={30} sparkle seed={231} />
        </>
      );
    case 'aureo':
      return (
        <Breathe period={3400} opacity={[0.45 * k, 0.95 * k]}>
          <G fill={s.color} fillOpacity={0.6}>
            {Array.from({ length: 8 }, (_, i) => (
              <Polygon key={i} points={ray(i * 45, 26, 80, 2.4)} />
            ))}
          </G>
          <Circle cx={C} cy={C} r={46} stroke={s.color2} strokeOpacity={0.6} strokeWidth={1.2} fill="none" />
        </Breathe>
      );
    default:
      return null;
  }
}

function Constellation({ s }: { s: Extract<Synergy, { kind: 'resonance' }> }) {
  const nodes = [0, 52, 118, 170, 236, 300].map((deg, i) => polar(i % 2 ? 66 : 54, deg));
  const d = nodes.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
  return (
    <>
      <Spin period={60000} opacity={s.strength}>
        <Path d={d} stroke={s.color} strokeOpacity={0.45} strokeWidth={0.8} fill="none" strokeDasharray="2 3" />
        <G fill="#FFFFFF">
          {nodes.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={1.8} />
          ))}
        </G>
      </Spin>
      <Particles mode="twinkle" count={4} period={2800} colors={['#FFFFFF', s.color2]} size={[3, 4.4]} radius={[46, 72]} sparkle seed={211} />
    </>
  );
}

/** Refração: feixes coloridos saindo do cristal, girando devagar. */
function Refraction({ s }: { s: Extract<Synergy, { kind: 'refraction' }> }) {
  const id = `rf${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Spin period={24000} opacity={0.75 * s.strength}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={s.color} stopOpacity={0.9} />
          <Stop offset="1" stopColor={s.color2} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <G fill={`url(#${id})`}>
        {[0, 120, 240].map((deg) => (
          <Polygon key={deg} points={ray(deg, 14, 70, 5)} />
        ))}
      </G>
    </Spin>
  );
}

/** Forma Mítica (camada interna): anel de runas, estrela sagrada e pulsos sincronizados. */
function MythicInner({ s }: { s: Extract<Synergy, { kind: 'mythic' }> }) {
  return (
    <>
      <Spin period={30000}>
        <RuneRing r={62} color="#FFE7F2" size={8} opacity={0.75} />
      </Spin>
      <Extra>
        <Spin period={42000} reverse opacity={0.6}>
          <Polygon points={star(8, 76, 48)} stroke={s.color2} strokeWidth={1} fill="none" />
        </Spin>
      </Extra>
      <Wave period={4800} from={20} to={84} drawnAt={50} peak={0.7} hold={0.3}>
        <Circle cx={C} cy={C} r={50} stroke="#FFFFFF" strokeWidth={1.6} fill="none" />
      </Wave>
      <Particles mode="converge" count={8} period={3600} colors={[s.color, s.color2, '#FFFFFF']} size={[2.4, 3.6]} radius={[24, 82]} glow seed={221} />
    </>
  );
}

/** Forma Mítica (camada de fundo): pilar de luz e coroa externa. */
export function MythicBack({ s }: { s: Synergy }) {
  const id = `mp${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  if (s.kind !== 'mythic') return null;
  return (
    <>
      <Breathe period={5200} opacity={[0.35, 0.75]}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.color2} stopOpacity={0} />
            <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.5} />
            <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0.5} />
            <Stop offset="1" stopColor={s.color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x={C - 16} y={0} width={32} height={240} fill={`url(#${id})`} />
      </Breathe>
      <Spin period={70000}>
        <Circle cx={C} cy={C} r={118} stroke={s.color2} strokeOpacity={0.55} strokeWidth={0.9} fill="none" strokeDasharray="1 3" />
        <G fill="#FFFFFF">
          {[0, 90, 180, 270].map((deg) => (
            <Polygon key={deg} points={star(4, 6, 1.6).replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${(Number(x) - C + polar(118, deg).x).toFixed(2)},${(Number(y) - C + polar(118, deg).y).toFixed(2)}`)} />
          ))}
        </G>
      </Spin>
    </>
  );
}
