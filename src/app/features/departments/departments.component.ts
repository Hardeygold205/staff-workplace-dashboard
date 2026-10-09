import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { Department, DepartmentsService } from "../../core/services/departments.service";
import { UsersService } from "../../core/services/users.service";
import { User } from "../../core/models/user.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { ModalComponent } from "../../shared/ui/modal/modal.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-departments",
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
  templateUrl: "./departments.component.html",
})
export class DepartmentsComponent implements OnInit {
  private departmentsService = inject(DepartmentsService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  departments = signal<Department[]>([]);
  staff = signal<User[]>([]);
  editing = signal<Department | null>(null);
  open = signal(false);

  form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    description: [""],
    headUserId: [""],
  });

  ngOnInit(): void {
    this.load();
    if (this.auth.hasPermission("users:view")) {
      this.usersService.list().subscribe({ next: (users) => this.staff.set(users), error: () => {} });
    }
  }

  load(): void {
    this.loading.set(true);
    this.departmentsService.list().subscribe({
      next: (rows) => {
        this.departments.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startCreate(): void {
    this.editing.set(null);
    this.form.reset({ name: "", description: "", headUserId: "" });
    this.error.set(null);
    this.open.set(true);
  }

  startEdit(department: Department): void {
    this.editing.set(department);
    this.form.reset({
      name: department.name,
      description: department.description ?? "",
      headUserId: department.headUserId ?? department.headUser?.id ?? "",
    });
    this.error.set(null);
    this.open.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      description: raw.description || undefined,
      headUserId: raw.headUserId || null,
    };
    this.saving.set(true);
    this.error.set(null);
    const request = this.editing()
      ? this.departmentsService.update(this.editing()!.id, payload)
      : this.departmentsService.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.open.set(false);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? "Could not save department.");
      },
    });
  }

  deactivate(department: Department): void {
    if (!confirm(`Deactivate ${department.name}?`)) return;
    this.departmentsService.deactivate(department.id).subscribe(() => this.load());
  }
}
