import * as Updates from 'expo-updates';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '../../ui/Button';
import { useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import { applyUpdateNow, updatesEnabled, useForegroundUpdateCheck } from './updates';

function NativeUpdateBanner() {
  const reduce = useReduceMotion();
  const { isUpdatePending, downloadedUpdate } = Updates.useUpdates();
  // "Depois" esconde só a versão que já foi vista; uma versão mais nova volta a aparecer.
  const pendingId = downloadedUpdate?.updateId ?? 'pending';
  const [hiddenFor, setHiddenFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useForegroundUpdateCheck();
  if (!isUpdatePending || hiddenFor === pendingId) return null;
  return (
    <Animated.View entering={reduce ? undefined : FadeInDown.duration(320)} style={styles.banner} accessibilityLiveRegion="polite">
      <View style={styles.row}>
        <Icon name="sparkle" size={22} color={colors.brass} fill={colors.brassGlow} />
        <View style={{ flex: 1 }}>
          <Text variant="subheading">Nova versão pronta</Text>
          <Text variant="caption" color={colors.parchmentDim}>
            Já foi baixada. Seu progresso continua salvo — a atualização só troca o app. Se preferir, ela entra
            sozinha na próxima vez que você abrir o QuestForge.
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
        <Button label="Depois" size="md" variant="ghost" onPress={() => setHiddenFor(pendingId)} />
      </View>
    </Animated.View>
  );
}

/** Aviso de versão nova baixada. Fora de builds de produção nativas, não renderiza nada. */
export function UpdateBanner() {
  return updatesEnabled ? <NativeUpdateBanner /> : null;
}

function NativePendingUpdateButton({ style }: { style?: StyleProp<ViewStyle> }) {
  const { isUpdatePending } = Updates.useUpdates();
  const [busy, setBusy] = useState(false);
  if (!isUpdatePending) return null;
  return (
    <Button
      label="Atualizar agora"
      size="md"
      loading={busy}
      accessibilityHint="Reinicia o app na versão nova. Seu progresso continua salvo."
      style={style}
      onPress={() => {
        setBusy(true);
        applyUpdateNow().catch(() => setBusy(false));
      }}
    />
  );
}

/** Botão "Atualizar agora" para quando já há uma versão baixada (usado nos Ajustes). */
export function PendingUpdateButton({ style }: { style?: StyleProp<ViewStyle> }) {
  return updatesEnabled ? <NativePendingUpdateButton style={style} /> : null;
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
