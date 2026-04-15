import { Component, OnInit } from '@angular/core';
import { SidebarItem } from '../layout/sidebar/sidebar.component';
import {
  ClubApiService,
  ClubDto,
  CreateClubPayload,
  CreateMemberPayload,
  MemberDto,
  UpdateClubPayload
} from '../services/club-api.service';

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrl: './clubs.component.css'
})
export class ClubsComponent implements OnInit {
  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: ['/admin', 'dashboard'] },
    { label: 'Users', route: ['/admin', 'users'] },
    { label: 'Cours', route: ['/admin', 'cours'] },
    { label: 'Events', route: ['/admin', 'events'] },
    { label: 'Add Event', route: ['/admin', 'events', 'add'] },
    { label: 'Clubs', route: ['/admin', 'clubs'] }
  ];

  clubs: ClubDto[] = [];
  loading = false;
  error = '';

  showCreateForm = false;
  editingClubId: number | null = null;

  newClub: CreateClubPayload = { name: '', description: '' };
  editClub: UpdateClubPayload = { name: '', description: '' };

  membersByClubId: Record<number, MemberDto[]> = {};
  membersLoadingByClubId: Record<number, boolean> = {};
  memberDraftByClubId: Record<number, CreateMemberPayload> = {};

  constructor(private readonly clubApi: ClubApiService) {}

  ngOnInit(): void {
    this.fetchClubs();
  }

  fetchClubs(): void {
    this.loading = true;
    this.error = '';
    this.clubApi.getClubs().subscribe({
      next: (clubs) => {
        this.clubs = clubs;
        this.hydrateMembersCache(clubs);
        this.loading = false;
      },
      error: (err) => {
        this.error = `Erreur chargement clubs: ${err.status} ${err.statusText}`;
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

  createClub(): void {
    this.error = '';
    const payload: CreateClubPayload = {
      name: this.newClub.name.trim(),
      description: this.newClub.description.trim()
    };
    if (!payload.name || !payload.description) {
      this.error = 'Veuillez renseigner le nom et la description.';
      return;
    }

    this.clubApi.createClub(payload).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.newClub = { name: '', description: '' };
        this.fetchClubs();
      },
      error: (err) => {
        this.error = `Erreur creation club: ${err.status} ${err.statusText}`;
      }
    });
  }

  startEdit(club: ClubDto): void {
    if (club.id == null) {
      this.error = 'Impossible de modifier: identifiant manquant.';
      return;
    }
    this.error = '';
    this.showCreateForm = false;
    this.editingClubId = club.id;
    this.editClub = {
      name: club.name,
      description: club.description
    };
  }

  cancelEdit(): void {
    this.editingClubId = null;
    this.editClub = { name: '', description: '' };
  }

  saveEdit(): void {
    if (this.editingClubId == null) {
      return;
    }
    this.error = '';
    const payload: UpdateClubPayload = {
      name: this.editClub.name.trim(),
      description: this.editClub.description.trim()
    };
    if (!payload.name || !payload.description) {
      this.error = 'Veuillez renseigner le nom et la description.';
      return;
    }

    this.clubApi.updateClub(this.editingClubId, payload).subscribe({
      next: () => {
        this.cancelEdit();
        this.fetchClubs();
      },
      error: (err) => {
        this.error = `Erreur mise a jour club: ${err.status} ${err.statusText}`;
      }
    });
  }

  deleteClub(club: ClubDto): void {
    if (club.id == null) {
      this.error = 'Impossible de supprimer: identifiant manquant.';
      return;
    }
    if (!confirm(`Supprimer le club "${club.name}" ?`)) {
      return;
    }
    this.error = '';
    this.clubApi.deleteClub(club.id).subscribe({
      next: () => {
        if (this.editingClubId === club.id) {
          this.cancelEdit();
        }
        delete this.membersByClubId[club.id!];
        delete this.memberDraftByClubId[club.id!];
        this.fetchClubs();
      },
      error: (err) => {
        this.error = `Erreur suppression club: ${err.status} ${err.statusText}`;
      }
    });
  }

  toggleMembers(club: ClubDto): void {
    if (club.id == null) {
      return;
    }
    const current = this.membersByClubId[club.id];
    if (current != null && current.length > 0) {
      // already loaded; keep UI simple (no collapse state)
      return;
    }
    this.loadMembers(club);
  }

  loadMembers(club: ClubDto): void {
    if (club.id == null) {
      return;
    }
    this.membersLoadingByClubId[club.id] = true;
    this.error = '';
    this.clubApi.getMembers(club.id).subscribe({
      next: (members) => {
        this.membersByClubId[club.id!] = members;
        this.membersLoadingByClubId[club.id!] = false;
      },
      error: (err) => {
        this.error = `Erreur chargement membres: ${err.status} ${err.statusText}`;
        this.membersLoadingByClubId[club.id!] = false;
      }
    });
  }

  getMembers(club: ClubDto): MemberDto[] {
    if (club.id == null) {
      return club.members ?? [];
    }
    return this.membersByClubId[club.id] ?? club.members ?? [];
  }

  getMemberDraft(club: ClubDto): CreateMemberPayload {
    if (club.id == null) {
      return { name: '', email: '' };
    }
    if (!this.memberDraftByClubId[club.id]) {
      this.memberDraftByClubId[club.id] = { name: '', email: '' };
    }
    return this.memberDraftByClubId[club.id];
  }

  addMember(club: ClubDto): void {
    if (club.id == null) {
      return;
    }
    const draft = this.getMemberDraft(club);
    const payload: CreateMemberPayload = {
      name: draft.name.trim(),
      email: draft.email.trim()
    };
    if (!payload.name || !payload.email) {
      this.error = 'Veuillez renseigner le nom et l’email du membre.';
      return;
    }
    this.error = '';
    this.clubApi.addMember(club.id, payload).subscribe({
      next: () => {
        this.memberDraftByClubId[club.id!] = { name: '', email: '' };
        this.loadMembers(club);
      },
      error: (err) => {
        this.error = `Erreur ajout membre: ${err.status} ${err.statusText}`;
      }
    });
  }

  removeMember(club: ClubDto, member: MemberDto): void {
    if (club.id == null || member.id == null) {
      return;
    }
    if (!confirm(`Retirer ${member.name} (${member.email}) du club "${club.name}" ?`)) {
      return;
    }
    this.error = '';
    this.clubApi.removeMember(club.id, member.id).subscribe({
      next: () => this.loadMembers(club),
      error: (err) => {
        this.error = `Erreur suppression membre: ${err.status} ${err.statusText}`;
      }
    });
  }

  private hydrateMembersCache(clubs: ClubDto[]): void {
    const hydrated: Record<number, MemberDto[]> = {};
    for (const club of clubs) {
      if (club.id == null) {
        continue;
      }
      hydrated[club.id] = [...(club.members ?? [])];
    }
    this.membersByClubId = hydrated;
  }
}

