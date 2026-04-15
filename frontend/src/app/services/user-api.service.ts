import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface HalUsersResponse {
  _embedded?: {
    users?: HalUserItem[];
  };
}

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
  birthday?: string;
}

export interface UpdateUserPayload {
  firstname: string;
  lastname: string;
  email: string;
  role: 'USER' | 'ADMIN';
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

  getUsers(search?: string | null): Observable<UserDto[]> {
    const q = search?.trim();
    if (q) {
      const params = new HttpParams().set('q', q);
      return this.http.get<UserDto[]>(`${this.gatewayBaseUrl}/users/admin/search`, { params });
    }
    return this.http.get<HalUsersResponse>(`${this.gatewayBaseUrl}/users`).pipe(
      map((body) => (body._embedded?.users ?? []).map((u) => normalizeUserFromHal(u)))
    );
  }

  createUser(payload: CreateUserPayload): Observable<UserDto> {
    const body: Record<string, string> = {
      firstname: payload.firstname,
      lastname: payload.lastname,
      email: payload.email,
      password: payload.password,
      role: payload.role
    };
    if (payload.birthday != null && payload.birthday.length > 0) {
      body['birthday'] = payload.birthday;
    }
    return this.http.post<UserDto>(`${this.gatewayBaseUrl}/users`, body);
  }

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
