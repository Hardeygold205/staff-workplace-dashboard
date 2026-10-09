import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { environment } from "../../../environments/environment";
import { UploadRecord } from "../models/upload.model";

const BASE = `${environment.apiUrl}/uploads`;

@Injectable({ providedIn: "root" })
export class UploadsService {
  private http = inject(HttpClient);

  fetchBlob(id: string, mimeType: string): Observable<Blob> {
    return this.http
      .get(`${BASE}/${id}/download`, { responseType: "blob" })
      .pipe(map((blob) => new Blob([blob], { type: mimeType || blob.type })));
  }

  upload(
    file: File,
    entityType?: string,
    entityId?: string,
  ): Observable<UploadRecord> {
    const form = new FormData();
    form.append("file", file);
    if (entityType) form.append("entityType", entityType);
    if (entityId) form.append("entityId", entityId);
    return this.http.post<UploadRecord>(BASE, form);
  }

  uploadMultiple(
    files: File[],
    entityType?: string,
    entityId?: string,
  ): Observable<UploadRecord[]> {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    if (entityType) form.append("entityType", entityType);
    if (entityId) form.append("entityId", entityId);
    return this.http.post<UploadRecord[]>(`${BASE}/multiple`, form);
  }

  list(entityType?: string, entityId?: string): Observable<UploadRecord[]> {
    const params: Record<string, string> = {};
    if (entityType) params["entityType"] = entityType;
    if (entityId) params["entityId"] = entityId;
    return this.http.get<UploadRecord[]>(BASE, { params });
  }

  mine(): Observable<UploadRecord[]> {
    return this.http.get<UploadRecord[]>(`${BASE}/me`);
  }

  get(id: string): Observable<UploadRecord> {
    return this.http.get<UploadRecord>(`${BASE}/${id}`);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }

  /**
   * The download endpoint requires the Bearer token, so a plain <a href> won't work —
   * the browser navigating there directly sends no Authorization header. Fetching as a
   * blob lets the auth interceptor attach the token like any other request, then we
   * trigger the actual file-save ourselves.
   */
  download(id: string, filename: string): Observable<void> {
    return new Observable((subscriber) => {
      this.http
        .get(`${BASE}/${id}/download`, { responseType: "blob" })
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
            subscriber.next();
            subscriber.complete();
          },
          error: (err) => subscriber.error(err),
        });
    });
  }
}
