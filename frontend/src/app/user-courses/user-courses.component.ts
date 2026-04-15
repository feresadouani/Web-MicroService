import { Component, OnInit } from '@angular/core';
import { CoursApiService, CoursDto } from '../services/cours-api.service';
import { keycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-user-courses',
  templateUrl: './user-courses.component.html',
  styleUrl: './user-courses.component.css'
})
export class UserCoursesComponent implements OnInit {
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

  get visibleCours(): CoursDto[] {
    const normalizedUserEmail = (this.userEmail ?? '').toLowerCase();
    return this.coursList.filter((cours) =>
      cours.id != null &&
      this.isCurrentUserAssigned(cours, normalizedUserEmail)
    );
  }

  hasAnyCoursAvailable(): boolean {
    return this.visibleCours.length > 0;
  }

  getStudentCount(cours: CoursDto): number {
    return (cours.enrolledStudents ?? []).length;
  }

  getModules(cours: CoursDto): string[] {
    return cours.modules ?? [];
  }

  private isCurrentUserAssigned(cours: CoursDto, normalizedUserEmail: string): boolean {
    if (!normalizedUserEmail) {
      return false;
    }

    const normalizedProfessorEmail = (cours.professeur ?? '').trim().toLowerCase();
    if (normalizedProfessorEmail && normalizedProfessorEmail === normalizedUserEmail) {
      return true;
    }

    const enrolledStudents = cours.enrolledStudents ?? [];
    return enrolledStudents.some((email) => email.toLowerCase() === normalizedUserEmail);
  }
}
