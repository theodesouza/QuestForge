import { QUESTIONS } from '../../content/bank';
import { SHOP_ITEMS } from '../../content/items';
import { MISSION_FIRST_INK, MISSION_FIRST_XP } from '../../domain/progression/xp';
import type { GameState } from '../../domain/game/types';
import { buyItem } from '../../domain/game/game';
import { findRegressions, grantValue, merge3 } from '../merge';
import {
  SNAPSHOT_SCHEMA,
  SnapshotError,
  decodeSyncState,
  encodeSyncState,
  isPristine,
  meaningfulKey,
  pristineSyncState,
  statsOf,
  toSyncState,
  withSyncState,
} from '../snapshot';
import { DAY, HOUR, T0, clearRegion1, newGame, playExpedition, playMission, playQuestions, winBoss } from '../testing/gameplay';

const sync = (g: GameState) => toSyncState(g);
const key = (s: ReturnType<typeof sync>) => encodeSyncState(s);

/** Estado de partida com atividade variada: missões, estrelas, chefão, itens, encomendas. */
function veteran(): GameState {
  let g = newGame(T0);
  g = clearRegion1(g, T0 + 1000);
  g = winBoss(g, 'golem-proporcional', T0 + 4 * DAY);
  g = playExpedition(g, 10, false, T0 + 5 * DAY);
  return g;
}

describe('snapshot', () => {
  it('codifica e decodifica sem alterar nada (ida e volta idêntica)', () => {
    const s = sync(veteran());
    const text = encodeSyncState(s);
    expect(decodeSyncState(text)).toEqual(s);
    expect(encodeSyncState(decodeSyncState(text))).toBe(text);
  });

  it('é canônico: a ordem de inserção das chaves não muda o texto', () => {
    const s = sync(veteran());
    const reversed = {
      ...s,
      ledger: Object.fromEntries(Object.entries(s.ledger).reverse()),
      questionStates: Object.fromEntries(Object.entries(s.questionStates).reverse()),
    };
    expect(encodeSyncState(reversed)).toBe(encodeSyncState(s));
  });

  it('não leva sessão, batalha nem o fuso do aparelho', () => {
    const g = newGame(T0);
    const text = encodeSyncState(sync(g));
    expect(text).not.toContain('tzOffsetMin');
    expect(text).not.toContain('"session"');
    const applied = withSyncState({ ...g, profile: { ...g.profile, tzOffsetMin: 0 } }, sync(g));
    expect(applied.profile.tzOffsetMin).toBe(0);
  });

  it('é compacto: o banco inteiro de questões respondidas cabe com folga no documento', () => {
    let g = newGame(T0);
    const ids = QUESTIONS.map((q) => q.id);
    for (let i = 0; i < ids.length; i += 25) g = playQuestions(g, ids.slice(i, i + 25), true, T0 + i * 1000, 'bulk');
    const size = encodeSyncState(sync(g)).length;
    expect(Object.keys(g.questionStates).length).toBe(QUESTIONS.length);
    expect(size).toBeLessThan(200_000); // limite do documento: 900 000
  });

  it('rejeita lixo, versão futura e dados incoerentes — nunca devolve estado parcial', () => {
    const text = encodeSyncState(sync(newGame(T0)));
    expect(() => decodeSyncState('{{')).toThrow(SnapshotError);
    expect(() => decodeSyncState('[]')).toThrow(/raiz/);
    expect(() => decodeSyncState(text.replace(`"v":${SNAPSHOT_SCHEMA}`, '"v":999'))).toThrow(/schema/);
    try {
      decodeSyncState(text.replace(`"v":${SNAPSHOT_SCHEMA}`, '"v":999'));
    } catch (e) {
      expect((e as SnapshotError).code).toBe('too-new');
    }
    const broken = JSON.parse(text);
    broken.led = { 'level:2': 'ontem' };
    expect(() => decodeSyncState(JSON.stringify(broken))).toThrow(/registro/);
    const noProfile = JSON.parse(text);
    delete noProfile.profile;
    expect(() => decodeSyncState(JSON.stringify(noProfile))).toThrow(/perfil/);
  });

  it('mudar só campos voláteis (última atividade, descanso) não conta como alteração a enviar', () => {
    const s = sync(veteran());
    const touched = { ...s, profile: { ...s.profile, lastActiveAt: (s.profile.lastActiveAt ?? 0) + 5000, restedPool: 300 } };
    expect(meaningfulKey(touched)).toBe(meaningfulKey(s));
    const played = { ...s, profile: { ...s.profile, xp: s.profile.xp + 1 } };
    expect(meaningfulKey(played)).not.toBe(meaningfulKey(s));
  });

  it('reconhece o estado virgem e resume as estatísticas', () => {
    expect(isPristine(pristineSyncState(T0))).toBe(true);
    expect(isPristine(sync(newGame(T0)))).toBe(false);
    const stats = statsOf(sync(veteran()));
    expect(stats).toMatchObject({ nodes: 3, bosses: 1 });
    expect(stats.xp).toBeGreaterThan(0);
  });
});

describe('merge de 3 vias', () => {
  const base = sync(veteran());

  it('é neutro: sem mudança de um dos lados, vale o outro', () => {
    const local = sync(playExpedition(withSyncState(newGame(T0), base), 10, true, T0 + 6 * DAY, 'a'));
    expect(key(merge3(base, local, base).merged)).toBe(key(local));
    expect(key(merge3(base, base, local).merged)).toBe(key(local));
    expect(key(merge3(base, base, base).merged)).toBe(key(base));
  });

  it('lados idênticos são a mesma história: nada é contado duas vezes', () => {
    const local = sync(playExpedition(withSyncState(newGame(T0), base), 10, true, T0 + 6 * DAY, 'a'));
    const r = merge3(base, local, { ...local, profile: { ...local.profile, lastActiveAt: (local.profile.lastActiveAt ?? 0) + 1 } });
    expect(r.merged.profile.xp).toBe(local.profile.xp);
    expect(r.merged.profile.totals.answered).toBe(local.profile.totals.answered);
    expect(r.report.diverged).toBe(false);
  });

  it('é idempotente: reenviar o mesmo estado não soma nada', () => {
    const local = sync(playExpedition(withSyncState(newGame(T0), base), 10, true, T0 + 6 * DAY, 'a'));
    const r = merge3(base, local, local);
    expect(key(r.merged)).toBe(key(local));
    expect(r.report.duplicateGrants).toEqual([]);
  });

  it('dois aparelhos que estudaram offline somam o que cada um acrescentou (sem perder nem duplicar)', () => {
    const start = withSyncState(newGame(T0), base);
    const a = playExpedition(start, 10, true, T0 + 6 * DAY, 'A');
    const b = playExpedition(start, 5, true, T0 + 6 * DAY + 3 * HOUR, 'B');
    const [sa, sb] = [sync(a), sync(b)];
    const { merged, report } = merge3(base, sa, sb);
    const dxpA = sa.profile.xp - base.profile.xp;
    const dxpB = sb.profile.xp - base.profile.xp;
    expect(dxpA).toBeGreaterThan(0);
    expect(dxpB).toBeGreaterThan(0);
    // XP final = base + o que cada aparelho acrescentou − recompensas únicas pagas em dobro
    //            + encomendas que só fecharam somando os dois (liquidadas na fusão).
    const settledXp = report.settledQuests.reduce((sum, k) => sum + settleXp(k, merged), 0);
    expect(merged.profile.xp).toBe(base.profile.xp + dxpA + dxpB - report.duplicateGrants.reduce((s, d) => s + d.xp, 0) + settledXp);
    expect(report.duplicateGrants.length).toBeGreaterThan(0);
    expect(merged.profile.totals.answered).toBe(
      base.profile.totals.answered + (sa.profile.totals.answered - base.profile.totals.answered) + (sb.profile.totals.answered - base.profile.totals.answered),
    );
    expect(report.diverged).toBe(true);
    expect(findRegressions(sa, merged)).toEqual([]);
    expect(findRegressions(sb, merged)).toEqual([]);
  });

  it('é simétrico: a ordem dos aparelhos não muda o resultado', () => {
    const start = withSyncState(newGame(T0), base);
    const sa = sync(playExpedition(start, 10, true, T0 + 6 * DAY, 'A'));
    const sb = sync(playExpedition(start, 10, false, T0 + 6 * DAY + 3 * HOUR, 'B'));
    expect(key(merge3(base, sa, sb).merged)).toBe(key(merge3(base, sb, sa).merged));
  });

  it('recompensa única paga nos dois aparelhos é estornada uma vez (sem XP nem Tinta em dobro)', () => {
    const start = withSyncState(newGame(T0), pristineSyncState(T0));
    const pristine = sync(newGame(T0));
    // Os dois aparelhos partem da mesma base e concluem a mesma missão pela primeira vez.
    const a = sync(playMission(start, 'r1-m1', 5, T0 + DAY, 'A'));
    const b = sync(playMission(start, 'r1-m1', 5, T0 + DAY + HOUR, 'B'));
    expect(a.ledger['mission:r1-m1:first']).toBeDefined();
    expect(b.ledger['mission:r1-m1:first']).toBeDefined();
    const { merged, report } = merge3(pristine, a, b);
    const dup = report.duplicateGrants.find((d) => d.key === 'mission:r1-m1:first');
    expect(dup).toEqual({ key: 'mission:r1-m1:first', xp: MISSION_FIRST_XP, ink: MISSION_FIRST_INK });
    // Todas as chaves duplicadas (nível, estrelas…) foram estornadas: nenhuma sobra de pagamento em dobro.
    const dxp = (s: typeof a) => s.profile.xp - pristine.profile.xp;
    const dink = (s: typeof a) => s.profile.ink - pristine.profile.ink;
    expect(merged.profile.xp).toBe(pristine.profile.xp + dxp(a) + dxp(b) - report.duplicateGrants.reduce((s, d) => s + d.xp, 0));
    expect(merged.profile.ink).toBe(pristine.profile.ink + dink(a) + dink(b) - report.duplicateGrants.reduce((s, d) => s + d.ink, 0));
    expect(report.unknownDuplicateKeys).toEqual([]);
    expect(merged.campaign['r1-m1'].runs).toBe(2);
  });

  it('compra duplicada do mesmo item cobra uma vez só', () => {
    const item = SHOP_ITEMS[0];
    const g = { ...newGame(T0) };
    g.profile = { ...g.profile, ink: 500 };
    const pristine = sync(g);
    const a = sync(buyItem(g, item.id, T0 + 1000).state);
    const b = sync(buyItem(g, item.id, T0 + 2000).state);
    const { merged, report } = merge3(pristine, a, b);
    expect(report.duplicateGrants).toEqual([{ key: `shop:${item.id}`, xp: 0, ink: -item.price! }]);
    expect(merged.profile.ink).toBe(500 - item.price!);
    expect(merged.inventory[item.id]).toBeDefined();
  });

  it('duas compras diferentes com o mesmo saldo nunca deixam Tinta negativa', () => {
    const [x, y] = SHOP_ITEMS;
    const g = { ...newGame(T0) };
    g.profile = { ...g.profile, ink: Math.max(x.price!, y.price!) };
    const pristine = sync(g);
    const a = sync(buyItem(g, x.id, T0 + 1000).state);
    const b = sync(buyItem(g, y.id, T0 + 2000).state);
    const { merged, report } = merge3(pristine, a, b);
    expect(merged.profile.ink).toBe(0);
    expect(report.inkForgiven).toBeGreaterThan(0);
    // Nada se perde: os dois itens ficam no inventário.
    expect(merged.inventory[x.id]).toBeDefined();
    expect(merged.inventory[y.id]).toBeDefined();
  });

  it('campos de escolha: só um lado mudou ⇒ vale a mudança; os dois mudaram ⇒ vale o aparelho usado por último', () => {
    const rename = (name: string, at: number) => {
      const g = withSyncState(newGame(T0), base);
      return sync({ ...g, profile: { ...g.profile, name, lastActiveAt: at } });
    };
    const onlyLocal = rename('Nova', T0 + DAY);
    expect(merge3(base, onlyLocal, base).merged.profile.name).toBe('Nova');
    expect(merge3(base, base, onlyLocal).merged.profile.name).toBe('Nova');
    const older = rename('Antigo', T0 + DAY);
    const newer = rename('Recente', T0 + 2 * DAY);
    expect(merge3(base, older, newer).merged.profile.name).toBe('Recente');
    expect(merge3(base, newer, older).merged.profile.name).toBe('Recente');
  });

  it('recordes nunca diminuem: melhor pontuação, estrelas e conclusão são os melhores dos dois', () => {
    const start = withSyncState(newGame(T0), sync(newGame(T0)));
    const a = sync(playMission(start, 'r1-m1', 5, T0 + DAY, 'A'));
    const b = sync(playMission(start, 'r1-m1', 4, T0 + DAY + HOUR, 'B'));
    const { merged } = merge3(sync(newGame(T0)), a, b);
    const n = merged.campaign['r1-m1'];
    expect(n.bestScore).toBe(Math.max(a.campaign['r1-m1'].bestScore!, b.campaign['r1-m1'].bestScore!));
    expect(n.bestStars).toBe(Math.max(a.campaign['r1-m1'].bestStars, b.campaign['r1-m1'].bestStars));
    expect(n.completedAt).toBe(Math.min(a.campaign['r1-m1'].completedAt!, b.campaign['r1-m1'].completedAt!));
  });

  it('a mesma questão respondida nos dois aparelhos soma as respostas e mantém o agendamento do mais recente', () => {
    const start = withSyncState(newGame(T0), sync(newGame(T0)));
    const qid = QUESTIONS[0].id;
    const pristine = sync(newGame(T0));
    const a = sync(playQuestions(start, [qid], true, T0 + DAY, 'A'));
    const b = sync(playQuestions(start, [qid], false, T0 + 2 * DAY, 'B'));
    const { merged, report } = merge3(pristine, a, b);
    const q = merged.questionStates[qid];
    expect(q.seen).toBe(2);
    expect(q.correct + q.wrong).toBe(2);
    expect(q.echo).toBe(true); // B respondeu por último e errou
    expect(q.lastAnsweredAt).toBe(b.questionStates[qid].lastAnsweredAt);
    expect(report.conflictingQuestions).toBeGreaterThanOrEqual(1);
  });

  it('encomenda que só fecha somando os dois aparelhos é liquidada uma vez', () => {
    const g0 = newGame(T0);
    const board = g0.quests.daily!;
    const q = board.quests[0];
    expect(q.target).toBeGreaterThan(1);
    const half = Math.ceil(q.target / 2);
    const withProgress = (n: number) =>
      sync({ ...g0, quests: { ...g0.quests, daily: { ...board, progress: { ...board.progress, [q.id]: n } } } });
    const pristine = withProgress(0);
    const a = withProgress(half);
    const b = withProgress(q.target - half + 1 > q.target ? q.target : q.target - half + 1);
    const { merged, report } = merge3(pristine, a, b);
    expect(merged.quests.daily!.progress[q.id]).toBe(q.target);
    const k = `quest:daily:${board.key}:${q.id}`;
    expect(report.settledQuests).toContain(k);
    expect(merged.ledger[k]).toBeDefined();
    expect(merged.profile.xp).toBe(pristine.profile.xp + q.xp);
    // Reaplicar o merge sobre o resultado não paga de novo.
    const again = merge3(pristine, merged, merged);
    expect(again.report.settledQuests).toEqual([]);
    expect(again.merged.profile.xp).toBe(merged.profile.xp);
  });

  it('quadros de dias diferentes: vale o mais novo (o calendário só avança)', () => {
    const today = newGame(T0);
    const tomorrow = newGame(T0 + DAY);
    const a = sync(today);
    const b = sync({ ...today, quests: tomorrow.quests });
    const { merged } = merge3(a, a, b);
    expect(merged.quests.daily!.key > a.quests.daily!.key).toBe(true);
  });
});

describe('encomendas semanais', () => {
  it('"dias de estudo" conta dias distintos: dois aparelhos no mesmo dia valem um dia', () => {
    const start = withSyncState(newGame(T0), sync(newGame(T0)));
    const pristine = sync(newGame(T0));
    const a = sync(playExpedition(start, 5, true, T0 + HOUR, 'A'));
    const b = sync(playExpedition(start, 5, true, T0 + 2 * HOUR, 'B'));
    const { merged } = merge3(pristine, a, b);
    const studyDays = merged.quests.weekly!.quests.find((q) => q.metric === 'studyDays')!;
    expect(merged.quests.weekly!.days).toHaveLength(1);
    expect(merged.quests.weekly!.progress[studyDays.id]).toBe(1);
  });
});

describe('salvaguarda contra regressão', () => {
  it('barra um estado vazio sobre um progresso existente', () => {
    const remote = sync(veteran());
    const empty = pristineSyncState(T0);
    const problems = findRegressions(remote, empty);
    expect(problems.length).toBeGreaterThan(3);
    expect(problems.join()).toMatch(/recompensa|item|missão|chefão|perfil/);
  });

  it('não acusa nada quando o novo estado é o antigo mais progresso', () => {
    const before = veteran();
    const after = playExpedition(before, 10, true, T0 + 9 * DAY, 'z');
    expect(findRegressions(sync(before), sync(after))).toEqual([]);
  });

  it('detecta perda de uma única recompensa', () => {
    const s = sync(veteran());
    const { ['level:2']: _gone, ...ledger } = s.ledger;
    void _gone;
    expect(findRegressions(s, { ...s, ledger })).toEqual(['recompensa level:2 sumiu']);
  });
});

describe('recompensas únicas conhecidas', () => {
  it('toda chave que o jogo grava no registro tem regra de estorno', () => {
    let g = veteran();
    g = { ...g, profile: { ...g.profile, ink: g.profile.ink + 500 } };
    const shop = SHOP_ITEMS.find((i) => !g.inventory[i.id]);
    if (shop) g = buyItem(g, shop.id, T0 + 10 * DAY).state;
    g = winBoss(g, 'golem-proporcional', T0 + 11 * DAY, 'rep'); // vitória repetida: chave `boss:…:win:<dia>`
    g = playMission(g, 'r1-m1', 5, T0 + 12 * DAY, 'again');
    const keys = Object.keys(g.ledger);
    expect(keys.some((k) => k.startsWith('level:'))).toBe(true);
    expect(keys.some((k) => k.startsWith('mission:'))).toBe(true);
    expect(keys.some((k) => k.startsWith('boss:'))).toBe(true);
    expect(keys.some((k) => k.startsWith('quest:'))).toBe(true);
    const unknown = keys.filter((k) => grantValue(k, g.quests) === null);
    expect(unknown).toEqual([]);
  });
});

/** XP que a liquidação de uma chave pagou (encomenda ou baú). */
function settleXp(key: string, merged: ReturnType<typeof sync>): number {
  const [, period, boardKey, ...rest] = key.split(':');
  const board = merged.quests[period as 'daily' | 'weekly']!;
  if (board.key !== boardKey) return 0;
  const id = rest.join(':');
  return id === 'bonus' ? (period === 'daily' ? 20 : board.share && board.share < 1 ? 0 : 100) : board.quests.find((q) => q.id === id)!.xp;
}
