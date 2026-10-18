import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListToolbarChange, ListToolbarComponent } from '../../shared/list-toolbar/list-toolbar.component';
import { applyListView, normalizeListText } from '../../shared/list-utils';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule, ListToolbarComponent],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  form: Client = this.emptyForm();
  editingId: string | null = null;
  showForm = false;
  error = '';
  success = '';
  loading = false;
  listView: ListToolbarChange = { search: '', sortKey: 'name', sortDir: 'asc', filters: {} };

  readonly sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' }
  ];

  get filteredClients(): Client[] {
    return applyListView(this.clients, {
      search: this.listView.search,
      searchFn: (client) => [client.name, client.email, client.phone, client.address].filter(Boolean).join(' '),
      filters: [],
      sortFn: (a, b) => this.compareText(
        this.listView.sortKey === 'email' ? a.email : a.name,
        this.listView.sortKey === 'email' ? b.email : b.name
      ),
      sortDir: this.listView.sortDir
    });
  }

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.load();
  }

  emptyForm(): Client {
    return { name: '', phone: '', email: '', address: '' };
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients = data;
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

  openEdit(client: Client): void {
    this.editingId = client.id || null;
    this.form = { ...client };
    this.showForm = true;
    this.success = '';
  }

  cancel(): void {
    this.showForm = false;
  }

  save(): void {
    this.error = '';
    const request = this.editingId
      ? this.clientService.update(this.editingId, this.form)
      : this.clientService.create(this.form);

    request.subscribe({
      next: () => {
        this.success = this.editingId ? 'Client updated.' : 'Client created.';
        this.showForm = false;
        this.load();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  remove(client: Client): void {
    if (!client.id || !confirm('Delete this client?')) {
      return;
    }
    this.clientService.delete(client.id).subscribe({
      next: () => {
        this.success = 'Client deleted.';
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
