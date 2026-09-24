import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { SidebarService } from "../../core/services/sidebar.service";
import { AuthService } from "../../core/services/auth.service";
import { ThemeService } from "../../core/services/theme.service";

interface NavItem {
  label: string;
  icon: string;
  route: string;
  permission?: string | string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    route: "/dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    label: "Attendance",
    route: "/attendance",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Requests",
    route: "/requests",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    label: "Projects",
    route: "/projects",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  },
  {
    label: "Events",
    route: "/events",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    label: "Calendar",
    route: "/calendar",
    icon: "M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    label: "Suggestions",
    route: "/suggestions",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.99-2.386l-.548-.547z",
  },
  {
    label: "Uploads",
    route: "/uploads",
    icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v8",
  },
  {
    label: "Staffs",
    route: "/users",
    icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4",
    permission: "users:view",
  },
  {
    label: "Roles & Permissions",
    route: "/roles",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    permission: "roles:view",
  },
  {
    label: "Screentime",
    route: "/screentime",
    icon: "M9 17V7m6 10V7M3 7h18M3 17h18",
    permission: "attendance:view_all",
  },
  {
    label: "Activity Log",
    route: "/activities",
    icon: "M4 6h16M4 12h16M4 18h7",
  },
];

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./sidebar.component.html",
})
export class SidebarComponent {
  theme = inject(ThemeService);
  sidebar = inject(SidebarService);
  auth = inject(AuthService);
  items = NAV_ITEMS;

  canSee(item: NavItem): boolean {
    if (!item.permission) return true;
    return Array.isArray(item.permission)
      ? this.auth.hasAnyPermission(item.permission)
      : this.auth.hasPermission(item.permission);
  }
}
