import {
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator';
import { AppointmentsService } from './appointments.service';
import { CalendlyService, type CalendlyWebhookBody } from './calendly.service';

/**
 * Calendly webhook sink (module_calendly.md §8.4). Public route, but every
 * request is authenticated by HMAC signature over the raw body. We ack fast
 * (200) and keep processing light — heavy work is deferred to later phases.
 *
 * The limit is well above anything Calendly sends (bookings arrive in ones,
 * not hundreds a minute) and exists because this is an unauthenticated route
 * that hashes whatever body it is handed.
 */
@Throttle({ default: { ttl: 60_000, limit: 60 } })
@Controller('webhooks/calendly')
export class CalendlyWebhookController {
  private readonly logger = new Logger(CalendlyWebhookController.name);

  constructor(
    private readonly appointments: AppointmentsService,
    private readonly calendly: CalendlyService,
  ) {}

  @Public()
  @Post()
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('calendly-webhook-signature') signature?: string,
  ): Promise<{ received: true }> {
    if (!this.calendly.verifySignature(req.rawBody, signature)) {
      // Shape only, never content: the body of a rejected delivery is not ours
      // to trust or to write down. What this line answers is "is the signing
      // key wrong" versus "is someone poking at the endpoint".
      this.logger.warn(
        `Calendly webhook rejected: signature ${signature ? 'present' : 'absent'}, body ${req.rawBody?.length ?? 0} bytes.`,
      );
      throw new UnauthorizedException('invalid_signature');
    }

    let body: CalendlyWebhookBody;
    try {
      body = JSON.parse(req.rawBody!.toString('utf8')) as CalendlyWebhookBody;
    } catch {
      throw new UnauthorizedException('invalid_payload');
    }

    await this.appointments.ingestCalendlyEvent(body);
    return { received: true };
  }
}
