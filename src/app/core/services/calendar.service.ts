import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MonthlyCalendar } from '../models/calendar.model';

const BASE = `${environment.apiUrl}/calendar`;

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private http = inject(HttpClient);

  monthly(year: number, month: number): Observable<MonthlyCalendar> {
    return this.http.get<MonthlyCalendar>(`${BASE}/monthly`, {
      params: { year, month },
    });
  }
}
