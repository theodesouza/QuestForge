/** Pré-visualização web: sem arquivos nem compartilhamento. */
export interface SavedFile {
  uri: string;
  readBack: string;
}

export async function saveTextFile(_name: string, text: string): Promise<SavedFile> {
  return { uri: '', readBack: text };
}

export async function shareFile(): Promise<boolean> {
  return false;
}
