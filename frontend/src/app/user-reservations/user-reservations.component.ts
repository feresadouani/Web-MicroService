import { Component, OnInit } from '@angular/core';
import { ReservationApiService, ReservationDto } from '../services/reservation-api.service';
import { UserApiService } from '../services/user-api.service';
import { keycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-user-reservations',
  templateUrl: './user-reservations.component.html',
  styleUrls: ['./user-reservations.component.css']
})
export class UserReservationsComponent implements OnInit {
  reservations: ReservationDto[] = [];
  loading = false;
  error = '';
  currentDbUserId?: number;

  constructor(
    private readonly reservationApiService: ReservationApiService,
    private readonly userApiService: UserApiService
  ) {}

  ngOnInit(): void {
    this.userApiService.getCurrentUser().subscribe(user => {
      this.currentDbUserId = user.dbUserId;
    });
    this.fetchReservations();
  }

  logout() {
    keycloakService.logout();
  }

  fetchReservations(): void {
    this.loading = true;
    this.error = '';
    this.reservationApiService.getReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Erreur chargement réservations: ${err.status} ${err.statusText}`;
        this.loading = false;
      }
    });
  }

  reserveRoom(reservation: ReservationDto): void {
    if (!this.currentDbUserId) {
      this.error = "Erreur: Utilisateur non connecté ou non trouvé en BD.";
      return;
    }
    if (reservation.id == null) return;
    
    const updatePayload = {
      userId: this.currentDbUserId,
      salleNum: reservation.salleNum,
      reservationDate: reservation.reservationDate,
      status: 'PENDING' as any,
      notes: reservation.notes
    };

    this.reservationApiService.updateReservation(reservation.id, updatePayload).subscribe({
      next: () => {
        this.fetchReservations();
      },
      error: (err) => {
        this.error = `Erreur réservation: ${err.status} ${err.statusText}`;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'EMPTY':
        return 'status-empty';
      default:
        return 'status-pending';
    }
  }
}
