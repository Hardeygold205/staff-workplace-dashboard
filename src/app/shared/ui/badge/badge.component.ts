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
      success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      brand: 'bg-brand-cream text-brand-green',
    };
    return `${base} ${tones[this.tone]}`;
  }
}
