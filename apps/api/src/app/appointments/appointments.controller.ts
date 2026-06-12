import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { type UploadedImage } from '../storage/storage.service';
import { AppointmentsService } from './appointments.service';
import { CalendlySyncService } from './calendly-sync.service';
import { PrepService } from './prep.service';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';

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

  /** Force the 24h prep dispatch now (otherwise runs hourly). */
  @Post('prep/run')
  runPrep() {
    return this.prep.runPrepDispatch();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointments.update(id, dto);
  }

  @Post(':id/plan')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadPlan(
    @Param('id') id: string,
    @UploadedFile() file: UploadedImage | undefined,
  ) {
    return this.appointments.uploadPlan(id, file);
  }
}
