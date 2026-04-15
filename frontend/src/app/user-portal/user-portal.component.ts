import { Component, OnInit } from '@angular/core';
import { Event } from '../models/event.model';
import { EventService } from '../services/event.service';
import { keycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-user-portal',
  templateUrl: './user-portal.component.html',
  styleUrl: './user-portal.component.css'
})
export class UserPortalComponent implements OnInit {
  readonly isClientUser = keycloakService.isClientUser();
  events: Event[] = [];
  eventsLoading = true;
  eventsError = false;

  /** Tracks which event IDs have their subscriber list open */
  expandedEventIds = new Set<number>();

  /** Tracks which event IDs are currently toggling (spinner) */
  pendingEventIds = new Set<number>();

  /** Current user's Keycloak subject (unique ID) */
  private get currentUserId(): string {
    return (keycloakService.profile?.['sub'] as string) ?? '';
  }

  /** Current user's display name from token */
  private get currentDisplayName(): string {
    const p = keycloakService.profile as Record<string, unknown> | undefined;
    if (!p) return 'Utilisateur';
    const first = (p['given_name'] as string) ?? '';
    const last  = (p['family_name'] as string) ?? '';
    if (first || last) return `${first} ${last}`.trim();
    return (p['preferred_username'] as string) ?? (p['email'] as string) ?? 'Utilisateur';
  }

  constructor(private readonly eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.eventsLoading = false;
      },
      error: () => {
        this.eventsError = true;
        this.eventsLoading = false;
      }
    });
  }

  /** Returns true if the current user is registered to this event */
  isRegistered(event: Event): boolean {
    if (!event.registeredUsers || !this.currentUserId) return false;
    return this.currentUserId in event.registeredUsers;
  }

  /** Returns the list of subscriber display names for an event */
  getSubscriberNames(event: Event): string[] {
    if (!event.registeredUsers) return [];
    return Object.values(event.registeredUsers);
  }

  /** Returns count of subscribers */
  getSubscriberCount(event: Event): number {
    return Object.keys(event.registeredUsers ?? {}).length;
  }

  /** Toggle show/hide subscriber list */
  toggleSubscriberList(event: Event): void {
    if (!event.id) return;
    if (this.expandedEventIds.has(event.id)) {
      this.expandedEventIds.delete(event.id);
    } else {
      this.expandedEventIds.add(event.id);
    }
  }

  isExpanded(event: Event): boolean {
    return !!event.id && this.expandedEventIds.has(event.id);
  }

  /** Toggle registration (subscribe / unsubscribe) */
  toggleRegistration(event: Event): void {
    if (!event.id) return;
    const userId = this.currentUserId;
    if (!userId) return;

    this.pendingEventIds.add(event.id);

    const action$ = this.isRegistered(event)
      ? this.eventService.unregisterFromEvent(event.id, userId)
      : this.eventService.registerToEvent(event.id, userId, this.currentDisplayName);

    action$.subscribe({
      next: (updatedEvent) => {
        const idx = this.events.findIndex(e => e.id === updatedEvent.id);
        if (idx !== -1) this.events[idx] = updatedEvent;
        this.pendingEventIds.delete(event.id!);
      },
      error: () => {
        this.pendingEventIds.delete(event.id!);
      }
    });
  }

  logout(): void {
    keycloakService.logout();
  }
}
