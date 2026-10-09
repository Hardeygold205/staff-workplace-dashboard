import { Component, Input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral';

  classes(): string {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    const tones: Record<BadgeTone, string> = {
      neutral: 'bg-surface-muted text-ink-secondary',
      success: 'bg-success-soft text-success-ink',
      warning: 'bg-warning-soft text-warning-ink',
      danger: 'bg-danger-soft text-danger-ink',
      info: 'bg-info-soft text-info-ink',
      brand: 'bg-accent-soft text-accent-ink',
    };
    return `${base} ${tones[this.tone]}`;
  }
}
