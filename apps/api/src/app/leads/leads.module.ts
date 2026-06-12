import { Module } from '@nestjs/common';

import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

/** PrismaService and MailService are global — no imports needed. */
@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
