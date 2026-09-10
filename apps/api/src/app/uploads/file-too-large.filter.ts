import {
  type ArgumentsHost,
  BadRequestException,
  Catch,
  type ExceptionFilter,
  PayloadTooLargeException,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * Multer aborts an oversized upload inside the interceptor chain, before the
 * handler runs, and Nest renders that as `413 File too large` — English prose,
 * where the public upload page keys its three languages off the API's machine
 * codes. Answer with the same `file_too_large` the storage service throws when
 * a file gets past the parser, so the patient reads one wording either way.
 *
 * The only `@Catch` filter in the API (`PRINCIPLES.md` records that there were
 * none): the route cannot map an exception raised before it is entered.
 */
@Catch(PayloadTooLargeException)
export class FileTooLargeFilter implements ExceptionFilter {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost): void {
    const body = new BadRequestException('file_too_large').getResponse();
    host.switchToHttp().getResponse<Response>().status(400).json(body);
  }
}
