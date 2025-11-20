
export interface UserSettings {
  monthlySalary: number;
  restDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  workStartHour: string; // "09:00"
  workEndHour: string;   // "18:00"
  hasCompletedOnboarding: boolean;
  privacyMode: boolean;
  history: DailyRecord[]; // Log of past income
}

export interface DailyRecord {
  date: string; // ISO "YYYY-MM-DD"
  earned: number;
  isRestDay: boolean;
  salarySnapshot: number; // To ensure past records stay accurate if salary changes
}

export interface WorkStats {
  currentEarnings: number;
  elapsedTimeSeconds: number;
  progressPercentage: number;
  isWorking: boolean;
  isRestDay: boolean;
}

export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  STATS = 'STATS',
  SETTINGS = 'SETTINGS'
}

export interface Quote {
  text: string;
  author: string;
  type: 'fun' | 'serious' | 'rest';
}
