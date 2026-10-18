import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { forkJoin, Subscription } from 'rxjs';
import { Client } from '../../models/client.model';
import { ELEVATOR_STATUSES, Elevator, ElevatorStatus } from '../../models/elevator.model';
import { ListToolbarChange, ListToolbarComponent } from '../../shared/list-toolbar/list-toolbar.component';
import { applyListView, normalizeListText } from '../../shared/list-utils';
import { Project } from '../../models/project.model';
import { ClientService } from '../../services/client.service';
import { ElevatorService } from '../../services/elevator.service';
import { ProjectService } from '../../services/project.service';
import { getErrorMessage } from '../../utils/error-message';
import { elevatorBadge, statusLabel } from '../../utils/status-label';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, ListToolbarComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly elevatorStatuses = ELEVATOR_STATUSES;
  project: Project | null = null;
  client: Client | undefined;
  elevators: Elevator[] = [];
  form = this.emptyElevator();
  editingElevatorId: string | null = null;
  showElevatorForm = false;
  loading = true;
  saving = false;
  notFound = false;
  error = '';
  success = '';
  listView: ListToolbarChange = {
    search: '',
    sortKey: 'reference',
    sortDir: 'asc',
    filters: { status: '' }
  };
  readonly elevatorSortOptions = [
    { value: 'reference', label: 'Reference' },
    { value: 'capacity', label: 'Capacity' },
    { value: 'floors', label: 'Floors' }
  ];
  readonly elevatorToolbarFilters = [{
    key: 'status',
    label: 'Status',
    options: ELEVATOR_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }))
  }];

  @ViewChild('detailMap')
  set detailMapElement(element: ElementRef<HTMLDivElement> | undefined) {
    this.mapElement = element;
    this.initializeMap();
  }

  private mapElement?: ElementRef<HTMLDivElement>;
  private detailMap?: L.Map;
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private elevatorService: ElevatorService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.notFound = true;
        this.loading = false;
        return;
      }
      this.loadProject(id);
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.detailMap?.remove();
    this.detailMap = undefined;
  }

  get elevatorCount(): number {
    return this.elevators.length;
  }

  get filteredElevators(): Elevator[] {
    const status = this.listView.filters['status'] ?? '';
    return applyListView(this.elevators, {
      search: this.listView.search,
      searchFn: (elevator) => [elevator.reference, elevator.model].filter(Boolean).join(' '),
      filters: [(elevator) => !status || elevator.status === status],
      sortFn: (a, b) => {
        switch (this.listView.sortKey) {
          case 'capacity':
            return a.capacity - b.capacity;
          case 'floors':
            return a.numberOfFloors - b.numberOfFloors;
          default:
            return normalizeListText(a.reference).localeCompare(normalizeListText(b.reference));
        }
      },
      sortDir: this.listView.sortDir
    });
  }

  countByStatus(status: ElevatorStatus): number {
    return this.elevators.filter((elevator) => elevator.status === status).length;
  }

  emptyElevator(): Elevator {
    return {
      reference: '',
      model: '',
      capacity: 0,
      numberOfFloors: 0,
      status: 'A_PLANIFIER',
      projectId: this.project?.id ?? ''
    };
  }

  loadProject(id: string): void {
    this.detailMap?.remove();
    this.detailMap = undefined;
    this.project = null;
    this.client = undefined;
    this.elevators = [];
    this.notFound = false;
    this.loading = true;
    this.error = '';
    this.success = '';

    this.projectService.getById(id).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
        this.initializeMap();
        forkJoin({
          elevators: this.elevatorService.getAll(),
          clients: this.clientService.getAll()
        }).subscribe({
          next: ({ elevators, clients }) => {
            this.elevators = elevators.filter((elevator) => elevator.projectId === id);
            this.client = clients.find((item) => item.id === project.clientId);
          },
          error: (err) => {
            this.error = getErrorMessage(err);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400 || err.status === 404) {
          this.notFound = true;
        } else {
          this.error = getErrorMessage(err);
        }
      }
    });
  }

  editProject(): void {
    if (this.project?.id) {
      void this.router.navigate(['/projects'], { queryParams: { edit: this.project.id } });
    }
  }

  openCreateElevator(): void {
    this.editingElevatorId = null;
    this.form = this.emptyElevator();
    this.form.projectId = this.project?.id ?? '';
    this.showElevatorForm = true;
    this.error = '';
    this.success = '';
  }

  openEditElevator(elevator: Elevator): void {
    this.editingElevatorId = elevator.id ?? null;
    this.form = { ...elevator, projectId: this.project?.id ?? elevator.projectId };
    this.showElevatorForm = true;
    this.error = '';
    this.success = '';
  }

  cancelElevatorForm(): void {
    this.showElevatorForm = false;
    this.form = this.emptyElevator();
    this.editingElevatorId = null;
  }

  saveElevator(): void {
    if (!this.project?.id) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.form.projectId = this.project.id;
    const request = this.editingElevatorId
      ? this.elevatorService.update(this.editingElevatorId, this.form)
      : this.elevatorService.create(this.form);
    request.subscribe({
      next: () => {
        this.success = this.editingElevatorId ? 'Elevator updated.' : 'Elevator created.';
        this.showElevatorForm = false;
        this.editingElevatorId = null;
        this.saving = false;
        this.reloadElevators();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.saving = false;
      }
    });
  }

  changeElevatorStatus(elevator: Elevator, status: ElevatorStatus): void {
    if (!elevator.id) {
      return;
    }
    this.error = '';
    this.elevatorService.update(elevator.id, { ...elevator, status }).subscribe({
      next: () => {
        this.success = 'Elevator status updated.';
        this.reloadElevators();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  onElevatorListViewChange(change: ListToolbarChange): void {
    this.listView = change;
  }

  removeElevator(elevator: Elevator): void {
    if (!elevator.id || !confirm('Delete this elevator and its interventions?')) {
      return;
    }
    this.elevatorService.delete(elevator.id).subscribe({
      next: () => {
        this.success = 'Elevator deleted.';
        this.reloadElevators();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  statusLabel = statusLabel;
  elevatorBadge = elevatorBadge;

  projectStatusClass(status: string): string {
    switch (status) {
      case 'PLANIFIE':
        return 'status-planned';
      case 'EN_COURS':
        return 'status-in-progress';
      case 'TERMINE':
        return 'status-completed';
      default:
        return 'bg-secondary';
    }
  }

  private reloadElevators(): void {
    this.elevatorService.getAll().subscribe({
      next: (elevators) => {
        this.elevators = elevators.filter((elevator) => elevator.projectId === this.project?.id);
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  private initializeMap(): void {
    if (!this.mapElement || !this.project || this.detailMap ||
        typeof this.project.latitude !== 'number' || typeof this.project.longitude !== 'number') {
      return;
    }

    const coordinates: L.LatLngExpression = [this.project.latitude, this.project.longitude];
    this.detailMap = L.map(this.mapElement.nativeElement, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false
    }).setView(coordinates, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.detailMap);
    L.marker(coordinates, {
      icon: L.divIcon({
        className: '',
        html: '<span style="display:block;width:18px;height:18px;border:3px solid #fff;border-radius:50%;background:#0d6efd;box-shadow:0 1px 5px #333"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      })
    }).addTo(this.detailMap);
    setTimeout(() => this.detailMap?.invalidateSize(), 0);
  }
}
