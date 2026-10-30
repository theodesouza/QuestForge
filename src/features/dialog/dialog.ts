/**
 * Diálogos do app: substituem o `Alert` do sistema (mesma assinatura do `Alert.alert`) para que
 * confirmações, erros e avisos tenham a cara do QuestForge. Quem desenha é o `DialogHost`.
 */
import { create } from 'zustand';

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
}

export interface DialogRequest {
  id: number;
  title: string;
  message?: string;
  buttons: DialogButton[];
}

interface DialogStore {
  queue: DialogRequest[];
}

export const useDialogStore = create<DialogStore>(() => ({ queue: [] }));

let seq = 0;

/** Abre um diálogo (os próximos esperam na fila). Sem botões, mostra só "Entendi". */
export function appAlert(title: string, message?: string, buttons?: DialogButton[]): void {
  const request: DialogRequest = {
    id: ++seq,
    title,
    message,
    buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'Entendi' }],
  };
  useDialogStore.setState((s) => ({ queue: [...s.queue, request] }));
}

/** Fecha o diálogo da frente e roda a ação do botão escolhido. */
export function closeDialog(id: number, button?: DialogButton): void {
  useDialogStore.setState((s) => ({ queue: s.queue.filter((d) => d.id !== id) }));
  if (button?.onPress) void Promise.resolve(button.onPress()).catch(() => undefined);
}
