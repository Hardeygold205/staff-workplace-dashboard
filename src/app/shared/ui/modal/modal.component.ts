import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-overlay"
          (click)="dismissible && close.emit()"
        ></div>
        <div class="relative w-full max-w-md rounded-2xl border border-line bg-surface-elevated p-6 shadow-xl">
          @if (title) {
            <h2 class="mb-4 text-lg font-semibold text-ink">{{ title }}</h2>
          }
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title?: string;
  /** Set false for reminder-style modals the user must act on rather than click away from. */
  @Input() dismissible = true;
  @Output() close = new EventEmitter<void>();
}
