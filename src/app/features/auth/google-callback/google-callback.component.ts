import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

function cedulaValidatedValidator(component: GoogleCallbackComponent) {
  return (_control: AbstractControl): ValidationErrors | null =>
    component.cedulaValidated ? null : { cedulaNotValidated: true };
}

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './google-callback.component.html'
})
export class GoogleCallbackComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  status = this.route.snapshot.queryParamMap.get('status') ?? '';
  registrationToken = this.route.snapshot.queryParamMap.get('registrationToken') ?? '';
  email = this.route.snapshot.queryParamMap.get('email') ?? '';
  googleFullName = this.route.snapshot.queryParamMap.get('fullName') ?? '';
  message = '';
  loading = false;
  cedulaLookupLoading = false;
  cedulaLookupMessage = '';
  validatedFullName = '';
  cedulaValidated = false;

  completeForm = this.fb.group({
    cedula: ['', [Validators.required, Validators.pattern(/^\d{9}$/), cedulaValidatedValidator(this)]]
  });

  constructor() {
    if (this.status === 'success') {
      const token = this.route.snapshot.queryParamMap.get('token');

      if (token) {
        this.authService.storeToken(token);
        this.router.navigate(['/vehicles']);
        return;
      }

      this.status = 'error';
      this.message = 'Google no devolvió un token válido.';
    }

    if (this.status === 'error') {
      this.message = this.route.snapshot.queryParamMap.get('message') || 'No fue posible iniciar sesión con Google.';
    }

    if (this.status === 'requires_cedula' && !this.registrationToken) {
      this.status = 'error';
      this.message = 'Token de registro de Google requerido.';
    }

    this.completeForm.get('cedula')?.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((cedula) => {
        this.validatedFullName = '';
        this.cedulaValidated = false;
        this.cedulaLookupMessage = '';
        this.completeForm.get('cedula')?.updateValueAndValidity({ emitEvent: false });

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
      this.completeForm.get('cedula')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  completeRegistration(): void {
    if (this.completeForm.invalid || !this.cedulaValidated) {
      this.completeForm.markAllAsTouched();
      this.message = this.cedulaLookupMessage || 'Debe validar una cedula existente antes de continuar.';
      return;
    }

    this.loading = true;
    this.message = '';

    const cedula = this.completeForm.value.cedula!;
    this.authService.completeGoogleRegistration({
      registrationToken: this.registrationToken,
      cedula
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/vehicles']);
      },
      error: (err) => {
        this.message = err.error?.message || 'No fue posible completar el registro con Google.';
        this.loading = false;
      }
    });
  }
}
