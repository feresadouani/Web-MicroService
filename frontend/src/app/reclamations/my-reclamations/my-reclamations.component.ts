import { Component, OnInit } from '@angular/core';
import { Reclamation, ReclamationService } from '../../services/reclamation.service';

@Component({
  selector: 'app-my-reclamations',
  templateUrl: './my-reclamations.component.html',
  styleUrl: './my-reclamations.component.css'
})
export class MyReclamationsComponent implements OnInit {
  rows: Reclamation[] = [];
  loading = false;
  error = '';

  constructor(private readonly reclamationService: ReclamationService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.reclamationService.findAll().subscribe({
      next: (rows) => {
        this.rows = rows;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load your reclamations.';
        this.loading = false;
      }
    });
  }
}

