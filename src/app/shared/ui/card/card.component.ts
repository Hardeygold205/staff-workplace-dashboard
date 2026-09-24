import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="rounded-xl border border-line bg-surface-elevated shadow-sm" [class.p-5]="padded">
      @if (title) {
        <div class="mb-3 flex items-center justify-between" [class.px-5]="!padded" [class.pt-5]="!padded">
          <h3 class="text-sm font-semibold text-ink">{{ title }}</h3>
          <ng-content select="[card-action]" />
        </div>
      }
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  @Input() title?: string;
  @Input() padded = true;
}
