import { Injectable, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { SocketService } from "./socket.service";

export interface ForceLogoutModalState {
  open: boolean;
  title: string;
  message: string;
  reason: "ACCOUNT_DEACTIVATED" | "PASSWORD_RESET";
}

@Injectable({
  providedIn: "root",
})
export class RealtimeEventsService {
  private readonly auth = inject(AuthService);
  private readonly socketService = inject(SocketService);
  private readonly router = inject(Router);

  private isStarted = false;

  readonly forceLogoutState = signal<ForceLogoutModalState>({
    open: false,
    title: "",
    message: "",
    reason: "ACCOUNT_DEACTIVATED",
  });

  start(): void {
    if (this.isStarted) return;

    const token = this.auth.getAccessToken();
    if (!token) return;

    this.socketService.connect(token);
    this.isStarted = true;

    this.socketService.onEvent("permissions_updated").subscribe({
      next: () => {
        this.auth.refresh().subscribe({
          error: (err) => console.error("Silent refresh failed:", err),
        });
      },
    });

    this.socketService
      .onEvent<{
        userId: string;
        reason: "ACCOUNT_DEACTIVATED" | "PASSWORD_RESET";
        message: string;
      }>("force_logout")
      .subscribe({
        next: (data) => {
          const title =
            data.reason === "ACCOUNT_DEACTIVATED"
              ? "Account Deactivated"
              : "Session Terminated";

          this.forceLogoutState.set({
            open: true,
            title,
            message: data.message,
            reason: data.reason,
          });

          this.socketService.disconnect();
        },
      });
  }

  acknowledgeForceLogout(): void {
    // Reset state
    this.forceLogoutState.set({
      open: false,
      title: "",
      message: "",
      reason: "ACCOUNT_DEACTIVATED",
    });

    // Clear session & tokens, then redirect to login page
    this.auth.logout();
  }

  stop(): void {
    this.socketService.disconnect();
    this.isStarted = false;
  }
}
