export const STAFF_RANGES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;
export type StaffRange = (typeof STAFF_RANGES)[number];

export interface OrganizationSettings {
  workStartTime: string;
  workEndTime: string;
  autoCheckoutTime: string;
  workDays: number[];
  enableScreentime: boolean;
  enableSuggestions: boolean;
  allowedEmailDomains: string[];
  plan: string;
  seatLimit: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  iconUrl?: string | null;
  website?: string | null;
  industry?: string | null;
  timezone: string;
  legalName?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  staffRange?: StaffRange | null;
  registrationNumber?: string | null;
  about?: string | null;
  isActive: boolean;
  settings?: OrganizationSettings | null;
}

export interface RegisterOrganizationPayload {
  organizationName: string;
  slug?: string;
  industry?: string;
  timezone?: string;
  website?: string;
  legalName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  staffRange?: StaffRange;
  registrationNumber?: string;
  about?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  website?: string | null;
  industry?: string | null;
  timezone?: string;
  legalName?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  staffRange?: StaffRange | null;
  registrationNumber?: string | null;
  about?: string | null;
}
