import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, AuthUser, UserRole } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly url = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'authToken';
  private readonly userKey = 'authUser';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, { email, password }).pipe(
      tap((response) => this.store(response))
    );
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, { email, password }).pipe(
      tap((response) => this.store(response))
    );
  }

  revokeToken(): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, {});
  }

  token(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  user(): AuthUser | null {
    const raw = sessionStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    const user = this.user();
    return !!this.token() && !!user && new Date(user.expiresAt).getTime() > Date.now();
  }

  hasRole(role: UserRole): boolean {
    return this.isAuthenticated() && this.user()?.role === role;
  }

  logout(): void {
    this.clearSession();
  }

  clearSession(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }

  private store(response: AuthResponse): void {
    const { token, ...user } = response;
    sessionStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }
}
