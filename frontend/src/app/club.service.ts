import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Club } from './club';
import { Member } from './member';

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private apiUrl = 'http://localhost:8085/api/clubs';

  constructor(private http: HttpClient) {}

  private buildHeaders(token?: string): { headers?: HttpHeaders } {
    if (!token) {
      return {};
    }
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getClubs(token?: string): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl, this.buildHeaders(token));
  }

  createClub(club: Club, token?: string): Observable<Club> {
    return this.http.post<Club>(this.apiUrl, club, this.buildHeaders(token));
  }

  updateClub(id: number, club: Club, token?: string): Observable<Club> {
    return this.http.put<Club>(`${this.apiUrl}/${id}`, club, this.buildHeaders(token));
  }

  deleteClub(id: number, token?: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.buildHeaders(token));
  }

  getClubMembers(clubId: number, token?: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/${clubId}/members`, this.buildHeaders(token));
  }

  addMember(clubId: number, member: Member, token?: string): Observable<Member> {
    return this.http.post<Member>(`${this.apiUrl}/${clubId}/members`, member, this.buildHeaders(token));
  }

  removeMember(clubId: number, memberId: number, token?: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${clubId}/members/${memberId}`, this.buildHeaders(token));
  }
}