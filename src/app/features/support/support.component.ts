import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { SupportMessage, SupportStatus } from '../../core/models';
import { TalentApiService } from '../../core/talent-api.service';

type SupportFilter = 'ALL' | SupportStatus;

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TalentApiService);
  private readonly auth = inject(AuthService);
  private readonly snack = inject(MatSnackBar);
  private readonly i18n = inject(I18nService);

  readonly statuses: SupportStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
  readonly filters: SupportFilter[] = ['ALL', ...this.statuses];
  readonly messages = signal<SupportMessage[]>([]);
  readonly filter = signal<SupportFilter>('ALL');
  readonly ticketSearch = signal('');
  readonly saving = signal(false);
  readonly updatingIds = signal<Set<number>>(new Set());
  readonly companyId = this.auth.companyId() ?? 1;

  readonly filteredMessages = computed(() => {
    const selected = this.filter();
    const query = this.normalize(this.ticketSearch());
    const statusWeight: Record<SupportStatus, number> = {
      PENDING: 0,
      IN_PROGRESS: 1,
      RESOLVED: 2
    };

    return [...this.messages()]
      .filter(message => selected === 'ALL' || message.status === selected)
      .filter(message => {
        if (!query) return true;
        return this.normalize([
          message.content,
          this.statusLabel(message.status),
          message.id.toString()
        ].join(' ')).includes(query);
      })
      .sort((left, right) => {
        const statusDiff = statusWeight[left.status] - statusWeight[right.status];
        if (statusDiff !== 0) return statusDiff;
        return new Date(right.receivedAt).getTime() - new Date(left.receivedAt).getTime();
      });
  });

  readonly openCount = computed(() =>
    this.messages().filter(message => message.status !== 'RESOLVED').length
  );
  readonly pendingCount = computed(() =>
    this.messages().filter(message => message.status === 'PENDING').length
  );
  readonly inProgressCount = computed(() =>
    this.messages().filter(message => message.status === 'IN_PROGRESS').length
  );
  readonly resolvedCount = computed(() =>
    this.messages().filter(message => message.status === 'RESOLVED').length
  );

  readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(500)]]
  });

  ngOnInit() {
    this.loadMessages();
  }

  sendMessage() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.api.createSupportMessage(this.companyId, this.form.controls.content.value.trim())
      .subscribe({
        next: message => {
          this.messages.set([message, ...this.messages()]);
          this.form.reset({ content: '' });
          this.saving.set(false);
          this.snack.open('Solicitud creada', 'OK', { duration: 2200 });
        },
        error: () => {
          this.saving.set(false);
          this.snack.open('No pudimos crear la solicitud', 'OK', { duration: 3000 });
        }
      });
  }

  changeStatus(message: SupportMessage, status: SupportStatus) {
    if (message.status === status || this.isUpdating(message)) return;

    const previousStatus = message.status;
    this.setUpdating(message.id, true);
    this.messages.set(this.messages().map(item =>
      item.id === message.id ? { ...item, status } : item
    ));

    this.api.updateSupportStatus(message.id, status).subscribe({
      next: updated => {
        this.messages.set(this.messages().map(item => item.id === updated.id ? updated : item));
        this.setUpdating(message.id, false);
        this.snack.open(`Ticket ${this.statusLabel(status).toLowerCase()}`, 'OK', { duration: 2200 });
      },
      error: () => {
        this.messages.set(this.messages().map(item =>
          item.id === message.id ? { ...item, status: previousStatus } : item
        ));
        this.setUpdating(message.id, false);
        this.snack.open('No pudimos cambiar el estado del ticket', 'OK', { duration: 3000 });
      }
    });
  }

  remove(message: SupportMessage) {
    this.api.deleteSupportMessage(message.id).subscribe({
      next: () => {
        this.messages.set(this.messages().filter(item => item.id !== message.id));
        this.snack.open('Ticket eliminado', 'OK', { duration: 2200 });
      },
      error: () => this.snack.open('No pudimos eliminar el ticket', 'OK', { duration: 3000 })
    });
  }

  isUpdating(message: SupportMessage) {
    return this.updatingIds().has(message.id);
  }

  nextActionLabel(message: SupportMessage) {
    if (message.status === 'PENDING') return this.i18n.t('support.takeTicket');
    if (message.status === 'IN_PROGRESS') return this.i18n.t('support.resolve');
    return this.i18n.t('support.reopen');
  }

  nextActionIcon(message: SupportMessage) {
    if (message.status === 'PENDING') return 'play_circle';
    if (message.status === 'IN_PROGRESS') return 'check_circle';
    return 'restart_alt';
  }

  statusIcon(status: SupportStatus) {
    if (status === 'PENDING') return 'schedule';
    if (status === 'IN_PROGRESS') return 'autorenew';
    return 'check_circle';
  }

  nextStatus(message: SupportMessage): SupportStatus {
    if (message.status === 'PENDING') return 'IN_PROGRESS';
    if (message.status === 'IN_PROGRESS') return 'RESOLVED';
    return 'PENDING';
  }

  private setUpdating(id: number, active: boolean) {
    const next = new Set(this.updatingIds());
    if (active) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.updatingIds.set(next);
  }

  statusLabel(status: SupportFilter) {
    const labels: Record<SupportFilter, string> = {
      ALL: this.i18n.t('support.all'),
      PENDING: this.i18n.t('support.statusPending'),
      IN_PROGRESS: this.i18n.t('support.statusInProgress'),
      RESOLVED: this.i18n.t('support.statusResolved')
    };
    return labels[status];
  }

  private loadMessages() {
    this.api.getSupportMessages(this.companyId).subscribe(messages => this.messages.set(messages));
  }

  private normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
