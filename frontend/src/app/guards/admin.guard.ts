import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { keycloakService } from '../services/keycloak.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanActivateChild {
  constructor(private readonly router: Router) {}

  canActivate(): boolean {
    return this.checkAdmin();
  }

  canActivateChild(): boolean {
    return this.checkAdmin();
  }

  private checkAdmin(): boolean {
    if (keycloakService.isAdmin()) {
      return true;
    }
    void this.router.navigate(['/portal'], { replaceUrl: true });
    return false;
  }
}
