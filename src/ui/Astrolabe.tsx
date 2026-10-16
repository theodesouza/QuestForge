/**
 * O Astrolábio — avatar do jogador. Representa a evolução intelectual:
 * - a estrela interna ganha pontas a cada patente (triângulo → dodecagrama);
 * - o anel de escala ganha gravações a cada nível;
 * - estrelas orbitais marcam as patentes alcançadas;
 * - moldura, núcleo e aura são cosméticos equipáveis, com efeitos que crescem com a
 *   raridade (src/ui/vfx) e sinergias entre núcleo e aura.
 *
 * `size` é o lado do palco inteiro (o disco ocupa 70% dele; o resto é da aura).
 */
import { memo, useEffect, useId, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { RARITY_TIER, getItem } from '../content/items';
import type { EffectsLevel, Equipped } from '../domain/game/types';
import { rankFor } from '../domain/progression/levels';
import { useGameStore } from '../state/store';
import { colors } from './theme';
import { AuraBack, AuraFront } from './vfx/auras';
import { CoreFx } from './vfx/cores';
import { Breathe, C, FxProvider, Layer, STAGE, Spin } from './vfx/engine';
import { ngon, polar, star } from './vfx/geometry';
import { MythicBack, SynergyFx, resolveSynergy } from './vfx/synergy';

interface Props {
  level: number;
  equipped: Equipped;
  size?: number;
  animate?: boolean;
  /** Força uma intensidade (prévia); senão usa a dos Ajustes. */
  effects?: EffectsLevel;
}

const DENSITY: Record<EffectsLevel, number> = { alto: 1, medio: 0.65, baixo: 0.35 };
const DISC = 84;
/** O núcleo é desenhado em escala própria: ele é o coração do avatar e precisa aparecer. */
const CORE_SCALE = 1.35;

export const Astrolabe = memo(function Astrolabe({ level, equipped, size = 240, animate = true, effects }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const setting = useGameStore((s) => s.game?.profile.settings.effects ?? 'alto');
  const level_ = effects ?? setting;
  const frameItem = getItem(equipped.frame);
  const frame = frameItem.visual;
  const frameTier = RARITY_TIER[frameItem.rarity];
  const core = getItem(equipped.core).visual;
  const auraItem = equipped.aura ? getItem(equipped.aura) : null;
  const synergy = useMemo(() => resolveSynergy(equipped), [equipped]);
  const rank = rankFor(level).index;
  const starTips = Math.min(12, 3 + rank);
  const tickCount = Math.min(120, 24 + level * 2);
  const fx = useMemo(() => ({ animate, density: DENSITY[level_], px: size }), [animate, level_, size]);

  const ticks = useMemo(() => {
    const list: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];
    for (let i = 0; i < tickCount; i++) {
      const deg = (360 / tickCount) * i;
      const major = i % Math.max(1, Math.round(tickCount / 12)) === 0;
      const a = polar(major ? 66 : 70, deg);
      const b = polar(75, deg);
      list.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, major });
    }
    return list;
  }, [tickCount]);
  const orbitStars = useMemo(() => Array.from({ length: rank }, (_, i) => polar(92, (360 / Math.max(rank, 1)) * i + 15)), [rank]);

  // Troca de equipamento: clarão + o núcleo "acende" (não dispara na primeira montagem).
  const burst = useSharedValue(0);
  const equipKey = `${equipped.frame}|${equipped.core}|${equipped.aura ?? ''}`;
  const lastKey = useRef(equipKey);
  useEffect(() => {
    if (lastKey.current === equipKey) return;
    lastKey.current = equipKey;
    if (!animate) return;
    burst.set(0);
    burst.set(withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) }));
  }, [equipKey, animate, burst]);
  const burstRing = useAnimatedStyle(() => ({
    opacity: burst.value > 0 && burst.value < 1 ? (1 - burst.value) * 0.9 : 0,
    transform: [{ scale: 0.25 + burst.value * 1.05 }],
  }));
  const corePop = useAnimatedStyle(() => ({ transform: [{ scale: CORE_SCALE * (1 + 0.28 * Math.sin(Math.PI * burst.value)) }] }));

  // Forma Mítica: o astrolábio levita.
  const bob = useSharedValue(0);
  const mythic = synergy?.kind === 'mythic';
  useEffect(() => {
    if (!mythic || !animate) {
      cancelAnimation(bob);
      bob.set(0);
      return;
    }
    bob.set(withRepeat(withSequence(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })), -1, false));
    return () => cancelAnimation(bob);
  }, [mythic, animate, bob]);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (bob.value - 0.5) * size * 0.022 }] }));

  const tint = core.element === 'cristal' && auraItem ? auraItem.visual.color : null;
  const studColor = frame.color2 ?? frame.color;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="image"
      accessibilityLabel={`Astrolábio de nível ${level}${synergy ? `, ${synergy.label}` : ''}`}
    >
      <FxProvider value={fx}>
        <Animated.View style={[StyleSheet.absoluteFill, bobStyle]}>
          {synergy ? <MythicBack s={synergy} /> : null}
          {auraItem ? <AuraBack v={auraItem.visual} /> : <IdleHalo uid={uid} />}

          {/* Disco, moldura e estrelas de patente */}
          <Layer>
            <Defs>
              <RadialGradient id={`disc${uid}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.ink700} />
                <Stop offset="1" stopColor={colors.ink850} />
              </RadialGradient>
            </Defs>
            <Circle cx={C} cy={C} r={DISC} fill={`url(#disc${uid})`} />
            <Circle cx={C} cy={C} r={DISC} stroke={frame.color} strokeWidth={3} fill="none" />
            {frame.frameStyle === 'double' || frame.frameStyle === 'armillary' ? (
              <Circle cx={C} cy={C} r={DISC - 5} stroke={frame.color} strokeOpacity={0.55} strokeWidth={1.2} fill="none" />
            ) : null}
            {frame.frameStyle === 'armillary' && frameTier < 3 ? <Armillary color={studColor} /> : null}
            {orbitStars.map((p, i) => (
              <G key={i}>
                <Circle cx={p.x} cy={p.y} r={4.5} fill={colors.brass} fillOpacity={0.18} />
                <Circle cx={p.x} cy={p.y} r={2.2} fill={colors.brass} />
              </G>
            ))}
          </Layer>
          {frame.frameStyle === 'notched' ? (
            frameTier >= 2 ? (
              <Breathe period={2800} opacity={[0.55, 1]}>
                <Studs color={studColor} />
              </Breathe>
            ) : (
              <Layer>
                <Studs color={studColor} />
              </Layer>
            )
          ) : null}
          {frame.frameStyle === 'armillary' && frameTier >= 3 ? (
            <>
              <Spin period={30000}>
                <Ellipse cx={C} cy={C} rx={90} ry={30} stroke={studColor} strokeOpacity={0.75} strokeWidth={1.3} fill="none" transform={`rotate(-24 ${C} ${C})`} />
              </Spin>
              <Spin period={44000} reverse>
                <Ellipse cx={C} cy={C} rx={90} ry={30} stroke={frame.color} strokeOpacity={0.7} strokeWidth={1.3} fill="none" transform={`rotate(24 ${C} ${C})`} />
              </Spin>
            </>
          ) : null}

          {/* Anel de escala (gira devagar) */}
          <Spin period={90000}>
            <G stroke={frame.color} strokeLinecap="round">
              {ticks.map((t, i) => (
                <Line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 1.6 : 0.8} strokeOpacity={t.major ? 0.95 : 0.55} />
              ))}
            </G>
            <Line x1={C} y1={C - 62} x2={C} y2={C + 62} stroke={colors.parchment} strokeOpacity={0.35} strokeWidth={1} />
          </Spin>

          {/* Rete: estrela que evolui com as patentes (contra-rotação) */}
          <Spin period={56000} reverse>
            <Polygon points={star(starTips, 58, 30)} fill={colors.brass} fillOpacity={0.05} stroke={colors.brass} strokeOpacity={0.5} strokeWidth={1.1} strokeLinejoin="round" />
            <Circle cx={C} cy={C} r={40} stroke={colors.parchment} strokeOpacity={0.18} strokeWidth={1} fill="none" strokeDasharray="2 4" />
          </Spin>

          {synergy ? <SynergyFx s={synergy} /> : null}

          <Animated.View style={[StyleSheet.absoluteFill, corePop]} pointerEvents="none">
            <CoreFx v={core} tint={tint} />
          </Animated.View>

          {auraItem ? <AuraFront v={auraItem.visual} /> : null}

          <Animated.View style={[StyleSheet.absoluteFill, burstRing]} pointerEvents="none">
            <Svg width={size} height={size} viewBox={`0 0 ${STAGE} ${STAGE}`}>
              <Circle cx={C} cy={C} r={100} stroke="#FFFFFF" strokeWidth={3} fill="none" />
              <Circle cx={C} cy={C} r={92} stroke={auraItem?.visual.color ?? core.color} strokeWidth={6} strokeOpacity={0.6} fill="none" />
            </Svg>
          </Animated.View>
        </Animated.View>
      </FxProvider>
    </View>
  );
});

/** Sem aura: só um halo discreto (o astrolábio "nu"). */
function IdleHalo({ uid }: { uid: string }) {
  return (
    <Layer>
      <Defs>
        <RadialGradient id={`idle${uid}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0.66" stopColor={colors.mist} stopOpacity={0.12} />
          <Stop offset="0.85" stopColor={colors.mist} stopOpacity={0.05} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={C} cy={C} r={108} fill={`url(#idle${uid})`} />
    </Layer>
  );
}

function Studs({ color }: { color: string }) {
  return (
    <G>
      {Array.from({ length: 8 }, (_, i) => {
        const a = polar(DISC, i * 45 + 22.5);
        return (
          <G key={i}>
            <Circle cx={a.x} cy={a.y} r={5.5} fill={color} fillOpacity={0.18} />
            <Polygon points={ngon(4, 3.6, 0).replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${(Number(x) - C + a.x).toFixed(2)},${(Number(y) - C + a.y).toFixed(2)}`)} fill={color} />
          </G>
        );
      })}
    </G>
  );
}

function Armillary({ color }: { color: string }) {
  return (
    <G stroke={color} strokeOpacity={0.7} strokeWidth={1.2} fill="none">
      <Ellipse cx={C} cy={C} rx={90} ry={30} transform={`rotate(-24 ${C} ${C})`} />
      <Ellipse cx={C} cy={C} rx={90} ry={30} transform={`rotate(24 ${C} ${C})`} />
    </G>
  );
}
