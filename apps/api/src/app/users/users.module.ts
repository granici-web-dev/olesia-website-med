import { Module } from '@nestjs/common';

import { TotpModule } from '../auth/totp.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TotpModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
