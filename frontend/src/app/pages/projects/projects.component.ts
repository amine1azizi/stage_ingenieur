import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { LocationPickerComponent } from '../../shared/location-picker/location-picker.component';
import { ListToolbarChange, ListToolbarComponent } from '../../shared/list-toolbar/list-toolbar.component';
import { applyListView, normalizeListText } from '../../shared/list-utils';
import { Client } from '../../models/client.model';
import { PROJECT_STATUSES, Project } from '../../models/project.model';
import { ClientService } from '../../services/client.service';
import { ProjectService } from '../../services/project.service';
import { getErrorMessage } from '../../utils/error-message';
import { projectBadge, statusLabel } from '../../utils/status-label';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [FormsModule, LocationPickerComponent, RouterLink, ListToolbarComponent],
  templateUrl: './projects.component.html'
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  clients: Client[] = [];
  statuses = PROJECT_STATUSES;
  form: Project = this.emptyForm();
  editingId: string | null = null;
  showForm = false;
  error = '';
  success = '';
  loading = false;
  listView: ListToolbarChange = {
    search: '',
    sortKey: 'name',
    sortDir: 'asc',
    filters: { status: '', client: '' }
  };

  readonly sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'numberOfElevators', label: 'Number of elevators' }
  ];

  get toolbarFilters(): { key: string; label: string; options: { value: string; label: string }[] }[] {
    return [
      {
        key: 'status',
        label: 'Status',
        options: this.statuses.map((status) => ({ value: status, label: statusLabel(status) }))
      },
      {
        key: 'client',
        label: 'Client',
        options: this.clients
          .filter((client): client is Client & { id: string } => Boolean(client.id))
          .map((client) => ({ value: client.id, label: client.name }))
      }
    ];
  }

  get filteredProjects(): Project[] {
    const selectedStatus = this.listView.filters['status'] ?? '';
    const selectedClient = this.listView.filters['client'] ?? '';
    return applyListView(this.projects, {
      search: this.listView.search,
      searchFn: (project) => [project.name, project.address, this.clientName(project.clientId)].filter(Boolean).join(' '),
      filters: [
        (project) => !selectedStatus || project.status === selectedStatus,
        (project) => !selectedClient || project.clientId === selectedClient
      ],
      sortFn: (a, b) => {
        if (this.listView.sortKey === 'status') {
          return this.compareText(a.status, b.status);
        }
        if (this.listView.sortKey === 'numberOfElevators') {
          return a.numberOfElevators - b.numberOfElevators;
        }
        return this.compareText(a.name, b.name);
      },
      sortDir: this.listView.sortDir
    });
  }

  constructor(
    private projectService: ProjectService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
    const editId = this.route.snapshot.queryParamMap.get('edit');
    if (editId) {
      this.projectService.getById(editId).subscribe({
        next: (project) => this.openEdit(project),
        error: (err) => {
          this.error = getErrorMessage(err);
          void this.router.navigate(['/projects']);
        }
      });
    }
  }

  emptyForm(): Project {
    return {
      name: '',
      address: '',
      clientId: '',
      status: 'PLANIFIE',
      numberOfElevators: 0,
      latitude: null,
      longitude: null
    };
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.loading = false;
      }
    });
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  clientName(id: string): string {
    return this.clients.find((item) => item.id === id)?.name || id;
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
    this.success = '';
  }

  openEdit(project: Project): void {
    this.editingId = project.id || null;
    this.form = { ...project };
    this.showForm = true;
    this.success = '';
  }

  cancel(): void {
    this.showForm = false;
  }

  onLocationChange(location: { latitude: number; longitude: number } | null): void {
    this.form.latitude = location?.latitude ?? null;
    this.form.longitude = location?.longitude ?? null;
  }

  save(): void {
    this.error = '';
    const request = this.editingId
      ? this.projectService.update(this.editingId, this.form)
      : this.projectService.create(this.form);

    request.subscribe({
      next: () => {
        const wasEditing = Boolean(this.editingId);
        this.success = this.editingId ? 'Project updated.' : 'Project created.';
        this.showForm = false;
        if (wasEditing && this.route.snapshot.queryParamMap.has('edit')) {
          void this.router.navigate(['/projects']);
        }
        this.load();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  remove(project: Project): void {
    if (!project.id || !confirm('Delete this project and all its elevators and interventions?')) {
      return;
    }
    this.projectService.delete(project.id).subscribe({
      next: () => {
        this.success = 'Project deleted.';
        this.load();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  onListViewChange(change: ListToolbarChange): void {
    this.listView = change;
  }

  private compareText(first: string, second: string): number {
    return normalizeListText(first).localeCompare(normalizeListText(second));
  }

  statusLabel = statusLabel;
  projectBadge = projectBadge;
}
