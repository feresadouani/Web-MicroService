export interface Event {
  id?: number;
  name: string;
  description: string;
  location: string;
  date: Date;
  isSubscribed?: boolean;
  registeredUsers?: Map<string, string> | { [key: string]: string };
}
