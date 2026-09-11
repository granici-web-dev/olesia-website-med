import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';
import { MaterialsModule } from '../materials/materials.module';
import { MaibService } from './maib.service';
import { PaymentsService } from './payments.service';
import { FulfilmentService } from './fulfilment.service';
import { PaymentsController } from './payments.controller';
import { MaibWebhookController } from './maib-webhook.controller';
import { PaymentStatusController } from './payment-status.controller';
import { PaymentsReconcileService } from './payments-reconcile.service';

/**
 * Online payments via maib e-Commerce Checkout.
 * See docs/payments-maib-checkout.md before changing anything in here.
 *
 * `UploadsModule` and `MaterialsModule` are imported for fulfilment: paying
 * for a group-C order issues its upload link and paying for a material mints
 * its download grant. Both directions are one-way — neither module knows about
 * payments — so there is no cycle, and `leads → payments → {uploads, materials}`
 * is the whole graph.
 */
@Module({
  imports: [PrismaModule, UploadsModule, MaterialsModule],
  controllers: [
    PaymentsController,
    MaibWebhookController,
    PaymentStatusController,
  ],
  providers: [
    MaibService,
    PaymentsService,
    FulfilmentService,
    PaymentsReconcileService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
