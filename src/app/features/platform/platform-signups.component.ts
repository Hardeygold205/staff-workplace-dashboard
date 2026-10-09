import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { PlatformService } from "../../core/services/platform.service";
import { PageMeta, PlatformOrganization } from "../../core/models/platform.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-platform-signups",
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, BadgeComponent, ButtonComponent, SpinnerComponent],
  templateUrl: "./platform-signups.component.html",
})
export class PlatformSignupsComponent implements OnInit {
  private platform = inject(PlatformService);
  loading = signal(true);
  days = signal(30);
  page = signal(1);
  items = signal<PlatformOrganization[]>([]);
  meta = signal<PageMeta | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.platform.signups({ days: this.days(), page: this.page(), limit: 20 }).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setDays(days: number): void {
    this.days.set(days);
    this.page.set(1);
    this.load();
  }
}
