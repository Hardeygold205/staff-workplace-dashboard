import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { io, Socket } from "socket.io-client";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket?: Socket;

  connect(accessToken: string): void {
    if (this.socket?.connected) return;

    this.socket = io(`${environment.wsUrl}/workplace`, {
      transports: ["websocket"],
      auth: {
        token: accessToken,
      },
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  onEvent<T>(eventName: string): Observable<T> {
    return new Observable<T>((observer) => {
      if (!this.socket) {
        observer.error(new Error("WebSocket is not connected"));
        return;
      }

      const handler = (data: T) => {
        observer.next(data);
      };

      this.socket.on(eventName, handler);

      return () => {
        this.socket?.off(eventName, handler);
      };
    });
  }
}
