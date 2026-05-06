import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { findCurrency, currencyLabel } from '../../core/currency-catalog';
import { I18nService } from '../../core/i18n.service';

interface DialogData {
  newCurrency: string;
  previousCurrency: string;
}

@Component({
  selector: 'app-currency-change-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    <div class="dialog">
      <header class="dialog__head">
        <span class="dialog__icon"><mat-icon>swap_horiz</mat-icon></span>
        <div>
          <p class="dialog__eyebrow">{{ 'settings.currency' | translate }}</p>
          <h2 mat-dialog-title>{{ 'settings.currencyChangeWarningTitle' | translate }}</h2>
        </div>
      </header>

      <div mat-dialog-content class="dialog__body">
        <p>{{ message() }}</p>

        <div class="dialog__pair">
          <article class="dialog__chip">
            <small>{{ 'settings.currency' | translate }} ←</small>
            <strong>{{ previousLabel() }}</strong>
          </article>
          <mat-icon aria-hidden="true">arrow_forward</mat-icon>
          <article class="dialog__chip dialog__chip--accent">
            <small>{{ 'settings.currency' | translate }} →</small>
            <strong>{{ newLabel() }}</strong>
          </article>
        </div>
      </div>

      <div mat-dialog-actions class="dialog__actions">
        <button mat-button type="button" (click)="cancel()">
          {{ 'settings.currencyChangeCancel' | translate }}
        </button>
        <button mat-flat-button color="primary" type="button" (click)="confirm()">
          <mat-icon>check</mat-icon>
          {{ 'settings.currencyChangeConfirm' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dialog {
      display: grid;
      gap: 18px;
      padding: 4px;
      color: var(--ink-800);
    }
    .dialog__head {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .dialog__icon {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--accent-100);
      color: var(--accent-700);
      flex-shrink: 0;
    }
    .dialog__eyebrow {
      margin: 0 0 4px;
      color: var(--accent-700);
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .dialog h2[mat-dialog-title] {
      margin: 0;
      color: var(--ink-900);
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .dialog__body {
      display: grid;
      gap: 16px;
      padding: 0 !important;
      max-height: none !important;
    }
    .dialog__body p {
      margin: 0;
      color: var(--ink-600);
      line-height: 1.55;
      font-size: 0.94rem;
    }
    .dialog__pair {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border: 1px solid var(--line-soft);
      border-radius: var(--radius-md);
      background: var(--surface-soft);
    }
    .dialog__pair > mat-icon {
      color: var(--ink-300);
    }
    .dialog__chip {
      flex: 1;
      display: grid;
      gap: 2px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      background: var(--surface-card);
      border: 1px solid var(--line-soft);
      line-height: 1.15;
      min-width: 0;
    }
    .dialog__chip small {
      display: block;
      color: var(--ink-400);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .dialog__chip strong {
      display: block;
      font-family: var(--font-heading);
      color: var(--ink-900);
      font-size: 0.95rem;
      letter-spacing: -0.01em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dialog__chip--accent {
      background: var(--accent-100);
      border-color: var(--accent-300);
    }
    .dialog__chip--accent small,
    .dialog__chip--accent strong {
      color: var(--accent-700);
    }
    .dialog__actions {
      padding: 0 !important;
      display: flex !important;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class CurrencyChangeDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CurrencyChangeDialogComponent>);
  private readonly i18n = inject(I18nService);
  private readonly translate = inject(TranslateService);

  readonly newCurrency: string;
  readonly previousCurrency: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.newCurrency = data.newCurrency;
    this.previousCurrency = data.previousCurrency;
  }

  newLabel() {
    const option = findCurrency(this.newCurrency);
    return option ? currencyLabel(option, this.i18n.language()) : this.newCurrency;
  }

  previousLabel() {
    const option = findCurrency(this.previousCurrency);
    return option ? currencyLabel(option, this.i18n.language()) : this.previousCurrency;
  }

  message() {
    return this.translate.instant('settings.currencyChangeWarning', {
      currency: this.newLabel(),
      previous: this.previousLabel()
    });
  }

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
