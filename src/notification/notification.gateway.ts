import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove from userSockets
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { userId: string }) {
    console.log(`Registering user ${payload.userId} with socket ${client.id}`);
    this.userSockets.set(payload.userId, client.id);
  }

  registerUser(userId: string, socketId: string) {
    this.userSockets.set(userId, socketId);
  }

  sendNotification(userId: string, data: any) {
    const socketId = this.userSockets.get(userId);
    console.log(`Sending notification to user ${userId}, socket ${socketId}`);
    if (socketId) {
      this.server.to(socketId).emit('notification', data);
    } else {
      console.log(`No socket found for user ${userId}`);
    }
  }
}
