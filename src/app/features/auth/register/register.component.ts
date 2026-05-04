import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  errorMessage = '';
  successMessage = '';
  cedulaLookupMessage = '';
  validatedFullName = '';
  cedulaLookupLoading = false;
  cedulaValidated = false;
  loading = false;
  showPassword = false;
  showConfirm = false;

  registerForm = this.fb.group({
    cedula: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+506\d{8}$/)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
      ]
    ],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  constructor() {
    this.registerForm.get('cedula')?.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((cedula) => {
        this.validatedFullName = '';
        this.cedulaValidated = false;
        this.cedulaLookupMessage = '';

        const value = cedula ?? '';
        if (!/^\d{9}$/.test(value)) {
          this.cedulaLookupLoading = false;
          return EMPTY;
        }

        this.cedulaLookupLoading = true;
        return this.authService.lookupCedula(value).pipe(
          catchError((err) => {
            this.cedulaLookupMessage =
              err.error?.message || 'No fue posible validar la cedula en este momento.';
            return EMPTY;
          }),
          finalize(() => {
            this.cedulaLookupLoading = false;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((response) => {
      this.validatedFullName = response.fullName;
      this.cedulaValidated = true;
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm(): void {
    this.showConfirm = !this.showConfirm;
  }

  signInWithGoogle(): void {
    window.location.href = this.authService.getGoogleSignInUrl();
  }

  get passwordMismatch(): boolean {
    return !!(this.registerForm.errors?.['passwordMismatch'] &&
      this.registerForm.get('confirmPassword')?.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.cedulaValidated) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = this.cedulaLookupMessage || 'Debe validar una cedula existente antes de registrarse.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { cedula, email, phoneNumber, password } = this.registerForm.value;

    this.authService.register({
      cedula: cedula!,
      email: email!,
      phoneNumber: phoneNumber!,
      password: password!
    }).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Usuario registrado correctamente.';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { registered: '1', email: response.email }
          });
        }, 1500);
      },
      error: (err) => {
        if (err.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor.';
        } else {
          this.errorMessage = err.error?.message || 'Error al registrarse.';
        }
        this.loading = false;
      }
    });
  }
}
