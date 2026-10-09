import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { OrganizationsService } from "../../core/services/organizations.service";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";
import { Organization, STAFF_RANGES } from "../../core/models/organization.model";

@Component({
  selector: "app-organization",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, CardComponent, ButtonComponent, SpinnerComponent],
  templateUrl: "./organization.component.html",
})
export class OrganizationComponent implements OnInit {
  private organizations = inject(OrganizationsService);
  private fb = inject(FormBuilder);

  staffRanges = STAFF_RANGES;
  loading = signal(true);
  saving = signal(false);
  uploadingLogo = signal(false);
  uploadingIcon = signal(false);
  error = signal<string | null>(null);
  saved = signal(false);
  org = signal<Organization | null>(null);

  form = this.fb.nonNullable.group({
    name: ["", Validators.required],
    legalName: [""],
    industry: [""],
    website: [""],
    phone: [""],
    country: [""],
    state: [""],
    city: [""],
    address: [""],
    staffRange: [""],
    registrationNumber: [""],
    timezone: ["Africa/Lagos"],
    about: [""],
  });

  settingsForm = this.fb.nonNullable.group({
    workStartTime: ["09:00"],
    workEndTime: ["17:00"],
    autoCheckoutTime: ["18:00"],
    enableScreentime: [false],
    enableSuggestions: [true],
  });
  workDays = signal<number[]>([1, 2, 3, 4, 5]);
  savingSettings = signal(false);
  settingsSaved = signal(false);
  dayLabels = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  ngOnInit(): void {
    this.organizations.mine().subscribe({
      next: (org) => {
        this.org.set(org);
        this.form.patchValue({
          name: org.name,
          legalName: org.legalName ?? "",
          industry: org.industry ?? "",
          website: org.website ?? "",
          phone: org.phone ?? "",
          country: org.country ?? "",
          state: org.state ?? "",
          city: org.city ?? "",
          address: org.address ?? "",
          staffRange: org.staffRange ?? "",
          registrationNumber: org.registrationNumber ?? "",
          timezone: org.timezone,
          about: org.about ?? "",
        });
        const settings = org.settings;
        if (settings) {
          this.settingsForm.patchValue({
            workStartTime: settings.workStartTime,
            workEndTime: settings.workEndTime,
            autoCheckoutTime: settings.autoCheckoutTime,
            enableScreentime: settings.enableScreentime,
            enableSuggestions: settings.enableSuggestions,
          });
          this.workDays.set(settings.workDays ?? [1, 2, 3, 4, 5]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);
    this.organizations
      .update({
        name: raw.name,
        legalName: raw.legalName || null,
        industry: raw.industry || null,
        website: raw.website || null,
        phone: raw.phone || null,
        country: raw.country || null,
        state: raw.state || null,
        city: raw.city || null,
        address: raw.address || null,
        staffRange: (raw.staffRange || null) as Organization["staffRange"],
        registrationNumber: raw.registrationNumber || null,
        timezone: raw.timezone,
        about: raw.about || null,
      })
      .subscribe({
        next: (org) => {
          this.org.set(org);
          this.saving.set(false);
          this.saved.set(true);
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err?.error?.message ?? "Could not save organization.");
        },
      });
  }

  toggleDay(day: number): void {
    this.workDays.update((days) =>
      days.includes(day) ? days.filter((value) => value !== day) : [...days, day].sort(),
    );
  }

  saveSettings(): void {
    if (this.workDays().length === 0) {
      this.error.set("Pick at least one work day.");
      return;
    }
    const raw = this.settingsForm.getRawValue();
    this.savingSettings.set(true);
    this.settingsSaved.set(false);
    this.error.set(null);
    this.organizations
      .updateSettings({
        workStartTime: raw.workStartTime.slice(0, 5),
        workEndTime: raw.workEndTime.slice(0, 5),
        autoCheckoutTime: raw.autoCheckoutTime.slice(0, 5),
        enableScreentime: raw.enableScreentime,
        enableSuggestions: raw.enableSuggestions,
        workDays: this.workDays(),
      })
      .subscribe({
        next: () => {
          this.savingSettings.set(false);
          this.settingsSaved.set(true);
        },
        error: (err) => {
          this.savingSettings.set(false);
          this.error.set(err?.error?.message ?? "Could not save workplace settings.");
        },
      });
  }

  onLogo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingLogo.set(true);
    this.organizations.uploadLogo(file).subscribe({
      next: (org) => {
        this.org.set(org);
        this.uploadingLogo.set(false);
      },
      error: (err) => {
        this.uploadingLogo.set(false);
        this.error.set(err?.error?.message ?? "Could not upload logo.");
      },
    });
  }

  onIcon(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingIcon.set(true);
    this.organizations.uploadIcon(file).subscribe({
      next: (org) => {
        this.org.set(org);
        this.uploadingIcon.set(false);
      },
      error: (err) => {
        this.uploadingIcon.set(false);
        this.error.set(err?.error?.message ?? "Could not upload icon.");
      },
    });
  }
}
