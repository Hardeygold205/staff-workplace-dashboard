import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { OrganizationsService } from "../../../core/services/organizations.service";
import { ThemeService } from "../../../core/services/theme.service";
import { ButtonComponent } from "../../../shared/ui/button/button.component";
import { STAFF_RANGES } from "../../../core/models/organization.model";

@Component({
  selector: "app-register-organization",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, RouterLink],
  templateUrl: "./register-organization.component.html",
})
export class RegisterOrganizationComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private organizations = inject(OrganizationsService);
  private router = inject(Router);
  theme = inject(ThemeService);

  staffRanges = STAFF_RANGES;
  submitting = signal(false);
  error = signal<string | null>(null);

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

  submit(): void {
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
}
