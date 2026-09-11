import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import {
  PaymentState,
  QuickQuestionStatus,
} from '../../generated/prisma/enums';

/**
 * How long an unpaid EXPRESS ticket is kept.
 *
 * Form-first means the question text is written before anyone pays, so
 * abandoning the checkout leaves a medical question in the database that
 * nobody bought and nobody will read. Seven days is long enough for somebody
 * who lost their card to come back and short enough that this is not a store
 * of unpaid medical text. An operational choice, not a statutory one
 * (docs/shape-express-checkout.md, decision 2), which is why /gdpr states it.
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
export class QuickQuestionsPurgeService {
  private readonly logger = new Logger(QuickQuestionsPurgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeUnpaid(): Promise<void> {
    const cutoff = new Date(
      Date.now() - UNPAID_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );

    // Every condition here is about being sure no money is coming. A ticket
    // with a payment still in flight — `created`, `pending` — is left alone
    // however old it is: the bank's reconcile sweep may yet complete it, and
    // deleting a question somebody has paid for is the one outcome worse than
    // keeping one they have not.
    const abandoned = await this.prisma.quickQuestion.findMany({
      where: {
        status: QuickQuestionStatus.awaiting_payment,
        createdAt: { lt: cutoff },
      },
      select: { id: true },
    });
    if (abandoned.length === 0) return;

    const ids = abandoned.map((t) => t.id);
    const stillOpen = await this.prisma.payment.findMany({
      where: {
        targetType: 'quick_question',
        targetId: { in: ids },
        state: { notIn: TERMINAL_STATES },
      },
      select: { targetId: true },
    });
    const keep = new Set(stillOpen.map((p) => p.targetId));
    const deletable = ids.filter((id) => !keep.has(id));
    if (deletable.length === 0) return;

    // The payments stay. They are the accounting trail of sessions that were
    // opened and never completed, and `targetId` pointing at a deleted ticket
    // is what a failed purchase looks like.
    const { count } = await this.prisma.quickQuestion.deleteMany({
      where: { id: { in: deletable } },
    });
    this.logger.log(
      `Purged ${count} unpaid EXPRESS ticket(s) older than ${UNPAID_RETENTION_DAYS} days.`,
    );
  }
}
