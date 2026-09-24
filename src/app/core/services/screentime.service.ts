import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogScreentimePayload, ScreentimeLog } from '../models/screentime.model';

const BASE = `${environment.apiUrl}/screentime`;

@Injectable({ providedIn: 'root' })
export class ScreentimeService {
  private http = inject(HttpClient);

  log(payload: LogScreentimePayload): Observable<ScreentimeLog> {
    return this.http.post<ScreentimeLog>(`${BASE}/log`, payload);
  }

  mine(): Observable<ScreentimeLog[]> {
    return this.http.get<ScreentimeLog[]>(`${BASE}/me`);
  }

  all(): Observable<ScreentimeLog[]> {
    return this.http.get<ScreentimeLog[]>(BASE);
  }
}
