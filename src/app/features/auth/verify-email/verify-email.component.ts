import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  loading = true;
  success = false;
  message = 'Verificando cuenta...';

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading = false;
      this.message = 'Token de verificacion requerido.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.success = true;
        this.message = response.message || 'Cuenta verificada correctamente.';
        this.loading = false;
      },
      error: (err) => {
        this.success = false;
        this.message = err.error?.message || 'No fue posible verificar la cuenta.';
        this.loading = false;
      }
    });
  }
}
