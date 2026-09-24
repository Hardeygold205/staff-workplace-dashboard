export interface WorkingHours {
  checkInFrom: string;
  officialStart: string;
  breakStart: string;
  breakEnd: string;
  officialEnd: string;
  trackingEnd: string;
}

export type CalendarItemType =
  | "LEAVE"
  | "BIRTHDAY"
  | "TASK_DEADLINE"
  | (string & {});

export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  title: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  metadata?: Record<string, unknown>;
}

export interface MonthlyCalendar {
  year: number;
  month: number;
  timezone: string;
  workingHours: WorkingHours;
  workingDays: string[];
  items: CalendarItem[];
}
