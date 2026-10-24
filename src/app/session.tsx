/**
 * Tela de questão — a mais usada do app. Leitura confortável, toque fácil,
 * feedback imediato e explicação clara. Efeitos só depois da resposta.
 */
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { findQuestion } from '../content/bank';
import { findNode } from '../content/regions';
import { currentQuestionId } from '../domain/game/game';
import { AnswerBar } from '../features/question/AnswerBar';
import { QuestionBody } from '../features/question/QuestionBody';
import { ScaffoldLesson } from '../features/question/ScaffoldLesson';
import { useAttempt } from '../features/question/useAttempt';
import { RouteTrail } from '../features/session/RouteTrail';
import { abandon, acknowledgeScaffold, answer, finish, skip } from '../state/actions';
import { useGame, useGameStore } from '../state/store';
import { useReduceMotion } from '../ui/feedback';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { MapBackdrop } from '../ui/MapBackdrop';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { colors, space } from '../ui/theme';

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const session = useGame((g) => g.session);
  const current = session ? currentQuestionId(session) : null;
  // A questão exibida só muda quando o jogador toca "Continuar" (o domínio já avançou).
  const [pinnedId, setShownId] = useState<string | null>(current);
  const shownId = pinnedId ?? current;
  const [leaving, setLeaving] = useState(false);
  const [readingBusy, setReadingBusy] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  const lesson = session?.scaffoldLesson?.practiceQuestionId === shownId ? session.scaffoldLesson : null;
  const example = lesson ? findQuestion(lesson.exampleQuestionId) : undefined;
  const showingLesson = !!lesson && !!example;
  const attempt = useAttempt(showingLesson ? null : shownId);
  const scroll = useRef<ScrollView>(null);
  const feedbackOffset = useRef(0);
  const reduce = useReduceMotion();

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [shownId, showingLesson]);

  if (!session) return leaving ? null : <Redirect href="/camp" />;

  const question = shownId ? findQuestion(shownId) : undefined;
  const title =
    session.mode === 'mission' && session.nodeId ? findNode(session.nodeId)?.node.title ?? 'Missão' : 'Expedição';

  const latestSession = () => useGameStore.getState().game?.session ?? null;

  const wrapUp = async () => {
    setLeaving(true);
    try {
      await finish();
      router.replace('/summary');
    } catch (e) {
      setLeaving(false);
      Alert.alert('Não foi possível concluir', e instanceof Error ? e.message : String(e));
    }
  };

  const onContinue = () => {
    const s = latestSession();
    const next = s ? currentQuestionId(s) : null;
    if (next) setShownId(next);
    else wrapUp();
  };

  const onLessonRead = async () => {
    if (!lesson || readingBusy) return;
    setReadingBusy(true);
    setReadingError(null);
    try {
      await acknowledgeScaffold(lesson.practiceQuestionId);
    } catch {
      setReadingError('Não foi possível salvar. Tente novamente; seu reforço continua aqui.');
    } finally {
      setReadingBusy(false);
    }
  };

  const onSkip = async () => {
    try {
      await skip();
      const s = latestSession();
      setShownId(s ? currentQuestionId(s) : null);
    } catch (e) {
      Alert.alert('Não foi possível pular', e instanceof Error ? e.message : String(e));
    }
  };

  const onClose = () => {
    const answered = session.answers.filter((a) => a.kind !== 'skipped').length;
    Alert.alert('Pausar a expedição?', 'Suas respostas já estão salvas. Você pode retomar do mesmo ponto pelo Acampamento.', [
      { text: 'Continuar estudando', style: 'cancel' },
      { text: 'Pausar e sair', onPress: () => router.back() },
      answered > 0
        ? { text: 'Encerrar agora', onPress: wrapUp }
        : {
            text: 'Descartar',
            style: 'destructive',
            onPress: async () => {
              setLeaving(true);
              await abandon();
              router.back();
            },
          },
    ]);
  };

  return (
    <View style={styles.root}>
      <MapBackdrop />
      <View style={[styles.top, { paddingTop: insets.top + space.xs }]}>
        <IconButton icon="close" label="Pausar ou sair" onPress={onClose} color={colors.parchment} />
        <View style={styles.topCenter}>
          <Text variant="label" color={colors.mist} numberOfLines={1}>
            {title}
          </Text>
          <RouteTrail total={session.queue.length} answers={session.answers} currentIndex={attempt.outcome ? session.index - 1 : session.index} />
        </View>
        <View style={styles.xp} accessible accessibilityLabel={`${session.xp} XP nesta sessão`}>
          <Icon name="bolt" size={15} color={colors.brass} fill={colors.brass} strokeWidth={1} />
          <Text variant="number" color={colors.brass}>
            {session.xp}
          </Text>
        </View>
      </View>

      <ScrollView ref={scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {question && showingLesson && example ? <ScaffoldLesson example={example} practice={question} /> : question ? (
          <QuestionBody
            question={question}
            attempt={attempt}
            attemptKey={session.id}
            onFeedbackLayout={(y) => scroll.current?.scrollTo({ y: Math.max(0, y + feedbackOffset.current - 140), animated: !reduce })}
          />
        ) : null}
      </ScrollView>

      {question ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
          {showingLesson ? (
            <>
              {readingError ? <Text variant="caption" color={colors.ember} accessibilityLiveRegion="polite">{readingError}</Text> : null}
              <Button label="Agora vou tentar" onPress={onLessonRead} loading={readingBusy} iconRight="chevronRight" />
            </>
          ) : <AnswerBar
            attempt={attempt}
            onConfirm={() => attempt.submit(answer)}
            onContinue={onContinue}
            onSkip={onSkip}
            continueLabel={session.scaffoldLesson && findQuestion(session.scaffoldLesson.exampleQuestionId) ? 'Ver exemplo resolvido' : latestSession() && currentQuestionId(latestSession()!) ? 'Próxima questão' : 'Concluir expedição'}
          />}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink900 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm, paddingBottom: space.sm },
  topCenter: { flex: 1, gap: 6 },
  xp: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 52, justifyContent: 'flex-end', paddingRight: space.sm },
  content: { paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.xxxl },
  footer: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    backgroundColor: colors.ink900,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
});
