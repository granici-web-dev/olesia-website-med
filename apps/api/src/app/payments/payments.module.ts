import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { MaibService } from './maib.service';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MaibWebhookController } from './maib-webhook.controller';
import { PaymentStatusController } from './payment-status.controller';
import { PaymentsReconcileService } from './payments-reconcile.service';

/**
 * Online payments via maib e-Commerce Checkout.
 * See docs/payments-maib-checkout.md before changing anything in here.
 */
@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController, MaibWebhookController, PaymentStatusController],
  providers: [MaibService, PaymentsService, PaymentsReconcileService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
