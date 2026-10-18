import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ClientService } from '../../services/client.service';
import { ElevatorService } from '../../services/elevator.service';
import { InterventionService } from '../../services/intervention.service';
import { ProjectService } from '../../services/project.service';
import { TechnicianService } from '../../services/technician.service';
import { Client } from '../../models/client.model';
import { Elevator } from '../../models/elevator.model';
import { Intervention } from '../../models/intervention.model';
import { Project } from '../../models/project.model';
import { Technician } from '../../models/technician.model';
import { getErrorMessage } from '../../utils/error-message';
import { elevatorBadge, interventionBadge, statusLabel } from '../../utils/status-label';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  error = '';
  loading = true;

  clients: Client[] = [];
  projects: Project[] = [];
  elevators: Elevator[] = [];
  technicians: Technician[] = [];
  interventions: Intervention[] = [];

  constructor(
    private clientService: ClientService,
    private projectService: ProjectService,
    private elevatorService: ElevatorService,
    private technicianService: TechnicianService,
    private interventionService: InterventionService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      clients: this.clientService.getAll(),
      projects: this.projectService.getAll(),
      elevators: this.elevatorService.getAll(),
      technicians: this.technicianService.getAll(),
      interventions: this.interventionService.getAll()
    }).subscribe({
      next: (data) => {
        this.clients = data.clients;
        this.projects = data.projects;
        this.elevators = data.elevators;
        this.technicians = data.technicians;
        this.interventions = data.interventions;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  countByStatus(status: string): number {
    return this.elevators.filter((item) => item.status === status).length;
  }

  recentInterventions(): Intervention[] {
    return [...this.interventions]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 8);
  }

  elevatorName(id: string): string {
    return this.elevators.find((item) => item.id === id)?.reference || id;
  }

  technicianName(id: string): string {
    return this.technicians.find((item) => item.id === id)?.name || id;
  }

  projectName(id: string): string {
    return this.projects.find((item) => item.id === id)?.name || id;
  }

  statusLabel = statusLabel;
  elevatorBadge = elevatorBadge;
  interventionBadge = interventionBadge;
}
