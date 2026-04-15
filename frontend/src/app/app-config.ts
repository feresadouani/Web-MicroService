const origin =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'http://localhost:4200';

export const APP_CONFIG = {
  gatewayBaseUrl: (globalThis as { __env?: { GATEWAY_URL?: string } }).__env?.GATEWAY_URL ?? 'http://localhost:8081',
  keycloakUrl: (globalThis as { __env?: { KEYCLOAK_URL?: string } }).__env?.KEYCLOAK_URL ?? 'http://localhost:8080',
  frontendOrigin: origin
};
