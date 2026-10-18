import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Elevator, ElevatorMaintenanceStatus } from '../models/elevator.model';

@Injectable({ providedIn: 'root' })
export class ElevatorService {
  private readonly url = `${environment.apiUrl}/elevators`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Elevator[]> {
    return this.http.get<Elevator[]>(this.url);
  }

  getMaintenanceStatus(): Observable<ElevatorMaintenanceStatus[]> {
    return this.http.get<ElevatorMaintenanceStatus[]>(`${this.url}/maintenance-status`);
  }

  getById(id: string): Observable<Elevator> {
    return this.http.get<Elevator>(`${this.url}/${id}`);
  }

  create(elevator: Elevator): Observable<Elevator> {
    return this.http.post<Elevator>(this.url, elevator);
  }

  update(id: string, elevator: Elevator): Observable<Elevator> {
    return this.http.put<Elevator>(`${this.url}/${id}`, elevator);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
