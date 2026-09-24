export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

export interface ProjectMember {
  userId: string;
  roleInProject: string;
  user?: { id: string; firstName: string; lastName: string };
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { firstName: string; lastName: string };
  members?: ProjectMember[];
  _count?: { tasks: number; members: number };
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  memberUserIds?: string[];
}

export interface UpdateProjectStatusPayload {
  status: ProjectStatus;
}
