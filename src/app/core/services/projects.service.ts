import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateProjectPayload, Project, UpdateProjectStatusPayload } from '../models/project.model';

const BASE = `${environment.apiUrl}/projects`;

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);

  create(payload: CreateProjectPayload): Observable<Project> {
    return this.http.post<Project>(BASE, payload);
  }

  list(): Observable<Project[]> {
    return this.http.get<Project[]>(BASE);
  }

  get(id: string): Observable<Project> {
    return this.http.get<Project>(`${BASE}/${id}`);
  }

  updateStatus(id: string, payload: UpdateProjectStatusPayload): Observable<Project> {
    return this.http.patch<Project>(`${BASE}/${id}/status`, payload);
  }
}
