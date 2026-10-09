import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ProjectsService } from "../../../core/services/projects.service";
import { TasksService } from "../../../core/services/tasks.service";
import { UsersService } from "../../../core/services/users.service";
import { Project, ProjectStatus } from "../../../core/models/project.model";
import { TASK_PRIORITIES, TASK_STATUSES, Task, TaskPriority, TaskStatus } from "../../../core/models/task.model";
import { User, displayName } from "../../../core/models/user.model";
import { PageHeaderComponent } from "../../../shared/ui/page-header/page-header.component";
import { SpinnerComponent } from "../../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-project-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, SpinnerComponent],
  templateUrl: "./project-detail.component.html",
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsService);
  private tasksService = inject(TasksService);
  private usersService = inject(UsersService);

  loading = signal(true);
  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  staff = signal<User[]>([]);
  query = signal("");
  draftTitle = signal("");
  error = signal<string | null>(null);
  statuses = TASK_STATUSES;
  priorities = TASK_PRIORITIES;
  projectStatuses: ProjectStatus[] = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"];
  displayName = displayName;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")!;
    this.projectsService.get(id).subscribe({
      next: (project) => {
        this.project.set(project);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.tasksService.listForProject(id).subscribe((tasks) => this.tasks.set(tasks));
    this.usersService.list().subscribe({
      next: (users) => this.staff.set(users.filter((user) => user.isActive)),
      error: () => {},
    });
  }

  visibleTasks(): Task[] {
    const term = this.query().trim().toLowerCase();
    if (!term) return this.tasks();
    return this.tasks().filter((task) => task.title.toLowerCase().includes(term));
  }

  updateProjectStatus(status: ProjectStatus): void {
    const project = this.project();
    if (!project) return;
    this.projectsService.updateStatus(project.id, { status }).subscribe((updated) => {
      this.project.set({ ...project, ...updated });
    });
  }

  addTask(): void {
    const project = this.project();
    const title = this.draftTitle().trim();
    if (!project || !title) return;
    this.error.set(null);
    this.tasksService.create(project.id, { title, priority: "MEDIUM" }).subscribe({
      next: (task) => {
        this.tasks.update((list) => [...list, task]);
        this.draftTitle.set("");
      },
      error: (err) => this.error.set(err?.error?.message ?? "Could not add task."),
    });
  }

  setStatus(task: Task, status: TaskStatus): void {
    this.tasksService.updateStatus(task.id, status).subscribe((updated) => this.replace(updated));
  }

  setPriority(task: Task, priority: TaskPriority): void {
    this.tasksService.update(task.id, { priority }).subscribe((updated) => this.replace(updated));
  }

  setAssignee(task: Task, assigneeId: string): void {
    this.tasksService.update(task.id, { assigneeId: assigneeId || null }).subscribe((updated) => this.replace(updated));
  }

  setDue(task: Task, dueDate: string): void {
    this.tasksService.update(task.id, { dueDate: dueDate || null }).subscribe((updated) => this.replace(updated));
  }

  deleteTask(task: Task): void {
    this.tasksService.delete(task.id).subscribe(() => {
      this.tasks.update((list) => list.filter((item) => item.id !== task.id));
    });
  }

  dueValue(task: Task): string {
    return task.dueDate ? task.dueDate.slice(0, 10) : "";
  }

  assigneeId(task: Task): string {
    return task.assigneeId || task.assignee?.id || "";
  }

  private replace(updated: Task): void {
    this.tasks.update((list) => list.map((task) => (task.id === updated.id ? { ...task, ...updated } : task)));
  }
}
