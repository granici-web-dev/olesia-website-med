import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { MediaAppearancesService } from './media-appearances.service';
import { MediaAppearancesController } from './media-appearances.controller';

@Module({
  imports: [StorageModule],
  controllers: [MediaAppearancesController],
  providers: [MediaAppearancesService],
})
export class MediaAppearancesModule {}
