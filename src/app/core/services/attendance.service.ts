import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AttendanceRecord,
  CheckInPayload,
  CheckOutPayload,
  CheckoutReasonOption,
  ReviewAttendancePayload,
} from '../models/attendance.model';

const BASE = `${environment.apiUrl}/attendance`;

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);

  checkoutReasons(): Observable<CheckoutReasonOption[]> {
    return this.http.get<CheckoutReasonOption[]>(`${BASE}/checkout-reasons`);
  }

  checkIn(payload: CheckInPayload = {}): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${BASE}/check-in`, payload);
  }

  checkOut(payload: CheckOutPayload = {}): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${BASE}/check-out`, payload);
  }

  me(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${BASE}/me`);
  }

  all(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(BASE);
  }

  pendingReview(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${BASE}/pending-review`);
  }

  review(id: string, payload: ReviewAttendancePayload): Observable<AttendanceRecord> {
    return this.http.patch<AttendanceRecord>(`${BASE}/${id}/review`, payload);
  }
}
