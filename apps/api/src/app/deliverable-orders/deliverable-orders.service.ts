import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { deliverableEntry } from '@olesia/shared';
import type { DeliverableOrderDto, Paginated } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import { StorageService } from '../storage/storage.service';
import { paginate } from '../common/dto/pagination.dto';
import {
  DeliverableOrderStatus,
  Locale,
  PaymentStatus,
} from '../../generated/prisma/enums';
import { toDeliverableOrderDto } from './deliverable-orders.mapper';
import { CreateDeliverableOrderDto } from './dto/create-deliverable-order.dto';
import { UpdateDeliverableOrderDto } from './dto/update-deliverable-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';

/**
 * What paying for a group-C order changes about it, or `null` when nothing
 * should change.
 *
 * The twin of `activateTicketData`, and pure for the same reason: maib may
 * deliver the same success notification more than once and the reconcile sweep
 * writes the same transition from the other side, so an unconditional write
 * would walk a delivered order back to the start of the doctor's queue. Only
 * an order that is still `awaiting_payment` moves.
 */
export function activateOrderData(
  current: DeliverableOrderStatus,
): { status: DeliverableOrderStatus } | null {
  return current === DeliverableOrderStatus.awaiting_payment
    ? { status: DeliverableOrderStatus.new }
    : null;
}

/**
 * Back-office view of the group-C orders ("Comenzi"). Rows are created by the
 * public checkout; here the doctor lists them, moves them along, records a
 * manual payment, and deletes the ones that came to nothing.
 */
@Injectable()
export class DeliverableOrdersService {
  private readonly logger = new Logger(DeliverableOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * The doctor's list. Unpaid orders are excluded unless she asks for them by
   * name, the same arrangement the EXPRESS tickets have: `awaiting_payment`
   * means somebody filled in the form and never paid, and mixing those into
   * the working list would make "Comenzi" read as more work than it is.
   */
  async findAll(
    query: ListOrdersQueryDto,
  ): Promise<Paginated<DeliverableOrderDto>> {
    const where = query.status
      ? { status: query.status }
      : { status: { not: DeliverableOrderStatus.awaiting_payment } };

    const [items, total] = await Promise.all([
      this.prisma.deliverableOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.deliverableOrder.count({ where }),
    ]);
    return paginate(items.map(toDeliverableOrderDto), total, query);
  }

  /**
   * Record an order the doctor took herself, by phone or in a message.
   *
   * It starts where a paid one does, `new` and `pending`, rather than in
   * `awaiting_payment`: nobody is going to pay for it in a browser, so a state
   * that means "waiting for the bank" would keep it off the doctor's own list
   * forever. Money arrives through the manual-payment panel, which writes the
   * ledger row the `paymentStatus` mirrors.
   *
   * The title and the price are stamped from the catalog, never taken from the
   * request, for the same reason the public checkout does it: the back office
   * has to show what was sold, not what somebody typed.
   */
  async create(dto: CreateDeliverableOrderDto): Promise<DeliverableOrderDto> {
    const entry = deliverableEntry(dto.product);
    if (!entry) throw new BadRequestException('unknown_deliverable_product');

    return toDeliverableOrderDto(
      await writeOrTranslate(() =>
        this.prisma.deliverableOrder.create({
          data: {
            product: dto.product,
            titleRo: entry.titleRo,
            priceEur: entry.priceEur,
            clientName: dto.clientName,
            clientEmail: dto.clientEmail,
            phone: dto.phone ?? null,
            notes: dto.notes ?? null,
            locale: dto.locale ?? Locale.ro,
            status: DeliverableOrderStatus.new,
            paymentStatus: PaymentStatus.pending,
          },
        }),
      ),
    );
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
