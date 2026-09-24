import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { UploadsService } from "../../core/services/uploads.service";
import { AuthService } from "../../core/services/auth.service";
import { UploadRecord } from "../../core/models/upload.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

const FOLDERS = ["PROJECT", "TASK", "REQUEST", "USER"] as const;

@Component({
  selector: "app-uploads",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: "./uploads.component.html",
})
export class UploadsComponent implements OnInit {
  private uploadsService = inject(UploadsService);
  auth = inject(AuthService);

  folders = FOLDERS;
  selectedFolder = signal<string>("");
  entityId = signal("");

  loading = signal(true);
  uploading = signal(false);
  error = signal<string | null>(null);
  uploads = signal<UploadRecord[]>([]);
  dragOver = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const fetch = this.auth.hasPermission("uploads:view_all")
      ? this.uploadsService.list(
          this.selectedFolder() || undefined,
          this.entityId() || undefined,
        )
      : this.uploadsService.mine();
    fetch.subscribe({
      next: (list) => {
        this.uploads.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
    this.uploading.set(true);
    this.error.set(null);
    const entityType = this.selectedFolder() || undefined;
    const entityId = this.entityId() || undefined;

    const upload$: Observable<UploadRecord | UploadRecord[]> =
      files.length === 1
        ? this.uploadsService.upload(files[0], entityType, entityId)
        : this.uploadsService.uploadMultiple(files, entityType, entityId);

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
      this.uploads.update((list) => list.filter((f) => f.id !== file.id));
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  fileIcon(mime: string): string {
    if (mime.startsWith("image/")) return "🖼️";
    if (mime.startsWith("video/")) return "🎬";
    if (mime.startsWith("audio/")) return "🎵";
    if (mime === "application/pdf") return "📄";
    return "📎";
  }
}
