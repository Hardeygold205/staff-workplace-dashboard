import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PlatformService, formatBytes } from "../../core/services/platform.service";
import { PlatformActivity, PlatformOrganization } from "../../core/models/platform.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-platform-organization-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, CardComponent, BadgeComponent, ButtonComponent, SpinnerComponent],
  templateUrl: "./platform-organization-detail.component.html",
})
export class PlatformOrganizationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private platform = inject(PlatformService);

  loading = signal(true);
  org = signal<PlatformOrganization | null>(null);
  activity = signal<PlatformActivity[]>([]);
  formatBytes = formatBytes;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id") ?? "";
    this.platform.organization(id).subscribe({
      next: (org) => {
        this.org.set(org);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.platform.activity({ organizationId: id, limit: 12 }).subscribe({
      next: (res) => this.activity.set(res.items),
      error: () => {},
    });
  }

  toggle(): void {
    const org = this.org();
    if (!org) return;
    this.platform.setStatus(org.id, !org.isActive).subscribe(() => {
      this.org.set({ ...org, isActive: !org.isActive });
    });
  }
}
