import { Component, OnInit } from '@angular/core';
import { SidebarItem } from '../layout/sidebar/sidebar.component';
import { UserApiService, CreateUserPayload, UserDto } from '../services/user-api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
  ];

  users: UserDto[] = [];
  loading = false;
  showCreateForm = false;
  error = '';

  newUser: CreateUserPayload = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'USER'
  };

  /** Formulaire d’édition (PATCH merge-patch sur /users/{id}) */
  editingUser: UserDto | null = null;

  constructor(private readonly userApiService: UserApiService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.error = '';
    this.userApiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Erreur chargement users: ${err.status} ${err.statusText}`;
        this.loading = false;
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  createUser(): void {
    this.error = '';
    this.userApiService.createUser(this.newUser).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.newUser = {
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          role: 'USER'
        };
        this.fetchUsers();
      },
      error: (err) => {
        this.error = `Erreur création user: ${err.status} ${err.statusText}`;
      }
    });
  }

  startEdit(user: UserDto): void {
    this.error = '';
    if (user.id == null) {
      this.error = 'Impossible de modifier : identifiant manquant.';
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
  }

  saveEdit(): void {
    const u = this.editingUser;
    if (u == null || u.id == null) {
      return;
    }
    const id = u.id;
    this.error = '';
    this.userApiService
      .updateUser(id, {
        firstname: u.firstname,
        lastname: u.lastname,
        email: u.email,
        role: (u.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN',
        password: u.password?.trim() ? u.password : undefined
      })
      .subscribe({
        next: () => {
          this.editingUser = null;
          this.fetchUsers();
        },
        error: (err) => {
          this.error = `Erreur mise à jour user: ${err.status} ${err.statusText}`;
        }
      });
  }

  deleteUser(user: UserDto): void {
    if (user.id == null) {
      this.error = 'Impossible de supprimer : identifiant manquant.';
      return;
    }
    if (
      !confirm(
        `Supprimer l’utilisateur ${user.firstname} ${user.lastname} (${user.email}) ?`
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
      error: (err) => {
        this.error = `Erreur suppression user: ${err.status} ${err.statusText}`;
      }
    });
  }
}
