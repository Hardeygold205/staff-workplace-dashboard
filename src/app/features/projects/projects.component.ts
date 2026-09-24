import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/models/project.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  projects = signal<Project[]>([]);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit(): void {
    this.load();
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
    this.form.reset({ name: '', description: '', startDate: '', endDate: '' });
    this.error.set(null);
    this.showForm.set(true);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.submitting.set(true);
    this.projectsService
      .create({
        name: raw.name,
        description: raw.description || undefined,
        startDate: raw.startDate || undefined,
        endDate: raw.endDate || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.load();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? 'Could not create project.');
        },
      });
  }

  statusTone(status: string): 'success' | 'warning' | 'neutral' | 'info' {
    if (status === 'ACTIVE') return 'success';
    if (status === 'ON_HOLD') return 'warning';
    if (status === 'COMPLETED') return 'neutral';
    return 'info';
  }
}
