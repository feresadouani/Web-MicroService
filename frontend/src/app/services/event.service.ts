import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'http://localhost:8081/events';

  constructor(private httpClient: HttpClient) {}

  addEvent(event: Event): Observable<string> {
    return this.httpClient.post(this.API_URL, event, { responseType: 'text' });
  }

  getAllEvents(): Observable<Event[]> {
    return this.httpClient.get<Event[]>(this.API_URL);
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.httpClient.put<Event>(`${this.API_URL}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`);
  }

  /** Subscribe a user to an event, sending their display name */
  registerToEvent(eventId: number, userId: string, displayName: string): Observable<Event> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('displayName', displayName);
    return this.httpClient.post<Event>(`${this.API_URL}/${eventId}/register`, null, { params });
  }

  /** Unsubscribe a user from an event */
  unregisterFromEvent(eventId: number, userId: string): Observable<Event> {
    const params = new HttpParams().set('userId', userId);
    return this.httpClient.delete<Event>(`${this.API_URL}/${eventId}/register`, { params });
  }
}
