import { router, useIsFocused } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { QUESTIONS } from '../content/bank';
import { getTopic, subtopicLabel } from '../content/topics';
import type { TopicId } from '../content/types';
import { MASTERY_LABEL, masteryBySubtopic } from '../domain/learning/mastery';
import { learningProgress, learningWeekStart } from '../domain/learning/progress';
import { recommendFocus } from '../domain/learning/recommend';
import { useStarter } from '../features/useStarter';
import { loadLearningActivity, startFocus } from '../state/actions';
import { useGame } from '../state/store';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Panel } from '../ui/Panel';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, radius, space } from '../ui/theme';

type Report = ReturnType<typeof learningProgress>;
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function Progress() {
  const focused = useIsFocused();
  const states = useGame(g => g.questionStates);
  const tz = useGame(g => g.profile.tzOffsetMin);
  const session = useGame(g => g.session);
  const battle = useGame(g => g.battle);
  const { busy, start } = useStarter();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!focused) return;
    let active = true;
    const now = Date.now();
    loadLearningActivity(learningWeekStart(now, tz)).then(attempts => {
      if (active) {
        setReport(learningProgress(attempts, now, tz));
        setError(false);
      }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [focused, tz, retry]);
  const mastery = useMemo(() => [...masteryBySubtopic(QUESTIONS, states)]
    .filter(([, info]) => info.n > 0)
    .sort((a, b) => a[1].estimate - b[1].estimate || a[0].localeCompare(b[0])), [states]);
  const recommendation = useMemo(() => recommendFocus(QUESTIONS, states), [states]);
  const maxDay = Math.max(1, ...(report?.days.map(d => d.answered) ?? []));

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon="chevronLeft" label="Voltar" onPress={() => router.back()} />
        <Text variant="title">Sua evolução</Text>
      </View>
      <Text variant="body" color={colors.mist}>Cada questão deixa um traço. Veja o que você praticou e o que pode fortalecer.</Text>
      <Panel>
        <Text variant="subheading">Esta semana</Text>
        <Text variant="caption" color={colors.mist}>De segunda a domingo, no seu fuso atual.</Text>
        {error ? (
          <View style={styles.section}>
            <Text>Não foi possível carregar sua atividade.</Text>
            <Button label="Tentar novamente" variant="secondary" onPress={() => { setError(false); setReport(null); setRetry(r => r + 1); }} />
          </View>
        ) : !report ? <Text accessibilityLiveRegion="polite">Carregando sua semana…</Text> : (
          <View style={styles.section}>
            <View style={styles.stats}>
              <View style={styles.stat}><Text variant="title">{report.answered}</Text><Text variant="caption">respostas</Text></View>
              <View style={styles.stat}><Text variant="title">{report.accuracy === null ? '—' : `${report.accuracy}%`}</Text><Text variant="caption">de acerto</Text></View>
              <View style={styles.stat}><Text variant="title">{report.activeDays}</Text><Text variant="caption">dias de prática</Text></View>
            </View>
            <Text variant="caption" color={colors.mist}>
              {report.accuracy === null ? 'O percentual aparece após 10 respostas na semana. ' : ''}
              {report.correct} acertos, sendo {report.confidentCorrect} sem marcar chute. Repetições também entram na atividade.
            </Text>
            <View style={styles.chart}>
              {report.days.map((d, i) => (
                <View key={d.date} style={styles.day} accessible accessibilityLabel={`${WEEKDAYS[i]}, ${d.date}: ${d.answered} respostas, ${d.correct} acertos`}>
                  <Text variant="caption">{d.answered}</Text>
                  <View style={styles.track}><View style={[styles.bar, { height: `${d.answered / maxDay * 100}%` }]} /></View>
                  <Text variant="caption" color={colors.mist}>{WEEKDAYS[i]}</Text>
                </View>
              ))}
            </View>
            <Text variant="caption" color={colors.mist}>Respostas por dia · seus registros desta semana</Text>
          </View>
        )}
      </Panel>
      <Button label="Histórico de erros" icon="book" variant="secondary" onPress={() => router.push('/mistakes')} />
      {recommendation ? (
        <Panel>
          <Text variant="label" color={colors.brass}>Próximo pequeno passo</Text>
          <Text variant="subheading">{subtopicLabel(recommendation.topic, recommendation.subtopic)}</Text>
          <Text variant="body" color={colors.mist}>
            {recommendation.reason === 'fraco' ? 'Este assunto merece uma nova passagem com calma.' :
              recommendation.reason === 'inexplorado' ? 'Uma nova parte do mapa espera por você.' :
                recommendation.reason === 'descoberta' ? 'Você já começou. Mais prática ajuda a firmar a base.' : 'Voltar a este assunto ajuda a consolidar o que aprendeu.'}
          </Text>
          <Button
            label={session ? 'Retomar a sessão pausada' : battle?.status === 'active' ? 'Retomar a batalha' : 'Treinar este assunto'}
            loading={!!busy}
            onPress={() => session ? router.push('/session') : battle?.status === 'active' ? router.push('/boss') :
              start('focus', () => startFocus(recommendation.topic, recommendation.subtopic))}
          />
        </Panel>
      ) : null}
      <View style={styles.section}>
        <Text variant="heading">Mapa do conhecimento</Text>
        <Text variant="caption" color={colors.mist}>Seu histórico completo, começando pelos assuntos que pedem mais atenção. Domínio exige evidência espaçada; XP mede esforço.</Text>
        {mastery.length === 0 ? <Text>Responda às primeiras questões para começar a desenhar este mapa.</Text> : mastery.map(([key, info]) => {
          const [topic, subtopic] = key.split('/') as [TopicId, string];
          return (
            <View key={key} style={styles.topic}>
              <Text variant="caption" color={colors.mist}>{getTopic(topic).label}</Text>
              <Text variant="subheading">{subtopicLabel(topic, subtopic)}</Text>
              <Text variant="body" color={info.level === 'dominado' || info.level === 'firme' ? colors.verdigris : colors.brass}>{MASTERY_LABEL[info.level]}</Text>
              <Text variant="caption" color={colors.mist}>{info.n} respostas com evidência · {info.spaced} questões com revisão espaçada</Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  section: { gap: space.md, marginTop: space.md },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  stat: { flex: 1, minWidth: 70, gap: space.xs },
  chart: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' },
  day: { flex: 1, alignItems: 'center', gap: space.xs },
  track: { height: 84, width: 16, justifyContent: 'flex-end', backgroundColor: colors.ink700, borderRadius: radius.sm, overflow: 'hidden' },
  bar: { backgroundColor: colors.brass, width: '100%' },
  topic: { gap: space.xs, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.line },
});
