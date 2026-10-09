import { Component, OnInit, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TopbarComponent } from "../topbar/topbar.component";
import { AttendanceReminderModalComponent } from "../attendance-reminder-modal/attendance-reminder-modal.component";
import { SidebarService } from "../../core/services/sidebar.service";
import { AttendanceReminderService } from "../../core/services/attendance-reminder.service";
import { RealtimeEventsService } from "../../core/services/realtime-events.service";
import { AuthService } from "../../core/services/auth.service";
import { ModalComponent } from "../../shared/ui/modal/modal.component";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    AttendanceReminderModalComponent,
    ModalComponent,
  ],
  templateUrl: "./shell.component.html",
})
export class ShellComponent implements OnInit {
  sidebar = inject(SidebarService);
  private reminder = inject(AttendanceReminderService);
  auth = inject(AuthService);
  private realtimeevents = inject(RealtimeEventsService);

  readonly forceLogoutModal = this.realtimeevents.forceLogoutState;

  ngOnInit(): void {
    if (!this.auth.isPlatformAdmin()) this.reminder.start();
    this.realtimeevents.start();
  }

  onConfirmForceLogout(): void {
    this.realtimeevents.acknowledgeForceLogout();
  }
}
