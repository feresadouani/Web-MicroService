import { Component, OnInit } from '@angular/core';
import { SidebarItem } from '../../layout/sidebar/sidebar.component';
import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-admin-events',
  templateUrl: './admin-events.component.html',
  styleUrl: './admin-events.component.css'
})
export class AdminEventsComponent implements OnInit {
  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
    { label: 'Events', route: ['/admin', 'events'] },
    { label: 'Add Event', route: ['/admin', 'events', 'add'] }
  ];

  events: Event[] = [];
  loading = false;
  error = '';
  editingEvent: Event | null = null;
  expandedEventId: number | null = null;

  constructor(private readonly eventService: EventService) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.loading = true;
    this.error = '';
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: () => {
        this.error = 'An error occurred while fetching events.';
        this.loading = false;
      }
    });
  }

  startEdit(event: Event): void {
    this.error = '';
    if (event.id == null) {
      this.error = 'Unable to edit this event: missing id.';
      return;
    }
    this.editingEvent = {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      date: event.date
    };
  }

  cancelEdit(): void {
    this.editingEvent = null;
  }

  saveEdit(): void {
    const e = this.editingEvent;
    if (e == null || e.id == null) {
      return;
    }

    this.error = '';
    this.eventService.updateEvent(e.id, e).subscribe({
      next: () => {
        this.editingEvent = null;
        this.fetchEvents();
      },
      error: () => {
        this.error = 'An error occurred while updating the event.';
      }
    });
  }

  toggleSubscribers(eventId: number | undefined): void {
    if (eventId === undefined) return;
    this.expandedEventId = this.expandedEventId === eventId ? null : eventId;
  }

  getSubscribersList(event: Event): Array<{ firstName: string; email: string }> {
    if (!event.registeredUsers) return [];
    const users = event.registeredUsers as { [key: string]: string };
    return Object.entries(users).map(([, displayName]) => {
      const raw = displayName ?? '';
      const [firstName, email] = raw.includes('|') ? raw.split('|', 2) : [raw, ''];
      return {
        firstName: (firstName ?? '').trim(),
        email: (email ?? '').trim()
      };
    });
  }

  getSubscriberCount(event: Event): number {
    if (!event.registeredUsers) return 0;
    return Object.keys(event.registeredUsers).length;
  }

  deleteEvent(event: Event): void {
    if (event.id == null) {
      this.error = 'Unable to delete this event: missing id.';
      return;
    }
    if (!confirm(`Delete event "${event.name}"?`)) {
      return;
    }

    this.error = '';
    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        if (this.editingEvent?.id === event.id) {
          this.editingEvent = null;
        }
        this.fetchEvents();
      },
      error: () => {
        this.error = 'An error occurred while deleting the event.';
      }
    });
  }
}
