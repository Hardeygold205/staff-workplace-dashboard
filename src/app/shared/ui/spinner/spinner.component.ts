import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center py-10">
      <span
        class="inline-block animate-spin rounded-full border-2 border-line border-t-brand-green"
        [style.width.px]="size"
        [style.height.px]="size"
      ></span>
    </div>
  `,
})
export class SpinnerComponent {
  @Input() size = 24;
}
