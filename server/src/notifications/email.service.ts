import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface BookingForEmail {
  id: string;
  slotTime: Date;
  type: string;
  meetingUrl?: string | null;
  rejectionReason?: string | null;
  student: { id: string; name: string; email: string };
  teacherProfile: { user: { id: string; name: string; email: string } };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.fromAddress = this.config.get<string>('RESEND_FROM') ?? 'notifications@example.com';
    this.resend = apiKey ? new Resend(apiKey) : null;
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY not set - emails will be logged to console');
    }
  }

  async bookingCreated(b: BookingForEmail) {
    await this.send(
      b.teacherProfile.user.email,
      '📅 New booking request',
      this.template({
        greeting: `Hi ${b.teacherProfile.user.name},`,
        body: [
          `<b>${b.student.name}</b> requested a <b>${b.type}</b>.`,
          `<b>Time:</b> ${this.fmtDate(b.slotTime)}`,
          `Open your dashboard to accept or decline this booking.`,
        ],
      }),
    );
  }

  async bookingConfirmed(b: BookingForEmail) {
    await this.send(
      b.student.email,
      '✅ Your lesson is confirmed',
      this.template({
        greeting: `Hi ${b.student.name},`,
        body: [
          `Your lesson with <b>${b.teacherProfile.user.name}</b> is confirmed.`,
          `<b>Time:</b> ${this.fmtDate(b.slotTime)}`,
          b.meetingUrl
            ? `<b>Meeting link:</b> <a href="${b.meetingUrl}">${b.meetingUrl}</a>`
            : `Meeting link will be shared soon.`,
        ],
      }),
    );
  }

  async bookingRejected(b: BookingForEmail) {
    await this.send(
      b.student.email,
      '❌ Booking declined',
      this.template({
        greeting: `Hi ${b.student.name},`,
        body: [
          `${b.teacherProfile.user.name} could not accept your booking on ${this.fmtDate(b.slotTime)}.`,
          `<b>Reason:</b> ${b.rejectionReason ?? 'No reason given'}.`,
          `Feel free to pick another slot or another teacher.`,
        ],
      }),
    );
  }

  async bookingCancelled(b: BookingForEmail, byUserId: string) {
    const cancelledByTeacher = byUserId === b.teacherProfile.user.id;
    const target = cancelledByTeacher ? b.student : b.teacherProfile.user;
    await this.send(
      target.email,
      '🚫 Booking cancelled',
      this.template({
        greeting: `Hi ${target.name},`,
        body: [`The booking on <b>${this.fmtDate(b.slotTime)}</b> has been cancelled.`],
      }),
    );
  }

  async lessonReminder(b: BookingForEmail, minutesBefore: number) {
    await this.send(
      b.student.email,
      `⏰ Lesson reminder (${minutesBefore} min)`,
      this.template({
        greeting: `Hi ${b.student.name},`,
        body: [
          `Your lesson with <b>${b.teacherProfile.user.name}</b> starts in ${minutesBefore} minutes.`,
          b.meetingUrl
            ? `<b>Meeting link:</b> <a href="${b.meetingUrl}">${b.meetingUrl}</a>`
            : `(No meeting link provided.)`,
        ],
      }),
    );
  }

  // ──────────────── internals ────────────────

  private template({ greeting, body }: { greeting: string; body: string[] }) {
    const lines = body.map((l) => `<p style="margin: 8px 0">${l}</p>`).join('');
    return `<div style="font-family: -apple-system, sans-serif; line-height: 1.5">
      <p>${greeting}</p>
      ${lines}
      <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0" />
      <p style="color: #888; font-size: 12px">English AI Tutor · automated notification</p>
    </div>`;
  }

  private fmtDate(d: Date): string {
    return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`[email→${to}] ${subject}`);
      return;
    }
    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Resend send failed for ${to}: ${(err as Error).message}`);
    }
  }
}
