import { useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import type { BossDef } from '../../content/bosses';
import { concreteLayers, facetHitsOf, headsFelled, hydraHeadsOf, knowledgeSeals, scalesOf, type BattleState } from '../../domain/boss/battle';
import { EASE_IN_OUT, EASE_OUT } from '../../ui/calm';
import { useReduceMotion } from '../../ui/feedback';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import { BossArt } from './BossArt';

/** Poucos planos vetoriais e transforms na UI thread; sem loop de renderização React. */
export function BossStage({ boss, battle, riddle = false }: { boss: BossDef; battle?: BattleState; riddle?: boolean }) {
  const reduce = useReduceMotion();
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const idle = useSharedValue(0);
  const recoil = useSharedValue(0);
  const burst = useSharedValue(0);
  const playedTurn = useRef(battle?.turns.length ?? 0);
  const won = battle?.status === 'won';
  const transformed = battle?.armorBroken ?? false;
  const turnCount = battle?.turns.length ?? 0;
  const last = battle?.turns[turnCount - 1];
  const playing = focused && foreground && !reduce && !won;
  const seals = battle ? knowledgeSeals(battle) : [];

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    idle.set(0);
    if (playing) idle.set(withRepeat(withTiming(1, { duration: boss.art === 'mercador' ? 2100 : 1700, easing: EASE_IN_OUT, reduceMotion: ReduceMotion.Never }), -1, true, undefined, ReduceMotion.Never));
    return () => cancelAnimation(idle);
  }, [playing, boss.art, idle]);

  useEffect(() => {
    if (turnCount === playedTurn.current || !last) return;
    playedTurn.current = turnCount;
    if (reduce || !focused || !foreground) return;
    recoil.set(withSequence(withTiming(last.correct ? -1 : 1, { duration: 110, easing: EASE_OUT }), withTiming(0, { duration: 360, easing: EASE_OUT })));
    if (last.convergence || last.armorBroke || won) burst.set(withSequence(withTiming(1, { duration: 160 }), withTiming(0, { duration: 650 })));
  }, [turnCount, last, reduce, focused, foreground, recoil, burst, won]);

  useEffect(() => {
    if (reduce || !focused || !foreground) {
      cancelAnimation(recoil); cancelAnimation(burst);
      recoil.set(0); burst.set(0);
    }
    return () => { cancelAnimation(recoil); cancelAnimation(burst); };
  }, [reduce, focused, foreground, recoil, burst]);

  const creature = useAnimatedStyle(() => ({
    transform: [
      { translateY: boss.art === 'mercador' ? -idle.value * 6 : -idle.value * 2 },
      { scale: 1 + idle.value * 0.012 + recoil.value * 0.04 },
      { rotate: `${recoil.value * (boss.art === 'quimera' ? 3 : 2)}deg` },
    ],
  }));
  const halo = useAnimatedStyle(() => ({ opacity: 0.22 + idle.value * 0.1 + burst.value * 0.45, transform: [{ scale: 1 + burst.value * 0.12 }] }));
  const sealGlow = last?.convergence ? colors.brass : transformed ? colors.verdigris : boss.accent;

  return <View style={styles.stage}>
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 360 230" preserveAspectRatio="xMidYMid slice">
        <Defs><LinearGradient id="arenaSky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.ink800} /><Stop offset="1" stopColor={colors.ink900} /></LinearGradient></Defs>
        <Path d="M0 0 H360 V230 H0 Z" fill="url(#arenaSky)" />
        <G stroke={boss.accent} strokeOpacity={0.18} fill="none" strokeWidth={1}>
          <Path d="M0 160 L48 136 L92 157 L130 132 M230 132 L268 157 L312 136 L360 160 M0 192 H360" />
          <Ellipse cx={180} cy={197} rx={133} ry={23} /><Ellipse cx={180} cy={197} rx={106} ry={16} />
          <Path d="M47 197 H313 M180 174 V220 M87 181 L273 212 M87 212 L273 181" />
        </G>
        <G fill={colors.brass} opacity={0.4}>{[[28, 36], [60, 78], [304, 40], [333, 99], [85, 24], [265, 18]].map(([cx, cy]) => <Circle key={`${cx}:${cy}`} cx={cx} cy={cy} r={1.5} />)}</G>
      </Svg>
    </View>
    <Animated.View pointerEvents="none" style={[styles.halo, halo]} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={250} height={220} viewBox="0 0 250 220">
        <G stroke={sealGlow} fill="none"><Circle cx={125} cy={112} r={87} strokeWidth={1} /><Circle cx={125} cy={112} r={96} strokeDasharray="2 9" /><Path d="M125 10 L125 26 M125 198 L125 214 M22 112 L40 112 M210 112 L228 112" /></G>
        {[0, 1, 2].map(i => <G key={i} transform={`rotate(${i * 120} 125 112)`}>
          <Line x1={125} y1={20} x2={125} y2={36} stroke={i < seals.length || last?.convergence ? colors.brass : colors.ink500} strokeWidth={3} />
          <Circle cx={125} cy={18} r={4} fill={i < seals.length || last?.convergence ? colors.brass : colors.ink500} />
        </G>)}
      </Svg>
    </Animated.View>
    <Animated.View style={creature} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <BossArt art={boss.art} size={210} pulse={idle} cracked={transformed} defeated={won} headsFelled={battle ? headsFelled(boss, battle.hp) : 0}
        facetHits={battle ? facetHitsOf(battle) : undefined} hitsToCrack={boss.trait.kind === 'facets' ? boss.trait.hitsToCrack : undefined}
        layers={battle ? concreteLayers(battle) : undefined} scales={battle ? scalesOf(boss, battle) : undefined}
        maxScales={boss.trait.kind === 'scales' ? boss.trait.maxScales : undefined} riddle={riddle} hydraHeads={battle ? hydraHeadsOf(battle) : undefined} attacking={!!last && !last.correct && battle?.status === 'active'} />
    </Animated.View>
    <View style={styles.phase}><Text variant="label" color={won ? colors.brass : transformed ? colors.verdigris : colors.mist}>{won ? 'Guardião superado' : transformed ? 'Fase II · poder revelado' : 'Fase I · o desafio'}</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  stage: { height: 235, width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.lineSoft, overflow: 'hidden', paddingBottom: space.md },
  halo: { position: 'absolute', top: 0 },
  phase: { position: 'absolute', bottom: space.sm },
});
