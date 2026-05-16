import { IsString, MaxLength } from 'class-validator';

export class RejectBookingDto {
  @IsString()
  @MaxLength(120)
  reason!: string;
}
