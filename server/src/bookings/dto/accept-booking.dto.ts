import { IsString, IsUrl, MaxLength } from 'class-validator';

export class AcceptBookingDto {
  @IsString()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  meetingUrl!: string;
}
