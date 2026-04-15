import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {
  eventForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showSuccessAlert = false;
  showErrorAlert = false;

  constructor(
    private formBuilder: FormBuilder,
    private eventService: EventService
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
        setTimeout(() => {
          this.showSuccessAlert = false;
        }, 5000);
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
    this.eventForm.reset();
    this.showSuccessAlert = false;
    this.showErrorAlert = false;
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
