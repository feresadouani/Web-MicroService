import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Reclamation, ReclamationService } from '../../services/reclamation.service';

@Component({
  selector: 'app-edit-reclamation',
  templateUrl: './edit-reclamation.component.html',
  styleUrl: './edit-reclamation.component.css'
})
export class EditReclamationComponent implements OnInit {
  id = '';
  row: Reclamation | null = null;

  title = '';
  description = '';

  loading = false;
  saving = false;
  error = '';
  success = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly reclamationService: ReclamationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Missing reclamation id.';
      return;
    }
    this.id = id;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.reclamationService.findOne(this.id).subscribe({
      next: (row) => {
        this.row = row;
        this.title = row.title;
        this.description = row.description;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load reclamation.';
        this.loading = false;
      }
    });
  }

  save(): void {
    const title = this.title.trim();
    const description = this.description.trim();
    if (!title || !description) {
      this.error = 'Title and description are required.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';
    this.reclamationService.update(this.id, { title, description }).subscribe({
      next: (row) => {
        this.row = row;
        this.success = 'Réclamation modifiée.';
        this.saving = false;
        setTimeout(() => void this.router.navigateByUrl('/reclamations'), 600);
      },
      error: (err) => {
        const msg =
          (err?.error && (err.error.message ?? err.error.error)) ??
          err?.message ??
          (err?.status ? `Unable to update reclamation (HTTP ${err.status}).` : 'Unable to update reclamation.');
        this.error = String(msg);
        this.saving = false;
      }
    });
  }
}

