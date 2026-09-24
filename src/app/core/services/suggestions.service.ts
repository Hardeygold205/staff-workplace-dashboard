import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import {
  ApiResponse,
  CreateSuggestionPayload,
  Suggestion,
  UpdateSuggestionStatusPayload,
  VoteType,
} from "../models/suggestion.model";

const BASE = `${environment.apiUrl}/suggestions`;

@Injectable({ providedIn: "root" })
export class SuggestionsService {
  private http = inject(HttpClient);

  list(): Observable<Suggestion[]> {
    return this.http.get<ApiResponse<Suggestion[]> | Suggestion[]>(BASE).pipe(
      map((res: any) => {
        // Fallback check: handles unwrapped arrays or wrapped ApiResponse object
        if (Array.isArray(res)) return res;
        return res?.data ?? [];
      }),
    );
  }

  create(payload: CreateSuggestionPayload): Observable<Suggestion> {
    return this.http
      .post<ApiResponse<Suggestion> | Suggestion>(BASE, payload)
      .pipe(map((res: any) => res?.data ?? res));
  }

  vote(id: string, type: VoteType): Observable<Suggestion> {
    return this.http
      .post<
        ApiResponse<Suggestion> | Suggestion
      >(`${BASE}/${id}/vote`, { type })
      .pipe(map((res: any) => res?.data ?? res));
  }

  updateStatus(
    id: string,
    payload: UpdateSuggestionStatusPayload,
  ): Observable<Suggestion> {
    return this.http
      .patch<
        ApiResponse<Suggestion> | Suggestion
      >(`${BASE}/${id}/status`, payload)
      .pipe(map((res: any) => res?.data ?? res));
  }
}
