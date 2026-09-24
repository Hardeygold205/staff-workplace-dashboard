import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'exaf_sidebar_collapsed';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly collapsed = signal<boolean>(localStorage.getItem(STORAGE_KEY) === 'true');
  /** Separate from `collapsed` — this is the mobile off-canvas open/close state. */
  readonly mobileOpen = signal<boolean>(false);

  toggle(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  toggleMobile(): void {
    this.mobileOpen.set(!this.mobileOpen());
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
