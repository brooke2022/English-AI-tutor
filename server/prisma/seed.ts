import { PrismaClient, Role, TeacherStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SeedTeacher {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  avatar: string;
  tags: string[];
  price: number;
  trialPrice: number;
  rating: number;
  reviewCount: number;
  timezone: string;
  intro: string;
  videoUrl: string;
  whatsapp?: string;
  yearsExp?: number;
  education?: string;
  availableSlots: string[];
  reviews?: Array<{
    id: string;
    studentName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

const TEACHERS_JSON_PATH = path.resolve(__dirname, '../../src/data/teachers.json');
const DEFAULT_PASSWORD = 'password123';

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // Demo accounts (mirror frontend MOCK_USERS)
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      email: 'student@test.com',
      passwordHash,
      name: 'Demo Student',
      role: Role.STUDENT,
      timezone: 'Asia/Shanghai',
      studentProfile: {
        create: {
          nativeLanguage: 'Chinese',
          learningGoals: ['IELTS', 'Conversational'],
        },
      },
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@test.com' },
    update: {},
    create: {
      email: 'teacher@test.com',
      passwordHash,
      name: 'Maria Santos',
      role: Role.TEACHER,
      timezone: 'Asia/Manila',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@tutorai.com' },
    update: {},
    create: {
      email: 'admin@tutorai.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      name: 'Admin',
      role: Role.ADMIN,
      timezone: 'UTC',
    },
  });

  // Load teachers.json
  if (!fs.existsSync(TEACHERS_JSON_PATH)) {
    console.warn(`⚠️  teachers.json not found at ${TEACHERS_JSON_PATH}`);
    console.log('✅ Seed completed (demo users only).');
    return;
  }

  const teachers: SeedTeacher[] = JSON.parse(fs.readFileSync(TEACHERS_JSON_PATH, 'utf-8'));

  for (const [i, t] of teachers.entries()) {
    // First teacher is bound to teacher@test.com; others get synthetic accounts
    const userId =
      i === 0
        ? teacherUser.id
        : (
            await prisma.user.upsert({
              where: { email: `${t.id}@seed.tutor` },
              update: {},
              create: {
                email: `${t.id}@seed.tutor`,
                passwordHash,
                name: t.name,
                role: Role.TEACHER,
                timezone: t.timezone,
                avatarUrl: t.avatar,
              },
            })
          ).id;

    await prisma.teacherProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        country: t.country,
        countryCode: t.countryCode,
        intro: t.intro,
        yearsExp: t.yearsExp,
        education: t.education,
        hourlyRate: t.price,
        trialPrice: t.trialPrice,
        videoUrl: t.videoUrl,
        whatsapp: t.whatsapp,
        status: TeacherStatus.APPROVED,
        ratingAvg: t.rating,
        reviewCount: t.reviewCount,
        approvedAt: new Date('2026-01-01'),
      },
    });

    // Tags
    for (const tag of t.tags) {
      await prisma.teacherTag.upsert({
        where: { teacherId_tag: { teacherId: userId, tag } },
        update: {},
        create: { teacherId: userId, tag },
      });
    }

    // Default weekly availability: weekdays 8-12, 14-18 (local hours)
    const defaultHours = [8, 9, 10, 11, 14, 15, 16, 17];
    const defaultDays = [1, 2, 3, 4, 5]; // Mon-Fri
    for (const day of defaultDays) {
      for (const hour of defaultHours) {
        await prisma.weeklySlot.upsert({
          where: {
            teacherId_dayOfWeek_hour: { teacherId: userId, dayOfWeek: day, hour },
          },
          update: {},
          create: { teacherId: userId, dayOfWeek: day, hour },
        });
      }
    }

    // Reviews
    if (t.reviews) {
      for (const r of t.reviews) {
        // skip if no booking — reviews require bookingId now; create a dummy completed booking?
        // For seed, skip linking review to booking to keep things simple.
        // (Real reviews flow goes through bookings.)
      }
    }

    console.log(`  ✓ Seeded teacher: ${t.name}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   Demo accounts (password: ${DEFAULT_PASSWORD}):`);
  console.log(`     student@test.com`);
  console.log(`     teacher@test.com  (linked to ${teachers[0]?.name ?? 'first teacher'})`);
  console.log(`     admin@tutorai.com (password: admin123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
