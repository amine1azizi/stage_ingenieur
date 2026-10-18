import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListToolbarChange, ListToolbarComponent } from '../../shared/list-toolbar/list-toolbar.component';
import { applyListView, normalizeListText } from '../../shared/list-utils';
import { Technician } from '../../models/technician.model';
import { TechnicianService } from '../../services/technician.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-technicians',
  standalone: true,
  imports: [FormsModule, ListToolbarComponent],
  templateUrl: './technicians.component.html'
})
export class TechniciansComponent implements OnInit {
  technicians: Technician[] = [];
  form: Technician = this.emptyForm();
  editingId: string | null = null;
  showForm = false;
  error = '';
  success = '';
  loading = false;
  listView: ListToolbarChange = { search: '', sortKey: 'name', sortDir: 'asc', filters: { specialty: '' } };

  readonly sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'specialty', label: 'Specialty' }
  ];

  get specialtyOptions(): { value: string; label: string }[] {
    const unique = new Map<string, string>();
    for (const technician of this.technicians) {
      const specialty = technician.specialty?.trim();
      if (specialty) {
        const normalized = normalizeListText(specialty);
        if (!unique.has(normalized)) {
          unique.set(normalized, specialty);
        }
      }
    }
    return [...unique.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }));
  }

  get toolbarFilters(): { key: string; label: string; options: { value: string; label: string }[] }[] {
    return [{ key: 'specialty', label: 'Specialty', options: this.specialtyOptions }];
  }

  get filteredTechnicians(): Technician[] {
    const selectedSpecialty = this.listView.filters['specialty'] ?? '';
    return applyListView(this.technicians, {
      search: this.listView.search,
      searchFn: (technician) => [
        technician.name, technician.email, technician.phone, technician.specialty
      ].filter(Boolean).join(' '),
      filters: [
        (technician) => !selectedSpecialty ||
          normalizeListText(technician.specialty ?? '') === selectedSpecialty
      ],
      sortFn: (a, b) => this.compareText(
        this.listView.sortKey === 'specialty' ? a.specialty : a.name,
        this.listView.sortKey === 'specialty' ? b.specialty : b.name
      ),
      sortDir: this.listView.sortDir
    });
  }

  constructor(private technicianService: TechnicianService) {}

  ngOnInit(): void {
    this.load();
  }

  emptyForm(): Technician {
    return { name: '', phone: '', email: '', specialty: '' };
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.technicianService.getAll().subscribe({
      next: (data) => {
        this.technicians = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
    this.success = '';
  }

  openEdit(technician: Technician): void {
    this.editingId = technician.id || null;
    this.form = { ...technician };
    this.showForm = true;
    this.success = '';
  }

  cancel(): void {
    this.showForm = false;
  }

  save(): void {
    this.error = '';
    const request = this.editingId
      ? this.technicianService.update(this.editingId, this.form)
      : this.technicianService.create(this.form);

    request.subscribe({
      next: () => {
        this.success = this.editingId ? 'Technician updated.' : 'Technician created.';
        this.showForm = false;
        this.load();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  remove(technician: Technician): void {
    if (!technician.id || !confirm('Delete this technician?')) {
      return;
    }
    this.technicianService.delete(technician.id).subscribe({
      next: () => {
        this.success = 'Technician deleted.';
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

  private compareText(first: string | undefined, second: string | undefined): number {
    return normalizeListText(first ?? '').localeCompare(normalizeListText(second ?? ''));
  }
}
