import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'http://localhost:8081/api/events';

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

  /**
   * Subscribe the current user to an event
   */
  subscribeToEvent(eventId: number): Observable<any> {
    return this.httpClient.post(`${this.API_URL}/${eventId}/subscribe`, {});
  }

  /**
   * Unsubscribe the current user from an event
   */
  unsubscribeFromEvent(eventId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${eventId}/subscribe`);
  }

  /**
   * Check if the current user is subscribed to an event
   */
  isSubscribed(eventId: number): Observable<{ isSubscribed: boolean }> {
    return this.httpClient.get<{ isSubscribed: boolean }>(
      `${this.API_URL}/${eventId}/is-subscribed`
    );
  }

  /**
   * Get the number of subscribers for an event
   */
  getSubscriberCount(eventId: number): Observable<{ subscriberCount: number }> {
    return this.httpClient.get<{ subscriberCount: number }>(
      `${this.API_URL}/${eventId}/subscriber-count`
    );
  }
}
