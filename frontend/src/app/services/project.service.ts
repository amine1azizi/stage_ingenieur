import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly url = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.url);
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.url}/${id}`);
  }

  create(project: Project): Observable<Project> {
    return this.http.post<Project>(this.url, project);
  }

  update(id: string, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.url}/${id}`, project);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
