import { Module } from '@nestjs/common';

import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

/** PrismaService is global — no imports needed. */
@Module({
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
