import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { SidebarItem } from '../layout/sidebar/sidebar.component';
import { UserApiService, CreateUserPayload, UserDto } from '../services/user-api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit, OnDestroy {
  private static readonly STRONG_PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
    { label: 'Cours', route: ['/admin', 'cours'] },
    { label: 'Events', route: ['/admin', 'events'] },
    { label: 'Add Event', route: ['/admin', 'events', 'add'] },
    { label: 'Clubs', route: ['/admin', 'clubs'] }
  ];

  users: UserDto[] = [];
  loading = false;
  showCreateForm = false;
  error = '';
  searchQuery = '';
  createPasswordError = '';
  editPasswordError = '';

  newUser: CreateUserPayload = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'USER',
    birthday: ''
  };

  editingUser: UserDto | null = null;

  private readonly searchInput$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly userApiService: UserApiService) {}

  ngOnInit(): void {
    this.loading = true;
    this.searchInput$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => {
          this.loading = true;
          this.error = '';
          return this.userApiService.getUsers(q);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (users) => {
          this.users = users;
          this.loading = false;
        },
        error: () => {
          this.error = 'An error occurred while fetching users.';
          this.loading = false;
        }
      });
    this.searchInput$.next(this.searchQuery);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchQueryChange(): void {
    this.searchInput$.next(this.searchQuery);
  }

  fetchUsers(): void {
    this.loading = true;
    this.error = '';
    this.userApiService.getUsers(this.searchQuery).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.error = 'An error occurred while fetching users.';
        this.loading = false;
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.fetchUsers();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  createUser(): void {
    this.error = '';
    this.createPasswordError = '';
    if (!this.isStrongPassword(this.newUser.password)) {
      this.createPasswordError = 'Password must contain letters, numbers and special characters.';
      return;
    }
    this.userApiService.createUser(this.newUser).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.newUser = {
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          role: 'USER',
          birthday: ''
        };
        this.fetchUsers();
      },
      error: () => {
        this.error = 'An error occurred while creating the user.';
      }
    });
  }

  startEdit(user: UserDto): void {
    this.error = '';
    this.editPasswordError = '';
    if (user.id == null) {
      this.error = 'An error occurred while editing the user.';
      return;
    }
    this.showCreateForm = false;
    this.editingUser = {
      ...user,
      password: '',
      role: (user.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN'
    };
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.editPasswordError = '';
  }

  saveEdit(): void {
    const u = this.editingUser;
    if (u == null || u.id == null) {
      return;
    }
    const id = u.id;
    this.error = '';
    this.editPasswordError = '';
    const trimmedPassword = u.password?.trim() ?? '';
    if (trimmedPassword && !this.isStrongPassword(trimmedPassword)) {
      this.editPasswordError = 'New password must contain letters, numbers and special characters.';
      return;
    }
    this.userApiService
      .updateUser(id, {
        firstname: u.firstname,
        lastname: u.lastname,
        email: u.email,
        role: (u.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN',
        password: trimmedPassword ? trimmedPassword : undefined
      })
      .subscribe({
        next: () => {
          this.editingUser = null;
          this.fetchUsers();
        },
        error: () => {
          this.error = 'An error occurred while updating the user.';
        }
      });
  }

  onCreatePasswordChange(): void {
    this.createPasswordError = '';
  }

  onEditPasswordChange(): void {
    this.editPasswordError = '';
  }

  private isStrongPassword(password: string): boolean {
    return UsersComponent.STRONG_PASSWORD_REGEX.test(password);
  }

  deleteUser(user: UserDto): void {
    if (user.id == null) {
      this.error = 'An error occurred while deleting the user.';
      return;
    }
    if (
      !confirm(
        `Delete user ${user.firstname} ${user.lastname} (${user.email})?`
      )
    ) {
      return;
    }
    this.error = '';
    this.userApiService.deleteUser(user.id).subscribe({
      next: () => {
        if (this.editingUser?.id === user.id) {
          this.editingUser = null;
        }
        this.fetchUsers();
      },
      error: () => {
        this.error = 'An error occurred while deleting the user.';
      }
    });
  }
}
