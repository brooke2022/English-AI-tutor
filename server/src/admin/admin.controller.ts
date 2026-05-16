import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Role, TeacherStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';

@Roles(Role.ADMIN)
@Controller('admin/teachers')
export class AdminTeachersController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list(@Query('status') status?: TeacherStatus) {
    return this.admin.listTeachers(status);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.admin.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.admin.reject(id);
  }
}
