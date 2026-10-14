/**
 * O Astrolábio — avatar do jogador. Representa a evolução intelectual:
 * - a estrela interna ganha pontas a cada patente (triângulo → dodecagrama);
 * - o anel de escala ganha gravações a cada nível;
 * - estrelas orbitais marcam as patentes alcançadas;
 * - moldura, núcleo e aura são cosméticos equipáveis.
 */
import { memo, useEffect, useId, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { getItem } from '../content/items';
import type { Equipped } from '../domain/game/types';
import { rankFor } from '../domain/progression/levels';
import { colors } from './theme';

interface Props {
  level: number;
  equipped: Equipped;
  size?: number;
  animate?: boolean;
}

const C = 100;

function polar(r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

function starPoints(points: number, outer: number, inner: number): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const p = polar(r, (360 / (points * 2)) * i);
    out.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }
  return out.join(' ');
}

export const Astrolabe = memo(function Astrolabe({ level, equipped, size = 200, animate = true }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const frame = getItem(equipped.frame).visual;
  const core = getItem(equipped.core).visual;
  const aura = equipped.aura ? getItem(equipped.aura).visual : null;
  const rank = rankFor(level).index;
  const starTips = Math.min(12, 3 + rank);
  const tickCount = Math.min(120, 24 + level * 2);

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

  const orbitStars = useMemo(
    () => Array.from({ length: rank }, (_, i) => polar(92, (360 / Math.max(rank, 1)) * i + 15)),
    [rank],
  );

  const spin = useSharedValue(0);
  const breath = useSharedValue(0);
  useEffect(() => {
    if (!animate) {
      cancelAnimation(spin);
      cancelAnimation(breath);
      spin.set(0);
      breath.set(0);
      return;
    }
    spin.set(withRepeat(withTiming(360, { duration: 90000, easing: Easing.linear }), -1, false));
    breath.set(withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => {
      cancelAnimation(spin);
      cancelAnimation(breath);
    };
  }, [animate, spin, breath]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const counterStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-spin.value * 1.6}deg` }] }));
  const auraStyle = useAnimatedStyle(() => ({
    opacity: 0.75 + breath.value * 0.25,
    transform: [{ scale: 0.97 + breath.value * 0.05 }],
  }));

  const frameColor = frame.color;
  const layer = { position: 'absolute' as const, width: size, height: size };

  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel={`Astrolábio de nível ${level}`}>
      {/* Aura */}
      <Animated.View style={[layer, auraStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id={`aura${uid}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0.7" stopColor={aura?.color ?? colors.mist} stopOpacity={aura ? 0.75 : 0.14} />
              <Stop offset="0.86" stopColor={aura?.color2 ?? aura?.color ?? colors.mist} stopOpacity={aura ? 0.4 : 0.06} />
              <Stop offset="1" stopColor={aura?.color2 ?? colors.ink900} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={C} cy={C} r={100} fill={`url(#aura${uid})`} />
        </Svg>
      </Animated.View>

      {/* Base fixa: moldura, núcleo, estrelas orbitais */}
      <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id={`disc${uid}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.ink700} />
            <Stop offset="1" stopColor={colors.ink850} />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C} r={84} fill={`url(#disc${uid})`} />
        <Circle cx={C} cy={C} r={84} stroke={frameColor} strokeWidth={3} fill="none" />
        {frame.frameStyle === 'double' || frame.frameStyle === 'armillary' ? (
          <Circle cx={C} cy={C} r={79} stroke={frameColor} strokeOpacity={0.55} strokeWidth={1.2} fill="none" />
        ) : null}
        {frame.frameStyle === 'notched'
          ? Array.from({ length: 8 }, (_, i) => {
              const a = polar(84, i * 45 + 22.5);
              return <Circle key={i} cx={a.x} cy={a.y} r={3.2} fill={frame.color2 ?? frameColor} />;
            })
          : null}
        {frame.frameStyle === 'armillary' ? (
          <G stroke={frame.color2 ?? frameColor} strokeOpacity={0.7} strokeWidth={1.2} fill="none">
            <Ellipse cx={C} cy={C} rx={90} ry={30} transform={`rotate(-24 ${C} ${C})`} />
            <Ellipse cx={C} cy={C} rx={90} ry={30} transform={`rotate(24 ${C} ${C})`} />
          </G>
        ) : null}
        {orbitStars.map((p, i) => (
          <G key={i}>
            <Circle cx={p.x} cy={p.y} r={4.5} fill={colors.brass} fillOpacity={0.18} />
            <Circle cx={p.x} cy={p.y} r={2.2} fill={colors.brass} />
          </G>
        ))}
      </Svg>

      {/* Anel de escala (gira devagar) */}
      <Animated.View style={[layer, spinStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <G stroke={frameColor} strokeLinecap="round">
            {ticks.map((t, i) => (
              <Line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 1.6 : 0.8} strokeOpacity={t.major ? 0.95 : 0.55} />
            ))}
          </G>
          <Line x1={C} y1={C - 62} x2={C} y2={C + 62} stroke={colors.parchment} strokeOpacity={0.35} strokeWidth={1} />
        </Svg>
      </Animated.View>

      {/* Rete: estrela que evolui com as patentes (contra-rotação) */}
      <Animated.View style={[layer, counterStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Polygon
            points={starPoints(starTips, 56, 26)}
            fill={colors.brass}
            fillOpacity={0.07}
            stroke={colors.brass}
            strokeOpacity={0.85}
            strokeWidth={1.3}
            strokeLinejoin="round"
          />
          <Circle cx={C} cy={C} r={40} stroke={colors.parchment} strokeOpacity={0.18} strokeWidth={1} fill="none" strokeDasharray="2 4" />
        </Svg>
      </Animated.View>

      {/* Núcleo */}
      <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id={`core${uid}`} cx="40%" cy="38%" r="65%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
            <Stop offset="0.35" stopColor={core.color} />
            <Stop offset="1" stopColor={core.color2 ?? core.color} />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C} r={22} fill={core.color} fillOpacity={0.16} />
        <Circle cx={C} cy={C} r={15} fill={`url(#core${uid})`} stroke={colors.ink900} strokeWidth={1.5} />
      </Svg>
    </View>
  );
});
