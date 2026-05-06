import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { Employee, EmployeeDraft } from '../../core/models';
import { TalentApiService } from '../../core/talent-api.service';

@Component({
  selector: 'app-employees',
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
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TalentApiService);
  private readonly auth = inject(AuthService);
  private readonly snack = inject(MatSnackBar);

  readonly employees = signal<Employee[]>([]);
  readonly editing = signal<Employee | null>(null);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly search = signal('');
  readonly teamFilter = signal('ALL');
  readonly teams = computed(() =>
    [...new Set(this.employees().map(employee => employee.teamName))]
      .sort((left, right) => left.localeCompare(right))
  );
  readonly filteredEmployees = computed(() => {
    const query = this.normalize(this.search());
    const team = this.teamFilter();

    return [...this.employees()]
      .sort((left, right) => this.fullName(left).localeCompare(this.fullName(right)))
      .filter(employee => team === 'ALL' || employee.teamName === team)
      .filter(employee => {
        if (!query) return true;
        return this.normalize([
          employee.firstName,
          employee.lastName,
          employee.occupation,
          employee.teamName,
          String(employee.id)
        ].join(' ')).includes(query);
      });
  });
  readonly companyId = this.auth.companyId() ?? 1;

  private readonly defaultFormValue = () => ({
    firstName: '',
    lastName: '',
    occupation: '',
    registrationDate: new Date().toISOString().slice(0, 10),
    teamName: ''
  });

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    occupation: ['', [Validators.required, Validators.maxLength(80)]],
    registrationDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    teamName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
  });

  ngOnInit() {
    this.loadEmployees();
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const values = this.form.getRawValue();
    const payload: EmployeeDraft = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      occupation: values.occupation.trim(),
      registrationDate: values.registrationDate,
      teamName: values.teamName.trim(),
      companyId: this.companyId
    };
    const current = this.editing();
    const request = current
      ? this.api.updateEmployee(current.id, payload)
      : this.api.createEmployee(payload);

    request.subscribe({
      next: () => {
        const message = current ? 'Empleado actualizado' : 'Empleado agregado';
        this.resetForm();
        this.loadEmployees();
        this.saving.set(false);
        this.snack.open(message, 'OK', { duration: 2400, panelClass: 'snack-success' });
      },
      error: (response) => {
        this.error.set(response?.error?.message ?? 'No se pudo guardar el empleado. Revisa los datos e intenta otra vez.');
        this.saving.set(false);
      }
    });
  }

  edit(employee: Employee) {
    this.editing.set(employee);
    this.form.reset(this.defaultFormValue());
    this.form.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      occupation: employee.occupation,
      registrationDate: employee.registrationDate,
      teamName: employee.teamName
    });
  }

  remove(employee: Employee) {
    this.api.deleteEmployee(employee.id).subscribe(() => {
      this.loadEmployees();
      this.snack.open('Empleado eliminado', 'OK', { duration: 2400 });
    });
  }

  fullName(employee: Employee) {
    return `${employee.firstName} ${employee.lastName}`;
  }

  resetForm() {
    this.editing.set(null);
    this.error.set('');
    this.form.reset(this.defaultFormValue());
    this.form.markAsPristine();
    this.form.markAsUntouched();
    Object.values(this.form.controls).forEach(control => {
      control.setErrors(null);
      control.markAsPristine();
      control.markAsUntouched();
    });
  }

  private loadEmployees() {
    this.api.getEmployees(this.companyId).subscribe({
      next: employees => this.employees.set(employees),
      error: () => this.error.set('No pudimos cargar los empleados de esta empresa.')
    });
  }

  private normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
