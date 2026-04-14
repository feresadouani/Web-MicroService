import { Component, OnInit } from '@angular/core';
import { SidebarItem } from '../layout/sidebar/sidebar.component';
import {
  CoursApiService,
  CoursDto,
  CreateCoursPayload,
  UpdateCoursPayload
} from '../services/cours-api.service';

@Component({
  selector: 'app-cours',
  templateUrl: './cours.component.html',
  styleUrl: './cours.component.css'
})
export class CoursComponent implements OnInit {
  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
    { label: 'Cours', route: ['/admin', 'cours'] }
  ];

  coursList: CoursDto[] = [];
  loading = false;
  showCreateForm = false;
  error = '';
  editingCoursId: number | null = null;

  editCours: UpdateCoursPayload = {
    title: '',
    content: '',
    author: '',
    category: ''
  };

  newCours: CreateCoursPayload = {
    title: '',
    content: '',
    author: '',
    category: ''
  };

  constructor(private readonly coursApiService: CoursApiService) {}

  ngOnInit(): void {
    this.fetchCours();
  }

  fetchCours(): void {
    this.loading = true;
    this.error = '';
    this.coursApiService.getCours().subscribe({
      next: (cours) => {
        this.coursList = cours;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Erreur chargement cours: ${err.status} ${err.statusText}`;
        this.loading = false;
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.cancelEdit();
    }
  }

  createCours(): void {
    this.error = '';
    this.coursApiService.createCours(this.newCours).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.newCours = {
          title: '',
          content: '',
          author: '',
          category: ''
        };
        this.fetchCours();
      },
      error: (err) => {
        this.error = `Erreur creation cours: ${err.status} ${err.statusText}`;
      }
    });
  }

  startEdit(cours: CoursDto): void {
    if (cours.id == null) {
      this.error = 'Impossible de modifier: identifiant manquant.';
      return;
    }

    this.error = '';
    this.showCreateForm = false;
    this.editingCoursId = cours.id;
    this.editCours = {
      title: cours.title,
      content: cours.content,
      author: cours.author,
      category: cours.category
    };
  }

  cancelEdit(): void {
    this.editingCoursId = null;
    this.editCours = {
      title: '',
      content: '',
      author: '',
      category: ''
    };
  }

  saveEdit(): void {
    if (this.editingCoursId == null) {
      return;
    }

    this.error = '';
    this.coursApiService.updateCours(this.editingCoursId, this.editCours).subscribe({
      next: () => {
        this.cancelEdit();
        this.fetchCours();
      },
      error: (err) => {
        this.error = `Erreur mise a jour cours: ${err.status} ${err.statusText}`;
      }
    });
  }

  deleteCours(cours: CoursDto): void {
    if (cours.id == null) {
      this.error = 'Impossible de supprimer: identifiant manquant.';
      return;
    }
    if (!confirm(`Supprimer le cours "${cours.title}" ?`)) {
      return;
    }
    this.error = '';
    this.coursApiService.deleteCours(cours.id).subscribe({
      next: () => {
        if (this.editingCoursId === cours.id) {
          this.cancelEdit();
        }
        this.fetchCours();
      },
      error: (err) => {
        this.error = `Erreur suppression cours: ${err.status} ${err.statusText}`;
      }
    });
  }
}
