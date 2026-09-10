import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '../../generated/prisma/enums';

/**
 * Retire subscriptions that have run out.
 *
 * Nothing ever did (audit A5, F10). `endsAt` was set at intake and then read
 * by nobody: a three-month package stayed `active` a year later, the back
 * office listed it under "Active", and the dashboard counted its quota as
 * outstanding. The date is the contract, so the row should follow it without
 * anyone remembering to press a button.
 *
 * The quota deliberately does *not* reset on any boundary — see
 * `Subscription.videoQuotaTotal`. It is an allowance for the whole period, and
 * this is what ends the period.
 */
@Injectable()
export class SubscriptionsExpiryService {
  private readonly logger = new Logger(SubscriptionsExpiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Once a day, well after midnight in the practice's own zone: an expiry the
   * doctor reads about at 03:30 is yesterday's, which is the answer she would
   * give herself. The zone is named rather than left to the container's clock,
   * which is UTC.
   */
  @Cron('30 3 * * *', { timeZone: 'Europe/Chisinau' })
  async expire(): Promise<void> {
    try {
      // Idempotent by construction: the second run of the day matches nothing,
      // because `status` is part of the condition and the first run changed it.
      const { count } = await this.prisma.subscription.updateMany({
        where: {
          status: SubscriptionStatus.active,
          endsAt: { lt: new Date() },
        },
        data: { status: SubscriptionStatus.expired },
      });
      if (count > 0) this.logger.log(`Expired ${count} subscription(s).`);
    } catch (e) {
      this.logger.error(`Subscription expiry sweep failed: ${String(e)}`);
    }
  }
}
