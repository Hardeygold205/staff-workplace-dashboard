import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface OfficeBranch {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  isActive: boolean;
}

export interface BranchPayload {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
}

const BASE = `${environment.apiUrl}/branches`;

@Injectable({ providedIn: "root" })
export class BranchesService {
  private http = inject(HttpClient);

  list(): Observable<OfficeBranch[]> {
    return this.http.get<OfficeBranch[]>(BASE);
  }

  create(payload: BranchPayload): Observable<OfficeBranch> {
    return this.http.post<OfficeBranch>(BASE, payload);
  }

  update(id: string, payload: BranchPayload): Observable<OfficeBranch> {
    return this.http.patch<OfficeBranch>(`${BASE}/${id}`, payload);
  }

  deactivate(id: string): Observable<OfficeBranch> {
    return this.http.patch<OfficeBranch>(`${BASE}/${id}/deactivate`, {});
  }
}
