import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Réponse HAL Spring Data REST pour une collection */
interface HalUsersResponse {
  _embedded?: {
    users?: HalUserItem[];
  };
}

/** Représentation HAL d’un user (id + éventuellement lien self) */
type HalUserItem = UserDto & {
  _links?: { self?: { href?: string } };
};

export interface UserDto {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  role?: string;
  birthday?: string;
}

export interface CreateUserPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

export interface UpdateUserPayload {
  firstname: string;
  lastname: string;
  email: string;
  role: 'USER' | 'ADMIN';
  /** Si renseigné, le mot de passe est mis à jour (JSON Merge Patch). */
  password?: string;
}

const MERGE_PATCH_HEADERS = new HttpHeaders({
  'Content-Type': 'application/merge-patch+json'
});

function normalizeUserFromHal(raw: HalUserItem): UserDto {
  const id = raw.id ?? idFromSelfHref(raw._links?.self?.href);
  const { _links, ...rest } = raw;
  void _links;
  return id != null ? { ...rest, id } : { ...rest };
}

function idFromSelfHref(href: string | undefined): number | undefined {
  if (!href) {
    return undefined;
  }
  const match = /\/(\d+)(?:\?.*)?$/i.exec(href);
  return match ? Number(match[1]) : undefined;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private readonly gatewayBaseUrl = 'http://localhost:8081';

  constructor(private readonly http: HttpClient) {}

  getCurrentUser(): Observable<unknown> {
    return this.http.get(`${this.gatewayBaseUrl}/users/me`);
  }

  getUsers(): Observable<UserDto[]> {
    return this.http.get<HalUsersResponse>(`${this.gatewayBaseUrl}/users`).pipe(
      map((body) => (body._embedded?.users ?? []).map((u) => normalizeUserFromHal(u)))
    );
  }

  createUser(payload: CreateUserPayload): Observable<UserDto> {
    const body = {
      firstname: payload.firstname,
      lastname: payload.lastname,
      email: payload.email,
      password: payload.password,
      role: payload.role
    };
    return this.http.post<UserDto>(`${this.gatewayBaseUrl}/users`, body);
  }

  /**
   * Mise à jour partielle via Spring Data REST (PATCH + merge-patch+json).
   */
  updateUser(id: number, payload: UpdateUserPayload): Observable<UserDto> {
    const body: Record<string, string> = {
      firstname: payload.firstname,
      lastname: payload.lastname,
      email: payload.email,
      role: payload.role
    };
    if (payload.password != null && payload.password.length > 0) {
      body['password'] = payload.password;
    }
    return this.http.patch<UserDto>(`${this.gatewayBaseUrl}/users/${id}`, body, {
      headers: MERGE_PATCH_HEADERS
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/users/${id}`);
  }
}
