import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  Organization,
  OrganizationSettings,
  RegisterOrganizationPayload,
  UpdateOrganizationPayload,
} from "../models/organization.model";
import { LoginResponse } from "../models/auth.model";

const BASE = `${environment.apiUrl}/organizations`;

@Injectable({ providedIn: "root" })
export class OrganizationsService {
  private http = inject(HttpClient);
  readonly current = signal<Organization | null>(null);

  register(payload: RegisterOrganizationPayload): Observable<LoginResponse & { organization: { id: string; name: string; slug: string } }> {
    return this.http.post<LoginResponse & { organization: { id: string; name: string; slug: string } }>(
      `${environment.apiUrl}/auth/register-organization`,
      payload,
    );
  }

  mine(): Observable<Organization> {
    return this.http.get<Organization>(`${BASE}/me`).pipe(tap((org) => this.current.set(org)));
  }

  update(payload: UpdateOrganizationPayload): Observable<Organization> {
    return this.http.patch<Organization>(`${BASE}/me`, payload).pipe(tap((org) => this.current.set(org)));
  }

  updateSettings(payload: Partial<OrganizationSettings>): Observable<OrganizationSettings> {
    return this.http.patch<OrganizationSettings>(`${BASE}/me/settings`, payload);
  }

  uploadLogo(file: File): Observable<Organization> {
    const form = new FormData();
    form.append("file", file);
    return this.http.post<Organization>(`${BASE}/me/logo`, form).pipe(tap((org) => this.current.set(org)));
  }

  uploadIcon(file: File): Observable<Organization> {
    const form = new FormData();
    form.append("file", file);
    return this.http.post<Organization>(`${BASE}/me/icon`, form).pipe(tap((org) => this.current.set(org)));
  }
}
