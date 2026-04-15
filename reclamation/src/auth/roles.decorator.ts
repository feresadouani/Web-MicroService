import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/** Rôles Keycloak (ex. CLIENT_ADMIN) — aligné sur realm / client roles */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
