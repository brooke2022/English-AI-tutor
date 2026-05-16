import { Injectable, NotFoundException } from '@nestjs/common';
import { TeacherStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listTeachers(status?: TeacherStatus) {
    const where = status ? { status } : {};
    return this.prisma.teacherProfile.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, timezone: true, avatarUrl: true } },
        tags: { select: { tag: true } },
      },
    });
  }

  async approve(teacherId: string) {
    const existing = await this.prisma.teacherProfile.findUnique({ where: { userId: teacherId } });
    if (!existing) throw new NotFoundException('Teacher not found');
    return this.prisma.teacherProfile.update({
      where: { userId: teacherId },
      data: { status: TeacherStatus.APPROVED, approvedAt: new Date(), rejectedAt: null },
    });
  }

  async reject(teacherId: string) {
    const existing = await this.prisma.teacherProfile.findUnique({ where: { userId: teacherId } });
    if (!existing) throw new NotFoundException('Teacher not found');
    return this.prisma.teacherProfile.update({
      where: { userId: teacherId },
      data: { status: TeacherStatus.REJECTED, rejectedAt: new Date(), approvedAt: null },
    });
  }
}
