/**
 * "O que estudar agora?" na Academia — recomendações de etapas a partir das evidências:
 * erros de uma missão/batalha que acabou, dificuldades em aberto no Atlas, revisões de
 * domínio vencidas, a aula em andamento e a preparação para o próximo marco da campanha.
 */
import { findLesson, findStage, lessonsFor, stageRef, stagesForQuestion, STAGE_REFS } from '../../content/academy/catalog';
import { BOSSES, getBoss } from '../../content/bosses';
import { REGIONS } from '../../content/regions';
import type { Lesson } from '../../content/academy/types';
import type { TopicId } from '../../content/types';
import { getTopic } from '../../content/topics';
import { nextNode, type BossProgress, type NodeProgress } from '../campaign/campaign';
import type { QuestionState } from '../learning/srs';
import { stageEvidence, type StageEvidence } from './evidence';
import { isReviewDue, lastActiveStage, stageStatus, type StageProgress } from './progress';

export type RecReason = 'erros-recentes' | 'dificuldade' | 'atencao' | 'revisao' | 'continuar' | 'preparo';
export type RecAction = 'estudar' | 'testar' | 'revisar';

export interface StageRec {
  ref: string;
  reason: RecReason;
  /** Estudar a etapa, testar nas questões do Atlas (já estudou depois dos erros) ou revisar o domínio. */
  action: RecAction;
  detail: string;
  score: number;
  evidence?: StageEvidence;
}

export interface RecommendInput {
  questionStates: Record<string, QuestionState>;
  academy: Record<string, StageProgress>;
  campaign: Record<string, NodeProgress>;
  bosses: Record<string, BossProgress>;
}

export interface RecommendOptions {
  /** Questões erradas na atividade que acabou (missão, batalha, expedição). */
  wrongIds?: readonly string[];
  /** Como chamar essa atividade numa frase: "nesta missão", "nesta batalha". */
  where?: string;
  limit?: number;
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Etapas mais ligadas a um conjunto de questões (peso 1 para a principal, 0,5 para as demais). */
export function stagesForQuestions(ids: readonly string[]): { ref: string; weight: number; count: number }[] {
  const acc = new Map<string, { weight: number; count: number }>();
  for (const id of ids) {
    stagesForQuestion(id).forEach((ref, i) => {
      const e = acc.get(ref) ?? { weight: 0, count: 0 };
      e.weight += i === 0 ? 1 : 0.5;
      if (i === 0) e.count += 1;
      acc.set(ref, e);
    });
  }
  return [...acc.entries()].map(([ref, v]) => ({ ref, ...v })).sort((a, b) => b.weight - a.weight);
}

function enemWeight(ref: string): number {
  const loc = findStage(ref);
  return loc ? getTopic(loc.lesson.topic).enemWeight : 3;
}

export function recommendStages(input: RecommendInput, now: number, opts: RecommendOptions = {}): StageRec[] {
  const { questionStates, academy } = input;
  const best = new Map<string, StageRec>();
  const offer = (rec: StageRec) => {
    if (!findStage(rec.ref)) return;
    const prev = best.get(rec.ref);
    if (!prev || rec.score > prev.score) best.set(rec.ref, rec);
  };

  // 1. Erros da atividade que acabou de terminar.
  if (opts.wrongIds?.length) {
    const where = opts.where ?? 'nesta atividade';
    for (const { ref, weight, count } of stagesForQuestions(opts.wrongIds)) {
      if (count === 0) continue;
      const p = academy[ref];
      const mastered = p?.masteredAt != null;
      offer({
        ref,
        reason: 'erros-recentes',
        action: mastered ? 'revisar' : 'estudar',
        detail: mastered
          ? `Você já dominou esta etapa, mas ${plural(count, 'questão', 'questões')} dela ${count === 1 ? 'escapou' : 'escaparam'} ${where}: uma revisão rápida ajuda a fixar.`
          : `${plural(count, 'erro', 'erros')} ${where} em questões que esta etapa ensina a resolver.`,
        score: 100 + weight * 10,
      });
    }
  }

  // 2–3. Dificuldades e alertas em aberto no Atlas.
  for (const ref of STAGE_REFS) {
    const p = academy[ref];
    const ev = stageEvidence(ref, questionStates, p);
    if (ev.level !== 'dificuldade' && ev.level !== 'atencao') continue;
    const studiedAfter = p && ev.lastOpenAt !== null && (p.masteredAt ?? p.studiedAt ?? 0) > ev.lastOpenAt;
    const n = ev.openIds.length;
    if (studiedAfter) {
      offer({
        ref,
        reason: ev.level,
        action: 'testar',
        detail: `Você estudou esta etapa depois ${n === 1 ? 'do erro' : 'dos erros'}: hora de testar nas questões do Atlas e redimir ${n === 1 ? 'o Eco' : 'os Ecos'}.`,
        score: (ev.level === 'dificuldade' ? 70 : 45) + n * 3,
        evidence: ev,
      });
    } else {
      offer({
        ref,
        reason: ev.level,
        action: 'estudar',
        detail:
          ev.level === 'dificuldade'
            ? `${plural(n, 'erro ainda não redimido', 'erros ainda não redimidos')} em questões do Atlas que dependem desta etapa.`
            : 'Um erro ainda em aberto numa questão desta etapa — sozinho não é diagnóstico, mas vale revisar.',
        score: (ev.level === 'dificuldade' ? 80 : 50) + n * 4 + enemWeight(ref),
        evidence: ev,
      });
    }
  }

  // 4. Revisões de domínio vencidas.
  for (const p of Object.values(academy)) {
    if (!isReviewDue(p, now)) continue;
    offer({ ref: p.ref, reason: 'revisao', action: 'revisar', detail: 'Revisão de domínio pronta: um desafio curto mantém o que você aprendeu.', score: 40 });
  }

  // 5. Continuar de onde parou.
  const last = lastActiveStage(academy);
  if (last && stageStatus(last) !== 'dominado') {
    offer({ ref: last.ref, reason: 'continuar', action: 'estudar', detail: 'Continue de onde parou.', score: 30 });
  }

  // 6. Preparação para o próximo marco do Atlas.
  const next = nextNode({ progress: input.campaign, bosses: input.bosses });
  if (next) {
    const { topics, subtopics } =
      next.node.kind === 'mission'
        ? { topics: next.node.topics, subtopics: next.node.subtopics }
        : (() => {
            const boss = getBoss(next.node.bossId);
            return { topics: boss.topics, subtopics: boss.subtopics };
          })();
    const target = firstUnstudied(topics, subtopics, academy);
    if (target) {
      offer({
        ref: target,
        reason: 'preparo',
        action: 'estudar',
        detail: `Prepara para ${next.node.kind === 'boss' ? 'o chefão' : 'a próxima missão'}: ${next.node.title}.`,
        score: 20,
      });
    }
  }

  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, opts.limit ?? 3);
}

function firstUnstudied(topics: TopicId[], subtopics: string[], academy: Record<string, StageProgress>): string | null {
  for (const topic of topics) {
    const lessons = subtopics.length ? subtopics.flatMap((s) => lessonsFor(topic, s)) : lessonsFor(topic);
    for (const lesson of lessons) {
      for (const s of lesson.stages) {
        const ref = stageRef(lesson.id, s.id);
        const status = stageStatus(academy[ref]);
        if (status === 'novo' || status === 'visto') return ref;
      }
    }
  }
  return null;
}

// ———————————————————————————————————————————————— preparação para chefões e missões

export interface Preparation {
  lessonIds: string[];
  stages: number;
  studied: number;
  mastered: number;
}

export function preparationFor(topics: TopicId[], subtopics: string[], academy: Record<string, StageProgress>): Preparation {
  const lessonIds = new Set<string>();
  for (const topic of topics) {
    const lessons = subtopics.length ? subtopics.flatMap((s) => lessonsFor(topic, s)) : lessonsFor(topic);
    for (const l of lessons) lessonIds.add(l.id);
  }
  let stages = 0;
  let studied = 0;
  let mastered = 0;
  for (const id of lessonIds) {
    const lesson = findLesson(id);
    if (!lesson) continue;
    for (const s of lesson.stages) {
      const status = stageStatus(academy[stageRef(id, s.id)]);
      stages++;
      if (status === 'estudado' || status === 'dominado') studied++;
      if (status === 'dominado') mastered++;
    }
  }
  return { lessonIds: [...lessonIds], stages, studied, mastered };
}

/** Bônus de dano por preparo na Academia: até +15% com todas as etapas do chefão dominadas. */
export const PREP_BONUS_MAX = 0.15;

export function bossPrepBonus(bossId: string, academy: Record<string, StageProgress>): number {
  const boss = getBoss(bossId);
  const prep = preparationFor(boss.topics, boss.subtopics, academy);
  if (prep.stages === 0) return 0;
  return Math.round((PREP_BONUS_MAX * prep.mastered * 100) / prep.stages) / 100;
}

/** Missões e chefões do Atlas cujos assuntos a aula cobre. */
export function preparesFor(lesson: Lesson): { label: string; kind: 'mission' | 'boss' }[] {
  const out: { label: string; kind: 'mission' | 'boss' }[] = [];
  for (const region of REGIONS) {
    for (const node of region.nodes) {
      if (node.kind === 'mission') {
        if (node.topics.includes(lesson.topic) && node.subtopics.some((s) => lesson.subtopics.includes(s))) out.push({ label: node.title, kind: 'mission' });
      } else {
        const boss = BOSSES.find((b) => b.id === node.bossId);
        if (boss && boss.topics.includes(lesson.topic) && (boss.subtopics.length === 0 || boss.subtopics.some((s) => lesson.subtopics.includes(s)))) {
          out.push({ label: boss.name, kind: 'boss' });
        }
      }
    }
  }
  return out;
}
