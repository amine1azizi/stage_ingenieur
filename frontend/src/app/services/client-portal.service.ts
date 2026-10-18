import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Elevator } from '../models/elevator.model';
import { MaintenanceRequest, MaintenanceRequestStatus } from '../models/maintenance-request.model';

@Injectable({ providedIn: 'root' })
export class ClientPortalService {
  private readonly url = `${environment.apiUrl}/portal`;

  constructor(private http: HttpClient) {}

  getElevators(): Observable<Elevator[]> {
    return this.http.get<Elevator[]>(`${this.url}/elevators`);
  }

  getRequests(): Observable<MaintenanceRequest[]> {
    return this.http.get<MaintenanceRequest[]>(`${this.url}/requests`);
  }

  createRequest(elevatorId: string, description: string): Observable<MaintenanceRequest> {
    return this.http.post<MaintenanceRequest>(`${this.url}/requests`, { elevatorId, description });
  }

  getAllRequests(): Observable<MaintenanceRequest[]> {
    return this.http.get<MaintenanceRequest[]>(`${environment.apiUrl}/maintenance-requests`);
  }

  updateStatus(id: string, status: MaintenanceRequestStatus): Observable<MaintenanceRequest> {
    return this.http.put<MaintenanceRequest>(`${environment.apiUrl}/maintenance-requests/${id}/status`, { status });
  }

  deleteRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/maintenance-requests/${id}`);
  }
}
