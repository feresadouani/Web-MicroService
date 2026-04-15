import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UsersComponent } from './users/users.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { PostLoginRedirectComponent } from './post-login-redirect/post-login-redirect.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminGuard } from './guards/admin.guard';
import { AddEventComponent } from './admin-dashboard/add-event/add-event.component';
import { AdminEventsComponent } from './admin-dashboard/admin-events/admin-events.component';
import { CoursComponent } from './cours/cours.component';
import { UserReservationsComponent } from './user-reservations/user-reservations.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PostLoginRedirectComponent
  },
  { path: 'portal', component: UserPortalComponent },
  { path: 'portal/profile', component: UserProfileComponent },
  { path: 'events', component: UserPortalComponent },
  { path: 'reservations', component: UserReservationsComponent },
  {
    path: 'admin',
    canActivateChild: [AdminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'cours', component: CoursComponent },
      { path: 'events', component: AdminEventsComponent },
      { path: 'events/add', component: AddEventComponent },
      { path: 'reservations', component: ReservationsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
