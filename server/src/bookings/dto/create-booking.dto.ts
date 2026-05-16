import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  teacherId!: string;

  @IsDateString()
  slotTime!: string; // ISO 8601 UTC

  @IsOptional()
  @IsString()
  @MaxLength(80)
  type?: string;
}
