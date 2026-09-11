import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { MaterialsService } from './materials.service';
import { MaterialGrantsService } from './material-grants.service';
import { MaterialsController } from './materials.controller';

@Module({
  imports: [StorageModule],
  controllers: [MaterialsController],
  providers: [MaterialsService, MaterialGrantsService],
  // Exported for `payments`: paying for a material is what mints its grant.
  exports: [MaterialGrantsService],
})
export class MaterialsModule {}
