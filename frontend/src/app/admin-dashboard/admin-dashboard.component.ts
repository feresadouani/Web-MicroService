import { Component } from '@angular/core';
import { SidebarItem } from '../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
  ];

  kpis = [
    { title: 'Total Contacts', value: '1,234', trend: '+12% from last month', icon: '👥' },
    { title: 'Companies', value: '456', trend: '+8% from last month', icon: '🏢' },
    { title: 'Active Deals', value: '89', trend: '+23% from last month', icon: '📈' },
    { title: 'Revenue', value: '$234,567', trend: '+18% from last month', icon: '💵' }
  ];

  activities = [
    { title: 'New contact added', description: 'John Doe from Acme Corp', time: '2 hours ago' },
    { title: 'Deal closed', description: '$45,000 deal with Tech Solutions', time: '5 hours ago' },
    { title: 'Task completed', description: 'Follow-up call with Jane Smith', time: '1 day ago' }
  ];

  tasks = [
    { title: 'Call with prospect', date: 'Today at 2:00 PM' },
    { title: 'Send proposal', date: 'Tomorrow at 10:00 AM' },
    { title: 'Review contracts', date: 'Friday at 3:00 PM' }
  ];
}
