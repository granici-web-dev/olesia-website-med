import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
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

/** A stored image: its public URL plus the dimensions it ended up with. */
export interface StoredImage {
  url: string;
  width: number;
  height: number;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Output tuning: cap the longest side and re-encode as WebP. */
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 80;

/** Videos (site media): stored as-is, no transcoding — see `saveVideo`. */
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const VIDEO_EXT: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

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

  async saveImage(file: UploadedImage | undefined): Promise<StoredImage> {
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
    return this.storeImageBuffer(file.buffer);
  }

  /**
   * Process and store raw image bytes, returning the stored dimensions along
   * with the URL — `next/image` needs them, and only the encoder knows what
   * they ended up being after the resize.
   *
   * Public because a thumbnail can also arrive as bytes we fetched ourselves
   * rather than as an upload (see the media-appearances module).
   */
  async storeImageBuffer(buffer: Buffer): Promise<StoredImage> {
    let webp: Buffer;
    let width: number | undefined;
    let height: number | undefined;
    try {
      const output = await sharp(buffer)
        // Bake in EXIF orientation, then drop metadata.
        .rotate()
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer({ resolveWithObject: true });
      webp = output.data;
      width = output.info.width;
      height = output.info.height;
    } catch (err) {
      this.logger.warn(`Image processing failed: ${String(err)}`);
      throw new BadRequestException('Could not process the image file.');
    }

    const filename = `${randomUUID()}.webp`;
    await mkdir(STORAGE_DIR, { recursive: true });
    await writeFile(join(STORAGE_DIR, filename), webp);

    return {
      url: `${PUBLIC_API_URL}${STORAGE_URL_PREFIX}/${filename}`,
      width: width ?? 0,
      height: height ?? 0,
    };
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
   * Store a video as-is and return its public URL.
   *
   * No transcoding: the hero videos arrive already encoded, one per locale with
   * the subtitles burned in, and re-encoding here would quietly degrade
   * something the client had rendered deliberately. The cap is generous because
   * those files run ~8 MB each and a longer cut is plausible.
   */
  async saveVideo(file: UploadedImage | undefined): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    const ext = VIDEO_EXT[file.mimetype];
    if (!ext) {
      throw new BadRequestException('Unsupported video type (use MP4/WebM).');
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new BadRequestException('Video exceeds the 50 MB limit.');
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

  /**
   * Permanently delete a private document by its key. Best-effort and
   * idempotent (a missing file is not an error) — used by GDPR erasure so the
   * physical medical attachment leaves disk, not just its DB row.
   */
  async deletePrivateDocument(key: string): Promise<void> {
    try {
      await rm(join(PRIVATE_STORAGE_DIR, basename(key)), { force: true });
    } catch (err) {
      // Never let a stray file block erasure; surface for diagnostics only.
      this.logger.warn(`Private document delete failed: ${String(err)}`);
    }
  }

  /**
   * Permanently delete a public file given its stored URL (or bare filename).
   * Best-effort/idempotent — used when erasing a person's uploaded attachments.
   */
  async deletePublicFile(urlOrName: string): Promise<void> {
    if (!urlOrName) return;
    try {
      await rm(join(STORAGE_DIR, basename(urlOrName)), { force: true });
    } catch (err) {
      this.logger.warn(`Public file delete failed: ${String(err)}`);
    }
  }
}
