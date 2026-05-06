import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSession, RegisterPayload } from './models';

const SESSION_KEY = 'talentmanager.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionState = signal<AuthSession | null>(this.readSession());

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.sessionState()?.token));

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  signIn(username: string, password: string) {
    return this.http.post<AuthSession>(`${environment.apiBaseUrl}/auth/sign-in`, { username, password })
      .pipe(tap(session => this.storeSession(session)));
  }

  register(payload: RegisterPayload) {
    return this.http.post(`${environment.apiBaseUrl}/auth/register-with-manager`, payload);
  }

  signOut() {
    localStorage.removeItem(SESSION_KEY);
    this.sessionState.set(null);
    this.router.navigate(['/login']);
  }

  token(): string | null {
    return this.sessionState()?.token ?? null;
  }

  companyId(): number | null {
    return this.sessionState()?.companyId ?? null;
  }

  private storeSession(session: AuthSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionState.set(session);
  }

  private readSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
