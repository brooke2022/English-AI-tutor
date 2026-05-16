import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(studentId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.studentId !== studentId) throw new ForbiddenException();
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed lessons');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
          data: {
            bookingId: dto.bookingId,
            studentId,
            teacherId: booking.teacherId,
            rating: dto.rating,
            comment: dto.comment,
          },
        });

        // Recompute teacher rating cache
        const agg = await tx.review.aggregate({
          where: { teacherId: booking.teacherId },
          _avg: { rating: true },
          _count: { _all: true },
        });

        await tx.teacherProfile.update({
          where: { userId: booking.teacherId },
          data: {
            ratingAvg: agg._avg.rating ?? null,
            reviewCount: agg._count._all,
          },
        });

        return review;
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('This booking has already been reviewed.');
      }
      throw e;
    }
  }

  async listForTeacher(teacherId: string) {
    return this.prisma.review.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        student: { select: { name: true } },
      },
    });
  }
}
