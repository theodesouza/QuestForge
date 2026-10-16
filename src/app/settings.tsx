import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, TextInput, View } from 'react-native';
import { QUESTIONS } from '../content/bank';
import { bankReport } from '../content/validation/validate';
import { PendingUpdateButton } from '../features/updates/UpdateBanner';
import { checkAndFetch, updatesEnabled, versionInfo } from '../features/updates/updates';
import type { EffectsLevel, ReduceMotionPref } from '../domain/game/types';
import { resetProgress, updateProfile, updateSettings } from '../state/actions';
import { useGame } from '../state/store';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { IconButton } from '../ui/IconButton';
import { Panel } from '../ui/Panel';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, fonts, radius, space } from '../ui/theme';

const EFFECTS: { id: EffectsLevel; label: string }[] = [
  { id: 'alto', label: 'Alta' },
  { id: 'medio', label: 'Média' },
  { id: 'baixo', label: 'Baixa' },
];

const MOTION: { id: ReduceMotionPref; label: string }[] = [
  { id: 'system', label: 'Seguir o sistema' },
  { id: 'always', label: 'Reduzido' },
  { id: 'never', label: 'Completo' },
];

const report = bankReport(QUESTIONS);

export default function Settings() {
  const profile = useGame((g) => g.profile);
  const [name, setName] = useState(profile.name);
  const [checking, setChecking] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const info = versionInfo();

  const confirmReset = () =>
    Alert.alert('Apagar todo o progresso?', 'Nível, itens, histórico e revisões serão apagados deste aparelho. Isso não pode ser desfeito.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar tudo',
        style: 'destructive',
        onPress: async () => {
          await resetProgress();
          router.replace('/onboarding');
        },
      },
    ]);

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon="chevronLeft" label="Voltar" onPress={() => router.back()} color={colors.parchment} />
        <Text variant="title">Ajustes</Text>
      </View>

      <Panel>
        <Text variant="label" color={colors.brass}>
          Perfil
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onEndEditing={() => updateProfile({ name })}
          placeholder="Seu nome ou apelido"
          placeholderTextColor={colors.mistDim}
          maxLength={24}
          style={styles.input}
          accessibilityLabel="Nome ou apelido"
        />
        <Text variant="caption" color={colors.mist} style={styles.gap}>
          Meta diária (sem punição se não cumprir)
        </Text>
        <View style={styles.chips}>
          {[5, 10, 15, 25].map((m) => (
            <Chip key={m} label={`${m} min`} selected={profile.dailyMinutes === m} onPress={() => updateProfile({ dailyMinutes: m })} />
          ))}
        </View>
      </Panel>

      <Panel>
        <Text variant="label" color={colors.brass}>
          Experiência
        </Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">Feedback tátil</Text>
            <Text variant="caption" color={colors.mist}>
              Vibrações curtas ao responder e em golpes.
            </Text>
          </View>
          <Switch
            value={profile.settings.haptics}
            onValueChange={(v) => {
              updateSettings({ haptics: v });
            }}
            trackColor={{ true: colors.brass, false: colors.ink600 }}
            thumbColor={colors.parchment}
            accessibilityLabel="Feedback tátil"
          />
        </View>
        <Text variant="bodyStrong" style={styles.gap}>
          Animações
        </Text>
        <View style={styles.chips}>
          {MOTION.map((m) => (
            <Chip key={m.id} label={m.label} selected={profile.settings.reduceMotion === m.id} onPress={() => updateSettings({ reduceMotion: m.id })} />
          ))}
        </View>
        <Text variant="bodyStrong" style={styles.gap}>
          Intensidade dos efeitos
        </Text>
        <View style={styles.chips}>
          {EFFECTS.map((m) => (
            <Chip key={m.id} label={m.label} selected={profile.settings.effects === m.id} onPress={() => updateSettings({ effects: m.id })} />
          ))}
        </View>
        <Text variant="caption" color={colors.mist} style={{ marginTop: space.xs }}>
          Quantidade de partículas e camadas de energia de núcleos e auras. Se o celular esquentar ou travar, use Média ou Baixa. Com
          animações reduzidas, os efeitos ficam parados.
        </Text>
      </Panel>

      <Panel>
        <Text variant="label" color={colors.brass}>
          Versão do app
        </Text>
        <Text variant="body" style={styles.gap}>
          QuestForge {info.version}
          {info.embedded ? '' : ` · atualização de ${info.updatedAt ? info.updatedAt.toLocaleDateString('pt-BR') : '—'}`}
        </Text>
        <Text variant="caption" color={colors.mist}>
          {updatesEnabled
            ? 'As versões novas chegam sozinhas pela internet e seu progresso continua salvo no aparelho.'
            : 'Atualizações automáticas ficam ativas no app instalado no celular.'}
        </Text>
        {updatesEnabled ? (
          <>
            <Button
              label={checking ? 'Procurando…' : 'Procurar atualização'}
              variant="secondary"
              size="md"
              loading={checking}
              onPress={async () => {
                setChecking(true);
                const outcome = await checkAndFetch();
                setChecking(false);
                setUpdateMsg(
                  outcome === 'downloaded'
                    ? 'Versão nova baixada! Toque em “Atualizar agora” ou deixe para a próxima vez que abrir o app.'
                    : outcome === 'up-to-date'
                      ? 'Você já está na versão mais recente.'
                      : 'Não foi possível verificar agora. Confira a internet e tente de novo.',
                );
              }}
              style={styles.gap}
            />
            {updateMsg ? (
              <Text variant="caption" color={colors.parchmentDim} style={styles.gap}>
                {updateMsg}
              </Text>
            ) : null}
            <PendingUpdateButton style={styles.gap} />
          </>
        ) : null}
      </Panel>

      <Panel>
        <Text variant="label" color={colors.brass}>
          Sobre o conteúdo
        </Text>
        <Text variant="body" style={styles.gap}>
          {report.total} questões autorais inspiradas nas competências do ENEM, com resolução passo a passo. {report.verified} delas têm a resposta
          recalculada automaticamente a partir do enunciado a cada versão do app.
        </Text>
        <Text variant="caption" color={colors.mist} style={styles.gap}>
          Nenhuma questão é apresentada como oficial do ENEM. Percentual de acerto não é a nota TRI do ENEM: a nota oficial depende do padrão de
          respostas e da calibração dos itens da prova.
        </Text>
      </Panel>

      <Panel accent={colors.ember}>
        <Text variant="label" color={colors.ember}>
          Seus dados
        </Text>
        <Text variant="body" style={styles.gap}>
          Todo o progresso fica salvo apenas neste aparelho. Sem conta, sem anúncios, sem rastreamento.
        </Text>
        <Button label="Apagar todo o progresso" variant="danger" size="md" onPress={confirmReset} style={styles.gap} />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.sm },
  input: {
    marginTop: space.md,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: colors.line,
    backgroundColor: colors.ink850,
    paddingHorizontal: space.lg,
    color: colors.parchment,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
  gap: { marginTop: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
});
