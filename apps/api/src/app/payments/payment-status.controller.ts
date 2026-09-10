import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator';
import { PaymentsService } from './payments.service';

/**
 * Payment status for the return page, by our own order reference.
 *
 * Deliberately a separate controller rather than a `@Public()` route on
 * PaymentsController: RolesGuard reads class-level `@Roles` metadata and does
 * not consult `@Public()`, so a public route inside a guarded controller is a
 * 403. Its own path also keeps it away from `GET /payments/:id`, which would
 * otherwise shadow it depending on controller registration order.
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
