/**
 * Fim de sessão: o que você ganhou, o que aprendeu e — sempre — o próximo
 * pequeno passo que vale a pena dar ("fio da meada").
 */
import { Redirect, router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { QUESTIONS, getQuestion } from '../content/bank';
import { findNode } from '../content/regions';
import { subtopicLabel } from '../content/topics';
import { nextNode } from '../domain/campaign/campaign';
import { recommendFocus } from '../domain/learning/recommend';
import { inlineLabel } from '../domain/quests/quests';
import { levelProgress } from '../domain/progression/levels';
import { useStarter } from '../features/useStarter';
import { startExpedition, startFocus, startMission } from '../state/actions';
import { useGame, useGameStore } from '../state/store';
import { Button } from '../ui/Button';
import { useReduceMotion } from '../ui/feedback';
import { Icon, type IconName } from '../ui/Icon';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, radius, space } from '../ui/theme';

function formatDuration(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60000));
  return `${min} min`;
}

function Stat({ icon, value, label, color }: { icon: IconName; value: string; label: string; color: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={18} color={color} fill={icon === 'bolt' || icon === 'ink' ? color : 'none'} strokeWidth={icon === 'bolt' || icon === 'ink' ? 1 : 1.75} />
      <Text variant="title" color={color}>
        {value}
      </Text>
      <Text variant="caption" color={colors.mist}>
        {label}
      </Text>
    </View>
  );
}

export default function Summary() {
  const reduce = useReduceMotion();
  const summary = useGameStore((s) => s.lastSummary);
  const profile = useGame((g) => g.profile);
  const questionStates = useGame((g) => g.questionStates);
  const campaign = useGame((g) => g.campaign);
  const bosses = useGame((g) => g.bosses);
  const { busy, start } = useStarter();
  const focus = useMemo(() => recommendFocus(QUESTIONS, questionStates), [questionStates]);

  if (!summary) return <Redirect href="/camp" />;

  const progress = levelProgress(profile.xp);
  const next = nextNode({ progress: campaign, bosses });
  const missionNode = summary.nodeId ? findNode(summary.nodeId)?.node : undefined;
  const totalXp = summary.xp + summary.bonusXp + summary.missionXp;
  const enter = (i: number) => (reduce ? undefined : FadeInDown.delay(80 * i).duration(380));

  const title =
    summary.mode === 'mission'
      ? summary.missionPassed
        ? 'Missão cumprida!'
        : 'Quase lá.'
      : summary.perfect
        ? 'Expedição impecável!'
        : 'Expedição concluída';

  const subtitle =
    summary.mode === 'mission' && missionNode
      ? summary.missionPassed
        ? `${missionNode.title} foi redesenhada no seu Atlas.`
        : `Você precisa de ${missionNode.kind === 'mission' ? missionNode.passCorrect : 3} acertos para concluir “${missionNode.title}”. O XP desta tentativa já é seu.`
      : summary.answered === 0
        ? 'Nenhuma questão respondida desta vez.'
        : `${summary.correct} de ${summary.answered} acertos em ${formatDuration(summary.durationMs)}.`;

  // Próximo passo: missão falhada → tentar de novo; Ecos criados → lembrete; senão campanha/recomendação.
  const nextStep = (() => {
    if (summary.mode === 'mission' && !summary.missionPassed && summary.nodeId) {
      const id = summary.nodeId;
      return { label: 'Tentar a missão de novo', detail: 'As questões serão outras — o que errou vira Eco para revisar.', action: () => start('retry', () => startMission(id), { replace: true }) };
    }
    if (next && next.node.kind === 'boss') {
      const bossNode = next.node;
      return {
        label: `Enfrentar ${bossNode.title}`,
        detail: `O guardião de ${next.region.name} está à sua espera.`,
        action: () => router.replace(`/boss?id=${bossNode.bossId}`),
      };
    }
    if (next && next.node.kind === 'mission') {
      const node = next.node;
      return { label: node.title, detail: `${node.subtitle} · próxima missão do Atlas`, action: () => start('next', () => startMission(node.id), { replace: true }) };
    }
    if (focus) {
      const f = focus;
      return { label: `Treinar ${inlineLabel(subtopicLabel(f.topic, f.subtopic))}`, detail: '5 questões no ponto que mais vai render agora.', action: () => start('focus', () => startFocus(f.topic, f.subtopic), { replace: true }) };
    }
    return { label: 'Mais uma expedição de 5 min', detail: 'Rápida e adaptada a você.', action: () => start('exp', () => startExpedition(5), { replace: true }) };
  })();

  return (
    <Screen
      footer={
        <>
          <Button label={nextStep.label} icon="play" onPress={nextStep.action} loading={busy !== null} />
          <Button label="Voltar ao acampamento" variant="ghost" onPress={() => router.replace('/camp')} />
        </>
      }
    >
      <Animated.View entering={reduce ? undefined : ZoomIn.duration(360)} style={styles.head}>
        <View style={[styles.seal, { borderColor: summary.missionPassed === false ? colors.mist : colors.brass }]}>
          <Icon name={summary.missionPassed === false ? 'flag' : 'sparkle'} size={34} color={summary.missionPassed === false ? colors.mist : colors.brass} fill={summary.missionPassed === false ? 'none' : colors.brassGlow} />
        </View>
        <Text variant="title" align="center">
          {title}
        </Text>
        <Text variant="body" color={colors.parchmentDim} align="center">
          {subtitle}
        </Text>
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.stats}>
        <Stat icon="bolt" value={`+${totalXp}`} label="XP" color={colors.brass} />
        <Stat icon="check" value={`${summary.correct}/${summary.answered}`} label="acertos" color={colors.verdigris} />
        <Stat icon="ink" value={`+${summary.ink + summary.missionInk}`} label="Tinta" color={colors.iris} />
      </Animated.View>

      <Animated.View entering={enter(2)}>
        <Panel>
          <View style={styles.levelRow}>
            <Text variant="subheading">Nível {progress.level}</Text>
            <Text variant="caption" color={colors.brass}>
              {progress.isMax ? 'máximo' : `faltam ${progress.remaining} XP`}
            </Text>
          </View>
          <ProgressBar value={progress.ratio} ticks={10} height={12} delay={250} />
          <View style={styles.breakdown}>
            {summary.bonusXp > 0 ? <Text variant="caption" color={colors.mist}>Bônus de sessão {summary.perfect ? 'perfeita ' : ''}+{summary.bonusXp}</Text> : null}
            {summary.missionFirstClear ? <Text variant="caption" color={colors.mist}>Primeira conclusão da missão +{summary.missionXp}</Text> : null}
            {summary.restedBonus > 0 ? <Text variant="caption" color={colors.verdigris}>Descanso do Viajante +{summary.restedBonus}</Text> : null}
          </View>
        </Panel>
      </Animated.View>

      {summary.redemptions.length > 0 ? (
        <Animated.View entering={enter(3)} style={styles.note}>
          <Icon name="sparkle" size={20} color={colors.verdigris} fill={colors.verdigrisGlow} />
          <Text variant="body" style={{ flex: 1 }}>
            Você redimiu {summary.redemptions.length} Eco{summary.redemptions.length > 1 ? 's' : ''}: errar e depois acertar é exatamente como se aprende.
          </Text>
        </Animated.View>
      ) : null}

      {summary.echoes.length > 0 ? (
        <Animated.View entering={enter(4)} style={styles.note}>
          <Icon name="echo" size={20} color={colors.iris} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="body">
              {summary.echoes.length} Eco{summary.echoes.length > 1 ? 's' : ''} {summary.echoes.length > 1 ? 'voltarão' : 'voltará'} amanhã para revisão:
            </Text>
            {summary.echoes.slice(0, 4).map((id) => {
              const q = getQuestion(id);
              return (
                <Text key={id} variant="caption" color={colors.mist}>
                  · {subtopicLabel(q.topic, q.subtopic)}
                </Text>
              );
            })}
          </View>
        </Animated.View>
      ) : null}

      <Animated.View entering={enter(5)}>
        <Text variant="label" color={colors.mist} style={{ marginBottom: space.xs }}>
          Próximo passo
        </Text>
        <Text variant="body" color={colors.parchmentDim}>
          {nextStep.detail}
        </Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: space.sm, paddingTop: space.xl },
  seal: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
    backgroundColor: colors.ink800,
  },
  stats: { flexDirection: 'row', gap: space.sm },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.sm },
  breakdown: { marginTop: space.sm, gap: 2 },
  note: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
});
