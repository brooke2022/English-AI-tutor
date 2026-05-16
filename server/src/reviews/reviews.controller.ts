import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Roles(Role.STUDENT)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, dto);
  }

  @Public()
  @Get()
  list(@Query('teacherId') teacherId: string) {
    return this.reviews.listForTeacher(teacherId);
  }
}
