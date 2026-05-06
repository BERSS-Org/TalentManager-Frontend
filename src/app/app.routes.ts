import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EmployeesComponent } from './features/employees/employees.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ReportsComponent } from './features/reports/reports.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ShellComponent } from './features/shell/shell.component';
import { SupportComponent } from './features/support/support.component';

export const routes: Routes = [
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  { path: 'login', component: AuthPageComponent, data: { mode: 'login' } },
  { path: 'register', component: AuthPageComponent, data: { mode: 'register' } },
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'support', component: SupportComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { path: '**', redirectTo: 'app/dashboard' }
];
