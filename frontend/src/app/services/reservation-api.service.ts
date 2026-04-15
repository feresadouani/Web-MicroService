import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../app-config';

export interface ReservationDto {
  id?: number;
  userId: number;
  salleNum: number;
  reservationDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EMPTY';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReservationPayload {
  userId: number;
  salleNum: number;
  reservationDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EMPTY';
  notes?: string;
}

export interface UpdateReservationPayload {
  userId?: number;
  salleNum?: number;
  reservationDate?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EMPTY';
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationApiService {
  private readonly gatewayBaseUrl = APP_CONFIG.gatewayBaseUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all reservations
   */
  getReservations(search?: string | null): Observable<ReservationDto[]> {
    if (search?.trim()) {
      const params = new HttpParams().set('q', search.trim());
      return this.http.get<ReservationDto[]>(`${this.gatewayBaseUrl}/reservations/search`, { params });
    }
    return this.http.get<ReservationDto[]>(`${this.gatewayBaseUrl}/reservations`);
  }

  /**
   * Get reservation by ID
   */
  getReservationById(id: number): Observable<ReservationDto> {
    return this.http.get<ReservationDto>(`${this.gatewayBaseUrl}/reservations/${id}`);
  }

  /**
   * Get reservations by user ID
   */
  getReservationsByUserId(userId: number): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.gatewayBaseUrl}/reservations/user/${userId}`);
  }

  /**
   * Get reservation by SalleNum
   */
  getReservationBySalleNum(salleNum: number): Observable<ReservationDto> {
    return this.http.get<ReservationDto>(`${this.gatewayBaseUrl}/reservations/salle/${salleNum}`);
  }

  /**
   * Get reservations by status
   */
  getReservationsByStatus(status: string): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.gatewayBaseUrl}/reservations/status/${status}`);
  }

  /**
   * Create a new reservation
   */
  createReservation(payload: CreateReservationPayload): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(`${this.gatewayBaseUrl}/reservations`, payload);
  }

  /**
   * Update an existing reservation
   */
  updateReservation(id: number, payload: UpdateReservationPayload): Observable<ReservationDto> {
    return this.http.put<ReservationDto>(`${this.gatewayBaseUrl}/reservations/${id}`, payload);
  }

  /**
   * Update reservation status
   */
  updateReservationStatus(id: number, status: string): Observable<ReservationDto> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ReservationDto>(`${this.gatewayBaseUrl}/reservations/${id}/status`, null, { params });
  }

  /**
   * Cancel a reservation
   */
  cancelReservation(id: number): Observable<ReservationDto> {
    return this.http.patch<ReservationDto>(`${this.gatewayBaseUrl}/reservations/${id}/cancel`, null);
  }

  /**
   * Confirm a reservation
   */
  confirmReservation(id: number): Observable<ReservationDto> {
    return this.http.patch<ReservationDto>(`${this.gatewayBaseUrl}/reservations/${id}/confirm`, null);
  }

  /**
   * Delete a reservation
   */
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/reservations/${id}`);
  }
}
