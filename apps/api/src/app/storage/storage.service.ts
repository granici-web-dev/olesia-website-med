import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

import {
  PRIVATE_STORAGE_DIR,
  PUBLIC_API_URL,
  STORAGE_DIR,
  STORAGE_URL_PREFIX,
} from './storage.constants';

/** A multer in-memory file (FileInterceptor default storage). */
export interface UploadedImage {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Output tuning: cap the longest side and re-encode as WebP. */
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 80;

/** Documents (written plans): larger cap, office/PDF types, stored as-is. */
const MAX_DOC_BYTES = 20 * 1024 * 1024;
const DOC_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
};

/**
 * Local file storage (module_calendly.md §11). Converts uploads to WebP
 * (resized + compressed) and returns a public URL. The `storage` abstraction
 * keeps the swap to S3/Cloudinary later a one-file change.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  async saveImage(file: UploadedImage | undefined): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Unsupported image type (use JPEG/PNG/WebP).',
      );
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image exceeds the 5 MB limit.');
    }

    let webp: Buffer;
    try {
      webp = await sharp(file.buffer)
        // Bake in EXIF orientation, then drop metadata.
        .rotate()
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
    } catch (err) {
      this.logger.warn(`Image processing failed: ${String(err)}`);
      throw new BadRequestException('Could not process the image file.');
    }

    const filename = `${randomUUID()}.webp`;
    await mkdir(STORAGE_DIR, { recursive: true });
    await writeFile(join(STORAGE_DIR, filename), webp);

    return { url: `${PUBLIC_API_URL}${STORAGE_URL_PREFIX}/${filename}` };
  }

  /**
   * Store a document (the written plan) as-is and return its public URL.
   * PDF/DOC/DOCX only; capped at 20 MB. Unlike images these are not processed.
   */
  async saveDocument(
    file: UploadedImage | undefined,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    const ext = DOC_EXT[file.mimetype];
    if (!ext) {
      throw new BadRequestException('Unsupported document type (use PDF/DOC/DOCX).');
    }
    if (file.size > MAX_DOC_BYTES) {
      throw new BadRequestException('Document exceeds the 20 MB limit.');
    }

    const filename = `${randomUUID()}.${ext}`;
    await mkdir(STORAGE_DIR, { recursive: true });
    await writeFile(join(STORAGE_DIR, filename), file.buffer);

    return { url: `${PUBLIC_API_URL}${STORAGE_URL_PREFIX}/${filename}` };
  }

  /**
   * Store a PRIVATE document (patient medical record) outside the public
   * static path. Returns an opaque storage key — the file is reachable only
   * via the authenticated download endpoint, never a public URL.
   */
  async savePrivateDocument(
    file: UploadedImage | undefined,
  ): Promise<{ key: string }> {
    if (!file) throw new BadRequestException('No file uploaded.');
    const ext = DOC_EXT[file.mimetype];
    if (!ext) {
      throw new BadRequestException('Unsupported document type (use PDF/DOC/DOCX).');
    }
    if (file.size > MAX_DOC_BYTES) {
      throw new BadRequestException('Document exceeds the 20 MB limit.');
    }
    const key = `${randomUUID()}.${ext}`;
    await mkdir(PRIVATE_STORAGE_DIR, { recursive: true });
    await writeFile(join(PRIVATE_STORAGE_DIR, key), file.buffer);
    return { key };
  }

  /** Absolute path of a private document by its key (traversal-safe). */
  privateDocPath(key: string): string {
    return join(PRIVATE_STORAGE_DIR, basename(key));
  }
}
