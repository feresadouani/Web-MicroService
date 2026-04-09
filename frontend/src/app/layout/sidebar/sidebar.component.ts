import { Component, Input } from '@angular/core';

export interface SidebarItem {
  label: string;
  route?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() title = 'Dashboard Admin';
  @Input() items: SidebarItem[] = [];
}
