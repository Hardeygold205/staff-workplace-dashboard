export interface CompanyEvent {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  startsAt: string;
  endsAt?: string | null;
  allDay: boolean;
  linkUrl?: string | null;
  linkLabel?: string | null;
  createdById: string;
  createdAt: string;
  createdBy?: { id: string; firstName: string; lastName: string };
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  type: string;
  startsAt: string;
  endsAt?: string;
  allDay?: boolean;
  linkUrl?: string;
  linkLabel?: string;
  notifyByEmail?: boolean;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;
