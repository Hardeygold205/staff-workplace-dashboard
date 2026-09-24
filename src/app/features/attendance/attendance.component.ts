import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AttendanceService } from "../../core/services/attendance.service";
import { AttendanceReminderService } from "../../core/services/attendance-reminder.service";
import { AuthService } from "../../core/services/auth.service";
import { UsersService } from "../../core/services/users.service";
import {
  AttendanceRecord,
  CheckoutReasonOption,
  CheckoutReasonType,
} from "../../core/models/attendance.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

const WAT_TZ = "Africa/Lagos";
function watHour(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: WAT_TZ,
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  return Number(parts.find((p) => p.type === "hour")?.value ?? 0);
}

@Component({
  selector: "app-attendance",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: "./attendance.component.html",
})
export class AttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private reminder = inject(AttendanceReminderService);
  private usersService = inject(UsersService);
  auth = inject(AuthService);

  isExempt = signal(false);

  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);

  history = signal<AttendanceRecord[]>([]);
  reasonOptions = signal<CheckoutReasonOption[]>([]);
  selectedReason = signal<CheckoutReasonType | "">("");
  reasonText = signal("");

  // Admin
  allRecords = signal<AttendanceRecord[]>([]);
  pendingReview = signal<AttendanceRecord[]>([]);
  adminLoading = signal(false);
  reviewNotes = signal<Record<string, string>>({});

  todaysRecord = computed(() => {
    const todayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: WAT_TZ,
    }).format(new Date());
    return (
      this.history().find(
        (r) =>
          new Intl.DateTimeFormat("en-CA", { timeZone: WAT_TZ }).format(
            new Date(r.checkInAt),
          ) === todayKey,
      ) ?? null
    );
  });

  /** Outside 5–6pm WAT, checkout needs a reason — mirrors the backend's actual rule so we
   *  ask for it upfront instead of round-tripping on a validation error. */
  needsCheckoutReason = computed(() => {
    const hour = watHour();
    return hour < 17 || hour >= 18;
  });

  ngOnInit(): void {
    this.usersService.me().subscribe({
      next: (user) => this.isExempt.set(user.attendanceExempt),
      error: () => {},
    });
    this.attendanceService
      .checkoutReasons()
      .subscribe((opts) => this.reasonOptions.set(opts));
    this.loadHistory();

    if (this.auth.hasPermission("attendance:view_all")) {
      this.adminLoading.set(true);
      this.attendanceService.all().subscribe((records) => {
        this.allRecords.set(records);
        this.adminLoading.set(false);
      });
    }
    if (this.auth.hasPermission("attendance:review")) {
      this.attendanceService
        .pendingReview()
        .subscribe((records) => this.pendingReview.set(records));
    }
  }

  loadHistory(): void {
    this.loading.set(true);
    this.attendanceService.me().subscribe({
      next: (records) => {
        this.history.set(records);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  checkIn(): void {
    this.submitting.set(true);
    this.error.set(null);
    this.attendanceService.checkIn().subscribe({
      next: () => {
        this.submitting.set(false);
        this.loadHistory();
        this.reminder.refreshNow();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? "Could not check in.");
      },
    });
  }

  checkOut(): void {
    if (this.needsCheckoutReason() && !this.selectedReason()) {
      this.error.set("Please select a reason for this check-out time.");
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.attendanceService
      .checkOut({
        reasonType: this.selectedReason() || undefined,
        reasonText: this.reasonText() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.selectedReason.set("");
          this.reasonText.set("");
          this.loadHistory();
          this.reminder.refreshNow();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? "Could not check out.");
        },
      });
  }

  setNote(id: string, value: string): void {
    this.reviewNotes.update((notes) => ({ ...notes, [id]: value }));
  }

  getNote(id: string): string {
    return this.reviewNotes()[id] || "";
  }

  markReviewed(record: AttendanceRecord): void {
    this.attendanceService
      .review(record.id, { note: this.reviewNotes()[record.id] })
      .subscribe(() => {
        this.pendingReview.update((list) =>
          list.filter((r) => r.id !== record.id),
        );
      });
  }

  statusTone(status: string): "success" | "warning" | "neutral" {
    return status === "LATE"
      ? "warning"
      : status === "PRESENT"
        ? "success"
        : "neutral";
  }
}
