export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface StaffRequest {
  id: string;
  userId: string;
  category: string;
  subject: string;
  details?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: RequestStatus;
  notifyToEmails: string[];
  notifyCcEmails: string[];
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

export interface CreateRequestPayload {
  category: string;
  subject: string;
  details?: string;
  startDate?: string;
  endDate?: string;
  notifyToEmails?: string[];
  notifyCcEmails?: string[];
}

export interface ReviewRequestPayload {
  decision: 'APPROVED' | 'REJECTED';
}
