import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UsersComponent } from './users/users.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { PostLoginRedirectComponent } from './post-login-redirect/post-login-redirect.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserEventsComponent } from './user-events/user-events.component';
import { AdminGuard } from './guards/admin.guard';
import { AddEventComponent } from './admin-dashboard/add-event/add-event.component';
import { AdminEventsComponent } from './admin-dashboard/admin-events/admin-events.component';
import { CoursComponent } from './cours/cours.component';
import { UserReservationsComponent } from './user-reservations/user-reservations.component';
import { AddReclamationComponent } from './reclamations/add-reclamation/add-reclamation.component';
import { AdminReclamationsComponent } from './admin-dashboard/admin-reclamations/admin-reclamations.component';
import { MyReclamationsComponent } from './reclamations/my-reclamations/my-reclamations.component';
import { EditReclamationComponent } from './reclamations/edit-reclamation/edit-reclamation.component';
import { AdminReclamationDetailComponent } from './admin-dashboard/admin-reclamation-detail/admin-reclamation-detail.component';
import { CourseDetailsComponent } from './course-details/course-details.component';
import { UserCoursesComponent } from './user-courses/user-courses.component';
import { ClubsComponent } from './clubs/clubs.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PostLoginRedirectComponent
  },
  { path: 'portal', component: UserPortalComponent },
  { path: 'event', component: UserEventsComponent },
  { path: 'reclamations', component: MyReclamationsComponent },
  { path: 'reclamations/add', component: AddReclamationComponent },
  { path: 'reclamations/:id/edit', component: EditReclamationComponent },
  { path: 'portal/profile', component: UserProfileComponent },
  { path: 'portal/courses', component: UserCoursesComponent },
  { path: 'portal/cours/:id', component: CourseDetailsComponent },
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
      { path: 'clubs', component: ClubsComponent }
      { path: 'events/add', component: AddEventComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'reclamations', component: AdminReclamationsComponent },
      { path: 'reclamations/:id', component: AdminReclamationDetailComponent },
      { path: 'events/add', component: AddEventComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
