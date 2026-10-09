import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { OrganizationsService } from "../../../core/services/organizations.service";
import { ButtonComponent } from "../../../shared/ui/button/button.component";
import { STAFF_RANGES } from "../../../core/models/organization.model";
import { AuthShellComponent } from "../auth-shell/auth-shell.component";

const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Abidjan",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Europe/London",
  "UTC",
] as const;

@Component({
  selector: "app-register-organization",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, RouterLink, AuthShellComponent],
  templateUrl: "./register-organization.component.html",
})
export class RegisterOrganizationComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private organizations = inject(OrganizationsService);
  private router = inject(Router);

  staffRanges = STAFF_RANGES;
  timezones = TIMEZONES;
  submitting = signal(false);
  error = signal<string | null>(null);
  step = signal(1);
  showPassword = signal(false);

  readonly steps = [
    { id: 1, label: "Organization" },
    { id: 2, label: "Contact" },
    { id: 3, label: "Location" },
    { id: 4, label: "Account" },
  ];

  private readonly stepFields: Record<number, string[]> = {
    1: ["organizationName", "legalName", "industry", "staffRange"],
    2: ["website", "phone", "registrationNumber", "timezone"],
    3: ["country", "state", "city", "address", "about"],
    4: ["ownerFirstName", "ownerLastName", "ownerEmail", "ownerPassword"],
  };

  form = this.fb.nonNullable.group({
    organizationName: ["", [Validators.required, Validators.minLength(2)]],
    legalName: [""],
    industry: [""],
    website: [""],
    phone: [""],
    country: ["Nigeria"],
    state: [""],
    city: [""],
    address: [""],
    staffRange: ["11-50"],
    registrationNumber: [""],
    timezone: ["Africa/Lagos"],
    about: [""],
    ownerFirstName: ["", Validators.required],
    ownerLastName: ["", Validators.required],
    ownerEmail: ["", [Validators.required, Validators.email]],
    ownerPassword: ["", [Validators.required, Validators.minLength(8)]],
  });

  showError(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  goTo(target: number): void {
    if (target === this.step()) return;
    if (target < this.step()) {
      this.step.set(target);
      return;
    }
    while (this.step() < target) {
      if (!this.validateStep(this.step())) {
        this.touchStep(this.step());
        return;
      }
      this.step.update((current) => current + 1);
    }
  }

  next(): void {
    if (!this.validateStep(this.step())) {
      this.touchStep(this.step());
      return;
    }
    this.error.set(null);
    this.step.update((current) => Math.min(4, current + 1));
  }

  back(): void {
    this.error.set(null);
    this.step.update((current) => Math.max(1, current - 1));
  }

  submit(): void {
    if (this.step() < 4) {
      this.next();
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.organizations
      .register({
        organizationName: raw.organizationName,
        legalName: raw.legalName || undefined,
        industry: raw.industry || undefined,
        website: raw.website || undefined,
        phone: raw.phone || undefined,
        country: raw.country || undefined,
        state: raw.state || undefined,
        city: raw.city || undefined,
        address: raw.address || undefined,
        staffRange: raw.staffRange as (typeof STAFF_RANGES)[number],
        registrationNumber: raw.registrationNumber || undefined,
        timezone: raw.timezone || undefined,
        about: raw.about || undefined,
        ownerFirstName: raw.ownerFirstName,
        ownerLastName: raw.ownerLastName,
        ownerEmail: raw.ownerEmail,
        ownerPassword: raw.ownerPassword,
      })
      .subscribe({
        next: (res) => {
          this.auth.adoptSession(res.accessToken, res.refreshToken);
          this.router.navigate(["/organization"]);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(
            err?.error?.message ?? "Could not create the organization.",
          );
        },
      });
  }

  private validateStep(step: number): boolean {
    return this.stepFields[step].every(
      (name) => this.form.get(name)?.valid ?? false,
    );
  }

  private touchStep(step: number): void {
    for (const name of this.stepFields[step]) {
      this.form.get(name)?.markAsTouched();
    }
  }
}
