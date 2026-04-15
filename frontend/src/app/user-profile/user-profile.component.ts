import { Component, OnInit } from '@angular/core';
import { keycloakService } from '../services/keycloak.service';
import { CurrentUserProfile, UserApiService } from '../services/user-api.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  private static readonly STRONG_PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

  loading = true;
  saving = false;
  error = '';
  success = '';
  passwordError = '';

  form: {
    firstname: string;
    lastname: string;
    email: string;
    birthday: string;
    password: string;
  } = {
    firstname: '',
    lastname: '',
    email: '',
    birthday: '',
    password: ''
  };

  constructor(private readonly userApiService: UserApiService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';
    this.userApiService.getCurrentUser().subscribe({
      next: (me: CurrentUserProfile) => {
        this.form.firstname = me.firstname ?? '';
        this.form.lastname = me.lastname ?? '';
        this.form.email = me.email ?? '';
        this.form.birthday = this.toDateInputValue(me.birthday);
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load your profile.';
        this.loading = false;
      }
    });
  }

  save(): void {
    this.error = '';
    this.success = '';
    this.passwordError = '';
    const trimmedPassword = this.form.password.trim();
    if (trimmedPassword && !UserProfileComponent.STRONG_PASSWORD_REGEX.test(trimmedPassword)) {
      this.passwordError = 'Password must contain letters, numbers and special characters.';
      return;
    }
    this.saving = true;
    this.userApiService
      .updateMyProfile({
        firstname: this.form.firstname.trim(),
        lastname: this.form.lastname.trim(),
        birthday: this.form.birthday ? this.form.birthday : undefined,
        password: trimmedPassword || undefined
      })
      .subscribe({
        next: () => {
          this.success = 'Your profile has been updated successfully.';
          this.form.password = '';
          this.saving = false;
          this.loadProfile();
        },
        error: () => {
          this.error = 'An error occurred while updating your profile.';
          this.saving = false;
        }
      });
  }

  onPasswordChange(): void {
    this.passwordError = '';
  }

  logout(): void {
    keycloakService.logout();
  }

  private toDateInputValue(raw?: string): string {
    if (!raw) {
      return '';
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    return d.toISOString().split('T')[0];
  }
}
