import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { PlatformService, formatBytes } from "../../core/services/platform.service";
import { PageMeta, PlatformOrganization } from "../../core/models/platform.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-platform-organizations",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent, BadgeComponent, ButtonComponent, SpinnerComponent],
  templateUrl: "./platform-organizations.component.html",
})
export class PlatformOrganizationsComponent implements OnInit {
  private platform = inject(PlatformService);

  loading = signal(true);
  items = signal<PlatformOrganization[]>([]);
  meta = signal<PageMeta | null>(null);
  search = signal("");
  status = signal<"all" | "active" | "suspended">("all");
  page = signal(1);
  formatBytes = formatBytes;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.platform
      .organizations({ search: this.search(), status: this.status(), page: this.page(), limit: 20 })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.meta.set(res.meta);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  changePage(next: number): void {
    this.page.set(next);
    this.load();
  }

  toggle(org: PlatformOrganization): void {
    const next = !org.isActive;
    const verb = next ? "activate" : "suspend";
    if (!confirm(`${verb[0].toUpperCase()}${verb.slice(1)} ${org.name}?`)) return;
    this.platform.setStatus(org.id, next).subscribe(() => this.load());
  }
}
