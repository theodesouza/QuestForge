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
import { Circle, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import { ELEMENT_LABEL, RARITY_TIER, getItem, type FxElement } from '../../content/items';
import type { Equipped } from '../../domain/game/types';
import { MYTHIC_COLOR } from '../theme';
import { RuneRing } from './cores';
import { Breathe, C, Glimmer, Particles, Spin, Wave } from './engine';
import { flame, lightning, polar, ray, star } from './geometry';

export type Synergy =
  | { kind: 'resonance'; element: FxElement; strength: number; color: string; color2: string; label: string }
  | { kind: 'refraction'; strength: number; color: string; color2: string; label: string }
  | { kind: 'mythic'; strength: number; color: string; color2: string; label: string };

/** Qual sinergia (se houver) o equipamento atual desperta. Função pura. */
export function resolveSynergy(equipped: Pick<Equipped, 'core' | 'aura'>): Synergy | null {
  if (!equipped.aura) return null;
  const core = getItem(equipped.core);
  const aura = getItem(equipped.aura);
  const ce = core.visual.element;
  const ae = aura.visual.element;
  if (!ce || !ae) return null;
  const strength = (RARITY_TIER[core.rarity] + RARITY_TIER[aura.rarity]) / 8; // 0..1
  const color = aura.visual.color;
  const color2 = aura.visual.color2 ?? core.visual.color;
  if (core.rarity === 'lendario' && aura.rarity === 'lendario') {
    return { kind: 'mythic', strength: 1, color: core.visual.color, color2: MYTHIC_COLOR, label: 'Forma Mítica · Ascensão' };
  }
  if (ce === 'cristal') return { kind: 'refraction', strength: 0.4 + strength * 0.6, color, color2, label: `Refração · o Quartzo assume a ${aura.name}` };
  if (ce === ae) return { kind: 'resonance', element: ce, strength: 0.45 + strength * 0.55, color, color2, label: `Ressonância ${resonanceName(ce)}` };
  return null;
}

function resonanceName(e: FxElement): string {
  return e === 'fogo' ? 'de Fogo' : e === 'mare' ? 'das Marés' : e === 'lunar' ? 'Lunar' : e === 'tempestade' ? 'da Tempestade' : e === 'astral' ? 'Astral' : e === 'aureo' ? 'Áurea' : ELEMENT_LABEL[e];
}

/** Camada da sinergia que fica entre o disco e o núcleo. */
export function SynergyFx({ s }: { s: Synergy }) {
  if (s.kind === 'mythic') return <MythicInner s={s} />;
  if (s.kind === 'refraction') return <Refraction s={s} />;
  return <Resonance s={s} />;
}

function Resonance({ s }: { s: Extract<Synergy, { kind: 'resonance' }> }) {
  const k = s.strength;
  switch (s.element) {
    case 'fogo':
      return (
        <>
          <Breathe period={1300} scale={[0.96, 1.05]} opacity={[0.5 * k, 0.95 * k]}>
            <G fill={s.color} fillOpacity={0.8}>
              {Array.from({ length: 10 }, (_, i) => (
                <Path key={i} d={flame(i * 36, 30, 10 + (i % 2) * 5, 18, i % 2 ? 6 : -6)} />
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
          <Wave period={3600} phase={0.5} from={22} to={84} drawnAt={50} peak={0.4 * k}>
            <Circle cx={C} cy={C} r={50} stroke={s.color2} strokeWidth={1.1} fill="none" />
          </Wave>
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
            <Glimmer key={i} period={3200} phase={ph} window={0.22} peak={0.95 * k}>
              <Polygon points={lightning(30 + i * 90, 20, 82, 7, 7, 300 + i * 13)} stroke="#E8FDFF" strokeWidth={1.3} fill="none" strokeLinejoin="round" />
              <Polygon points={lightning(30 + i * 90, 20, 82, 7, 7, 300 + i * 13)} stroke={s.color} strokeOpacity={0.6} strokeWidth={3.5} fill="none" strokeLinejoin="round" />
            </Glimmer>
          ))}
        </>
      );
    case 'astral':
      return <Constellation s={s} />;
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
      <Spin period={42000} reverse opacity={0.6}>
        <Polygon points={star(8, 76, 48)} stroke={s.color2} strokeWidth={1} fill="none" />
      </Spin>
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
