import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 12;
const REFRESH_BYTES = 48; // 384-bit random token

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.role === Role.TEACHER && (!dto.country || !dto.intro)) {
      throw new BadRequestException('Teachers must provide country and intro');
    }
    if (dto.role === Role.ADMIN) {
      throw new BadRequestException('Cannot self-register as admin');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const timezone = dto.timezone ?? 'UTC';

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role,
        timezone,
        ...(dto.role === Role.STUDENT && {
          studentProfile: {
            create: {
              nativeLanguage: dto.nativeLanguage,
              learningGoals: dto.learningGoals ?? [],
            },
          },
        }),
        ...(dto.role === Role.TEACHER && {
          teacherProfile: {
            create: {
              country: dto.country!,
              countryCode: dto.countryCode ?? 'XX',
              intro: dto.intro!,
              hourlyRate: dto.hourlyRate ?? 10,
              trialPrice: dto.trialPrice ?? 5,
              tags: { create: (dto.tags ?? []).map((tag) => ({ tag })) },
            },
          },
        }),
      },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user);
  }

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) throw new UnauthorizedException('Missing refresh token');

    const tokenHash = this.hashRefreshToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user);
  }

  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;
    const tokenHash = this.hashRefreshToken(rawRefreshToken);
    await this.prisma.refreshToken
      .updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => {});
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
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
        teacherProfile: {
          include: { tags: true },
        },
      },
    });
  }

  // ──────────────── internals ────────────────

  private async issueTokens(user: User) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.config.get<string>('JWT_ACCESS_TTL') ?? '15m' },
    );

    const refreshToken = crypto.randomBytes(REFRESH_BYTES).toString('base64url');
    const tokenHash = this.hashRefreshToken(refreshToken);
    const ttlDays = Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS') ?? '30');
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        timezone: user.timezone,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private hashRefreshToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  refreshCookieOptions() {
    const ttlDays = Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS') ?? '30');
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      domain: this.config.get<string>('COOKIE_DOMAIN') ?? undefined,
      path: '/api/v1/auth',
      maxAge: ttlDays * 24 * 60 * 60 * 1000,
    };
  }
}
