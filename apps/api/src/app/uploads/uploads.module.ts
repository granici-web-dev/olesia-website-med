import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { UploadsService } from './uploads.service';
import {
  UploadLinksController,
  UploadsPublicController,
} from './uploads.controller';

@Module({
  // MailModule is @Global — no import needed.
  imports: [StorageModule],
  controllers: [UploadsPublicController, UploadLinksController],
  providers: [UploadsService],
  // Exported for `payments`: paying for a group-C order is what issues the
  // link the buyer sends their documents through.
  exports: [UploadsService],
})
export class UploadsModule {}
