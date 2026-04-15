import { Component, OnInit } from '@angular/core';
import { SidebarItem } from '../layout/sidebar/sidebar.component';
import { ReservationApiService, ReservationDto, CreateReservationPayload } from '../services/reservation-api.service';
import { UserApiService, UserDto } from '../services/user-api.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.css'
})
export class ReservationsComponent implements OnInit {
  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
    { label: 'Reservations', route: ['/admin', 'reservations'] }
  ];

  reservations: ReservationDto[] = [];
  users: UserDto[] = [];
  loading = false;
  showCreateForm = false;
  error = '';
  createError = '';
  editError = '';
  searchQuery = '';

  newReservation: CreateReservationPayload = {
    userId: 0,
    salleNum: 0,
    reservationDate: '',
    status: 'EMPTY',
    notes: ''
  };

  currentDbUserId?: number;

  editingReservation: ReservationDto | null = null;

  constructor(
    private readonly reservationApiService: ReservationApiService,
    private readonly userApiService: UserApiService
  ) {}

  ngOnInit(): void {
    this.fetchReservations();
    this.fetchUsers();
    this.userApiService.getCurrentUser().subscribe(user => {
      this.currentDbUserId = user.dbUserId;
    });
  }

  fetchUsers(): void {
    this.userApiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Erreur chargement users:', err);
      }
    });
  }

  fetchReservations(): void {
    this.loading = true;
    this.error = '';
    this.reservationApiService.getReservations(this.searchQuery).subscribe({
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

  clearSearch(): void {
    this.searchQuery = '';
    this.fetchReservations();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  createReservation(): void {
    this.createError = '';
    
    if (!this.newReservation.salleNum || this.newReservation.salleNum <= 0) {
      this.createError = 'La salle num doit être un nombre positif et supérieur à zéro';
      return;
    }

    const exists = this.reservations.some(r => r.salleNum === this.newReservation.salleNum);
    if (exists) {
      this.createError = 'Une réservation pour cette salle (Salle Num: ' + this.newReservation.salleNum + ') existe déjà';
      return;
    }

    const now = new Date();
    // Ajuster pour avoir l'heure locale exacte dans la chaîne ISO
    const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
                            .toISOString()
                            .slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"

    const payload: CreateReservationPayload = {
      ...this.newReservation,
      status: 'EMPTY',
      reservationDate: localDateTime
    };

    this.reservationApiService.createReservation(payload).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.newReservation = {
          userId: 0,
          salleNum: 0,
          reservationDate: '',
          status: 'EMPTY',
          notes: ''
        };
        this.fetchReservations();
      },
      error: (err) => {
        console.error("Full error object: ", err);
        const serverMsg = typeof err.error === 'string' ? err.error : err.message;
        this.createError = `Erreur création réservation: ${err.status} ${err.statusText} - ${serverMsg}`;
      }
    });
  }

  startEdit(reservation: ReservationDto): void {
    this.editError = '';
    if (reservation.id == null) {
      this.error = 'Impossible de modifier : identifiant manquant.';
      return;
    }
    this.showCreateForm = false;
    this.editingReservation = { ...reservation };
  }

  cancelEdit(): void {
    this.editingReservation = null;
  }

  saveEdit(): void {
    const r = this.editingReservation;
    if (r == null || r.id == null) {
      return;
    }
    const id = r.id;
    this.editError = '';
    
    if (!r.salleNum || r.salleNum <= 0) {
      this.editError = 'La salle num doit être un nombre positif et supérieur à zéro';
      return;
    }

    const exists = this.reservations.some(reservation => reservation.salleNum === r.salleNum && reservation.id !== id);
    if (exists) {
      this.editError = 'Une réservation pour cette salle (Salle Num: ' + r.salleNum + ') existe déjà';
      return;
    }

    const updatePayload = {
      userId: r.userId,
      salleNum: r.salleNum,
      reservationDate: r.reservationDate,
      status: r.status,
      notes: r.notes
    };

    this.reservationApiService.updateReservation(id, updatePayload).subscribe({
      next: () => {
        this.editingReservation = null;
        this.fetchReservations();
      },
      error: (err) => {
        this.editError = `Erreur mise à jour réservation: ${err.status} ${err.statusText}`;
      }
    });
  }

  deleteReservation(reservation: ReservationDto): void {
    if (reservation.id == null) {
      this.error = 'Impossible de supprimer : identifiant manquant.';
      return;
    }
    if (!confirm(`Supprimer la réservation pour la salle ${reservation.salleNum} ?`)) {
      return;
    }
    this.error = '';
    this.reservationApiService.deleteReservation(reservation.id).subscribe({
      next: () => {
        if (this.editingReservation?.id === reservation.id) {
          this.editingReservation = null;
        }
        this.fetchReservations();
      },
      error: (err) => {
        this.error = `Erreur suppression réservation: ${err.status} ${err.statusText}`;
      }
    });
  }

  reserveRoom(reservation: ReservationDto): void {
    if (!this.currentDbUserId) {
      this.error = "Erreur: Utilisateur non connecté ou non trouvé en BD.";
      return;
    }
    if (reservation.id == null) return;
    
    // Auto-reserving standard: change status to PENDING and assign to the user
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
      default:
        return 'status-pending';
    }
  }

  getUserFullName(userId: number | undefined): string {
    if (!userId) return '-';
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstname} ${user.lastname}` : `Inconnu (${userId})`;
  }
}
