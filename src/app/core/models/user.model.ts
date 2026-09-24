export type OfficeBranch = "ABUJA" | "KANO";
export type Shift = "ONSITE" | "HYBRID" | "REMOTE";

export interface RoleRef {
  role: { name: string };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  username?: string | null;
  department: string;
  position: string;
  officeBranch: OfficeBranch;
  shift: Shift;
  isIntern: boolean;
  bio?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  isActive: boolean;
  attendanceExempt: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  roles: RoleRef[];
  permissionGrants: string[] | null;
  permissionRevokes: string[] | null;
}

export function roleNames(user: Pick<User, "roles">): string[] {
  return user.roles?.map((r) => r.role.name) ?? [];
}

export function displayName(
  user: Pick<User, "firstName" | "lastName">,
): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function initials(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  roleNames: string[];
  middleName?: string;
  username?: string;
  department?: string;
  position?: string;
  officeBranch?: OfficeBranch;
  shift?: Shift;
  isIntern?: boolean;
}

export interface UpdateMePayload {
  username?: string;
  middleName?: string | null;
  dob?: string | null;
  bio?: string | null;
}

export interface AdminUpdateUserPayload {
  firstName?: string;
  lastName?: string;
  roleNames?: string[];
  department?: string;
  position?: string;
  officeBranch?: OfficeBranch;
  shift?: Shift;
  isIntern?: boolean;
  avatarUrl?: string | null;
}

export interface SetUserPermissionsPayload {
  grant: string[];
  revoke: string[];
}

export interface UserPermissionOverride {
  userId: string;
  permissionId: string;
  granted: boolean;
  permission: { key: string; description?: string | null };
}
