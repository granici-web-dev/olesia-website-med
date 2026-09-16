import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { DeliverableProduct, Role } from '../../generated/prisma/enums';
import { DeliverablesService } from './deliverables.service';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';

/**
 * The group-C catalog: the five personalized menus and protocols sold from
 * /pricing (`docs/shape-deliverable-catalog.md`).
 *
 * Two shapes, the split `services` and `materials` already use: the public GET
 * serves the site what is on sale, and `/deliverables/all` serves the back
 * office the withdrawn ones too.
 *
 * No POST and no DELETE. The catalog is the `DeliverableProduct` enum and the
 * five rows come from the seed; what is editable is what each product costs
 * and what it is called.
 */
@ApiTags('deliverables')
@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly deliverables: DeliverablesService) {}

  @Public()
  @Get()
  findPublished() {
    return this.deliverables.findPublished();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Get('all')
  findAll() {
    return this.deliverables.findAll();
  }

  /**
   * A code outside the enum is a 404, not the pipe's default 400: the URL
   * names a product, and a product that does not exist is missing rather than
   * malformed. It is the same answer `/deliverables/menu_21` deserves as
   * `/blog/published/no-such-slug`.
   */
  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch(':code')
  update(
    @Param(
      'code',
      new ParseEnumPipe(DeliverableProduct, {
        exceptionFactory: () => new NotFoundException('deliverable_not_found'),
      }),
    )
    code: DeliverableProduct,
    @Body() dto: UpdateDeliverableDto,
  ) {
    return this.deliverables.update(code, dto);
  }
}
