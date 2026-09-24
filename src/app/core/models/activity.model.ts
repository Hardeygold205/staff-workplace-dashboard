export interface ActivityLog {
  id: string;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: string;
  user?: { firstName: string; lastName: string } | null;
}
