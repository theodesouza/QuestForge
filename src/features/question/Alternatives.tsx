import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ALT_KEYS, type AltKey, type Question } from '../../content/types';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, fonts, radius, space } from '../../ui/theme';

interface Props {
  question: Question;
  /** Letras canônicas na ordem de exibição (alternativas embaralhadas por tentativa). */
  order: readonly AltKey[];
  selected: AltKey | null;
  onSelect: (k: AltKey) => void;
  /** Depois da correção: alternativa escolhida. */
  revealedChoice: AltKey | null;
  /** Revisão de uma resposta antiga: sem o tremor da alternativa errada. */
  quiet?: boolean;
}

type RowState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

function Row({ k, text, state, onPress, disabled, quiet }: { k: AltKey; text: string; state: RowState; onPress: () => void; disabled: boolean; quiet?: boolean }) {
  const reduce = useReduceMotion();
  const shake = useSharedValue(0);
  useEffect(() => {
    if (state === 'wrong' && !reduce && !quiet) {
      shake.set(withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      ));
    }
  }, [state, reduce, quiet, shake]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const tone = {
    idle: { border: colors.lineSoft, bg: colors.ink800, badge: colors.ink600, badgeText: colors.parchment, text: colors.parchment },
    selected: { border: colors.brass, bg: colors.brassGlow, badge: colors.brass, badgeText: colors.ink900, text: colors.parchment },
    correct: { border: colors.verdigris, bg: colors.verdigrisGlow, badge: colors.verdigris, badgeText: colors.ink900, text: colors.parchment },
    wrong: { border: colors.ember, bg: colors.emberGlow, badge: colors.ember, badgeText: colors.ink900, text: colors.parchment },
    dimmed: { border: colors.lineSoft, bg: colors.ink850, badge: colors.ink700, badgeText: colors.mistDim, text: colors.mistDim },
  }[state];

  const a11yState = state === 'correct' ? ', alternativa correta' : state === 'wrong' ? ', sua resposta, incorreta' : '';

  return (
    <Animated.View style={anim}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: state === 'selected', disabled }}
        accessibilityLabel={`Alternativa ${k}: ${text}${a11yState}`}
        disabled={disabled}
        onPress={() => {
          haptic('select');
          onPress();
        }}
        style={({ pressed }) => [
          styles.row,
          { borderColor: tone.border, backgroundColor: tone.bg, opacity: pressed && !disabled ? 0.85 : 1 },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: tone.badge }]}>
          {state === 'correct' ? (
            <Icon name="check" size={18} color={colors.ink900} strokeWidth={2.4} />
          ) : state === 'wrong' ? (
            <Icon name="cross" size={16} color={colors.ink900} strokeWidth={2.4} />
          ) : (
            <Text variant="number" color={tone.badgeText} style={styles.letter}>
              {k}
            </Text>
          )}
        </View>
        <Text variant="question" color={tone.text} style={styles.text}>
          {text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function Alternatives({ question, order, selected, onSelect, revealedChoice, quiet }: Props) {
  const revealed = revealedChoice !== null;
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {order.map((k, i) => {
        // k = letra canônica (gabarito); a tela mostra a letra da posição.
        const shown = ALT_KEYS[i];
        let state: RowState = 'idle';
        if (revealed) {
          if (k === question.answer) state = 'correct';
          else if (k === revealedChoice) state = 'wrong';
          else state = 'dimmed';
        } else if (k === selected) state = 'selected';
        return (
          <Row key={k} k={shown} text={question.alternatives[k]} state={state} disabled={revealed} quiet={quiet} onPress={() => onSelect(k)} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm + 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 58,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  badge: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: fonts.display, fontSize: 16 },
  text: { flex: 1, fontSize: 16.5, lineHeight: 24 },
});
