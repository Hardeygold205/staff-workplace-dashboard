import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { NotificationsService } from "../../core/services/notifications.service";
import { AppNotification } from "../../core/models/notification.model";
import { PageHeaderComponent } from "../../shared/ui/page-header/page-header.component";
import { CardComponent } from "../../shared/ui/card/card.component";
import { ButtonComponent } from "../../shared/ui/button/button.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: "./notifications.component.html",
})
export class NotificationsComponent implements OnInit {
  service = inject(NotificationsService);
  loading = signal(true);
  notifications = signal<AppNotification[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (res) => {
        this.notifications.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markAllRead(): void {
    this.service.markAllRead().subscribe(() => this.load());
  }

  markRead(n: AppNotification): void {
    if (n.isRead) return;
    this.service.markRead(n.id).subscribe(() => {
      this.notifications.update((list) =>
        list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
      );
    });
  }
}
