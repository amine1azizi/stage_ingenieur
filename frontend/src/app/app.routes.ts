import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ElevatorsComponent } from './pages/elevators/elevators.component';
import { TechniciansComponent } from './pages/technicians/technicians.component';
import { InterventionsComponent } from './pages/interventions/interventions.component';
import { ClientPortalComponent } from './pages/client-portal/client-portal.component';
import { MaintenanceRequestsComponent } from './pages/maintenance-requests/maintenance-requests.component';
import { MapComponent } from './pages/map/map.component';
import { ProjectDetailComponent } from './pages/project-detail/project-detail.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'clients', component: ClientsComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'projects', component: ProjectsComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'projects/:id', component: ProjectDetailComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'elevators', component: ElevatorsComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'technicians', component: TechniciansComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'interventions', component: InterventionsComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'maintenance', component: MaintenanceComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'maintenance-requests', component: MaintenanceRequestsComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'map', component: MapComponent, canActivate: [roleGuard('ADMIN')] },
      { path: 'portal', component: ClientPortalComponent, canActivate: [roleGuard('CLIENT')] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
