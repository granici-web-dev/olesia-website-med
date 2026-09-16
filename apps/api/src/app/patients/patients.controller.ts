import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/jwt.types';
import { PatientEntryType, Role } from '../../generated/prisma/enums';
import {
  DOCUMENT_MAX_BYTES,
  type UploadedImage,
} from '../storage/storage.service';
import { uploadLimits } from '../storage/upload-limits';
import { PatientsService } from './patients.service';
import {
  CreatePatientDto,
  ListPatientsDto,
  UpdatePatientDto,
} from './dto/patient.dto';
import { CreateEntryDto, UpdateEntryDto } from './dto/entry.dto';
import { SendEntryDto } from './dto/send-entry.dto';
import { AddDocumentDto } from './dto/add-document.dto';
import { FromLeadDto } from './dto/from-lead.dto';

/**
 * Patients / medical records (module_patients.md). Staff-only.
 *
 * `admin` rather than the content modules' `admin | editor`: this is the
 * medical record. Temporary until the client answers who gets which account —
 * see PLAN.md, "Роли в бэк-офисе".
 */
@ApiTags('patients')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  findAll(@Query() query: ListPatientsDto) {
    return this.patients.findAll(query);
  }

  @Post()
  create(@Body() dto: CreatePatientDto) {
    return this.patients.create(dto);
  }

  /**
   * Create a dossier from a lead. An address that already has one answers
   * `409 patient_exists` with the candidate, so the operator decides between
   * linking and a second record (module_patients.md; audit A3, F4).
   */
  @Post('from-lead')
  fromLead(@Body() dto: FromLeadDto) {
    return this.patients.fromLead(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patients.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patients.update(id, dto);
  }

  /** GDPR erasure. Answers with what it erased, table by table. */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patients.remove(id);
  }

  /** Attach a lead to this dossier — the operator's answer to a 409 above. */
  @Post(':id/link-lead')
  linkLead(@Param('id') id: string, @Body() dto: FromLeadDto) {
    return this.patients.linkLead(id, dto);
  }

  @Get(':id/timeline')
  timeline(@Param('id') id: string) {
    return this.patients.timeline(id);
  }

  @Post(':id/entries')
  addEntry(
    @Param('id') id: string,
    @Body() dto: CreateEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.patients.addEntry(id, dto, user.id);
  }

  @Patch(':id/entries/:entryId')
  updateEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.patients.updateEntry(id, entryId, dto, user.id);
  }

  /**
   * Email a prescription or a document to the patient. Refusals carry a code
   * in `message`: `entry_not_sendable` and `entry_empty` (422),
   * `mail_not_configured` (503, nothing is faked without SMTP),
   * `attachment_too_large` (422, with `sizeBytes` and `maxBytes`),
   * `mail_send_failed` (502). Only a message that left is recorded.
   */
  @Post(':id/entries/:entryId/send')
  sendEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() dto: SendEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.patients.sendEntry(id, entryId, dto.locale, user.id);
  }

  @Delete(':id/entries/:entryId')
  @HttpCode(204)
  removeEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.patients.removeEntry(id, entryId, user.id);
  }

  /**
   * Upload a private file (PDF/DOC/DOCX) as a `document` entry, or as a
   * `prescription` when `type` says so (docs/shape-prescription-file.md).
   */
  @Post(':id/documents')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', uploadLimits(DOCUMENT_MAX_BYTES)))
  addDocument(
    @Param('id') id: string,
    @UploadedFile() file: UploadedImage | undefined,
    @Body() dto: AddDocumentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.patients.addDocument(
      id,
      file,
      dto.title,
      dto.type ?? PatientEntryType.document,
      user.id,
    );
  }

  /**
   * Authenticated streamed download of the file on a document or a
   * prescription — never a public URL.
   */
  @Get(':id/documents/:entryId')
  async download(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const { path, fileName } = await this.patients.getDocument(
      id,
      entryId,
      user.id,
    );
    res.download(path, fileName);
  }
}
