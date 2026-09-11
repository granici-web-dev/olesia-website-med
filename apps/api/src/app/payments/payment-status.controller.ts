import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator';
import { PaymentsService } from './payments.service';
import { FulfilmentService } from './fulfilment.service';
import { ClaimNextStepDto } from './dto/claim-next-step.dto';

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
  constructor(
    private readonly payments: PaymentsService,
    private readonly fulfilment: FulfilmentService,
  ) {}

  /**
   * What the buyer can do now: the upload link for a group-C order, the
   * download for a paid material.
   *
   * A POST rather than a GET, and declared before `:orderId` so it cannot be
   * read as one: it carries the intent key, and a key in a path is a key in
   * every access log and every shared proxy's cache key. `no-store` for the
   * same reason the body is: what comes back is a capability.
   */
  @Public()
  @Post('next-step')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  nextStep(@Body() dto: ClaimNextStepDto) {
    return this.fulfilment.claimNextStep(dto.orderId, dto.intentKey);
  }

  @Public()
  @Get(':orderId')
  status(@Param('orderId') orderId: string) {
    return this.payments.publicStatus(orderId);
  }
}
