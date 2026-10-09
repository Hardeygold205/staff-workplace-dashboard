import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ButtonComponent } from "../../../shared/ui/button/button.component";

@Component({
  selector: "app-accept-invitation",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, RouterLink],
  templateUrl: "./accept-invitation.component.html",
})
export class AcceptInvitationComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    token: [this.route.snapshot.queryParamMap.get("token") ?? "", Validators.required],
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    password: ["", [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.auth.acceptInvitation(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(["/dashboard"]),
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? "This invitation could not be accepted.");
      },
    });
  }
}
