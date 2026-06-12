import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

/** Aggregated statistics for the back office (module_calendly.md §11). */
@ApiTags('dashboard')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('stats')
  stats(@Query() query: DashboardQueryDto) {
    return this.dashboard.getStats(query);
  }
}
