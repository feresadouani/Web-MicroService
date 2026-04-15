import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Reclamation,
  ReclamationService,
  ReclamationStatus
} from '../../services/reclamation.service';
import { SidebarItem } from '../../layout/sidebar/sidebar.component';
import { ADMIN_SIDEBAR_ITEMS } from '../../layout/sidebar/admin-sidebar-items';

@Component({
  selector: 'app-admin-reclamation-detail',
  templateUrl: './admin-reclamation-detail.component.html',
  styleUrl: './admin-reclamation-detail.component.css'
})
export class AdminReclamationDetailComponent implements OnInit {
  menuItems: SidebarItem[] = ADMIN_SIDEBAR_ITEMS;

  id = '';
  row: Reclamation | null = null;

  loading = false;
  saving = false;
  error = '';
  success = '';

  status: ReclamationStatus = 'OPEN';
  reply = '';

  statuses: Array<{ label: string; value: ReclamationStatus }> = [
    { label: 'Ouvert', value: 'OPEN' },
    { label: 'En cours', value: 'IN_PROGRESS' },
    { label: 'Résolu', value: 'RESOLVED' }
  ];

  constructor(
    private readonly route: ActivatedRoute,
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
        this.status = row.status;
        this.reply = row.reply ?? '';
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load reclamation.';
        this.loading = false;
      }
    });
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    this.reclamationService
      .update(this.id, { status: this.status, reply: this.reply })
      .subscribe({
        next: (row) => {
          this.row = row;
          this.success = 'Mise à jour enregistrée.';
          this.saving = false;
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

