/**
 * "O que devo estudar agora?" — escolhe um subassunto para foco:
 * fraco (com evidência) > em descoberta > inexplorado de alto peso no ENEM.
 */
import type { Question, TopicId } from '../../content/types';
import { getTopic } from '../../content/topics';
import { masteryBySubtopic, subtopicKey, type MasteryInfo } from './mastery';
import type { QuestionState } from './srs';

export interface Recommendation {
  topic: TopicId;
  subtopic: string;
  reason: 'fraco' | 'descoberta' | 'inexplorado' | 'consolidar';
  mastery: MasteryInfo;
}

export function recommendFocus(
  questions: readonly Question[],
  states: Record<string, QuestionState>,
): Recommendation | null {
  const mastery = masteryBySubtopic(questions, states);
  const available = new Map<string, { topic: TopicId; subtopic: string; count: number }>();
  for (const q of questions) {
    const key = subtopicKey(q.topic, q.subtopic);
    const entry = available.get(key) ?? { topic: q.topic, subtopic: q.subtopic, count: 0 };
    entry.count++;
    available.set(key, entry);
  }

  let best: { rec: Recommendation; score: number } | null = null;
  for (const [key, { topic, subtopic, count }] of available) {
    if (count < 2) continue;
    const m = mastery.get(key)!;
    const weight = getTopic(topic).enemWeight;
    let score: number;
    let reason: Recommendation['reason'];
    switch (m.level) {
      case 'progresso':
        score = 30 + (1 - m.estimate) * 20 + weight;
        reason = 'fraco';
        break;
      case 'descoberta':
        score = 20 + weight;
        reason = 'descoberta';
        break;
      case 'inexplorado':
        score = 10 + weight * 2;
        reason = 'inexplorado';
        break;
      case 'firme':
        score = 5 + weight * 0.5;
        reason = 'consolidar';
        break;
      default:
        score = 0;
        reason = 'consolidar';
    }
    if (!best || score > best.score) best = { rec: { topic, subtopic, reason, mastery: m }, score };
  }
  return best?.rec ?? null;
}
