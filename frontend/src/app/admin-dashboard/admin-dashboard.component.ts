import { Component, OnInit } from '@angular/core';
import { SidebarItem } from '../layout/sidebar/sidebar.component';
import { UserApiService } from '../services/user-api.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  userMiniStatCount: number | null = null;
  userMiniStatLoading = true;
  userMiniStatError = false;

  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
    { label: 'Events', route: ['/admin', 'events'] },
    { label: 'Reclamations', route: ['/admin', 'reclamations'] },
  ];

  kpis: { title: string; value: string; trend: string; icon: 'building' | 'chart' | 'money' }[] = [
    { title: 'Companies', value: '456', trend: '+8% from last month', icon: 'building' },
    { title: 'Active Deals', value: '89', trend: '+23% from last month', icon: 'chart' },
    { title: 'Revenue', value: '$234,567', trend: '+18% from last month', icon: 'money' }
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

  constructor(private readonly userApi: UserApiService) {}

  ngOnInit(): void {
    this.userApi.getUsers().subscribe({
      next: (users) => {
        this.userMiniStatCount = users.length;
        this.userMiniStatLoading = false;
      },
      error: () => {
        this.userMiniStatError = true;
        this.userMiniStatLoading = false;
      }
    });
  }
}
