import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CoursDto {
  id?: number;
  title: string;
  content: string;
  dateOfPost?: string;
  author: string;
  category: string;
}

export interface CreateCoursPayload {
  title: string;
  content: string;
  author: string;
  category: string;
}

export interface UpdateCoursPayload {
  title: string;
  content: string;
  author: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoursApiService {
  private readonly gatewayBaseUrl = 'http://localhost:8081';

  constructor(private readonly http: HttpClient) {}

  getCours(): Observable<CoursDto[]> {
    return this.http.get<CoursDto[]>(`${this.gatewayBaseUrl}/cours`);
  }

  createCours(payload: CreateCoursPayload): Observable<CoursDto> {
    return this.http.post<CoursDto>(`${this.gatewayBaseUrl}/cours`, payload);
  }

  updateCours(id: number, payload: UpdateCoursPayload): Observable<CoursDto> {
    return this.http.put<CoursDto>(`${this.gatewayBaseUrl}/cours/${id}`, payload);
  }

  deleteCours(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/cours/${id}`);
  }
}
