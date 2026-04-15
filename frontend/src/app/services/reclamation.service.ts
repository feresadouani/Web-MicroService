import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONFIG } from '../app-config';

export type ReclamationStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Reclamation {
  id: string;
  title: string;
  description: string;
  status: ReclamationStatus;
  authorSub: string;
  reply?: string;
  repliedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReclamationPayload {
  title: string;
  description: string;
}

export interface UpdateReclamationPayload {
  title?: string;
  description?: string;
  status?: ReclamationStatus;
  reply?: string;
}

type ReclamationApiRow = Omit<Reclamation, 'id'> & { _id?: unknown; id?: unknown };

function normalizeReclamation(raw: ReclamationApiRow): Reclamation {
  const idRaw = raw.id ?? raw._id;
  const id = typeof idRaw === 'string' ? idRaw : idRaw != null ? String(idRaw) : '';
  const { _id, ...rest } = raw;
  void _id;
  return { ...(rest as Omit<Reclamation, 'id'>), id };
}

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private readonly API_URL = `${APP_CONFIG.gatewayBaseUrl}/reclamations`;

  constructor(private readonly http: HttpClient) {}

  create(payload: CreateReclamationPayload): Observable<Reclamation> {
    const body = {
      title: payload.title,
      description: payload.description
    };
    return this.http
      .post<ReclamationApiRow>(this.API_URL, body)
      .pipe(map((row) => normalizeReclamation(row)));
  }

  findAll(): Observable<Reclamation[]> {
    return this.http
      .get<ReclamationApiRow[]>(this.API_URL)
      .pipe(map((rows) => rows.map((r) => normalizeReclamation(r))));
  }

  findOne(id: string): Observable<Reclamation> {
    return this.http
      .get<ReclamationApiRow>(`${this.API_URL}/${id}`)
      .pipe(map((row) => normalizeReclamation(row)));
  }

  update(id: string, payload: UpdateReclamationPayload): Observable<Reclamation> {
    return this.http
      .patch<ReclamationApiRow>(`${this.API_URL}/${id}`, payload)
      .pipe(map((row) => normalizeReclamation(row)));
  }
}

