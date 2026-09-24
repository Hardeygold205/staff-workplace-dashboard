import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTaskPayload, Task, TaskStatus, UpdateTaskPayload } from '../models/task.model';

const BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);

  listForProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${BASE}/projects/${projectId}/tasks`);
  }

  create(projectId: string, payload: CreateTaskPayload): Observable<Task> {
    return this.http.post<Task>(`${BASE}/projects/${projectId}/tasks`, payload);
  }

  get(id: string): Observable<Task> {
    return this.http.get<Task>(`${BASE}/tasks/${id}`);
  }

  update(id: string, payload: UpdateTaskPayload): Observable<Task> {
    return this.http.patch<Task>(`${BASE}/tasks/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/tasks/${id}`);
  }

  updateStatus(id: string, status: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`${BASE}/tasks/${id}/status`, { status });
  }
}
