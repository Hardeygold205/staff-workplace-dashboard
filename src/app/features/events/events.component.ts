import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { EventsService } from "../../core/services/events.service";
import { AuthService } from "../../core/services/auth.service";
import { CompanyEvent } from "../../core/models/event.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { ModalComponent } from "../../shared/ui/modal/modal.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

const EVENT_TYPES = [
  "ANNOUNCEMENT",
  "PUBLIC_HOLIDAY",
  "COMPANY_EVENT",
  "MEETING",
  "TRAINING",
  "OTHER",
];

@Component({
  selector: "app-events",
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
  templateUrl: "./events.component.html",
})
export class EventsComponent implements OnInit {
  private eventsService = inject(EventsService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  eventTypes = EVENT_TYPES;
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  events = signal<CompanyEvent[]>([]);

  form = this.fb.nonNullable.group({
    title: ["", Validators.required],
    description: [""],
    type: ["ANNOUNCEMENT", Validators.required],
    startDate: ["", Validators.required],
    endDate: [""],
    allDay: [true],
    linkUrl: [""],
    linkLabel: [""],
    notifyByEmail: [false],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.eventsService.list().subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openForm(): void {
    this.form.reset({
      title: "",
      description: "",
      type: "ANNOUNCEMENT",
      startDate: "",
      endDate: "",
      allDay: true,
      linkUrl: "",
      linkLabel: "",
      notifyByEmail: false,
    });
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

    this.eventsService
      .create({
        title: raw.title,
        description: raw.description || undefined,
        type: raw.type,
        // Send startsAt and endsAt as expected by backend Zod schema
        startsAt: raw.startDate,
        endsAt: raw.endDate || raw.startDate,
        allDay: raw.allDay,
        linkUrl: raw.linkUrl || undefined,
        linkLabel: raw.linkLabel || undefined,
        notifyByEmail: raw.notifyByEmail,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.load();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? "Could not create event.");
        },
      });
  }

  remove(event: CompanyEvent): void {
    this.eventsService.remove(event.id).subscribe(() => this.load());
  }
}
