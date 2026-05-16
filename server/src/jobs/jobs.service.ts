import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import IORedis, { Redis } from 'ioredis';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { NotificationsService } from '../notifications/notifications.service';

interface ReminderJobData {
  bookingId: string;
  minutesBefore: number;
}

const REMINDER_QUEUE = 'lesson-reminders';
const SWEEP_INTERVAL_MS = 60_000; // 1 minute

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private connection: Redis | null = null;
  private reminderQueue: Queue<ReminderJobData> | null = null;
  private worker: Worker<ReminderJobData> | null = null;
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationsService,
  ) {}

  async onModuleInit() {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set - background jobs disabled');
      this.startSweepLoopOnly();
      return;
    }

    try {
      this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
      this.reminderQueue = new Queue<ReminderJobData>(REMINDER_QUEUE, {
        connection: this.connection,
      });
      this.worker = new Worker<ReminderJobData>(
        REMINDER_QUEUE,
        async (job) => this.processReminder(job.data),
        { connection: this.connection },
      );
      this.worker.on('failed', (job, err) => {
        this.logger.error(`Reminder job ${job?.id} failed: ${err.message}`);
      });
      this.logger.log('BullMQ reminder worker started');
    } catch (err) {
      this.logger.warn(`Failed to connect Redis - jobs disabled: ${(err as Error).message}`);
    }

    this.startSweepLoop();
  }

  async onModuleDestroy() {
    if (this.sweepTimer) clearInterval(this.sweepTimer);
    await this.worker?.close();
    await this.reminderQueue?.close();
    await this.connection?.quit();
  }

  /** Schedule reminder jobs for an upcoming confirmed lesson. */
  async scheduleReminders(bookingId: string, slotTime: Date) {
    if (!this.reminderQueue) return;
    const now = Date.now();
    for (const minutesBefore of [24 * 60, 60]) {
      const fireAt = slotTime.getTime() - minutesBefore * 60_000;
      const delay = fireAt - now;
      if (delay <= 0) continue;
      await this.reminderQueue.add(
        'reminder',
        { bookingId, minutesBefore },
        { delay, removeOnComplete: true, removeOnFail: 100 },
      );
    }
  }

  private async processReminder(data: ReminderJobData) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        student: true,
        teacherProfile: { include: { user: true } },
      },
    });
    if (!booking || booking.status !== BookingStatus.CONFIRMED) return;

    await this.email.lessonReminder(booking, data.minutesBefore);
    await this.notifications.push(booking.studentId, 'LESSON_REMINDER', {
      bookingId: booking.id,
      minutesBefore: data.minutesBefore,
      slotTime: booking.slotTime.toISOString(),
      meetingUrl: booking.meetingUrl,
    });
  }

  /** Periodically mark past confirmed bookings as COMPLETED. */
  private startSweepLoop() {
    this.sweepTimer = setInterval(() => {
      void this.sweepCompleted();
    }, SWEEP_INTERVAL_MS);
  }

  private startSweepLoopOnly() {
    this.startSweepLoop();
  }

  private async sweepCompleted() {
    try {
      const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 60 min grace
      const result = await this.prisma.booking.updateMany({
        where: { status: BookingStatus.CONFIRMED, slotTime: { lt: cutoff } },
        data: { status: BookingStatus.COMPLETED },
      });
      if (result.count > 0) {
        this.logger.log(`Sweep: marked ${result.count} bookings COMPLETED`);
      }
    } catch (err) {
      this.logger.error(`Sweep failed: ${(err as Error).message}`);
    }
  }
}
