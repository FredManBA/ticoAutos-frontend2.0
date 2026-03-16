import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://localhost:7268/api/auth';
  private readonly TOKEN_KEY = 'ticoautos_token';

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
      })
    );
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
}