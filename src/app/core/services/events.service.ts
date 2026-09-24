import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyEvent, CreateEventPayload, UpdateEventPayload } from '../models/event.model';

const BASE = `${environment.apiUrl}/events`;

@Injectable({ providedIn: 'root' })
export class EventsService {
  private http = inject(HttpClient);

  upcoming(): Observable<CompanyEvent[]> {
    return this.http.get<CompanyEvent[]>(`${BASE}/upcoming`);
  }

  list(): Observable<CompanyEvent[]> {
    return this.http.get<CompanyEvent[]>(BASE);
  }

  create(payload: CreateEventPayload): Observable<CompanyEvent> {
    return this.http.post<CompanyEvent>(BASE, payload);
  }

  get(id: string): Observable<CompanyEvent> {
    return this.http.get<CompanyEvent>(`${BASE}/${id}`);
  }

  update(id: string, payload: UpdateEventPayload): Observable<CompanyEvent> {
    return this.http.patch<CompanyEvent>(`${BASE}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }
}
