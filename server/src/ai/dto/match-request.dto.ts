import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MatchRequestDto {
  @IsString()
  @MaxLength(1000)
  goals!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;
}
