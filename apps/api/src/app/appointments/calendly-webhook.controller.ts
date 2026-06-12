import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { AppointmentsService } from './appointments.service';
import { CalendlyService, type CalendlyWebhookBody } from './calendly.service';

/**
 * Calendly webhook sink (module_calendly.md §8.4). Public route, but every
 * request is authenticated by HMAC signature over the raw body. We ack fast
 * (200) and keep processing light — heavy work is deferred to later phases.
 */
@Controller('webhooks/calendly')
export class CalendlyWebhookController {
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
