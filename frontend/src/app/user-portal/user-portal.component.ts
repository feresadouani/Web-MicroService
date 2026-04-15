import { Component } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Event } from '../models/event.model';
import { EventService } from '../services/event.service';
import { keycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-user-portal',
  templateUrl: './user-portal.component.html',
  styleUrl: './user-portal.component.css'
})
export class UserPortalComponent {
  readonly isClientUser = keycloakService.isClientUser();
  readonly userEmail = keycloakService.getUserEmail();
  events: Event[] = [];
  eventsLoading = true;
  eventsError = false;
  loadingSubscriptions = new Set<number>();
  subscriptionError: string | null = null;

  constructor(private readonly eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.eventsLoading = false;
        this.loadSubscriptionStatus();
      },
      error: () => {
        this.eventsError = true;
        this.eventsLoading = false;
      }
    });
  }

  /**
   * Load subscription status for all events
   */
  loadSubscriptionStatus(): void {
    this.events.forEach(event => {
      if (event.id) {
        this.eventService.isSubscribed(event.id).subscribe({
          next: (response) => {
            event.isSubscribed = response.isSubscribed;
          },
          error: (err) => {
            console.log('Not authenticated or error checking subscription', err);
            event.isSubscribed = false;
          }
        });
      }
    });
  }

  /**
   * Toggle subscription (subscribe or unsubscribe)
   */
  toggleSubscription(event: Event): void {
    if (!event.id) return;

    if (event.isSubscribed) {
      this.unsubscribeFromEvent(event);
    } else {
      this.subscribeToEvent(event);
    }
  }

  /**
   * Subscribe to an event
   */
  subscribeToEvent(event: Event): void {
    if (!event.id) return;

    this.loadingSubscriptions.add(event.id);
    this.subscriptionError = null;

    this.eventService.subscribeToEvent(event.id).subscribe({
      next: () => {
        event.isSubscribed = true;
        this.loadingSubscriptions.delete(event.id!);
      },
      error: (err) => {
        console.error('Subscription error:', err);
        this.subscriptionError = err.error?.error || 'Failed to subscribe to event';
        this.loadingSubscriptions.delete(event.id!);
      }
    });
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribeFromEvent(event: Event): void {
    if (!event.id) return;

    this.loadingSubscriptions.add(event.id);
    this.subscriptionError = null;

    this.eventService.unsubscribeFromEvent(event.id).subscribe({
      next: () => {
        event.isSubscribed = false;
        this.loadingSubscriptions.delete(event.id!);
      },
      error: (err) => {
        console.error('Unsubscription error:', err);
        this.subscriptionError = err.error?.error || 'Failed to unsubscribe from event';
        this.loadingSubscriptions.delete(event.id!);
      }
    });
  }

  /**
   * Check if loading for a specific event
   */
  isLoading(eventId: number | undefined): boolean {
    return eventId ? this.loadingSubscriptions.has(eventId) : false;
  }

  logout(): void {
    keycloakService.logout();
  }
}
