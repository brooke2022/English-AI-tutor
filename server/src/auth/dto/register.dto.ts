import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsArray, IsNumber, Min } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsString()
  timezone?: string;

  // Student-only fields
  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningGoals?: string[];

  // Teacher-only fields
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() countryCode?: string;
  @IsOptional() @IsString() intro?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsNumber() @Min(0) hourlyRate?: number;
  @IsOptional() @IsNumber() @Min(0) trialPrice?: number;
}
