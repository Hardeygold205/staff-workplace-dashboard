export interface ScreentimeLog {
  id: string;
  userId: string;
  date: string;
  deviceInfo?: string | null;
  activeSeconds: number;
  idleSeconds: number;
  topApps: { name: string; seconds: number }[];
  createdAt: string;
  updatedAt: string;
  user?: { firstName: string; lastName: string };
}

export interface LogScreentimePayload {
  date: string;
  deviceInfo?: string;
  activeSeconds: number;
  idleSeconds: number;
  topApps?: { name: string; seconds: number }[];
}
