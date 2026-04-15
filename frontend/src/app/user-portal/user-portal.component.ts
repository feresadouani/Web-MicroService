import { Component, OnInit } from '@angular/core';
import { CoursApiService, CoursDto } from '../services/cours-api.service';
import { keycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-user-portal',
  templateUrl: './user-portal.component.html',
  styleUrl: './user-portal.component.css'
})
export class UserPortalComponent implements OnInit {
  readonly isClientUser = keycloakService.isClientUser();
  readonly userEmail = keycloakService.getUserEmail();

  coursList: CoursDto[] = [];
  loading = false;
  error = '';

  constructor(private readonly coursApiService: CoursApiService) {}

  ngOnInit(): void {
    this.loadCours();
  }

  loadCours(): void {
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

  isInscrit(cours: CoursDto): boolean {
    const enrolledStudents = cours.enrolledStudents ?? [];
    return enrolledStudents.some((email) => email.toLowerCase() === this.userEmail.toLowerCase());
  }

  inscrire(cours: CoursDto): void {
    if (cours.id == null || !this.userEmail) {
      return;
    }
    this.error = '';
    this.coursApiService.inscrireEtudiant(cours.id, this.userEmail).subscribe({
      next: () => this.loadCours(),
      error: (err) => {
        this.error = `Erreur inscription: ${err.status} ${err.statusText}`;
      }
    });
  }

  desinscrire(cours: CoursDto): void {
    if (cours.id == null || !this.userEmail) {
      return;
    }
    this.error = '';
    this.coursApiService.desinscrireEtudiant(cours.id, this.userEmail).subscribe({
      next: () => this.loadCours(),
      error: (err) => {
        this.error = `Erreur desinscription: ${err.status} ${err.statusText}`;
      }
    });
  }

  getModules(cours: CoursDto): string[] {
    return cours.modules ?? [];
  }

  logout(): void {
    keycloakService.logout();
  }
}
