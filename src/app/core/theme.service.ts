import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'talentmanager.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeState = signal<ThemeMode>(this.initialTheme());

  readonly theme = this.themeState.asReadonly();

  constructor() {
    effect(() => {
      const theme = this.themeState();
      document.documentElement.dataset['theme'] = theme;
      localStorage.setItem(THEME_KEY, theme);
    });
  }

  toggle() {
    this.themeState.set(this.themeState() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode) {
    this.themeState.set(theme);
  }

  private initialTheme(): ThemeMode {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
