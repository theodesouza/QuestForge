/**
 * Academia — onde se aprende. Continue de onde parou, veja o que as evidências recomendam
 * (com honestidade quando ainda faltam dados) e escolha qualquer matéria, aula ou etapa:
 * nada fica trancado.
 */
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COURSES, LESSONS, findStage } from '../../content/academy/catalog';
import { STAGE_KIND_LABEL } from '../../content/academy/types';
import { courseSummary, lastActiveStage, lessonSealed } from '../../domain/academy/progress';
import { recommendStages } from '../../domain/academy/recommend';
import { RecCard, openStage } from '../../features/academy/bits';
import { TONE } from '../../features/academy/look';
import { useStarter } from '../../features/useStarter';
import { startStageDrill } from '../../state/actions';
import { useGame, useGameStore } from '../../state/store';
import { useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { Panel } from '../../ui/Panel';
import { ProgressBar } from '../../ui/ProgressBar';
import { Screen } from '../../ui/Screen';
import { Text } from '../../ui/Text';
import { TAB_BAR_SPACE, colors, radius, space } from '../../ui/theme';

export default function Academy() {
  const reduce = useReduceMotion();
  const academy = useGame((g) => g.academy);
  const questionStates = useGame((g) => g.questionStates);
  const campaign = useGame((g) => g.campaign);
  const bosses = useGame((g) => g.bosses);
  const now = useGameStore((s) => s.now);
  const { start } = useStarter();
  const enter = (i: number) => (reduce ? undefined : FadeInDown.delay(60 * i).duration(360));

  const recs = useMemo(
    () => recommendStages({ questionStates, academy, campaign, bosses }, now, { limit: 3 }),
    [questionStates, academy, campaign, bosses, now],
  );
  const last = lastActiveStage(academy);
  const lastLoc = last ? findStage(last.ref) : undefined;
  const totals = useMemo(() => {
    const all = Object.values(academy);
    return {
      viewed: all.filter((p) => p.viewedAt !== null).length,
      studied: all.filter((p) => p.studiedAt !== null).length,
      mastered: all.filter((p) => p.masteredAt !== null).length,
      reviews: all.filter((p) => p.masteredAt !== null && p.dueAt !== null && p.dueAt <= now).length,
      seals: LESSONS.filter((l) => lessonSealed(l, academy)).length,
      stages: LESSONS.reduce((n, l) => n + l.stages.length, 0),
    };
  }, [academy, now]);
  const evidenceBased = recs.some((r) => r.reason === 'dificuldade' || r.reason === 'atencao' || r.reason === 'erros-recentes');

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <View>
        <Text variant="caption" color={colors.mist}>
          Aprenda no seu ritmo — qualquer etapa, a qualquer momento
        </Text>
        <Text variant="title">Academia</Text>
      </View>

      {lastLoc && last ? (
        <Animated.View entering={enter(0)}>
          <Pressable
            onPress={() => openStage(last.ref)}
            accessibilityRole="button"
            accessibilityLabel={`Continuar: ${lastLoc.lesson.title}, ${lastLoc.stage.title}`}
            style={styles.resume}
          >
            <Icon name="play" size={18} color={colors.ink900} fill={colors.ink900} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" color={colors.ink900}>
                Continue de onde parou
              </Text>
              <Text variant="caption" color={colors.ink700}>
                {lastLoc.lesson.title} · {lastLoc.stage.title}
              </Text>
            </View>
            <Text variant="bodyStrong" color={colors.ink900}>
              Abrir
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <Animated.View entering={enter(1)} style={styles.stats}>
        <Stat value={totals.studied} label="etapas estudadas" />
        <Stat value={totals.mastered} label="dominadas" color={colors.verdigris} />
        <Stat value={totals.seals} label="insígnias" color={colors.iris} />
      </Animated.View>

      <Animated.View entering={enter(2)} style={{ gap: space.md }}>
        <View style={styles.sectionHead}>
          <Text variant="subheading">Recomendado para você</Text>
          {totals.reviews > 0 ? (
            <Text variant="caption" color={colors.iris}>
              {totals.reviews} revis{totals.reviews > 1 ? 'ões' : 'ão'} pronta{totals.reviews > 1 ? 's' : ''}
            </Text>
          ) : null}
        </View>
        {recs.map((r) => (
          <RecCard key={r.ref} rec={r} onTest={(ref) => start('drill', () => startStageDrill(ref))} />
        ))}
        {!evidenceBased ? (
          <Panel tone="sunken" accent={colors.mistDim}>
            <View style={styles.row}>
              <Icon name="eye" size={18} color={colors.mist} />
              <Text variant="caption" color={colors.mist} style={{ flex: 1 }}>
                Ainda não há evidências suficientes para apontar dificuldades. Conforme você responder questões nas missões e chefões, a Academia mostra aqui exatamente a etapa que ensina o que faltou — um erro isolado nunca vira diagnóstico.
              </Text>
            </View>
          </Panel>
        ) : null}
      </Animated.View>

      <Animated.View entering={enter(3)} style={{ gap: space.md }}>
        <Text variant="subheading">Matérias</Text>
        {COURSES.filter((c) => c.lessons.length > 0).map((c) => {
          const s = courseSummary(c, academy, now);
          const tone = TONE[c.tone];
          return (
            <Pressable
              key={c.topic}
              onPress={() => router.push(`/course?topic=${c.topic}`)}
              accessibilityRole="button"
              accessibilityLabel={`${c.title}: ${c.lessons.length} aulas, ${s.mastered} de ${s.stages} etapas dominadas`}
              style={({ pressed }) => [styles.course, { borderTopColor: tone, opacity: pressed ? 0.88 : 1 }]}
            >
              <View style={styles.row}>
                <Text variant="subheading" style={{ flex: 1 }}>
                  {c.title}
                </Text>
                <Text variant="caption" color={colors.mist}>
                  {c.lessons.length} aula{c.lessons.length > 1 ? 's' : ''}
                </Text>
              </View>
              <Text variant="caption" color={colors.parchmentDim}>
                {c.tagline}
              </Text>
              <ProgressBar value={s.mastered / Math.max(1, s.stages)} color={tone} height={6} accessibilityLabel={`${s.mastered} de ${s.stages} etapas dominadas`} />
              <Text variant="caption" color={colors.mistDim}>
                {s.studied} de {s.stages} etapas estudadas · {s.mastered} {s.mastered === 1 ? 'dominada' : 'dominadas'}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>

      <Panel tone="sunken" accent={colors.mistDim}>
        <Text variant="label" color={colors.mist} style={{ marginBottom: space.xs }}>
          Como funciona
        </Text>
        <Text variant="caption" color={colors.parchmentDim}>
          Cada aula tem etapas da {STAGE_KIND_LABEL.descoberta.toLowerCase()} à {STAGE_KIND_LABEL.maestria.toLowerCase()}. Em cada etapa: Aprender (explicação com
          laboratórios e exemplos), Praticar (com lanternas de dica) e Desafiar (sem ajuda). Uma etapa só fica dominada quando o desafio é vencido sem
          dicas — e volta para uma revisão rápida dias depois.
        </Text>
      </Panel>
    </Screen>
  );
}

function Stat({ value, label, color = colors.brass }: { value: number; label: string; color?: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Text variant="title" color={color}>
        {value}
      </Text>
      <Text variant="caption" color={colors.mist} align="center">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.brass,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    minHeight: 60,
  },
  stats: { flexDirection: 'row', gap: space.sm },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  course: {
    gap: space.xs,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderTopWidth: 3,
  },
});
