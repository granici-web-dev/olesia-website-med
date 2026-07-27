import { Injectable } from '@nestjs/common';
import type { AboutPageDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { toAboutDto } from './about.mapper';
import { UpdateAboutDto } from './dto/update-about.dto';

/** The About page is a singleton: at most one row, created on first access. */
@Injectable()
export class AboutService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<AboutPageDto> {
    return toAboutDto(await this.getOrCreate());
  }

  async update(dto: UpdateAboutDto): Promise<AboutPageDto> {
    const record = await this.getOrCreate();
    return toAboutDto(
      await this.prisma.aboutPage.update({
        where: { id: record.id },
        data: {
          titleRo: dto.titleRo,
          titleEn: dto.titleEn,
          titleRu: dto.titleRu,
          contentRo: dto.contentRo,
          contentEn: dto.contentEn,
          contentRu: dto.contentRu,
          images: dto.images,
          stats: dto.stats,
          credentials: dto.credentials,
          testimonials: dto.testimonials,
          faq: dto.faq,
        },
      }),
    );
  }

  private async getOrCreate() {
    const existing = await this.prisma.aboutPage.findFirst();
    if (existing) return existing;
    return this.prisma.aboutPage.create({
      data: {
        titleRo: '',
        titleEn: '',
        contentRo: '',
        contentEn: '',
        images: [],
      },
    });
  }
}
