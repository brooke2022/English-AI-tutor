import { IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class ListBookingsQueryDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
