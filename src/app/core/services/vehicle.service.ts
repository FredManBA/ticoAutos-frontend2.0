import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle, VehicleFilter, PagedResult } from '../models/vehicle.models';

/**
 * Service responsible for all vehicle-related HTTP operations.
 * Communicates with the TicoAutos REST API.
 */
@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5105/api/vehicles';

  /**
   * Retrieves a paginated and filtered list of vehicles.
   * @param filter - Filter and pagination parameters
   */
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

  /**
   * Retrieves a single vehicle by its ID.
   * @param id - Vehicle ID
   */
  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.API_URL}/${id}`);
  }

  /**
   * Retrieves all vehicles owned by the authenticated user.
   * Requires JWT token via AuthInterceptor.
   */
  getMyVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.API_URL}/my`);
  }

  /**
   * Creates a new vehicle listing for the authenticated user.
   * @param data - Vehicle data to publish
   */
  create(data: any): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.API_URL, data);
  }

  /**
   * Updates an existing vehicle listing.
   * @param id - Vehicle ID
   * @param data - Updated vehicle data
   */
  update(id: number, data: any): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Deletes a vehicle listing by ID.
   * @param id - Vehicle ID
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Marks a vehicle as sold.
   * @param id - Vehicle ID
   */
  markAsSold(id: number): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.API_URL}/${id}/sold`, {});
  }

  /**
   * Returns the total count of unanswered questions across all owner's vehicles.
   */
  getUnansweredCount(): Observable<number> {
    return this.getMyVehicles().pipe(
      map((vehicles: Vehicle[]) => vehicles.reduce((acc, v) => acc + v.unansweredQuestions, 0))
    );
  }
}