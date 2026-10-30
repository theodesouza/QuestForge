/**
 * Blocos de "Aprender": texto, fórmulas, destaques, dados, exemplos resolvidos passo a
 * passo (alguns passos pedem o próximo movimento), "pense antes de ver", comparações,
 * verificações, laboratórios e simulações.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { instantiate } from '../../content/academy/kit/build';
import type { LearnBlock, Option } from '../../content/academy/types';
import { createRng, hashString, shuffle } from '../../domain/util/random';
import { Button } from '../../ui/Button';
import { calm } from '../../ui/calm';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { MathText, RichText, plain } from '../../ui/RichText';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import { StemBlocks } from '../question/StemBlocks';
import { ExerciseView, type AnswerOutcome } from './ExerciseView';
import { Lab, Sim } from './Lab';
import { CALLOUT_LOOK, TONE } from './look';
import { PromptBlocks } from './PromptBlocks';

export interface BlockProps {
  block: LearnBlock;
  /** Atividades já concluídas nesta etapa (ids). */
  done: ReadonlySet<string>;
  /** Registra uma atividade concluída (verificação respondida, exemplo percorrido, missão de laboratório…). */
  onDone: (id: string, outcome?: AnswerOutcome) => Promise<void> | void;
  shuffleKey: string;
}

export function LearnBlockView({ block, done, onDone, shuffleKey }: BlockProps) {
  switch (block.kind) {
    case 'text':
      return <RichText text={block.text} variant="question" />;
    case 'math':
      return (
        <View style={styles.math}>
          {block.lines.map((l, i) => (
            <MathText key={i} text={l} />
          ))}
          {block.caption ? <RichText text={block.caption} variant="caption" color={colors.mist} align="center" /> : null}
        </View>
      );
    case 'callout': {
      const look = CALLOUT_LOOK[block.tone];
      return (
        <View style={[styles.callout, { borderLeftColor: look.color }]}>
          <View style={styles.calloutHead}>
            <Icon name={look.icon} size={18} color={look.color} fill={block.tone === 'key' ? colors.brassGlow : 'none'} />
            <Text variant="label" color={look.color}>
              {look.label}
            </Text>
          </View>
          <Text variant="subheading">{block.title}</Text>
          <RichText text={block.text} color={colors.parchmentDim} />
        </View>
      );
    }
    case 'data':
      return <StemBlocks blocks={[block.block]} />;
    case 'compare':
      return (
        <View style={{ gap: space.sm }}>
          {block.title ? <Text variant="subheading">{block.title}</Text> : null}
          <View style={styles.compare}>
            {block.columns.map((c) => (
              <View key={c.title} style={[styles.column, { borderTopColor: TONE[c.tone] }]}>
                <Text variant="label" color={TONE[c.tone]}>
                  {c.title}
                </Text>
                {c.lines.map((l, i) => (
                  <RichText key={i} text={l} variant="body" />
                ))}
              </View>
            ))}
          </View>
        </View>
      );
    case 'reveal':
      return <Reveal id={block.id} prompt={block.prompt} answer={block.answer} done={done.has(block.id)} onDone={onDone} />;
    case 'example':
      return <Example block={block} done={done.has(block.id)} onDone={onDone} shuffleKey={shuffleKey} />;
    case 'check': {
      const ex = instantiate(block.exercise, hashString(`${shuffleKey}:${block.exercise.id}`));
      return (
        <View style={styles.check}>
          <View style={styles.calloutHead}>
            <Icon name={done.has(ex.id) ? 'check' : 'target'} size={18} color={done.has(ex.id) ? colors.verdigris : colors.brass} strokeWidth={2} />
            <Text variant="label" color={done.has(ex.id) ? colors.verdigris : colors.brass}>
              {done.has(ex.id) ? 'Verificação concluída' : 'Verifique o que entendeu'}
            </Text>
          </View>
          <ExerciseView exercise={ex} mode="check" shuffleKey={shuffleKey} onAnswered={(o) => onDone(ex.id, o)} />
        </View>
      );
    }
    case 'lab':
      return <Lab lab={block.lab} done={done.has(block.lab.id)} onGoal={() => onDone(block.lab.id)} />;
    case 'sim':
      return <Sim sim={block.sim} done={done.has(block.sim.id)} onGoal={() => onDone(block.sim.id)} />;
  }
}

/** Blocos que precisam ser respondidos antes de seguir (aprendizado ativo). */
export function blocksProgress(block: LearnBlock, done: ReadonlySet<string>): boolean {
  if (block.kind === 'check') return done.has(block.exercise.id);
  if (block.kind === 'example' && block.steps.some((s) => s.ask)) return done.has(block.id);
  return true;
}

function Reveal({ id, prompt, answer, done, onDone }: { id: string; prompt: string; answer: string; done: boolean; onDone: BlockProps['onDone'] }) {
  const reduce = useReduceMotion();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.reveal}>
      <View style={styles.calloutHead}>
        <Icon name="bulb" size={18} color={colors.iris} />
        <Text variant="label" color={colors.iris}>
          Pense antes de ver
        </Text>
      </View>
      <RichText text={prompt} variant="bodyStrong" />
      {open ? (
        <Animated.View entering={reduce ? undefined : calm.appear(0, 260)}>
          <RichText text={answer} color={colors.parchmentDim} />
        </Animated.View>
      ) : (
        <Button
          label={done ? 'Ver de novo' : 'Já pensei — mostrar'}
          size="md"
          variant="secondary"
          onPress={() => {
            setOpen(true);
            if (!done) onDone(id);
          }}
        />
      )}
    </View>
  );
}

function Example({ block, done, onDone, shuffleKey }: { block: Extract<LearnBlock, { kind: 'example' }>; done: boolean; onDone: BlockProps['onDone']; shuffleKey: string }) {
  const reduce = useReduceMotion();
  // Passos revelados; um passo com pergunta só aparece depois de respondida.
  const [shown, setShown] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const total = block.steps.length;
  const finished = shown >= total;
  const pending = !finished ? block.steps[shown] : null;
  const needsAnswer = !!pending?.ask && answers[shown] === undefined;

  const advance = () => {
    const next = shown + 1;
    setShown(next);
    if (next >= total && !done) onDone(block.id);
  };

  return (
    <View style={styles.example}>
      <View style={styles.calloutHead}>
        <Icon name="book" size={18} color={colors.brass} />
        <Text variant="label" color={colors.brass}>
          Exemplo resolvido
        </Text>
        <Text variant="caption" color={colors.mistDim} style={{ marginLeft: 'auto' }}>
          {Math.min(shown, total)}/{total} passos
        </Text>
      </View>
      <Text variant="subheading">{block.title}</Text>
      <PromptBlocks blocks={block.problem} />
      {block.steps.slice(0, shown).map((s, i) => (
        <Animated.View key={i} entering={reduce ? undefined : calm.appear(0, 280)} style={styles.step}>
          <View style={styles.stepNum}>
            <Text variant="caption" color={colors.brass}>
              {i + 1}
            </Text>
          </View>
          <View style={{ flex: 1, gap: space.xs }}>
            {s.ask && answers[i] !== undefined ? <AskEcho ask={s.ask} picked={answers[i]} /> : null}
            <RichText text={s.text} />
            {s.math?.map((l, j) => (
              <MathText key={j} text={l} align="left" />
            ))}
          </View>
        </Animated.View>
      ))}
      {pending?.ask && needsAnswer ? (
        <AskStep
          question={pending.ask.question}
          options={pending.ask.options}
          shuffleKey={`${shuffleKey}:${block.id}:${shown}`}
          onPick={(i) => {
            setAnswers((a) => ({ ...a, [shown]: i }));
            advance();
          }}
        />
      ) : null}
      {!finished ? (
        needsAnswer ? null : (
          <Button
            label={shown === 0 ? 'Ver o primeiro passo' : pending?.ask ? 'Ver o passo' : 'Próximo passo'}
            size="md"
            variant="secondary"
            iconRight="chevronRight"
            onPress={advance}
          />
        )
      ) : block.result ? (
        <View style={styles.result}>
          <Icon name="check" size={18} color={colors.verdigris} strokeWidth={2.2} />
          <RichText text={block.result} variant="bodyStrong" color={colors.verdigris} style={{ flex: 1 }} />
        </View>
      ) : null}
    </View>
  );
}

/** Pergunta de um passo de exemplo: escolher o próximo movimento antes de vê-lo. */
function AskStep({ question, options, shuffleKey, onPick }: { question: string; options: Option[]; shuffleKey: string; onPick: (i: number) => void }) {
  const order = shuffle(options.map((_, i) => i), createRng(hashString(shuffleKey)));
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <View style={styles.ask}>
      <Text variant="label" color={colors.iris}>
        Antes de ver: qual é o próximo passo?
      </Text>
      <RichText text={question} variant="bodyStrong" />
      {order.map((i) => {
        const o = options[i];
        const isPicked = picked === i;
        const reveal = picked !== null;
        const border = reveal ? (o.correct ? colors.verdigris : isPicked ? colors.ember : colors.lineSoft) : colors.line;
        return (
          <View key={i} style={{ gap: space.xs }}>
            <Pressable
              disabled={reveal}
              onPress={() => {
                haptic(o.correct ? 'success' : 'error');
                setPicked(i);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${plain(o.text)}${reveal ? (o.correct ? ', correta' : isPicked ? ', sua escolha, incorreta' : '') : ''}`}
              style={[styles.askOption, { borderColor: border }, reveal && o.correct && { backgroundColor: colors.verdigrisGlow }, reveal && isPicked && !o.correct && { backgroundColor: colors.emberGlow }]}
            >
              <RichText text={o.text} />
            </Pressable>
            {reveal && isPicked && !o.correct && o.feedback ? <RichText text={o.feedback} variant="caption" color={colors.parchmentDim} /> : null}
          </View>
        );
      })}
      {picked !== null ? <Button label="Ver o passo" size="md" iconRight="chevronRight" onPress={() => onPick(picked)} /> : null}
    </View>
  );
}

function AskEcho({ ask, picked }: { ask: { question: string; options: Option[] }; picked: number }) {
  const o = ask.options[picked];
  return (
    <View style={styles.echo}>
      <Icon name={o.correct ? 'check' : 'cross'} size={14} color={o.correct ? colors.verdigris : colors.ember} strokeWidth={2.2} />
      <Text variant="caption" color={colors.mist} style={{ flex: 1 }}>
        {plain(ask.question)} — você escolheu: {plain(o.text)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  math: {
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.ink850,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  callout: {
    gap: space.xs,
    padding: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.ink800,
    borderLeftWidth: 3,
  },
  calloutHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  compare: { flexDirection: 'row', gap: space.sm },
  column: {
    flex: 1,
    gap: space.xs,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.ink800,
    borderTopWidth: 3,
  },
  reveal: { gap: space.sm, padding: space.lg, borderRadius: radius.lg, backgroundColor: colors.irisGlow, borderWidth: 1, borderColor: 'rgba(155, 135, 255, 0.35)' },
  check: { gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: colors.ink850, borderWidth: 1, borderColor: colors.line },
  example: { gap: space.md, padding: space.lg, borderRadius: radius.lg, backgroundColor: colors.ink800, borderWidth: 1, borderColor: colors.lineSoft },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  result: { flexDirection: 'row', gap: space.sm, alignItems: 'center', padding: space.md, borderRadius: radius.md, backgroundColor: colors.verdigrisGlow },
  ask: { gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.ink850, borderWidth: 1, borderColor: 'rgba(155, 135, 255, 0.35)' },
  askOption: { padding: space.md, borderRadius: radius.md, borderWidth: 1.4, backgroundColor: colors.ink800, minHeight: 48, justifyContent: 'center' },
  echo: { flexDirection: 'row', gap: 6, alignItems: 'center' },
});
