import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MaibService } from './maib.service';
import { PaymentsService } from './payments.service';

/**
 * Safety net for payments left in a non-terminal state.
 *
 * The callback is an optimisation, not the source of truth: maib only promises
 * one after a *successful* payment, and callbacks get lost. Anything still open
 * past the 25-minute session lifetime gets re-asked from the bank.
 */
@Injectable()
export class PaymentsReconcileService {
  private readonly logger = new Logger(PaymentsReconcileService.name);

  constructor(
    private readonly payments: PaymentsService,
    private readonly maib: MaibService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async sweep(): Promise<void> {
    if (!this.maib.isConfigured()) return;
    try {
      const n = await this.payments.reconcileStale();
      if (n) this.logger.log(`Reconciled ${n} stale payment(s).`);
    } catch (e) {
      this.logger.error(`Payment reconcile sweep failed: ${String(e)}`);
    }
  }
}
