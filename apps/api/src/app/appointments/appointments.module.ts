import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { CalendlyWebhookController } from './calendly-webhook.controller';
import { CalendlyService } from './calendly.service';
import { CalendlySyncService } from './calendly-sync.service';
import { PrepService } from './prep.service';

@Module({
  imports: [StorageModule],
  controllers: [AppointmentsController, CalendlyWebhookController],
  providers: [
    AppointmentsService,
    CalendlyService,
    CalendlySyncService,
    PrepService,
  ],
})
export class AppointmentsModule {}
