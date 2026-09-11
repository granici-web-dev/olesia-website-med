import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { HealthReport, HealthService } from './health.service';

/**
 * Served at /health, outside the /api prefix. Read by three things: Docker's
 * healthcheck, Caddy's startup gate through it, and the external uptime check
 * (docs/deployment.md, "Observability").
 *
 * It answers 503 when any check fails. What it deliberately does not say is
 * *why* in any detail: this route is public, and "which dependency is down"
 * is a useful thing for a stranger to learn. Pass or fail per check, and the
 * container logs carry the rest.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  async check(): Promise<HealthReport> {
    const report = await this.health.report();
    if (report.status === 'fail') throw new ServiceUnavailableException(report);
    return report;
  }
}
