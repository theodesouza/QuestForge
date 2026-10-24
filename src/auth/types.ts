/**
 * Contrato de autenticação. A tela de login e o boot só conhecem esta interface; o Google/Firebase
 * (`googleAuth.ts`) e a pré-visualização web (`createAuthService.web.ts`) são implementações.
 */
export interface AuthUser {
  /** Identificador estável do Firebase Auth — é ele que nomeia o banco local e o caminho na nuvem. */
  uid: string;
  displayName: string | null;
  email: string | null;
}

export type AuthErrorCode =
  | 'cancelled' // a pessoa fechou a janela de contas
  | 'offline' // sem internet
  | 'play-services' // Google Play Services ausente/desatualizado
  | 'no-account' // nenhuma conta Google no aparelho
  | 'in-progress' // já existe um login em andamento
  | 'config' // projeto Firebase/cliente OAuth mal configurado
  | 'unauthenticated' // sessão expirada/revogada
  | 'requires-recent-login' // operação sensível: entrar de novo antes
  | 'account-mismatch' // entrou com outra conta Google na hora de confirmar
  | 'unavailable' // login indisponível nesta plataforma/build
  | 'unknown';

export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Mensagens para a interface (português, sem jargão e sem culpar a pessoa). */
export const AUTH_MESSAGES: Record<AuthErrorCode, string> = {
  cancelled: 'Login cancelado. Quando quiser, é só tentar de novo.',
  offline: 'Sem conexão com a internet. Conecte-se e tente de novo.',
  'play-services': 'O Google Play Services precisa estar instalado e atualizado neste aparelho.',
  'no-account': 'Nenhuma conta Google foi encontrada neste aparelho. Adicione uma em Configurações e tente de novo.',
  'in-progress': 'Já há um login em andamento. Aguarde um instante.',
  config: 'O login com Google ainda não está configurado nesta versão do app.',
  unauthenticated: 'Sua sessão expirou. Entre com o Google novamente.',
  'requires-recent-login': 'Por segurança, entre com o Google novamente para continuar.',
  'account-mismatch': 'Use a mesma conta Google que está em uso neste app para confirmar.',
  unavailable: 'O login com Google não está disponível nesta plataforma.',
  unknown: 'Não foi possível entrar agora. Tente de novo em instantes.',
};

export interface AuthService {
  /** Sessão salva neste aparelho, sem depender da rede. null = ninguém logado. */
  restore(): Promise<AuthUser | null>;
  signInWithGoogle(): Promise<AuthUser>;
  /** Encerra a sessão (Firebase + conta Google do app). O progresso local da conta é mantido. */
  signOut(): Promise<void>;
  /** Pede ao Google uma credencial recente (exigida para excluir a conta). */
  reauthenticate(): Promise<void>;
  /** Exclui a conta de autenticação (os dados da nuvem devem ter sido apagados antes). */
  deleteAccount(): Promise<void>;
  /** Avisa quando o Firebase invalida a sessão (ex.: conta removida/desativada). */
  onSessionLost(listener: () => void): () => void;
}
