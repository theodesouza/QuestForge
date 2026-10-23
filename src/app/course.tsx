/** Matéria da Academia (rota /course?topic=…): as aulas em ordem, com o progresso de cada uma. */
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { findCourse, findLesson } from '../content/academy/catalog';
import type { Course } from '../content/academy/types';
import { courseSummary, lessonSealed, lessonSummary } from '../domain/academy/progress';
import { StagePips } from '../features/academy/bits';
import { TONE } from '../features/academy/look';
import { useGame, useGameStore } from '../state/store';
import { haptic } from '../ui/feedback';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';
import { RichText } from '../ui/RichText';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, radius, space } from '../ui/theme';

export default function CourseScreen() {
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const course = topic ? findCourse(topic) : undefined;
  if (!course) return <Redirect href="/academy" />;
  return <CourseView course={course} />;
}

function CourseView({ course }: { course: Course }) {
  const academy = useGame((g) => g.academy);
  const now = useGameStore((s) => s.now);
  const tone = TONE[course.tone];
  const sum = courseSummary(course, academy, now);
  return (
    <Screen glow={tone}>
      <View style={styles.header}>
        <IconButton icon="chevronLeft" label="Voltar" onPress={() => router.back()} color={colors.parchment} />
        <Text variant="label" color={tone}>
          Academia · matéria
        </Text>
      </View>
      <Text variant="title">{course.title}</Text>
      <Text variant="body" color={colors.parchmentDim}>
        {course.tagline}
      </Text>
      <Panel tone="raised" accent={tone}>
        <Text variant="caption" color={colors.mist}>
          {sum.mastered} de {sum.stages} etapas dominadas · {sum.studied} estudadas
        </Text>
        <ProgressBar value={sum.mastered / Math.max(1, sum.stages)} color={tone} height={8} />
      </Panel>
      <View style={{ gap: space.md }}>
        {course.lessons.map((lesson, i) => {
          const s = lessonSummary(lesson, academy, now);
          const sealed = lessonSealed(lesson, academy);
          const reqs = lesson.requires.map((r) => findLesson(r)?.title).filter(Boolean);
          return (
            <Pressable
              key={lesson.id}
              onPress={() => {
                haptic('select');
                router.push(`/lesson?id=${lesson.id}`);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Aula ${i + 1}: ${lesson.title}. ${s.mastered} de ${s.stages} etapas dominadas${sealed ? ', com selo de domínio' : ''}.`}
              style={({ pressed }) => [styles.lesson, { borderLeftColor: tone, opacity: pressed ? 0.88 : 1 }]}
            >
              <View style={styles.row}>
                <Text variant="number" color={colors.mist}>
                  {i + 1}
                </Text>
                <Text variant="subheading" style={{ flex: 1 }}>
                  {lesson.title}
                </Text>
                {sealed ? <Icon name="seal" size={20} color={colors.verdigris} fill={colors.verdigrisGlow} /> : <Icon name="chevronRight" size={18} color={colors.mist} />}
              </View>
              <RichText text={lesson.summary} variant="caption" color={colors.parchmentDim} />
              <View style={styles.row}>
                <StagePips lesson={lesson} academy={academy} />
                <Text variant="caption" color={colors.mist}>
                  {s.mastered}/{s.stages} dominadas
                </Text>
              </View>
              {reqs.length ? (
                <Text variant="caption" color={colors.mistDim}>
                  Ajuda ter visto: {reqs.join(', ')}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.sm },
  lesson: {
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderLeftWidth: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
