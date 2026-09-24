import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreentimeService } from '../../core/services/screentime.service';
import { AuthService } from '../../core/services/auth.service';
import { ScreentimeLog } from '../../core/models/screentime.model';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-screentime',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CardComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './screentime.component.html',
})
export class ScreentimeComponent implements OnInit {
  private screentimeService = inject(ScreentimeService);
  auth = inject(AuthService);

  loading = signal(true);
  mine = signal<ScreentimeLog[]>([]);
  all = signal<ScreentimeLog[]>([]);

  ngOnInit(): void {
    this.screentimeService.mine().subscribe({
      next: (logs) => {
        this.mine.set(logs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    if (this.auth.hasPermission('attendance:view_all')) {
      this.screentimeService.all().subscribe((logs) => this.all.set(logs));
    }
  }

  hours(seconds: number): string {
    return (seconds / 3600).toFixed(1) + 'h';
  }

  activePercent(log: ScreentimeLog): number {
    const total = log.activeSeconds + log.idleSeconds;
    return total === 0 ? 0 : Math.round((log.activeSeconds / total) * 100);
  }
}
