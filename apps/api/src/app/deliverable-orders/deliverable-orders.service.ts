import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { DeliverableOrderDto, Paginated } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import { StorageService } from '../storage/storage.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { DeliverableOrderStatus } from '../../generated/prisma/enums';
import { toDeliverableOrderDto } from './deliverable-orders.mapper';
import { UpdateDeliverableOrderDto } from './dto/update-deliverable-order.dto';

/**
 * Back-office view of the group-C orders ("Comenzi"). Rows are created by the
 * public `LeadsService`; here the doctor lists them, moves them along, records
 * a manual payment, and deletes the ones that came to nothing.
 */
@Injectable()
export class DeliverableOrdersService {
  private readonly logger = new Logger(DeliverableOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<Paginated<DeliverableOrderDto>> {
    const [items, total] = await Promise.all([
      this.prisma.deliverableOrder.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.deliverableOrder.count(),
    ]);
    return paginate(items.map(toDeliverableOrderDto), total, query);
  }

  /**
   * Patch the workflow state. `deliveredAt` is stamped the first time an order
   * is marked delivered and cleared if it is moved back — the date has to mean
   * "this is when the client got it", not "when the row was last touched".
   *
   * Payment is not here any more: it mirrors the `Payment` ledger, and money
   * that arrived outside the bank is `POST /payments/manual` (audit A5, F3).
   */
  async update(
    id: string,
    dto: UpdateDeliverableOrderDto,
  ): Promise<DeliverableOrderDto> {
    const existing = await this.getOrThrow(id);

    const data: {
      status?: DeliverableOrderStatus;
      deliveredAt?: Date | null;
    } = {};

    if (dto.status && dto.status !== existing.status) {
      data.status = dto.status;
      if (dto.status === DeliverableOrderStatus.delivered) {
        if (!existing.deliveredAt) data.deliveredAt = new Date();
      } else {
        data.deliveredAt = null;
      }
    }

    if (Object.keys(data).length === 0) {
      return toDeliverableOrderDto(existing);
    }

    return toDeliverableOrderDto(
      await writeOrTranslate(() =>
        this.prisma.deliverableOrder.update({ where: { id }, data }),
      ),
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.getOrThrow(id);

    // The order's upload link and its documents go with it (schema cascade),
    // so collect the medical files first: once the rows are gone nothing points
    // at the bytes, and special-category data nobody can find is data nobody
    // can delete.
    const documents = await this.prisma.uploadedDocument.findMany({
      where: { link: { orderId: id } },
      select: { fileKey: true },
    });

    await writeOrTranslate(() =>
      this.prisma.deliverableOrder.delete({ where: { id } }),
    );

    await Promise.all(
      documents.map((d) => this.storage.deletePrivateDocument(d.fileKey)),
    );

    // Identifiers only, same shape as the patients module's audit line: this
    // destroys medical documents, and a data-protection question about them
    // cannot be answered from a log that never recorded the deletion
    // (audit A5, F11).
    this.logger.log(
      `audit order.delete orderId=${id} documents=${documents.length} userId=${userId}`,
    );
  }

  private async getOrThrow(id: string) {
    const order = await this.prisma.deliverableOrder.findUnique({
      where: { id },
    });
    if (!order) throw new NotFoundException('deliverable_order_not_found');
    return order;
  }
}
