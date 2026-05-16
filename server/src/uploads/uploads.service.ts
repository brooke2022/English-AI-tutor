import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import { PresignDto, UploadKind } from './dto/presign.dto';

const KIND_CONFIG: Record<UploadKind, { prefix: string; maxBytes: number; allowedMime: RegExp }> = {
  AVATAR: { prefix: 'avatars', maxBytes: 5 * 1024 * 1024, allowedMime: /^image\/(jpeg|png|webp)$/ },
  VIDEO: { prefix: 'videos', maxBytes: 200 * 1024 * 1024, allowedMime: /^video\/(mp4|quicktime|webm)$/ },
};

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string | undefined;
  private readonly publicBaseUrl: string | undefined;

  constructor(config: ConfigService) {
    const endpoint = config.get<string>('S3_ENDPOINT');
    const region = config.get<string>('S3_REGION') ?? 'auto';
    const accessKeyId = config.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('S3_SECRET_ACCESS_KEY');
    this.bucket = config.get<string>('S3_BUCKET');
    this.publicBaseUrl = config.get<string>('S3_PUBLIC_BASE_URL');

    if (endpoint && accessKeyId && secretAccessKey && this.bucket) {
      this.client = new S3Client({
        endpoint,
        region,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
      });
    } else {
      this.client = null;
      this.logger.warn('S3/R2 not configured - uploads will return mock URLs');
    }
  }

  async presign(userId: string, dto: PresignDto) {
    const cfg = KIND_CONFIG[dto.kind];
    if (dto.size > cfg.maxBytes) {
      throw new BadRequestException(`File too large (max ${cfg.maxBytes / 1024 / 1024} MB)`);
    }
    if (!cfg.allowedMime.test(dto.contentType)) {
      throw new BadRequestException(`Unsupported content type: ${dto.contentType}`);
    }

    const ext = dto.filename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? 'bin';
    const key = `${cfg.prefix}/${userId}/${crypto.randomBytes(8).toString('hex')}.${ext}`;

    if (!this.client) {
      // Dev fallback: pretend it's uploaded; return a placeholder URL
      return {
        uploadUrl: '',
        publicUrl: `https://example.com/dev-upload/${key}`,
        key,
        mock: true,
      };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket!,
        Key: key,
        ContentType: dto.contentType,
        ContentLength: dto.size,
      });
      const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 300 });
      const publicUrl = this.publicBaseUrl
        ? `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`
        : `${this.client.config.endpoint}/${this.bucket}/${key}`;

      return { uploadUrl, publicUrl, key, mock: false };
    } catch (err) {
      this.logger.error(`Failed to presign: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Could not generate upload URL');
    }
  }
}
