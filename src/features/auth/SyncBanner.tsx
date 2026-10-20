/**
 * Aviso discreto no Acampamento: só aparece quando há algo que a pessoa precisa saber —
 * fusão de aparelhos, restauração concluída, sincronização pausada ou pendente sem conexão.
 */
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SYNC_ERROR_MESSAGES, noticeText } from '../../sync/messages';
import { dismissSyncNotice } from '../../state/session';
import { useGameStore } from '../../state/store';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';

export function SyncBanner() {
  const sync = useGameStore((s) => s.sync);
  if (!sync) return null;

  if (sync.notice) {
    return (
      <Pressable onPress={dismissSyncNotice} accessibilityRole="button" accessibilityHint="Toque para dispensar" style={[styles.box, styles.good]}>
        <Icon name="sparkle" size={20} color={colors.verdigris} />
        <Text variant="caption" color={colors.parchment} style={styles.text}>
          {noticeText(sync.notice)}
        </Text>
      </Pressable>
    );
  }
  if (sync.phase === 'blocked' && sync.error) {
    return (
      <Pressable onPress={() => router.push('/settings')} accessibilityRole="button" style={[styles.box, styles.bad]}>
        <Icon name="cross" size={20} color={colors.ember} />
        <View style={styles.text}>
          <Text variant="caption" color={colors.parchment}>
            {SYNC_ERROR_MESSAGES[sync.error]}
          </Text>
          <Text variant="caption" color={colors.mist}>
            Toque para ver os detalhes.
          </Text>
        </View>
      </Pressable>
    );
  }
  if (sync.phase === 'offline' && sync.pendingChanges) {
    return (
      <View style={[styles.box, styles.neutral]} accessibilityLiveRegion="polite">
        <Icon name="lantern" size={20} color={colors.brass} />
        <Text variant="caption" color={colors.parchmentDim} style={styles.text}>
          Sem conexão: seu progresso está salvo neste aparelho e será enviado quando a internet voltar.
        </Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, borderWidth: 1 },
  text: { flex: 1 },
  good: { backgroundColor: colors.verdigrisGlow, borderColor: colors.verdigrisDeep },
  bad: { backgroundColor: colors.emberGlow, borderColor: colors.emberDeep },
  neutral: { backgroundColor: colors.ink800, borderColor: colors.lineSoft },
});
