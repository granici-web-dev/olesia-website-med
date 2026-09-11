import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../../generated/prisma/enums';
import type { AuthUser } from '../auth/jwt.types';
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
  stats(@Query() query: DashboardQueryDto, @CurrentUser() user: AuthUser) {
    // The counters are for everyone; the named appointments behind them are
    // not. An editor is kept out of `/appointments`, and this endpoint was
    // handing over the next five patients by name anyway (audit A10, F9).
    return this.dashboard.getStats(query, {
      withUpcoming: user.role === Role.admin,
    });
  }
}
