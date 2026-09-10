import {
  Body,
  Controller,
  Get,
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
import {
  DOCUMENT_MAX_BYTES,
  type UploadedImage,
} from '../storage/storage.service';
import { uploadLimits } from '../storage/upload-limits';
import { AppointmentsService } from './appointments.service';
import { CalendlySyncService } from './calendly-sync.service';
import { CalendlyService } from './calendly.service';
import { PrepService } from './prep.service';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';
import { SavePlanDto } from './dto/save-plan.dto';

/**
 * Appointments — video consultations (module_calendly.md §8). Rows are created
 * by the Calendly webhook; the back office reads them and performs the manual
 * actions (confirm payment, upload plan, mark no-show). Staff-only.
 */
@ApiTags('appointments')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointments: AppointmentsService,
    private readonly sync: CalendlySyncService,
    private readonly prep: PrepService,
    private readonly calendly: CalendlyService,
  ) {}

  @Get()
  findAll(@Query() query: ListAppointmentsDto) {
    return this.appointments.findAll(query);
  }

  /** Force a Calendly backup-sync now (otherwise runs every 30 min). */
  @Post('sync')
  runSync() {
    return this.sync.runBackupSync();
  }

  /**
   * The event types on the connected Calendly account, for mapping services to
   * them without retyping a URI.
   *
   * `configured: false` is a normal answer, not an error: until the client
   * hands over her paid account there is no token, and the back office needs
   * to say that plainly rather than show an empty list that looks like
   * "you have no event types".
   */
  @Get('calendly/event-types')
  async eventTypes() {
    const configured = this.calendly.isApiConfigured();
    return {
      configured,
      eventTypes: configured ? await this.calendly.listEventTypes() : [],
    };
  }

  /** Force the 24h prep dispatch now (otherwise runs hourly). */
  @Post('prep/run')
  runPrep() {
    return this.prep.runPrepDispatch();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointments.update(id, dto);
  }

  /** Save the written plan (text required) + an optional private attachment. */
  @Post(':id/plan')
  @ApiConsumes('multipart/form-data')
  // `planText` is the doctor's written plan, up to 20 000 characters by its
  // DTO, so this route needs a field ceiling that fits it in UTF-8.
  @UseInterceptors(
    FileInterceptor('file', uploadLimits(DOCUMENT_MAX_BYTES, 80_000)),
  )
  uploadPlan(
    @Param('id') id: string,
    @Body() dto: SavePlanDto,
    @UploadedFile() file: UploadedImage | undefined,
  ) {
    return this.appointments.uploadPlan(id, dto.planText, file);
  }

  /** Authenticated streamed download of the plan attachment — never public. */
  @Get(':id/plan/file')
  async downloadPlanFile(@Param('id') id: string, @Res() res: Response) {
    const { path, fileName } = await this.appointments.getPlanFile(id);
    res.download(path, fileName);
  }
}
