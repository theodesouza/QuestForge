/** Grava um arquivo de texto e abre o menu de compartilhar do sistema (salvar no Drive, e-mail, etc.). */
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface SavedFile {
  uri: string;
  /** Texto relido do arquivo gravado (para conferência de integridade). */
  readBack: string;
}

export async function saveTextFile(name: string, text: string): Promise<SavedFile> {
  const file = new File(Paths.document, name);
  if (file.exists) file.delete();
  file.create();
  file.write(text);
  return { uri: file.uri, readBack: await file.text() };
}

export async function shareFile(uri: string, dialogTitle: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle });
  return true;
}
