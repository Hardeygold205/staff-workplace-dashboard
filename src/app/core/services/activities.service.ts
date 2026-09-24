import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ActivityLog } from "../models/activity.model";
import { PaginatedResult } from "../models/pagination.model";

const BASE = `${environment.apiUrl}/activities`;

@Injectable({ providedIn: "root" })
export class ActivitiesService {
  private http = inject(HttpClient);

  mine(page = 1, limit = 20): Observable<PaginatedResult<ActivityLog>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());

    return this.http.get<PaginatedResult<ActivityLog>>(`${BASE}/me`, {
      params,
    });
  }

  all(page = 1, limit = 20): Observable<PaginatedResult<ActivityLog>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());

    return this.http.get<PaginatedResult<ActivityLog>>(BASE, { params });
  }
}
