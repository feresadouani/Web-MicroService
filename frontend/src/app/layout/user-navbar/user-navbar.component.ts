import { Component, Input } from '@angular/core';
import { keycloakService } from '../../services/keycloak.service';

type UserNavKey =
  | 'home'
  | 'courses'
  | 'events'
  | 'reservations'
  | 'reclamations'
  | 'profile'
  | '';

@Component({
  selector: 'app-user-navbar',
  templateUrl: './user-navbar.component.html',
  styleUrl: './user-navbar.component.css'
})
export class UserNavbarComponent {
  @Input() active: UserNavKey = '';
  @Input() showSectionLinks = false;
  readonly showAdminDashboard = keycloakService.isAdmin();

  isActive(key: UserNavKey): boolean {
    return this.active === key;
  }

  logout(): void {
    keycloakService.logout();
  }
}
