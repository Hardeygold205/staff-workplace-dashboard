import { Injectable, computed, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, catchError, tap, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  ChangePasswordPayload,
  JwtPayload,
  LoginPayload,
  LoginResponse,
} from "../models/auth.model";

const ACCESS_TOKEN_KEY = environment.ACCESS_TOKEN_KEY;
const REFRESH_TOKEN_KEY = environment.REFRESH_TOKEN_KEY;

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private payloadSignal = signal<JwtPayload | null>(this.decodeStoredToken());

  readonly isAuthenticated = computed(
    () => !!this.payloadSignal() && !this.isExpired(),
  );
  readonly roles = computed(() => this.payloadSignal()?.roles ?? []);
  readonly permissions = computed(
    () => this.payloadSignal()?.permissions ?? [],
  );
  readonly userId = computed(() => this.payloadSignal()?.sub ?? null);

  hasPermission(key: string): boolean {
    return this.permissions().includes(key);
  }

  hasAnyPermission(keys: string[]): boolean {
    return keys.some((k) => this.hasPermission(k));
  }

  hasRole(name: string): boolean {
    return this.roles().includes(name);
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((res) => this.setTokens(res.accessToken, res.refreshToken)));
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/auth/change-password`,
      payload,
    );
  }

  refresh(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error("No refresh token"));

    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((res) => this.setTokens(res.accessToken, res.refreshToken)),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        }),
      );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http
        .post(`${environment.apiUrl}/auth/logout`, { refreshToken })
        .subscribe({
          next: () => {},
          error: () => {},
        });
    }
    this.clearSession();
    this.router.navigate(["/login"]);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.payloadSignal.set(decodeJwtPayload(accessToken));
  }

  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.payloadSignal.set(null);
  }

  private decodeStoredToken(): JwtPayload | null {
    const token = this.getAccessToken();
    return token ? decodeJwtPayload(token) : null;
  }

  private isExpired(): boolean {
    const payload = this.payloadSignal();
    if (!payload) return true;
    return Date.now() >= payload.exp * 1000;
  }
}
