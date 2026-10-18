import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListToolbarChange, ListToolbarComponent } from '../../shared/list-toolbar/list-toolbar.component';
import { applyListView, normalizeListText } from '../../shared/list-utils';
import { ELEVATOR_STATUSES, Elevator } from '../../models/elevator.model';
import { Project } from '../../models/project.model';
import { ElevatorService } from '../../services/elevator.service';
import { ProjectService } from '../../services/project.service';
import { getErrorMessage } from '../../utils/error-message';
import { elevatorBadge, statusLabel } from '../../utils/status-label';

@Component({
  selector: 'app-elevators',
  standalone: true,
  imports: [FormsModule, ListToolbarComponent],
  templateUrl: './elevators.component.html'
})
export class ElevatorsComponent implements OnInit {
  elevators: Elevator[] = [];
  projects: Project[] = [];
  statuses = ELEVATOR_STATUSES;
  form: Elevator = this.emptyForm();
  editingId: string | null = null;
  showForm = false;
  error = '';
  success = '';
  loading = false;
  listView: ListToolbarChange = {
    search: '',
    sortKey: 'reference',
    sortDir: 'asc',
    filters: { status: '', project: '' }
  };

  readonly sortOptions = [
    { value: 'reference', label: 'Reference' },
    { value: 'capacity', label: 'Capacity' },
    { value: 'floors', label: 'Number of floors' },
    { value: 'status', label: 'Status' }
  ];

  get toolbarFilters(): { key: string; label: string; options: { value: string; label: string }[] }[] {
    return [
      {
        key: 'status',
        label: 'Status',
        options: this.statuses.map((status) => ({ value: status, label: statusLabel(status) }))
      },
      {
        key: 'project',
        label: 'Project',
        options: this.projects
          .filter((project): project is Project & { id: string } => Boolean(project.id))
          .map((project) => ({ value: project.id, label: project.name }))
      }
    ];
  }

  get filteredElevators(): Elevator[] {
    const status = this.listView.filters['status'] ?? '';
    const projectId = this.listView.filters['project'] ?? '';
    return applyListView(this.elevators, {
      search: this.listView.search,
      searchFn: (elevator) => [
        elevator.reference, elevator.model, this.projectName(elevator.projectId)
      ].filter(Boolean).join(' '),
      filters: [
        (elevator) => !status || elevator.status === status,
        (elevator) => !projectId || elevator.projectId === projectId
      ],
      sortFn: (a, b) => {
        switch (this.listView.sortKey) {
          case 'capacity':
            return a.capacity - b.capacity;
          case 'floors':
            return a.numberOfFloors - b.numberOfFloors;
          case 'status':
            return this.compareText(a.status, b.status);
          default:
            return this.compareText(a.reference, b.reference);
        }
      },
      sortDir: this.listView.sortDir
    });
  }

  constructor(
    private elevatorService: ElevatorService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  emptyForm(): Elevator {
    return {
      reference: '',
      model: '',
      capacity: 0,
      numberOfFloors: 0,
      status: 'A_PLANIFIER',
      projectId: '',
      maintenanceIntervalDays: undefined
    };
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.elevatorService.getAll().subscribe({
      next: (data) => {
        this.elevators = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.loading = false;
      }
    });
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  projectName(id: string): string {
    return this.projects.find((item) => item.id === id)?.name || id;
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
    this.success = '';
  }

  openEdit(elevator: Elevator): void {
    this.editingId = elevator.id || null;
    this.form = { ...elevator };
    this.showForm = true;
    this.success = '';
  }

  cancel(): void {
    this.showForm = false;
  }

  save(): void {
    this.error = '';
    const elevator: Elevator = {
      ...this.form,
      lastMaintenanceDate: this.form.lastMaintenanceDate || undefined
    };
    const request = this.editingId
      ? this.elevatorService.update(this.editingId, elevator)
      : this.elevatorService.create(elevator);

    request.subscribe({
      next: () => {
        this.success = this.editingId ? 'Elevator updated.' : 'Elevator created.';
        this.showForm = false;
        this.load();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  remove(elevator: Elevator): void {
    if (!elevator.id || !confirm('Delete this elevator and its interventions?')) {
      return;
    }
    this.elevatorService.delete(elevator.id).subscribe({
      next: () => {
        this.success = 'Elevator deleted.';
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
  elevatorBadge = elevatorBadge;
}
