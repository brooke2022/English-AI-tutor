import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BookingStatus, Prisma, TeacherStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListTeachersQueryDto } from './dto/list-teachers.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';

const FUTURE_WEEKS = 4;
const PUBLIC_SELECT = {
  userId: true,
  country: true,
  countryCode: true,
  intro: true,
  yearsExp: true,
  education: true,
  hourlyRate: true,
  trialPrice: true,
  videoUrl: true,
  whatsapp: true,
  ratingAvg: true,
  reviewCount: true,
  status: true,
  user: {
    select: { id: true, name: true, timezone: true, avatarUrl: true },
  },
  tags: { select: { tag: true } },
} satisfies Prisma.TeacherProfileSelect;

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListTeachersQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 50);

    const where: Prisma.TeacherProfileWhereInput = {
      status: TeacherStatus.APPROVED,
      ...(query.search && {
        OR: [
          { user: { name: { contains: query.search, mode: 'insensitive' } } },
          { intro: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.tag && { tags: { some: { tag: query.tag } } }),
      ...(query.country && { countryCode: query.country }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.teacherProfile.findMany({
        where,
        select: PUBLIC_SELECT,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ ratingAvg: 'desc' }, { reviewCount: 'desc' }],
      }),
      this.prisma.teacherProfile.count({ where }),
    ]);

    return {
      data: data.map((t) => this.flattenTeacher(t)),
      page,
      pageSize,
      total,
    };
  }

  async get(teacherId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId: teacherId },
      select: {
        ...PUBLIC_SELECT,
        weeklySlots: { select: { dayOfWeek: true, hour: true } },
      },
    });
    if (!teacher || teacher.status !== TeacherStatus.APPROVED) {
      throw new NotFoundException('Teacher not found');
    }

    const reviews = await this.prisma.review.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        student: { select: { name: true } },
      },
    });

    const availableSlots = await this.computeAvailableSlots(
      teacherId,
      teacher.weeklySlots,
      teacher.user.timezone,
    );

    const { weeklySlots, ...rest } = teacher;
    return {
      ...this.flattenTeacher(rest),
      weeklySlots: weeklySlots.map((s) => `${s.dayOfWeek}-${s.hour}`),
      availableSlots,
      reviews: reviews.map((r) => ({
        id: r.id,
        studentName: r.student.name,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt.toISOString(),
      })),
    };
  }

  async setAvailability(teacherId: string, dto: SetAvailabilityDto) {
    // Validate teacher profile exists
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { userId: teacherId },
    });
    if (!profile) throw new ForbiddenException('Not a teacher');

    return this.prisma.$transaction(async (tx) => {
      await tx.weeklySlot.deleteMany({ where: { teacherId } });
      if (dto.slots.length > 0) {
        await tx.weeklySlot.createMany({
          data: dto.slots.map((s) => ({
            teacherId,
            dayOfWeek: s.dayOfWeek,
            hour: s.hour,
          })),
          skipDuplicates: true,
        });
      }
      const newSlots = await tx.weeklySlot.findMany({
        where: { teacherId },
        select: { dayOfWeek: true, hour: true },
      });
      return { slots: newSlots };
    });
  }

  /**
   * Compute future 4 weeks of available UTC slot times,
   * subtracting any slot already booked (PENDING/CONFIRMED).
   */
  private async computeAvailableSlots(
    teacherId: string,
    weeklySlots: Array<{ dayOfWeek: number; hour: number }>,
    teacherTimezone: string,
  ): Promise<string[]> {
    if (weeklySlots.length === 0) return [];

    const now = new Date();
    const horizon = new Date(now.getTime() + FUTURE_WEEKS * 7 * 24 * 60 * 60 * 1000);

    // Generate all candidate UTC times from weekly template
    const candidates: Date[] = [];
    const cursor = new Date(now);
    cursor.setUTCHours(0, 0, 0, 0);

    while (cursor < horizon) {
      const dow = cursor.getUTCDay();
      for (const slot of weeklySlots) {
        if (slot.dayOfWeek === dow) {
          const utc = new Date(cursor);
          utc.setUTCHours(slot.hour, 0, 0, 0);
          if (utc > now && utc < horizon) candidates.push(utc);
        }
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    if (candidates.length === 0) return [];

    // Subtract bookings that are PENDING or CONFIRMED
    const booked = await this.prisma.booking.findMany({
      where: {
        teacherId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        slotTime: { in: candidates },
      },
      select: { slotTime: true },
    });
    const bookedSet = new Set(booked.map((b) => b.slotTime.getTime()));

    // Suppress unused param warning - timezone is exposed for future per-tz computation
    void teacherTimezone;

    return candidates
      .filter((c) => !bookedSet.has(c.getTime()))
      .map((c) => c.toISOString());
  }

  private flattenTeacher<T extends { user: { id: string; name: string; timezone: string; avatarUrl: string | null }; tags: Array<{ tag: string }> }>(
    t: T,
  ) {
    const { user, tags, ...rest } = t;
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatarUrl,
      timezone: user.timezone,
      tags: tags.map((x) => x.tag),
      ...rest,
    };
  }
}
