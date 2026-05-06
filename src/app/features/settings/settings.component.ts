import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { CURRENCY_CATALOG, CurrencyOption, currencyLabel, findCurrency } from '../../core/currency-catalog';
import { CurrencyService } from '../../core/currency.service';
import { I18nService } from '../../core/i18n.service';
import { CompanySettings, Employee, EmployeeDraft } from '../../core/models';
import { TalentApiService } from '../../core/talent-api.service';
import { CurrencyChangeDialogComponent } from './currency-change-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    CurrencyPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TalentApiService);
  private readonly auth = inject(AuthService);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly currencyService = inject(CurrencyService);
  private readonly i18n = inject(I18nService);
  private readonly translate = inject(TranslateService);

  readonly companyId = this.auth.companyId() ?? 1;
  readonly loading = signal(true);
  readonly savingCompany = signal(false);
  readonly savingRoster = signal<number | null>(null);
  readonly settings = signal<CompanySettings | null>(null);
  readonly employees = signal<Employee[]>([]);

  readonly currencySearch = signal('');
  readonly currencies: CurrencyOption[] = CURRENCY_CATALOG;

  readonly filteredCurrencies = computed<CurrencyOption[]>(() => {
    const query = this.normalize(this.currencySearch());
    if (!query) return this.currencies;
    return this.currencies.filter(option =>
      this.normalize(option.code).includes(query) ||
      this.normalize(option.nameEs).includes(query) ||
      this.normalize(option.nameEn).includes(query)
    );
  });

  private readonly companyTrigger = signal(0);

  readonly companyForm = this.fb.nonNullable.group({
    expectedDailyHours: [8, [Validators.required, Validators.min(1), Validators.max(24)]],
    workingDaysPerMonth: [21, [Validators.required, Validators.min(1), Validators.max(31)]],
    currencyCode: ['USD', [Validators.required]],
    defaultHourlyRate: [0, [Validators.required, Validators.min(0)]],
    defaultHourlyCost: [0, [Validators.required, Validators.min(0)]]
  });

  readonly monthlyTarget = computed(() => {
    this.companyTrigger();
    const values = this.companyForm.getRawValue();
    return Math.round((values.expectedDailyHours ?? 0) * (values.workingDaysPerMonth ?? 0));
  });

  readonly defaultMargin = computed(() => {
    this.companyTrigger();
    const values = this.companyForm.getRawValue();
    return Math.max(0, (values.defaultHourlyRate ?? 0) - (values.defaultHourlyCost ?? 0));
  });

  /** The persisted currency code (used for monetary formatting). */
  readonly persistedCurrency = this.currencyService.code;

  /** Cache of FormGroups so the template never instantiates a new one per render. */
  readonly rosterForms = new Map<number, ReturnType<SettingsComponent['rosterForm']>>();

  rosterForm(employee: Employee) {
    return this.fb.nonNullable.group({
      hourlyRate: [employee.hourlyRate ?? 0, [Validators.required, Validators.min(0)]],
      hourlyCost: [employee.hourlyCost ?? 0, [Validators.required, Validators.min(0)]]
    });
  }

  formFor(employee: Employee) {
    let form = this.rosterForms.get(employee.id);
    if (!form) {
      form = this.rosterForm(employee);
      this.rosterForms.set(employee.id, form);
    }
    return form;
  }

  marginFor(form: ReturnType<SettingsComponent['rosterForm']>) {
    const rate = form.controls.hourlyRate.value ?? 0;
    const cost = form.controls.hourlyCost.value ?? 0;
    return Math.max(0, rate - cost);
  }

  ngOnInit() {
    this.companyForm.valueChanges.subscribe(() => this.companyTrigger.update(v => v + 1));
    this.loadAll();
  }

  saveCompany() {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }
    const values = this.companyForm.getRawValue();
    const newCurrency = (values.currencyCode || 'USD').toUpperCase();
    const previousCurrency = (this.settings()?.currencyCode ?? this.persistedCurrency() ?? 'USD').toUpperCase();

    if (newCurrency !== previousCurrency) {
      this.confirmCurrencyChange(newCurrency, previousCurrency).then(confirmed => {
        if (confirmed) {
          this.persistCompany(values, newCurrency);
        } else {
          // Revert the dropdown to the persisted currency.
          this.companyForm.patchValue({ currencyCode: previousCurrency });
        }
      });
      return;
    }

    this.persistCompany(values, newCurrency);
  }

  saveRosterRow(employee: Employee) {
    const form = this.formFor(employee);
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    const values = form.getRawValue();
    this.savingRoster.set(employee.id);

    const payload: EmployeeDraft = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      occupation: employee.occupation,
      registrationDate: employee.registrationDate,
      teamName: employee.teamName,
      companyId: this.companyId,
      hourlyRate: values.hourlyRate ?? 0,
      hourlyCost: values.hourlyCost ?? 0
    };

    this.api.updateEmployee(employee.id, payload).subscribe({
      next: updated => {
        this.employees.set(this.employees().map(e => e.id === updated.id ? updated : e));
        this.savingRoster.set(null);
        this.snack.open(this.translate.instant('settings.rosterUpdated'), 'OK', { duration: 2200 });
      },
      error: () => {
        this.savingRoster.set(null);
        this.snack.open(this.translate.instant('settings.errorToast'), 'OK', { duration: 3000 });
      }
    });
  }

  initials(employee: Employee) {
    return `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();
  }

  fullName(employee: Employee) {
    return `${employee.firstName} ${employee.lastName}`;
  }

  monthlyRate(employee: Employee) {
    const dailyHours = this.companyForm.controls.expectedDailyHours.value ?? 8;
    const days = this.companyForm.controls.workingDaysPerMonth.value ?? 21;
    const form = this.formFor(employee);
    const rate = form.controls.hourlyRate.value || 0;
    return rate * dailyHours * days;
  }

  monthlyCost(employee: Employee) {
    const dailyHours = this.companyForm.controls.expectedDailyHours.value ?? 8;
    const days = this.companyForm.controls.workingDaysPerMonth.value ?? 21;
    const form = this.formFor(employee);
    const cost = form.controls.hourlyCost.value || 0;
    return cost * dailyHours * days;
  }

  currencyDisplay(code: string): string {
    const option = findCurrency(code);
    if (!option) return code;
    return currencyLabel(option, this.i18n.language());
  }

  currencyName(option: CurrencyOption): string {
    return this.i18n.language() === 'en' ? option.nameEn : option.nameEs;
  }

  // ---------------- internals

  private async confirmCurrencyChange(newCurrency: string, previous: string): Promise<boolean> {
    const dialog = this.dialog.open(CurrencyChangeDialogComponent, {
      data: { newCurrency, previousCurrency: previous },
      panelClass: 'app-dialog-panel',
      autoFocus: 'dialog',
      restoreFocus: true,
      width: '440px'
    });
    return new Promise(resolve => {
      dialog.afterClosed().subscribe((result: boolean | undefined) => resolve(!!result));
    });
  }

  private persistCompany(values: ReturnType<typeof this.companyForm.getRawValue>, normalizedCurrency: string) {
    this.savingCompany.set(true);

    this.api.updateCompanySettings(this.companyId, {
      expectedDailyHours: values.expectedDailyHours,
      workingDaysPerMonth: values.workingDaysPerMonth,
      currencyCode: normalizedCurrency,
      defaultHourlyRate: values.defaultHourlyRate,
      defaultHourlyCost: values.defaultHourlyCost
    }).subscribe({
      next: settings => {
        this.settings.set(settings);
        this.applySettingsToForm(settings);
        this.currencyService.set(settings.currencyCode);
        this.savingCompany.set(false);
        this.snack.open(this.translate.instant('settings.savedToast'), 'OK', { duration: 2400 });
      },
      error: () => {
        this.savingCompany.set(false);
        this.snack.open(this.translate.instant('settings.errorToast'), 'OK', { duration: 3000 });
      }
    });
  }

  private loadAll() {
    forkJoin({
      settings: this.api.getCompanySettings(this.companyId),
      employees: this.api.getEmployees(this.companyId)
    }).subscribe({
      next: ({ settings, employees }) => {
        this.settings.set(settings);
        this.applySettingsToForm(settings);
        this.currencyService.set(settings.currencyCode);
        this.employees.set(employees);
        this.rosterForms.clear();
        employees.forEach(emp => this.rosterForms.set(emp.id, this.rosterForm(emp)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private applySettingsToForm(settings: CompanySettings) {
    this.companyForm.patchValue({
      expectedDailyHours: settings.expectedDailyHours,
      workingDaysPerMonth: settings.workingDaysPerMonth,
      currencyCode: settings.currencyCode,
      defaultHourlyRate: settings.defaultHourlyRate,
      defaultHourlyCost: settings.defaultHourlyCost
    });
  }

  private normalize(value: string) {
    return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }
}
