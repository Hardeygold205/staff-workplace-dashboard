export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/** Decoded from the JWT access token payload — never fetched separately. */
export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  jti: string;
  exp: number;
  iat: number;
}
