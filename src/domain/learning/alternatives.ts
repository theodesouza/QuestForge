/**
 * Embaralhamento das alternativas por tentativa.
 *
 * O gabarito continua guardado pela letra canônica do banco (A–E); só a ordem de
 * exibição muda. A ordem é derivada da tentativa (sessão ou batalha) e da questão:
 * determinística — retomar uma sessão mostra a mesma ordem — e diferente a cada
 * nova tentativa. O domínio sempre recebe e registra a letra canônica.
 */
import { ALT_KEYS, type AltKey, type Question } from '../../content/types';
import { createRng, hashString, shuffle } from '../util/random';

/** Letras canônicas na ordem em que serão exibidas (posição 0 = "A" na tela). */
export function alternativeOrder(question: Pick<Question, 'id' | 'fixedOrder'>, attemptKey: string): AltKey[] {
  if (question.fixedOrder) return ALT_KEYS.slice();
  return shuffle(ALT_KEYS, createRng(hashString(`${attemptKey}|${question.id}`)));
}

/** Letra mostrada na tela para uma alternativa canônica. */
export function displayLetter(order: readonly AltKey[], canonical: AltKey): AltKey {
  const i = order.indexOf(canonical);
  return ALT_KEYS[i < 0 ? ALT_KEYS.indexOf(canonical) : i];
}
