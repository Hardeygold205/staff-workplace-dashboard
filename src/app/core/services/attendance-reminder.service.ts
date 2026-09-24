import { Injectable, computed, inject, signal } from "@angular/core";
import { interval, startWith, switchMap, of, catchError } from "rxjs";
import { AttendanceService } from "./attendance.service";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { AttendanceRecord } from "../models/attendance.model";

export type ReminderKind = "CHECK_IN" | "CHECK_OUT" | null;

const WAT_TIMEZONE = "Africa/Lagos"; // fixed UTC+1, no DST — matches the backend's wat.util.ts
const CHECK_IN_CUTOFF_HOUR = 9;
const CHECK_OUT_CUTOFF_HOUR = 17;
const POLL_INTERVAL_MS = 60_000; // re-check every minute — cheap, and catches the 9am/5pm boundary quickly
const SNOOZE_MS = 15 * 60_000; // dismissing hides it for 15 minutes, not for the rest of the day

function watDateKey(iso: string): string {
  // en-CA gives YYYY-MM-DD directly, which is exactly what we need to compare calendar days.
  return new Intl.DateTimeFormat("en-CA", { timeZone: WAT_TIMEZONE }).format(
    new Date(iso),
  );
}

function currentWatHour(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: WAT_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  return Number(parts.find((p) => p.type === "hour")?.value ?? 0);
}

@Injectable({ providedIn: "root" })
export class AttendanceReminderService {
  private attendance = inject(AttendanceService);
  private auth = inject(AuthService);
  private usersService = inject(UsersService);

  private todaysRecord = signal<AttendanceRecord | null>(null);
  private isExempt = signal(false);
  private snoozedUntil = signal<number>(0);
  private started = false;

  readonly activeReminder = computed<ReminderKind>(() => {
    if (!this.auth.isAuthenticated()) return null;
    if (this.isExempt()) return null; // leads/execs marked present by default never see this
    if (Date.now() < this.snoozedUntil()) return null;

    const hour = currentWatHour();
    const record = this.todaysRecord();

    if (hour >= CHECK_IN_CUTOFF_HOUR && !record) return "CHECK_IN";
    if (hour >= CHECK_OUT_CUTOFF_HOUR && record && !record.checkOutAt)
      return "CHECK_OUT";
    return null;
  });

  /** Call once, e.g. from the shell component's constructor — safe to call multiple times. */
  start(): void {
    if (this.started) return;
    this.started = true;

    this.usersService.me().subscribe({
      next: (user) => this.isExempt.set(user.attendanceExempt),
      error: () => {},
    });

    interval(POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (!this.auth.isAuthenticated()) return of(null);
          return this.attendance.me().pipe(catchError(() => of(null)));
        }),
      )
      .subscribe((records) => {
        if (!records) return;
        const todayKey = new Intl.DateTimeFormat("en-CA", {
          timeZone: WAT_TIMEZONE,
        }).format(new Date());
        const today =
          records.find((r) => watDateKey(r.checkInAt) === todayKey) ?? null;
        this.todaysRecord.set(today);
      });
  }

  /** Called by the modal's check-in/out buttons — refetches immediately instead of waiting for the next poll. */
  refreshNow(): void {
    this.attendance.me().subscribe((records) => {
      const todayKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: WAT_TIMEZONE,
      }).format(new Date());
      const today =
        records.find((r) => watDateKey(r.checkInAt) === todayKey) ?? null;
      this.todaysRecord.set(today);
    });
  }

  snooze(): void {
    this.snoozedUntil.set(Date.now() + SNOOZE_MS);
  }
}
