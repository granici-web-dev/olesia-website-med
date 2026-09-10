import { Module } from '@nestjs/common';

import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsExpiryService } from './subscriptions-expiry.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsExpiryService],
})
export class SubscriptionsModule {}
