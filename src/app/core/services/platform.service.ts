import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  PageMeta,
  PlatformActivity,
  PlatformOrganization,
  PlatformOverview,
} from "../models/platform.model";

const BASE = `${environment.apiUrl}/platform`;

@Injectable({ providedIn: "root" })
export class PlatformService {
  private http = inject(HttpClient);

  overview(): Observable<PlatformOverview> {
    return this.http.get<PlatformOverview>(`${BASE}/overview`);
  }

  organizations(query: {
    search?: string;
    status?: "active" | "suspended" | "all";
    page?: number;
    limit?: number;
  }): Observable<{ items: PlatformOrganization[]; meta: PageMeta }> {
    return this.http.get<{ items: PlatformOrganization[]; meta: PageMeta }>(
      `${BASE}/organizations`,
      { params: this.params(query) },
    );
  }

  organization(id: string): Observable<PlatformOrganization> {
    return this.http.get<PlatformOrganization>(`${BASE}/organizations/${id}`);
  }

  signups(query: { days?: number; page?: number; limit?: number }): Observable<{
    items: PlatformOrganization[];
    meta: PageMeta;
  }> {
    return this.http.get<{ items: PlatformOrganization[]; meta: PageMeta }>(
      `${BASE}/signups`,
      { params: this.params(query) },
    );
  }

  activity(query: {
    organizationId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Observable<{ items: PlatformActivity[]; meta: PageMeta }> {
    return this.http.get<{ items: PlatformActivity[]; meta: PageMeta }>(
      `${BASE}/activity`,
      { params: this.params(query) },
    );
  }

  setStatus(id: string, isActive: boolean): Observable<unknown> {
    return this.http.patch(`${environment.apiUrl}/organizations/${id}/status`, { isActive });
  }

  private params(query: object): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        params = params.set(key, String(value));
      }
    }
    return params;
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}
