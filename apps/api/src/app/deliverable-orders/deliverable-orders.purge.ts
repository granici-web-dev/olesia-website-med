import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import {
  DeliverableOrderStatus,
  PaymentState,
} from '../../generated/prisma/enums';

/**
 * How long an unpaid group-C order is kept.
 *
 * Form-first means the order's details — what the menu has to work around, the
 * child's age, the allergies — are written before anyone pays, so abandoning
 * the checkout leaves personal data in the database that nobody bought. Seven
 * days, the same number and the same reasoning as the unpaid EXPRESS ticket
 * (docs/shape-express-checkout.md, decision 2), which is why /gdpr states one
 * period rather than two.
 */
const UNPAID_RETENTION_DAYS = 7;

/** States after which no more money will arrive on its own. */
const TERMINAL_STATES: PaymentState[] = [
  PaymentState.failed,
  PaymentState.expired,
  PaymentState.abandoned,
  PaymentState.cancelled,
];

@Injectable()
export class DeliverableOrdersPurgeService {
  private readonly logger = new Logger(DeliverableOrdersPurgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeUnpaid(): Promise<void> {
    const cutoff = new Date(
      Date.now() - UNPAID_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );

    const abandoned = await this.prisma.deliverableOrder.findMany({
      where: {
        status: DeliverableOrderStatus.awaiting_payment,
        createdAt: { lt: cutoff },
      },
      select: { id: true },
    });
    if (abandoned.length === 0) return;

    // An order with a payment still in flight — `created`, `pending` — is left
    // alone however old it is: the reconcile sweep may yet complete it, and
    // deleting something somebody has paid for is the one outcome worse than
    // keeping something they have not.
    const ids = abandoned.map((o) => o.id);
    const stillOpen = await this.prisma.payment.findMany({
      where: {
        targetType: 'deliverable_order',
        targetId: { in: ids },
        state: { notIn: TERMINAL_STATES },
      },
      select: { targetId: true },
    });
    const keep = new Set(stillOpen.map((p) => p.targetId));
    const deletable = ids.filter((id) => !keep.has(id));
    if (deletable.length === 0) return;

    // The payments stay, as they do for a ticket: they are the accounting
    // trail of sessions opened and never completed. An unpaid order has no
    // upload link and therefore no documents — the link is issued when the
    // money lands — so there are no bytes to collect first.
    const { count } = await this.prisma.deliverableOrder.deleteMany({
      where: { id: { in: deletable } },
    });
    this.logger.log(
      `Purged ${count} unpaid order(s) older than ${UNPAID_RETENTION_DAYS} days.`,
    );
  }
}
