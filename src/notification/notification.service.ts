import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private server: Server;

  // Mapping to userId to socketId for multi-tab support per user.
  private userMap: Map<string, string> = new Map();

  setServer(server: Server) {
    this.server = server;
  }

  registerClient(socketId: string, userId: string) {
    const existingSocketId = this.userMap.get(userId);

    // Avoid duplicate registrations - same userId and same socketId
    if (existingSocketId === socketId) {
      this.logger.warn(
        `Client already registered: userId=${userId}, socketId=${socketId} - Duplicate registration ignored`,
      );
      return;
    }

    // Log if replacing an existing socketId like during reconnection or page refresh
    if (existingSocketId && existingSocketId !== socketId) {
      this.logger.log(
        `Replacing existing socketId for userId=${userId}:` +
          `${existingSocketId} -> ${socketId}`,
      );
    }

    this.userMap.set(userId, socketId);
    this.logger.log(
      `Registered client: userId=${userId}, socketId=${socketId}`,
    );
  }

  unregisterClient(socketId: string) {
    for (const [userId, entry] of this.userMap.entries()) {
      if (entry === socketId) {
        this.userMap.delete(userId);
        this.logger.log(
          `Unregistered client: userId=${userId}, socketId=${socketId}`,
        );
        break;
      }
    }
  }

  sendNotification(userId: string, data: any) {
    const socketId = this.userMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', data);
      this.logger.log(
        `Notification sent to userId=${userId}, socketId=${socketId}`,
      );
    } else {
      this.logger.log(`No socket found for userId=${userId}`);
    }
  }
}
