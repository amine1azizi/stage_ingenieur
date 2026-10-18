import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Intervention } from '../models/intervention.model';

@Injectable({ providedIn: 'root' })
export class InterventionService {
  private readonly url = `${environment.apiUrl}/interventions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(this.url);
  }

  getById(id: string): Observable<Intervention> {
    return this.http.get<Intervention>(`${this.url}/${id}`);
  }

  create(intervention: Intervention): Observable<Intervention> {
    return this.http.post<Intervention>(this.url, intervention);
  }

  update(id: string, intervention: Intervention): Observable<Intervention> {
    return this.http.put<Intervention>(`${this.url}/${id}`, intervention);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
