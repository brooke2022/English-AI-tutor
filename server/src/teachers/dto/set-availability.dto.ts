import { ArrayMaxSize, IsArray, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WeeklySlotDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @IsInt() @Min(0) @Max(23) hour!: number;
}

export class SetAvailabilityDto {
  @IsArray()
  @ArrayMaxSize(7 * 24) // sanity cap
  @ValidateNested({ each: true })
  @Type(() => WeeklySlotDto)
  slots!: WeeklySlotDto[];
}
