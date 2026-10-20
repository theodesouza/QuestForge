/**
 * TELA DA MIGRAÇÃO ÚNICA (desenvolvedor). Não existe no app publicado.
 *
 * Passos, todos explícitos e com conferência: 1) ver o que há no aparelho; 2) criar e guardar um
 * backup fora do celular; 3) confirmar a conta; 4) migrar; 5) conferir antes × depois.
 * Nada é apagado: o banco antigo continua no aparelho até você mesmo decidir removê-lo.
 */
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AuthError } from '../auth/types';
import { buildExport, parseExport } from '../sync/export';
import { SyncError } from '../sync/types';
import { SYNC_ERROR_MESSAGES } from '../sync/messages';
import { completeLegacyMigration, getAccount, getPlatform, signOut } from '../state/session';
import { saveTextFile, shareFile } from '../state/share';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, space } from '../ui/theme';
import { skipForNow } from './gate';
import { openLegacyRepository } from './legacyDb';
import {
  LegacyError,
  fingerprintOf,
  readLegacy,
  runMigration,
  summarize,
  type Check,
  type LegacyData,
  type LegacySummary,
  type MigrationResult,
  type MigrationStep,
} from './migration';
import { emailAllowed } from './readOnly';

const appVersion = Constants.expoConfig?.version ?? 'dev';
const STEP_LABEL: Record<MigrationStep, string> = {
  check: 'Conferindo a conta e o aparelho…',
  seed: 'Copiando o progresso para o banco da conta…',
  upload: 'Enviando para a nuvem…',
  verify: 'Relendo a nuvem e conferindo cada número…',
};

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.row}>
      <Text variant="caption" color={colors.mist} style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant="bodyStrong">{String(value)}</Text>
    </View>
  );
}

function SummaryRows({ s }: { s: LegacySummary }) {
  return (
    <>
      <Row label="Nível" value={s.level} />
      <Row label="XP total" value={s.xp} />
      <Row label="Tinta" value={s.ink} />
      <Row label="Missões concluídas" value={s.nodes} />
      <Row label="Estrelas" value={s.stars} />
      <Row label="Chefões vencidos" value={s.bosses} />
      <Row label="Itens no inventário" value={s.items} />
      <Row label="Questões vistas" value={s.questions} />
      <Row label="Respostas no histórico" value={s.attempts} />
    </>
  );
}

function CheckRow({ c }: { c: Check }) {
  return (
    <View style={styles.row}>
      <Text variant="caption" color={c.ok ? colors.verdigris : colors.ember} style={{ width: 18 }}>
        {c.ok ? '✓' : '✗'}
      </Text>
      <Text variant="caption" color={colors.parchmentDim} style={{ flex: 1 }}>
        {c.label}
      </Text>
      <Text variant="caption" color={c.ok ? colors.mist : colors.ember}>
        {c.before === c.after ? c.after : `${c.before} → ${c.after}`}
      </Text>
    </View>
  );
}

function Checkbox({ checked, label, onToggle, disabled }: { checked: boolean; label: string; onToggle: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onToggle} disabled={disabled} accessibilityRole="checkbox" accessibilityState={{ checked, disabled }} style={[styles.check, disabled && { opacity: 0.4 }]}>
      <View style={[styles.box, checked && styles.boxOn]} />
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function LegacyMigrationScreen() {
  const user = getAccount();
  const expected = process.env.EXPO_PUBLIC_LEGACY_EXPECTED_EMAIL;
  const accountAllowed = emailAllowed(expected, user?.email ?? null);

  const [legacy, setLegacy] = useState<LegacyData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [backup, setBackup] = useState<{ name: string; uri: string; checksum: string } | null>(null);
  const [backupStored, setBackupStored] = useState(false);
  const [accountConfirmed, setAccountConfirmed] = useState(false);
  const [step, setStep] = useState<MigrationStep | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<{ message: string; checks: Check[] } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const opened = await openLegacyRepository();
      if (!opened) throw new Error('Nenhum banco antigo com progresso foi encontrado.');
      try {
        const data = await readLegacy(opened.repo);
        if (alive) setLegacy(data);
      } finally {
        await opened.close();
      }
    })().catch((e) => alive && setLoadError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, []);

  const makeBackup = useCallback(async () => {
    if (!legacy || !user) return;
    setBusy(true);
    setError(null);
    try {
      const { text, file } = buildExport({ state: legacy.state, attempts: legacy.attempts, account: { uid: user.uid, email: user.email }, appVersion, now: Date.now() });
      const name = `questforge-backup-legado-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const saved = await saveTextFile(name, text);
      const reread = parseExport(saved.readBack); // relê o arquivo gravado e confere checksum e resumo
      if (reread.checksum !== file.checksum) throw new Error('O arquivo gravado não confere com o original.');
      setBackup({ name, uri: saved.uri, checksum: file.checksum });
      await shareFile(saved.uri, 'Guardar o backup do QuestForge fora do celular');
    } catch (e) {
      setError({ message: `Não foi possível criar o backup: ${e instanceof Error ? e.message : String(e)}`, checks: [] });
    } finally {
      setBusy(false);
    }
  }, [legacy, user]);

  const migrate = useCallback(async () => {
    if (!legacy || !user) return;
    setBusy(true);
    setError(null);
    try {
      const platform = getPlatform();
      const cloud = platform.cloud();
      if (!cloud) throw new Error('Sem nuvem neste ambiente.');
      const target = await platform.openRepository(user.uid);
      setResult(await runMigration({ legacy, uid: user.uid, target, cloud, appVersion }, setStep));
    } catch (e) {
      const message =
        e instanceof LegacyError
          ? e.message
          : e instanceof SyncError
            ? SYNC_ERROR_MESSAGES[e.code]
            : e instanceof AuthError
              ? e.message
              : e instanceof Error
                ? e.message
                : String(e);
      setError({ message, checks: e instanceof LegacyError ? e.checks : [] });
    } finally {
      setStep(null);
      setBusy(false);
    }
  }, [legacy, user]);

  const summary = legacy ? summarize(legacy) : null;
  const canMigrate = !!legacy && !!backup && backupStored && accountConfirmed && accountAllowed && !busy && !result;

  return (
    <Screen>
      <Text variant="label" color={colors.ember}>
        Ferramenta do desenvolvedor · migração única
      </Text>
      <Text variant="title">Associar o progresso antigo à sua conta</Text>
      <Text variant="body" color={colors.parchmentDim}>
        Este aparelho tem progresso salvo de antes das contas. Nada será apagado: o banco antigo continua aqui, intocado, como backup original.
      </Text>

      {loadError ? (
        <Panel accent={colors.ember}>
          <Text variant="body" color={colors.ember}>
            {loadError}
          </Text>
        </Panel>
      ) : null}

      {summary ? (
        <Panel>
          <Text variant="label" color={colors.brass}>
            1 · O que há neste aparelho
          </Text>
          <SummaryRows s={summary} />
          <Text variant="caption" color={colors.mistDim}>
            Impressão digital: {legacy ? fingerprintOf(legacy) : ''}
          </Text>
        </Panel>
      ) : null}

      <Panel accent={accountAllowed ? colors.brass : colors.ember}>
        <Text variant="label" color={accountAllowed ? colors.brass : colors.ember}>
          2 · Conta que vai receber o progresso
        </Text>
        <Text variant="bodyStrong">{user?.displayName ?? '—'}</Text>
        <Text variant="body">{user?.email ?? '(sem e-mail)'}</Text>
        {!accountAllowed ? (
          <Text variant="caption" color={colors.ember}>
            Esta NÃO é a conta esperada para esta build. Nada será associado a ela. Saia e entre com a conta correta.
          </Text>
        ) : (
          <Checkbox checked={accountConfirmed} onToggle={() => setAccountConfirmed(!accountConfirmed)} label="Confirmo: é a minha conta e é ela que deve receber o progresso." disabled={!!result} />
        )}
      </Panel>

      <Panel>
        <Text variant="label" color={colors.brass}>
          3 · Backup fora do celular
        </Text>
        <Text variant="caption" color={colors.mist}>
          Cria um arquivo com TODO o progresso, relê o arquivo gravado e confere o checksum. Salve-o no Drive, e-mail ou outro lugar fora do aparelho.
        </Text>
        <Button label={backup ? 'Criar de novo e compartilhar' : 'Criar backup e compartilhar'} size="md" variant="secondary" loading={busy && !step} disabled={!legacy || !!result} onPress={makeBackup} />
        {backup ? (
          <>
            <Text variant="caption" color={colors.verdigris}>
              Backup criado e conferido: {backup.name} · checksum {backup.checksum}
            </Text>
            <Checkbox checked={backupStored} onToggle={() => setBackupStored(!backupStored)} label="Guardei o arquivo de backup fora do celular." disabled={!!result} />
          </>
        ) : null}
      </Panel>

      <Panel>
        <Text variant="label" color={colors.brass}>
          4 · Migrar
        </Text>
        <Text variant="caption" color={colors.mist}>
          Copia para a conta, envia à nuvem e só considera concluído depois de reler tudo e comparar. Pode repetir sem medo: não duplica nada.
        </Text>
        <Button label="Migrar agora" loading={busy && !!step} disabled={!canMigrate} onPress={migrate} />
        {step ? (
          <Text variant="caption" color={colors.brass} accessibilityLiveRegion="polite">
            {STEP_LABEL[step]}
          </Text>
        ) : null}
        {error ? (
          <View accessibilityLiveRegion="polite" style={{ gap: space.xs }}>
            <Text variant="caption" color={colors.ember}>
              {error.message}
            </Text>
            {error.checks.map((c) => (
              <CheckRow key={c.label} c={c} />
            ))}
          </View>
        ) : null}
      </Panel>

      {result ? (
        <Panel accent={colors.verdigris}>
          <Text variant="label" color={colors.verdigris}>
            Concluída e conferida
          </Text>
          <Text variant="caption" color={colors.parchmentDim}>
            {result.alreadyDone ? 'Já estava migrada; nada foi gravado de novo.' : `Gravada na nuvem (revisão ${result.rev}).`} Antes × depois:
          </Text>
          {result.checks.map((c) => (
            <CheckRow key={c.label} c={c} />
          ))}
          <Text variant="caption" color={colors.mist}>
            O banco antigo e o arquivo de backup continuam guardados. Só apague depois de usar o app e confirmar que está tudo certo.
          </Text>
          <Button label="Concluir e abrir o QuestForge" onPress={completeLegacyMigration} />
        </Panel>
      ) : (
        <>
          <Button
            label="Agora não"
            variant="ghost"
            onPress={() => {
              skipForNow();
              void completeLegacyMigration();
            }}
            accessibilityHint="Abre o app sem migrar; o banco antigo continua guardado"
          />
          <Button label="Sair e trocar de conta" variant="ghost" onPress={signOut} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 2 },
  check: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.brass },
  boxOn: { backgroundColor: colors.brass },
});
