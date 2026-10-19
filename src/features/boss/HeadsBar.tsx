/**
 * Barra de vida da Quimera: três segmentos com a largura das frações da vida
 * (1/2, 1/3 e 1/6), um por cabeça. A cabeça de pé aparece em destaque; as derrubadas
 * ficam apagadas e riscadas. Cada segmento enche e esvazia sozinho, e uma cabeça caída
 * não volta.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { BossDef } from '../../content/bosses';
import { activeHeadIndex, headSpans, type BattleState } from '../../domain/boss/battle';
import { useReduceMotion } from '../../ui/feedback';
import { Text } from '../../ui/Text';
import { colors, space } from '../../ui/theme';

function Segment({ fill, color, height }: { fill: number; color: string; height: number }) {
  const reduce = useReduceMotion();
  const w = useSharedValue(fill);
  useEffect(() => {
    w.set(reduce ? fill : withTiming(fill, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [fill, reduce, w]);
  const style = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, w.value)) * 100}%` }));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color, borderRadius: height / 2 }, style]} />
    </View>
  );
}

export function HeadsBar({ boss, battle }: { boss: BossDef; battle: BattleState }) {
  const spans = headSpans(boss);
  if (spans.length === 0) return null;
  const active = activeHeadIndex(boss, battle.hp);
  const alive = spans.filter((s) => battle.hp > s.floorHp).map((s) => `${s.head.name}, ${s.head.share[0]}/${s.head.share[1]} da vida`);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Vida de ${boss.name}: ${battle.hp} de ${battle.maxHp}. Cabeças de pé: ${alive.join('; ') || 'nenhuma'}.`}
    >
      <View style={styles.row}>
        {spans.map((s) => {
          const down = battle.hp <= s.floorHp;
          const fill = down ? 0 : Math.min(1, (battle.hp - s.floorHp) / (s.ceilHp - s.floorHp));
          return (
            <View key={s.head.id} style={{ flex: s.head.share[0] / s.head.share[1] }}>
              <Segment fill={fill} color={s.head.color} height={10} />
            </View>
          );
        })}
      </View>
      <View style={styles.row}>
        {spans.map((s) => {
          const down = battle.hp <= s.floorHp;
          const isActive = s.index === active && !down;
          return (
            <View key={s.head.id} style={{ flex: s.head.share[0] / s.head.share[1], alignItems: 'center' }}>
              <Text
                variant="caption"
                color={down ? colors.ink500 : isActive ? s.head.color : colors.mistDim}
                numberOfLines={1}
                style={[styles.label, down && styles.struck, isActive && styles.activeLabel]}
              >
                {s.head.name} {s.head.share[0]}/{s.head.share[1]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.xs },
  track: { width: '100%', overflow: 'hidden', backgroundColor: colors.ink600 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  label: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  activeLabel: { fontWeight: '700' },
  struck: { textDecorationLine: 'line-through' },
});
