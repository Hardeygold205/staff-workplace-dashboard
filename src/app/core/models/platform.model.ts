export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StorageBucket {
  type: string;
  count: number;
  sizeBytes: number;
}

export interface PlatformOverview {
  organizations: {
    total: number;
    active: number;
    suspended: number;
    signupsLast7Days: number;
    signupsLast30Days: number;
  };
  staff: { total: number; active: number };
  documents: { count: number; sizeBytes: number; byType: StorageBucket[] };
  projects: number;
  tasks: number;
  departments: number;
  branches: number;
  pendingInvitations: number;
  signupsByDay: { day: string; count: number }[];
}

export interface PlatformOwner {
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface PlatformOrganization {
  id: string;
  name: string;
  slug: string;
  industry?: string | null;
  country?: string | null;
  city?: string | null;
  staffRange?: string | null;
  isActive: boolean;
  createdAt: string;
  plan: string;
  seatLimit: number;
  owner: PlatformOwner | null;
  staffCount: number;
  activeStaffCount: number;
  seatsUsedPercent: number | null;
  overSeatLimit: boolean;
  departmentCount: number;
  branchCount: number;
  projectCount: number;
  documentCount: number;
  storageBytes: number;
  invitationCount: number;
  pendingInvitationCount: number;
  legalName?: string | null;
  phone?: string | null;
  website?: string | null;
  timezone?: string | null;
  address?: string | null;
  state?: string | null;
  registrationNumber?: string | null;
  about?: string | null;
  logoUrl?: string | null;
  iconUrl?: string | null;
  documentsByType?: StorageBucket[];
  activityLast30Days?: { action: string; count: number }[];
}

export interface PlatformActivity {
  id: string;
  action: string;
  entityType?: string | null;
  description: string;
  createdAt: string;
  organization?: { id: string; name: string; slug: string } | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isPlatformAdmin: boolean;
  } | null;
}
