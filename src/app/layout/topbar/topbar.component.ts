import { Component, OnInit, inject, signal, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { SidebarService } from "../../core/services/sidebar.service";
import { AuthService } from "../../core/services/auth.service";
import { NotificationsService } from "../../core/services/notifications.service";
import { UsersService } from "../../core/services/users.service";
import { User, displayName, initials } from "../../core/models/user.model";
import { AvatarComponent } from "../../shared/ui/avatar/avatar.component";
import { ThemeSwitcherComponent } from "../../shared/ui/theme-switcher/theme-switcher.component";

@Component({
  selector: "app-topbar",
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent, ThemeSwitcherComponent],
  templateUrl: "./topbar.component.html",
})
export class TopbarComponent implements OnInit {
  sidebar = inject(SidebarService);
  auth = inject(AuthService);
  notifications = inject(NotificationsService);
  private usersService = inject(UsersService);
  private router = inject(Router);

  me = signal<User | null>(null);
  menuOpen = signal(false);

  constructor() {
    effect(() => {
      console.log(
        "👀 [TopbarComponent] Current Signal Value:",
        this.notifications.unreadCount(),
      );
    });
  }

  ngOnInit(): void {
    this.usersService.me().subscribe((user) => this.me.set(user));
    console.log("🚀 [TopbarComponent] Triggering refreshUnreadCount()");
    this.notifications.refreshUnreadCount();
  }

  displayName = displayName;
  initials = initials;

  logout(): void {
    this.auth.logout();
  }

  goToProfile(): void {
    this.menuOpen.set(false);
    this.router.navigate(["/profile"]);
  }
}
