import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
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
  { path: '**', redirectTo: 'dashboard' },
];
