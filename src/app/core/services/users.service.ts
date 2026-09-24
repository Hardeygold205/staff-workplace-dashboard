import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  AdminUpdateUserPayload,
  CreateUserPayload,
  SetUserPermissionsPayload,
  UpdateMePayload,
  User,
  UserPermissionOverride,
} from "../models/user.model";

const BASE = `${environment.apiUrl}/users`;

@Injectable({ providedIn: "root" })
export class UsersService {
  private http = inject(HttpClient);

  create(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(BASE, payload);
  }

  list(): Observable<User[]> {
    return this.http.get<User[]>(BASE);
  }

  me(): Observable<User> {
    return this.http.get<User>(`${BASE}/me`);
  }

  updateMe(payload: UpdateMePayload): Observable<User> {
    return this.http.patch<User>(`${BASE}/me`, payload);
  }

  uploadAvatar(file: File): Observable<User> {
    const form = new FormData();
    form.append("file", file);
    return this.http.post<User>(`${BASE}/me/avatar`, form);
  }

  emails(): Observable<
    { email: string; firstName: string; lastName: string }[]
  > {
    return this.http.get<
      { email: string; firstName: string; lastName: string }[]
    >(`${BASE}/emails`);
  }

  adminUpdate(id: string, payload: AdminUpdateUserPayload): Observable<User> {
    return this.http.patch<User>(`${BASE}/${id}`, payload);
  }

  setPermissions(
    id: string,
    payload: SetUserPermissionsPayload,
  ): Observable<UserPermissionOverride[]> {
    return this.http.patch<UserPermissionOverride[]>(
      `${BASE}/${id}/permissions`,
      payload,
    );
  }

  setAttendanceExemption(id: string, exempt: boolean): Observable<User> {
    return this.http.patch<User>(`${BASE}/${id}/attendance-exemption`, {
      exempt,
    });
  }

  resetPassword(id: string): Observable<{ temporaryPassword?: string }> {
    return this.http.post<{ temporaryPassword?: string }>(
      `${BASE}/${id}/reset-password`,
      {},
    );
  }

  deactivate(id: string): Observable<User> {
    return this.http.patch<User>(`${BASE}/${id}/deactivate`, {});
  }
}
