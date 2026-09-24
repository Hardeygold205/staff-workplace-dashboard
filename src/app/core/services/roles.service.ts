import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateRolePayload, Permission, Role, SetRolePermissionsPayload } from '../models/role.model';

const BASE = `${environment.apiUrl}/roles`;

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);

  list(): Observable<Role[]> {
    return this.http.get<Role[]>(BASE);
  }

  create(payload: CreateRolePayload): Observable<Role> {
    return this.http.post<Role>(BASE, payload);
  }

  permissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${BASE}/permissions`);
  }

  setPermissions(id: string, payload: SetRolePermissionsPayload): Observable<Role> {
    return this.http.patch<Role>(`${BASE}/${id}/permissions`, payload);
  }
}
