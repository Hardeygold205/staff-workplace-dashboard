import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="classes()"
    >
      @if (loading) {
        <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60';
    const width = this.fullWidth ? ' w-full' : '';
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-brand-green text-white hover:bg-brand-green-dark',
      secondary: 'bg-surface-muted text-ink border border-line hover:bg-surface-elevated',
      ghost: 'text-ink-secondary hover:bg-surface-muted',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    return base + width + ' ' + variants[this.variant];
  }
}
