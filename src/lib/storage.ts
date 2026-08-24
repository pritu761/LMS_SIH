import fs from 'fs';
import path from 'path';

export interface UploadResult {
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  storageProvider: 'LOCAL' | 'S3_FALLBACK';
}

/**
 * Save an uploaded Buffer / ArrayBuffer locally in the Next.js public/uploads directory.
 * Requires zero cloud credentials and incurs zero AWS S3 charges.
 */
export async function saveLocalFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<UploadResult> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  // Ensure directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create clean safe unique filename
  const timestamp = Date.now();
  const sanitizedName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const safeFilename = `${timestamp}-${sanitizedName}`;
  const filePath = path.join(uploadsDir, safeFilename);

  // Write file to local disk
  await fs.promises.writeFile(filePath, fileBuffer);

  const bytes = fileBuffer.length;
  const fileSizeMb = Math.round((bytes / (1024 * 1024)) * 10) / 10;
  const fileSizeStr = fileSizeMb > 0 ? `${fileSizeMb} MB` : `${Math.round(bytes / 1024)} KB`;

  return {
    fileName: originalFilename,
    fileUrl: `/uploads/${safeFilename}`,
    fileSize: fileSizeStr,
    fileType: mimeType,
    storageProvider: 'LOCAL',
  };
}
