import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class NotificationService {
  private server: Server;

  // Mapping to sessionHash to [{ userId, socketId}] for multi-tab support per session.
  private sessionMap: Map<string, { userId: string; socketId: string }[]> =
    new Map();

  setServer(server: Server) {
    this.server = server;
  }

  registerClient(socketId: string, sessionHash: string, userId: string) {
    const existing = this.sessionMap.get(sessionHash) || [];

    // Avoid duplicate registrations
    if (
      !existing.find(
        (entry) => entry.userId === userId && entry.socketId === socketId,
      )
    ) {
      this.sessionMap.set(sessionHash, [...existing, { userId, socketId }]);
    }

    console.log(
      `Registered: sessionHash=${sessionHash}, userId=${userId}, socketId=${socketId}`,
    );
  }

  unregisterClient(socketId: string) {
    for (const [sessionHash, entries] of this.sessionMap.entries()) {
      const updated = entries.filter((entry) => entry.socketId !== socketId);
      if (updated.length > 0) {
        this.sessionMap.set(sessionHash, updated);
      } else {
        this.sessionMap.delete(sessionHash);
      }
    }
  }

  sendNotification(sessionHash: string, userId: string, data: any) {
    const entries = this.sessionMap.get(sessionHash) || [];
    const entry = entries.find((e) => e.userId === userId);
    if (entry && entry.socketId) {
      this.server.to(entry.socketId).emit('notification', data);
      console.log(
        `Notification sent to sessionhash=${sessionHash}, userId=${userId}, socketId=${entry.socketId}`,
      );
    } else {
      console.log(
        `No socket found for sessionhash=${sessionHash}, userId=${userId}`,
      );
    }
  }
}
