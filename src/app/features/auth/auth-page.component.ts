import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { RegisterPayload } from '../../core/models';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslatePipe
  ],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);

  readonly mode = computed(() => this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);

  togglePassword() { this.showPassword.update(v => !v); }

  toggleTheme() {
    this.theme.toggle();
  }

  toggleLanguage() {
    this.i18n.toggle();
  }

  readonly loginForm = this.fb.nonNullable.group({
    username: ['demo@talentmanager.local', [Validators.required]],
    password: ['Talent1234', [Validators.required]]
  });

  readonly registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    companyName: ['', [Validators.required]],
    companyEmail: ['', [Validators.required, Validators.email]],
    companyDescription: ['']
  });

  submitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.loginForm.getRawValue();

    this.auth.signIn(username, password).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (response) => {
        this.error.set(response?.status === 0
          ? 'No se pudo conectar con el backend local. Verifica que esté corriendo en el puerto 8080.'
          : 'Credenciales inválidas. Prueba el usuario demo o registra una empresa.');
        this.loading.set(false);
      }
    });
  }

  submitRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    const payload = this.registerForm.getRawValue() as RegisterPayload;

    this.auth.register(payload).subscribe({
      next: () => this.auth.signIn(payload.username, payload.password).subscribe({
        next: () => this.router.navigate(['/app/dashboard']),
        error: () => {
          this.error.set('La empresa fue creada, pero no pudimos iniciar sesión automáticamente.');
          this.loading.set(false);
        }
      }),
      error: () => {
        this.error.set('No se pudo registrar. Revisa los datos o usa otro correo.');
        this.loading.set(false);
      }
    });
  }
}
