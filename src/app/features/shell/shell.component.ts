import { Component, OnInit, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { CurrencyService } from '../../core/currency.service';
import { I18nService } from '../../core/i18n.service';
import { ThemeService } from '../../core/theme.service';

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  hintKey: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    NgIf,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly currency = inject(CurrencyService);
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);

  readonly session = this.auth.session;

  ngOnInit() {
    // Pull the workspace currency once the shell mounts; the cached value
    // already covers the very first render so KPIs never flash USD.
    this.currency.refresh();
  }

  readonly initials = computed(() => {
    const username = this.session()?.username ?? '';
    if (!username) return '?';
    const cleaned = username.split('@')[0];
    const parts = cleaned.split(/[\.\-_\s]+/).filter(Boolean);
    const letters = parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`
      : cleaned.slice(0, 2);
    return letters.toUpperCase();
  });

  readonly displayName = computed(() => {
    const username = this.session()?.username ?? '';
    return username.split('@')[0] || username;
  });

  readonly navItems: NavItem[] = [
    { path: '/app/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard', hintKey: 'nav.dashboardHint' },
    { path: '/app/employees', labelKey: 'nav.employees', icon: 'groups', hintKey: 'nav.employeesHint' },
    { path: '/app/reports', labelKey: 'nav.reports', icon: 'insights', hintKey: 'nav.reportsHint' },
    { path: '/app/support', labelKey: 'nav.support', icon: 'support_agent', hintKey: 'nav.supportHint' },
    { path: '/app/settings', labelKey: 'nav.settings', icon: 'tune', hintKey: 'nav.settingsHint' }
  ];

  /** Routes that don't appear in the sidebar but still need a topbar label. */
  private readonly extraRoutes: NavItem[] = [
    { path: '/app/profile', labelKey: 'nav.profile', icon: 'person', hintKey: 'nav.profileHint' }
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly currentNav = computed<NavItem>(() => {
    const url = this.currentUrl();
    return this.extraRoutes.find(item => url.startsWith(item.path))
        ?? this.navItems.find(item => url.startsWith(item.path))
        ?? this.navItems[0];
  });

  toggleTheme() {
    this.theme.toggle();
  }

  toggleLanguage() {
    this.i18n.toggle();
  }

  openProfile() {
    this.router.navigateByUrl('/app/profile');
  }

  signOut() {
    this.auth.signOut();
  }
}
