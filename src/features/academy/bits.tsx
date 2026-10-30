/** Peças pequenas da Academia: selo de estado, trilha de etapas e cartão de recomendação. */
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { findStage, parseRef } from '../../content/academy/catalog';
import { STAGE_KIND_LABEL, type Lesson } from '../../content/academy/types';
import { isReviewDue, stageStatus, type StageProgress } from '../../domain/academy/progress';
import type { StageRec } from '../../domain/academy/recommend';
import { haptic } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import { KIND_TONE, STATUS_LOOK } from './look';

export type StageMode = 'learn' | 'practice' | 'challenge';

export function stageHref(ref: string, mode: StageMode = 'learn') {
  const { lessonId, stageId } = parseRef(ref);
  return `/stage?lesson=${encodeURIComponent(lessonId)}&stage=${encodeURIComponent(stageId)}&mode=${mode}` as const;
}

export function openStage(ref: string, mode: StageMode = 'learn') {
  router.push(stageHref(ref, mode));
}

export function StatusBadge({ progress, now }: { progress: StageProgress | undefined; now: number }) {
  const status = stageStatus(progress);
  const review = isReviewDue(progress, now);
  const look = STATUS_LOOK[status];
  const color = review ? colors.iris : look.color;
  return (
    <View style={[styles.badge, { borderColor: color }]} accessible accessibilityLabel={review ? 'Dominada, revisão pronta' : look.label}>
      <Icon name={review ? 'refresh' : look.icon} size={12} color={color} fill={status === 'dominado' && !review ? colors.verdigrisGlow : 'none'} strokeWidth={2} />
      <Text variant="caption" color={color} style={styles.badgeText}>
        {review ? 'Revisar' : look.label}
      </Text>
    </View>
  );
}

/** Uma bolinha por etapa: vazia, vista, estudada ou dominada. */
export function StagePips({ lesson, academy }: { lesson: Lesson; academy: Record<string, StageProgress> }) {
  return (
    <View style={styles.pips} accessible accessibilityLabel={`${lesson.stages.length} etapas`}>
      {lesson.stages.map((s) => {
        const status = stageStatus(academy[`${lesson.id}/${s.id}`]);
        const color = status === 'dominado' ? colors.verdigris : status === 'estudado' ? colors.brass : status === 'visto' ? colors.mist : colors.ink500;
        return <View key={s.id} style={[styles.pip, { borderColor: color }, status !== 'novo' && { backgroundColor: color }]} />;
      })}
    </View>
  );
}

const REASON_LABEL: Record<StageRec['reason'], string> = {
  'erros-recentes': 'Erros recentes',
  dificuldade: 'Dificuldade identificada',
  atencao: 'Vale revisar',
  revisao: 'Revisão de domínio',
  continuar: 'Continuar',
  preparo: 'Preparação',
};

const ACTION_LABEL: Record<StageRec['action'], string> = {
  estudar: 'Estudar',
  testar: 'Testar no Atlas',
  revisar: 'Revisar',
};

export function RecCard({ rec, onTest }: { rec: StageRec; onTest?: (ref: string) => void }) {
  const loc = findStage(rec.ref);
  if (!loc) return null;
  const tone = rec.reason === 'erros-recentes' || rec.reason === 'dificuldade' ? colors.ember : rec.reason === 'revisao' ? colors.iris : rec.reason === 'atencao' ? colors.brass : colors.verdigris;
  const go = () => {
    haptic('select');
    if (rec.action === 'testar' && onTest) onTest(rec.ref);
    else openStage(rec.ref, rec.action === 'revisar' ? 'challenge' : 'learn');
  };
  return (
    <Pressable
      onPress={go}
      accessibilityRole="button"
      accessibilityLabel={`${REASON_LABEL[rec.reason]}: ${loc.lesson.title}, ${loc.stage.title}. ${rec.detail}. ${ACTION_LABEL[rec.action]}.`}
      style={({ pressed }) => [styles.rec, { borderLeftColor: tone, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="label" color={tone}>
          {REASON_LABEL[rec.reason]} · {STAGE_KIND_LABEL[loc.stage.kind]}
        </Text>
        <Text variant="subheading">
          {loc.lesson.title}: {loc.stage.title}
        </Text>
        <Text variant="caption" color={colors.parchmentDim}>
          {rec.detail}
        </Text>
      </View>
      <View style={styles.recAction}>
        <Text variant="caption" color={colors.brass}>
          {ACTION_LABEL[rec.action]}
        </Text>
        <Icon name="chevronRight" size={16} color={colors.brass} />
      </View>
    </Pressable>
  );
}

export function KindTag({ kind }: { kind: keyof typeof KIND_TONE }) {
  return (
    <Text variant="label" color={KIND_TONE[kind]}>
      {STAGE_KIND_LABEL[kind]}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12 },
  pips: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  pip: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  rec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderLeftWidth: 3,
  },
  recAction: { alignItems: 'flex-end', gap: 2 },
});
