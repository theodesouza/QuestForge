/**
 * Armazenamento da sessão do Firebase Auth no cofre do sistema (Android Keystore, via expo-secure-store),
 * em vez do AsyncStorage em texto puro. Segue o formato `getItem/setItem/removeItem` que o Firebase espera.
 *
 *  - As chaves do Firebase têm `:` e `[`, que o SecureStore não aceita: a chave real vira um hash.
 *  - Valores grandes são divididos em pedaços; o contador é gravado POR ÚLTIMO, então uma escrita
 *    interrompida nunca produz uma leitura parcial (sem contador válido, lê-se "vazio" e o app pede login).
 *  - No Android o SecureStore não sobrevive à desinstalação: reinstalar sempre exige entrar de novo.
 */
import * as SecureStore from 'expo-secure-store';
import { hashText } from '../sync/snapshot';

const CHUNK = 1800;

const base = (key: string) => `qf_auth_${hashText(key)}`;

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const secureAuthStorage: KeyValueStorage = {
  async getItem(key) {
    const name = base(key);
    const count = Number(await SecureStore.getItemAsync(`${name}_n`));
    if (!Number.isInteger(count) || count <= 0) return null;
    let out = '';
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${name}_${i}`);
      if (part === null) return null; // pedaço faltando: trata como ausente
      out += part;
    }
    return out;
  },

  async setItem(key, value) {
    const name = base(key);
    const previous = Number(await SecureStore.getItemAsync(`${name}_n`)) || 0;
    const parts: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK) parts.push(value.slice(i, i + CHUNK));
    if (parts.length === 0) parts.push('');
    for (let i = 0; i < parts.length; i++) await SecureStore.setItemAsync(`${name}_${i}`, parts[i]);
    await SecureStore.setItemAsync(`${name}_n`, String(parts.length));
    for (let i = parts.length; i < previous; i++) await SecureStore.deleteItemAsync(`${name}_${i}`);
  },

  async removeItem(key) {
    const name = base(key);
    const count = Number(await SecureStore.getItemAsync(`${name}_n`)) || 0;
    await SecureStore.deleteItemAsync(`${name}_n`);
    for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(`${name}_${i}`);
  },
};
