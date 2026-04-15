import { keycloakService } from './keycloak.service';

describe('KeycloakService', () => {
  it('should expose singleton instance', () => {
    expect(keycloakService).toBeTruthy();
  });
});
