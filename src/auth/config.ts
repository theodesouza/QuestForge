/**
 * Configuração do Firebase e do login Google, lida de variáveis de ambiente EXPO_PUBLIC_*.
 * Nada aqui é segredo: são identificadores públicos do projeto (a segurança vem das regras do
 * Firestore e da verificação do token no servidor). Os valores reais ficam em `.env` (fora do git)
 * e, nas builds na nuvem, em variáveis de ambiente da EAS — ver docs/CLOUD_SETUP.md.
 *
 * Atenção: o Metro só troca `process.env.EXPO_PUBLIC_X` quando a referência é LITERAL; não use
 * desestruturação nem acesso dinâmico aqui.
 */
export interface CloudConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId: string;
  };
  /** ID do cliente OAuth do tipo "Web" do projeto — o Credential Manager o usa para emitir o idToken. */
  googleWebClientId: string;
}

/** Variáveis ausentes, para uma mensagem de erro precisa em vez de falhar no meio do login. */
export function missingConfig(): string[] {
  const required: [string, string | undefined][] = [
    ['EXPO_PUBLIC_FIREBASE_API_KEY', process.env.EXPO_PUBLIC_FIREBASE_API_KEY],
    ['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN],
    ['EXPO_PUBLIC_FIREBASE_PROJECT_ID', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID],
    ['EXPO_PUBLIC_FIREBASE_APP_ID', process.env.EXPO_PUBLIC_FIREBASE_APP_ID],
    ['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID],
  ];
  return required.filter(([, v]) => !v).map(([k]) => k);
}

export function cloudConfig(): CloudConfig | null {
  if (missingConfig().length > 0) return null;
  return {
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
    },
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string,
  };
}
