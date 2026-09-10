import { Injectable } from '@nestjs/common';
import type { AboutPageDto } from '@olesia/shared';

import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import { toAboutDto } from './about.mapper';
import { UpdateAboutDto } from './dto/update-about.dto';

/**
 * The About page is a singleton: exactly one row, under the fixed primary key
 * below, created on first access.
 *
 * `findFirst`-then-`create` was the earlier shape and it raced itself (audit
 * A5, F4) — two concurrent anonymous GETs both found nothing and both
 * inserted. An upsert on a constant id makes the second one a no-op, and the
 * primary key is what enforces it rather than a convention.
 */
const SINGLETON_ID = 'singleton';

@Injectable()
export class AboutService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<AboutPageDto> {
    return toAboutDto(await this.getOrCreate());
  }

  async update(dto: UpdateAboutDto): Promise<AboutPageDto> {
    await this.getOrCreate();
    return toAboutDto(
      await writeOrTranslate(() =>
        this.prisma.aboutPage.update({
          where: { id: SINGLETON_ID },
          data: {
            titleRo: dto.titleRo,
            titleEn: dto.titleEn,
            titleRu: dto.titleRu,
            contentRo: dto.contentRo,
            contentEn: dto.contentEn,
            contentRu: dto.contentRu,
            images: dto.images,
            // Prisma types a Json column as InputJsonValue, which a DTO class
            // array does not structurally satisfy (no index signature). The
            // shape is validated by class-validator on the way in.
            stats: dto.stats as Prisma.InputJsonValue | undefined,
            credentials: dto.credentials as Prisma.InputJsonValue | undefined,
          },
        }),
      ),
    );
  }

  private async getOrCreate() {
    // Read before upserting, because an upsert always issues the UPDATE leg
    // and `updatedAt` is `@updatedAt`: upserting on every read would stamp the
    // page as edited each time an anonymous visitor loaded it. The upsert is
    // only for the one request that finds the row missing, and it is there so
    // a second such request inserts nothing.
    const existing = await this.prisma.aboutPage.findUnique({
      where: { id: SINGLETON_ID },
    });
    if (existing) return existing;

    return this.prisma.aboutPage.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: {
        id: SINGLETON_ID,
        titleRo: '',
        titleEn: '',
        contentRo: '',
        contentEn: '',
        images: [],
      },
    });
  }
}
