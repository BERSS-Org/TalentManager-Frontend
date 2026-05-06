import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { UserProfile } from '../../core/models';
import { TalentApiService } from '../../core/talent-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TalentApiService);
  private readonly auth = inject(AuthService);
  private readonly snack = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly profile = signal<UserProfile | null>(null);
  readonly showCurrent = signal(false);
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);

  readonly initials = computed(() => {
    const username = this.profile()?.username ?? this.auth.session()?.username ?? '';
    if (!username) return '?';
    const cleaned = username.split('@')[0];
    const parts = cleaned.split(/[\.\-_\s]+/).filter(Boolean);
    const letters = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : cleaned.slice(0, 2);
    return letters.toUpperCase();
  });

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: [this.matchValidator] }
  );

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: profile => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open(this.translate.instant('profile.loadError'), 'OK', { duration: 3000 });
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    this.saving.set(true);

    this.api.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
        this.showCurrent.set(false);
        this.showNew.set(false);
        this.showConfirm.set(false);
        this.snack.open(this.translate.instant('profile.passwordUpdated'), 'OK', { duration: 2400 });
      },
      error: () => {
        this.saving.set(false);
        this.snack.open(this.translate.instant('profile.passwordError'), 'OK', { duration: 3200 });
      }
    });
  }

  toggleCurrent() { this.showCurrent.update(v => !v); }
  toggleNew()     { this.showNew.update(v => !v); }
  toggleConfirm() { this.showConfirm.update(v => !v); }

  private matchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!newPassword || !confirm) return null;
    return newPassword === confirm ? null : { mismatch: true };
  }
}
