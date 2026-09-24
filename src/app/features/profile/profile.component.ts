import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UsersService } from "../../core/services/users.service";
import { AttendanceService } from "../../core/services/attendance.service";
import { AttendanceReminderService } from "../../core/services/attendance-reminder.service";
import { AuthService } from "../../core/services/auth.service";
import { User, displayName, roleNames } from "../../core/models/user.model";
import {
  AttendanceRecord,
  CheckoutReasonOption,
  CheckoutReasonType,
} from "../../core/models/attendance.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { AvatarComponent } from "../../shared/ui/avatar/avatar.component";
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
  selector: "app-profile",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    AvatarComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: "./profile.component.html",
})
export class ProfileComponent implements OnInit, OnDestroy {
  private usersService = inject(UsersService);
  private attendanceService = inject(AttendanceService);
  private reminder = inject(AttendanceReminderService);
  public auth = inject(AuthService);
  private fb = inject(FormBuilder);

  // Tab State
  activeTab = signal<"attendance" | "profile" | "security" | "admin">(
    "attendance",
  );

  // Profile Signals & Forms
  me = signal<User | null>(null);
  saving = signal(false);
  savedMessage = signal<string | null>(null);
  error = signal<string | null>(null);

  changingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSaved = signal(false);

  displayName = displayName;
  roleNames = roleNames;

  profileForm = this.fb.nonNullable.group({
    username: [""],
    middleName: [""],
    dob: [""],
    bio: [""],
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ["", Validators.required],
    newPassword: ["", [Validators.required, Validators.minLength(10)]],
  });

  // Attendance Signals & Real-time Live Clock
  currentTime = signal<Date>(new Date());
  private clockInterval: any;

  loading = signal(true);
  submitting = signal(false);
  attendanceError = signal<string | null>(null);

  history = signal<AttendanceRecord[]>([]);
  reasonOptions = signal<CheckoutReasonOption[]>([]);
  selectedReason = signal<CheckoutReasonType | "">("");
  reasonText = signal("");

  // Admin Signals
  allRecords = signal<AttendanceRecord[]>([]);
  pendingReview = signal<AttendanceRecord[]>([]);
  adminLoading = signal(false);
  reviewNotes = signal<Record<string, string>>({});

  // Computed Attendance Values
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

  needsCheckoutReason = computed(() => {
    const hour = watHour();
    return hour < 17 || hour >= 18;
  });

  // Live Timer Counter Reading (HH:MM:SS format)
  elapsedTimeReading = computed(() => {
    const record = this.todaysRecord();
    if (!record || !record.checkInAt) return "00h 00m 00s";

    const start = new Date(record.checkInAt).getTime();
    const end = record.checkOutAt
      ? new Date(record.checkOutAt).getTime()
      : this.currentTime().getTime();

    const diffMs = Math.max(0, end - start);
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

    const pad = (num: number) => String(num).padStart(2, "0");
    return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
  });

  ngOnInit(): void {
    // Start live clock ticker (every second)
    this.clockInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);

    // Load User Details
    this.usersService.me().subscribe((user) => {
      this.me.set(user);
      this.profileForm.patchValue({
        username: user.username ?? "",
        middleName: user.middleName ?? "",
        dob: user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : "",
        bio: user.bio ?? "",
      });
    });

    // Load Attendance
    this.attendanceService
      .checkoutReasons()
      .subscribe((opts) => this.reasonOptions.set(opts));
    this.loadAttendanceHistory();

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

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  // Attendance Actions
  loadAttendanceHistory(): void {
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
    this.attendanceError.set(null);
    this.attendanceService.checkIn().subscribe({
      next: () => {
        this.submitting.set(false);
        this.loadAttendanceHistory();
        this.reminder.refreshNow();
      },
      error: (err) => {
        this.submitting.set(false);
        this.attendanceError.set(err?.error?.message ?? "Could not check in.");
      },
    });
  }

  checkOut(): void {
    if (this.needsCheckoutReason() && !this.selectedReason()) {
      this.attendanceError.set(
        "Please select a reason for this check-out time.",
      );
      return;
    }
    this.submitting.set(true);
    this.attendanceError.set(null);
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
          this.loadAttendanceHistory();
          this.reminder.refreshNow();
        },
        error: (err) => {
          this.submitting.set(false);
          this.attendanceError.set(
            err?.error?.message ?? "Could not check out.",
          );
        },
      });
  }

  // Profile Actions
  saveProfile(): void {
    const raw = this.profileForm.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.savedMessage.set(null);
    this.usersService
      .updateMe({
        username: raw.username || undefined,
        middleName: raw.middleName || null,
        dob: raw.dob || null,
        bio: raw.bio || null,
      })
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.me.set(updated);
          this.savedMessage.set("Profile updated successfully.");
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err?.error?.message ?? "Could not update profile.");
        },
      });
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.usersService
      .uploadAvatar(file)
      .subscribe((updated) => this.me.set(updated));
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.changingPassword.set(true);
    this.passwordError.set(null);
    this.auth.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordSaved.set(true);
        this.passwordForm.reset({ currentPassword: "", newPassword: "" });
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.passwordError.set(
          err?.error?.message ?? "Could not change password.",
        );
      },
    });
  }

  // Admin helpers
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
