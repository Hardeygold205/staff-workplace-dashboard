import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ProjectsService } from "../../core/services/projects.service";
import {
  DepartmentsService,
  Department,
} from "../../core/services/departments.service";
import { UsersService } from "../../core/services/users.service";
import { UploadsService } from "../../core/services/uploads.service";
import {
  Project,
  ProjectMemberRole,
  ProjectStatus,
  ProjectVisibility,
} from "../../core/models/project.model";
import { User, displayName } from "../../core/models/user.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-projects",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    ButtonComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: "./projects.component.html",
})
export class ProjectsComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private departmentsService = inject(DepartmentsService);
  private usersService = inject(UsersService);
  private uploadsService = inject(UploadsService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  projects = signal<Project[]>([]);
  departments = signal<Department[]>([]);
  staff = signal<User[]>([]);
  members = signal<{ userId: string; role: ProjectMemberRole }[]>([]);
  attachment = signal<File | null>(null);
  displayName = displayName;

  statuses: ProjectStatus[] = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"];
  visibilities: { value: ProjectVisibility; label: string }[] = [
    { value: "PUBLIC", label: "Public — whole organization" },
    { value: "DEPARTMENT", label: "Department only" },
    { value: "PRIVATE", label: "Private — invited people" },
  ];
  memberRoles: ProjectMemberRole[] = ["MANAGER", "MEMBER", "VIEWER"];

  form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    description: [""],
    departmentId: [""],
    visibility: ["DEPARTMENT" as ProjectVisibility],
    status: ["PLANNING" as ProjectStatus],
    startDate: [""],
    endDate: [""],
    memberUserId: [""],
    memberRole: ["MEMBER" as ProjectMemberRole],
  });

  ngOnInit(): void {
    this.load();
    this.departmentsService.list().subscribe({
      next: (rows) => this.departments.set(rows.filter((row) => row.isActive)),
      error: () => {},
    });
    this.usersService.list().subscribe({
      next: (users) => this.staff.set(users.filter((user) => user.isActive)),
      error: () => {},
    });
  }

  load(): void {
    this.loading.set(true);
    this.projectsService.list().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openForm(): void {
    this.form.reset({
      name: "",
      description: "",
      departmentId: "",
      visibility: "DEPARTMENT",
      status: "PLANNING",
      startDate: "",
      endDate: "",
      memberUserId: "",
      memberRole: "MEMBER",
    });
    this.members.set([]);
    this.attachment.set(null);
    this.error.set(null);
    this.showForm.set(true);
  }

  addMember(): void {
    const userId = this.form.controls.memberUserId.value;
    const role = this.form.controls.memberRole.value;
    if (!userId || this.members().some((member) => member.userId === userId))
      return;
    this.members.update((list) => [...list, { userId, role }]);
    this.form.controls.memberUserId.setValue("");
  }

  removeMember(userId: string): void {
    this.members.update((list) =>
      list.filter((member) => member.userId !== userId),
    );
  }

  memberName(userId: string): string {
    const user = this.staff().find((person) => person.id === userId);
    return user ? displayName(user) : "Staff";
  }

  onFile(event: Event): void {
    this.attachment.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.projectsService
      .create({
        name: raw.name,
        description: raw.description || undefined,
        departmentId: raw.departmentId || null,
        visibility: raw.visibility,
        status: raw.status,
        startDate: raw.startDate || null,
        endDate: raw.endDate || null,
        members: this.members(),
      })
      .subscribe({
        next: (project) => {
          const file = this.attachment();
          if (!file) {
            this.submitting.set(false);
            this.showForm.set(false);
            this.load();
            return;
          }
          this.uploadsService.upload(file, "PROJECT", project.id).subscribe({
            next: () => {
              this.submitting.set(false);
              this.showForm.set(false);
              this.load();
            },
            error: (err) => {
              this.submitting.set(false);
              this.showForm.set(false);
              this.error.set(
                err?.error?.message ??
                  "Project was created, but the file did not upload.",
              );
              this.load();
            },
          });
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? "Could not create project.");
        },
      });
  }

  setStatus(project: Project, status: ProjectStatus): void {
    this.projectsService
      .updateStatus(project.id, { status })
      .subscribe((updated) => {
        this.projects.update((list) =>
          list.map((item) =>
            item.id === project.id ? { ...item, ...updated } : item,
          ),
        );
      });
  }

  departmentName(project: Project): string {
    return project.department?.name || "—";
  }
}
