import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';

/**
 * Component for editing an existing vehicle listing.
 * Pre-fills the form with current vehicle data.
 */
@Component({
  selector: 'app-edit-vehicle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-vehicle.component.html'
})
export class EditVehicleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  loadingData = true;
  errorMessage = '';
  vehicleId!: number;

  vehicleForm = this.fb.group({
    brand: ['', [Validators.required, Validators.maxLength(50)]],
    model: ['', [Validators.required, Validators.maxLength(50)]],
    year: [null as number | null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    price: [null as number | null, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.maxLength(500)]],
    imageUrl: [''],
    isSold: [false]
  });

  /**
   * Loads vehicle data and pre-fills the form on initialization.
   */
  ngOnInit(): void {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.vehicleService.getById(this.vehicleId).subscribe({
      next: (vehicle) => {
        this.vehicleForm.patchValue({
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
          description: vehicle.description,
          imageUrl: vehicle.imageUrl,
          isSold: vehicle.isSold
        });
        this.loadingData = false;
      },
      error: () => { this.loadingData = false; }
    });
  }

  /**
   * Submits the updated vehicle data to the API.
   */
  onSubmit(): void {
    if (this.vehicleForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const data = { id: this.vehicleId, ...this.vehicleForm.value };

    this.vehicleService.update(this.vehicleId, data).subscribe({
      next: () => this.router.navigate(['/my-vehicles']),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al actualizar.';
        this.loading = false;
      }
    });
  }
}