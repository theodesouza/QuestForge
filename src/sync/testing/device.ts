/**
 * "Aparelho" de teste: SQLite real (node:sqlite) + GameController + SyncEngine, com relógio manual.
 * Dois aparelhos com a mesma conta e a mesma FakeCloud reproduzem os cenários multi-dispositivo.
 */
import { getQuestion } from '../../content/bank';
import { getRegion } from '../../content/regions';
import { openNodeDriver } from '../../data/testing/nodeDriver';
import { SqlGameRepository } from '../../data/repository/SqlGameRepository';
import { MIGRATIONS, migrate } from '../../data/migrations';
import { MemoryGameRepository } from '../../data/repository/MemoryGameRepository';
import type { GameRepository } from '../../data/repository/GameRepository';
import {
  answerCurrent,
  battleAnswer,
  completeOnboarding,
  currentQuestionId,
  finishSession,
  planExpedition,
  planMission,
  startBattle,
  startSession,
} from '../../domain/game/game';
import type { GameState, Result } from '../../domain/game/types';
import { GameController } from '../../state/controller';
import { SyncEngine, type EngineDeps } from '../engine';
import { BRT, T0, wrongKey } from './gameplay';
import type { CloudStore } from '../types';

export class Clock {
  constructor(public t: number = T0) {}
  now = () => this.t;
  advance(ms: number) {
    this.t += ms;
  }
  set(t: number) {
    this.t = t;
  }
}

export interface Device {
  /** Estados publicados para a tela (o que a interface veria). */
  published: GameState[];
  uid: string;
  name: string;
  clock: Clock;
  repo: GameRepository;
  controller: GameController;
  engine: SyncEngine;
  close(): void;
  state(): GameState;
  onboard(name?: string): Promise<void>;
  expedition(ids: string[], correct?: boolean[] | boolean): Promise<void>;
  planned(minutes: number): string[];
  mission(nodeId: string, correctCount: number): Promise<Result>;
  boss(bossId: string): Promise<GameState>;
}

export interface DeviceOptions {
  uid: string;
  name: string;
  cloud: CloudStore;
  clock?: Clock;
  /** Banco já existente (simula "reabrir o app"). */
  driverPath?: string;
  memory?: boolean;
  engine?: Partial<EngineDeps>;
  /** Não inicia o controlador (para testes que montam o aparelho por etapas). */
  skipInit?: boolean;
  /** Cria o banco só até esta versão do esquema (simula um aparelho com o app antigo). */
  schemaVersion?: number;
}

let seq = 0;

export async function makeDevice(opts: DeviceOptions): Promise<Device> {
  const clock = opts.clock ?? new Clock();
  const driver = opts.memory ? null : openNodeDriver(opts.driverPath);
  if (driver && opts.schemaVersion !== undefined) await migrate(driver, MIGRATIONS.filter((m) => m.version <= opts.schemaVersion!));
  const repo: GameRepository = driver
    ? new SqlGameRepository(driver, clock.now, opts.schemaVersion !== undefined ? { migrate: false } : {})
    : new MemoryGameRepository();
  const published: GameState[] = [];
  const controller = new GameController({ repo, clock: clock.now, tzOffset: () => BRT, onState: (st) => published.push(st) });
  const engine = new SyncEngine({
    uid: opts.uid,
    controller,
    repo,
    cloud: opts.cloud,
    clock: clock.now,
    newId: (p) => `${opts.name}-${p}-${seq++}`,
    appVersion: 'test',
    timeoutMs: 200,
    ...opts.engine,
  });
  if (!opts.skipInit) await controller.init();

  const run = (fn: (s: GameState, now: number) => Result) => controller.dispatch(fn);
  const attemptId = () => `${opts.name}-a${seq++}`;

  const device: Device = {
    published,
    uid: opts.uid,
    name: opts.name,
    clock,
    repo,
    controller,
    engine,
    close: () => {
      engine.dispose();
      driver?.close();
    },
    state: () => controller.current!,
    async onboard(name = 'Lia') {
      await run((s, now) => completeOnboarding(s, { name, goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null }, now));
    },
    planned: (minutes) => planExpedition(controller.current!, minutes, clock.now(), 11),
    async expedition(ids, correct = true) {
      await run((s, now) => startSession(s, { id: `${opts.name}-s${seq++}`, mode: 'expedition', nodeId: null, minutes: null, questionIds: ids }, now));
      let i = 0;
      while (controller.current!.session && currentQuestionId(controller.current!.session)) {
        const qid = currentQuestionId(controller.current!.session)!;
        const ok = Array.isArray(correct) ? correct[i] !== false : correct;
        clock.advance(1000);
        await run((s, now) => answerCurrent(s, { attemptId: attemptId(), chosen: ok ? getQuestion(qid).answer : wrongKey(qid), guessed: false, hints: 0, timeMs: 40_000 }, now));
        i++;
      }
      clock.advance(1000);
      await run((s, now) => finishSession(s, now));
    },
    async mission(nodeId, correctCount) {
      const node = getRegion('vale-proporcoes').nodes.find((n) => n.id === nodeId);
      if (!node || node.kind !== 'mission') throw new Error(`Nó inválido: ${nodeId}`);
      const ids = planMission(controller.current!, node, clock.now(), 7);
      await run((s, now) => startSession(s, { id: `${opts.name}-m${seq++}`, mode: 'mission', nodeId, minutes: null, questionIds: ids }, now));
      let i = 0;
      while (controller.current!.session && currentQuestionId(controller.current!.session)) {
        const qid = currentQuestionId(controller.current!.session)!;
        clock.advance(1000);
        const k = i++;
        await run((s, now) => answerCurrent(s, { attemptId: attemptId(), chosen: k < correctCount ? getQuestion(qid).answer : wrongKey(qid), guessed: false, hints: 0, timeMs: 40_000 }, now));
      }
      clock.advance(1000);
      return run((s, now) => finishSession(s, now));
    },
    async boss(bossId) {
      await run((s, now) => startBattle(s, bossId, `${opts.name}-b${seq++}`, now));
      let guard = 0;
      while (controller.current!.battle?.status === 'active' && guard++ < 40) {
        const qid = controller.current!.battle!.currentQuestionId!;
        clock.advance(1000);
        await run((s, now) => battleAnswer(s, { attemptId: attemptId(), chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 1000 }, now));
      }
      return controller.current!;
    },
  };
  return device;
}

/** Atalho: concluir as três missões da Região 1 (abre o Golem). */
export async function clearRegion1(d: Device): Promise<void> {
  for (const id of ['r1-m1', 'r1-m2', 'r1-m3']) {
    d.clock.advance(24 * 60 * 60 * 1000);
    await d.mission(id, 5);
  }
}
