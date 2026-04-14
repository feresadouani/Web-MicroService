import { Component, OnInit } from '@angular/core';
import { Club } from './club';
import { ClubService } from './club.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Clubs Manager';
  clubs: Club[] = [];
  selectedClub: Club = { name: '', description: '' };
  authToken = '';
  isEditing = false;
  loading = false;
  errorMessage = '';

  constructor(private clubService: ClubService) {}

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.loading = true;
    this.errorMessage = '';
    this.clubService.getClubs(this.authToken).subscribe({
      next: clubs => {
        this.clubs = clubs;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Unable to load clubs. Check the backend service and token.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  selectClub(club: Club): void {
    this.selectedClub = { ...club };
    this.isEditing = true;
  }

  saveClub(): void {
    if (!this.selectedClub.name.trim() || !this.selectedClub.description.trim()) {
      this.errorMessage = 'Name and description are required.';
      return;
    }

    this.errorMessage = '';

    if (this.isEditing && this.selectedClub.id) {
      this.clubService.updateClub(this.selectedClub.id, this.selectedClub, this.authToken).subscribe({
        next: () => {
          this.loadClubs();
          this.resetForm();
        },
        error: err => {
          this.errorMessage = 'Unable to update club.';
          console.error(err);
        }
      });
    } else {
      this.clubService.createClub(this.selectedClub, this.authToken).subscribe({
        next: () => {
          this.loadClubs();
          this.resetForm();
        },
        error: err => {
          this.errorMessage = 'Unable to create club.';
          console.error(err);
        }
      });
    }
  }

  deleteClub(club: Club): void {
    if (!club.id) {
      return;
    }
    this.clubService.deleteClub(club.id, this.authToken).subscribe({
      next: () => this.loadClubs(),
      error: err => {
        this.errorMessage = 'Unable to delete club.';
        console.error(err);
      }
    });
  }

  resetForm(): void {
    this.selectedClub = { name: '', description: '' };
    this.isEditing = false;
    this.errorMessage = '';
  }
}
