import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        timezone: true,
        avatarUrl: true,
        createdAt: true,
        studentProfile: true,
        teacherProfile: { include: { tags: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(userId: string, role: Role, dto: UpdateUserDto) {
    return this.prisma.$transaction(async (tx) => {
      // Base user fields
      const userUpdates: Record<string, unknown> = {};
      if (dto.name !== undefined) userUpdates.name = dto.name;
      if (dto.timezone !== undefined) userUpdates.timezone = dto.timezone;
      if (dto.avatarUrl !== undefined) userUpdates.avatarUrl = dto.avatarUrl;
      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({ where: { id: userId }, data: userUpdates });
      }

      // Role-specific profile updates
      if (role === Role.STUDENT) {
        const studentUpdates: Record<string, unknown> = {};
        if (dto.nativeLanguage !== undefined) studentUpdates.nativeLanguage = dto.nativeLanguage;
        if (dto.learningGoals !== undefined) studentUpdates.learningGoals = dto.learningGoals;
        if (dto.city !== undefined) studentUpdates.city = dto.city;
        if (dto.targetLevel !== undefined) studentUpdates.targetLevel = dto.targetLevel;
        if (Object.keys(studentUpdates).length > 0) {
          await tx.studentProfile.upsert({
            where: { userId },
            create: { userId, ...studentUpdates },
            update: studentUpdates,
          });
        }
      }

      if (role === Role.TEACHER) {
        const teacherUpdates: Record<string, unknown> = {};
        for (const key of [
          'country',
          'countryCode',
          'intro',
          'yearsExp',
          'education',
          'hourlyRate',
          'trialPrice',
          'videoUrl',
          'whatsapp',
        ] as const) {
          if (dto[key] !== undefined) teacherUpdates[key] = dto[key];
        }
        if (Object.keys(teacherUpdates).length > 0) {
          await tx.teacherProfile.update({ where: { userId }, data: teacherUpdates });
        }
        // Tags: replace whole set if provided
        if (dto.tags !== undefined) {
          await tx.teacherTag.deleteMany({ where: { teacherId: userId } });
          if (dto.tags.length > 0) {
            await tx.teacherTag.createMany({
              data: dto.tags.map((tag) => ({ teacherId: userId, tag })),
              skipDuplicates: true,
            });
          }
        }
      }

      // Return refreshed user
      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          timezone: true,
          avatarUrl: true,
          studentProfile: true,
          teacherProfile: { include: { tags: true } },
        },
      });
    });
  }
}
