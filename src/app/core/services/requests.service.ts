import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateRequestPayload, ReviewRequestPayload, StaffRequest } from '../models/request.model';

const BASE = `${environment.apiUrl}/requests`;

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private http = inject(HttpClient);

  categories(): Observable<string[]> {
    return this.http.get<string[]>(`${BASE}/categories`);
  }

  create(payload: CreateRequestPayload): Observable<StaffRequest> {
    return this.http.post<StaffRequest>(BASE, payload);
  }

  all(): Observable<StaffRequest[]> {
    return this.http.get<StaffRequest[]>(BASE);
  }

  mine(): Observable<StaffRequest[]> {
    return this.http.get<StaffRequest[]>(`${BASE}/me`);
  }

  review(id: string, payload: ReviewRequestPayload): Observable<StaffRequest> {
    return this.http.patch<StaffRequest>(`${BASE}/${id}/review`, payload);
  }

  cancel(id: string): Observable<StaffRequest> {
    return this.http.patch<StaffRequest>(`${BASE}/${id}/cancel`, {});
  }
}
