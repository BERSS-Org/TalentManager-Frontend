import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { CurrencyService } from '../../core/currency.service';
import { findCurrency } from '../../core/currency-catalog';
import { TalentApiService } from '../../core/talent-api.service';
import { AnalyticsOverview, EmployeeContribution, RevenueTrendPoint, TeamPerformance } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CurrencyPipe,
    DecimalPipe,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    BaseChartDirective,
    TranslatePipe,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(TalentApiService);
  private readonly auth = inject(AuthService);
  private readonly currencyService = inject(CurrencyService);

  readonly currency = this.currencyService.code;
  readonly currencySymbol = computed(() => findCurrency(this.currency())?.symbol ?? this.currency());

  readonly loading = signal(true);
  readonly overview = signal<AnalyticsOverview | null>(null);
  readonly teams = signal<TeamPerformance[]>([]);
  readonly trend = signal<RevenueTrendPoint[]>([]);
  readonly contributors = signal<EmployeeContribution[]>([]);
  readonly topTeam = computed(() => this.teams()[0]);

  /** Hours target the cumplimiento metric is measured against. */
  readonly cumplimientoTarget = computed(() => this.overview()?.totalHours ?? 0);

  readonly topContributors = computed(() => this.contributors().slice(0, 5));
  readonly contributorsHasData = () => this.topContributors().some(c => c.totalInput > 0 || c.totalCost > 0);

  readonly totalRevenue = computed(() => this.contributors().reduce((sum, c) => sum + c.totalInput, 0));
  readonly totalCost = computed(() => this.contributors().reduce((sum, c) => sum + c.totalCost, 0));
  readonly totalMargin = computed(() => this.totalRevenue() - this.totalCost());
  readonly globalMarginRate = computed(() => {
    const revenue = this.totalRevenue();
    if (revenue <= 0) return 0;
    return (this.totalMargin() / revenue) * 100;
  });
  readonly trendHasData = computed(() =>
    this.trend().some(point => point.totalInput > 0 || point.totalHours > 0)
  );
  readonly latestTrendPoint = computed(() => this.trend().at(-1));
  readonly trendInsight = computed(() => {
    const points = this.trend().filter(point => point.totalInput > 0 || point.totalHours > 0);
    if (points.length < 2) return 'Registra más jornadas para comparar la evolución entre meses.';

    const previous = points.at(-2)!;
    const current = points.at(-1)!;
    const revenueDelta = current.totalInput - previous.totalInput;
    const hoursDelta = current.totalHours - previous.totalHours;

    if (revenueDelta > 0 && hoursDelta <= 0) {
      return 'El último mes generó más ingreso con igual o menor carga horaria.';
    }
    if (revenueDelta > 0) {
      return 'El ingreso subió; revisa si el aumento viene acompañado de más horas.';
    }
    if (hoursDelta > 0 && revenueDelta <= 0) {
      return 'Las horas crecieron sin aumentar ingreso; conviene revisar productividad o bloqueos.';
    }
    return 'La tendencia está estable; usa reportes para explicar los cambios por persona.';
  });

  readonly trendChartData = computed<ChartData<'line'>>(() => {
    const points = this.trend();
    return {
      labels: points.map(p => p.label),
      datasets: [
        {
          label: `Ingreso (${this.currency()})`,
          data: points.map(p => p.totalInput),
          borderColor: '#0f6b65',
          backgroundColor: 'rgba(15, 107, 101, 0.18)',
          pointBackgroundColor: '#0f6b65',
          pointBorderColor: '#fff',
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.35,
          fill: true,
          yAxisID: 'yRevenue'
        },
        {
          label: 'Horas hombre',
          data: points.map(p => p.totalHours),
          borderColor: '#d97a3f',
          backgroundColor: 'rgba(217, 122, 63, 0.16)',
          pointBackgroundColor: '#d97a3f',
          pointBorderColor: '#fff',
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.35,
          fill: true,
          borderDash: [6, 4],
          yAxisID: 'yHours'
        }
      ]
    };
  });

  readonly contributorsChartData = computed<ChartData<'bar'>>(() => {
    const rows = this.topContributors();
    return {
      labels: rows.map(c => c.employeeName),
      datasets: [
        {
          label: 'Ingreso',
          data: rows.map(c => c.totalInput),
          backgroundColor: 'rgba(35, 100, 93, 0.85)',
          hoverBackgroundColor: '#23645d',
          borderRadius: 6,
          borderSkipped: false,
          stack: 'finance'
        },
        {
          label: 'Costo',
          data: rows.map(c => c.totalCost),
          backgroundColor: 'rgba(181, 58, 31, 0.7)',
          hoverBackgroundColor: '#b53a1f',
          borderRadius: 6,
          borderSkipped: false,
          stack: 'cost'
        },
        {
          label: 'Margen',
          data: rows.map(c => c.margin),
          backgroundColor: 'rgba(220, 138, 77, 0.85)',
          hoverBackgroundColor: '#c86b32',
          borderRadius: 6,
          borderSkipped: false,
          stack: 'margin'
        }
      ]
    };
  });

  readonly contributorsChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const symbol = this.currencySymbol();
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            color: '#44524e',
            font: { family: 'Source Sans 3', size: 12, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: '#0d1f1d',
          titleColor: '#fff',
          bodyColor: '#dde4e0',
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${symbol}${Math.round(Number(ctx.parsed.x)).toLocaleString('en-US')}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(220, 229, 223, 0.5)' },
          ticks: {
            color: '#7c8884',
            font: { family: 'Source Sans 3', size: 11 },
            callback: (value) => `${symbol}${(Number(value) / 1000).toFixed(0)}k`
          }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#44524e', font: { family: 'Source Sans 3', size: 12 } }
        }
      }
    };
  });

  readonly trendChartOptions = computed<ChartConfiguration<'line'>['options']>(() => {
    const symbol = this.currencySymbol();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            color: '#44524e',
            font: { family: 'Source Sans 3', size: 12, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: '#0d1f1d',
          titleColor: '#fff',
          bodyColor: '#dde4e0',
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed.y;
              if (ctx.dataset.yAxisID === 'yRevenue') {
                return ` ${ctx.dataset.label}: ${symbol}${Math.round(value).toLocaleString('en-US')}`;
              }
              return ` ${ctx.dataset.label}: ${Math.round(value).toLocaleString('en-US')} h`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#7c8884', font: { family: 'Source Sans 3', size: 11 } }
        },
        yRevenue: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          grid: { color: 'rgba(220, 229, 223, 0.6)' },
          ticks: {
            color: '#7c8884',
            font: { family: 'Source Sans 3', size: 11 },
            callback: (value) => `${symbol}${(Number(value) / 1000).toFixed(0)}k`
          }
        },
        yHours: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          grid: { display: false },
          ticks: {
            color: '#7c8884',
            font: { family: 'Source Sans 3', size: 11 },
            callback: (value) => `${value}h`
          }
        }
      }
    };
  });

  ngOnInit() {
    const companyId = this.auth.companyId();
    if (!companyId) return;

    forkJoin({
      overview: this.api.getOverview(companyId),
      teams: this.api.getTeams(companyId),
      trend: this.api.getRevenueTrend(companyId, 6),
      contributors: this.api.getContributors(companyId, 6)
    }).subscribe({
      next: ({ overview, teams, trend, contributors }) => {
        this.overview.set(overview);
        this.teams.set(teams);
        this.trend.set(trend);
        this.contributors.set(contributors);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
