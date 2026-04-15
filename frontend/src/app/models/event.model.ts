export interface Event {
  id?: number;
  name: string;
  description: string;
  location: string;
  date: Date;
  /** Maps Keycloak userId (sub) → display name */
  registeredUsers?: { [userId: string]: string };
}
