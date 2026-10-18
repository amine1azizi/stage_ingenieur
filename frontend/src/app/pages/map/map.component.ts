import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { forkJoin } from 'rxjs';
import { Client } from '../../models/client.model';
import { Elevator } from '../../models/elevator.model';
import { PROJECT_STATUSES, Project, ProjectStatus } from '../../models/project.model';
import { ClientService } from '../../services/client.service';
import { ElevatorService } from '../../services/elevator.service';
import { ProjectService } from '../../services/project.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly statuses = PROJECT_STATUSES;
  selectedStatus: ProjectStatus | 'ALL' = 'ALL';
  projects: Project[] = [];
  elevators: Elevator[] = [];
  clients: Client[] = [];
  loading = true;
  loaded = false;
  error = '';

  private map?: L.Map;
  private markers?: L.LayerGroup;

  constructor(
    private projectService: ProjectService,
    private elevatorService: ElevatorService,
    private clientService: ClientService,
    private router: Router,
    private zone: NgZone
  ) {}

  get hasCoordinateProjects(): boolean {
    return this.projects.some((project) => this.hasCoordinates(project));
  }

  ngOnInit(): void {
    forkJoin({
      projects: this.projectService.getAll(),
      elevators: this.elevatorService.getAll(),
      clients: this.clientService.getAll()
    }).subscribe({
      next: ({ projects, elevators, clients }) => {
        this.projects = projects;
        this.elevators = elevators;
        this.clients = clients;
        this.loading = false;
        this.loaded = true;
        this.refreshMarkers();
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map('project-map').setView([34.0, 9.5], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);
    this.markers = L.layerGroup().addTo(this.map);
    this.refreshMarkers();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
  }

  refreshMarkers(): void {
    if (!this.markers) {
      return;
    }

    this.markers.clearLayers();
    const visibleProjects = this.projects.filter((project): project is Project & { latitude: number; longitude: number } =>
      this.hasCoordinates(project) &&
      (this.selectedStatus === 'ALL' || project.status === this.selectedStatus)
    );

    for (const project of visibleProjects) {
      const marker = L.circleMarker(
        [project.latitude, project.longitude],
        {
          radius: 9,
          color: this.statusColor(project.status),
          fillColor: this.statusColor(project.status),
          fillOpacity: 0.85,
          weight: 2
        }
      );
      const client = this.clients.find((item) => item.id === project.clientId);
      const elevatorCount = this.elevators.filter((item) => item.projectId === project.id).length;
      marker.bindPopup(this.popupContent(project, client, elevatorCount));
      marker.on('popupopen', (event: L.PopupEvent) => {
        const button = event.popup.getElement()?.querySelector<HTMLButtonElement>('[data-project-id]');
        button?.addEventListener('click', () => {
          if (project.id) {
            this.zone.run(() => void this.router.navigate(['/projects', project.id]));
          }
        });
      });
      marker.addTo(this.markers);
    }
  }

  private hasCoordinates(project: Project): project is Project & { latitude: number; longitude: number } {
    return typeof project.latitude === 'number' &&
      Number.isFinite(project.latitude) &&
      typeof project.longitude === 'number' &&
      Number.isFinite(project.longitude);
  }

  private statusColor(status: ProjectStatus): string {
    switch (status) {
      case 'PLANIFIE':
        return '#0d6efd';
      case 'EN_COURS':
        return '#fd7e14';
      case 'TERMINE':
        return '#198754';
    }
  }

  private popupContent(project: Project, client: Client | undefined, elevatorCount: number): HTMLElement {
    const popup = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = project.name;
    popup.append(name);

    const details = [
      `Client: ${client?.name ?? 'Unknown'}`,
      `Address: ${project.address || 'Not specified'}`,
      `Status: ${project.status}`,
      `Elevators: ${elevatorCount}`
    ];
    for (const detail of details) {
      const line = document.createElement('div');
      line.textContent = detail;
      popup.append(line);
    }
    if (project.id) {
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'btn btn-sm btn-link p-0 mt-1';
      link.dataset['projectId'] = project.id;
      link.textContent = 'View project';
      popup.append(link);
    }
    return popup;
  }
}
