import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

export type JwtUser = {
  sub: string;
  email?: string;
  preferredUsername?: string;
  roles: string[];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const issuer =
      process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8080/realms/spring';
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${issuer}/protocol/openid-connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer,
      algorithms: ['RS256'],
    });
  }

  validate(payload: Record<string, unknown>): JwtUser {
    const roles = new Set<string>();
    const realmAccess = payload['realm_access'] as { roles?: string[] } | undefined;
    for (const r of realmAccess?.roles ?? []) {
      roles.add(String(r).toUpperCase().replace(/-/g, '_'));
    }
    const resourceAccess = payload['resource_access'] as
      | Record<string, { roles?: string[] }>
      | undefined;
    if (resourceAccess) {
      for (const client of Object.values(resourceAccess)) {
        for (const r of client?.roles ?? []) {
          roles.add(String(r).toUpperCase().replace(/-/g, '_'));
        }
      }
    }
    return {
      sub: String(payload['sub'] ?? ''),
      email: payload['email'] as string | undefined,
      preferredUsername: payload['preferred_username'] as string | undefined,
      roles: [...roles],
    };
  }
}
