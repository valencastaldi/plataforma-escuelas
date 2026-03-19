import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

export type UserRole = 'DOCENTE' | 'ALUMNO';

export type AuthUser = {
  id: number;
  email?: string | null;
  username?: string | null;
  role: UserRole;
};

type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiBase = 'http://localhost:3000';
  private readonly tokenKey = 'escuelas_token';
  private readonly user$ = new BehaviorSubject<AuthUser | null>(null);

  constructor(private readonly http: HttpClient) {}

  get currentUser$(): Observable<AuthUser | null> {
    return this.user$.asObservable();
  }

  get currentUser(): AuthUser | null {
    return this.user$.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  login(identifier: string, password: string): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.apiBase}/auth/login`, { identifier, password }).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.accessToken);
        this.user$.next(res.user);
      }),
      map((res) => res.user),
    );
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiBase}/auth/me`).pipe(
      tap((user) => this.user$.next(user)),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.user$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
