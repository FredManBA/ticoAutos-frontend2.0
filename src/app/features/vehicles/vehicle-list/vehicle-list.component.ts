import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GraphQLService } from '../../../core/services/graphql.service';
import { Vehicle } from '../../../core/models/vehicle.models';

const GET_VEHICLES = `
  query {
    vehicles {
      id brand model year price description imageUrl
      isSold ownerId ownerName createdAt unansweredQuestions
    }
  }
`;

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vehicle-list.component.html'
})
export class VehicleListComponent implements OnInit {
  private graphql = inject(GraphQLService);
  private fb = inject(FormBuilder);

  vehicles: Vehicle[] = [];
  totalPages = 0;
  totalCount = 0;
  currentPage = 1;
  pageSize = 9;
  loading = false;
  errorMsg = '';

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
    this.errorMsg = '';

    this.graphql.query<{ vehicles: Vehicle[] }>(GET_VEHICLES).subscribe({
      next: (data) => {
        this.vehicles = data.vehicles ?? [];
        this.totalCount = this.vehicles.length;
        this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.message ?? 'Error al conectar con GraphQL';
        console.error('[GraphQL]', err);
        this.loading = false;
      }
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