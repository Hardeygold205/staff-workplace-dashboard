import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap, catchError, of } from "rxjs";
import { environment } from "../../../environments/environment";
import { AppNotification } from "../models/notification.model";
import { PaginatedResult } from "../models/pagination.model";

const BASE = `${environment.apiUrl}/notifications`;

@Injectable({ providedIn: "root" })
export class NotificationsService {
  private http = inject(HttpClient);

  readonly unreadCount = signal(0);

  refreshUnreadCount(): void {
    this.unreadCount$().subscribe();
  }

  private unreadCount$(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${BASE}/unread-count`).pipe(
      tap((res) => {
        const count = res?.count ?? (res as any)?.unreadCount ?? 0;
        this.unreadCount.set(count);
      }),
      catchError((err) => {
        return of({ count: 0 });
      }),
    );
  }

  list(page = 1, limit = 50): Observable<PaginatedResult<AppNotification>> {
    return this.http.get<PaginatedResult<AppNotification>>(BASE, {
      params: { page, limit },
    });
  }

  markAllRead(): Observable<void> {
    return this.http
      .patch<void>(`${BASE}/read-all`, {})
      .pipe(tap(() => this.unreadCount.set(0)));
  }

  markRead(id: string): Observable<AppNotification> {
    return this.http
      .patch<AppNotification>(`${BASE}/${id}/read`, {})
      .pipe(
        tap(() => this.unreadCount.set(Math.max(0, this.unreadCount() - 1))),
      );
  }
}
