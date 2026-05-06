import { Injectable, computed, inject, signal } from '@angular/core';
import { findCurrency } from './currency-catalog';
import { AuthService } from './auth.service';
import { TalentApiService } from './talent-api.service';
import { CompanySettings } from './models';

const CACHE_KEY = 'talentmanager.currency';

/**
 * Single source of truth for the workspace currency.
 * Pages subscribe to {@code code()} so changes in Settings propagate everywhere.
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(TalentApiService);

  private readonly state = signal<string>(this.readCache());

  readonly code = this.state.asReadonly();
  readonly symbol = computed(() => findCurrency(this.state())?.symbol ?? this.state());

  /** Apply the currency code coming from the backend (or after a settings save). */
  set(code: string) {
    if (!code) return;
    const normalized = code.trim().toUpperCase();
    this.state.set(normalized);
    try { localStorage.setItem(CACHE_KEY, normalized); } catch { /* ignore */ }
  }

  /** Convenience: pull settings for the active company and cache the currency. */
  refresh() {
    const companyId = this.auth.companyId();
    if (!companyId) return;
    this.api.getCompanySettings(companyId).subscribe({
      next: (settings: CompanySettings) => this.set(settings.currencyCode || 'USD')
    });
  }

  private readCache(): string {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return cached;
    } catch { /* ignore */ }
    return 'USD';
  }
}
