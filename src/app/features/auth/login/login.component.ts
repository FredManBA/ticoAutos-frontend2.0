import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service'; 
import { Router } from '@angular/router';
import { AuthResponse } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'  
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage: string = '';

  onSubmit(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email!;
      const password = this.loginForm.value.password!;

      this.authService.login({ email, password }).subscribe({
        next: (response: AuthResponse) => {
          console.log('Login exitoso');
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          this.errorMessage = 'Credenciales inválidas o error de conexión';
        }
      });
    }
  }
}