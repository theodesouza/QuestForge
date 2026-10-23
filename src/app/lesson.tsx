/**
 * Aula (rota /lesson?id=…): todas as etapas abertas para consulta, o estado de cada uma
 * (vista, estudada, dominada, revisar), as evidências do Atlas, os pré-requisitos sugeridos
 * e as missões e chefões que a aula prepara.
 */
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { courseOf, findLesson, questionsForLesson, stageRef } from '../content/academy/catalog';
import type { Lesson } from '../content/academy/types';
import { EVIDENCE_LABEL, stageEvidence } from '../domain/academy/evidence';
import { continueStage, lessonSealed, lessonSummary } from '../domain/academy/progress';
import { preparesFor } from '../domain/academy/recommend';
import { KindTag, StatusBadge, openStage } from '../features/academy/bits';
import { EVIDENCE_COLOR, KIND_TONE, TONE } from '../features/academy/look';
import { useGame, useGameStore } from '../state/store';
import { Button } from '../ui/Button';
import { haptic } from '../ui/feedback';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';
import { RichText } from '../ui/RichText';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, radius, space } from '../ui/theme';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const lesson = id ? findLesson(id) : undefined;
  if (!lesson) return <Redirect href="/academy" />;
  return <LessonView lesson={lesson} />;
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const academy = useGame((g) => g.academy);
  const states = useGame((g) => g.questionStates);
  const now = useGameStore((s) => s.now);
  const [recapOpen, setRecapOpen] = useState(false);
  const course = courseOf(lesson);
  const tone = TONE[course.tone];
  const summary = lessonSummary(lesson, academy, now);
  const sealed = lessonSealed(lesson, academy);
  const next = continueStage(lesson, academy, now);
  const prepares = useMemo(() => preparesFor(lesson), [lesson]);
  const atlas = useMemo(() => {
    const ids = questionsForLesson(lesson);
    const answered = ids.filter((q) => (states[q]?.seen ?? 0) > 0).length;
    const echoes = ids.filter((q) => states[q]?.echo).length;
    return { total: ids.length, answered, echoes };
  }, [lesson, states]);

  return (
    <Screen glow={tone}>
      <View style={styles.header}>
        <IconButton icon="chevronLeft" label="Voltar" onPress={() => router.back()} color={colors.parchment} />
        <Text variant="label" color={tone} style={{ flex: 1 }}>
          {course.title}
        </Text>
        {sealed ? (
          <View style={styles.seal} accessible accessibilityLabel="Selo de domínio conquistado">
            <Icon name="seal" size={16} color={colors.ink900} fill={colors.ink900} />
            <Text variant="label" color={colors.ink900}>
              Selo
            </Text>
          </View>
        ) : null}
      </View>
      <Text variant="title">{lesson.title}</Text>
      <RichText text={lesson.summary} color={colors.parchmentDim} />

      <Panel tone="raised" accent={tone}>
        <View style={styles.statRow}>
          <Stat value={summary.studied} label="estudadas" />
          <Stat value={summary.mastered} label="dominadas" color={colors.verdigris} />
          <Stat value={summary.stages} label="etapas" color={colors.mist} />
        </View>
        <ProgressBar value={summary.mastered / Math.max(1, summary.stages)} color={colors.verdigris} height={8} accessibilityLabel={`${summary.mastered} de ${summary.stages} etapas dominadas`} />
        <Button label={summary.viewed === 0 ? 'Começar a aula' : 'Continuar'} icon="play" onPress={() => openStage(next)} style={{ marginTop: space.md }} />
        {summary.reviewsDue > 0 ? (
          <Text variant="caption" color={colors.iris} style={{ marginTop: space.sm }}>
            {summary.reviewsDue} revisão{summary.reviewsDue > 1 ? 'ões' : ''} de domínio pronta{summary.reviewsDue > 1 ? 's' : ''}.
          </Text>
        ) : null}
      </Panel>

      {lesson.requires.length ? (
        <View style={{ gap: space.sm }}>
          <Text variant="label" color={colors.mist}>
            Ajuda ter visto antes (não é obrigatório)
          </Text>
          <View style={styles.chips}>
            {lesson.requires.map((rid) => {
              const req = findLesson(rid);
              if (!req) return null;
              const s = lessonSummary(req, academy, now);
              return (
                <Pressable
                  key={rid}
                  onPress={() => {
                    haptic('select');
                    router.push(`/lesson?id=${rid}`);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Aula ${req.title}: ${s.mastered} de ${s.stages} etapas dominadas`}
                  style={styles.chip}
                >
                  <Icon name={s.mastered === s.stages ? 'seal' : 'book'} size={14} color={s.mastered === s.stages ? colors.verdigris : colors.brass} />
                  <Text variant="caption" color={colors.parchment}>
                    {req.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {prepares.length || atlas.total ? (
        <View style={styles.atlas}>
          <View style={styles.row}>
            <Icon name="atlas" size={18} color={colors.brass} />
            <Text variant="label" color={colors.brass}>
              Prepara para o Atlas
            </Text>
          </View>
          {prepares.length ? (
            <Text variant="caption" color={colors.parchment}>
              {prepares.map((p) => (p.kind === 'boss' ? `⚔ ${p.label}` : p.label)).join(' · ')}
            </Text>
          ) : null}
          <Text variant="caption" color={colors.parchmentDim}>
            {atlas.total} questões do Atlas usam esta aula; você já respondeu {atlas.answered}
            {atlas.echoes ? ` e tem ${atlas.echoes} Eco${atlas.echoes > 1 ? 's' : ''} em aberto` : ''}.
          </Text>
        </View>
      ) : null}

      <View style={{ gap: space.md }}>
        <Text variant="subheading">Etapas — todas abertas</Text>
        {lesson.stages.map((s, i) => {
          const ref = stageRef(lesson.id, s.id);
          const ev = stageEvidence(ref, states, academy[ref]);
          const showEv = ev.level === 'dificuldade' || ev.level === 'atencao' || ev.level === 'solido';
          return (
            <View key={s.id} style={[styles.stage, { borderLeftColor: KIND_TONE[s.kind] }]}>
              <Pressable
                onPress={() => openStage(ref)}
                accessibilityRole="button"
                accessibilityLabel={`Etapa ${i + 1}: ${s.title}. ${s.goal}`}
                style={({ pressed }) => [{ gap: space.xs, opacity: pressed ? 0.85 : 1 }]}
              >
              <View style={styles.stageHead}>
                <Text variant="number" color={colors.mist}>
                  {i + 1}
                </Text>
                <KindTag kind={s.kind} />
                <View style={{ marginLeft: 'auto' }}>
                  <StatusBadge progress={academy[ref]} now={now} />
                </View>
              </View>
              <Text variant="subheading">{s.title}</Text>
              <RichText text={s.goal} variant="caption" color={colors.parchmentDim} />
              {showEv ? (
                <Text variant="caption" color={EVIDENCE_COLOR[ev.level]}>
                  Atlas: {EVIDENCE_LABEL[ev.level]}
                  {ev.openIds.length ? ` · ${ev.openIds.length} Eco${ev.openIds.length > 1 ? 's' : ''}` : ''}
                </Text>
              ) : null}
              </Pressable>
              <View style={styles.modes}>
                <ModeChip label="Aprender" icon="book" onPress={() => openStage(ref, 'learn')} />
                <ModeChip label="Praticar" icon="lantern" onPress={() => openStage(ref, 'practice')} />
                <ModeChip label="Desafiar" icon="sword" onPress={() => openStage(ref, 'challenge')} />
              </View>
            </View>
          );
        })}
      </View>

      <Panel tone="sunken" accent={colors.mistDim}>
        <Pressable onPress={() => setRecapOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: recapOpen }} style={styles.row}>
          <Icon name="list" size={18} color={colors.brass} />
          <Text variant="subheading" style={{ flex: 1 }}>
            Resumo de bolso da aula
          </Text>
          <Icon name="chevronRight" size={18} color={colors.mist} />
        </Pressable>
        {recapOpen ? (
          <View style={{ gap: space.md, marginTop: space.md }}>
            {lesson.stages.map((s) => (
              <View key={s.id} style={{ gap: space.xs }}>
                <Text variant="label" color={KIND_TONE[s.kind]}>
                  {s.title}
                </Text>
                {s.body().recap.map((r, i) => (
                  <View key={i} style={styles.bullet}>
                    <Text variant="caption" color={colors.brass}>
                      •
                    </Text>
                    <RichText text={r} variant="caption" style={{ flex: 1 }} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </Panel>
    </Screen>
  );
}

function Stat({ value, label, color = colors.brass }: { value: number; label: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="title" color={color}>
        {value}
      </Text>
      <Text variant="caption" color={colors.mist}>
        {label}
      </Text>
    </View>
  );
}

function ModeChip({ label, icon, onPress }: { label: string; icon: 'book' | 'lantern' | 'sword'; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        haptic('select');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={styles.modeChip}
    >
      <Icon name={icon} size={14} color={colors.mist} />
      <Text variant="caption" color={colors.parchment}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.sm },
  seal: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, height: 26, borderRadius: radius.pill, backgroundColor: colors.verdigris },
  statRow: { flexDirection: 'row', marginBottom: space.md },
  stat: { flex: 1, alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ink800,
  },
  atlas: { gap: space.xs, padding: space.lg, borderRadius: radius.lg, backgroundColor: colors.ink850, borderWidth: 1, borderColor: colors.lineSoft },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  stage: {
    gap: space.xs,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderLeftWidth: 3,
  },
  stageHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  modes: { flexDirection: 'row', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.ink850,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  bullet: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
});
