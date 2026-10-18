import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ListToolbarChange, ListToolbarComponent } from '../../shared/list-toolbar/list-toolbar.component';
import { applyListView, normalizeListText } from '../../shared/list-utils';
import { Elevator } from '../../models/elevator.model';
import { INTERVENTION_STATUSES, Intervention } from '../../models/intervention.model';
import { Technician } from '../../models/technician.model';
import { ElevatorService } from '../../services/elevator.service';
import { InterventionService } from '../../services/intervention.service';
import { TechnicianService } from '../../services/technician.service';
import { getErrorMessage } from '../../utils/error-message';
import { interventionBadge, statusLabel } from '../../utils/status-label';

@Component({
  selector: 'app-interventions',
  standalone: true,
  imports: [FormsModule, ListToolbarComponent],
  templateUrl: './interventions.component.html'
})
export class InterventionsComponent implements OnInit {
  interventions: Intervention[] = [];
  elevators: Elevator[] = [];
  technicians: Technician[] = [];
  statuses = INTERVENTION_STATUSES;
  form: Intervention = this.emptyForm();
  editingId: string | null = null;
  showForm = false;
  error = '';
  success = '';
  loading = false;
  listView: ListToolbarChange = {
    search: '',
    sortKey: 'date',
    sortDir: 'desc',
    filters: { status: '', technician: '', type: '' }
  };

  readonly sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'status', label: 'Status' }
  ];

  get toolbarFilters(): { key: string; label: string; options: { value: string; label: string }[] }[] {
    const types = [...new Set(this.interventions.map((item) => item.type?.trim()).filter((type): type is string => Boolean(type)))];
    return [
      {
        key: 'status',
        label: 'Status',
        options: this.statuses.map((status) => ({ value: status, label: statusLabel(status) }))
      },
      {
        key: 'technician',
        label: 'Technician',
        options: this.technicians
          .filter((technician): technician is Technician & { id: string } => Boolean(technician.id))
          .map((technician) => ({ value: technician.id, label: technician.name }))
      },
      {
        key: 'type',
        label: 'Type',
        options: types.map((type) => ({ value: type, label: type }))
      }
    ];
  }

  get filteredInterventions(): Intervention[] {
    const { status = '', technician = '', type = '' } = this.listView.filters;
    return applyListView(this.interventions, {
      search: this.listView.search,
      searchFn: (item) => [
        item.description, item.type, this.elevatorName(item.elevatorId), this.technicianName(item.technicianId)
      ].filter(Boolean).join(' '),
      filters: [
        (item) => !status || item.status === status,
        (item) => !technician || item.technicianId === technician,
        (item) => !type || item.type === type
      ],
      sortFn: (a, b) => this.listView.sortKey === 'status'
        ? normalizeListText(a.status).localeCompare(normalizeListText(b.status))
        : (a.date ?? '').localeCompare(b.date ?? ''),
      sortDir: this.listView.sortDir
    });
  }

  constructor(
    private interventionService: InterventionService,
    private elevatorService: ElevatorService,
    private technicianService: TechnicianService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const elevatorId = this.route.snapshot.queryParamMap.get('elevatorId');
    if (elevatorId) {
      this.form = { ...this.emptyForm(), elevatorId };
      this.showForm = true;
    }
    this.load();
  }

  emptyForm(): Intervention {
    return {
      elevatorId: '',
      technicianId: '',
      type: '',
      description: '',
      date: '',
      status: 'PLANIFIEE'
    };
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.interventionService.getAll().subscribe({
      next: (data) => {
        this.interventions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.loading = false;
      }
    });
    this.elevatorService.getAll().subscribe({
      next: (data) => {
        this.elevators = data;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
    this.technicianService.getAll().subscribe({
      next: (data) => {
        this.technicians = data;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  elevatorName(id: string): string {
    return this.elevators.find((item) => item.id === id)?.reference || id;
  }

  technicianName(id: string): string {
    return this.technicians.find((item) => item.id === id)?.name || id;
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
    this.success = '';
  }

  openEdit(intervention: Intervention): void {
    this.editingId = intervention.id || null;
    this.form = { ...intervention };
    this.showForm = true;
    this.success = '';
  }

  cancel(): void {
    this.showForm = false;
  }

  save(): void {
    this.error = '';
    const request = this.editingId
      ? this.interventionService.update(this.editingId, this.form)
      : this.interventionService.create(this.form);

    request.subscribe({
      next: () => {
        this.success = this.editingId ? 'Intervention updated.' : 'Intervention created.';
        this.showForm = false;
        this.load();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  remove(intervention: Intervention): void {
    if (!intervention.id || !confirm('Delete this intervention?')) {
      return;
    }
    this.interventionService.delete(intervention.id).subscribe({
      next: () => {
        this.success = 'Intervention deleted.';
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

  statusLabel = statusLabel;
  interventionBadge = interventionBadge;
}
