/**
 * Controle deslizante acessível: arrasta com o dedo (ou mouse), tem botões − e + para
 * ajuste fino e responde às ações de incremento/decremento do leitor de tela.
 * Só chama `onChange` quando o valor muda de passo (poucos re-renders no Android).
 */
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { haptic } from './feedback';
import { Text } from './Text';
import { colors, radius, space } from './theme';

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  label: string;
  format: (v: number) => string;
  color?: string;
}

const THUMB = 26;

function snap(v: number, min: number, max: number, step: number): number {
  const n = Math.round((v - min) / step);
  return Math.min(max, Math.max(min, Math.round((min + n * step) * 1e9) / 1e9));
}

export function Slider({ value, min, max, step, onChange, label, format, color = colors.brass }: Props) {
  const track = useRef<View>(null);
  const geometry = useRef({ x: 0, width: 0 });
  // Último valor enviado durante o arrasto (evita repetir onChange antes do novo render).
  const sent = useRef<number | null>(null);
  const [width, setWidth] = useState(0);

  const fromPage = (pageX: number) => {
    const { x, width: w } = geometry.current;
    if (w <= 0) return;
    const ratio = Math.min(1, Math.max(0, (pageX - x) / w));
    const v = snap(min + ratio * (max - min), min, max, step);
    if (v !== (sent.current ?? value)) {
      sent.current = v;
      onChange(v);
    }
  };

  const onGrant = (e: GestureResponderEvent) => {
    const pageX = e.nativeEvent.pageX;
    sent.current = null;
    track.current?.measureInWindow((x, _y, w) => {
      geometry.current = { x, width: w };
      fromPage(pageX);
    });
  };

  const nudge = (dir: 1 | -1) => {
    const v = snap(value + dir * step, min, max, step);
    if (v !== value) {
      haptic('select');
      onChange(v);
    }
  };

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => nudge(-1)}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel={`Diminuir ${label}`}
        hitSlop={6}
        style={[styles.step, value <= min && styles.stepOff]}
      >
        <Text variant="bodyStrong" color={colors.parchment}>−</Text>
      </Pressable>
      <View
        ref={track}
        onLayout={onLayout}
        style={styles.track}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: format(value) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={onGrant}
        onResponderMove={(e) => fromPage(e.nativeEvent.pageX)}
        onResponderRelease={() => {
          sent.current = null;
          haptic('select');
        }}
      >
        <View style={styles.rail}>
          <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
        </View>
        {width > 0 ? (
          <View pointerEvents="none" style={[styles.thumb, { left: ratio * (width - THUMB), borderColor: color }]}>
            <View style={[styles.thumbDot, { backgroundColor: color }]} />
          </View>
        ) : null}
      </View>
      <Pressable
        onPress={() => nudge(1)}
        disabled={value >= max}
        accessibilityRole="button"
        accessibilityLabel={`Aumentar ${label}`}
        hitSlop={6}
        style={[styles.step, value >= max && styles.stepOff]}
      >
        <Text variant="bodyStrong" color={colors.parchment}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  step: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink700,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  stepOff: { opacity: 0.35 },
  track: { flex: 1, height: 44, justifyContent: 'center' },
  rail: { height: 6, borderRadius: 3, backgroundColor: colors.ink600, overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  thumb: {
    position: 'absolute',
    top: (44 - THUMB) / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 2,
    backgroundColor: colors.ink900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbDot: { width: 8, height: 8, borderRadius: 4 },
});
