import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { SiteMediaService } from './site-media.service';
import { SiteMediaController } from './site-media.controller';

@Module({
  imports: [StorageModule],
  controllers: [SiteMediaController],
  providers: [SiteMediaService],
})
export class SiteMediaModule {}
