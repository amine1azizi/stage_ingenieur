import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ElevatorMaintenanceStatus, MaintenanceState } from '../../models/elevator.model';
import { Project } from '../../models/project.model';
import { ElevatorService } from '../../services/elevator.service';
import { ProjectService } from '../../services/project.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './maintenance.component.html'
})
export class MaintenanceComponent implements OnInit {
  maintenanceItems: ElevatorMaintenanceStatus[] = [];
  projects: Project[] = [];
  selectedState = '';
  loading = false;
  error = '';

  constructor(
    private elevatorService: ElevatorService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get filteredItems(): ElevatorMaintenanceStatus[] {
    const stateRank: Record<MaintenanceState, number> = {
      OVERDUE: 0,
      DUE_SOON: 1,
      OK: 2
    };
    return this.maintenanceItems
      .filter((item) => !this.selectedState || item.maintenanceState === this.selectedState)
      .slice()
      .sort((first, second) =>
        stateRank[first.maintenanceState] - stateRank[second.maintenanceState]
        || first.reference.localeCompare(second.reference)
      );
  }

  get overdueCount(): number {
    return this.maintenanceItems.filter((item) => item.maintenanceState === 'OVERDUE').length;
  }

  get dueSoonCount(): number {
    return this.maintenanceItems.filter((item) => item.maintenanceState === 'DUE_SOON').length;
  }

  get okCount(): number {
    return this.maintenanceItems.filter((item) => item.maintenanceState === 'OK').length;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.elevatorService.getMaintenanceStatus().subscribe({
      next: (items) => {
        this.maintenanceItems = items;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
        this.loading = false;
      }
    });
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (err) => {
        this.error = getErrorMessage(err);
      }
    });
  }

  projectName(projectId: string): string {
    return this.projects.find((project) => project.id === projectId)?.name || projectId;
  }

  createIntervention(elevatorId: string): void {
    void this.router.navigate(['/interventions'], { queryParams: { elevatorId } });
  }

  stateLabel(state: MaintenanceState): string {
    switch (state) {
      case 'OVERDUE':
        return 'Overdue';
      case 'DUE_SOON':
        return 'Due soon';
      default:
        return 'OK';
    }
  }

  stateBadge(state: MaintenanceState): string {
    switch (state) {
      case 'OVERDUE':
        return 'bg-danger';
      case 'DUE_SOON':
        return 'bg-warning text-dark';
      default:
        return 'bg-success';
    }
  }
}
