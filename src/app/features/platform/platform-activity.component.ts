import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PlatformService } from "../../core/services/platform.service";
import { PageMeta, PlatformActivity } from "../../core/models/platform.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-platform-activity",
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ButtonComponent, SpinnerComponent],
  templateUrl: "./platform-activity.component.html",
})
export class PlatformActivityComponent implements OnInit {
  private platform = inject(PlatformService);
  loading = signal(true);
  page = signal(1);
  items = signal<PlatformActivity[]>([]);
  meta = signal<PageMeta | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.platform.activity({ page: this.page(), limit: 30 }).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changePage(next: number): void {
    this.page.set(next);
    this.load();
  }
}
