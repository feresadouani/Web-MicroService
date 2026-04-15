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
  professeur?: string;
  modules?: string[];
  enrolledStudents?: string[];
}

export interface CreateCoursPayload {
  title: string;
  content: string;
  author: string;
  category: string;
  professeur?: string;
  modules?: string[];
}

export interface UpdateCoursPayload {
  title: string;
  content: string;
  author: string;
  category: string;
  professeur?: string;
  modules?: string[];
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

  assignProfesseur(id: number, professeur: string): Observable<CoursDto> {
    return this.http.put<CoursDto>(`${this.gatewayBaseUrl}/cours/${id}/professeur`, { professeur });
  }

  replaceModules(id: number, modules: string[]): Observable<CoursDto> {
    return this.http.put<CoursDto>(`${this.gatewayBaseUrl}/cours/${id}/modules`, { modules });
  }

  addModule(id: number, moduleName: string): Observable<CoursDto> {
    return this.http.post<CoursDto>(`${this.gatewayBaseUrl}/cours/${id}/modules`, { module: moduleName });
  }

  removeModule(id: number, moduleName: string): Observable<CoursDto> {
    const encoded = encodeURIComponent(moduleName);
    return this.http.delete<CoursDto>(`${this.gatewayBaseUrl}/cours/${id}/modules/${encoded}`);
  }

  inscrireEtudiant(id: number, email: string): Observable<CoursDto> {
    return this.http.post<CoursDto>(`${this.gatewayBaseUrl}/cours/${id}/etudiants/inscription`, { email });
  }

  desinscrireEtudiant(id: number, email: string): Observable<CoursDto> {
    return this.http.post<CoursDto>(`${this.gatewayBaseUrl}/cours/${id}/etudiants/desinscription`, { email });
  }

  getEtudiantsByCours(id: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.gatewayBaseUrl}/cours/${id}/etudiants`);
  }

  deleteCours(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/cours/${id}`);
  }
}
