/** Android/iOS: SQLite por conta + Firebase (Auth Google e Firestore). */
import { deleteDatabaseAsync } from 'expo-sqlite';
import { createGoogleAuthService } from '../auth/googleAuth';
import { firebase } from '../auth/firebase';
import { FirestoreCloudStore } from '../data/cloud/firestoreCloudStore';
import { SqlGameRepository } from '../data/repository/SqlGameRepository';
import { openExpoDriver } from '../data/sql/expoDriver';
import type { SqlDriver } from '../data/sql/driver';
import { accountDatabaseName, type Platform } from './types';

export function createPlatform(): Platform {
  const open = new Map<string, SqlDriver>();
  let cloud: FirestoreCloudStore | null = null;
  return {
    preview: false,
    auth: createGoogleAuthService(),
    cloud: () => (cloud ??= new FirestoreCloudStore(firebase().db)),
    async openRepository(uid) {
      const name = accountDatabaseName(uid);
      const driver = open.get(name) ?? (await openExpoDriver(name));
      open.set(name, driver);
      return new SqlGameRepository(driver);
    },
    async deleteLocalData(uid) {
      const name = accountDatabaseName(uid);
      await open.get(name)?.close?.();
      open.delete(name);
      await deleteDatabaseAsync(name);
    },
  };
}
