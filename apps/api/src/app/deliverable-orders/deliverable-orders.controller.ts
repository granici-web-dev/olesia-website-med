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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/jwt.types';
import { Role } from '../../generated/prisma/enums';
import { DeliverableOrdersService } from './deliverable-orders.service';
import { CreateDeliverableOrderDto } from './dto/create-deliverable-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateDeliverableOrderDto } from './dto/update-deliverable-order.dto';

/** Orders for personalized menus and protocols ("Comenzi") — admin/editor. */
@ApiTags('deliverable-orders')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
@Controller('deliverable-orders')
export class DeliverableOrdersController {
  constructor(private readonly orders: DeliverableOrdersService) {}

  /**
   * The working list. Without `?status=` it leaves out `awaiting_payment`, so
   * the "Neachitate" tab asks for that status by name — the same arrangement
   * the EXPRESS tickets have.
   */
  @Get()
  findAll(@Query() query: ListOrdersQueryDto) {
    return this.orders.findAll(query);
  }

  /**
   * An order taken by phone. Admin only: this writes a sale, and the money
   * behind it is recorded by hand afterwards, so it is the same authority the
   * manual-payment panel needs rather than a content edit.
   */
  @Roles(Role.admin)
  @Post()
  create(@Body() dto: CreateDeliverableOrderDto) {
    return this.orders.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeliverableOrderDto) {
    return this.orders.update(id, dto);
  }

  /**
   * Admin only (audit A5, F11). Deleting an order takes its upload link and,
   * underneath that, the medical documents the client sent for it — analyses
   * and investigations, cascaded out of the database and off the disk. That is
   * a great deal more than "tidy away a lead that came to nothing", which is
   * how an editor would read the button, and every other route that reaches a
   * patient's documents is already admin-only.
   */
  @Roles(Role.admin)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() actor: AuthUser) {
    return this.orders.remove(id, actor.id);
  }
}
