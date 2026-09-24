import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { finalize } from "rxjs";
import { SuggestionsService } from "../../core/services/suggestions.service";
import { AuthService } from "../../core/services/auth.service";
import {
  Suggestion,
  SuggestionStatus,
  VoteType,
} from "../../core/models/suggestion.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { ModalComponent } from "../../shared/ui/modal/modal.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

const STATUS_OPTIONS: SuggestionStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "IMPLEMENTED",
  "DECLINED",
];

@Component({
  selector: "app-suggestions",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: "./suggestions.component.html",
})
export class SuggestionsComponent implements OnInit {
  private suggestionsService = inject(SuggestionsService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  statusOptions = STATUS_OPTIONS;
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  suggestions = signal<Suggestion[]>([]);

  form = this.fb.nonNullable.group({
    title: ["", [Validators.required, Validators.minLength(3)]],
    content: ["", [Validators.required, Validators.minLength(3)]],
    isAnonymous: [false],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.suggestionsService
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => {
          this.suggestions.set(list ?? []);
        },
        error: (err) => {
          console.error("Failed to fetch suggestions:", err);
          this.error.set(err?.error?.message ?? "Could not load suggestions.");
        },
      });
  }

  openForm(): void {
    this.form.reset({ title: "", content: "", isAnonymous: false });
    this.error.set(null);
    this.showForm.set(true);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.submitting.set(true);
    this.suggestionsService
      .create({
        title: raw.title,
        content: raw.content,
        isAnonymous: raw.isAnonymous,
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.showForm.set(false);
          this.load();
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? "Could not submit suggestion.");
        },
      });
  }

  vote(suggestion: Suggestion, type: VoteType): void {
    this.suggestionsService.vote(suggestion.id, type).subscribe({
      next: (updated) => {
        this.suggestions.update((list) =>
          list.map((s) => (s.id === suggestion.id ? updated : s)),
        );
      },
      error: (err) => console.error("Failed to submit vote:", err),
    });
  }

  setStatus(suggestion: Suggestion, status: SuggestionStatus): void {
    this.suggestionsService.updateStatus(suggestion.id, { status }).subscribe({
      next: (updated) => {
        this.suggestions.update((list) =>
          list.map((s) => (s.id === suggestion.id ? updated : s)),
        );
      },
      error: (err) => console.error("Failed to update status:", err),
    });
  }

  statusTone(
    status: SuggestionStatus,
  ): "success" | "warning" | "neutral" | "info" | "danger" {
    if (status === "IMPLEMENTED") return "success";
    if (status === "UNDER_REVIEW") return "warning";
    if (status === "DECLINED") return "danger";
    return "neutral";
  }
}
