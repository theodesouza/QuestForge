/**
 * Etapa de uma aula (rota /stage?lesson=…&stage=…&mode=learn|practice|challenge).
 * Três experiências: Aprender (explicação revelada em partes, com atividades), Praticar
 * (exercícios com lanternas e feedback específico) e Desafiar (sem ajuda; comprova o domínio).
 * Tudo fica salvo: sair e voltar retoma do mesmo ponto.
 */
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { findStage, questionsForStage, stageRef, type StageLocation } from '../content/academy/catalog';
import { instantiate } from '../content/academy/kit/build';
import { STAGE_KIND_LABEL, type LearnBlock, type StageBody } from '../content/academy/types';
import { challengePassed, challengeSize } from '../domain/academy/challenge';
import { evidenceSentence, stageEvidence } from '../domain/academy/evidence';
import { checkpointIds, isReviewDue, type ChallengeRun, type StageProgress } from '../domain/academy/progress';
import type { GameEvent } from '../domain/game/types';
import { hashString } from '../domain/util/random';
import { StatusBadge, stageHref, type StageMode } from '../features/academy/bits';
import { ExerciseView } from '../features/academy/ExerciseView';
import { blocksProgress, LearnBlockView } from '../features/academy/LearnBlocks';
import { KIND_TONE } from '../features/academy/look';
import { useStarter } from '../features/useStarter';
import {
  academyAbandonChallenge,
  academyChallengeAnswer,
  academyLearnDone,
  academyLearnPos,
  academyPractice,
  academyStartChallenge,
  academyView,
  startStageDrill,
} from '../state/actions';
import { useGame, useGameStore } from '../state/store';
import { Button } from '../ui/Button';
import { calm } from '../ui/calm';
import { useReduceMotion } from '../ui/feedback';
import { Icon, type IconName } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { MapBackdrop } from '../ui/MapBackdrop';
import { RichText } from '../ui/RichText';
import { Text } from '../ui/Text';
import { colors, radius, space } from '../ui/theme';

const MODES: { mode: StageMode; label: string; icon: IconName }[] = [
  { mode: 'learn', label: 'Aprender', icon: 'book' },
  { mode: 'practice', label: 'Praticar', icon: 'lantern' },
  { mode: 'challenge', label: 'Desafiar', icon: 'sword' },
];

const INTERACTIVE: LearnBlock['kind'][] = ['check', 'example', 'lab', 'sim', 'reveal'];

/** Revela blocos até a próxima atividade (inclusive): a explicação chega em partes digeríveis. */
function chunkEnd(blocks: LearnBlock[], start: number): number {
  let i = start;
  while (i < blocks.length) {
    i++;
    if (INTERACTIVE.includes(blocks[i - 1].kind)) break;
  }
  return i;
}

export default function StageScreen() {
  const params = useLocalSearchParams<{ lesson?: string; stage?: string; mode?: string }>();
  const loc = params.lesson && params.stage ? findStage(stageRef(params.lesson, params.stage)) : undefined;
  if (!loc) return <Redirect href="/academy" />;
  const mode = MODES.some((m) => m.mode === params.mode) ? (params.mode as StageMode) : 'learn';
  return <StagePlayer key={loc.ref} loc={loc} initialMode={mode} />;
}

function StagePlayer({ loc, initialMode }: { loc: StageLocation; initialMode: StageMode }) {
  const insets = useSafeAreaInsets();
  const body = useMemo(() => loc.stage.body(), [loc]);
  const progress = useGame((g) => g.academy[loc.ref]);
  const now = useGameStore((s) => s.now);
  const [mode, setMode] = useState<StageMode>(initialMode);
  const scroll = useRef<ScrollView>(null);
  const tone = KIND_TONE[loc.stage.kind];
  const prev = loc.lesson.stages[loc.index - 1];
  const next = loc.lesson.stages[loc.index + 1];

  useEffect(() => {
    academyView(loc.ref).catch(() => undefined);
  }, [loc.ref]);

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [mode]);

  const goStage = (id: string) => router.replace(stageHref(stageRef(loc.lesson.id, id), 'learn'));

  return (
    <View style={styles.root}>
      <MapBackdrop glow={tone} />
      <View style={[styles.top, { paddingTop: insets.top + space.xs }]}>
        <IconButton icon="close" label="Voltar à aula" onPress={() => router.back()} color={colors.parchment} />
        <View style={styles.topText}>
          <Text variant="label" color={colors.mist} numberOfLines={1}>
            {loc.lesson.title} · etapa {loc.index + 1} de {loc.lesson.stages.length}
          </Text>
          <Text variant="subheading" numberOfLines={2}>
            {loc.stage.title}
          </Text>
        </View>
        <StatusBadge progress={progress} now={now} />
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {MODES.map((m) => {
          const on = m.mode === mode;
          return (
            <Pressable
              key={m.mode}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={m.label}
              onPress={() => setMode(m.mode)}
              style={[styles.tab, on && { backgroundColor: colors.ink700, borderColor: tone }]}
            >
              <Icon name={m.icon} size={16} color={on ? tone : colors.mist} />
              <Text variant="caption" color={on ? colors.parchment : colors.mist}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <ScrollView ref={scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxxl }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.goal}>
          <Text variant="label" color={tone}>
            {STAGE_KIND_LABEL[loc.stage.kind]}
          </Text>
          <RichText text={loc.stage.goal} color={colors.parchmentDim} />
        </View>
        {mode === 'learn' ? (
          <LearnFlow loc={loc} body={body} progress={progress} scroll={scroll} onMode={setMode} />
        ) : mode === 'practice' ? (
          <PracticeFlow loc={loc} body={body} progress={progress} onMode={setMode} />
        ) : (
          <ChallengeFlow loc={loc} body={body} progress={progress} now={now} onMode={setMode} />
        )}
        <AtlasLink loc={loc} progress={progress} />
        <View style={styles.nav}>
          {prev ? (
            <Button label="Etapa anterior" variant="ghost" size="md" icon="chevronLeft" onPress={() => goStage(prev.id)} style={{ flex: 1 }} />
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {next ? <Button label="Próxima etapa" variant="secondary" size="md" iconRight="chevronRight" onPress={() => goStage(next.id)} style={{ flex: 1 }} /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

// ——————————————————————————————————————————————— Aprender

function LearnFlow({
  loc,
  body,
  progress,
  scroll,
  onMode,
}: {
  loc: StageLocation;
  body: StageBody;
  progress: StageProgress | undefined;
  scroll: React.RefObject<ScrollView | null>;
  onMode: (m: StageMode) => void;
}) {
  const reduce = useReduceMotion();
  const total = body.learn.length;
  const studied = progress?.studiedAt != null;
  const [pos, setPos] = useState(() => (studied ? total : Math.max(chunkEnd(body.learn, 0), Math.min(progress?.learnPos ?? 0, total))));
  const done = useMemo(() => new Set(progress?.checks ?? []), [progress?.checks]);
  const offsets = useRef<number[]>([]);
  const target = useRef<number | null>(null);
  const shuffleKey = `${loc.ref}:${progress?.checks.length ?? 0}`;
  const pendingChecks = checkpointIds(body).filter((id) => !done.has(id));
  const last = body.learn[pos - 1];
  const canContinue = pos < total && (!last || blocksProgress(last, done));

  const advance = (to: number) => {
    target.current = pos;
    setPos(to);
    academyLearnPos(loc.ref, to).catch(() => undefined);
  };

  const onBlockLayout = (i: number, y: number) => {
    offsets.current[i] = y;
    if (target.current === i) {
      target.current = null;
      scroll.current?.scrollTo({ y: Math.max(0, y + 140), animated: !reduce });
    }
  };

  return (
    <View style={{ gap: space.xl }}>
      {body.learn.slice(0, pos).map((b, i) => (
        <Animated.View key={i} entering={reduce || i < (progress?.learnPos ?? 0) ? undefined : calm.appear(0, 320)} onLayout={(e) => onBlockLayout(i, e.nativeEvent.layout.y)}>
          <LearnBlockView block={b} done={done} shuffleKey={shuffleKey} onDone={(id, o) => academyLearnDone(loc.ref, id, o?.correct).then(() => undefined)} />
        </Animated.View>
      ))}
      {pos < total ? (
        <View style={{ gap: space.sm }}>
          <Button label="Continuar" iconRight="chevronRight" onPress={() => advance(chunkEnd(body.learn, pos))} disabled={!canContinue} />
          {!canContinue ? (
            <Text variant="caption" color={colors.mist} align="center">
              Responda à atividade acima para seguir — certo ou errado, o que importa é tentar.
            </Text>
          ) : null}
          <Pressable onPress={() => advance(total)} accessibilityRole="button" style={styles.skim}>
            <Text variant="caption" color={colors.mistDim}>
              Mostrar a etapa inteira
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.endCard}>
          {pendingChecks.length === 0 ? (
            <>
              <View style={styles.row}>
                <Icon name="seal" size={22} color={colors.verdigris} fill={colors.verdigrisGlow} />
                <Text variant="subheading" color={colors.verdigris}>
                  {studied ? 'Etapa estudada' : 'Explicação concluída'}
                </Text>
              </View>
              <Text variant="body" color={colors.parchmentDim}>
                Agora pratique com ajuda das lanternas — e, quando se sentir seguro, enfrente o desafio sem dicas para dominar a etapa.
              </Text>
            </>
          ) : (
            <Text variant="body" color={colors.parchmentDim}>
              Falta{pendingChecks.length > 1 ? 'm' : ''} {pendingChecks.length} atividade{pendingChecks.length > 1 ? 's' : ''} acima para concluir o estudo desta etapa.
            </Text>
          )}
          <View style={styles.recap}>
            <View style={styles.row}>
              <Icon name="list" size={16} color={colors.brass} />
              <Text variant="label" color={colors.brass}>
                Resumo de bolso
              </Text>
            </View>
            {body.recap.map((r, i) => (
              <View key={i} style={styles.bullet}>
                <Text variant="body" color={colors.brass}>
                  •
                </Text>
                <RichText text={r} style={{ flex: 1 }} />
              </View>
            ))}
          </View>
          <View style={styles.row}>
            <Button label="Praticar" icon="lantern" variant="secondary" onPress={() => onMode('practice')} style={{ flex: 1 }} />
            <Button label="Desafiar" icon="sword" onPress={() => onMode('challenge')} style={{ flex: 1 }} />
          </View>
        </View>
      )}
    </View>
  );
}

// ——————————————————————————————————————————————— Praticar

function PracticeFlow({ loc, body, progress, onMode }: { loc: StageLocation; body: StageBody; progress: StageProgress | undefined; onMode: (m: StageMode) => void }) {
  // Semente por visita: números novos sempre que houver novas respostas registradas.
  const [base] = useState(() => progress?.practice.answered ?? 0);
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<{ correct: boolean; hints: number }[]>([]);
  const def = body.practice[index];
  const seedKey = `${loc.ref}:${base}:${round}`;
  const ex = useMemo(() => (def ? instantiate(def, hashString(`${seedKey}:${def.id}`)) : null), [def, seedKey]);
  const finished = index >= body.practice.length;

  if (finished || !ex) {
    const correct = results.filter((r) => r.correct).length;
    const unaided = results.filter((r) => r.correct && r.hints === 0).length;
    return (
      <View style={styles.endCard}>
        <Text variant="subheading">Prática concluída</Text>
        <Text variant="body" color={colors.parchmentDim}>
          {correct} de {results.length} certas{unaided < correct ? ` (${unaided} sem nenhuma dica)` : ''}.{' '}
          {correct === results.length && unaided === correct
            ? 'Você está pronto para o desafio.'
            : 'Pratique de novo com números novos ou volte à explicação no ponto que gerou dúvida.'}
        </Text>
        <View style={styles.row}>
          <Button
            label="Praticar de novo"
            icon="refresh"
            variant="secondary"
            onPress={() => {
              setRound((r) => r + 1);
              setIndex(0);
              setResults([]);
              setAnswered(false);
            }}
            style={{ flex: 1 }}
          />
          <Button label="Desafiar" icon="sword" onPress={() => onMode('challenge')} style={{ flex: 1 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: space.lg }}>
      <Dots total={body.practice.length} index={index} results={results.map((r) => r.correct)} />
      <ExerciseView
        key={`${round}-${index}`}
        exercise={ex}
        mode="practice"
        shuffleKey={seedKey}
        onAnswered={async (o) => {
          await academyPractice(loc.ref, def.id, o.correct, o.hints);
          setResults((r) => [...r, o]);
          setAnswered(true);
        }}
      />
      {answered ? (
        <Button
          label={index + 1 < body.practice.length ? 'Próximo exercício' : 'Ver resumo da prática'}
          iconRight="chevronRight"
          onPress={() => {
            setIndex((i) => i + 1);
            setAnswered(false);
          }}
        />
      ) : null}
    </View>
  );
}

// ——————————————————————————————————————————————— Desafiar

interface ActiveRun {
  run: ChallengeRun;
  index: number;
  answered: boolean;
  results: boolean[];
  events: GameEvent[];
}

function ChallengeFlow({ loc, body, progress, now, onMode }: { loc: StageLocation; body: StageBody; progress: StageProgress | undefined; now: number; onMode: (m: StageMode) => void }) {
  const live = progress?.challenge.run ?? null;
  const [active, setActive] = useState<ActiveRun | null>(null);
  const [starting, setStarting] = useState(false);
  // Uma tentativa nova (ou retomada) no armazenamento vira a tentativa exibida.
  if (live && (!active || active.run.id !== live.id)) {
    setActive({ run: live, index: live.answers.length, answered: false, results: live.answers.map((a) => a.correct), events: [] });
  }
  const review = isReviewDue(progress, now);
  const mastered = progress?.masteredAt != null;

  const start = async () => {
    setStarting(true);
    try {
      await academyStartChallenge(loc.ref);
    } finally {
      setStarting(false);
    }
  };

  if (!active) {
    const size = challengeSize(body);
    return (
      <View style={styles.endCard}>
        <View style={styles.row}>
          <Icon name={review ? 'refresh' : 'sword'} size={22} color={review ? colors.iris : colors.brass} />
          <Text variant="subheading">{review ? 'Revisão de domínio' : mastered ? 'Desafio (treino)' : 'Desafio da etapa'}</Text>
        </View>
        <Text variant="body" color={colors.parchmentDim}>
          {size} problema{size > 1 ? 's' : ''}, sem dicas.{' '}
          {review
            ? 'Resolver de novo, alguns dias depois, é o que transforma estudo em memória duradoura.'
            : mastered
              ? 'Você já dominou esta etapa: este desafio é só treino (sem XP), com problemas sorteados de novo.'
              : `Acerte ${size <= 3 ? 'todos' : `pelo menos ${size - 1}`} para dominar a etapa. Errar não tira nada: você vê a resolução e tenta de novo com outros problemas.`}
        </Text>
        <Button label={review ? 'Começar a revisão' : 'Começar o desafio'} icon="sword" onPress={start} loading={starting} />
        <Button label="Praticar antes" variant="ghost" onPress={() => onMode('practice')} />
      </View>
    );
  }

  const total = active.run.items.length;
  if (active.index >= total) {
    const correct = active.results.filter(Boolean).length;
    const passed = challengePassed(correct, total);
    const milestone = active.events.find((e): e is Extract<GameEvent, { type: 'academy' }> => e.type === 'academy' && (e.milestone === 'mastered' || e.milestone === 'reviewed'));
    const sealed = active.events.some((e) => e.type === 'academy' && e.milestone === 'sealed');
    return (
      <View style={[styles.endCard, { borderColor: passed ? colors.verdigris : colors.line }]}>
        <View style={styles.row}>
          <Icon name={passed ? 'seal' : 'flag'} size={26} color={passed ? colors.verdigris : colors.mist} fill={passed ? colors.verdigrisGlow : 'none'} />
          <Text variant="heading" color={passed ? colors.verdigris : colors.parchment}>
            {passed ? (milestone?.milestone === 'reviewed' ? 'Domínio renovado!' : milestone ? 'Etapa dominada!' : 'Desafio vencido!') : `${correct} de ${total}: quase lá.`}
          </Text>
        </View>
        <Text variant="body" color={colors.parchmentDim}>
          {passed
            ? milestone
              ? `+${milestone.xp} XP e +${milestone.ink} de Tinta. ${milestone.milestone === 'reviewed' ? 'A próxima revisão fica para daqui a mais tempo.' : 'Em alguns dias, uma revisão rápida vai fixar o que você aprendeu.'}${sealed ? ' E a aula inteira ganhou o selo de domínio!' : ''}`
              : 'Mais uma prova de que você sabe. (Treino: sem XP.)'
            : 'Releia as resoluções acima, pratique o ponto que pegou e tente de novo — os problemas serão outros.'}
        </Text>
        <View style={styles.row}>
          <Button
            label={passed ? 'Desafiar de novo' : 'Tentar de novo'}
            icon="refresh"
            variant={passed ? 'secondary' : 'primary'}
            onPress={() => {
              setActive(null);
              start();
            }}
            loading={starting}
            style={{ flex: 1 }}
          />
          {!passed ? <Button label="Praticar" icon="lantern" variant="secondary" onPress={() => onMode('practice')} style={{ flex: 1 }} /> : null}
        </View>
      </View>
    );
  }

  const item = active.run.items[active.index];
  const def = body.challenge.find((e) => e.id === item.exerciseId);
  if (!def) {
    return (
      <View style={styles.endCard}>
        <Text variant="body">Este desafio mudou desde a última visita.</Text>
        <Button
          label="Sortear um desafio novo"
          onPress={async () => {
            await academyAbandonChallenge(loc.ref);
            setActive(null);
          }}
        />
      </View>
    );
  }
  const ex = instantiate(def, item.seed);
  return (
    <View style={{ gap: space.lg }}>
      <View style={styles.row}>
        <Dots total={total} index={active.index} results={active.results} />
        <Text variant="caption" color={colors.mist} style={{ marginLeft: 'auto' }}>
          Sem dicas · {active.index + 1} de {total}
        </Text>
      </View>
      <ExerciseView
        key={`${active.run.id}-${active.index}`}
        exercise={ex}
        mode="challenge"
        shuffleKey={active.run.id}
        onAnswered={async (o) => {
          const events = await academyChallengeAnswer(loc.ref, active.run.id, item.exerciseId, o.correct);
          setActive((a) => (a ? { ...a, answered: true, results: [...a.results, o.correct], events: [...a.events, ...events] } : a));
        }}
      />
      {active.answered ? (
        <Button
          label={active.index + 1 < total ? 'Próximo problema' : 'Ver resultado'}
          iconRight="chevronRight"
          onPress={() => setActive((a) => (a ? { ...a, index: a.index + 1, answered: false } : a))}
        />
      ) : null}
    </View>
  );
}

// ——————————————————————————————————————————————— peças

function Dots({ total, index, results }: { total: number; index: number; results: boolean[] }) {
  return (
    <View style={styles.dots} accessible accessibilityLabel={`Exercício ${Math.min(index + 1, total)} de ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const r = results[i];
        const color = r === undefined ? (i === index ? colors.brass : colors.ink500) : r ? colors.verdigris : colors.ember;
        return <View key={i} style={[styles.dot, { borderColor: color }, r !== undefined && { backgroundColor: color }]} />;
      })}
    </View>
  );
}

/** Evidências do Atlas e o atalho para testar nas questões ligadas à etapa. */
function AtlasLink({ loc, progress }: { loc: StageLocation; progress: StageProgress | undefined }) {
  const states = useGame((g) => g.questionStates);
  const ev = useMemo(() => stageEvidence(loc.ref, states, progress), [loc.ref, states, progress]);
  const { busy, start } = useStarter();
  const mapped = questionsForStage(loc.ref).length;
  if (mapped === 0) return null;
  return (
    <View style={styles.atlas}>
      <View style={styles.row}>
        <Icon name="atlas" size={18} color={colors.brass} />
        <Text variant="label" color={colors.brass}>
          No Atlas
        </Text>
      </View>
      <Text variant="caption" color={colors.parchmentDim}>
        {mapped} questões de missões e chefões dependem desta etapa. {evidenceSentence(ev)}
        {ev.since ? ` Desde que você estudou: ${ev.since.correct} acerto${ev.since.correct === 1 ? '' : 's'} e ${ev.since.wrong} erro${ev.since.wrong === 1 ? '' : 's'}.` : ''}
      </Text>
      <Button
        label={ev.openIds.length ? `Testar no Atlas · ${ev.openIds.length} Eco${ev.openIds.length > 1 ? 's' : ''} primeiro` : 'Testar no Atlas · 5 questões'}
        icon="target"
        variant="secondary"
        size="md"
        loading={busy === 'drill'}
        onPress={() => start('drill', () => startStageDrill(loc.ref))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink900 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm, paddingBottom: space.sm },
  topText: { flex: 1, gap: 2 },
  tabs: { flexDirection: 'row', gap: space.xs, paddingHorizontal: space.lg, paddingBottom: space.sm },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  content: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.xl },
  goal: { gap: space.xs },
  skim: { alignSelf: 'center', paddingVertical: space.sm },
  endCard: { gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: colors.ink800, borderWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  recap: { gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: colors.ink850 },
  bullet: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
  atlas: { gap: space.sm, padding: space.lg, borderRadius: radius.lg, backgroundColor: colors.ink850, borderWidth: 1, borderColor: colors.lineSoft },
  nav: { flexDirection: 'row', gap: space.sm },
});
