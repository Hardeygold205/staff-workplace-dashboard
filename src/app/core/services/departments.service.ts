import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface DepartmentHead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  headUserId?: string | null;
  headUser?: DepartmentHead | null;
  isActive: boolean;
  _count?: { users: number; projects: number };
}

export interface DepartmentPayload {
  name?: string;
  description?: string;
  headUserId?: string | null;
  isActive?: boolean;
}

const BASE = `${environment.apiUrl}/departments`;

@Injectable({ providedIn: "root" })
export class DepartmentsService {
  private http = inject(HttpClient);

  list(): Observable<Department[]> {
    return this.http.get<Department[]>(BASE);
  }

  create(payload: DepartmentPayload): Observable<Department> {
    return this.http.post<Department>(BASE, payload);
  }

  update(id: string, payload: DepartmentPayload): Observable<Department> {
    return this.http.patch<Department>(`${BASE}/${id}`, payload);
  }

  deactivate(id: string): Observable<Department> {
    return this.http.patch<Department>(`${BASE}/${id}/deactivate`, {});
  }
}
