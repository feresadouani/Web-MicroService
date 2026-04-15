import { Component, OnInit } from '@angular/core';
import { SidebarItem } from '../../layout/sidebar/sidebar.component';
import { ADMIN_SIDEBAR_ITEMS } from '../../layout/sidebar/admin-sidebar-items';
import { Reclamation, ReclamationService } from '../../services/reclamation.service';

@Component({
  selector: 'app-admin-reclamations',
  templateUrl: './admin-reclamations.component.html',
  styleUrl: './admin-reclamations.component.css'
})
export class AdminReclamationsComponent implements OnInit {
  menuItems: SidebarItem[] = ADMIN_SIDEBAR_ITEMS;

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

