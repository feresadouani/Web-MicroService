import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoursApiService, CoursDto } from '../services/cours-api.service';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css'
})
export class CourseDetailsComponent implements OnInit {
  cours: CoursDto | null = null;
  loading = true;
  error = '';
  showStudentsModal = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly coursApiService: CoursApiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const id = idParam ? Number(idParam) : NaN;

      if (!Number.isInteger(id) || id <= 0) {
        this.error = 'Invalid course identifier.';
        this.loading = false;
        return;
      }

      this.loadCourse(id);
    });
  }

  get modules(): string[] {
    return this.cours?.modules ?? [];
  }

  get students(): string[] {
    return this.cours?.enrolledStudents ?? [];
  }

  openStudentsModal(): void {
    this.showStudentsModal = true;
  }

  closeStudentsModal(): void {
    this.showStudentsModal = false;
  }

  private loadCourse(id: number): void {
    this.loading = true;
    this.error = '';
    this.cours = null;

    this.coursApiService.getCoursById(id).subscribe({
      next: (cours) => {
        this.cours = cours;
        this.loading = false;
      },
      error: () => {
        this.coursApiService.getCours().subscribe({
          next: (allCours) => {
            this.cours = allCours.find((cours) => cours.id === id) ?? null;
            if (!this.cours) {
              this.error = 'Course not found.';
            }
            this.loading = false;
          },
          error: () => {
            this.error = 'Unable to load course details.';
            this.loading = false;
          }
        });
      }
    });
  }
}
