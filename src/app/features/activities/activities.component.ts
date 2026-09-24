import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivitiesService } from "../../core/services/activities.service";
import { AuthService } from "../../core/services/auth.service";
import { ActivityLog } from "../../core/models/activity.model";
import { PaginationMeta } from "../../core/models/pagination.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

export type ActivityViewMode = "ALL" | "MINE";

@Component({
  selector: "app-activities",
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: "./activities.component.html",
})
export class ActivitiesComponent implements OnInit {
  private activitiesService = inject(ActivitiesService);
  auth = inject(AuthService);

  loading = signal(true);
  logs = signal<ActivityLog[]>([]);
  meta = signal<PaginationMeta | null>(null);
  page = signal(1);

  // Users with 'activities:view_all' can toggle between 'ALL' and 'MINE'
  viewMode = signal<ActivityViewMode>("MINE");

  canViewAll = computed(() => this.auth.hasPermission("activities:view_all"));

  ngOnInit(): void {
    // Default to ALL if permitted, otherwise force MINE
    if (this.canViewAll()) {
      this.viewMode.set("ALL");
    } else {
      this.viewMode.set("MINE");
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);

    const isViewingAll = this.canViewAll() && this.viewMode() === "ALL";
    const fetch$ = isViewingAll
      ? this.activitiesService.all(this.page())
      : this.activitiesService.mine(this.page());

    fetch$.subscribe({
      next: (res) => {
        this.logs.set(res.items);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  switchViewMode(mode: ActivityViewMode): void {
    if (!this.canViewAll() && mode === "ALL") return;
    if (this.viewMode() === mode) return;

    this.viewMode.set(mode);
    this.page.set(1);
    this.load();
  }

  prevPage(): void {
    if (this.page() <= 1) return;
    this.page.update((p) => p - 1);
    this.load();
  }

  nextPage(): void {
    const meta = this.meta();
    if (!meta || this.page() >= meta.totalPages) return;
    this.page.update((p) => p + 1);
    this.load();
  }

  getActionTone(action: string): "brand" | "success" | "neutral" {
    const act = action.toUpperCase();
    if (
      act.includes("CREATE") ||
      act.includes("ADD") ||
      act.includes("LOGIN")
    ) {
      return "success";
    }
    if (
      act.includes("DELETE") ||
      act.includes("REMOVE") ||
      act.includes("REVOKE")
    ) {
      return "neutral";
    }
    return "brand";
  }
}
