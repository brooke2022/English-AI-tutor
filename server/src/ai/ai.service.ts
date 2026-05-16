import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { TeacherStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MatchRequestDto } from './dto/match-request.dto';

type TeacherWithUserTags = Prisma.TeacherProfileGetPayload<{
  include: {
    user: { select: { id: true; name: true } };
    tags: { select: { tag: true } };
  };
}>;

export interface MatchResult {
  teacherIds: string[];
  reasoning: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: GoogleGenAI | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn('GEMINI_API_KEY not set - /ai/match will use heuristic fallback');
    }
  }

  async match(dto: MatchRequestDto): Promise<MatchResult> {
    const teachers = await this.prisma.teacherProfile.findMany({
      where: { status: TeacherStatus.APPROVED },
      include: {
        user: { select: { id: true, name: true } },
        tags: { select: { tag: true } },
      },
      orderBy: [{ ratingAvg: 'desc' }, { reviewCount: 'desc' }],
      take: 50,
    });

    if (teachers.length === 0) {
      return { teacherIds: [], reasoning: 'No approved teachers available yet.' };
    }

    if (!this.client) {
      return this.heuristicMatch(dto, teachers);
    }

    try {
      return await this.geminiMatch(dto, teachers);
    } catch (err) {
      this.logger.warn(`Gemini call failed, falling back to heuristic: ${(err as Error).message}`);
      return this.heuristicMatch(dto, teachers);
    }
  }

  private async geminiMatch(
    dto: MatchRequestDto,
    teachers: TeacherWithUserTags[],
  ): Promise<MatchResult> {
    const teacherSummaries = teachers.map((t) => ({
      id: t.userId,
      name: t.user.name,
      country: t.country,
      tags: t.tags.map((x) => x.tag),
      intro: t.intro.slice(0, 200),
      rating: t.ratingAvg ? Number(t.ratingAvg) : null,
    }));

    const prompt = `You are an English-tutor matching assistant. The student says:

"${dto.goals}"${dto.level ? `\nTheir level: ${dto.level}` : ''}

Pick up to 3 best-fit teachers from this JSON list and return ONLY valid JSON with shape:
{ "teacherIds": ["..."], "reasoning": "one short paragraph in English" }

Teachers:
${JSON.stringify(teacherSummaries)}`;

    const response = await this.client!.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });

    const text = response.text ?? '';
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Gemini returned no JSON');
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    const validIds = new Set(teacherSummaries.map((s) => s.id));
    const teacherIds = (parsed.teacherIds as string[]).filter((id) => validIds.has(id)).slice(0, 3);
    return {
      teacherIds,
      reasoning: parsed.reasoning ?? '',
    };
  }

  private heuristicMatch(
    dto: MatchRequestDto,
    teachers: TeacherWithUserTags[],
  ): MatchResult {
    const q = dto.goals.toLowerCase();
    const scored = teachers
      .map((t) => {
        const tags = t.tags.map((x) => x.tag.toLowerCase());
        let score = 0;
        for (const tag of tags) if (q.includes(tag)) score += 3;
        if (t.ratingAvg) score += Number(t.ratingAvg);
        return { id: t.userId, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      teacherIds: scored.map((s) => s.id),
      reasoning: 'Matched by tag keywords + rating (Gemini unavailable).',
    };
  }
}
