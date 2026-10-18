import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Technician } from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechnicianService {
  private readonly url = `${environment.apiUrl}/technicians`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Technician[]> {
    return this.http.get<Technician[]>(this.url);
  }

  getById(id: string): Observable<Technician> {
    return this.http.get<Technician>(`${this.url}/${id}`);
  }

  create(technician: Technician): Observable<Technician> {
    return this.http.post<Technician>(this.url, technician);
  }

  update(id: string, technician: Technician): Observable<Technician> {
    return this.http.put<Technician>(`${this.url}/${id}`, technician);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
