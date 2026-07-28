import { Injectable, NotFoundException } from '@nestjs/common';
import type { TestimonialDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { toTestimonialDto } from './testimonials.mapper';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public homepage: published reviews only. */
  async findPublished(): Promise<TestimonialDto[]> {
    const list = await this.prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toTestimonialDto);
  }

  /** Back office: everything, including what is currently hidden. */
  async findAll(): Promise<TestimonialDto[]> {
    const list = await this.prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toTestimonialDto);
  }

  async create(dto: CreateTestimonialDto): Promise<TestimonialDto> {
    const created = await this.prisma.testimonial.create({
      data: {
        quoteRo: dto.quoteRo,
        quoteEn: dto.quoteEn,
        quoteRu: dto.quoteRu ?? null,
        author: dto.author ?? null,
        roleRo: dto.roleRo ?? null,
        roleEn: dto.roleEn ?? null,
        roleRu: dto.roleRu ?? null,
        source: dto.source ?? null,
        sortOrder: dto.sortOrder ?? (await this.nextSortOrder()),
        active: dto.active ?? true,
      },
    });
    return toTestimonialDto(created);
  }

  async update(
    id: string,
    dto: UpdateTestimonialDto,
  ): Promise<TestimonialDto> {
    await this.getOrThrow(id);
    return toTestimonialDto(
      await this.prisma.testimonial.update({ where: { id }, data: dto }),
    );
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.prisma.testimonial.delete({ where: { id } });
  }

  private async getOrThrow(id: string) {
    const testimonial = await this.prisma.testimonial.findUnique({
      where: { id },
    });
    if (!testimonial) throw new NotFoundException('testimonial_not_found');
    return testimonial;
  }

  private async nextSortOrder(): Promise<number> {
    const last = await this.prisma.testimonial.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? 0) + 1;
  }
}
