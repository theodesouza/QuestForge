/**
 * Onboarding curto: 4 toques e o jogador já está resolvendo a primeira questão.
 * Tudo é opcional e ajustável depois — personalização progressiva.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import type { Goal, SelfLevel } from '../domain/game/types';
import { finishOnboarding, startExpedition } from '../state/actions';
import { useGame } from '../state/store';
import { Astrolabe } from '../ui/Astrolabe';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { haptic, useReduceMotion } from '../ui/feedback';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, fonts, radius, space } from '../ui/theme';

const GOALS: { id: Goal; label: string; detail: string }[] = [
  { id: 'enem', label: 'Passar no ENEM', detail: 'Treino focado nas competências da prova.' },
  { id: 'reforco', label: 'Reforçar a escola', detail: 'Fortalecer a base de matemática.' },
  { id: 'curiosidade', label: 'Desafiar a mente', detail: 'Aprender por gosto, no meu ritmo.' },
];

const LEVELS: { id: SelfLevel; label: string; detail: string }[] = [
  { id: 'iniciante', label: 'Começando', detail: 'Frações e porcentagens ainda me travam.' },
  { id: 'intermediario', label: 'No caminho', detail: 'Resolvo o básico; travo nas mais difíceis.' },
  { id: 'avancado', label: 'Afiado', detail: 'Quero questões desafiadoras desde já.' },
];

const MINUTES = [5, 10, 15, 25];
const year = new Date().getFullYear();
const EXAM_YEARS = [year, year + 1, year + 2];

function Option({ label, detail, selected, onPress }: { label: string; detail: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => {
        haptic('select');
        onPress();
      }}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <View style={[styles.radio, selected && styles.radioOn]} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="subheading">{label}</Text>
        <Text variant="caption" color={colors.mist}>
          {detail}
        </Text>
      </View>
    </Pressable>
  );
}

export default function Onboarding() {
  const reduce = useReduceMotion();
  const equipped = useGame((g) => g.profile.equipped);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<Goal>('enem');
  const [examYear, setExamYear] = useState<number | null>(null);
  const [level, setLevel] = useState<SelfLevel>('intermediario');
  const [minutes, setMinutes] = useState(10);
  const [busy, setBusy] = useState(false);

  const complete = async () => {
    setBusy(true);
    try {
      await finishOnboarding({ name, goal, dailyMinutes: minutes, selfLevel: level, examYear: goal === 'enem' ? examYear : null });
      await startExpedition(3);
      router.replace('/camp');
      router.push('/session');
    } catch (e) {
      setBusy(false);
      Alert.alert('Algo deu errado', e instanceof Error ? e.message : String(e));
    }
  };

  const next = () => (step < 4 ? setStep(step + 1) : complete());
  const enter = reduce ? undefined : FadeInRight.duration(320);

  const footer = (
    <>
      <Button
        label={step === 0 ? 'Começar a jornada' : step === 4 ? 'Primeira expedição: 3 questões' : 'Continuar'}
        icon={step === 4 ? 'play' : undefined}
        onPress={next}
        loading={busy}
      />
      {step > 0 ? <Button label="Voltar" variant="ghost" onPress={() => setStep(step - 1)} /> : null}
    </>
  );

  return (
    <Screen footer={footer}>
      {step > 0 ? (
        <View style={styles.dots} accessible accessibilityLabel={`Passo ${step} de 4`}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotOn]} />
          ))}
        </View>
      ) : null}

      {step === 0 ? (
        <Animated.View entering={reduce ? undefined : FadeIn.duration(700)} style={styles.welcome}>
          <Astrolabe level={1} equipped={equipped} size={230} animate={!reduce} />
          <Text variant="label" color={colors.brass}>
            QuestForge
          </Text>
          <Text variant="hero" align="center">
            O mapa da matemática foi apagado.
          </Text>
          <Text variant="body" color={colors.parchmentDim} align="center">
            A Névoa do Esquecimento cobriu o Atlas. Cada questão que você resolve redesenha um pedaço do mundo — e forja o seu astrolábio.
          </Text>
        </Animated.View>
      ) : null}

      {step === 1 ? (
        <Animated.View entering={enter} style={styles.step}>
          <Text variant="title">Como devemos chamar você, Cartógrafo?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Seu nome ou apelido (opcional)"
            placeholderTextColor={colors.mistDim}
            maxLength={24}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={next}
            style={styles.input}
            accessibilityLabel="Nome ou apelido"
          />
          <Text variant="caption" color={colors.mist}>
            Fica só no seu aparelho. Não pedimos conta nem e-mail.
          </Text>
        </Animated.View>
      ) : null}

      {step === 2 ? (
        <Animated.View entering={enter} style={styles.step}>
          <Text variant="title">Qual é a sua missão?</Text>
          {GOALS.map((g) => (
            <Option key={g.id} label={g.label} detail={g.detail} selected={goal === g.id} onPress={() => setGoal(g.id)} />
          ))}
          {goal === 'enem' ? (
            <View style={{ gap: space.sm }}>
              <Text variant="caption" color={colors.mist}>
                Ano da prova (opcional)
              </Text>
              <View style={styles.chips}>
                {EXAM_YEARS.map((y) => (
                  <Chip key={y} label={String(y)} selected={examYear === y} onPress={() => setExamYear(examYear === y ? null : y)} />
                ))}
              </View>
            </View>
          ) : null}
        </Animated.View>
      ) : null}

      {step === 3 ? (
        <Animated.View entering={enter} style={styles.step}>
          <Text variant="title">Como está sua matemática hoje?</Text>
          <Text variant="body" color={colors.parchmentDim}>
            Só um ponto de partida: o app se ajusta sozinho a cada resposta.
          </Text>
          {LEVELS.map((l) => (
            <Option key={l.id} label={l.label} detail={l.detail} selected={level === l.id} onPress={() => setLevel(l.id)} />
          ))}
        </Animated.View>
      ) : null}

      {step === 4 ? (
        <Animated.View entering={enter} style={styles.step}>
          <Text variant="title">Quanto tempo por dia parece realista?</Text>
          <Text variant="body" color={colors.parchmentDim}>
            Escolha algo leve. Dias sem estudo não zeram nada — quando você volta, ganha bônus de Descanso.
          </Text>
          <View style={styles.chips}>
            {MINUTES.map((m) => (
              <Chip key={m} label={`${m} min`} icon="clock" selected={minutes === m} onPress={() => setMinutes(m)} />
            ))}
          </View>
          <Text variant="caption" color={colors.mist}>
            Em seguida, 3 questões rápidas calibram seu mapa. Acerte as três sem dicas e você já sobe de nível.
          </Text>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: { alignItems: 'center', gap: space.md, paddingTop: space.xxl },
  step: { gap: space.lg, paddingTop: space.lg },
  dots: { flexDirection: 'row', gap: space.sm, justifyContent: 'center', paddingTop: space.sm },
  dot: { width: 28, height: 4, borderRadius: 2, backgroundColor: colors.ink600 },
  dotOn: { backgroundColor: colors.brass },
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.ink800,
    paddingHorizontal: space.lg,
    color: colors.parchment,
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.lineSoft,
    backgroundColor: colors.ink800,
  },
  optionSelected: { borderColor: colors.brass, backgroundColor: colors.brassGlow },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.ink500 },
  radioOn: { borderColor: colors.brass, borderWidth: 6 },
});
