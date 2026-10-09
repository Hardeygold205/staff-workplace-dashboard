import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { PlatformService, formatBytes } from "../../core/services/platform.service";
import { PlatformActivity, PlatformOrganization, PlatformOverview } from "../../core/models/platform.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-platform-overview",
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, CardComponent, BadgeComponent, SpinnerComponent],
  templateUrl: "./platform-overview.component.html",
})
export class PlatformOverviewComponent implements OnInit {
  private platform = inject(PlatformService);

  loading = signal(true);
  error = signal<string | null>(null);
  overview = signal<PlatformOverview | null>(null);
  recent = signal<PlatformOrganization[]>([]);
  activity = signal<PlatformActivity[]>([]);
  formatBytes = formatBytes;
  Math = Math;

  maxSignup = computed(() => Math.max(1, ...(this.overview()?.signupsByDay.map((d) => d.count) ?? [1])));

  ngOnInit(): void {
    this.platform.overview().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? "Could not load platform overview.");
      },
    });
    this.platform.signups({ days: 30, limit: 6 }).subscribe({
      next: (res) => this.recent.set(res.items),
      error: () => {},
    });
    this.platform.activity({ limit: 8 }).subscribe({
      next: (res) => this.activity.set(res.items),
      error: () => {},
    });
  }
}
