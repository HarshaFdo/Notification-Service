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

  constructor(private readonly notificationService: NotificationService) {}

  afterInit(server: Server) {
    this.notificationService.setServer(server);
    console.log('WebSocket server initialized');
  }
  
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.notificationService.unregisterClient(client.id);
  }

  @SubscribeMessage('register')
  handleRegister(
    client: Socket,
    payload: { sessionHash: string; userId: string },
  ) {
    this.notificationService.registerClient(
      client.id,
      payload.sessionHash,
      payload.userId,
    );
  }
}
