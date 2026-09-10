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
import { MaibService, type MaibCallbackBody } from './maib.service';
import { PaymentsService } from './payments.service';

/**
 * maib back-channel callback sink. Public route, authenticated by HMAC over
 * the raw body — see MaibService for why the message layout differs from the
 * Calendly webhook next door.
 *
 * The URL must be sent explicitly on every checkout: with no `callbackUrl`,
 * maib silently sends nothing at all.
 */
@Controller('payments/maib')
export class MaibWebhookController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly maib: MaibService,
  ) {}

  @Public()
  @Post('callback')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature?: string,
    @Headers('x-signature-timestamp') timestamp?: string,
  ): Promise<{ received: true }> {
    if (!this.maib.verifySignature(req.rawBody, signature, timestamp)) {
      throw new UnauthorizedException('invalid_signature');
    }

    let body: MaibCallbackBody;
    try {
      body = JSON.parse(req.rawBody!.toString('utf8')) as MaibCallbackBody;
    } catch {
      throw new UnauthorizedException('invalid_payload');
    }

    await this.payments.applyCallback(body);
    return { received: true };
  }
}
