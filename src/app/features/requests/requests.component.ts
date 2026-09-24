import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestsService } from '../../core/services/requests.service';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { StaffRequest } from '../../core/models/request.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

const DATE_CATEGORIES = ['LEAVE', 'TRAVEL'];

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: './requests.component.html',
})
export class RequestsComponent implements OnInit {
  private requestsService = inject(RequestsService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);

  categories = signal<string[]>([]);
  staffEmails = signal<{ email: string; firstName: string; lastName: string }[]>([]);
  myRequests = signal<StaffRequest[]>([]);
  allRequests = signal<StaffRequest[]>([]);

  form = this.fb.nonNullable.group({
    category: ['', Validators.required],
    subject: ['', Validators.required],
    details: [''],
    startDate: [''],
    endDate: [''],
    notifyToEmails: [''],
    notifyCcEmails: [''],
  });

  get needsDates(): boolean {
    return DATE_CATEGORIES.includes(this.form.controls.category.value);
  }

  ngOnInit(): void {
    this.requestsService.categories().subscribe((cats) => this.categories.set(cats));
    this.usersService.emails().subscribe((emails) => this.staffEmails.set(emails));
    this.loadMine();

    if (this.auth.hasPermission('requests:view_all')) {
      this.requestsService.all().subscribe((reqs) => this.allRequests.set(reqs));
    }
  }

  loadMine(): void {
    this.loading.set(true);
    this.requestsService.mine().subscribe({
      next: (reqs) => {
        this.myRequests.set(reqs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openForm(): void {
    this.form.reset({ category: '', subject: '', details: '', startDate: '', endDate: '', notifyToEmails: '', notifyCcEmails: '' });
    this.error.set(null);
    this.showForm.set(true);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.requestsService
      .create({
        category: raw.category,
        subject: raw.subject,
        details: raw.details || undefined,
        startDate: raw.startDate || undefined,
        endDate: raw.endDate || undefined,
        notifyToEmails: raw.notifyToEmails ? splitEmails(raw.notifyToEmails) : [],
        notifyCcEmails: raw.notifyCcEmails ? splitEmails(raw.notifyCcEmails) : [],
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.loadMine();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? 'Could not submit request.');
        },
      });
  }

  cancel(request: StaffRequest): void {
    this.requestsService.cancel(request.id).subscribe(() => this.loadMine());
  }

  review(request: StaffRequest, decision: 'APPROVED' | 'REJECTED'): void {
    this.requestsService.review(request.id, { decision }).subscribe(() => {
      this.allRequests.update((list) => list.map((r) => (r.id === request.id ? { ...r, status: decision } : r)));
    });
  }

  statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'danger';
    if (status === 'CANCELLED') return 'neutral';
    return 'warning';
  }
}

function splitEmails(raw: string): string[] {
  return raw
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
}
