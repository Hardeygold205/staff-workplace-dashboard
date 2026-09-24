import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <p class="text-sm font-medium text-ink-secondary">{{ title }}</p>
      @if (subtitle) {
        <p class="max-w-sm text-xs text-ink-muted">{{ subtitle }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() subtitle?: string;
}
