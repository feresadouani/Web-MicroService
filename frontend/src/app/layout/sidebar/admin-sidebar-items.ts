import { SidebarItem } from './sidebar.component';

export const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Dashboard', route: ['/admin', 'dashboard'] },
  { label: 'Users', route: ['/admin', 'users'] },
  { label: 'Cours', route: ['/admin', 'cours'] },
  { label: 'Events', route: ['/admin', 'events'] },
  { label: 'Add Event', route: ['/admin', 'events', 'add'] },
  { label: 'Clubs', route: ['/admin', 'clubs'] },
  { label: 'Reservations', route: ['/admin', 'reservations'] },
  { label: 'Reclamations', route: ['/admin', 'reclamations'] }
];
