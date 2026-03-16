import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../core/models/vehicle.models';
import { VehicleQuestionsComponent } from '../vehicle-questions/vehicle-questions.component';

/**
 * Component for displaying full vehicle detail with share URL and Q&A section.
 */
@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, VehicleQuestionsComponent],
  templateUrl: './vehicle-detail.component.html'
})
export class VehicleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private vehicleService = inject(VehicleService);

  vehicle: Vehicle | null = null;
  loading = true;
  urlCopied = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.vehicleService.getById(id).subscribe({
      next: (v) => {
        this.vehicle = v;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /** Copies the current page URL to clipboard for sharing. */
  copyUrl(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.urlCopied = true;
      setTimeout(() => this.urlCopied = false, 2000);
    });
  }
}