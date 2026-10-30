/**
 * Laboratório: o estudante mexe nos parâmetros e vê as consequências na hora. A missão
 * do laboratório dá um propósito à exploração ("faça sobrar exatamente 1/4").
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { LabSpec, LabValues, SimSpec } from '../../content/academy/types';
import { num } from '../../content/academy/kit/format';
import { Button } from '../../ui/Button';
import { calm } from '../../ui/calm';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { RichText } from '../../ui/RichText';
import { Slider } from '../../ui/Slider';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import { SKY, TONE } from './look';
import { Viz } from './Viz';

export function Lab({ lab, done, onGoal }: { lab: LabSpec; done: boolean; onGoal: () => void }) {
  const reduce = useReduceMotion();
  const [values, setValues] = useState<LabValues>(() => Object.fromEntries(lab.params.map((p) => [p.key, p.value])));
  const readouts = useMemo(() => lab.readouts(values), [lab, values]);
  const viz = useMemo(() => lab.viz?.(values), [lab, values]);
  const reached = !!lab.goal?.done(values);
  const announced = useRef(done);

  useEffect(() => {
    if (reached && !announced.current) {
      announced.current = true;
      haptic('success');
      onGoal();
    }
  }, [reached, onGoal]);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Icon name="flask" size={20} color={SKY} fill="none" />
        <Text variant="label" color={SKY}>
          Laboratório
        </Text>
      </View>
      <Text variant="subheading">{lab.title}</Text>
      <RichText text={lab.intro} color={colors.parchmentDim} />
      {lab.goal ? (
        <View style={[styles.goal, (reached || done) && styles.goalDone]} accessibilityLiveRegion="polite">
          <Icon name={reached || done ? 'check' : 'target'} size={18} color={reached || done ? colors.verdigris : colors.brass} strokeWidth={2} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="label" color={reached || done ? colors.verdigris : colors.brass}>
              {reached ? 'Missão cumprida' : done ? 'Missão já cumprida' : 'Missão do laboratório'}
            </Text>
            <RichText text={reached ? lab.goal.success : lab.goal.task} variant="caption" color={colors.parchment} />
          </View>
        </View>
      ) : null}
      {viz ? <Viz viz={viz} /> : null}
      <View style={styles.readouts}>
        {readouts.map((r) => (
          <View key={r.label} style={[styles.readout, r.big && styles.readoutBig]} accessible accessibilityLabel={`${r.label}: ${r.value}`}>
            <Text variant="caption" color={colors.mist}>
              {r.label}
            </Text>
            <Text variant={r.big ? 'heading' : 'bodyStrong'} color={r.tone ? TONE[r.tone] : colors.parchment}>
              {r.value}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.params}>
        {lab.params.map((p) => (
          <View key={p.key} style={styles.param}>
            <View style={styles.paramHead}>
              <Text variant="caption" color={colors.mist}>
                {p.label}
              </Text>
              <Text variant="bodyStrong" color={colors.parchment}>
                {p.format(values[p.key])}
              </Text>
            </View>
            <Slider
              value={values[p.key]}
              min={p.min}
              max={p.max}
              step={p.step}
              label={p.label}
              format={p.format}
              color={SKY}
              onChange={(v) => setValues((cur) => ({ ...cur, [p.key]: v }))}
            />
          </View>
        ))}
      </View>
      {lab.insight ? (
        <Animated.View entering={reduce ? undefined : calm.appear(0, 300)} style={styles.insight}>
          <Icon name="bulb" size={18} color={colors.brass} fill={colors.brassGlow} />
          <RichText text={lab.insight} variant="caption" color={colors.parchmentDim} style={{ flex: 1 }} />
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Simulação: lança o experimento várias vezes e compara a frequência com a probabilidade. */
export function Sim({ sim, done, onGoal }: { sim: SimSpec; done: boolean; onGoal: () => void }) {
  const [counts, setCounts] = useState<number[]>(() => sim.outcomes.map(() => 0));
  const total = counts.reduce((a, b) => a + b, 0);
  const announced = useRef(done);
  const GOAL = 100;

  const draw = (times: number) => {
    const next = counts.slice();
    for (let t = 0; t < times; t++) {
      let r = Math.random();
      let k = 0;
      while (k < sim.outcomes.length - 1 && r >= sim.outcomes[k].p) {
        r -= sim.outcomes[k].p;
        k++;
      }
      next[k]++;
    }
    haptic('select');
    setCounts(next);
    if (!announced.current && next.reduce((a, b) => a + b, 0) >= GOAL) {
      announced.current = true;
      onGoal();
    }
  };

  const eventHits = sim.event ? sim.event.outcomes.reduce((s, i) => s + counts[i], 0) : 0;
  const eventP = sim.event ? sim.event.outcomes.reduce((s, i) => s + sim.outcomes[i].p, 0) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Icon name="dice" size={20} color={SKY} />
        <Text variant="label" color={SKY}>
          Simulação
        </Text>
      </View>
      <Text variant="subheading">{sim.title}</Text>
      <RichText text={sim.intro} color={colors.parchmentDim} />
      <Viz
        viz={{
          kind: 'bars',
          bars: sim.outcomes.map((o, i) => ({
            label: o.label,
            value: total ? counts[i] / total : 0,
            text: total ? `${num((100 * counts[i]) / total, 0)}%` : '—',
            tone: sim.event?.outcomes.includes(i) ? 'brass' : 'sky',
          })),
          max: Math.max(...sim.outcomes.map((o) => o.p), ...counts.map((c) => (total ? c / total : 0)), 0.05) * 1.15,
          summary: `${total} lançamentos. ${sim.outcomes.map((o, i) => `${o.label}: ${counts[i]}`).join('; ')}`,
        }}
      />
      <View style={styles.readouts}>
        <View style={styles.readout}>
          <Text variant="caption" color={colors.mist}>
            Lançamentos
          </Text>
          <Text variant="bodyStrong">{total}</Text>
        </View>
        {sim.event ? (
          <>
            <View style={styles.readout}>
              <Text variant="caption" color={colors.mist}>
                {sim.event.label} (observado)
              </Text>
              <Text variant="bodyStrong" color={colors.brass}>
                {total ? `${num((100 * eventHits) / total, 1)}%` : '—'}
              </Text>
            </View>
            <View style={styles.readout}>
              <Text variant="caption" color={colors.mist}>
                Probabilidade teórica
              </Text>
              <Text variant="bodyStrong" color={colors.verdigris}>
                {num(100 * eventP, 1)}%
              </Text>
            </View>
          </>
        ) : null}
      </View>
      <View style={styles.simButtons}>
        <Button label="Lançar 1×" size="md" variant="secondary" onPress={() => draw(1)} />
        <Button label="10×" size="md" variant="secondary" onPress={() => draw(10)} />
        <Button label="100×" size="md" variant="secondary" onPress={() => draw(100)} />
        <Button label="Zerar" size="md" variant="ghost" onPress={() => setCounts(sim.outcomes.map(() => 0))} />
      </View>
      {total >= GOAL || done ? (
        <View style={styles.insight}>
          <Icon name="bulb" size={18} color={colors.brass} fill={colors.brassGlow} />
          <RichText text={sim.insight} variant="caption" color={colors.parchmentDim} style={{ flex: 1 }} />
        </View>
      ) : (
        <Text variant="caption" color={colors.mistDim}>
          Faça pelo menos {GOAL} lançamentos e compare com a probabilidade teórica.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: 'rgba(111, 168, 255, 0.35)',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  goal: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.brassGlow,
    borderWidth: 1,
    borderColor: colors.line,
  },
  goalDone: { backgroundColor: colors.verdigrisGlow, borderColor: colors.verdigris },
  readouts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  readout: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: 2,
    padding: space.sm + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.ink850,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  readoutBig: { flexBasis: '100%' },
  params: { gap: space.sm },
  param: { gap: 2 },
  paramHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  insight: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  simButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
