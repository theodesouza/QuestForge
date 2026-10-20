/** Ajustes → conta Google, estado da nuvem, exportação e exclusão de conta. */
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AuthError } from '../../auth/types';
import { SYNC_ERROR_MESSAGES, noticeText, syncHeadline } from '../../sync/messages';
import { deleteAccount, dismissSyncNotice, exportMyData, signOut, syncNow } from '../../state/session';
import { useGameStore } from '../../state/store';
import { Button } from '../../ui/Button';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { colors, space } from '../../ui/theme';

export function AccountPanel() {
  const user = useGameStore((s) => s.user);
  const sync = useGameStore((s) => s.sync);
  const cloudEnabled = useGameStore((s) => s.cloudEnabled);
  const [busy, setBusy] = useState<'sync' | 'export' | 'delete' | 'out' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const guard = async (kind: NonNullable<typeof busy>, job: () => Promise<void>) => {
    setBusy(kind);
    setMessage(null);
    try {
      await job();
    } catch (e) {
      setMessage(e instanceof AuthError ? e.message : e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.');
    } finally {
      setBusy(null);
    }
  };

  const confirmSignOut = () =>
    Alert.alert(
      'Sair da conta?',
      sync?.pendingChanges
        ? 'Há alterações ainda não enviadas à nuvem. Elas continuam guardadas neste aparelho e serão enviadas quando você entrar de novo com a mesma conta.'
        : 'Seu progresso continua salvo na nuvem. Para continuar de onde parou, entre de novo com a mesma conta Google.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: () => guard('out', signOut) },
      ],
    );

  const confirmDelete = () =>
    Alert.alert(
      'Excluir conta e dados?',
      'Isto apaga o seu progresso na nuvem, a sua conta no QuestForge e os dados deste aparelho. Não dá para desfazer. Vamos pedir que você confirme com o Google.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir tudo', style: 'destructive', onPress: () => guard('delete', deleteAccount) },
      ],
    );

  return (
    <Panel>
      <Text variant="label" color={colors.brass}>
        Conta e nuvem
      </Text>
      <Text variant="bodyStrong" style={styles.gap}>
        {user?.displayName ?? 'Conta Google'}
      </Text>
      {user?.email ? (
        <Text variant="caption" color={colors.mist}>
          {user.email}
        </Text>
      ) : null}

      <View style={styles.status} accessibilityLiveRegion="polite">
        <Text variant="body">{syncHeadline(sync, cloudEnabled)}</Text>
        {sync?.error ? (
          <Text variant="caption" color={sync.phase === 'blocked' ? colors.ember : colors.mist}>
            {SYNC_ERROR_MESSAGES[sync.error]}
          </Text>
        ) : null}
        {sync?.notice ? (
          <Text variant="caption" color={colors.verdigris} onPress={dismissSyncNotice}>
            {noticeText(sync.notice)} (toque para dispensar)
          </Text>
        ) : null}
      </View>
      <Text variant="caption" color={colors.mist} style={styles.gap}>
        O app funciona sem internet. O progresso é enviado em lotes, ao fim das sessões e ao sair do app. O que nunca chegou à nuvem (por
        exemplo, estudo offline antes de desinstalar) não pode ser recuperado.
      </Text>

      {cloudEnabled ? (
        <Button
          label="Sincronizar agora"
          variant="secondary"
          size="md"
          loading={busy === 'sync'}
          onPress={() => guard('sync', syncNow)}
          style={styles.gap}
        />
      ) : null}
      <Button label="Exportar meus dados" variant="secondary" size="md" loading={busy === 'export'} onPress={() => guard('export', async () => void (await exportMyData()))} style={styles.tight} />
      <Button label="Sair da conta" variant="ghost" size="md" loading={busy === 'out'} onPress={confirmSignOut} style={styles.tight} />
      <Button label="Excluir conta e dados" variant="danger" size="md" loading={busy === 'delete'} onPress={confirmDelete} style={styles.tight} />
      {message ? (
        <Text variant="caption" color={colors.ember} style={styles.gap} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
    </Panel>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: space.md },
  tight: { marginTop: space.sm },
  status: { marginTop: space.md, gap: space.xs },
});
