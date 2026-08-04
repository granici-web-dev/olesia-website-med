import { Injectable, NotFoundException } from '@nestjs/common';
import type { DeliverableOrderDto, Paginated } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import {
  DeliverableOrderStatus,
  PaymentStatus,
} from '../../generated/prisma/enums';
import { toDeliverableOrderDto } from './deliverable-orders.mapper';
import { UpdateDeliverableOrderDto } from './dto/update-deliverable-order.dto';

/**
 * Back-office view of the group-C orders ("Comenzi"). Rows are created by the
 * public `LeadsService`; here the doctor lists them, moves them along, records
 * a manual payment, and deletes the ones that came to nothing.
 */
@Injectable()
export class DeliverableOrdersService {
  constructor(private readonly prisma: PrismaService) {}

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
   * Patch the workflow and payment state. `deliveredAt` is stamped the first
   * time an order is marked delivered and cleared if it is moved back — the
   * date has to mean "this is when the client got it", not "when the row was
   * last touched".
   */
  async update(
    id: string,
    dto: UpdateDeliverableOrderDto,
  ): Promise<DeliverableOrderDto> {
    const existing = await this.getOrThrow(id);

    const data: {
      status?: DeliverableOrderStatus;
      paymentStatus?: PaymentStatus;
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

    if (dto.paymentStatus && dto.paymentStatus !== existing.paymentStatus) {
      data.paymentStatus = dto.paymentStatus;
    }

    if (Object.keys(data).length === 0) {
      return toDeliverableOrderDto(existing);
    }

    return toDeliverableOrderDto(
      await this.prisma.deliverableOrder.update({ where: { id }, data }),
    );
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.prisma.deliverableOrder.delete({ where: { id } });
  }

  private async getOrThrow(id: string) {
    const order = await this.prisma.deliverableOrder.findUnique({
      where: { id },
    });
    if (!order) throw new NotFoundException('deliverable_order_not_found');
    return order;
  }
}
