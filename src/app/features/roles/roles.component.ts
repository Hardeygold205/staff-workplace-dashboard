import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesService } from '../../core/services/roles.service';
import { Permission, Role } from '../../core/models/role.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, CardComponent, ButtonComponent, ModalComponent, SpinnerComponent],
  templateUrl: './roles.component.html',
})
export class RolesComponent implements OnInit {
  private rolesService = inject(RolesService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
  editingRole = signal<Role | null>(null);
  editSelections = signal<Set<string>>(new Set());
  showCreateForm = signal(false);
  createSelections = signal<Set<string>>(new Set());
  error = signal<string | null>(null);

  createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]],
    description: [''],
  });

  ngOnInit(): void {
    this.load();
    this.rolesService.permissions().subscribe((perms) => this.allPermissions.set(perms));
  }

  load(): void {
    this.loading.set(true);
    this.rolesService.list().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateForm(): void {
    this.createForm.reset({ name: '', description: '' });
    this.createSelections.set(new Set());
    this.error.set(null);
    this.showCreateForm.set(true);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const raw = this.createForm.getRawValue();
    this.rolesService.create({
      name: raw.name,
      description: raw.description || undefined,
      permissionKeys: Array.from(this.createSelections()),
    }).subscribe({
      next: () => {
        this.showCreateForm.set(false);
        this.load();
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Could not create role.'),
    });
  }

  toggleCreatePermission(key: string, checked: boolean): void {
    this.createSelections.update((set) => {
      const next = new Set(set);
      checked ? next.add(key) : next.delete(key);
      return next;
    });
  }

  editRole(role: Role): void {
    this.editingRole.set(role);
    this.editSelections.set(new Set(role.permissions.map((p) => p.permission.key)));
  }

  togglePermission(key: string, checked: boolean): void {
    this.editSelections.update((set) => {
      const next = new Set(set);
      checked ? next.add(key) : next.delete(key);
      return next;
    });
  }

  saveRolePermissions(): void {
    const role = this.editingRole();
    if (!role) return;
    this.rolesService.setPermissions(role.id, { permissionKeys: Array.from(this.editSelections()) }).subscribe(() => {
      this.editingRole.set(null);
      this.load();
    });
  }
}
