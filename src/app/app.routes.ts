import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { homeRedirectGuard, platformAdminGuard } from './core/guards/platform-admin.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register-organization.component').then(
        (m) => m.RegisterOrganizationComponent,
      ),
  },
  {
    path: 'accept-invitation',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/accept-invitation/accept-invitation.component').then(
        (m) => m.AcceptInvitationComponent,
      ),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
      {
        path: 'platform',
        canActivate: [platformAdminGuard],
        loadComponent: () =>
          import('./features/platform/platform-overview.component').then((m) => m.PlatformOverviewComponent),
      },
      {
        path: 'platform/organizations',
        canActivate: [platformAdminGuard],
        loadComponent: () =>
          import('./features/platform/platform-organizations.component').then((m) => m.PlatformOrganizationsComponent),
      },
      {
        path: 'platform/organizations/:id',
        canActivate: [platformAdminGuard],
        loadComponent: () =>
          import('./features/platform/platform-organization-detail.component').then(
            (m) => m.PlatformOrganizationDetailComponent,
          ),
      },
      {
        path: 'platform/signups',
        canActivate: [platformAdminGuard],
        loadComponent: () =>
          import('./features/platform/platform-signups.component').then((m) => m.PlatformSignupsComponent),
      },
      {
        path: 'platform/activity',
        canActivate: [platformAdminGuard],
        loadComponent: () =>
          import('./features/platform/platform-activity.component').then((m) => m.PlatformActivityComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/attendance.component').then((m) => m.AttendanceComponent),
      },
      {
        path: 'requests',
        loadComponent: () => import('./features/requests/requests.component').then((m) => m.RequestsComponent),
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects.component').then((m) => m.ProjectsComponent),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/projects/project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permission: 'users:view' },
        loadComponent: () => import('./features/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { permission: 'roles:view' },
        loadComponent: () => import('./features/roles/roles.component').then((m) => m.RolesComponent),
      },
      {
        path: 'departments',
        canActivate: [permissionGuard],
        data: { permission: 'departments:view' },
        loadComponent: () =>
          import('./features/departments/departments.component').then((m) => m.DepartmentsComponent),
      },
      {
        path: 'branches',
        canActivate: [permissionGuard],
        data: { permission: 'branches:view' },
        loadComponent: () => import('./features/branches/branches.component').then((m) => m.BranchesComponent),
      },
      {
        path: 'invitations',
        canActivate: [permissionGuard],
        data: { permission: 'invitations:manage' },
        loadComponent: () =>
          import('./features/invitations/invitations.component').then((m) => m.InvitationsComponent),
      },
      {
        path: 'organization',
        canActivate: [permissionGuard],
        data: { permission: 'roles:manage' },
        loadComponent: () =>
          import('./features/organization/organization.component').then((m) => m.OrganizationComponent),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component').then((m) => m.NotificationsComponent),
      },
      {
        path: 'uploads',
        loadComponent: () => import('./features/uploads/uploads.component').then((m) => m.UploadsComponent),
      },
      {
        path: 'events',
        loadComponent: () => import('./features/events/events.component').then((m) => m.EventsComponent),
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.component').then((m) => m.CalendarComponent),
      },
      {
        path: 'suggestions',
        loadComponent: () =>
          import('./features/suggestions/suggestions.component').then((m) => m.SuggestionsComponent),
      },
      {
        path: 'screentime',
        loadComponent: () => import('./features/screentime/screentime.component').then((m) => m.ScreentimeComponent),
      },
      {
        path: 'activities',
        loadComponent: () => import('./features/activities/activities.component').then((m) => m.ActivitiesComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  { path: '**', canActivate: [homeRedirectGuard], children: [] },
];
