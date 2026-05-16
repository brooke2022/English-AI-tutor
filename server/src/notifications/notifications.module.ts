import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Global()
@Module({
  imports: [RealtimeModule],
  controllers: [NotificationsController],
  providers: [EmailService, NotificationsService],
  exports: [EmailService, NotificationsService],
})
export class NotificationsModule {}
