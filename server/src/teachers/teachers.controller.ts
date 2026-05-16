import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TeachersService } from './teachers.service';
import { ListTeachersQueryDto } from './dto/list-teachers.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachers: TeachersService) {}

  @Public()
  @Get()
  list(@Query() query: ListTeachersQueryDto) {
    return this.teachers.list(query);
  }

  @Roles(Role.TEACHER)
  @Put('me/availability')
  setAvailability(@CurrentUser() user: AuthUser, @Body() dto: SetAvailabilityDto) {
    return this.teachers.setAvailability(user.id, dto);
  }

  @Public()
  @Get(':id')
  get(@Param('id') id: string) {
    return this.teachers.get(id);
  }
}
