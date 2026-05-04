import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  CedulaLookupResponse,
  CompleteGoogleRegistrationRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  RegistrationResponse,
  VerifyTwoFactorRequest
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5105/api/auth';
  private readonly TOKEN_KEY = 'ticoautos_token';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (!response.requiresTwoFactor && response.token) {
          this.storeToken(response.token);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.API_URL}/register`, data);
  }

  lookupCedula(cedula: string): Observable<CedulaLookupResponse> {
    return this.http.get<CedulaLookupResponse>(`${this.API_URL}/cedula/${cedula}`);
  }

  verifyEmail(token: string): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(`${this.API_URL}/verify-email`, {
      params: { token }
    });
  }

  resendVerification(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/resend-verification`, { email });
  }

  verifyTwoFactor(data: VerifyTwoFactorRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/verify-2fa`, data).pipe(
      tap(response => this.storeToken(response.token))
    );
  }

  getGoogleSignInUrl(): string {
    return `${this.API_URL}/google`;
  }

  completeGoogleRegistration(data: CompleteGoogleRegistrationRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/google/complete-registration`, data).pipe(
      tap(response => this.storeToken(response.token))
    );
  }

  storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }
}
