import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export interface Invitation {
  id: string;
  email: string;
  status: InvitationStatus;
  token?: string;
  expiresAt: string;
  createdAt: string;
  role?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
}

export interface CreateInvitationPayload {
  email: string;
  roleId?: string;
  departmentId?: string;
}

const BASE = `${environment.apiUrl}/invitations`;

@Injectable({ providedIn: "root" })
export class InvitationsService {
  private http = inject(HttpClient);

  list(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(BASE);
  }

  create(payload: CreateInvitationPayload): Observable<Invitation> {
    return this.http.post<Invitation>(BASE, payload);
  }

  cancel(id: string): Observable<Invitation> {
    return this.http.patch<Invitation>(`${BASE}/${id}/cancel`, {});
  }
}
