import { IsOptional, IsString, IsArray, IsNumber, Min, Max, MaxLength } from 'class-validator';

export class UpdateUserDto {
  // Common
  @IsOptional() @IsString() @MaxLength(80) name?: string;
  @IsOptional() @IsString() @MaxLength(100) timezone?: string;
  @IsOptional() @IsString() avatarUrl?: string;

  // Student
  @IsOptional() @IsString() nativeLanguage?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) learningGoals?: string[];
  @IsOptional() @IsString() @MaxLength(80) city?: string;
  @IsOptional() @IsString() @MaxLength(50) targetLevel?: string;

  // Teacher
  @IsOptional() @IsString() @MaxLength(100) country?: string;
  @IsOptional() @IsString() @MaxLength(4) countryCode?: string;
  @IsOptional() @IsString() @MaxLength(2000) intro?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(50) yearsExp?: number;
  @IsOptional() @IsString() @MaxLength(200) education?: string;
  @IsOptional() @IsNumber() @Min(0) hourlyRate?: number;
  @IsOptional() @IsNumber() @Min(0) trialPrice?: number;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsString() @MaxLength(30) whatsapp?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}
