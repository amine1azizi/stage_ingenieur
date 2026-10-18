import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ELEVATOR_STATUSES, Elevator } from '../../models/elevator.model';
import { MAINTENANCE_REQUEST_STATUSES, MaintenanceRequest } from '../../models/maintenance-request.model';
import { ListToolbarChange, ListToolbarComponent } from '../../shared/list-toolbar/list-toolbar.component';
import { applyListView } from '../../shared/list-utils';
import { ClientPortalService } from '../../services/client-portal.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [FormsModule, DatePipe, ListToolbarComponent],
  templateUrl: './client-portal.component.html'
})
export class ClientPortalComponent implements OnInit {
  elevators: Elevator[] = [];
  requests: MaintenanceRequest[] = [];
  elevatorId = '';
  description = '';
  error = '';
  success = '';
  loading = false;
  submitting = false;
  elevatorListView: ListToolbarChange = {
    search: '',
    sortKey: '',
    sortDir: 'asc',
    filters: { status: '' }
  };
  requestListView: ListToolbarChange = {
    search: '',
    sortKey: '',
    sortDir: 'asc',
    filters: { status: '' }
  };
  readonly elevatorToolbarFilters = [{
    key: 'status',
    label: 'Status',
    options: ELEVATOR_STATUSES.map((status) => ({ value: status, label: status.replaceAll('_', ' ') }))
  }];
  readonly requestToolbarFilters = [{
    key: 'status',
    label: 'Status',
    options: MAINTENANCE_REQUEST_STATUSES.map((status) => ({ value: status, label: status.replaceAll('_', ' ') }))
  }];

  get filteredElevators(): Elevator[] {
    const status = this.elevatorListView.filters['status'] ?? '';
    return applyListView(this.elevators, {
      search: this.elevatorListView.search,
      searchFn: (elevator) => [elevator.reference, elevator.model].filter(Boolean).join(' '),
      filters: [(elevator) => !status || elevator.status === status],
      sortDir: 'asc'
    });
  }

  get filteredRequests(): MaintenanceRequest[] {
    const status = this.requestListView.filters['status'] ?? '';
    return applyListView(this.requests, {
      search: this.requestListView.search,
      searchFn: (request) => [this.elevatorName(request.elevatorId), request.description].join(' '),
      filters: [(request) => !status || request.status === status],
      sortDir: 'asc'
    });
  }

  constructor(private portalService: ClientPortalService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.portalService.getElevators().subscribe({
      next: (elevators) => {
        this.elevators = elevators;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.loading = false;
      }
    });
    this.portalService.getRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  submit(): void {
    this.error = '';
    this.success = '';
    this.submitting = true;
    this.portalService.createRequest(this.elevatorId, this.description).subscribe({
      next: () => {
        this.description = '';
        this.success = 'Maintenance request submitted.';
        this.submitting = false;
        this.load();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.submitting = false;
      }
    });
  }

  elevatorName(id: string): string {
    return this.elevators.find((elevator) => elevator.id === id)?.reference || id;
  }

  onElevatorListViewChange(change: ListToolbarChange): void {
    this.elevatorListView = change;
  }

  onRequestListViewChange(change: ListToolbarChange): void {
    this.requestListView = change;
  }
}
