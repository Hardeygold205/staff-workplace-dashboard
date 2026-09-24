import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../../core/services/projects.service';
import { TasksService } from '../../../core/services/tasks.service';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project, ProjectStatus } from '../../../core/models/project.model';
import { Task, TASK_STATUS_COLUMNS, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { User, displayName } from '../../../core/models/user.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    SpinnerComponent,
  ],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsService);
  private tasksService = inject(TasksService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  loading = signal(true);
  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  staff = signal<User[]>([]);
  showTaskForm = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  columns = TASK_STATUS_COLUMNS;
  displayName = displayName;

  taskForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['MEDIUM' as TaskPriority],
    assignedToId: [''],
    dueDate: [''],
  });

  tasksByStatus = computed(() => {
    const grouped: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
    for (const task of this.tasks()) grouped[task.status].push(task);
    return grouped;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.projectsService.get(id).subscribe((project) => {
      this.project.set(project);
      this.loading.set(false);
    });
    this.tasksService.listForProject(id).subscribe((tasks) => this.tasks.set(tasks));
    this.usersService.list().subscribe((users) => this.staff.set(users.filter((u) => u.isActive)));
  }

  updateProjectStatus(status: ProjectStatus): void {
    const project = this.project();
    if (!project) return;
    this.projectsService.updateStatus(project.id, { status }).subscribe((updated) => this.project.set(updated));
  }

  openTaskForm(): void {
    this.taskForm.reset({ title: '', description: '', priority: 'MEDIUM', assignedToId: '', dueDate: '' });
    this.error.set(null);
    this.showTaskForm.set(true);
  }

  submitTask(): void {
    const project = this.project();
    if (!project || this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const raw = this.taskForm.getRawValue();
    this.submitting.set(true);
    this.tasksService
      .create(project.id, {
        title: raw.title,
        description: raw.description || undefined,
        priority: raw.priority,
        assignedToId: raw.assignedToId || undefined,
        dueDate: raw.dueDate || undefined,
      })
      .subscribe({
        next: (task) => {
          this.submitting.set(false);
          this.showTaskForm.set(false);
          this.tasks.update((list) => [...list, task]);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? 'Could not create task.');
        },
      });
  }

  moveTask(task: Task, status: TaskStatus): void {
    this.tasksService.updateStatus(task.id, status).subscribe((updated) => {
      this.tasks.update((list) => list.map((t) => (t.id === task.id ? updated : t)));
    });
  }

  deleteTask(task: Task): void {
    this.tasksService.delete(task.id).subscribe(() => {
      this.tasks.update((list) => list.filter((t) => t.id !== task.id));
    });
  }

  priorityTone(priority: TaskPriority): 'danger' | 'warning' | 'neutral' {
    return priority === 'HIGH' ? 'danger' : priority === 'MEDIUM' ? 'warning' : 'neutral';
  }

  columnLabel(status: TaskStatus): string {
    return { TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done' }[status];
  }
}
