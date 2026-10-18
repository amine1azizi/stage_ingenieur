import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../models/client.model';
import { Elevator } from '../../models/elevator.model';
import {
  MAINTENANCE_REQUEST_STATUSES,
  MaintenanceRequest,
  MaintenanceRequestStatus
} from '../../models/maintenance-request.model';
import { ClientService } from '../../services/client.service';
import { ClientPortalService } from '../../services/client-portal.service';
import { ElevatorService } from '../../services/elevator.service';
import { getErrorMessage } from '../../utils/error-message';
import { ListToolbarChange, ListToolbarComponent } from '../../shared/list-toolbar/list-toolbar.component';
import { applyListView } from '../../shared/list-utils';

@Component({
  selector: 'app-maintenance-requests',
  standalone: true,
  imports: [DatePipe, FormsModule, ListToolbarComponent],
  templateUrl: './maintenance-requests.component.html'
})
export class MaintenanceRequestsComponent implements OnInit {
  requests: MaintenanceRequest[] = [];
  clients: Client[] = [];
  elevators: Elevator[] = [];
  statuses = MAINTENANCE_REQUEST_STATUSES;
  error = '';
  success = '';
  loading = false;
  listView: ListToolbarChange = {
    search: '',
    sortKey: 'date',
    sortDir: 'desc',
    filters: { status: '' }
  };

  readonly sortOptions = [{ value: 'date', label: 'Date submitted' }];
  readonly toolbarFilters = [{
    key: 'status',
    label: 'Status',
    options: MAINTENANCE_REQUEST_STATUSES.map((status) => ({
      value: status,
      label: status.replaceAll('_', ' ')
    }))
  }];

  get filteredRequests(): MaintenanceRequest[] {
    const status = this.listView.filters['status'] ?? '';
    return applyListView(this.requests, {
      search: this.listView.search,
      searchFn: (request) => [
        this.clientName(request.clientId),
        this.elevatorName(request.elevatorId),
        request.description
      ].join(' '),
      filters: [(request) => !status || request.status === status],
      sortFn: (a, b) => a.createdAt.localeCompare(b.createdAt),
      sortDir: this.listView.sortDir
    });
  }

  constructor(
    private portalService: ClientPortalService,
    private clientService: ClientService,
    private elevatorService: ElevatorService
  ) {}

  ngOnInit(): void {
    this.load();
    this.clientService.getAll().subscribe({
      next: (clients) => this.clients = clients,
      error: (err) => this.error = getErrorMessage(err)
    });
    this.elevatorService.getAll().subscribe({
      next: (elevators) => this.elevators = elevators,
      error: (err) => this.error = getErrorMessage(err)
    });
  }

  load(): void {
    this.loading = true;
    this.portalService.getAllRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  onListViewChange(change: ListToolbarChange): void {
    this.listView = change;
  }

  clientName(id: string): string {
    return this.clients.find((client) => client.id === id)?.name || id;
  }

  elevatorName(id: string): string {
    return this.elevators.find((elevator) => elevator.id === id)?.reference || id;
  }

  updateStatus(request: MaintenanceRequest, status: MaintenanceRequestStatus): void {
    this.error = '';
    this.success = '';
    this.portalService.updateStatus(request.id, status).subscribe({
      next: () => {
        this.success = 'Request status updated.';
        this.load();
      },
      error: (err) => this.error = getErrorMessage(err)
    });
  }

  onStatusChange(request: MaintenanceRequest, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as MaintenanceRequestStatus;
    if (this.statuses.includes(status)) {
      this.updateStatus(request, status);
    }
  }

  remove(request: MaintenanceRequest): void {
    if (!confirm('Delete this maintenance request?')) {
      return;
    }
    this.portalService.deleteRequest(request.id).subscribe({
      next: () => {
        this.success = 'Maintenance request deleted.';
        this.load();
      },
      error: (err) => this.error = getErrorMessage(err)
    });
  }
}
