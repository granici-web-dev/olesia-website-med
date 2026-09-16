import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  DeliverableCatalogDto,
  PublicDeliverableCatalogDto,
} from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import type { DeliverableProduct } from '../../generated/prisma/enums';
import type { DeliverableCatalog } from '../../generated/prisma/client';
import {
  toDeliverableCatalogDto,
  toPublicDeliverableCatalogDto,
} from './deliverables.mapper';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';

@Injectable()
export class DeliverablesService {
  constructor(private readonly prisma: PrismaService) {}

  /** The public catalog: what is on sale today, and nothing else. */
  async findPublished(): Promise<PublicDeliverableCatalogDto[]> {
    const list = await this.prisma.deliverableCatalog.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toPublicDeliverableCatalogDto);
  }

  /** Back office: all five, including what is currently withdrawn. */
  async findAll(): Promise<DeliverableCatalogDto[]> {
    const list = await this.prisma.deliverableCatalog.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toDeliverableCatalogDto);
  }

  async update(
    code: DeliverableProduct,
    dto: UpdateDeliverableDto,
  ): Promise<DeliverableCatalogDto> {
    await this.getOrThrow(code);
    const product = await writeOrTranslate(() =>
      this.prisma.deliverableCatalog.update({ where: { code }, data: dto }),
    );
    return toDeliverableCatalogDto(product);
  }

  /**
   * The row a checkout is about to stamp onto an order, whatever its state.
   *
   * Deliberately does not filter on `active`: whether a withdrawn product can
   * still be sold is `deliverablePrice`'s decision, and it answers with the
   * machine code the caller turns into a refusal. A missing row is a different
   * thing and stays a 404 here — it means the seed has not run.
   */
  async getOrThrow(code: DeliverableProduct): Promise<DeliverableCatalog> {
    const product = await this.prisma.deliverableCatalog.findUnique({
      where: { code },
    });
    if (!product) throw new NotFoundException('deliverable_not_found');
    return product;
  }
}
