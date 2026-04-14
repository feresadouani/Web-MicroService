import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UsersComponent } from './users/users.component';
import { PostLoginRedirectComponent } from './post-login-redirect/post-login-redirect.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { AdminGuard } from './guards/admin.guard';
import { CoursComponent } from './cours/cours.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PostLoginRedirectComponent
  },
  { path: 'portal', component: UserPortalComponent },
  {
    path: 'admin',
    canActivateChild: [AdminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'cours', component: CoursComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
