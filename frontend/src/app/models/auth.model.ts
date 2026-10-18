export type UserRole = 'ADMIN' | 'CLIENT';

export interface AuthUser {
  email: string;
  role: UserRole;
  clientId: string | null;
  expiresAt: string;
}

export interface AuthResponse extends AuthUser {
  token: string;
}
