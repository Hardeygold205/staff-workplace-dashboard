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
const SNOOZE_STORAGE_PREFIX = "attendance_reminder_snoozed_until";

function currentWatDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WAT_TIMEZONE,
  }).format(new Date());
}

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
  private isExempt = signal(true);
  private userLoaded = signal(false);
  private attendanceLoaded = signal(false);
  private snoozedUntil = signal<number>(0);
  private started = false;

  readonly activeReminder = computed<ReminderKind>(() => {
    if (!this.auth.isAuthenticated()) return null;
    if (this.auth.isPlatformAdmin()) return null;
    if (!this.started || !this.userLoaded() || !this.attendanceLoaded())
      return null;
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
    if (!this.auth.isAuthenticated() || this.auth.isPlatformAdmin()) return;
    this.started = true;
    this.snoozedUntil.set(this.readSnoozedUntil());

    this.usersService.me().subscribe({
      next: (user) => {
        this.isExempt.set(user.attendanceExempt);
        this.userLoaded.set(true);
        if (user.attendanceExempt) {
          this.todaysRecord.set(null);
          this.attendanceLoaded.set(true);
        } else {
          this.loadTodayRecord(true);
        }
      },
      error: () => {
        this.isExempt.set(true);
        this.userLoaded.set(true);
        this.attendanceLoaded.set(true);
      },
    });

    interval(POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (!this.auth.isAuthenticated()) return of(null);
          if (this.auth.isPlatformAdmin()) return of([]);
          if (!this.userLoaded()) return of(null);
          if (this.isExempt()) return of([]);
          return this.attendance.me().pipe(catchError(() => of(null)));
        }),
      )
      .subscribe((records) => {
        this.applyRecords(records);
      });
  }

  /** Called by the modal's check-in/out buttons — refetches immediately instead of waiting for the next poll. */
  refreshNow(): void {
    if (!this.auth.isAuthenticated() || this.auth.isPlatformAdmin() || this.isExempt())
      return;
    this.loadTodayRecord(true);
  }

  snooze(): void {
    const until = Date.now() + SNOOZE_MS;
    this.snoozedUntil.set(until);
    this.writeSnoozedUntil(until);
  }

  private snoozeStorageKey(): string | null {
    const userId = this.auth.userId();
    if (!userId) return null;
    return `${SNOOZE_STORAGE_PREFIX}:${userId}:${currentWatDateKey()}`;
  }

  private readSnoozedUntil(): number {
    const key = this.snoozeStorageKey();
    if (!key) return 0;
    const value = Number(localStorage.getItem(key) ?? 0);
    return Number.isFinite(value) ? value : 0;
  }

  private writeSnoozedUntil(until: number): void {
    const key = this.snoozeStorageKey();
    if (!key) return;
    localStorage.setItem(key, String(until));
  }

  private loadTodayRecord(clearWhileLoading = false): void {
    if (!this.auth.isAuthenticated() || this.auth.isPlatformAdmin() || this.isExempt())
      return;
    if (clearWhileLoading) this.attendanceLoaded.set(false);
    this.attendance
      .me()
      .pipe(catchError(() => of(null)))
      .subscribe((records) => this.applyRecords(records));
  }

  private applyRecords(records: AttendanceRecord[] | null): void {
    if (!records) {
      this.attendanceLoaded.set(false);
      return;
    }
    const todayKey = currentWatDateKey();
    const today =
      records.find((r) => watDateKey(r.checkInAt) === todayKey) ?? null;
    this.todaysRecord.set(today);
    this.attendanceLoaded.set(true);
  }
}
