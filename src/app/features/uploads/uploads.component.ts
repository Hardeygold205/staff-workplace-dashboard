import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable, Subscription } from "rxjs";
import { UploadsService } from "../../core/services/uploads.service";
import { ProjectsService } from "../../core/services/projects.service";
import { TasksService } from "../../core/services/tasks.service";
import { RequestsService } from "../../core/services/requests.service";
import { UsersService } from "../../core/services/users.service";
import { AuthService } from "../../core/services/auth.service";
import { UploadRecord } from "../../core/models/upload.model";
import { Project } from "../../core/models/project.model";
import { Task } from "../../core/models/task.model";
import { StaffRequest } from "../../core/models/request.model";
import { User, displayName } from "../../core/models/user.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

const FOLDERS = ["PROJECT", "TASK", "REQUEST", "USER"] as const;

type ViewKind = "image" | "pdf" | "video" | "audio" | "text" | "none";

@Component({
  selector: "app-uploads",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    CardComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: "./uploads.component.html",
})
export class UploadsComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private uploadsService = inject(UploadsService);
  private projectsService = inject(ProjectsService);
  private tasksService = inject(TasksService);
  private requestsService = inject(RequestsService);
  private usersService = inject(UsersService);

  viewing = signal<UploadRecord | null>(null);
  viewKind = signal<ViewKind>("none");
  viewUrl = signal<SafeResourceUrl | null>(null);
  viewText = signal("");
  viewLoading = signal(false);
  viewError = signal<string | null>(null);
  private objectUrl: string | null = null;
  private viewSub?: Subscription;

  auth = inject(AuthService);

  folders = FOLDERS;
  selectedFolder = "";
  selectedProjectId = "";
  selectedEntityId = "";
  displayName = displayName;

  projects = signal<Project[]>([]);
  tasks = signal<Task[]>([]);
  requests = signal<StaffRequest[]>([]);
  staff = signal<User[]>([]);
  loadError = signal<string | null>(null);

  loading = signal(true);
  uploading = signal(false);
  error = signal<string | null>(null);
  uploads = signal<UploadRecord[]>([]);
  dragOver = signal(false);

  ngOnInit(): void {
    this.load();
    this.projectsService
      .list()
      .subscribe({ next: (rows) => this.projects.set(rows), error: () => {} });
  }

  onFolderChange(): void {
    this.selectedProjectId = "";
    this.selectedEntityId = "";
    this.tasks.set([]);
    if (this.selectedFolder === "REQUEST" && this.requests().length === 0) {
      const fetch = this.auth.hasPermission("requests:view_all")
        ? this.requestsService.all()
        : this.requestsService.mine();
      fetch.subscribe({
        next: (rows) => this.requests.set(rows),
        error: () => {},
      });
    }
    if (this.selectedFolder === "USER" && this.staff().length === 0) {
      this.usersService
        .list()
        .subscribe({ next: (rows) => this.staff.set(rows), error: () => {} });
    }
    this.load();
  }

  onProjectChange(): void {
    this.selectedEntityId =
      this.selectedFolder === "PROJECT" ? this.selectedProjectId : "";
    this.tasks.set([]);
    if (this.selectedFolder === "TASK" && this.selectedProjectId) {
      this.tasksService.listForProject(this.selectedProjectId).subscribe({
        next: (rows) => this.tasks.set(rows),
        error: () => {},
      });
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    const entityType = this.selectedFolder || undefined;
    const entityId = this.selectedEntityId || undefined;
    const fetch = this.auth.hasPermission("uploads:view_all")
      ? this.uploadsService.list(entityType, entityId)
      : this.uploadsService.mine();
    fetch.subscribe({
      next: (list) => {
        this.uploads.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadError.set(err?.error?.message ?? "Could not load files.");
        this.loading.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files?.length) this.doUpload(Array.from(files));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) this.doUpload(Array.from(files));
  }

  private doUpload(files: File[]): void {
    if (this.selectedFolder && !this.selectedEntityId) {
      this.error.set(
        this.selectedFolder === "TASK"
          ? "Select the project, then the task."
          : "Select what this file belongs to.",
      );
      return;
    }
    this.uploading.set(true);
    this.error.set(null);
    const upload$: Observable<UploadRecord | UploadRecord[]> =
      files.length === 1
        ? this.uploadsService.upload(
            files[0],
            this.selectedFolder || undefined,
            this.selectedEntityId || undefined,
          )
        : this.uploadsService.uploadMultiple(
            files,
            this.selectedFolder || undefined,
            this.selectedEntityId || undefined,
          );

    upload$.subscribe({
      next: () => {
        this.uploading.set(false);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.uploading.set(false);
        this.error.set(err?.error?.message ?? "Upload failed.");
      },
    });
  }

  download(file: UploadRecord): void {
    this.uploadsService.download(file.id, file.originalName).subscribe();
  }

  remove(file: UploadRecord): void {
    this.uploadsService.remove(file.id).subscribe(() => {
      this.uploads.update((list) => list.filter((item) => item.id !== file.id));
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  kindOf(file: UploadRecord): ViewKind {
    const m = file.mimeType ?? "";
    if (m.startsWith("image/")) return "image";
    if (m === "application/pdf") return "pdf";
    if (m.startsWith("video/")) return "video";
    if (m.startsWith("audio/")) return "audio";
    if (m === "text/html") return "none"; // blob URLs share the app's origin, never render uploaded HTML
    if (m.startsWith("text/") || m === "application/json") return "text";
    return "none";
  }

  view(file: UploadRecord): void {
    this.closeViewer();
    const kind = this.kindOf(file);
    this.viewing.set(file);
    this.viewKind.set(kind);
    if (kind === "none") return;

    this.viewLoading.set(true);
    this.viewSub = this.uploadsService
      .fetchBlob(file.id, file.mimeType)
      .subscribe({
        next: async (blob) => {
          if (kind === "text") {
            const text = (await blob.text()).slice(0, 200_000);
            if (this.viewing()?.id !== file.id) return;
            this.viewText.set(text);
          } else {
            this.objectUrl = URL.createObjectURL(blob);
            this.viewUrl.set(
              this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl),
            );
          }
          this.viewLoading.set(false);
        },
        error: () => {
          this.viewError.set("Could not load this file.");
          this.viewLoading.set(false);
        },
      });
  }

  closeViewer(): void {
    this.viewSub?.unsubscribe();
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.viewing.set(null);
    this.viewUrl.set(null);
    this.viewText.set("");
    this.viewError.set(null);
    this.viewLoading.set(false);
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.viewing()) this.closeViewer();
  }

  ngOnDestroy(): void {
    this.closeViewer();
  }
}
