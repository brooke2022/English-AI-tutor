import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, Role, TeacherStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JobsService } from '../jobs/jobs.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AcceptBookingDto } from './dto/accept-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings.dto';

const BOOKING_INCLUDE = {
  student: { select: { id: true, name: true, email: true, avatarUrl: true } },
  teacherProfile: {
    select: {
      userId: true,
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      country: true,
    },
  },
} satisfies Prisma.BookingInclude;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationsService,
    private readonly jobs: JobsService,
  ) {}

  async create(studentId: string, dto: CreateBookingDto) {
    const slotTime = new Date(dto.slotTime);
    if (Number.isNaN(slotTime.getTime())) {
      throw new BadRequestException('Invalid slotTime');
    }
    if (slotTime <= new Date()) {
      throw new BadRequestException('slotTime must be in the future');
    }

    // Confirm teacher exists & approved
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId: dto.teacherId },
    });
    if (!teacher || teacher.status !== TeacherStatus.APPROVED) {
      throw new NotFoundException('Teacher not available');
    }

    if (dto.teacherId === studentId) {
      throw new BadRequestException('Cannot book yourself');
    }

    try {
      const booking = await this.prisma.booking.create({
        data: {
          studentId,
          teacherId: dto.teacherId,
          slotTime,
          type: dto.type ?? 'Trial Lesson',
          status: BookingStatus.PENDING,
        },
        include: BOOKING_INCLUDE,
      });

      await this.email.bookingCreated(booking);
      await this.notifications.push(booking.teacherId, 'BOOKING_CREATED', {
        bookingId: booking.id,
        studentName: booking.student.name,
        slotTime: booking.slotTime.toISOString(),
      });
      return booking;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('This slot has just been booked. Please pick another time.');
      }
      throw e;
    }
  }

  async list(userId: string, role: Role, query: ListBookingsQueryDto) {
    const where: Prisma.BookingWhereInput = {
      ...(role === Role.STUDENT && { studentId: userId }),
      ...(role === Role.TEACHER && { teacherId: userId }),
      ...(query.status && { status: query.status }),
    };

    return this.prisma.booking.findMany({
      where,
      orderBy: { slotTime: 'asc' },
      include: BOOKING_INCLUDE,
    });
  }

  async findOne(id: string, userId: string, role: Role) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const allowed =
      role === Role.ADMIN ||
      booking.studentId === userId ||
      booking.teacherId === userId;
    if (!allowed) throw new ForbiddenException('Not your booking');

    return booking;
  }

  async accept(bookingId: string, teacherId: string, dto: AcceptBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.teacherId !== teacherId) throw new ForbiddenException();
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Cannot accept a ${booking.status} booking`);
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED, meetingUrl: dto.meetingUrl },
      include: BOOKING_INCLUDE,
    });

    await this.email.bookingConfirmed(updated);
    await this.jobs.scheduleReminders(updated.id, updated.slotTime);
    await this.notifications.push(updated.studentId, 'BOOKING_CONFIRMED', {
      bookingId: updated.id,
      teacherName: updated.teacherProfile.user.name,
      meetingUrl: updated.meetingUrl,
      slotTime: updated.slotTime.toISOString(),
    });
    return updated;
  }

  async reject(bookingId: string, teacherId: string, dto: RejectBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.teacherId !== teacherId) throw new ForbiddenException();
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Cannot reject a ${booking.status} booking`);
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED, rejectionReason: dto.reason },
      include: BOOKING_INCLUDE,
    });

    await this.email.bookingRejected(updated);
    await this.notifications.push(updated.studentId, 'BOOKING_CANCELLED', {
      bookingId: updated.id,
      reason: updated.rejectionReason,
    });
    return updated;
  }

  async cancel(bookingId: string, userId: string, role: Role) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const isParty =
      booking.studentId === userId || booking.teacherId === userId || role === Role.ADMIN;
    if (!isParty) throw new ForbiddenException();

    const cancellable: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED];
    if (!cancellable.includes(booking.status)) {
      throw new BadRequestException(`Cannot cancel a ${booking.status} booking`);
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
      include: BOOKING_INCLUDE,
    });

    await this.email.bookingCancelled(updated, userId);
    const otherParty = userId === updated.teacherId ? updated.studentId : updated.teacherId;
    await this.notifications.push(otherParty, 'BOOKING_CANCELLED', {
      bookingId: updated.id,
      slotTime: updated.slotTime.toISOString(),
    });
    return updated;
  }
}
