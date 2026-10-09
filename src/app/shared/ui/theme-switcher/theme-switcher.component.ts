import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeId, ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        type="button"
        class="theme-trigger"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        aria-label="Color theme"
        (click)="open.set(!open())">
        <span class="swatch" [class]="'swatch swatch-' + theme.theme()"></span>
        <span class="hidden sm:inline">{{ theme.current().label }}</span>
      </button>

      @if (open()) {
        <div class="theme-menu" role="listbox" aria-label="Color themes">
          @for (option of theme.options; track option.id) {
            <button
              type="button"
              class="theme-option"
              role="option"
              [class.is-selected]="theme.theme() === option.id"
              [attr.aria-selected]="theme.theme() === option.id"
              (click)="choose(option.id)">
              <span class="swatch" [class]="'swatch swatch-' + option.id"></span>
              <span>
                {{ option.label }}
                <small>{{ option.description }}</small>
              </span>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class ThemeSwitcherComponent {
  theme = inject(ThemeService);
  private host = inject(ElementRef<HTMLElement>);
  open = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  choose(id: ThemeId): void {
    this.theme.set(id);
    this.open.set(false);
  }
}
