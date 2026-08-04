import { Module } from '@nestjs/common';

import { DeliverableOrdersService } from './deliverable-orders.service';
import { DeliverableOrdersController } from './deliverable-orders.controller';

@Module({
  controllers: [DeliverableOrdersController],
  providers: [DeliverableOrdersService],
})
export class DeliverableOrdersModule {}
