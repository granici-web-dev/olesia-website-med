import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { WorkingHoursService } from './working-hours.service';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';

/**
 * The practice schedule (§11.5).
 *
 * The GET is public: opening hours are the kind of thing a site should be able
 * to print on its contact page, and there is nothing sensitive in "Mon–Fri
 * 09:00–17:00". Editing is admin/editor.
 */
@ApiTags('working-hours')
@Controller('working-hours')
export class WorkingHoursController {
  constructor(private readonly workingHours: WorkingHoursService) {}

  @Public()
  @Get()
  get() {
    return this.workingHours.get();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch()
  update(@Body() dto: UpdateWorkingHoursDto) {
    return this.workingHours.update(dto);
  }
}
