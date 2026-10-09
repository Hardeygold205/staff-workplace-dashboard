import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { BranchesService, OfficeBranch } from "../../core/services/branches.service";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { ModalComponent } from "../../shared/ui/modal/modal.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-branches",
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
  templateUrl: "./branches.component.html",
})
export class BranchesComponent implements OnInit {
  private branchesService = inject(BranchesService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  branches = signal<OfficeBranch[]>([]);
  editing = signal<OfficeBranch | null>(null);
  open = signal(false);

  form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    address: [""],
    city: [""],
    state: [""],
    country: ["Nigeria"],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.branchesService.list().subscribe({
      next: (rows) => {
        this.branches.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startCreate(): void {
    this.editing.set(null);
    this.form.reset({ name: "", address: "", city: "", state: "", country: "Nigeria" });
    this.error.set(null);
    this.open.set(true);
  }

  startEdit(branch: OfficeBranch): void {
    this.editing.set(branch);
    this.form.reset({
      name: branch.name,
      address: branch.address ?? "",
      city: branch.city ?? "",
      state: branch.state ?? "",
      country: branch.country ?? "",
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
      address: raw.address || undefined,
      city: raw.city || undefined,
      state: raw.state || undefined,
      country: raw.country || undefined,
    };
    this.saving.set(true);
    const request = this.editing()
      ? this.branchesService.update(this.editing()!.id, payload)
      : this.branchesService.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.open.set(false);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? "Could not save branch.");
      },
    });
  }

  deactivate(branch: OfficeBranch): void {
    if (!confirm(`Deactivate ${branch.name}?`)) return;
    this.branchesService.deactivate(branch.id).subscribe(() => this.load());
  }

  place(branch: OfficeBranch): string {
    return [branch.city, branch.state, branch.country].filter(Boolean).join(", ") || "Location not set";
  }
}
