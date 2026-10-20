/** Textos para a interface (português claro, sem jargão e sem culpar a pessoa). */
import type { SyncErrorCode, SyncNotice, SyncStatus } from './types';

export const SYNC_ERROR_MESSAGES: Record<SyncErrorCode, string> = {
  offline: 'Sem conexão. Seu progresso está salvo neste aparelho e será enviado quando a internet voltar.',
  timeout: 'A nuvem demorou a responder. Vamos tentar de novo em instantes.',
  quota: 'O serviço de nuvem está sobrecarregado agora. Vamos tentar de novo mais tarde.',
  unauthenticated: 'Sua sessão expirou. Saia e entre com o Google novamente para sincronizar.',
  permission: 'A nuvem recusou a gravação para esta conta. Seu progresso continua salvo neste aparelho.',
  'needs-update': 'Há dados de uma versão mais nova do QuestForge na sua conta. Atualize o app para sincronizar.',
  'corrupt-remote': 'O salvamento na nuvem não passou na verificação de integridade. Nada foi alterado; fale com o suporte.',
  integrity: 'Por segurança, o envio foi barrado: ele faria o progresso regredir. Nada foi alterado.',
  'remote-missing': 'O salvamento da sua conta não foi encontrado na nuvem. Nada foi sobrescrito.',
  'wrong-account': 'Este banco de dados pertence a outra conta Google.',
  unknown: 'Não foi possível sincronizar agora. Vamos tentar de novo.',
};

/** Mensagens da tela "buscando seu progresso" (primeiro acesso da conta neste aparelho): o assunto é BAIXAR, não enviar. */
export const RESTORE_ERROR_MESSAGES: Partial<Record<SyncErrorCode, string>> = {
  offline: 'Sem conexão com a internet. Conecte-se para carregar o progresso da sua conta.',
  timeout: 'A nuvem demorou a responder. Verifique a conexão e tente de novo.',
  quota: 'O serviço de nuvem está sobrecarregado agora. Tente de novo em alguns minutos.',
};

export function syncHeadline(s: SyncStatus | null, cloudEnabled: boolean): string {
  if (!cloudEnabled) return 'Sem nuvem neste ambiente.';
  if (!s) return 'Verificando…';
  if (s.phase === 'syncing') return 'Sincronizando…';
  if (s.phase === 'blocked') return 'Sincronização pausada';
  if (s.phase === 'offline') return s.pendingChanges ? 'Aguardando conexão' : 'Sem conexão';
  if (s.phase === 'error') return 'Nova tentativa em instantes';
  if (s.pendingChanges) return 'Alterações a enviar';
  return s.lastSyncedAt ? `Sincronizado ${relativeTime(s.lastSyncedAt)}` : 'Sincronizado';
}

export function relativeTime(at: number, now = Date.now()): string {
  const min = Math.round((now - at) / 60_000);
  if (min < 1) return 'agora há pouco';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} d`;
}

export function noticeText(n: SyncNotice): string {
  switch (n.kind) {
    case 'merged':
      return n.duplicateGrants > 0
        ? `Combinamos o progresso de dois aparelhos. ${n.duplicateGrants} recompensa(s) única(s) recebida(s) nos dois foram contadas só uma vez.`
        : 'Combinamos o progresso de dois aparelhos. Nada foi perdido.';
    case 'reset-adopted':
      return 'O progresso desta conta foi reiniciado em outro aparelho, e este aparelho acompanhou. Uma cópia do que havia aqui foi guardada.';
    case 'restored':
      return `Progresso restaurado da nuvem: nível ${n.stats.level}, ${n.stats.xp} XP, ${n.stats.nodes} missão(ões) concluída(s).`;
  }
}
