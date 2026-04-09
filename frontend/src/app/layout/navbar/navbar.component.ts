import { Component, HostListener, Input } from '@angular/core';
import { keycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() userName = 'Account';
  @Input() userEmail = 'account@example.com';

  accountDropdownOpen = false;
  searchQuery = '';

  toggleAccountDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.accountDropdownOpen = !this.accountDropdownOpen;
  }

  closeAccountDropdown(): void {
    this.accountDropdownOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAccountDropdown();
  }

  logout(): void {
    this.closeAccountDropdown();
    keycloakService.logout();
  }
}
