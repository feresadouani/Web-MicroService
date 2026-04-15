import { Component, OnInit } from '@angular/core';
import { SidebarItem } from '../layout/sidebar/sidebar.component';
import { ADMIN_SIDEBAR_ITEMS } from '../layout/sidebar/admin-sidebar-items';
import {
  CoursApiService,
  CoursDto,
  CreateCoursPayload,
  UpdateCoursPayload
} from '../services/cours-api.service';
import { UserApiService, UserDto } from '../services/user-api.service';

@Component({
  selector: 'app-cours',
  templateUrl: './cours.component.html',
  styleUrl: './cours.component.css'
})
export class CoursComponent implements OnInit {
  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
    { label: 'Cours', route: ['/admin', 'cours'] },
    { label: 'Clubs', route: ['/admin', 'clubs'] }
  ];

  coursList: CoursDto[] = [];
  loading = false;
  showCreateForm = false;
  error = '';
  editingCoursId: number | null = null;
  newModulesInput = '';
  editModulesInput = '';

  professeurDraftByCoursId: Record<number, string> = {};
  moduleDraftByCoursId: Record<number, string> = {};
  etudiantsByCoursId: Record<number, string[]> = {};
  etudiantsLoadingByCoursId: Record<number, boolean> = {};
  etudiantDraftByCoursId: Record<number, string> = {};
  users: UserDto[] = [];
  usersLoading = false;

  editCours: UpdateCoursPayload = {
    title: '',
    content: '',
    author: '',
    category: '',
    professeur: '',
    modules: []
  };

  newCours: CreateCoursPayload = {
    title: '',
    content: '',
    author: '',
    category: '',
    professeur: '',
    modules: []
  };

  constructor(
    private readonly coursApiService: CoursApiService,
    private readonly userApiService: UserApiService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchCours();
  }

  fetchUsers(): void {
    this.usersLoading = true;
    this.userApiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.usersLoading = false;
      },
      error: () => {
        this.usersLoading = false;
      }
    });
  }

  fetchCours(): void {
    this.loading = true;
    this.error = '';
    this.coursApiService.getCours().subscribe({
      next: (cours) => {
        this.coursList = cours;
        this.hydrateEtudiantsCache(cours);
        this.loading = false;
      },
      error: (err) => {
        this.error = `Erreur chargement cours: ${err.status} ${err.statusText}`;
        this.loading = false;
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.cancelEdit();
    }
  }

  createCours(): void {
    this.error = '';
    const payload: CreateCoursPayload = {
      title: this.newCours.title,
      content: this.newCours.content,
      author: this.newCours.author,
      category: this.newCours.category,
      professeur: this.normalizeText(this.newCours.professeur),
      modules: this.normalizeModules(this.newCours.modules)
    };

    this.coursApiService.createCours(payload).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.newCours = {
          title: '',
          content: '',
          author: '',
          category: '',
          professeur: '',
          modules: []
        };
        this.newModulesInput = '';
        this.fetchCours();
      },
      error: (err) => {
        this.error = `Erreur creation cours: ${err.status} ${err.statusText}`;
      }
    });
  }

  startEdit(cours: CoursDto): void {
    if (cours.id == null) {
      this.error = 'Impossible de modifier: identifiant manquant.';
      return;
    }

    this.error = '';
    this.showCreateForm = false;
    this.editingCoursId = cours.id;
    this.editCours = {
      title: cours.title,
      content: cours.content,
      author: cours.author,
      category: cours.category,
      professeur: cours.professeur ?? '',
      modules: cours.modules ?? []
    };

    this.editModulesInput = (cours.modules ?? []).join(', ');
  }

  cancelEdit(): void {
    this.editingCoursId = null;
    this.editCours = {
      title: '',
      content: '',
      author: '',
      category: '',
      professeur: '',
      modules: []
    };
    this.editModulesInput = '';
  }

  saveEdit(): void {
    if (this.editingCoursId == null) {
      return;
    }

    this.error = '';
    const payload: UpdateCoursPayload = {
      title: this.editCours.title,
      content: this.editCours.content,
      author: this.editCours.author,
      category: this.editCours.category,
      professeur: this.normalizeText(this.editCours.professeur),
      modules: this.modulesFromCsv(this.editModulesInput)
    };

    this.coursApiService.updateCours(this.editingCoursId, payload).subscribe({
      next: () => {
        this.cancelEdit();
        this.fetchCours();
      },
      error: (err) => {
        this.error = `Erreur mise a jour cours: ${err.status} ${err.statusText}`;
      }
    });
  }

  deleteCours(cours: CoursDto): void {
    if (cours.id == null) {
      this.error = 'Impossible de supprimer: identifiant manquant.';
      return;
    }
    if (!confirm(`Supprimer le cours "${cours.title}" ?`)) {
      return;
    }
    this.error = '';
    this.coursApiService.deleteCours(cours.id).subscribe({
      next: () => {
        if (this.editingCoursId === cours.id) {
          this.cancelEdit();
        }
        this.fetchCours();
      },
      error: (err) => {
        this.error = `Erreur suppression cours: ${err.status} ${err.statusText}`;
      }
    });
  }

  updateProfesseur(cours: CoursDto): void {
    if (cours.id == null) {
      return;
    }
    const professeur = (this.professeurDraftByCoursId[cours.id] ?? '').trim();
    if (!professeur) {
      this.error = 'Choisissez un professeur avant assignation.';
      return;
    }
    this.error = '';
    this.coursApiService.assignProfesseur(cours.id, professeur).subscribe({
      next: () => this.fetchCours(),
      error: (err) => {
        this.error = `Erreur assignation professeur: ${err.status} ${err.statusText}`;
      }
    });
  }

  addModule(cours: CoursDto): void {
    if (cours.id == null) {
      return;
    }
    const moduleName = this.moduleDraftByCoursId[cours.id] ?? '';
    this.error = '';
    this.coursApiService.addModule(cours.id, moduleName).subscribe({
      next: () => {
        this.moduleDraftByCoursId[cours.id!] = '';
        this.fetchCours();
      },
      error: (err) => {
        this.error = `Erreur ajout module: ${err.status} ${err.statusText}`;
      }
    });
  }

  removeModule(cours: CoursDto, moduleName: string): void {
    if (cours.id == null) {
      return;
    }
    this.error = '';
    this.coursApiService.removeModule(cours.id, moduleName).subscribe({
      next: () => this.fetchCours(),
      error: (err) => {
        this.error = `Erreur suppression module: ${err.status} ${err.statusText}`;
      }
    });
  }

  loadEtudiants(cours: CoursDto): void {
    if (cours.id == null) {
      return;
    }
    this.etudiantsLoadingByCoursId[cours.id] = true;
    this.error = '';
    this.coursApiService.getEtudiantsByCours(cours.id).subscribe({
      next: (etudiants) => {
        this.etudiantsByCoursId[cours.id!] = etudiants;
        this.etudiantsLoadingByCoursId[cours.id!] = false;
      },
      error: (err) => {
        this.error = `Erreur chargement etudiants: ${err.status} ${err.statusText}`;
        this.etudiantsLoadingByCoursId[cours.id!] = false;
      }
    });
  }

  inscrireEtudiant(cours: CoursDto): void {
    if (cours.id == null) {
      return;
    }
    const email = (this.etudiantDraftByCoursId[cours.id] ?? '').trim();
    if (!email) {
      this.error = 'Choisissez un etudiant avant inscription.';
      return;
    }
    this.error = '';
    this.coursApiService.inscrireEtudiant(cours.id, email).subscribe({
      next: (updatedCours) => {
        this.etudiantDraftByCoursId[cours.id!] = '';
        this.applyUpdatedCours(updatedCours);
      },
      error: (err) => {
        this.error = `Erreur inscription etudiant: ${err.status} ${err.statusText}`;
      }
    });
  }

  desinscrireEtudiant(cours: CoursDto, email: string): void {
    if (cours.id == null) {
      return;
    }
    this.error = '';
    this.coursApiService.desinscrireEtudiant(cours.id, email).subscribe({
      next: (updatedCours) => this.applyUpdatedCours(updatedCours),
      error: (err) => {
        this.error = `Erreur desinscription etudiant: ${err.status} ${err.statusText}`;
      }
    });
  }

  onNewModulesInputChange(value: string): void {
    this.newModulesInput = value;
    this.newCours.modules = this.modulesFromCsv(value);
  }

  getModules(cours: CoursDto): string[] {
    return cours.modules ?? [];
  }

  getEtudiants(cours: CoursDto): string[] {
    if (cours.id == null) {
      return cours.enrolledStudents ?? [];
    }
    return this.etudiantsByCoursId[cours.id] ?? cours.enrolledStudents ?? [];
  }

  getProfesseurDraft(cours: CoursDto): string {
    if (cours.id == null) {
      return cours.professeur ?? '';
    }

    if (Object.prototype.hasOwnProperty.call(this.professeurDraftByCoursId, cours.id)) {
      return this.professeurDraftByCoursId[cours.id];
    }
    return cours.professeur ?? '';
  }

  getProfesseurOptions(): UserDto[] {
    return this.users;
  }

  getEtudiantOptions(cours: CoursDto): UserDto[] {
    const enrolled = new Set(this.getEtudiants(cours).map((email) => email.toLowerCase()));
    return this.users.filter((user) => !enrolled.has(user.email.toLowerCase()));
  }

  getUserLabel(user: UserDto): string {
    const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ').trim();
    if (fullName.length > 0) {
      return `${fullName} (${user.email})`;
    }
    return user.email;
  }

  getEtudiantLabel(email: string): string {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? this.getUserLabel(user) : email;
  }

  private modulesFromCsv(csv: string): string[] {
    return csv
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }

  private normalizeText(value: string | undefined): string | undefined {
    if (value == null) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private normalizeModules(modules: string[] | undefined): string[] {
    return (modules ?? []).map((m) => m.trim()).filter((m) => m.length > 0);
  }

  private hydrateEtudiantsCache(coursList: CoursDto[]): void {
    const hydrated: Record<number, string[]> = {};
    for (const cours of coursList) {
      if (cours.id == null) {
        continue;
      }
      hydrated[cours.id] = [...(cours.enrolledStudents ?? [])];
    }
    this.etudiantsByCoursId = hydrated;
  }

  private applyUpdatedCours(updatedCours: CoursDto): void {
    if (updatedCours.id == null) {
      this.fetchCours();
      return;
    }

    const index = this.coursList.findIndex((cours) => cours.id === updatedCours.id);
    if (index >= 0) {
      this.coursList[index] = updatedCours;
    } else {
      this.coursList = [...this.coursList, updatedCours];
    }

    this.etudiantsByCoursId[updatedCours.id] = [...(updatedCours.enrolledStudents ?? [])];
  }
}
