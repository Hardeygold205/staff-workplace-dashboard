import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AttendanceService } from '../../core/services/attendance.service';
import { RequestsService } from '../../core/services/requests.service';
import { EventsService } from '../../core/services/events.service';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceRecord } from '../../core/models/attendance.model';
import { StaffRequest } from '../../core/models/request.model';
import { CompanyEvent } from '../../core/models/event.model';
import { User, displayName } from '../../core/models/user.model';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, BadgeComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private requestsService = inject(RequestsService);
  private eventsService = inject(EventsService);
  private usersService = inject(UsersService);
  auth = inject(AuthService);

  loading = signal(true);
  me = signal<User | null>(null);
  todaysAttendance = signal<AttendanceRecord | null>(null);
  myRequests = signal<StaffRequest[]>([]);
  upcomingEvents = signal<CompanyEvent[]>([]);

  displayName = displayName;

  ngOnInit(): void {
    forkJoin({
      me: this.usersService.me(),
      attendance: this.attendanceService.me(),
      requests: this.requestsService.mine(),
      events: this.eventsService.upcoming(),
    }).subscribe({
      next: ({ me, attendance, requests, events }) => {
        this.me.set(me);
        const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
        this.todaysAttendance.set(
          attendance.find((r) => new Date(r.checkInAt).toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' }) === todayKey) ?? null,
        );
        this.myRequests.set(requests.slice(0, 5));
        this.upcomingEvents.set(events.slice(0, 5));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get pendingRequestsCount(): number {
    return this.myRequests().filter((r) => r.status === 'PENDING').length;
  }
}
