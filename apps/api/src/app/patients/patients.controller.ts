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
import { Role } from '../../generated/prisma/enums';
import { type UploadedImage } from '../storage/storage.service';
import { PatientsService } from './patients.service';
import {
  CreatePatientDto,
  ListPatientsDto,
  UpdatePatientDto,
} from './dto/patient.dto';
import { CreateEntryDto, UpdateEntryDto } from './dto/entry.dto';
import { FromLeadDto } from './dto/from-lead.dto';

/** Patients / medical records (module_patients.md). Staff-only. */
@ApiTags('patients')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
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

  /** Create-or-link a patient from a paid lead. */
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

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.patients.remove(id);
  }

  @Get(':id/timeline')
  timeline(@Param('id') id: string) {
    return this.patients.timeline(id);
  }

  @Post(':id/entries')
  addEntry(@Param('id') id: string, @Body() dto: CreateEntryDto) {
    return this.patients.addEntry(id, dto);
  }

  @Patch(':id/entries/:entryId')
  updateEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateEntryDto,
  ) {
    return this.patients.updateEntry(id, entryId, dto);
  }

  @Delete(':id/entries/:entryId')
  @HttpCode(204)
  removeEntry(@Param('id') id: string, @Param('entryId') entryId: string) {
    return this.patients.removeEntry(id, entryId);
  }

  /** Upload a private medical document (PDF/DOC/DOCX). */
  @Post(':id/documents')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  addDocument(
    @Param('id') id: string,
    @UploadedFile() file: UploadedImage | undefined,
    @Body('title') title?: string,
  ) {
    return this.patients.addDocument(id, file, title);
  }

  /** Authenticated streamed download — never a public URL. */
  @Get(':id/documents/:entryId')
  async download(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Res() res: Response,
  ) {
    const { path, fileName } = await this.patients.getDocument(id, entryId);
    res.download(path, fileName);
  }
}
