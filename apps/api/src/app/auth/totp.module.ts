import { Module } from '@nestjs/common';

import { TotpService } from './totp.service';

/**
 * Two-factor authentication on its own, because both `auth` (enrolment, login)
 * and `users` (an admin clearing a lost second factor) need it, and AuthModule
 * already imports UsersModule.
 */
@Module({
  providers: [TotpService],
  exports: [TotpService],
})
export class TotpModule {}
