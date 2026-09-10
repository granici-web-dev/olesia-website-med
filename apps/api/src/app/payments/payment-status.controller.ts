import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator';
import { PaymentsService } from './payments.service';

/**
 * Payment status for the return page, by our own order reference.
 *
 * Its own controller, and its own path, so it cannot be shadowed by
 * `GET /payments/:id` depending on controller registration order. It was also
 * split off because a `@Public()` route inside a `@Roles`-decorated controller
 * used to answer 403; RolesGuard reads `@Public()` first since audit A5 (F14),
 * so that reason no longer holds and the routing one still does.
 *
 * Returns no PII — the redirect that lands the payer here carries
 * user-controllable query parameters, so the page must ask us, not believe them.
 */
@ApiTags('payments')
// Each hit can cost an outbound call to the bank, so this sits far below
// the global ceiling: a return page polls a handful of times, an enumeration
// loop does not.
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Controller('payment-status')
export class PaymentStatusController {
  constructor(private readonly payments: PaymentsService) {}

  @Public()
  @Get(':orderId')
  status(@Param('orderId') orderId: string) {
    return this.payments.publicStatus(orderId);
  }
}
