import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionResponse } from '../models/vehicle.models';

/**
 * Service responsible for all question and answer HTTP operations.
 */
@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5105/api/questions';

  /**
   * Retrieves all questions for a specific vehicle.
   * @param vehicleId - Vehicle ID
   */
  getByVehicle(vehicleId: number): Observable<QuestionResponse[]> {
    return this.http.get<QuestionResponse[]>(`${this.API_URL}/vehicle/${vehicleId}`);
  }

  /**
   * Submits a question about a vehicle.
   * @param vehicleId - Vehicle ID
   * @param content - Question text
   */
  ask(vehicleId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${vehicleId}`, { content });
  }

  /**
   * Submits an answer to a question.
   * @param questionId - Question ID
   * @param content - Answer text
   */
  answer(questionId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${questionId}/answer`, { content });
  }
}
