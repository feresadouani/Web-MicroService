import Keycloak from 'keycloak-js';

class KeycloakService {
  private _keycloak!: Keycloak.KeycloakInstance;

  init(): Promise<boolean> {
    this._keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'spring',
      clientId: 'frontend'
    });

    return this._keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256'
    });
  }

  get keycloak() {
    return this._keycloak;
  }

  get token() {
    return this._keycloak.token;
  }

  async getValidToken(): Promise<string | undefined> {
    if (!this._keycloak) {
      return undefined;
    }

    try {
      await this._keycloak.updateToken(30);
      return this._keycloak.token;
    } catch {
      await this.login();
      return undefined;
    }
  }

  isAuthenticated(): boolean {
    return !!this._keycloak?.authenticated;
  }

  login(): Promise<void> {
    return this._keycloak.login({
      redirectUri: 'http://localhost:4200'
    });
  }

  get profile() {
    return this._keycloak.tokenParsed;
  }

  getRoleNames(): string[] {
    const parsed = this._keycloak?.tokenParsed as Record<string, unknown> | undefined;
    if (!parsed) {
      return [];
    }
    const names = new Set<string>();
    const realm = parsed['realm_access'] as { roles?: string[] } | undefined;
    realm?.roles?.forEach((r) => names.add(r));
    const resourceAccess = parsed['resource_access'] as Record<string, { roles?: string[] }> | undefined;
    if (resourceAccess) {
      for (const client of Object.values(resourceAccess)) {
        client?.roles?.forEach((r) => names.add(r));
      }
    }
    return [...names];
  }

  private static readonly KEYCLOAK_ADMIN = 'CLIENT_ADMIN';

  private static readonly KEYCLOAK_USER = 'CLIENT_USER';

  isAdmin(): boolean {
    return this.getRoleNames().some(
      (r) => this.normalizeRoleKey(r) === KeycloakService.KEYCLOAK_ADMIN
    );
  }

  isClientUser(): boolean {
    return this.getRoleNames().some(
      (r) => this.normalizeRoleKey(r) === KeycloakService.KEYCLOAK_USER
    );
  }

  private normalizeRoleKey(role: string): string {
    return role.toUpperCase().replace(/-/g, '_');
  }

  logout() {
    this._keycloak.logout({
      redirectUri: 'http://localhost:4200'
    });
  }
}

export const keycloakService = new KeycloakService();