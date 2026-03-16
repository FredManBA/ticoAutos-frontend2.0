import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, VehicleFilter, PagedResult } from '../models/vehicle.models';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://localhost:7111/api/vehicles';

  getAll(filter: VehicleFilter): Observable<PagedResult<Vehicle>> {
    let params = new HttpParams()
      .set('page', filter.page)
      .set('pageSize', filter.pageSize);

    if (filter.brand) params = params.set('brand', filter.brand);
    if (filter.model) params = params.set('model', filter.model);
    if (filter.minYear) params = params.set('minYear', filter.minYear);
    if (filter.maxYear) params = params.set('maxYear', filter.maxYear);
    if (filter.minPrice) params = params.set('minPrice', filter.minPrice);
    if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice);
    if (filter.isSold !== undefined) params = params.set('isSold', filter.isSold);

    return this.http.get<PagedResult<Vehicle>>(this.API_URL, { params });
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.API_URL}/${id}`);
  }
}