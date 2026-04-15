import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MemberDto {
  id?: number;
  name: string;
  email: string;
}

export interface ClubDto {
  id?: number;
  name: string;
  description: string;
  members?: MemberDto[];
}

export interface CreateClubPayload {
  name: string;
  description: string;
}

export interface UpdateClubPayload {
  name: string;
  description: string;
}

export interface CreateMemberPayload {
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClubApiService {
  private readonly gatewayBaseUrl = 'http://localhost:8081';
  private readonly clubsBasePath = '/api/clubs';

  constructor(private readonly http: HttpClient) {}

  getClubs(): Observable<ClubDto[]> {
    return this.http.get<ClubDto[]>(`${this.gatewayBaseUrl}${this.clubsBasePath}`);
  }

  createClub(payload: CreateClubPayload): Observable<ClubDto> {
    return this.http.post<ClubDto>(`${this.gatewayBaseUrl}${this.clubsBasePath}`, payload);
  }

  updateClub(id: number, payload: UpdateClubPayload): Observable<ClubDto> {
    return this.http.put<ClubDto>(`${this.gatewayBaseUrl}${this.clubsBasePath}/${id}`, payload);
  }

  deleteClub(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}${this.clubsBasePath}/${id}`);
  }

  getMembers(clubId: number): Observable<MemberDto[]> {
    return this.http.get<MemberDto[]>(
      `${this.gatewayBaseUrl}${this.clubsBasePath}/${clubId}/members`
    );
  }

  addMember(clubId: number, payload: CreateMemberPayload): Observable<MemberDto> {
    return this.http.post<MemberDto>(
      `${this.gatewayBaseUrl}${this.clubsBasePath}/${clubId}/members`,
      payload
    );
  }

  removeMember(clubId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.gatewayBaseUrl}${this.clubsBasePath}/${clubId}/members/${memberId}`
    );
  }
}

