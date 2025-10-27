import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(@Body() data: { userId: string; sessionHash: string; message: string; fileName?: string; filePath?: string }) {
    const {userId, sessionHash, ...notificationData} = data
    this.notificationService.sendNotification(sessionHash, userId, notificationData); 
    return { success: true };
  }
}