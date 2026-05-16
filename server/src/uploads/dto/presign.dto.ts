import { IsEnum, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export enum UploadKind {
  AVATAR = 'AVATAR',
  VIDEO = 'VIDEO',
}

export class PresignDto {
  @IsEnum(UploadKind)
  kind!: UploadKind;

  @IsString()
  @MaxLength(120)
  filename!: string;

  @IsString()
  @MaxLength(80)
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(500 * 1024 * 1024) // 500 MB max
  size!: number;
}
