import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeSwitcherComponent } from '../../../shared/ui/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, ThemeSwitcherComponent],
  templateUrl: './auth-shell.component.html',
})
export class AuthShellComponent {
  theme = inject(ThemeService);

  @Input() headline = 'One workplace for the whole team.';
  @Input() lede =
    'Attendance, requests, projects, and staff stay in one place.';
  @Input() points: string[] = [
    'Attendance that records the working day',
    'Requests and projects with a clear trail',
    'One roster for every branch',
  ];
}
