import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle, VehicleFilter, PagedResult } from '../../../core/models/vehicle.models';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vehicle-list.component.html'
})
export class VehicleListComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private fb = inject(FormBuilder);

  vehicles: Vehicle[] = [];
  totalPages = 0;
  totalCount = 0;
  currentPage = 1;
  pageSize = 9;
  loading = false;

  filterForm = this.fb.group({
    brand: [''],
    model: [''],
    minYear: [null],
    maxYear: [null],
    minPrice: [null],
    maxPrice: [null],
    isSold: ['']
  });

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    const form = this.filterForm.value;

    const filter: VehicleFilter = {
      page: this.currentPage,
      pageSize: this.pageSize,
      brand: form.brand || undefined,
      model: form.model || undefined,
      minYear: form.minYear || undefined,
      maxYear: form.maxYear || undefined,
      minPrice: form.minPrice || undefined,
      maxPrice: form.maxPrice || undefined,
      isSold: form.isSold === '' ? undefined : form.isSold === 'true'
    };

    this.vehicleService.getAll(filter).subscribe({
      next: (result) => {
        this.vehicles = result.items;
        this.totalPages = result.totalPages;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadVehicles();
  }

  onClear(): void {
    this.filterForm.reset({ brand: '', model: '', minYear: null, maxYear: null, minPrice: null, maxPrice: null, isSold: '' });
    this.currentPage = 1;
    this.loadVehicles();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadVehicles();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}