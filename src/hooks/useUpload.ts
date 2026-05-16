import axios from 'axios';
import { apiPost } from '../lib/api';

export interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  mock?: boolean;
}

export type UploadKind = 'AVATAR' | 'VIDEO';

export async function uploadFile(file: File, kind: UploadKind): Promise<string> {
  const presigned = await apiPost<PresignResponse>('/uploads/presign', {
    kind,
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });

  if (presigned.mock || !presigned.uploadUrl) {
    // Dev mode without S3 — fall back to local blob preview
    return URL.createObjectURL(file);
  }

  await axios.put(presigned.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  });

  return presigned.publicUrl;
}
