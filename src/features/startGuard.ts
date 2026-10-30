/**
 * Antes de começar uma atividade nova, olha o que já está em andamento:
 *  - a MESMA atividade pausada (mesma missão, ou expedição de mesma duração) é retomada, em vez de criar outra;
 *  - outra atividade em andamento: pergunta se a pessoa quer terminar a atual antes (ou descartá-la);
 *  - batalha em andamento: oferece voltar a ela.
 * Tudo o que já foi respondido continua gravado: descartar só fecha a sessão aberta.
 */
import { router } from 'expo-router';
import { findNode } from '../content/regions';
import { getBoss } from '../content/bosses';
import type { ActiveSession } from '../domain/game/types';
import { abandon } from '../state/actions';
import { useGameStore } from '../state/store';
import { appAlert } from './dialog/dialog';

/** O que a atividade a ser iniciada "é", para reconhecer que já está aberta. */
export interface StartIdentity {
  mode: ActiveSession['mode'];
  nodeId: string | null;
  minutes: number | null;
}

export type StartVerdict = 'start' | 'resumed' | 'cancel';

export function sameActivity(session: ActiveSession, id: StartIdentity | undefined): boolean {
  return !!id && session.mode === id.mode && session.nodeId === id.nodeId && session.minutes === id.minutes;
}

/** Nome curto da sessão em andamento, para a pergunta. */
export function sessionLabel(session: ActiveSession): string {
  if (session.mode === 'mission') {
    const found = session.nodeId ? findNode(session.nodeId) : null;
    return found ? `a missão "${found.node.title}"` : 'uma missão';
  }
  return session.minutes ? `a expedição de ${session.minutes} min` : 'o treino';
}

function progressOf(session: ActiveSession): string {
  const done = session.answers.filter((a) => a.kind !== 'skipped').length;
  return `${done} de ${session.queue.length} questões respondidas`;
}

const goSession = (replace?: boolean) => (replace ? router.replace('/session') : router.push('/session'));

/** Decide se a atividade nova pode começar. Resolve 'start' só quando o caminho está livre. */
export function guardStart(identity?: StartIdentity, replace?: boolean): Promise<StartVerdict> {
  const game = useGameStore.getState().game;
  const battle = game?.battle && game.battle.status === 'active' ? game.battle : null;
  const session = game?.session ?? null;

  return new Promise<StartVerdict>((resolve) => {
    if (battle) {
      appAlert('Batalha em andamento', `Você está no meio da luta contra ${getBoss(battle.bossId).name}. Volte a ela ou recue antes de começar outra atividade.`, [
        {
          text: 'Voltar à batalha',
          onPress: () => {
            router.push(`/boss?id=${battle.bossId}`);
            resolve('resumed');
          },
        },
        { text: 'Agora não', style: 'cancel', onPress: () => resolve('cancel') },
      ]);
      return;
    }
    if (!session) {
      resolve('start');
      return;
    }
    if (sameActivity(session, identity)) {
      goSession(replace);
      resolve('resumed');
      return;
    }
    appAlert('Você já tem uma atividade aberta', `Está em andamento ${sessionLabel(session)} (${progressOf(session)}). Quer terminá-la antes de começar outra?`, [
      {
        text: 'Terminar a atual',
        onPress: () => {
          goSession(replace);
          resolve('resumed');
        },
      },
      {
        text: 'Descartar e começar a nova',
        style: 'destructive',
        onPress: async () => {
          await abandon();
          resolve('start');
        },
      },
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve('cancel') },
    ]);
  });
}

/** Antes de uma batalha: uma sessão aberta precisa ser terminada ou descartada (o jogo não permite as duas). */
export function guardBattle(): Promise<StartVerdict> {
  const session = useGameStore.getState().game?.session ?? null;
  return new Promise<StartVerdict>((resolve) => {
    if (!session) {
      resolve('start');
      return;
    }
    appAlert('Termine a atividade antes da batalha', `Está em andamento ${sessionLabel(session)} (${progressOf(session)}). Quer terminá-la antes de lutar?`, [
      {
        text: 'Terminar a atual',
        onPress: () => {
          router.push('/session');
          resolve('resumed');
        },
      },
      {
        text: 'Descartar e lutar',
        style: 'destructive',
        onPress: async () => {
          await abandon();
          resolve('start');
        },
      },
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve('cancel') },
    ]);
  });
}
