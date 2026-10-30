import { appAlert } from './dialog/dialog';
import { router } from 'expo-router';
import { useState } from 'react';


/** Inicia uma atividade e navega; evita toques duplos e mostra erros amigáveis. */
export function useStarter() {
  const [busy, setBusy] = useState<string | null>(null);
  const start = async (
    key: string,
    fn: () => Promise<unknown>,
    opts: { to?: '/session' | '/boss'; replace?: boolean } = {},
  ) => {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
      const to = opts.to ?? '/session';
      if (opts.replace) router.replace(to);
      else router.push(to);
    } catch (e) {
      appAlert('Não deu para começar', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };
  return { busy, start };
}
