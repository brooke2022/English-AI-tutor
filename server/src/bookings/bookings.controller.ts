import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AcceptBookingDto } from './dto/accept-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Roles(Role.STUDENT)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookingDto) {
    return this.bookings.create(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListBookingsQueryDto) {
    return this.bookings.list(user.id, user.role, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookings.findOne(id, user.id, user.role);
  }

  @Roles(Role.TEACHER)
  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  accept(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: AcceptBookingDto,
  ) {
    return this.bookings.accept(id, user.id, dto);
  }

  @Roles(Role.TEACHER)
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RejectBookingDto,
  ) {
    return this.bookings.reject(id, user.id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookings.cancel(id, user.id, user.role);
  }
}
