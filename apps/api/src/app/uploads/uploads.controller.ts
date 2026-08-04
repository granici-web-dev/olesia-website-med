import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import type { UploadedImage } from '../storage/storage.service';
import { UploadsService } from './uploads.service';

/**
 * The patient-facing half of §11.14. Unauthenticated by design: there are no
 * patient accounts, and the token in the URL is the whole credential.
 *
 * Rate limited harder than the rest of the public API. Nobody legitimately
 * touches this more than a handful of times in a minute, and the endpoints
 * both write files and confirm whether a token is real.
 */
@ApiTags('uploads')
@Throttle({ default: { ttl: 60_000, limit: 20 } })
@Controller('uploads')
export class UploadsPublicController {
  constructor(private readonly uploads: UploadsService) {}

  @Public()
  @Get(':token')
  session(@Param('token') token: string) {
    return this.uploads.session(token);
  }

  @Public()
  @Post(':token/consent')
  consent(@Param('token') token: string) {
    return this.uploads.acceptConsent(token);
  }

  @Public()
  @Post(':token/documents')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  add(
    @Param('token') token: string,
    @UploadedFile() file: UploadedImage | undefined,
    @Body('note') note?: string,
  ) {
    return this.uploads.addDocument(token, file, note);
  }

  /** The patient removing a file they sent by mistake. */
  @Public()
  @Delete(':token/documents/:documentId')
  remove(
    @Param('token') token: string,
    @Param('documentId') documentId: string,
  ) {
    return this.uploads.removeOwnDocument(token, documentId);
  }
}

/** The staff half: issue, send, read and erase. */
@ApiTags('uploads')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
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
