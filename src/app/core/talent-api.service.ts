import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  AnalyticsOverview,
  ChangePasswordPayload,
  CompanySettings,
  DailySummary,
  DailySummaryDraft,
  Employee,
  EmployeeContribution,
  EmployeeDraft,
  MonthlyAggregate,
  Report,
  ReportDraft,
  RevenueTrendPoint,
  SupportMessage,
  SupportStatus,
  TeamPerformance,
  UserProfile
} from './models';

@Injectable({ providedIn: 'root' })
export class TalentApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  // ----- Employees
  getEmployees(companyId: number) {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/company/${companyId}`);
  }

  createEmployee(payload: EmployeeDraft) {
    return this.http.post<Employee>(`${this.baseUrl}/employees`, payload);
  }

  updateEmployee(id: number, payload: EmployeeDraft) {
    return this.http.put<Employee>(`${this.baseUrl}/employees/${id}`, payload);
  }

  deleteEmployee(id: number) {
    return this.http.delete(`${this.baseUrl}/employees/${id}`, { responseType: 'text' });
  }

  // ----- Analytics
  getOverview(companyId: number) {
    return this.http.get<AnalyticsOverview>(`${this.baseUrl}/analytics/overview/${companyId}`);
  }

  getTeams(companyId: number) {
    return this.http.get<TeamPerformance[]>(`${this.baseUrl}/analytics/teams/${companyId}`);
  }

  /** Computed monthly aggregate built from daily records (no manual cierre del mes). */
  getMonthlyAggregate(companyId: number) {
    return this.http.get<MonthlyAggregate[]>(`${this.baseUrl}/analytics/monthly-aggregate/${companyId}`);
  }

  /** 6-month company-wide time series of total input + total hours. */
  getRevenueTrend(companyId: number, months = 6) {
    return this.http.get<RevenueTrendPoint[]>(`${this.baseUrl}/analytics/trend/${companyId}?months=${months}`);
  }

  /** Per-employee revenue / cost / margin breakdown over the requested window. */
  getContributors(companyId: number, months = 6) {
    return this.http.get<EmployeeContribution[]>(`${this.baseUrl}/analytics/contributors/${companyId}?months=${months}`);
  }

  // ----- Company settings
  getCompanySettings(companyId: number) {
    return this.http.get<CompanySettings>(`${this.baseUrl}/companies/${companyId}/settings`);
  }

  updateCompanySettings(companyId: number, payload: Partial<CompanySettings>) {
    return this.http.patch<CompanySettings>(`${this.baseUrl}/companies/${companyId}/settings`, payload);
  }

  // ----- Profile
  getProfile() {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`);
  }

  changePassword(payload: ChangePasswordPayload) {
    return this.http.patch<void>(`${this.baseUrl}/profile/password`, payload, { responseType: 'text' as 'json' });
  }

  // ----- Reports
  getReports(companyId: number) {
    return this.http.get<Report[]>(`${this.baseUrl}/reports/by-company/${companyId}`);
  }

  createReport(payload: ReportDraft) {
    return this.http.post<Report>(`${this.baseUrl}/reports`, payload);
  }

  deleteReport(id: number) {
    return this.http.delete(`${this.baseUrl}/reports/${id}`, { responseType: 'text' });
  }

  // ----- Daily summaries
  getDailySummaries(companyId: number) {
    return this.http.get<DailySummary[]>(`${this.baseUrl}/daily-summaries/by-company/${companyId}`);
  }

  createDailySummary(payload: DailySummaryDraft) {
    return this.http.post<DailySummary>(`${this.baseUrl}/daily-summaries`, payload);
  }

  updateDailySummary(id: number, payload: Pick<DailySummaryDraft, 'entryTime' | 'exitTime' | 'inputAmount' | 'score'>) {
    return this.http.put<DailySummary>(`${this.baseUrl}/daily-summaries/${id}`, payload);
  }

  // ----- Support
  getSupportMessages(companyId: number) {
    return this.http.get<SupportMessage[]>(`${this.baseUrl}/support-messages/company/${companyId}`);
  }

  createSupportMessage(companyId: number, content: string) {
    const now = new Date().toISOString().slice(0, 19);
    return this.http.post<SupportMessage>(`${this.baseUrl}/support-messages`, {
      companyId,
      content,
      requestDate: now,
      receivedAt: now
    });
  }

  updateSupportStatus(id: number, newStatus: SupportStatus) {
    return this.http.patch<SupportMessage>(`${this.baseUrl}/support-messages/${id}/status`, { newStatus });
  }

  deleteSupportMessage(id: number) {
    return this.http.delete(`${this.baseUrl}/support-messages/${id}`, { responseType: 'text' });
  }
}
