import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceReminderService } from '../../core/services/attendance-reminder.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-attendance-reminder-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    @if (reminder.activeReminder(); as kind) {
      <app-modal [open]="true" [dismissible]="false">
        @if (kind === 'CHECK_IN') {
          <div class="text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream">
              <svg class="h-6 w-6 text-brand-green" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-ink">You haven't checked in yet</h2>
            <p class="mt-1 text-sm text-ink-secondary">
              It's past 9:00am WAT. Check in now to record your attendance for today.
            </p>
          </div>
        } @else {
          <div class="text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream">
              <svg class="h-6 w-6 text-brand-green" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-ink">Don't forget to check out</h2>
            <p class="mt-1 text-sm text-ink-secondary">
              It's past 5:00pm WAT and you're still checked in. Check out when you're done for the day.
            </p>
          </div>
        }

        @if (error()) {
          <p class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {{ error() }}
          </p>
        }

        <div class="mt-5 flex gap-2">
          <app-button variant="secondary" [fullWidth]="true" (click)="reminder.snooze()">
            Remind me in 15 min
          </app-button>
          <app-button
            variant="primary"
            [fullWidth]="true"
            [loading]="submitting()"
            (click)="kind === 'CHECK_IN' ? doCheckIn() : doCheckOut()"
          >
            {{ kind === 'CHECK_IN' ? 'Check In Now' : 'Check Out Now' }}
          </app-button>
        </div>
      </app-modal>
    }
  `,
})
export class AttendanceReminderModalComponent {
  reminder = inject(AttendanceReminderService);
  private attendance = inject(AttendanceService);

  submitting = signal(false);
  error = signal<string | null>(null);

  doCheckIn(): void {
    this.submitting.set(true);
    this.error.set(null);
    this.attendance.checkIn().subscribe({
      next: () => {
        this.submitting.set(false);
        this.reminder.refreshNow();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Could not check in — try again.');
      },
    });
  }

  doCheckOut(): void {
    this.submitting.set(true);
    this.error.set(null);
    this.attendance.checkOut().subscribe({
      next: () => {
        this.submitting.set(false);
        this.reminder.refreshNow();
      },
      error: (err) => {
        this.submitting.set(false);
        const message = err?.error?.message ?? 'Could not check out.';
        this.error.set(
          typeof message === 'string' && message.toLowerCase().includes('reason')
            ? 'A reason is required for this check-out — head to the Attendance page to provide one.'
            : message,
        );
      },
    });
  }
}
