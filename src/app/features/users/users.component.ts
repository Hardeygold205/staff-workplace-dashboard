import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { UsersService } from "../../core/services/users.service";
import { RolesService } from "../../core/services/roles.service";
import { AuthService } from "../../core/services/auth.service";
import {
  User,
  displayName,
  initials,
  roleNames,
} from "../../core/models/user.model";
import { Permission, Role } from "../../core/models/role.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { ModalComponent } from "../../shared/ui/modal/modal.component";
import { AvatarComponent } from "../../shared/ui/avatar/avatar.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    AvatarComponent,
    SpinnerComponent,
  ],
  templateUrl: "./users.component.html",
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private rolesService = inject(RolesService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  loading = signal(true);
  submitting = signal(false);
  savingPermissions = signal(false);
  error = signal<string | null>(null);

  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);

  // Search & Filters
  searchQuery = signal("");
  branchFilter = signal<string>("ALL");
  statusFilter = signal<string>("ALL");

  // Modals & Target User
  showCreateForm = signal(false);
  permissionsTarget = signal<User | null>(null);

  grantSelections = signal<Set<string>>(new Set());
  revokeSelections = signal<Set<string>>(new Set());

  displayName = displayName;
  initials = initials;
  roleNames = roleNames;

  // Filtered Users List
  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const branch = this.branchFilter();
    const status = this.statusFilter();

    return this.users().filter((u) => {
      const nameMatch =
        displayName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q));

      const branchMatch = branch === "ALL" || u.officeBranch === branch;
      const statusMatch =
        status === "ALL" ||
        (status === "ACTIVE" && u.isActive) ||
        (status === "INACTIVE" && !u.isActive);

      return nameMatch && branchMatch && statusMatch;
    });
  });

  // Active Count Stats
  activeCount = computed(() => this.users().filter((u) => u.isActive).length);
  exemptCount = computed(
    () => this.users().filter((u) => u.attendanceExempt).length,
  );

  createForm = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    roleNames: this.fb.nonNullable.control<string[]>([]),
    department: [""],
    position: [""],
    officeBranch: this.fb.nonNullable.control<"ABUJA" | "KANO">("ABUJA"),
    shift: this.fb.nonNullable.control<"ONSITE" | "HYBRID" | "REMOTE">(
      "ONSITE",
    ),
  });

  ngOnInit(): void {
    this.load();
    this.rolesService.list().subscribe((roles) => this.roles.set(roles));
    this.rolesService
      .permissions()
      .subscribe((perms) => this.allPermissions.set(perms));
  }

  load(): void {
    this.loading.set(true);
    this.usersService.list().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateForm(): void {
    this.createForm.reset({
      email: "",
      firstName: "",
      lastName: "",
      roleNames: [],
      department: "",
      position: "",
      officeBranch: "ABUJA",
      shift: "ONSITE",
    });
    this.error.set(null);
    this.showCreateForm.set(true);
  }

  toggleRoleSelection(name: string, checked: boolean): void {
    const current = new Set(this.createForm.controls.roleNames.value);
    checked ? current.add(name) : current.delete(name);
    this.createForm.controls.roleNames.setValue(Array.from(current));
  }

  submitCreate(): void {
    if (
      this.createForm.invalid ||
      this.createForm.controls.roleNames.value.length === 0
    ) {
      this.createForm.markAllAsTouched();
      this.error.set("Please select at least one role.");
      return;
    }
    const raw = this.createForm.getRawValue();
    this.submitting.set(true);
    this.usersService
      .create({
        email: raw.email,
        firstName: raw.firstName,
        lastName: raw.lastName,
        roleNames: raw.roleNames,
        department: raw.department || undefined,
        position: raw.position || undefined,
        officeBranch: raw.officeBranch,
        shift: raw.shift,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showCreateForm.set(false);
          this.load();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? "Could not create user.");
        },
      });
  }

  deactivate(user: User): void {
    if (
      confirm(
        `Deactivate ${displayName(user)}? They will lose access to the portal.`,
      )
    ) {
      this.usersService.deactivate(user.id).subscribe(() => this.load());
    }
  }

  resetPassword(user: User): void {
    this.usersService.resetPassword(user.id).subscribe(() => {
      alert(
        `Password reset for ${displayName(user)}. They will receive an email with login instructions.`,
      );
    });
  }

  openPermissions(user: User): void {
    this.error.set(null);
    this.permissionsTarget.set(user);

    const existingGrants = user.permissionGrants ?? (user as any).grants ?? [];
    const existingRevokes =
      user.permissionRevokes ?? (user as any).revokes ?? [];

    this.grantSelections.set(new Set(existingGrants));
    this.revokeSelections.set(new Set(existingRevokes));
  }

  isGranted(key: string): boolean {
    return this.grantSelections().has(key);
  }

  isRevoked(key: string): boolean {
    return this.revokeSelections().has(key);
  }

  toggleGrant(key: string, checked: boolean): void {
    this.grantSelections.update((set) => {
      const next = new Set(set);
      checked ? next.add(key) : next.delete(key);
      return next;
    });

    if (checked) {
      this.revokeSelections.update((set) => {
        const next = new Set(set);
        next.delete(key);
        return next;
      });
    }
  }

  toggleRevoke(key: string, checked: boolean): void {
    this.revokeSelections.update((set) => {
      const next = new Set(set);
      checked ? next.add(key) : next.delete(key);
      return next;
    });

    if (checked) {
      this.grantSelections.update((set) => {
        const next = new Set(set);
        next.delete(key);
        return next;
      });
    }
  }

  savePermissions(): void {
    const target = this.permissionsTarget();
    if (!target) return;

    this.savingPermissions.set(true);
    this.error.set(null);

    this.usersService
      .setPermissions(target.id, {
        grant: Array.from(this.grantSelections()),
        revoke: Array.from(this.revokeSelections()),
      })
      .subscribe({
        next: () => {
          this.savingPermissions.set(false);
          this.permissionsTarget.set(null);
          this.load();
        },
        error: (err) => {
          this.savingPermissions.set(false);
          this.error.set(
            err?.error?.message ?? "Could not update permission overrides.",
          );
        },
      });
  }

  toggleExemption(user: User): void {
    this.usersService
      .setAttendanceExemption(user.id, !user.attendanceExempt)
      .subscribe(() => this.load());
  }
}
