import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Res,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import {
  PATIENT_UPLOAD_MAX_BYTES,
  type UploadedImage,
} from '../storage/storage.service';
import { uploadLimits } from '../storage/upload-limits';
import { FileTooLargeFilter } from './file-too-large.filter';
import { UploadsService } from './uploads.service';

/**
 * The patient-facing half of §11.14. Unauthenticated by design: there are no
 * patient accounts, and the token in the URL is the whole credential.
 *
 * Rate limited harder than the rest of the public API. Nobody legitimately
 * touches this more than a handful of times in a minute, and the endpoints
 * both write files and confirm whether a token is real.
 *
 * Every answer is `no-store`: the token sits in the path, so the cache key of
 * any shared proxy in front of us would be the credential itself, and the body
 * behind it is a list of somebody's medical files.
 */
@ApiTags('uploads')
@Throttle({ default: { ttl: 60_000, limit: 20 } })
@Controller('uploads')
export class UploadsPublicController {
  constructor(private readonly uploads: UploadsService) {}

  @Public()
  @Get(':token')
  @Header('Cache-Control', 'no-store')
  session(@Param('token') token: string) {
    return this.uploads.session(token);
  }

  @Public()
  @Post(':token/consent')
  @Header('Cache-Control', 'no-store')
  consent(@Param('token') token: string) {
    return this.uploads.acceptConsent(token);
  }

  @Public()
  @Post(':token/documents')
  @Header('Cache-Control', 'no-store')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', uploadLimits(PATIENT_UPLOAD_MAX_BYTES)),
  )
  @UseFilters(FileTooLargeFilter)
  add(
    @Param('token') token: string,
    @UploadedFile() file: UploadedImage | undefined,
    // Repeat the part and multer hands over an array, not a string; there is
    // no DTO on a multipart route to catch that before it reaches the service.
    @Body('note') note?: unknown,
  ) {
    if (note !== undefined && typeof note !== 'string') {
      throw new BadRequestException('invalid_note');
    }
    return this.uploads.addDocument(token, file, note);
  }

  /** The patient removing a file they sent by mistake. */
  @Public()
  @Delete(':token/documents/:documentId')
  @Header('Cache-Control', 'no-store')
  remove(
    @Param('token') token: string,
    @Param('documentId') documentId: string,
  ) {
    return this.uploads.removeOwnDocument(token, documentId);
  }
}

/**
 * The staff half: issue, send, read and erase.
 *
 * `admin` only, deliberately narrower than the content modules: `editor` is a
 * content role and this route streams patients' analyses. Temporary until the
 * client answers who gets which account — see PLAN.md, "Роли в бэк-офисе".
 */
@ApiTags('uploads')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('upload-links')
export class UploadLinksController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('appointment/:appointmentId')
  forAppointment(@Param('appointmentId') appointmentId: string) {
    return this.uploads.linkForAppointment(appointmentId);
  }

  @Post('order/:orderId')
  forOrder(@Param('orderId') orderId: string) {
    return this.uploads.linkForOrder(orderId);
  }

  @Get('appointment/:appointmentId')
  listForAppointment(@Param('appointmentId') appointmentId: string) {
    return this.uploads.listForAppointment(appointmentId);
  }

  @Get('order/:orderId')
  listForOrder(@Param('orderId') orderId: string) {
    return this.uploads.listForOrder(orderId);
  }

  /** Returns `{ sent: false }` when SMTP is not configured — see the service. */
  @Post(':id/send')
  send(@Param('id') id: string) {
    return this.uploads.sendLink(id);
  }

  @Post(':id/revoke')
  revoke(@Param('id') id: string) {
    return this.uploads.revoke(id);
  }

  /** Authenticated streamed download — medical files are never public URLs. */
  @Get('documents/:documentId')
  async download(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const { path, fileName } = await this.uploads.documentPath(documentId);
    res.download(path, fileName);
  }

  @Delete('documents/:documentId')
  @HttpCode(204)
  deleteDocument(@Param('documentId') documentId: string) {
    return this.uploads.deleteDocument(documentId);
  }
}
