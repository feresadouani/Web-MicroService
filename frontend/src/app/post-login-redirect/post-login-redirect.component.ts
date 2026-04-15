import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { keycloakService } from '../services/keycloak.service';

@Component({
  selector: 'app-post-login-redirect',
  template: '',
  styles: []
})
export class PostLoginRedirectComponent implements OnInit {
  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const target = keycloakService.isAdmin()
      ? ['/admin', 'dashboard']
      : ['/portal'];
    void this.router.navigate(target, { replaceUrl: true });
  }
}
