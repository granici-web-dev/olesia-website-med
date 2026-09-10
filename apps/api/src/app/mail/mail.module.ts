import { Global, Module } from '@nestjs/common';

import { WorkingHoursModule } from '../working-hours/working-hours.module';
import { MailService } from './mail.service';
import { PatientNotificationsService } from './patient-notifications.service';

/**
 * Global so any module can inject the two senders without re-importing.
 * `WorkingHoursModule` is here because a message to a patient states a time,
 * and the only correct clock for that is the practice's own.
 */
@Global()
@Module({
  imports: [WorkingHoursModule],
  providers: [MailService, PatientNotificationsService],
  exports: [MailService, PatientNotificationsService],
})
export class MailModule {}
