import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReclamationService } from '../../services/reclamation.service';

@Component({
  selector: 'app-add-reclamation',
  templateUrl: './add-reclamation.component.html',
  styleUrl: './add-reclamation.component.css'
})
export class AddReclamationComponent {
  title = '';
  description = '';

  loading = false;
  error = '';
  success = '';

  constructor(
    private readonly reclamationService: ReclamationService,
    private readonly router: Router
  ) {}

  submit(): void {
    const title = this.title.trim();
    const description = this.description.trim();
    if (!title || !description) {
      this.error = 'Title and description are required.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.reclamationService.create({ title, description }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Reclamation created successfully.';
        this.title = '';
        this.description = '';
        // Optional: take user back to events or keep on page
        setTimeout(() => void this.router.navigateByUrl('/event'), 600);
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to create reclamation. Please try again.';
      }
    });
  }
}

