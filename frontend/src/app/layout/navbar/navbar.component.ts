import { Component, HostListener } from '@angular/core';
import { keycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  get isAdmin(): boolean {
    return keycloakService.isAdmin();
  }

  get userName(): string {
    const p = keycloakService.profile as Record<string, unknown> | undefined;
    if (!p) {
      return 'User';
    }
    const name = p['name'];
    if (typeof name === 'string' && name.trim()) {
      return name.trim();
    }
    const given = p['given_name'];
    const family = p['family_name'];
    const parts = [given, family].filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    if (parts.length) {
      return parts.join(' ').trim();
    }
    const preferred = p['preferred_username'];
    if (typeof preferred === 'string' && preferred.trim()) {
      return preferred.trim();
    }
    return 'User';
  }

  get userEmail(): string {
    const p = keycloakService.profile as Record<string, unknown> | undefined;
    if (!p) {
      return '';
    }
    const email = p['email'];
    if (typeof email === 'string' && email.trim()) {
      return email.trim();
    }
    return '';
  }

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
