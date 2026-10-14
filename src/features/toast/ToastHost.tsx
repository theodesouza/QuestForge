/**
 * Avisos curtos no topo (encomenda cumprida, baú aberto). Somem sozinhos; tocar dispensa.
 * Ficam na fila enquanto há uma questão ou batalha em andamento (para não cobrir o HUD
 * nem o botão de sair) e enquanto a celebração de nível está na tela.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dismissToast } from '../../state/actions';
import { useGame, useGameStore } from '../../state/store';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';

const VISIBLE_MS = 2800;
/** Com leitor de tela, o aviso fica mais tempo (dá para ouvir e tocar). */
const VISIBLE_SCREEN_READER_MS = 7000;

function useScreenReader(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((v) => {
        if (alive) setOn(v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setOn);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return on;
}

export function ToastHost() {
  const queued = useGameStore((s) => s.toasts[0]);
  const celebrating = useGameStore((s) => s.celebrations.length > 0);
  const playing = useGame((g) => !!g.session || g.battle?.status === 'active');
  const reduce = useReduceMotion();
  const insets = useSafeAreaInsets();
  const screenReader = useScreenReader();
  const toast = celebrating || playing ? undefined : queued;

  useEffect(() => {
    if (!toast) return;
    haptic('success');
    AccessibilityInfo.announceForAccessibility(`${toast.title}. ${toast.detail}`);
    const t = setTimeout(() => dismissToast(toast.id), screenReader ? VISIBLE_SCREEN_READER_MS : VISIBLE_MS);
    return () => clearTimeout(t);
  }, [toast, screenReader]);

  if (!toast) return null;
  const bonus = toast.tone === 'bonus';
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + space.sm }]} accessibilityLiveRegion="polite">
      <Animated.View
        key={toast.id}
        entering={reduce ? FadeIn : FadeInUp.springify().damping(18)}
        exiting={reduce ? FadeOut : FadeOutUp.duration(200)}
      >
        <Pressable
          onPress={() => dismissToast(toast.id)}
          accessibilityRole="alert"
          accessibilityLabel={`${toast.title}. ${toast.detail}`}
          accessibilityHint="Toque para dispensar"
          style={[styles.toast, bonus && styles.toastBonus]}
        >
          <View style={[styles.icon, bonus && styles.iconBonus]}>
            <Icon name={bonus ? 'sparkle' : 'check'} size={18} color={colors.ink900} fill={bonus ? colors.ink900 : 'none'} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{toast.title}</Text>
            <Text variant="caption" color={colors.parchmentDim} numberOfLines={2}>
              {toast.detail}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.lg, right: space.lg, zIndex: 90 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.ink700,
    borderWidth: 1.2,
    borderColor: colors.verdigris,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },
  toastBonus: { borderColor: colors.brass },
  icon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.verdigris },
  iconBonus: { backgroundColor: colors.brass },
});
