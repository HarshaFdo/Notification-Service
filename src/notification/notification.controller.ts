import { Controller, Post, Body } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  @Post('send')
  sendNotification(@Body() data: { userId: string; message: string; fileName?: string; filePath?: string }) {
    this.notificationGateway.sendNotification(data.userId, {
      message: data.message,
      fileName: data.fileName,
      filePath: data.filePath,
    });
    return { success: true };
  }

  @Post('register')
  registerUser(@Body() data: { userId: string; socketId: string }) {
    this.notificationGateway.registerUser(data.userId, data.socketId);
    return { success: true };
  }
}