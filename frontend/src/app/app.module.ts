import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { UsersComponent } from './users/users.component';
import { PostLoginRedirectComponent } from './post-login-redirect/post-login-redirect.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CoursComponent } from './cours/cours.component';
import { UserEventsComponent } from './user-events/user-events.component';
import { AddEventComponent } from './admin-dashboard/add-event/add-event.component';
import { AdminEventsComponent } from './admin-dashboard/admin-events/admin-events.component';
import { CourseDetailsComponent } from './course-details/course-details.component';
import { UserCoursesComponent } from './user-courses/user-courses.component';
import { AddReclamationComponent } from './reclamations/add-reclamation/add-reclamation.component';
import { AdminReclamationsComponent } from './admin-dashboard/admin-reclamations/admin-reclamations.component';
import { MyReclamationsComponent } from './reclamations/my-reclamations/my-reclamations.component';
import { EditReclamationComponent } from './reclamations/edit-reclamation/edit-reclamation.component';
import { AdminReclamationDetailComponent } from './admin-dashboard/admin-reclamation-detail/admin-reclamation-detail.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {ReservationsComponent} from './reservations/reservations.component';
import { UserReservationsComponent } from './user-reservations/user-reservations.component';
import { UserNavbarComponent } from './layout/user-navbar/user-navbar.component';
@NgModule({
  declarations: [
    AppComponent,
    AdminDashboardComponent,
    UsersComponent,
    CoursComponent,
    ReservationsComponent,

    PostLoginRedirectComponent,
    UserPortalComponent,
    UserProfileComponent,
    UserEventsComponent,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
    AddEventComponent,
    AdminEventsComponent,
    UserReservationsComponent,
    AdminEventsComponent,
    AddReclamationComponent,
    AdminReclamationsComponent,
    MyReclamationsComponent,
    EditReclamationComponent,
    AdminReclamationDetailComponent,
    AdminEventsComponent,
    CourseDetailsComponent,
    UserCoursesComponent,
    UserNavbarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
  bootstrap: [AppComponent]
})
export class AppModule { }
