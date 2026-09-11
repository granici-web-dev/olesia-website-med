import { Module } from '@nestjs/common';

import { PaymentsModule } from '../payments/payments.module';
import { LeadsController } from './leads.controller';
import { CheckoutController } from './checkout.controller';
import { LeadsService } from './leads.service';

/**
 * PrismaService, MailService and WorkingHoursService are global — no imports
 * needed. `PaymentsModule` is: the EXPRESS checkout opens a bank session, and
 * this direction is the one that has no cycle in it. `payments` importing
 * `leads` would, and it would also mean two front doors with two sets of
 * captcha, honeypot and rate-limit rules.
 */
@Module({
  imports: [PaymentsModule],
  controllers: [LeadsController, CheckoutController],
  providers: [LeadsService],
})
export class LeadsModule {}
