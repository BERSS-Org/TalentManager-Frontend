import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'es' | 'en';

const LANGUAGE_KEY = 'talentmanager.lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly translate = inject(TranslateService);
  private readonly languageState = signal<AppLanguage>(this.initialLanguage());

  readonly language = this.languageState.asReadonly();
  readonly nextLanguage = computed<AppLanguage>(() => this.languageState() === 'es' ? 'en' : 'es');

  constructor() {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    this.use(this.languageState());
  }

  use(language: AppLanguage) {
    this.languageState.set(language);
    this.translate.use(language);
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }

  toggle() {
    this.use(this.nextLanguage());
  }

  t(key: string, params?: Record<string, unknown>) {
    return this.translate.instant(key, params);
  }

  private initialLanguage(): AppLanguage {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === 'es' || stored === 'en') return stored;

    const browser = navigator.language.toLowerCase();
    return browser.startsWith('en') ? 'en' : 'es';
  }
}
