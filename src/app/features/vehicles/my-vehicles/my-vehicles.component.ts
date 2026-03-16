import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../core/models/vehicle.models';

/**
 * Component for displaying and managing the authenticated user's vehicle listings.
 */
@Component({
  selector: 'app-my-vehicles',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-vehicles.component.html'
})
export class MyVehiclesComponent implements OnInit {
  private vehicleService = inject(VehicleService);

  vehicles: Vehicle[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadVehicles();
  }

  /** Loads the current user's vehicles from the API. */
  loadVehicles(): void {
    this.loading = true;
    this.vehicleService.getMyVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /** Deletes a vehicle after user confirmation. */
  onDelete(id: number): void {
    if (!confirm('¿Estás seguro de que querés eliminar este vehículo?')) return;
    this.vehicleService.delete(id).subscribe({
      next: () => this.loadVehicles()
    });
  }

  /** Marks a vehicle as sold. */
  onMarkAsSold(id: number): void {
    if (!confirm('¿Marcar este vehículo como vendido?')) return;
    this.vehicleService.markAsSold(id).subscribe({
      next: () => this.loadVehicles()
    });
  }
}