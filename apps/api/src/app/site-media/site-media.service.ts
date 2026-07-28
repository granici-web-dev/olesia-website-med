import { BadRequestException, Injectable } from '@nestjs/common';
import { SITE_MEDIA_SLOTS, type SiteMediaDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { SetSiteMediaDto } from './dto/site-media.dto';

const SLOT_BY_KEY = new Map(SITE_MEDIA_SLOTS.map((s) => [s.key, s]));

@Injectable()
export class SiteMediaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every override that exists. Absent keys mean "still the committed asset". */
  async findAll(): Promise<SiteMediaDto[]> {
    const list = await this.prisma.siteMedia.findMany();
    return list.map((m) => ({
      key: m.key,
      url: m.url,
      width: m.width,
      height: m.height,
      fileName: m.fileName,
      updatedAt: m.updatedAt.toISOString(),
    }));
  }

  async set(key: string, dto: SetSiteMediaDto): Promise<SiteMediaDto> {
    // The slots are a fixed catalogue tied to the page layouts; an unknown key
    // would store a file nothing renders.
    if (!SLOT_BY_KEY.has(key)) {
      throw new BadRequestException('site_media_unknown_slot');
    }
    // Dimensions are recorded when the uploader knows them (the image pipeline
    // returns them anyway) but not required: every current consumer lays these
    // out with `fill` or as a video poster, neither of which needs them.
    const data = {
      url: dto.url,
      width: dto.width ?? null,
      height: dto.height ?? null,
      fileName: dto.fileName ?? null,
    };
    const saved = await this.prisma.siteMedia.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    });
    return {
      key: saved.key,
      url: saved.url,
      width: saved.width,
      height: saved.height,
      fileName: saved.fileName,
      updatedAt: saved.updatedAt.toISOString(),
    };
  }

  /** Drop the override, so the slot falls back to the committed asset. */
  async reset(key: string): Promise<void> {
    await this.prisma.siteMedia.deleteMany({ where: { key } });
  }
}
