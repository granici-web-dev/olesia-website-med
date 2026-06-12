import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { CalendlyWebhookController } from './calendly-webhook.controller';
import { CalendlyService } from './calendly.service';

@Module({
  imports: [StorageModule],
  controllers: [AppointmentsController, CalendlyWebhookController],
  providers: [AppointmentsService, CalendlyService],
})
export class AppointmentsModule {}
