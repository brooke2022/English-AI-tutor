import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { MatchRequestDto } from './dto/match-request.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  // 10 calls per hour per IP for AI matching
  @Throttle({ default: { ttl: 3_600_000, limit: 10 } })
  @Post('match')
  match(@Body() dto: MatchRequestDto) {
    return this.ai.match(dto);
  }
}
