import { Component, OnInit } from '@angular/core';
import { SidebarItem } from '../../layout/sidebar/sidebar.component';
import { Reclamation, ReclamationService } from '../../services/reclamation.service';

@Component({
  selector: 'app-admin-reclamations',
  templateUrl: './admin-reclamations.component.html',
  styleUrl: './admin-reclamations.component.css'
})
export class AdminReclamationsComponent implements OnInit {
  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
    { label: 'Events', route: ['/admin', 'events'] },
    { label: 'Reclamations', route: ['/admin', 'reclamations'] },
  ];

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
        this.error = 'An error occurred while fetching reclamations.';
        this.loading = false;
      }
    });
  }
}

