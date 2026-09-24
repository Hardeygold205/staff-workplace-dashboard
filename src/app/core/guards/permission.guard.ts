import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Usage in routes: { path: 'roles', canActivate: [permissionGuard], data: { permission: 'roles:view' } }
 * or data: { anyPermission: ['requests:view_all', 'requests:approve'] } for an "any of" check.
 * This is a UX guard only — the backend is the real authorization boundary.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = route.data['permission'] as string | undefined;
  const anyOf = route.data['anyPermission'] as string[] | undefined;

  const allowed = required
    ? auth.hasPermission(required)
    : anyOf
      ? auth.hasAnyPermission(anyOf)
      : true;

  if (allowed) return true;
  router.navigate(['/dashboard']);
  return false;
};
