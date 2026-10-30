/**
 * Academia na nuvem: o progresso das aulas viaja no snapshot (schema 2), mescla entre aparelhos
 * sem perder marcos nem pagar recompensa em dobro, e o desafio em andamento fica no aparelho.
 */
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { getStage } from '../../content/academy/catalog';
import { academyChallengeAnswer, academyPractice, academyStartChallenge, academyView } from '../../domain/game/academy';
import type { GameState, Result } from '../../domain/game/types';
import { diffDelta } from '../delta';
import { findRegressions, grantValue, merge3 } from '../merge';
import { SNAPSHOT_SCHEMA, decodeSyncState, encodeSyncState, isPristine, stableStringify, toSyncState, withSyncState } from '../snapshot';
import { Clock, makeDevice } from '../testing/device';
import { FakeCloud } from '../testing/fakeCloud';
import { DAY, HOUR, T0, newGame } from '../testing/gameplay';

const REF = 'fracoes/partes-do-todo';
const UID = 'uid-academia';
const sync = (g: GameState) => toSyncState(g);

/** Desafio inteiro respondido certo (domina a etapa, ou cumpre a revisão). */
function master(state: GameState, ref: string, now: number, runId: string): GameState {
  let s = academyStartChallenge(state, { ref, runId, seed: 7 }, now).state;
  const run = s.academy[ref].challenge.run!;
  run.items.forEach((item, i) => {
    s = academyChallengeAnswer(s, { ref, runId, exerciseId: item.exerciseId, correct: true, answerId: `${runId}-${i}` }, now + i + 1).state;
  });
  return s;
}

/** `n` respostas certas e sem dica na prática. */
function practice(state: GameState, ref: string, n: number, now: number, tag: string): GameState {
  const ids = getStage(ref).stage.body().practice.map((e) => e.id);
  let s = state;
  for (let i = 0; i < n; i++) {
    s = academyPractice(s, { ref, exerciseId: ids[i % ids.length], correct: true, hints: 0, answerId: `${tag}-${i}` }, now + i).state;
  }
  return s;
}

describe('Academia no snapshot', () => {
  it('viaja e volta idêntica, com os ids das atividades compactados', () => {
    const g = practice(master(newGame(T0), REF, T0 + HOUR, 'r1'), REF, 2, T0 + 2 * HOUR, 'p');
    const s = sync(g);
    const text = encodeSyncState(s);
    expect(text).toContain('"aca"');
    expect(text).not.toContain('fracoes.partes-do-todo.');
    expect(decodeSyncState(text)).toEqual(s);
    expect(encodeSyncState(decodeSyncState(text))).toBe(text);
    expect(SNAPSHOT_SCHEMA).toBe(2);
  });

  it('um snapshot do schema 1 (app sem Academia) é lido com a Academia vazia', () => {
    const g = master(newGame(T0), REF, T0 + HOUR, 'r1');
    const raw = JSON.parse(encodeSyncState(sync(g))) as Record<string, unknown>;
    delete raw.aca;
    const v1 = decodeSyncState(stableStringify({ ...raw, v: 1 }));
    expect(v1.academy).toEqual({});
    expect(v1.ledger).toEqual(sync(g).ledger);
  });

  it('a partir do schema 2 a Academia é obrigatória (snapshot truncado é recusado)', () => {
    const raw = JSON.parse(encodeSyncState(sync(newGame(T0)))) as Record<string, unknown>;
    delete raw.aca;
    expect(() => decodeSyncState(stableStringify(raw))).toThrow(/Academia/);
  });

  it('o desafio em andamento não viaja e continua no aparelho depois de uma sincronização', () => {
    const g = academyStartChallenge(newGame(T0), { ref: REF, runId: 'run', seed: 3 }, T0 + HOUR).state;
    expect(g.academy[REF].challenge.run).not.toBeNull();
    expect(sync(g).academy[REF].challenge.run).toBeNull();
    expect(withSyncState(g, sync(g)).academy[REF].challenge.run).toEqual(g.academy[REF].challenge.run);
  });

  it('quem só abriu uma etapa já tem progresso a preservar', () => {
    const viewed = academyView(newGame(T0), REF, T0 + HOUR).state;
    expect(isPristine(sync(viewed))).toBe(false);
  });

  it('o estado que chega da nuvem grava no SQLite as etapas alteradas', () => {
    const before = newGame(T0);
    const after = withSyncState(before, sync(master(before, REF, T0 + HOUR, 'r1')));
    expect(diffDelta(before, after).academy).toEqual([REF]);
  });
});

describe('Academia no merge de 3 vias', () => {
  it('dois aparelhos: o domínio de um e a prática do outro somam, sem regressão', () => {
    const base = newGame(T0);
    const l = master(base, REF, T0 + HOUR, 'l');
    const r = practice(base, REF, 3, T0 + 2 * HOUR, 'r');
    const { merged } = merge3(sync(base), sync(l), sync(r));
    const m = merged.academy[REF];
    expect(m.masteredAt).toBe(l.academy[REF].masteredAt);
    expect(m.box).toBe(l.academy[REF].box);
    expect(m.dueAt).toBe(l.academy[REF].dueAt);
    expect(m.practice.answered).toBe(3);
    expect(m.studiedAt).not.toBeNull();
    expect(m.challenge.runs).toBe(l.academy[REF].challenge.runs);
    expect(findRegressions(sync(l), merged)).toEqual([]);
    expect(findRegressions(sync(r), merged)).toEqual([]);
    // simetria
    expect(stableStringify(merge3(sync(base), sync(r), sync(l)).merged.academy)).toBe(stableStringify(merged.academy));
  });

  it('a prática feita nos dois lados soma só o que cada um acrescentou', () => {
    const base = practice(newGame(T0), REF, 2, T0, 'b');
    const l = practice(base, REF, 2, T0 + HOUR, 'l');
    const r = practice(base, REF, 1, T0 + 2 * HOUR, 'r');
    const m = merge3(sync(base), sync(l), sync(r)).merged.academy[REF];
    expect(m.practice.answered).toBe(2 + 2 + 1);
    expect(m.practice.correct).toBe(5);
  });

  it('o mesmo marco conquistado nos dois aparelhos paga uma vez só', () => {
    const base = newGame(T0);
    const l = master(base, REF, T0 + HOUR, 'l');
    const r = master(base, REF, T0 + 2 * HOUR, 'r');
    const { merged, report } = merge3(sync(base), sync(l), sync(r));
    expect(report.unknownDuplicateKeys).toEqual([]);
    expect(report.duplicateGrants.map((d) => d.key)).toContain(`academy:${REF}:mastered`);
    const refunded = report.duplicateGrants.reduce((sum, d) => sum + d.xp, 0);
    expect(merged.profile.xp).toBe(l.profile.xp + r.profile.xp - base.profile.xp - refunded);
    expect(merged.profile.xp).toBe(l.profile.xp);
  });

  it('a revisão espaçada vem do lado que estudou por último (revisão falha volta para a caixa 1)', () => {
    const mastered = master(newGame(T0), REF, T0, 'm');
    const due = mastered.academy[REF].dueAt!;
    const l = master(mastered, REF, due + HOUR, 'rev-ok'); // revisão em dia: caixa 2
    let r = academyStartChallenge(mastered, { ref: REF, runId: 'rev-bad', seed: 9 }, due + 2 * HOUR).state;
    r.academy[REF].challenge.run!.items.forEach((item, i) => {
      r = academyChallengeAnswer(r, { ref: REF, runId: 'rev-bad', exerciseId: item.exerciseId, correct: false, answerId: `bad-${i}` }, due + 2 * HOUR + i + 1).state;
    });
    expect(l.academy[REF].box).toBe(2);
    expect(r.academy[REF].box).toBe(1);
    const m = merge3(sync(mastered), sync(l), sync(r)).merged.academy[REF];
    expect(m.box).toBe(1);
    expect(m.dueAt).toBe(r.academy[REF].dueAt);
    expect(m.masteredAt).toBe(mastered.academy[REF].masteredAt);
  });

  it('toda chave que a Academia grava no registro tem regra de estorno', () => {
    const { lesson } = getStage(REF);
    let g = newGame(T0);
    lesson.stages.forEach((st, k) => {
      const ref = `${lesson.id}/${st.id}`;
      g = practice(g, ref, 3, T0 + k * HOUR, `p${k}`);
      g = master(g, ref, T0 + k * HOUR + 100, `m${k}`);
    });
    g = master(g, REF, g.academy[REF].dueAt! + HOUR, 'review');
    const keys = Object.keys(g.ledger).filter((k) => k.startsWith('academy:'));
    for (const kind of [':studied', ':practiced', ':mastered', ':review', 'academy:seal:']) expect(keys.some((k) => k.includes(kind))).toBe(true);
    expect(keys.filter((k) => grantValue(k, g.quests) === null)).toEqual([]);
  });

  it('o progresso da Academia que some ou regride é barrado antes de gravar na nuvem', () => {
    const s = sync(master(newGame(T0), REF, T0 + HOUR, 'r1'));
    const { [REF]: _gone, ...rest } = s.academy;
    void _gone;
    expect(findRegressions(s, { ...s, academy: rest })).toEqual([`etapa ${REF} sumiu`]);
    const regressed = { ...s, academy: { ...s.academy, [REF]: { ...s.academy[REF], masteredAt: null } } };
    expect(findRegressions(s, regressed)).toEqual([`etapa ${REF} regrediu`]);
  });
});

describe('Academia entre aparelhos (SQLite real)', () => {
  async function dispatchMastery(d: Awaited<ReturnType<typeof makeDevice>>, ref: string, runId: string) {
    const step = (fn: (s: GameState, now: number) => Result) => d.controller.dispatch(fn);
    await step((s, now) => academyStartChallenge(s, { ref, runId, seed: 5 }, now));
    const run = d.state().academy[ref].challenge.run!;
    for (const [i, item] of run.items.entries()) {
      d.clock.advance(1000);
      await step((s, now) => academyChallengeAnswer(s, { ref, runId, exerciseId: item.exerciseId, correct: true, answerId: `${runId}-${i}` }, now));
    }
  }

  it('outro aparelho restaura as aulas, e o banco local guarda o que veio da nuvem', async () => {
    const cloud = new FakeCloud();
    const a = await makeDevice({ uid: UID, name: 'A', cloud, clock: new Clock() });
    await a.engine.syncNow();
    await a.onboard();
    await dispatchMastery(a, REF, 'a-run');
    await a.engine.syncNow();

    const path = join(mkdtempSync(join(tmpdir(), 'qf-aca-')), 'b.db');
    const clockB = new Clock(T0 + DAY);
    const b = await makeDevice({ uid: UID, name: 'B', cloud, clock: clockB, driverPath: path });
    await b.engine.syncNow();
    expect(b.state().academy[REF].masteredAt).toBe(a.state().academy[REF].masteredAt);
    b.close();

    const reopened = await makeDevice({ uid: UID, name: 'B2', cloud, clock: clockB, driverPath: path });
    expect(reopened.state().academy[REF].masteredAt).toBe(a.state().academy[REF].masteredAt);
    expect(stableStringify(sync(reopened.state()).academy)).toBe(stableStringify(sync(a.state()).academy));
    reopened.close();
    a.close();
  });
});
