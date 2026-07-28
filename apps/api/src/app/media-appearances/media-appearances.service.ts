import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { MediaAppearanceDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService, type StoredImage } from '../storage/storage.service';
import { toMediaAppearanceDto } from './media-appearances.mapper';
import {
  CreateMediaAppearanceDto,
  UpdateMediaAppearanceDto,
} from './dto/media-appearance.dto';

/** How long to wait on YouTube for a thumbnail before giving up on it. */
const THUMBNAIL_TIMEOUT_MS = 8000;

/**
 * Pull the video id out of any YouTube URL shape the client might paste:
 * `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/live/`.
 */
export function youtubeVideoId(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    return url.pathname.slice(1).split('/')[0] || null;
  }
  if (host !== 'youtube.com' && host !== 'm.youtube.com') return null;

  const v = url.searchParams.get('v');
  if (v) return v;
  const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
  return match ? match[1] : null;
}

@Injectable()
export class MediaAppearancesService {
  private readonly logger = new Logger(MediaAppearancesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /** Public /media page: published entries only, newest arrangement first. */
  async findPublished(): Promise<MediaAppearanceDto[]> {
    const list = await this.prisma.mediaAppearance.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toMediaAppearanceDto);
  }

  /** Back office: everything, including what is currently hidden. */
  async findAll(): Promise<MediaAppearanceDto[]> {
    const list = await this.prisma.mediaAppearance.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toMediaAppearanceDto);
  }

  async create(
    dto: CreateMediaAppearanceDto,
  ): Promise<MediaAppearanceDto> {
    const created = await this.prisma.mediaAppearance.create({
      data: {
        kind: dto.kind,
        outlet: dto.outlet,
        show: dto.show ?? null,
        date: dto.date ? new Date(dto.date) : null,
        duration: dto.duration ?? null,
        titleRo: dto.titleRo,
        titleEn: dto.titleEn,
        titleRu: dto.titleRu ?? null,
        summaryRo: dto.summaryRo,
        summaryEn: dto.summaryEn,
        summaryRu: dto.summaryRu ?? null,
        url: dto.url,
        embedProvider: dto.embedProvider,
        embedRef: dto.embedRef,
        thumbUrl: dto.thumbUrl,
        thumbWidth: dto.thumbWidth,
        thumbHeight: dto.thumbHeight,
        sortOrder: dto.sortOrder ?? (await this.nextSortOrder()),
        active: dto.active ?? true,
      },
    });
    return toMediaAppearanceDto(created);
  }

  async update(
    id: string,
    dto: UpdateMediaAppearanceDto,
  ): Promise<MediaAppearanceDto> {
    await this.getOrThrow(id);
    // Only the keys actually sent are written — a PATCH that flips `active`
    // must not blank the show name and the broadcast date along the way.
    const { date, ...rest } = dto;
    return toMediaAppearanceDto(
      await this.prisma.mediaAppearance.update({
        where: { id },
        data: {
          ...rest,
          // `date` crosses the wire as an ISO string; the column is a DateTime.
          ...(date !== undefined
            ? { date: date ? new Date(date) : null }
            : {}),
        },
      }),
    );
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.prisma.mediaAppearance.delete({ where: { id } });
  }

  /**
   * Fetch a publication's thumbnail and store it as our own file.
   *
   * The /media embeds are click-to-load precisely so no third party is
   * contacted before consent — pointing an <img> at ytimg would undo that on
   * first paint. So the bytes are copied once, here, and served from us.
   *
   * Only YouTube can be resolved automatically: Facebook's `og:image` URLs are
   * signed and expire, so those thumbnails have to be uploaded by hand.
   */
  async thumbnailFromUrl(rawUrl: string): Promise<StoredImage> {
    const videoId = youtubeVideoId(rawUrl);
    if (!videoId) {
      throw new BadRequestException('thumbnail_youtube_only');
    }

    // `maxresdefault` does not exist for every video; `hqdefault` always does.
    for (const name of ['maxresdefault', 'hqdefault']) {
      const buffer = await this.fetchImage(
        `https://i.ytimg.com/vi/${videoId}/${name}.jpg`,
      );
      if (buffer) return this.storage.storeImageBuffer(buffer);
    }
    throw new BadRequestException('thumbnail_fetch_failed');
  }

  private async fetchImage(url: string): Promise<Buffer | null> {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(THUMBNAIL_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const buffer = Buffer.from(await res.arrayBuffer());
      // YouTube answers a missing size with a 120×90 placeholder, not a 404.
      return buffer.byteLength > 2048 ? buffer : null;
    } catch (err) {
      this.logger.warn(`Thumbnail fetch failed for ${url}: ${String(err)}`);
      return null;
    }
  }

  private async getOrThrow(id: string) {
    const item = await this.prisma.mediaAppearance.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('media_appearance_not_found');
    return item;
  }

  private async nextSortOrder(): Promise<number> {
    const last = await this.prisma.mediaAppearance.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? 0) + 1;
  }
}
