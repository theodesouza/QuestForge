/**
 * Um exercício da Academia, de qualquer tipo: escolha, resposta digitada, ordenar passos,
 * encontrar o erro, identificar informações, classificar e completar expressão.
 *
 * - Praticar: lanternas (dicas graduais) à vontade; acertar com dica é valorizado, mas o
 *   estudante é convidado a tentar o próximo sem ajuda.
 * - Desafiar: sem dicas.
 * - Depois de responder: o porquê do erro (equívoco específico), a resolução comentada
 *   e a ideia-chave — nunca só "a resposta certa é X".
 */
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { num } from '../../content/academy/kit/format';
import type { Exercise } from '../../content/academy/types';
import {
  fillBlanks,
  gradeChoice,
  gradeClassify,
  gradeFill,
  gradeNumber,
  gradeOrder,
  gradeSelect,
  gradeSpot,
} from '../../domain/academy/grade';
import { createRng, hashString, shuffle } from '../../domain/util/random';
import { Button } from '../../ui/Button';
import { calm } from '../../ui/calm';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { MathText, RichText, SolutionLine, plain } from '../../ui/RichText';
import { Text } from '../../ui/Text';
import { colors, fonts, radius, space } from '../../ui/theme';
import { PromptBlocks } from './PromptBlocks';

export type ExerciseMode = 'check' | 'practice' | 'challenge';

export interface AnswerOutcome {
  correct: boolean;
  hints: number;
}

interface Result {
  correct: boolean;
  feedback?: string;
}

interface Props {
  exercise: Exercise;
  mode: ExerciseMode;
  /** Embaralha alternativas e passos de forma estável nesta tentativa. */
  shuffleKey: string;
  onAnswered: (r: AnswerOutcome) => Promise<void> | void;
}

const RIGHT = ['Isso mesmo!', 'Certeiro.', 'Raciocínio certo.', 'Na medida exata.', 'Conta fechada.'];
const ALT = ['A', 'B', 'C', 'D', 'E', 'F'];

function permutation(n: number, key: string): number[] {
  const p = shuffle(Array.from({ length: n }, (_, i) => i), createRng(hashString(key)));
  // Para ordenar, nunca começa já na ordem certa.
  if (n > 1 && p.every((v, i) => v === i)) p.push(p.shift() as number);
  return p;
}

export function ExerciseView({ exercise, mode, shuffleKey, onAnswered }: Props) {
  const reduce = useReduceMotion();
  const key = `${shuffleKey}|${exercise.id}`;
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Entradas de cada tipo.
  const [choice, setChoice] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [sequence, setSequence] = useState<number[]>([]);
  const [line, setLine] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number[]>([]);
  const [assign, setAssign] = useState<number[]>(() => (exercise.kind === 'classify' ? exercise.items.map(() => -1) : []));
  const [picks, setPicks] = useState<number[]>(() => (exercise.kind === 'fill' ? fillBlanks(exercise).map(() => -1) : []));

  const optionOrder = useMemo(
    () => (exercise.kind === 'choice' && !exercise.fixedOrder ? permutation(exercise.options.length, key) : exercise.kind === 'choice' ? exercise.options.map((_, i) => i) : []),
    [exercise, key],
  );
  const stepOrder = useMemo(() => (exercise.kind === 'order' ? permutation(exercise.steps.length, key) : []), [exercise, key]);

  const answered = result !== null;
  const ready = (() => {
    switch (exercise.kind) {
      case 'choice':
        return choice !== null;
      case 'number':
        return typed.trim().length > 0;
      case 'order':
        return sequence.length === exercise.steps.length;
      case 'spot':
        return line !== null;
      case 'select':
        return chosen.length > 0;
      case 'classify':
        return assign.every((a) => a >= 0);
      case 'fill':
        return picks.every((p) => p >= 0);
    }
  })();

  const submit = async () => {
    if (!ready || answered || saving) return;
    let r: Result;
    switch (exercise.kind) {
      case 'choice':
        r = gradeChoice(exercise, choice as number);
        break;
      case 'number': {
        const g = gradeNumber(exercise, typed);
        if (g.value === null) {
          setError(g.feedback ?? 'Não consegui ler esse número.');
          return;
        }
        r = g;
        break;
      }
      case 'order':
        r = gradeOrder(exercise, sequence);
        break;
      case 'spot':
        r = gradeSpot(exercise, line as number);
        break;
      case 'select':
        r = gradeSelect(exercise, chosen);
        break;
      case 'classify':
        r = gradeClassify(exercise, assign);
        break;
      case 'fill':
        r = gradeFill(exercise, picks);
        break;
    }
    setSaving(true);
    setError(null);
    try {
      await onAnswered({ correct: r.correct, hints });
      haptic(r.correct ? 'success' : 'error');
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  const maxHints = mode === 'practice' ? exercise.hints?.length ?? 0 : 0;

  return (
    <View style={styles.wrap}>
      {exercise.prompt?.length ? <PromptBlocks blocks={exercise.prompt} /> : null}
      <View style={styles.ask}>
        <RichText text={exercise.ask} variant="ask" />
      </View>

      {hints > 0 && !answered ? (
        <View style={styles.hints}>
          {(exercise.hints ?? []).slice(0, hints).map((h, i) => (
            <Animated.View key={i} entering={reduce ? undefined : calm.appear(0, 240)} style={styles.hint}>
              <Icon name="lantern" size={18} color={colors.brass} fill={colors.brass} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label" color={colors.brass}>
                  Lanterna {i + 1}
                </Text>
                <RichText text={h} />
              </View>
            </Animated.View>
          ))}
        </View>
      ) : null}

      {exercise.kind === 'choice' ? (
        <View style={styles.list} accessibilityRole="radiogroup">
          {optionOrder.map((orig, pos) => {
            const o = exercise.options[orig];
            const state = !answered ? (choice === orig ? 'selected' : 'idle') : o.correct ? 'correct' : choice === orig ? 'wrong' : 'dimmed';
            return (
              <View key={orig} style={{ gap: space.xs }}>
                <OptionRow
                  letter={ALT[pos]}
                  text={o.text}
                  state={state}
                  disabled={answered}
                  onPress={() => setChoice(orig)}
                />
                {answered && state === 'wrong' && o.feedback ? (
                  <View style={styles.why}>
                    <Text variant="label" color={colors.ember}>
                      Por que não?
                    </Text>
                    <RichText text={o.feedback} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {exercise.kind === 'number' ? (
        <View style={{ gap: space.sm }}>
          <View style={[styles.inputRow, answered && { borderColor: result?.correct ? colors.verdigris : colors.ember }]}>
            {exercise.prefix ? (
              <Text variant="bodyStrong" color={colors.mist}>
                {exercise.prefix}
              </Text>
            ) : null}
            <TextInput
              value={typed}
              onChangeText={(t) => {
                setTyped(t);
                setError(null);
              }}
              editable={!answered}
              placeholder={exercise.placeholder ?? 'Sua resposta'}
              placeholderTextColor={colors.mistDim}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'decimal-pad'}
              returnKeyType="done"
              onSubmitEditing={submit}
              accessibilityLabel={`Resposta${exercise.unit ? ` em ${exercise.unit}` : ''}`}
              style={styles.input}
            />
            {exercise.unit ? (
              <Text variant="bodyStrong" color={colors.mist}>
                {exercise.unit}
              </Text>
            ) : null}
          </View>
          {answered && !result?.correct ? (
            <Text variant="bodyStrong" color={colors.verdigris}>
              Resposta: {exercise.prefix ? `${exercise.prefix} ` : ''}
              {num(exercise.answer, 4)}
              {exercise.unit ? ` ${exercise.unit}` : ''}
            </Text>
          ) : null}
        </View>
      ) : null}

      {exercise.kind === 'order' ? (
        <View style={{ gap: space.md }}>
          <Text variant="caption" color={colors.mist}>
            Toque nos passos na ordem certa. Toque num passo já escolhido para tirá-lo.
          </Text>
          <View style={styles.list}>
            {sequence.map((orig, pos) => {
              const ok = answered && orig === pos;
              const bad = answered && orig !== pos;
              return (
                <Pressable
                  key={`s${orig}`}
                  disabled={answered}
                  onPress={() => setSequence((s) => s.filter((x) => x !== orig))}
                  accessibilityRole="button"
                  accessibilityLabel={`Passo ${pos + 1}: ${plain(exercise.steps[orig])}. Toque para remover.`}
                  style={[styles.placed, ok && styles.okBorder, bad && styles.badBorder]}
                >
                  <View style={[styles.badge, { backgroundColor: ok ? colors.verdigris : bad ? colors.ember : colors.brass }]}>
                    <Text variant="number" color={colors.ink900} style={styles.badgeText}>
                      {pos + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <SolutionLine text={exercise.steps[orig]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
          {!answered ? (
            <View style={styles.list}>
              {stepOrder
                .filter((orig) => !sequence.includes(orig))
                .map((orig) => (
                  <Pressable
                    key={`o${orig}`}
                    onPress={() => {
                      haptic('select');
                      setSequence((s) => [...s, orig]);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Escolher passo: ${plain(exercise.steps[orig])}`}
                    style={styles.pool}
                  >
                    <SolutionLine text={exercise.steps[orig]} />
                  </Pressable>
                ))}
            </View>
          ) : !result?.correct ? (
            <View style={styles.why}>
              <Text variant="label" color={colors.verdigris}>
                Ordem correta
              </Text>
              {exercise.steps.map((s, i) => (
                <View key={i} style={styles.stepRow}>
                  <Text variant="bodyStrong" color={colors.verdigris}>
                    {i + 1}.
                  </Text>
                  <View style={{ flex: 1 }}>
                    <SolutionLine text={s} />
                  </View>
                </View>
              ))}
              {exercise.why ? <RichText text={exercise.why} color={colors.parchmentDim} /> : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {exercise.kind === 'spot' ? (
        <View style={styles.list}>
          <Text variant="caption" color={colors.mist}>
            Toque na linha em que o raciocínio erra pela primeira vez.
          </Text>
          {exercise.lines.map((l, i) => {
            const isWrong = i === exercise.wrong;
            const style = !answered
              ? line === i
                ? styles.selectedLine
                : null
              : isWrong
                ? styles.badLine
                : line === i
                  ? styles.dimLine
                  : null;
            return (
              <Pressable
                key={i}
                disabled={answered}
                onPress={() => setLine(i)}
                accessibilityRole="radio"
                accessibilityState={{ selected: line === i }}
                accessibilityLabel={`Linha ${i + 1}: ${plain(l)}${answered && isWrong ? ', aqui está o erro' : ''}`}
                style={[styles.line, style]}
              >
                <Text variant="caption" color={colors.mist} style={styles.lineNum}>
                  {i + 1}
                </Text>
                <View style={{ flex: 1 }}>
                  <SolutionLine text={l} />
                </View>
                {answered && isWrong ? <Icon name="alert" size={18} color={colors.ember} /> : null}
              </Pressable>
            );
          })}
          {answered ? (
            <View style={styles.why}>
              <Text variant="label" color={colors.ember}>
                O erro está na linha {exercise.wrong + 1}
              </Text>
              <RichText text={exercise.why} />
            </View>
          ) : null}
        </View>
      ) : null}

      {exercise.kind === 'select' ? (
        <View style={{ gap: space.sm }}>
          <View style={styles.chips}>
            {exercise.chips.map((c, i) => {
              const on = chosen.includes(i);
              const tone = !answered ? (on ? colors.brass : colors.line) : c.needed ? colors.verdigris : on ? colors.ember : colors.lineSoft;
              return (
                <Pressable
                  key={i}
                  disabled={answered}
                  onPress={() => setChosen((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${plain(c.text)}${answered ? (c.needed ? ', necessária' : ', dispensável') : ''}`}
                  style={[styles.chip, { borderColor: tone }, on && !answered && { backgroundColor: colors.brassGlow }]}
                >
                  {answered ? <Icon name={c.needed ? 'check' : on ? 'cross' : 'close'} size={14} color={tone} strokeWidth={2.2} /> : null}
                  <RichText text={c.text} variant="caption" color={colors.parchment} />
                </Pressable>
              );
            })}
          </View>
          {answered ? (
            <View style={styles.why}>
              {exercise.chips
                .filter((c) => !c.needed && c.why)
                .map((c, i) => (
                  <RichText key={i} text={`**${plain(c.text)}:** ${c.why}`} variant="caption" color={colors.parchmentDim} />
                ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {exercise.kind === 'classify' ? (
        <View style={styles.list}>
          {exercise.items.map((it, i) => {
            const right = answered && assign[i] === it.bin;
            return (
              <View key={i} style={[styles.classRow, answered && (right ? styles.okBorder : styles.badBorder)]}>
                <RichText text={it.text} variant="bodyStrong" />
                <View style={styles.chips}>
                  {exercise.bins.map((bin, b) => {
                    const on = assign[i] === b;
                    const isAnswer = answered && it.bin === b;
                    return (
                      <Pressable
                        key={b}
                        disabled={answered}
                        onPress={() => setAssign((cur) => cur.map((x, k) => (k === i ? b : x)))}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${plain(it.text)}: ${bin}`}
                        style={[
                          styles.binChip,
                          on && { backgroundColor: answered ? (right ? colors.verdigrisGlow : colors.emberGlow) : colors.brassGlow, borderColor: answered ? (right ? colors.verdigris : colors.ember) : colors.brass },
                          isAnswer && !on && { borderColor: colors.verdigris },
                        ]}
                      >
                        <Text variant="caption" color={colors.parchment}>
                          {bin}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {answered && !right && it.why ? <RichText text={it.why} variant="caption" color={colors.parchmentDim} /> : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {exercise.kind === 'fill' ? <FillInput exercise={exercise} picks={picks} setPicks={setPicks} answered={answered} /> : null}

      {error ? (
        <Text variant="caption" color={colors.ember}>
          {error}
        </Text>
      ) : null}

      {!answered ? (
        <View style={styles.actions}>
          {maxHints > 0 ? (
            <Pressable
              onPress={() => setHints((h) => Math.min(maxHints, h + 1))}
              disabled={hints >= maxHints}
              accessibilityRole="button"
              accessibilityLabel={hints >= maxHints ? 'Sem mais dicas' : `Acender a lanterna ${hints + 1} de ${maxHints}`}
              style={[styles.lantern, hints >= maxHints && { opacity: 0.45 }]}
            >
              <Icon name="lantern" size={18} color={colors.brass} />
              <Text variant="caption" color={colors.parchment}>
                {hints >= maxHints ? 'Sem mais dicas' : `Dica ${hints + 1}/${maxHints}`}
              </Text>
            </Pressable>
          ) : null}
          <Button label="Conferir" onPress={submit} disabled={!ready} loading={saving} style={{ flex: 1 }} />
        </View>
      ) : (
        <ResultPanel exercise={exercise} result={result} hints={hints} />
      )}
    </View>
  );
}

function OptionRow({ letter, text, state, disabled, onPress }: { letter: string; text: string; state: 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed'; disabled: boolean; onPress: () => void }) {
  const tone = {
    idle: { border: colors.lineSoft, bg: colors.ink800, badge: colors.ink600, fg: colors.parchment },
    selected: { border: colors.brass, bg: colors.brassGlow, badge: colors.brass, fg: colors.ink900 },
    correct: { border: colors.verdigris, bg: colors.verdigrisGlow, badge: colors.verdigris, fg: colors.ink900 },
    wrong: { border: colors.ember, bg: colors.emberGlow, badge: colors.ember, fg: colors.ink900 },
    dimmed: { border: colors.lineSoft, bg: colors.ink850, badge: colors.ink700, fg: colors.mistDim },
  }[state];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: state === 'selected', disabled }}
      accessibilityLabel={`Alternativa ${letter}: ${plain(text)}${state === 'correct' ? ', correta' : state === 'wrong' ? ', sua resposta, incorreta' : ''}`}
      disabled={disabled}
      onPress={() => {
        haptic('select');
        onPress();
      }}
      style={({ pressed }) => [styles.option, { borderColor: tone.border, backgroundColor: tone.bg, opacity: pressed && !disabled ? 0.85 : 1 }]}
    >
      <View style={[styles.badge, { backgroundColor: tone.badge }]}>
        {state === 'correct' ? (
          <Icon name="check" size={17} color={colors.ink900} strokeWidth={2.4} />
        ) : state === 'wrong' ? (
          <Icon name="cross" size={15} color={colors.ink900} strokeWidth={2.4} />
        ) : (
          <Text variant="number" color={tone.fg} style={styles.badgeText}>
            {letter}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        {text.includes('[[') ? <MathText text={text} variant="body" align="left" /> : <RichText text={text} variant="question" color={state === 'dimmed' ? colors.mistDim : colors.parchment} style={styles.optionText} />}
      </View>
    </Pressable>
  );
}

function FillInput({
  exercise,
  picks,
  setPicks,
  answered,
}: {
  exercise: Extract<Exercise, { kind: 'fill' }>;
  picks: number[];
  setPicks: (f: (cur: number[]) => number[]) => void;
  answered: boolean;
}) {
  const blanks = fillBlanks(exercise);
  const [active, setActive] = useState(0);
  let k = -1;
  return (
    <View style={{ gap: space.md }}>
      <View style={styles.fillRow}>
        {exercise.parts.map((part, i) => {
          if (typeof part === 'string') return <MathText key={i} text={part} align="left" />;
          k++;
          const idx = k;
          const pick = picks[idx];
          const right = answered && pick === part.answer;
          return (
            <Pressable
              key={i}
              disabled={answered}
              onPress={() => setActive(idx)}
              accessibilityRole="button"
              accessibilityLabel={`Lacuna ${idx + 1}: ${pick >= 0 ? plain(part.options[pick]) : 'vazia'}`}
              style={[
                styles.slot,
                !answered && active === idx && styles.slotActive,
                answered && (right ? styles.okBorder : styles.badBorder),
              ]}
            >
              {pick >= 0 ? <MathText text={part.options[pick]} align="center" /> : <Text variant="ask" color={colors.mistDim}>?</Text>}
            </Pressable>
          );
        })}
      </View>
      {!answered && blanks[active] ? (
        <View style={{ gap: space.xs }}>
          <Text variant="caption" color={colors.mist}>
            Lacuna {active + 1} de {blanks.length}: escolha
          </Text>
          <View style={styles.chips}>
            {blanks[active].options.map((opt, o) => (
              <Pressable
                key={o}
                onPress={() => {
                  haptic('select');
                  setPicks((cur) => cur.map((x, j) => (j === active ? o : x)));
                  if (active < blanks.length - 1) setActive(active + 1);
                }}
                accessibilityRole="button"
                accessibilityLabel={plain(opt)}
                style={[styles.binChip, picks[active] === o && { borderColor: colors.brass, backgroundColor: colors.brassGlow }]}
              >
                <MathText text={opt} align="center" size={15} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      {answered ? (
        <View style={styles.why}>
          <Text variant="label" color={colors.verdigris}>
            Expressão completa
          </Text>
          <MathText
            text={exercise.parts.map((part) => (typeof part === 'string' ? part : part.options[part.answer])).join('')}
            align="left"
          />
          {exercise.why ? <RichText text={exercise.why} color={colors.parchmentDim} /> : null}
        </View>
      ) : null}
    </View>
  );
}

function ResultPanel({ exercise, result, hints }: { exercise: Exercise; result: Result | null; hints: number }) {
  const reduce = useReduceMotion();
  const [open, setOpen] = useState(!result?.correct);
  if (!result) return null;
  const accent = result.correct ? (hints > 0 ? colors.brass : colors.verdigris) : colors.iris;
  const title = result.correct ? RIGHT[hashString(exercise.id) % RIGHT.length] : 'Ainda não.';
  const subtitle = result.correct
    ? hints > 0
      ? 'Certo — com a ajuda da lanterna. No próximo, tente primeiro sem dicas.'
      : null
    : 'Errar aqui faz parte do caminho: veja onde o raciocínio desviou.';
  return (
    <Animated.View entering={reduce ? undefined : calm.rise()} style={styles.result} accessibilityLiveRegion="polite">
      <View style={[styles.resultHead, { borderColor: accent }]}>
        <View style={[styles.resultIcon, { backgroundColor: accent }]}>
          <Icon name={result.correct ? 'check' : 'echo'} size={19} color={colors.ink900} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading" color={accent}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color={colors.parchmentDim}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {!result.correct && result.feedback && exercise.kind !== 'choice' && exercise.kind !== 'spot' ? (
        <View style={styles.why}>
          <Text variant="label" color={colors.ember}>
            O que aconteceu
          </Text>
          <RichText text={result.feedback} />
        </View>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={styles.toggle}>
        <Icon name="book" size={18} color={colors.parchment} />
        <Text variant="bodyStrong" style={{ flex: 1 }}>
          {open ? 'Resolução' : 'Ver a resolução'}
        </Text>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <Icon name="chevronRight" size={18} color={colors.mist} />
        </View>
      </Pressable>
      {open ? (
        <View style={styles.solution}>
          {exercise.solution.map((l, i) => (
            <SolutionLine key={i} text={l} />
          ))}
        </View>
      ) : null}
      {exercise.idea ? (
        <View style={styles.idea}>
          <Text variant="label" color={colors.iris}>
            Ideia-chave
          </Text>
          <RichText text={exercise.idea} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  ask: { borderLeftWidth: 3, borderLeftColor: colors.brass, paddingLeft: space.md, paddingVertical: 2 },
  hints: { gap: space.sm },
  hint: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.brassGlow,
    borderWidth: 1,
    borderColor: colors.line,
  },
  list: { gap: space.sm + 2 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 56,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  optionText: { fontSize: 16, lineHeight: 23 },
  badge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: fonts.display, fontSize: 15 },
  why: {
    gap: space.xs,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.ink850,
    borderLeftWidth: 3,
    borderLeftColor: colors.ember,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 56,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.ink800,
  },
  input: { flex: 1, minWidth: 0, color: colors.parchment, fontFamily: fonts.display, fontSize: 22, paddingVertical: space.sm },
  placed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.brass,
    backgroundColor: colors.ink800,
  },
  pool: {
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: colors.ink850,
  },
  stepRow: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  okBorder: { borderColor: colors.verdigris },
  badBorder: { borderColor: colors.ember },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.lineSoft,
    backgroundColor: colors.ink800,
  },
  lineNum: { width: 16, textAlign: 'center' },
  selectedLine: { borderColor: colors.brass, backgroundColor: colors.brassGlow },
  badLine: { borderColor: colors.ember, backgroundColor: colors.emberGlow },
  dimLine: { opacity: 0.7 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1.4,
    backgroundColor: colors.ink800,
  },
  classRow: { gap: space.sm, padding: space.md, borderRadius: radius.md, borderWidth: 1.2, borderColor: colors.lineSoft, backgroundColor: colors.ink800 },
  binChip: {
    minHeight: 40,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1.3,
    borderColor: colors.line,
    backgroundColor: colors.ink850,
  },
  fillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.xs,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.ink850,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  slot: {
    minWidth: 54,
    minHeight: 48,
    paddingHorizontal: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  slotActive: { borderColor: colors.brass, borderStyle: 'solid', backgroundColor: colors.brassGlow },
  actions: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  lantern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 56,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: colors.line,
    backgroundColor: colors.ink800,
  },
  result: { gap: space.md },
  resultHead: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.ink800,
  },
  resultIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  solution: { gap: space.sm, paddingHorizontal: space.xs },
  idea: { gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: colors.irisGlow, borderLeftWidth: 3, borderLeftColor: colors.iris },
});
