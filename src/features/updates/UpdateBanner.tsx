import * as Updates from 'expo-updates';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '../../ui/Button';
import { useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import { applyUpdateNow, updatesEnabled, useForegroundUpdateCheck } from './updates';

function NativeUpdateBanner() {
  const reduce = useReduceMotion();
  const { isUpdatePending } = Updates.useUpdates();
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  useForegroundUpdateCheck();
  if (!isUpdatePending || hidden) return null;
  return (
    <Animated.View entering={reduce ? undefined : FadeInDown.duration(320)} style={styles.banner} accessibilityLiveRegion="polite">
      <View style={styles.row}>
        <Icon name="sparkle" size={22} color={colors.brass} fill={colors.brassGlow} />
        <View style={{ flex: 1 }}>
          <Text variant="subheading">Nova versão pronta</Text>
          <Text variant="caption" color={colors.parchmentDim}>
            Já foi baixada. Seu progresso continua salvo — a atualização só troca o app.
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          label="Atualizar agora"
          size="md"
          loading={busy}
          onPress={() => {
            setBusy(true);
            applyUpdateNow().catch(() => setBusy(false));
          }}
          style={{ flex: 1 }}
        />
        <Button label="Depois" size="md" variant="ghost" onPress={() => setHidden(true)} />
      </View>
    </Animated.View>
  );
}

/** Aviso de versão nova baixada. Fora de builds de produção nativas, não renderiza nada. */
export function UpdateBanner() {
  return updatesEnabled ? <NativeUpdateBanner /> : null;
}

const styles = StyleSheet.create({
  banner: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: colors.brass,
    backgroundColor: colors.ink700,
  },
  row: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
});
