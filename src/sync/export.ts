/**
 * Arquivo de exportação do progresso (portabilidade de dados — LGPD — e backup verificável da
 * migração única). É JSON legível, com um checksum do conteúdo: `parseExport` recusa um arquivo
 * alterado ou truncado.
 */
import type { Attempt, GameState } from '../domain/game/types';
import { hashText, statsOf, stableStringify, toSyncState, type SyncStats } from './snapshot';

export const EXPORT_FORMAT = 'questforge-export';

export interface ExportFile {
  format: typeof EXPORT_FORMAT;
  version: 1;
  exportedAt: string;
  appVersion: string;
  account: { uid: string; email: string | null } | null;
  /** Resumo para conferência humana (antes/depois). */
  summary: SyncStats & { attempts: number };
  /** Todo o estado local, inclusive sessão/batalha em andamento. */
  state: GameState;
  attempts: Attempt[];
  /** Hash de `state` + `attempts`. */
  checksum: string;
}

const checksumOf = (state: GameState, attempts: Attempt[]) => hashText(stableStringify({ state, attempts }));

export function buildExport(input: {
  state: GameState;
  attempts: Attempt[];
  account: ExportFile['account'];
  appVersion: string;
  now: number;
}): { file: ExportFile; text: string } {
  const file: ExportFile = {
    format: EXPORT_FORMAT,
    version: 1,
    exportedAt: new Date(input.now).toISOString(),
    appVersion: input.appVersion,
    account: input.account,
    summary: { ...statsOf(toSyncState(input.state)), attempts: input.attempts.length },
    state: input.state,
    attempts: input.attempts,
    checksum: checksumOf(input.state, input.attempts),
  };
  return { file, text: JSON.stringify(file, null, 2) };
}

/** Lê e valida um arquivo exportado; lança se o conteúdo não bate com o checksum. */
export function parseExport(text: string): ExportFile {
  const file = JSON.parse(text) as ExportFile;
  if (file.format !== EXPORT_FORMAT || file.version !== 1) throw new Error('Arquivo não é uma exportação do QuestForge.');
  if (checksumOf(file.state, file.attempts) !== file.checksum) throw new Error('Arquivo de exportação alterado ou incompleto (checksum não confere).');
  // O resumo é só para leitura humana, mas precisa ser fiel ao conteúdo.
  const expected = { ...statsOf(toSyncState(file.state)), attempts: file.attempts.length };
  if (stableStringify(file.summary) !== stableStringify(expected)) throw new Error('Arquivo de exportação com resumo que não confere com o conteúdo.');
  return file;
}
