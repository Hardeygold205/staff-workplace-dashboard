export interface Permission {
  id: string;
  key: string;
  description?: string | null;
}

export interface RolePermissionRef {
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  permissions: RolePermissionRef[];
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export interface SetRolePermissionsPayload {
  permissionKeys: string[];
}
