import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  errorMessage = '';
  infoMessage = '';
  resendMessage = '';
  twoFactorMessage = '';
  temporaryToken = '';
  twoFactorEmail = '';
  requiresTwoFactor = false;
  loading = false;
  resendLoading = false;
  verifyingCode = false;
  showPassword = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  twoFactorForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  constructor() {
    const registered = this.route.snapshot.queryParamMap.get('registered');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (registered === '1') {
      this.infoMessage = 'Cuenta registrada. Revise su correo para activar la cuenta.';

      if (email) {
        this.loginForm.patchValue({ email });
      }
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  signInWithGoogle(): void {
    window.location.href = this.authService.getGoogleSignInUrl();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.resendMessage = '';
    this.twoFactorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.requiresTwoFactor) {
          this.requiresTwoFactor = true;
          this.temporaryToken = response.temporaryToken ?? '';
          this.twoFactorEmail = response.email;
          this.twoFactorMessage = response.message || 'Código de verificación enviado.';
          this.twoFactorForm.reset();
          return;
        }

        this.router.navigate(['/vehicles']);
      },
      error: (err) => {
        if (err.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor.';
        } else {
          this.errorMessage = err.error?.message || 'Correo o contraseña incorrectos.';
        }
        this.loading = false;
      }
    });
  }

  verifyTwoFactor(): void {
    if (this.twoFactorForm.invalid || !this.temporaryToken) {
      this.twoFactorForm.markAllAsTouched();
      return;
    }

    this.verifyingCode = true;
    this.errorMessage = '';

    this.authService.verifyTwoFactor({
      temporaryToken: this.temporaryToken,
      code: this.twoFactorForm.value.code!
    }).subscribe({
      next: () => {
        this.verifyingCode = false;
        this.router.navigate(['/vehicles']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'El código de verificación no es válido o expiró.';
        this.verifyingCode = false;
      }
    });
  }

  requestNewCode(): void {
    this.twoFactorForm.reset();
    this.onSubmit();
  }

  backToLogin(): void {
    this.requiresTwoFactor = false;
    this.temporaryToken = '';
    this.twoFactorEmail = '';
    this.twoFactorMessage = '';
    this.errorMessage = '';
    this.twoFactorForm.reset();
  }

  resendVerification(): void {
    const email = this.loginForm.get('email')?.value;

    if (!email || this.loginForm.get('email')?.invalid) {
      this.loginForm.get('email')?.markAsTouched();
      this.resendMessage = 'Ingrese un correo válido.';
      return;
    }

    this.resendLoading = true;
    this.resendMessage = '';

    this.authService.resendVerification(email).subscribe({
      next: (response) => {
        this.resendMessage = response.message;
        this.resendLoading = false;
      },
      error: (err) => {
        this.resendMessage = err.error?.message || 'No fue posible reenviar el correo.';
        this.resendLoading = false;
      }
    });
  }
}
