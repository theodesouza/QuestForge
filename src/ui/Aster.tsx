/**
 * O Áster — o astro do jogador (substitui o Astrolábio). Um corpo celeste com volume, cercado por
 * estruturas que passam por trás e pela frente dele.
 *
 * O que vem do JOGADOR, sem depender de peças (a evolução se vê de longe):
 *  - nível    → o corpo ganha massa (raio 30 → 38) e o cinturão de poeira fica mais denso;
 *  - patente  → a cada patente, um traço novo (ver `traitsFor`): cinturão, luas, arcos de maré,
 *               jatos polares, coroa, anel do zênite;
 *  - chefões  → uma estrela acesa na coroa para cada chefão vencido.
 *
 * O que vem das PEÇAS (nove espaços): núcleo, anel, campo, satélite, rastro, gravidade, ambiente
 * (desenhado pelo SceneStage), ignição e título (texto, fora daqui).
 *
 * Ordem das passadas (o núcleo fica no meio): gravidade → campo de trás → metade de trás de anel,
 * satélites e rastro → NÚCLEO → metade da frente → campo da frente → sinergia → coroa → ignição.
 *
 * `size` é o lado do palco (240 unidades). Animado, cada efeito é uma camada própria (só transform e
 * opacity mudam, no thread de UI); parado (movimento reduzido, miniaturas) tudo vira UM SVG.
 */
import { memo, useEffect, useId, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { RARITY_TIER, getItem } from '../content/items';
import type { EffectsLevel, Equipped } from '../domain/game/types';
import { rankFor } from '../domain/progression/levels';
import { useGameStore } from '../state/store';
import { colors } from './theme';
import { AuraBack, AuraFront } from './vfx/auras';
import { BodyFx } from './vfx/bodies';
import { Breathe, C, Extra, FxExtent, FxProvider, Layer, Particles, STAGE, Spin } from './vfx/engine';
import { arc, polar } from './vfx/geometry';
import { IgnitionFx } from './vfx/ignitions';
import { LensFx } from './vfx/lenses';
import { OrbiterFx } from './vfx/orbiters';
import { RingFx } from './vfx/rings';
import { Orbiter, Plane, type Half } from './vfx/space';
import { MythicBack, SynergyFx, resolveSynergy } from './vfx/synergy';
import { TrailFx } from './vfx/trails';

interface Props {
  level: number;
  equipped: Equipped;
  size?: number;
  animate?: boolean;
  /** Força uma intensidade (prévia); senão usa a dos Ajustes. */
  effects?: EffectsLevel;
  /** Tela fora de foco ou coberta: congela as animações (sem desmontar). */
  paused?: boolean;
  /** Chefões já vencidos (0–9): estrelas acesas na coroa. */
  trophies?: number;
  /** Mudou → o Áster se acende de novo (toque, XP ganho). A troca de peça já dispara sozinha. */
  igniteKey?: number | string;
}

export const DENSITY: Record<EffectsLevel, number> = { alto: 1, medio: 0.65, baixo: 0.35 };

/** Raio do corpo: cresce com o nível (massa acumulada). */
export function bodyRadius(level: number): number {
  return 30 + (8 * (Math.min(50, Math.max(1, level)) - 1)) / 49;
}

/** Traços que a patente dá ao Áster. A ordem é a da conquista. */
export interface Traits {
  belt: boolean;
  beltDouble: boolean;
  moons: number;
  tides: boolean;
  jets: boolean;
  crown: boolean;
  zenith: boolean;
}

export function traitsFor(level: number): Traits {
  const rank = rankFor(level).index;
  return {
    belt: rank >= 1,
    moons: (rank >= 2 ? 1 : 0) + (rank >= 4 ? 1 : 0) + (rank >= 6 ? 1 : 0) + (rank >= 8 ? 1 : 0),
    tides: rank >= 3,
    beltDouble: rank >= 5,
    jets: rank >= 7,
    crown: rank >= 9,
    zenith: rank >= 10,
  };
}

/** O que cada patente acrescenta, em palavras (tela do Áster). Índice = patente. */
export const RANK_TRAIT_LABEL: readonly string[] = [
  'um corpo recém-aceso, com um halo de lente',
  'um cinturão de poeira em órbita',
  'a primeira lua de patente',
  'arcos de maré girando em volta',
  'a segunda lua, em outro plano',
  'um cinturão duplo, mais denso',
  'a terceira lua',
  'jatos polares',
  'a quarta lua, em órbita retrógrada',
  'uma coroa de estrelas fixas',
  'o anel do zênite',
];

const BELT_TILT = -18;
const BELT_SQUASH = 0.3;
const MOONS = [
  { r: 66, plane: -18, squash: 0.32, period: 15000, phase: 0.1, reverse: false },
  { r: 80, plane: 26, squash: 0.26, period: 23000, phase: 0.55, reverse: true },
  { r: 57, plane: -52, squash: 0.48, period: 11500, phase: 0.8, reverse: false },
  { r: 93, plane: -6, squash: 0.2, period: 31000, phase: 0.3, reverse: true },
] as const;
/** Assentos da coroa (um por chefão), num arco no alto. */
const SEATS = [0, -22, 22, -44, 44, -66, 66, -88, 88] as const;

export const Aster = memo(function Aster({ level, equipped, size = 240, animate = true, effects, paused = false, trophies = 0, igniteKey }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const setting = useGameStore((s) => s.game?.profile.settings.effects ?? 'medio');
  const level_ = effects ?? setting;
  const density = DENSITY[level_];
  const coreItem = getItem(equipped.core);
  const core = coreItem.visual;
  const ringItem = getItem(equipped.frame);
  const auraItem = equipped.aura ? getItem(equipped.aura) : null;
  const orbiterItem = equipped.orbiter ? getItem(equipped.orbiter) : null;
  const trailItem = equipped.trail ? getItem(equipped.trail) : null;
  const lensItem = equipped.lens ? getItem(equipped.lens) : null;
  const ignitionItem = equipped.ignition ? getItem(equipped.ignition) : null;
  const synergy = useMemo(() => resolveSynergy(equipped), [equipped]);
  const traits = useMemo(() => traitsFor(level), [level]);
  const R = bodyRadius(level);
  const flat = !animate;
  const fx = useMemo(() => ({ animate, density, px: size, flat, paused }), [animate, density, size, flat, paused]);
  const tone = core.color;
  const tone2 = ringItem.visual.color;

  // Ignição: ao trocar de peça, ao toque e ao ganhar XP (igniteKey). Não dispara na primeira montagem.
  const ignite = useSharedValue(0);
  const equipKey = `${equipped.frame}|${equipped.core}|${equipped.aura ?? ''}|${equipped.orbiter ?? ''}|${equipped.trail ?? ''}|${equipped.lens ?? ''}|${equipped.ignition ?? ''}|${igniteKey ?? ''}`;
  const [seenKey, setSeenKey] = useState(equipKey);
  const [igniting, setIgniting] = useState(false);
  if (seenKey !== equipKey) {
    setSeenKey(equipKey);
    if (animate) setIgniting(true);
  }
  useEffect(() => {
    if (!igniting) return;
    ignite.set(0);
    ignite.set(withTiming(1, { duration: 1500, easing: Easing.linear }));
    const t = setTimeout(() => setIgniting(false), 1560);
    return () => clearTimeout(t);
  }, [igniting, equipKey, ignite]);
  // O corpo cresce um pouco e volta enquanto se acende (sem mola).
  const corePop = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.07 * Math.sin(Math.PI * Math.min(1, ignite.value * 1.6)) }] }));

  // Forma Mítica: o Áster levita.
  const bob = useSharedValue(0);
  const mythic = synergy?.kind === 'mythic';
  useEffect(() => {
    if (!mythic || !animate) {
      cancelAnimation(bob);
      bob.set(0);
      return;
    }
    if (paused) {
      cancelAnimation(bob);
      return;
    }
    bob.set(withRepeat(withSequence(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })), -1, false));
    return () => cancelAnimation(bob);
  }, [mythic, animate, paused, bob]);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (bob.value - 0.5) * size * 0.022 }] }));

  const tint = core.element === 'cristal' && auraItem ? auraItem.visual.color : null;
  const depth = (half: Half & ('back' | 'front')) => (
    <>
      <Belt half={half} tone={tone} tone2={tone2} bands={traits.belt ? (traits.beltDouble ? 2 : 1) : 0} level={level} r={R} />
      <RingFx item={ringItem} half={half} r={R} />
      {orbiterItem ? <OrbiterFx v={orbiterItem.visual} half={half} r={R} tier={RARITY_TIER[orbiterItem.rarity]} /> : null}
      <RankMoons count={traits.moons} half={half} tone={tone} density={density} />
      {trailItem ? <TrailFx v={trailItem.visual} half={half} r={R} tier={RARITY_TIER[trailItem.rarity]} /> : null}
    </>
  );

  const body = (
    <>
      {synergy ? <MythicBack s={synergy} /> : null}
      <Well uid={uid} />
      {lensItem ? <LensFx v={lensItem.visual} r={R} tier={RARITY_TIER[lensItem.rarity]} /> : <InnateLens uid={uid} tone={tone} r={R} tides={traits.tides} />}
      {auraItem ? <AuraBack v={auraItem.visual} /> : null}
      {traits.jets ? <Jets uid={uid} tone={tone} r={R} /> : null}
      {depth('back')}

      {flat ? (
        <BodyFx v={core} r={R} tint={tint} tier={RARITY_TIER[coreItem.rarity]} />
      ) : (
        <Animated.View style={[StyleSheet.absoluteFill, corePop]} pointerEvents="none">
          <BodyFx v={core} r={R} tint={tint} tier={RARITY_TIER[coreItem.rarity]} />
        </Animated.View>
      )}
      {synergy ? <SynergyFx s={synergy} /> : null}

      {depth('front')}
      {auraItem ? <AuraFront v={auraItem.visual} /> : null}
      {trophies > 0 || traits.crown ? <Crown lit={Math.min(9, trophies)} linked={traits.crown} tone={tone} /> : null}
      {traits.zenith ? <Zenith tone={tone2} /> : null}
    </>
  );

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="image"
      accessibilityLabel={`Áster de nível ${level}${synergy ? `, ${synergy.label}` : ''}`}
    >
      <FxProvider value={fx}>
        {flat ? (
          // Parado: um único SVG com todas as camadas (um bitmap só no Android).
          <Svg width={size} height={size} viewBox={`0 0 ${STAGE} ${STAGE}`} pointerEvents="none">
            {body}
          </Svg>
        ) : (
          <Animated.View style={[StyleSheet.absoluteFill, bobStyle]}>
            {body}
            {igniting ? <IgnitionFx v={ignitionItem?.visual ?? null} clock={ignite} tone={auraItem?.visual.color ?? tone} r={R} /> : null}
          </Animated.View>
        )}
      </FxProvider>
    </View>
  );
});

// ————————————————————————————————————————————————————— traços de patente

/** Poço de gravidade: o espaço escurece em direção ao corpo (dá fundo ao que orbita e contraste sobre qualquer ambiente). */
function Well({ uid }: { uid: string }) {
  return (
    <FxExtent r={86}>
      <Layer>
        <Defs>
          <RadialGradient id={`well${uid}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#04060F" stopOpacity={0.78} />
            <Stop offset="0.55" stopColor="#060A18" stopOpacity={0.5} />
            <Stop offset="0.9" stopColor="#0B1020" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#0B1020" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C} r={84} fill={`url(#well${uid})`} />
      </Layer>
    </FxExtent>
  );
}

/** Sem peça de gravidade: um halo de lente fino (a luz de trás dobrada em volta do corpo) e, na patente certa, arcos de maré. */
function InnateLens({ uid, tone, r, tides }: { uid: string; tone: string; r: number; tides: boolean }) {
  const R = r + 20;
  return (
    <>
      <FxExtent r={R + 8}>
        <Breathe period={5200} opacity={[0.5, 0.95]} scale={[0.985, 1.02]}>
          <Defs>
            <RadialGradient id={`lens${uid}`} cx="50%" cy="50%" r="50%">
              <Stop offset={(r + 2) / (R + 6)} stopColor={tone} stopOpacity={0.2} />
              <Stop offset={(R - 4) / (R + 6)} stopColor={tone} stopOpacity={0.03} />
              <Stop offset="1" stopColor={tone} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={C} cy={C} r={R + 6} fill={`url(#lens${uid})`} />
          <Path d={arc(R, 200, 340)} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={0.9} fill="none" strokeLinecap="round" />
          <Path d={arc(R, 20, 160)} stroke={tone} strokeOpacity={0.55} strokeWidth={0.9} fill="none" strokeLinecap="round" />
          <Path d={arc(R - 3, 232, 308)} stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={0.6} fill="none" strokeLinecap="round" />
        </Breathe>
      </FxExtent>
      {tides ? (
        <FxExtent r={r + 14}>
          <Spin period={38000} reverse opacity={0.8}>
            <G stroke={tone} strokeWidth={1.3} strokeLinecap="round" fill="none">
              {[0, 120, 240].map((d) => (
                <Path key={d} d={arc(r + 10, d + 8, d + 62)} strokeOpacity={0.6} />
              ))}
              {[0, 120, 240].map((d) => {
                const p = polar(r + 10, d + 8);
                return <Circle key={`c${d}`} cx={p.x} cy={p.y} r={1.5} fill={tone} stroke="none" />;
              })}
            </G>
          </Spin>
        </FxExtent>
      ) : null}
    </>
  );
}

/** Cinturão de poeira: faixas finas num plano inclinado (giram) e grãos em órbita. */
function Belt({ half, tone, tone2, bands, level, r }: { half: 'back' | 'front'; tone: string; tone2: string; bands: number; level: number; r: number }) {
  const r0 = r + 13;
  const double = bands >= 2;
  return (
    <>
      {bands > 0 ? (
      <Plane tilt={BELT_TILT} squash={BELT_SQUASH} half={half}>
        <FxExtent r={r0 + 16}>
          <Spin period={46000}>
            <G fill="none" strokeLinecap="round">
              <Circle cx={C} cy={C} r={r0} stroke={tone} strokeOpacity={0.5} strokeWidth={1.6} strokeDasharray="26 5 9 4 40 7" />
              <Circle cx={C} cy={C} r={r0 + 4} stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={0.8} strokeDasharray="3 6 14 5" />
              {double ? (
                <>
                  <Circle cx={C} cy={C} r={r0 + 9} stroke={tone2} strokeOpacity={0.42} strokeWidth={2.2} strokeDasharray="34 6 12 8" />
                  <Circle cx={C} cy={C} r={r0 + 13} stroke={tone} strokeOpacity={0.25} strokeWidth={0.8} />
                </>
              ) : null}
            </G>
          </Spin>
        </FxExtent>
      </Plane>
      ) : null}
      <Particles
        mode="orbit"
        half={half}
        count={4 + Math.round(level / 6)}
        period={26000}
        colors={['#FFFFFF', tone, tone2]}
        size={[1.4, 2.6]}
        radius={[r0 - 1, r0 + (double ? 13 : 5)]}
        tilt={BELT_SQUASH}
        plane={BELT_TILT}
        seed={41}
      />
    </>
  );
}

/** Luas de patente: esferas pequenas em órbitas de planos diferentes. */
function RankMoons({ count, half, tone, density }: { count: number; half: 'back' | 'front'; tone: string; density: number }) {
  const n = density < 0.5 ? Math.min(2, count) : count;
  return (
    <>
      {MOONS.slice(0, n).map((m, i) => (
        <Orbiter key={i} r={m.r} plane={m.plane} squash={m.squash} period={m.period} phase={m.phase} reverse={m.reverse} box={10} half={half} depth={[0.7, 1.15]}>
          <Circle cx={5} cy={5} r={4.4} fill={tone} fillOpacity={0.16} />
          <Circle cx={5} cy={5} r={2.6} fill={i % 2 ? '#DCE3FF' : colors.parchment} />
          <Circle cx={5.9} cy={5.9} r={2.2} fill="#0B1020" fillOpacity={0.42} />
          <Circle cx={4.1} cy={4.1} r={0.8} fill="#FFFFFF" fillOpacity={0.9} />
        </Orbiter>
      ))}
    </>
  );
}

/** Jatos polares: dois feixes suaves ao longo do eixo do cinturão. */
function Jets({ uid, tone, r }: { uid: string; tone: string; r: number }) {
  return (
    <Extra min={0.5}>
      <FxExtent r={r + 46}>
        <Breathe period={3400} opacity={[0.45, 0.9]} scale={[0.97, 1.04]}>
          <Defs>
            <LinearGradient id={`jet${uid}`} x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.75} />
              <Stop offset="0.35" stopColor={tone} stopOpacity={0.45} />
              <Stop offset="1" stopColor={tone} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <G transform={`rotate(${BELT_TILT} ${C} ${C})`}>
            <Polygon points={`${C - 3},${C - r + 2} ${C + 3},${C - r + 2} ${C + 8},${C - r - 42} ${C - 8},${C - r - 42}`} fill={`url(#jet${uid})`} />
            <G transform={`rotate(180 ${C} ${C})`}>
              <Polygon points={`${C - 3},${C - r + 2} ${C + 3},${C - r + 2} ${C + 8},${C - r - 42} ${C - 8},${C - r - 42}`} fill={`url(#jet${uid})`} />
            </G>
            <Line x1={C} y1={C - r} x2={C} y2={C - r - 36} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={0.8} />
            <Line x1={C} y1={C + r} x2={C} y2={C + r + 36} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={0.8} />
          </G>
        </Breathe>
      </FxExtent>
    </Extra>
  );
}

/** Coroa: um assento por chefão, num arco no alto; acesos os já vencidos. Na patente da coroa, os assentos se ligam. */
function Crown({ lit, linked, tone }: { lit: number; linked: boolean; tone: string }) {
  const RC = 108;
  return (
    <Layer>
      {linked ? <Path d={arc(RC, -96, 96)} stroke={colors.brass} strokeOpacity={0.35} strokeWidth={0.7} fill="none" strokeDasharray="1.5 4" /> : null}
      {SEATS.map((deg, i) => {
        const on = i < lit;
        if (!on && !linked) return null;
        const p = polar(RC, deg);
        const s = on ? 3.4 : 1.8;
        return (
          <G key={deg} opacity={on ? 1 : 0.45}>
            {on ? <Circle cx={p.x} cy={p.y} r={5.5} fill={colors.brass} fillOpacity={0.2} /> : null}
            <Polygon
              points={`${p.x},${p.y - s} ${p.x + s * 0.34},${p.y - s * 0.34} ${p.x + s},${p.y} ${p.x + s * 0.34},${p.y + s * 0.34} ${p.x},${p.y + s} ${p.x - s * 0.34},${p.y + s * 0.34} ${p.x - s},${p.y} ${p.x - s * 0.34},${p.y - s * 0.34}`}
              fill={on ? colors.brass : tone}
            />
            {on ? <Circle cx={p.x} cy={p.y} r={0.9} fill="#FFFFFF" /> : null}
          </G>
        );
      })}
    </Layer>
  );
}

/** Anel do zênite: luz tracejada girando no limite do palco, com quatro marcas. */
function Zenith({ tone }: { tone: string }) {
  return (
    <Spin period={64000} opacity={0.9}>
      <Circle cx={C} cy={C} r={115} stroke={tone} strokeOpacity={0.5} strokeWidth={0.9} fill="none" strokeDasharray="2 5 18 5" />
      <Circle cx={C} cy={C} r={117.5} stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={0.5} fill="none" />
      {[0, 90, 180, 270].map((deg) => {
        const p = polar(115, deg);
        return <Polygon key={deg} points={`${p.x},${p.y - 3.4} ${p.x + 2.1},${p.y} ${p.x},${p.y + 3.4} ${p.x - 2.1},${p.y}`} fill="#FFFFFF" fillOpacity={0.9} />;
      })}
      <Ellipse cx={C} cy={C} rx={115} ry={115} stroke="none" fill="none" />
    </Spin>
  );
}
