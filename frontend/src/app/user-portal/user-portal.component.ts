import { Component } from '@angular/core';
import { keycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-user-portal',
  templateUrl: './user-portal.component.html',
  styleUrl: './user-portal.component.css'
})
export class UserPortalComponent {
  readonly isClientUser = keycloakService.isClientUser();

  logout(): void {
    keycloakService.logout();
  }
}
