/**
 * O bundle React Native do Firebase Auth exporta `getReactNativePersistence`, mas as definições de
 * tipo que o TypeScript escolhe para `firebase/auth` são as da web (que não o declaram). Isto só
 * declara o que o Metro realmente entrega em tempo de execução (`@firebase/auth/dist/rn`).
 */
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
