import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminTeachersController } from './admin.controller';

@Module({
  controllers: [AdminTeachersController],
  providers: [AdminService],
})
export class AdminModule {}
