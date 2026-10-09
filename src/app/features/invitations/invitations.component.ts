import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Invitation, InvitationsService } from "../../core/services/invitations.service";
import { DepartmentsService, Department } from "../../core/services/departments.service";
import { RolesService } from "../../core/services/roles.service";
import { Role } from "../../core/models/role.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { ModalComponent } from "../../shared/ui/modal/modal.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";
import { CardComponent } from "../../shared/ui/card/card.component";

@Component({
  selector: "app-invitations",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    EmptyStateComponent,
    SpinnerComponent,
    CardComponent,
  ],
  templateUrl: "./invitations.component.html",
})
export class InvitationsComponent implements OnInit {
  private invitationsService = inject(InvitationsService);
  private departmentsService = inject(DepartmentsService);
  private rolesService = inject(RolesService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  notice = signal<string | null>(null);
  invitations = signal<Invitation[]>([]);
  roles = signal<Role[]>([]);
  departments = signal<Department[]>([]);
  open = signal(false);

  form = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    roleId: [""],
    departmentId: [""],
  });

  ngOnInit(): void {
    this.load();
    this.rolesService.list().subscribe({ next: (roles) => this.roles.set(roles), error: () => {} });
    this.departmentsService.list().subscribe({ next: (rows) => this.departments.set(rows), error: () => {} });
  }

  load(): void {
    this.loading.set(true);
    this.invitationsService.list().subscribe({
      next: (rows) => {
        this.invitations.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startCreate(): void {
    this.form.reset({ email: "", roleId: "", departmentId: "" });
    this.error.set(null);
    this.open.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.invitationsService
      .create({
        email: raw.email,
        roleId: raw.roleId || undefined,
        departmentId: raw.departmentId || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.open.set(false);
          this.notice.set(`Invitation sent to ${raw.email}.`);
          this.load();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err?.error?.message ?? "Could not send invitation.");
        },
      });
  }

  cancel(invitation: Invitation): void {
    if (!confirm(`Cancel the invitation for ${invitation.email}?`)) return;
    this.invitationsService.cancel(invitation.id).subscribe(() => this.load());
  }

  copyLink(invitation: Invitation): void {
    if (!invitation.token) return;
    const url = `${location.origin}/accept-invitation?token=${invitation.token}`;
    navigator.clipboard.writeText(url).then(() => this.notice.set("Accept link copied."));
  }

  tone(status: Invitation["status"]): "success" | "warning" | "danger" | "neutral" {
    if (status === "ACCEPTED") return "success";
    if (status === "PENDING") return "warning";
    if (status === "CANCELLED") return "danger";
    return "neutral";
  }
}
