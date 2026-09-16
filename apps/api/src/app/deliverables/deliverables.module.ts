import { Module } from '@nestjs/common';

import { DeliverablesController } from './deliverables.controller';
import { DeliverablesService } from './deliverables.service';

/**
 * Exported because both checkouts stamp a price from it: the public one in
 * `LeadsService` and the phone order in `DeliverableOrdersService`.
 */
@Module({
  controllers: [DeliverablesController],
  providers: [DeliverablesService],
  exports: [DeliverablesService],
})
export class DeliverablesModule {}
