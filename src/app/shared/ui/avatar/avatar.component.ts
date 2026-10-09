import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    @if (src) {
      <img [src]="src" [alt]="name" class="rounded-full object-cover" [style.width.px]="size" [style.height.px]="size" />
    } @else {
      <div
        class="flex items-center justify-center rounded-full bg-accent font-semibold text-accent-contrast"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.fontSize.px]="size / 2.4"
      >
        {{ initialsOf(name) }}
      </div>
    }
  `,
})
export class AvatarComponent {
  @Input() src?: string | null;
  @Input() name = '';
  @Input() size = 36;

  initialsOf(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('');
  }
}
