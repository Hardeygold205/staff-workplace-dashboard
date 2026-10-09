import { Injectable, computed, signal } from '@angular/core';

export type ThemeId = 'paper' | 'ink' | 'forest' | 'cream' | 'slate';
/** @deprecated Use ThemeId. Kept so older imports still compile. */
export type Theme = ThemeId;

export interface ThemeOption {
  id: ThemeId;
  label: string;
  description: string;
  dark: boolean;
}

export const THEMES: readonly ThemeOption[] = [
  { id: 'paper', label: 'Paper', description: 'White, with forest green', dark: false },
  { id: 'ink', label: 'Ink', description: 'Night, same green', dark: true },
  { id: 'forest', label: 'Forest', description: 'Deep green and cream', dark: true },
  { id: 'cream', label: 'Cream', description: 'Warm daylight', dark: false },
  { id: 'slate', label: 'Slate', description: 'Cool neutral, forest green', dark: false },
];

const STORAGE_KEY = 'exaf_theme';
const IDS = new Set<string>(THEMES.map((theme) => theme.id));

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeId>(this.resolveInitialTheme());
  readonly current = computed(
    () => THEMES.find((theme) => theme.id === this.theme()) ?? THEMES[0],
  );
  readonly isDark = computed(() => this.current().dark);
  readonly options = THEMES;

  constructor() {
    this.apply(this.theme());
  }

  logoSrc(): string {
    return this.isDark() ? 'assets/logo-light.svg' : 'assets/logo.svg';
  }

  toggle(): void {
    const index = THEMES.findIndex((theme) => theme.id === this.theme());
    this.set(THEMES[(index + 1) % THEMES.length].id);
  }

  set(theme: ThemeId): void {
    this.theme.set(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.apply(theme);
  }

  private apply(theme: ThemeId): void {
    const option = THEMES.find((item) => item.id === theme) ?? THEMES[0];
    const root = document.documentElement;
    root.dataset.theme = option.id;
    root.classList.toggle('dark', option.dark);
    root.style.colorScheme = option.dark ? 'dark' : 'light';
  }

  private resolveInitialTheme(): ThemeId {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light') return 'paper';
    if (stored === 'dark') return 'ink';
    if (stored && IDS.has(stored)) return stored as ThemeId;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'ink' : 'paper';
  }
}
