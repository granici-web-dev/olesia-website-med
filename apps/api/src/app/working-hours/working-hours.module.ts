import { Global, Module } from '@nestjs/common';

import { WorkingHoursService } from './working-hours.service';
import { WorkingHoursController } from './working-hours.controller';

/** Global: the leads module needs the EXPRESS deadline at intake time. */
@Global()
@Module({
  controllers: [WorkingHoursController],
  providers: [WorkingHoursService],
  exports: [WorkingHoursService],
})
export class WorkingHoursModule {}
