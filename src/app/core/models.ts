export interface AuthSession {
  id: number;
  username: string;
  managerId: number;
  companyId: number;
  token: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  companyName: string;
  companyEmail: string;
  companyDescription: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  occupation: string;
  registrationDate: string;
  teamName: string;
  companyId: number;
  hourlyRate: number;
  hourlyCost: number;
}

export interface EmployeeDraft {
  firstName: string;
  lastName: string;
  occupation: string;
  registrationDate: string;
  teamName: string;
  companyId: number;
  hourlyRate?: number;
  hourlyCost?: number;
}

export interface DailySummary {
  id: number;
  employeeId: number;
  companyId: number;
  day: number;
  month: number;
  year: number;
  entryTime: number;
  exitTime: number;
  hoursWorked: number;
  inputAmount: number;
  score: number;
}

export interface DailySummaryDraft {
  employeeId: number;
  companyId: number;
  day: number;
  month: number;
  year: number;
  entryTime: number;
  exitTime: number;
  /**
   * Optional. When omitted or 0 the backend derives it from
   * employee.hourlyRate (or company.defaultHourlyRate) * hoursWorked.
   */
  inputAmount?: number;
  score: number;
}

export interface Report {
  id: number;
  title: string;
  content: string;
  companyId: number;
  employeeId: number;
  year: number;
  month: number;
}

export interface ReportDraft {
  title: string;
  content: string;
  companyId: number;
  employeeId: number;
  year: number;
  month: number;
}

/**
 * Computed monthly aggregate — built on the fly from DailySummary records.
 * Replaces the legacy "Cierre del mes" entity.
 */
export interface MonthlyAggregate {
  employeeId: number;
  employeeName: string;
  teamName: string;
  year: number;
  month: number;
  dayCount: number;
  completedHours: number;
  totalHours: number;
  completionRate: number;
  totalInput: number;
  totalCost: number;
  margin: number;
  averageScore: number;
}

export interface EmployeeContribution {
  employeeId: number;
  employeeName: string;
  teamName: string;
  hoursWorked: number;
  totalInput: number;
  totalCost: number;
  margin: number;
  marginRate: number;
}

export interface CompanySettings {
  companyId: number;
  name: string;
  currencyCode: string;
  expectedDailyHours: number;
  workingDaysPerMonth: number;
  defaultHourlyRate: number;
  defaultHourlyCost: number;
}

export interface RevenueTrendPoint {
  year: number;
  month: number;
  label: string;
  totalInput: number;
  totalHours: number;
}

export interface AnalyticsOverview {
  companyId: number;
  totalEmployees: number;
  totalTeams: number;
  totalInput: number;
  averageScore: number;
  totalHours: number;
  completedHours: number;
  completionRate: number;
  openSupportMessages: number;
  healthLabel: string;
  insights: string[];
}

export interface TeamPerformance {
  teamName: string;
  employeeCount: number;
  totalInput: number;
  averageScore: number;
  completedHours: number;
  totalHours: number;
  completionRate: number;
}

export interface SupportMessage {
  id: number;
  content: string;
  companyId: number;
  requestDate: string;
  receivedAt: string;
  status: SupportStatus;
}

export type SupportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export interface UserProfile {
  id: number;
  username: string;
  managerId: number;
  companyId: number;
  companyName: string | null;
  memberSince: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
