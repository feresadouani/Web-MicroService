import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { Router } from '@angular/router';
import { SidebarItem } from '../../layout/sidebar/sidebar.component';
import { ADMIN_SIDEBAR_ITEMS } from '../../layout/sidebar/admin-sidebar-items';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {
  menuItems: SidebarItem[] = ADMIN_SIDEBAR_ITEMS;

  eventForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showSuccessAlert = false;
  showErrorAlert = false;

  constructor(
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.eventForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      location: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.showError('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    const eventData: Event = {
      name: this.eventForm.get('name')?.value.trim(),
      description: this.eventForm.get('description')?.value.trim(),
      location: this.eventForm.get('location')?.value.trim(),
      date: new Date(this.eventForm.get('date')?.value)
    };

    this.eventService.addEvent(eventData).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess('Event added successfully!');
        this.eventForm.reset();
        // Redirect back to the events list
        setTimeout(() => void this.router.navigate(['/admin', 'events']), 400);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error adding event:', error);
        const errorMsg =
          error?.error?.message ||
          error?.message ||
          (error?.status ? `Failed to add event (HTTP ${error.status}).` : 'Failed to add event. Please try again.');
        this.showError(errorMsg);
      }
    });
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessAlert = true;
    this.showErrorAlert = false;
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorAlert = true;
    this.showSuccessAlert = false;
  }

  closeSuccessAlert(): void {
    this.showSuccessAlert = false;
  }

  closeErrorAlert(): void {
    this.showErrorAlert = false;
  }

  resetForm(): void {
    // Cancel should go back to events list
    void this.router.navigate(['/admin', 'events']);
  }

  get name() {
    return this.eventForm.get('name');
  }

  get description() {
    return this.eventForm.get('description');
  }

  get location() {
    return this.eventForm.get('location');
  }

  get date() {
    return this.eventForm.get('date');
  }
}
