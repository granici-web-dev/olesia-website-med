import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { DeliverablesModule } from '../deliverables/deliverables.module';
import { DeliverableOrdersService } from './deliverable-orders.service';
import { DeliverableOrdersPurgeService } from './deliverable-orders.purge';
import { DeliverableOrdersController } from './deliverable-orders.controller';

@Module({
  imports: [StorageModule, DeliverablesModule],
  controllers: [DeliverableOrdersController],
  providers: [DeliverableOrdersService, DeliverableOrdersPurgeService],
})
export class DeliverableOrdersModule {}
