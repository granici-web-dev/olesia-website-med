import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { DeliverableOrdersService } from './deliverable-orders.service';
import { DeliverableOrdersController } from './deliverable-orders.controller';

@Module({
  imports: [StorageModule],
  controllers: [DeliverableOrdersController],
  providers: [DeliverableOrdersService],
})
export class DeliverableOrdersModule {}
