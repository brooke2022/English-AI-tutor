import { Body, Controller, Post } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { PresignDto } from './dto/presign.dto';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('presign')
  presign(@CurrentUser() user: AuthUser, @Body() dto: PresignDto) {
    return this.uploads.presign(user.id, dto);
  }
}
