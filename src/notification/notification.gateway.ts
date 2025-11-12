import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  constructor(private readonly notificationService: NotificationService) {}

  afterInit(server: Server) {
    this.notificationService.setServer(server);
    this.logger.log('WebSocket server initialized');
  }
  
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.notificationService.unregisterClient(client.id);
  }

  @SubscribeMessage('register')
  handleRegister(
    client: Socket,
    payload: { userId: string },
  ) {
    this.notificationService.registerClient(
      client.id,
      payload.userId,
    );
  }
}
