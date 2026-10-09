export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
export type ProjectVisibility = "PUBLIC" | "DEPARTMENT" | "PRIVATE";
export type ProjectMemberRole = "OWNER" | "MANAGER" | "MEMBER" | "VIEWER";

export interface ProjectMember {
  userId: string;
  role: ProjectMemberRole;
  roleInProject?: string;
  user?: { id: string; firstName: string; lastName: string };
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  visibility?: ProjectVisibility;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
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
  departmentId?: string | null;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  members?: { userId: string; role: ProjectMemberRole }[];
}

export interface UpdateProjectStatusPayload {
  status: ProjectStatus;
}
